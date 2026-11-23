// Le journal d'une expédition, envoyé en ligne à la fin (victoire, défaite ou abandon) pour la page admin.
// Rien de tout ça n'est montré aux autres joueurs. Testé dans tests/journal.test.ts.
import { MAX_WIPES } from './engine/run';
import type { RunSummary } from './engine/progression';
import type { RunState } from './engine/types';

export interface RunJournal {
  uid: string;
  pseudo: string;
  classe: string;
  talents: string[];
  difficulte: number;
  victoire: boolean;
  /** Le chapitre atteint (1 à 3) et le nombre d'étapes franchies en tout. */
  chapitre: number;
  etapes: number;
  /** Le combat où l'expédition s'est arrêtée (null pour une victoire, « Abandon » si le joueur en a lancé une autre). */
  cause: string | null;
  /** Les ennemis de ce combat (ids), pour regrouper les chutes par ennemi. */
  causeEnnemis: string[];
  chutes: number;
  combats: number;
  gardiens: number;
  score: number;
  /** Le paquet final : id des cartes, « + » si améliorée. */
  paquet: string[];
  /** L'équipement porté à la fin (ids d'objets). */
  equipement: string[];
  /** Durée en minutes (null si inconnue : run commencée avant les comptes). */
  dureeMin: number | null;
  /** Le code de la version du jeu (commit), pour comparer avant et après un changement. */
  version: string;
  finMs: number;
}

export function runJournal(run: RunState, summary: RunSummary | undefined, who: { uid: string; pseudo: string }, version: string, startMs: number | null, now = Date.now(), abandon = false): RunJournal {
  const victory = !abandon && run.screen === 'victory';
  return {
    uid: who.uid,
    pseudo: who.pseudo,
    classe: run.classId,
    talents: [...(run.talents ?? [])],
    difficulte: run.difficulty ?? 0,
    victoire: victory,
    chapitre: run.act ?? 1,
    etapes: (run.floorsDone ?? 0) + run.path.length,
    cause: abandon ? 'Abandon' : victory ? null : run.encounter?.name ?? null,
    causeEnnemis: victory || abandon ? [] : [...new Set(run.encounter?.enemies ?? [])],
    chutes: (run.maxWipes ?? MAX_WIPES) - run.wipesLeft,
    combats: run.stats.combats,
    gardiens: run.stats.elites,
    score: summary?.score ?? 0,
    paquet: run.deck.map((c) => c.id + (c.upgraded ? '+' : '')),
    equipement: Object.values(run.equipment).filter((x): x is string => !!x),
    dureeMin: startMs ? Math.max(0, Math.round((now - startMs) / 60000)) : null,
    version,
    finMs: now,
  };
}
