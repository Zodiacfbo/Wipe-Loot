// Les calculs de la page admin, faits dans le navigateur à partir des journaux de runs et des fiches joueurs.
// Sans Firebase ni DOM : testés dans tests/admin_stats.test.ts.
import type { RunJournal } from '../journal';
import { treesFor } from '../engine/talents';
import { rewardPool } from '../engine/cards';
import { todayIso } from '../cloud_logic';

export const DAY_MS = 24 * 60 * 60 * 1000;

// ---------- Estimation de la consommation Firebase ----------
// On ne lit pas les vrais compteurs (impossible depuis une page web) : on estime à partir de l'activité.
// À corriger en comparant un jour avec la console Firebase (onglet Utilisation).
/** Ouvertures du jeu par joueur et par jour. */
export const OUVERTURES_PAR_JOUEUR = 2;
/** Lectures à chaque ouverture : config (saison, news), compte bloqué ?, fiche joueur, ses messages. */
export const LECTURES_OUVERTURE = 5;
/** La config relue toutes les 10 minutes de jeu. */
export const LECTURES_PAR_HEURE = 6;
/** Temps de jeu moyen par joueur et par jour (heures). */
export const HEURES_PAR_JOUEUR = 1;
/** Écritures pendant une run : une par étape jouée (environ), plus le profil et le journal à la fin. */
export const ECRITURES_PAR_RUN = 20 + 2;
/** Écritures par joueur et par jour en dehors des runs (connexion, talents…). */
export const ECRITURES_PAR_JOUEUR = 2;
export const LIMITE_LECTURES = 50000;
export const LIMITE_ECRITURES = 20000;

export function estimateUsage(players: number, runs: number, adminReads: number): { reads: number; writes: number } {
  return {
    reads: Math.round(players * (OUVERTURES_PAR_JOUEUR * LECTURES_OUVERTURE + HEURES_PAR_JOUEUR * LECTURES_PAR_HEURE) + adminReads),
    writes: Math.round(runs * ECRITURES_PAR_RUN + players * ECRITURES_PAR_JOUEUR),
  };
}

/** Vert sous 50 %, orange de 50 à 80 %, rouge au-delà (avec un symbole, pas seulement la couleur). */
export function usageLevel(value: number, limit: number): { pct: number; level: 'ok' | 'attention' | 'danger'; sign: string } {
  const pct = Math.round((100 * value) / limit);
  if (pct >= 80) return { pct, level: 'danger', sign: '⛔' };
  if (pct >= 50) return { pct, level: 'attention', sign: '⚠' };
  return { pct, level: 'ok', sign: '✓' };
}

// ---------- Activité ----------

export interface PlayerRow {
  uid: string;
  pseudo: string;
  majMs: number;
}

const dayOf = (ms: number) => todayIso(new Date(ms));

/** Joueurs actifs un jour donné : une run finie ce jour-là, ou leur sauvegarde mise à jour. */
export function activeOn(day: string, players: PlayerRow[], runs: RunJournal[]): Set<string> {
  const set = new Set<string>();
  for (const p of players) if (dayOf(p.majMs) === day) set.add(p.uid);
  for (const r of runs) if (dayOf(r.finMs) === day) set.add(r.uid);
  return set;
}

/** Les N derniers jours (du plus ancien au plus récent), avec le nombre de joueurs actifs et de runs. */
export function dailyActivity(players: PlayerRow[], runs: RunJournal[], days: number, now = Date.now()): { day: string; players: number; runs: number }[] {
  const out: { day: string; players: number; runs: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const day = dayOf(now - i * DAY_MS);
    out.push({ day, players: activeOn(day, players, runs).size, runs: runs.filter((r) => dayOf(r.finMs) === day).length });
  }
  return out;
}

/** Joueurs qui décrochent : pas revenus depuis 3 jours ou plus. */
export function droppingOut(players: PlayerRow[], now = Date.now(), days = 3): PlayerRow[] {
  return players.filter((p) => now - p.majMs >= days * DAY_MS).sort((a, b) => b.majMs - a.majMs);
}

// ---------- Équilibrage ----------

export interface Rate {
  key: string;
  runs: number;
  wins: number;
  pct: number;
}

function rates(runs: RunJournal[], keyOf: (r: RunJournal) => string | null): Rate[] {
  const map = new Map<string, { runs: number; wins: number }>();
  for (const r of runs) {
    const k = keyOf(r);
    if (k === null) continue;
    const e = map.get(k) ?? { runs: 0, wins: 0 };
    e.runs++;
    if (r.victoire) e.wins++;
    map.set(k, e);
  }
  return [...map.entries()].map(([key, e]) => ({ key, runs: e.runs, wins: e.wins, pct: Math.round((100 * e.wins) / e.runs) })).sort((a, b) => b.runs - a.runs);
}

export const winsByClass = (runs: RunJournal[]) => rates(runs, (r) => r.classe);
export const winsByDifficulty = (runs: RunJournal[]) => rates(runs, (r) => String(r.difficulte)).sort((a, b) => Number(a.key) - Number(b.key));
export const winsByVersion = (runs: RunJournal[]) => rates(runs, (r) => r.version);

/** L'arbre où la run a le plus de talents (« Feu », « Givre »…), ou « aucun » au niveau 1. */
export function mainTree(r: RunJournal): string {
  let best = 'aucun talent';
  let n = 0;
  for (const tree of treesFor(r.classe)) {
    const ids = new Set(tree.tiers.flat().map((t) => t.id));
    const c = r.talents.filter((id) => ids.has(id)).length;
    if (c > n) { n = c; best = tree.name; }
  }
  return best;
}
export const winsByTree = (runs: RunJournal[]) => rates(runs, (r) => `${r.classe} · ${mainTree(r)}`);

/** Où les expéditions s'arrêtent : nombre de défaites par combat, du plus meurtrier au moins. */
export function stopsByEncounter(runs: RunJournal[]): { cause: string; count: number; chapitre: number }[] {
  const map = new Map<string, { count: number; chapitre: number }>();
  for (const r of runs) {
    if (r.victoire || !r.cause) continue;
    const e = map.get(r.cause) ?? { count: 0, chapitre: r.chapitre };
    e.count++;
    map.set(r.cause, e);
  }
  return [...map.entries()].map(([cause, e]) => ({ cause, ...e })).sort((a, b) => b.count - a.count);
}

/**
 * Les cartes les moins prises, par classe : la part des runs dont le paquet final contient la carte
 * (cartes de récompense seulement, pas celles du paquet de départ). En rouge sous 15 %.
 */
export function cardPickRates(runs: RunJournal[], classId: string): { id: string; pct: number }[] {
  const mine = runs.filter((r) => r.classe === classId);
  if (mine.length === 0) return [];
  return rewardPool(classId).map((id) => {
    const n = mine.filter((r) => r.paquet.some((c) => c.replace(/\+$/, '') === id)).length;
    return { id, pct: Math.round((100 * n) / mine.length) };
  }).sort((a, b) => a.pct - b.pct);
}

// ---------- Le journal des choix ----------

/**
 * Les cartes proposées en récompense et la part prise quand elles sont proposées (journal des choix).
 * Les moins prises d'abord ; seulement les cartes proposées au moins `min` fois.
 */
export function cardOfferRates(runs: RunJournal[], classId: string, min = 3): { id: string; offered: number; taken: number; pct: number }[] {
  const stats = new Map<string, { offered: number; taken: number }>();
  for (const r of runs) {
    if (r.classe !== classId) continue;
    for (const c of r.choix ?? []) {
      if (c.t !== 'cartes') continue;
      for (const id of c.o) {
        const s = stats.get(id) ?? { offered: 0, taken: 0 };
        s.offered += 1;
        if (c.p === id) s.taken += 1;
        stats.set(id, s);
      }
    }
  }
  return [...stats.entries()].filter(([, s]) => s.offered >= min)
    .map(([id, s]) => ({ id, ...s, pct: Math.round((100 * s.taken) / s.offered) }))
    .sort((a, b) => a.pct - b.pct || b.offered - a.offered);
}

/** Les combats qui coûtent le plus de PV en moyenne (journal des choix), avec leur part de chutes. */
export function costlyFights(runs: RunJournal[], min = 3): { name: string; count: number; pv: number; falls: number }[] {
  const stats = new Map<string, { count: number; pv: number; falls: number }>();
  for (const r of runs) {
    for (const c of r.choix ?? []) {
      if (c.t !== 'combat') continue;
      const s = stats.get(c.n) ?? { count: 0, pv: 0, falls: 0 };
      s.count += 1;
      s.pv += c.pv;
      if (c.fin === 'chute') s.falls += 1;
      stats.set(c.n, s);
    }
  }
  return [...stats.entries()].filter(([, s]) => s.count >= min)
    .map(([name, s]) => ({ name, count: s.count, pv: Math.round(s.pv / s.count), falls: Math.round((100 * s.falls) / s.count) }))
    .sort((a, b) => b.pv - a.pv);
}

// ---------- Scores suspects ----------

/** Règles simples : victoire en moins de 10 minutes, ou score plus de 2 fois la médiane du joueur. */
export function suspicious(runs: RunJournal[]): { run: RunJournal; why: string }[] {
  const out: { run: RunJournal; why: string }[] = [];
  const byPlayer = new Map<string, number[]>();
  for (const r of runs) byPlayer.set(r.uid, [...(byPlayer.get(r.uid) ?? []), r.score]);
  for (const r of runs) {
    if (r.victoire && r.dureeMin !== null && r.dureeMin < 10) { out.push({ run: r, why: `victoire en ${r.dureeMin} min` }); continue; }
    const scores = [...(byPlayer.get(r.uid) ?? [])].sort((a, b) => a - b);
    const median = scores[Math.floor(scores.length / 2)] ?? 0;
    if (scores.length >= 3 && median > 0 && r.score > 2 * median) out.push({ run: r, why: `score ${r.score}, plus de 2 fois sa médiane (${median})` });
  }
  return out;
}
