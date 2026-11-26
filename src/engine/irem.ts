// Acte 3 : les mécaniques des gardiens d'Irem.
// Référence : docs/actes/ACTE3_IREM.md (§6)
// - Méhkar : des Copies à 75, 50 et 25 % de PV ; on ne sait pas qui est le vrai tant qu'il n'a pas été touché.
//   Domination mentale : ta prochaine Attaque te frappe toi-même (ses autres effets sont perdus).
// - Rois-Jumeaux : immunités (Attaques ou Sorts ; les DoT et les zones passent), échangées tous les 3 tours,
//   et le jumeau tombé se relève 2 tours plus tard si l'autre vit encore.
// - Gharul : Grondement (une carte Sable par tour tant qu'il est enseveli).
// - Triade de la Ruche : Vengeance royale.
// - Limon : Corps visqueux, Figeage (les maléfices, pas les DoT), division à 0 PV s'il n'est pas Figé.
// - Sartaq : Suprématie et Cristal d'obsidienne.
// - Nebet : Chœur des murmures.
import { addStatusToHand, damageEnemy, damagePlayer, fx, livingEnemies, log, makeEnemy } from './actions';
import { CARDS } from './cards';
import { ENEMIES, intentAt } from './enemies';
import { IREM } from './enemies_acte3';
import { gainFolie } from './folie';
import { random } from './rng';
import type { CardInstance, CombatState, EnemyState } from './types';

const MEHKAR = new Set(['mehkar', 'mehkar_copie']);
const TWINS: Record<string, string> = { asheth: 'neshet', neshet: 'asheth' };
const TRIADE = new Set(['kesh', 'vorra', 'tazz']);

// --- Les dégâts ---

/** Corps visqueux du Limon : moitié moins de dégâts, ou double s'il est Figé. */
export function slimeDamage(target: EnemyState, amount: number): number {
  if (target.defId !== 'limon') return amount;
  return (target.fige ?? 0) > 0 ? amount * 2 : Math.floor(amount / 2);
}

/** Rois-Jumeaux : la cible est-elle immunisée à ce coup ? Les effets de zone passent. */
export function immuneTo(target: EnemyState, spell: boolean, aoe: boolean): boolean {
  if (!target.immune || aoe) return false;
  return target.immune === (spell ? 'sorts' : 'attaques');
}

/** Après des dégâts : Méhkar se révèle, et crée ses Copies aux paliers de PV. */
export function afterEnemyDamaged(c: CombatState, target: EnemyState, lost: number): void {
  if (!MEHKAR.has(target.defId)) return;
  if (lost > 0) target.masked = false;
  if (target.defId !== 'mehkar' || target.hp <= 0) return;
  let split = false;
  while ((target.splits ?? 0) < 3 && target.hp <= target.maxHp * (0.75 - 0.25 * (target.splits ?? 0))) {
    target.splits = (target.splits ?? 0) + 1;
    split = true;
    for (let i = 0; i < IREM.mehkarCopies; i++) {
      const copy = makeEnemy(c, 'mehkar_copie');
      copy.step = target.step;
      copy.intent = intentAt(ENEMIES.mehkar_copie, copy.step);
      c.enemies.splice(c.enemies.indexOf(target) + 1, 0, copy);
    }
  }
  if (!split) return;
  // Le vrai Méhkar et ses Copies se mélangent : plus personne n'est reconnaissable.
  const group = c.enemies.filter((e) => MEHKAR.has(e.defId) && !e.dead);
  const slots = group.map((e) => c.enemies.indexOf(e));
  const shuffled = [...group];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random(c) * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  slots.forEach((slot, i) => {
    c.enemies[slot] = shuffled[i];
    shuffled[i].masked = true;
  });
  fx(c, { kind: 'banner', text: 'Méhkar se divise en reflets de lui-même !' });
  log(c, 'Méhkar se divise : 2 Copies apparaissent. Lequel est le vrai ?');
}

// --- Les morts ---

/** Ce qui se passe quand un ennemi d'Irem meurt (avant le contrôle de victoire). */
export function onIremDeath(c: CombatState, target: EnemyState): void {
  // Une Copie disparaît ; quand le vrai Méhkar tombe, ses reflets s'évanouissent.
  if (target.defId === 'mehkar_copie') target.gone = true;
  if (target.defId === 'mehkar') {
    for (const e of c.enemies.filter((x) => x.defId === 'mehkar_copie' && !x.dead)) {
      e.dead = true;
      e.gone = true;
      fx(c, { kind: 'death', who: e.uid });
    }
    log(c, 'Les reflets de Méhkar s\'évanouissent.');
  }
  // Lien des jumeaux : le survivant relèvera son frère dans 2 tours.
  const twin = TWINS[target.defId];
  if (twin && c.enemies.some((e) => e.defId === twin && !e.dead)) {
    target.twinRevive = IREM.twinsReviveDelay;
    fx(c, { kind: 'banner', text: `${target.name} tombe… son jumeau va le relever dans ${IREM.twinsReviveDelay} tours !` });
    log(c, `Lien des jumeaux : tue l'autre Roi avant ${IREM.twinsReviveDelay} tours, ou ${target.name} se relèvera.`);
  }
  // Vengeance royale : les autres enfants de la ruche se soignent et deviennent plus dangereux.
  if (TRIADE.has(target.defId)) {
    for (const o of livingEnemies(c).filter((e) => TRIADE.has(e.defId))) {
      const healed = o.noHeal ? 0 : Math.min(IREM.vengeanceHeal, o.maxHp - o.hp);
      o.hp += healed;
      o.vengeance = true;
      if (healed > 0) fx(c, { kind: 'heal', from: o.uid, to: o.uid, amount: healed });
      fx(c, { kind: 'buff', who: o.uid, label: 'Vengeance royale !' });
    }
    if (livingEnemies(c).some((e) => TRIADE.has(e.defId))) log(c, `Vengeance royale : la mort de ${target.name} rend les autres enfants de la ruche furieux.`);
  }
  // Le Limon se divise, sauf s'il est Figé.
  if (target.defId === 'limon' && !((target.fige ?? 0) > 0)) {
    const at = c.enemies.indexOf(target);
    for (let i = 0; i < IREM.limonSplit; i++) c.enemies.splice(at + 1, 0, makeEnemy(c, 'limon_mineur'));
    fx(c, { kind: 'banner', text: 'Le Limon se divise en 3 !' });
    log(c, 'Le Limon n\'était pas Figé : il se divise en 3 Limons mineurs.');
  }
}

// --- Les maléfices : Figeage, Fiole de limon, Bague primordiale ---

/** Les maléfices (pas les DoT) que porte un ennemi : une hausse = une application. */
function debuffState(e: EnemyState): Record<string, number> {
  const b = e.buffs;
  return {
    ralenti: b.ralenti, demoralise: b.demoralise, armureFracassee: b.armureFracassee,
    gel: b.gel ?? 0, gele: e.gele ? 1 : 0, peur: b.peur ?? 0,
    stun: e.stun ?? 0, sap: e.sap ?? 0, mouton: e.mouton ?? 0, disarmed: e.disarmed ? 1 : 0,
    curses: e.curses?.length ?? 0, fatigue: e.fatigueTurns ?? 0, elements: e.elementsTurns ?? 0, tongues: e.tongues ?? 0,
  };
}

const DURATIONS = ['ralenti', 'demoralise', 'armureFracassee', 'peur'] as const;

/**
 * À appeler après chaque action : repère les maléfices appliqués aux ennemis depuis le dernier contrôle.
 * Chaque maléfice appliqué : 1 cumul de Figeage (Limon), 2 dégâts (Fiole de limon), 1 tour de plus (Bague primordiale).
 */
export function checkDebuffs(c: CombatState): void {
  const g = c.gear ?? {};
  for (const e of c.enemies) {
    if (e.dead) {
      e.debuffSnap = undefined;
      continue;
    }
    const now = debuffState(e);
    const before = e.debuffSnap;
    e.debuffSnap = now;
    if (!before) continue;
    const up = Object.keys(now).filter((k) => now[k] > (before[k] ?? 0));
    if (up.length === 0) continue;
    if (g.debuffLonger) {
      for (const k of DURATIONS) if (up.includes(k)) e.buffs[k] = (e.buffs[k] ?? 0) + g.debuffLonger;
    }
    if (e.defId === 'limon' && !((e.fige ?? 0) > 0)) {
      e.figeage = (e.figeage ?? 0) + up.length;
      if (e.figeage >= IREM.limonStacks) {
        e.figeage = 0;
        e.fige = IREM.limonFrozenTurns;
        fx(c, { kind: 'banner', text: 'Le Limon est Figé !' });
        log(c, `Le Limon est Figé : il n'agit plus pendant ${IREM.limonFrozenTurns} tours et subit double dégâts.`);
      }
    }
    if (g.debuffDamage && c.phase === 'player') {
      const dmg = g.debuffDamage * up.length;
      fx(c, { kind: 'tick', who: e.uid, amount: dmg, label: 'Fiole de limon' });
      damageEnemy(c, e, dmg);
    }
    if (!e.dead) e.debuffSnap = debuffState(e);
  }
}

// --- Domination mentale ---

/**
 * Ta prochaine Attaque te vise toi-même : on la joue sur une copie du combat pour mesurer ses dégâts,
 * puis le combat revient comme avant (ses autres effets sont perdus) et tu subis le coup (ton blocage compte).
 * Une Attaque de zone te frappe une fois, avec ce qu'elle aurait infligé à un seul ennemi.
 */
export function dominatedAttack(c: CombatState, card: CardInstance, play: () => void, exhaust: boolean): void {
  const saved = JSON.parse(JSON.stringify({ ...c, fx: [], log: [] })) as CombatState;
  const before = new Map(c.enemies.map((e) => [e.uid, e.hp + e.block]));
  play();
  let dmg = 0;
  for (const e of c.enemies) {
    const was = before.get(e.uid);
    if (was === undefined) continue;
    dmg = Math.max(dmg, was - Math.max(0, e.hp) - e.block);
  }
  const keepFx = c.fx ?? [];
  const keepLog = c.log;
  // On remet le combat comme avant, en gardant les mêmes objets (ennemis, joueur) pour ceux qui les tiennent.
  const byUid = new Map(c.enemies.map((e) => [e.uid, e]));
  const enemies = saved.enemies.map((old) => {
    const live = byUid.get(old.uid);
    if (!live) return old;
    for (const k of Object.keys(live)) delete (live as unknown as Record<string, unknown>)[k];
    return Object.assign(live, old);
  });
  const player = c.player;
  for (const k of Object.keys(player)) delete (player as unknown as Record<string, unknown>)[k];
  Object.assign(player, saved.player);
  for (const k of Object.keys(c)) if (!(k in saved)) delete (c as unknown as Record<string, unknown>)[k];
  Object.assign(c, saved, { enemies, player });
  c.fx = keepFx.filter((f) => f.kind === 'banner');
  c.log = keepLog;
  (exhaust ? c.exhaust : c.discard).push(card);
  fx(c, { kind: 'banner', text: 'Domination mentale : tu te frappes toi-même !' });
  log(c, `Domination mentale : ${CARDS[card.id].name} te frappe toi-même (${dmg} dégâts).`);
  if (dmg > 0) {
    fx(c, { kind: 'tick', who: 'player', amount: dmg, label: 'Domination' });
    damagePlayer(c, dmg, false);
  }
}

// --- Les tours ---

/** Au début du tour du joueur (après la pioche) : Grondement, Cristal d'obsidienne, Bague du sable mouvant. */
export function iremPlayerTurn(c: CombatState): void {
  c.mixDrawUsed = false;
  c.dreamEnergyUsed = false;
  for (const e of livingEnemies(c)) {
    if (e.defId === 'gharul' && (e.buried ?? 0) > 0) {
      addStatusToHand(c, 'sable', 1);
      log(c, 'Le sol gronde : du sable envahit ta main.');
    }
    if (e.defId === 'sartaq' && c.turn % IREM.sartaqCrystalEvery === 0) {
      addStatusToHand(c, 'cristal_obsidienne', 1);
      log(c, 'Un Cristal d\'obsidienne se détache de Sartaq.');
    }
  }
  // Bague du sable mouvant : les cartes Sable, Cendres et Hallucination sont retirées de ta main.
  if (c.gear?.statusPurge) {
    const junk = c.hand.filter((card) => ['sable', 'cendres', 'hallucination'].includes(card.id));
    if (junk.length > 0) {
      c.hand = c.hand.filter((card) => !junk.includes(card));
      c.exhaust.push(...junk);
      log(c, `La Bague du sable mouvant retire ${junk.length} carte${junk.length > 1 ? 's' : ''} de ta main.`);
      if (junk.some((card) => card.id === 'hallucination')) dreamEnergy(c);
    }
  }
}

/** Larme du rêveur : une Hallucination quitte ta main, +1 énergie (1 fois par tour). */
export function dreamEnergy(c: CombatState): void {
  if (!c.gear?.hallucinationEnergy || c.dreamEnergyUsed) return;
  c.dreamEnergyUsed = true;
  c.player.energy += c.gear.hallucinationEnergy;
  fx(c, { kind: 'buff', who: 'player', label: 'Larme du rêveur : +1 énergie' });
}

/**
 * Au début du tour d'un ennemi (après la remise à zéro de son blocage) : Suprématie, Chœur des murmures,
 * Dent de Gharul. Renvoie true si l'ennemi ne fait rien ce tour-ci (Limon Figé).
 */
export function iremEnemyStart(c: CombatState, e: EnemyState): boolean {
  e.surfaced = false;
  if (e.defId === 'sartaq') {
    if ((e.suspended ?? 0) > 0) {
      e.suspended! -= 1;
      log(c, 'La Suprématie de Sartaq ne revient pas encore.');
    } else {
      e.block += IREM.sartaqBlock;
      fx(c, { kind: 'block', who: e.uid, amount: IREM.sartaqBlock });
    }
  }
  if (e.defId === 'nebet') gainFolie(c, e.hp < e.maxHp / 2 ? IREM.nebetFolieLow : IREM.nebetFolie);
  if (e.defId === 'limon' && (e.fige ?? 0) > 0) {
    e.fige! -= 1;
    log(c, 'Le Limon est Figé : il ne fait rien.');
    return true;
  }
  return false;
}

/** À la fin du tour des ennemis : le jumeau tombé se relève, puis l'échange des immunités. */
export function iremEnemyEnd(c: CombatState): void {
  for (const e of c.enemies) {
    if (!e.dead || !e.twinRevive) continue;
    e.twinRevive -= 1;
    if (e.twinRevive > 0) continue;
    if (!c.enemies.some((o) => o.defId === TWINS[e.defId] && !o.dead)) continue;
    e.dead = false;
    e.gone = false;
    e.hp = Math.max(1, Math.round(e.maxHp * IREM.twinsReviveRatio));
    e.block = 0;
    e.step = 0;
    e.intent = intentAt(ENEMIES[e.defId], 0);
    e.buffs = { puissance: 0, demoralise: 0, ralenti: 0, armureFracassee: 0, saignement: 0, saignementTours: 0 };
    e.dots = [];
    e.debuffSnap = undefined;
    fx(c, { kind: 'banner', text: `${e.name} est ressuscité par son jumeau !` });
    log(c, `Lien des jumeaux : ${e.name} se relève (${e.hp} PV).`);
  }
  if (c.turn % IREM.twinsSwapEvery === 0) {
    const kings = c.enemies.filter((e) => e.immune);
    for (const e of kings) e.immune = e.immune === 'sorts' ? 'attaques' : 'sorts';
    if (kings.some((e) => !e.dead)) {
      fx(c, { kind: 'banner', text: 'Les Rois-Jumeaux échangent leurs immunités !' });
      log(c, 'Échange : les Rois-Jumeaux échangent leurs immunités.');
    }
  }
}

/** Les tours restants avant le prochain échange des Rois-Jumeaux (0 : à la fin de ce tour). */
export function turnsBeforeSwap(c: CombatState): number {
  return (IREM.twinsSwapEvery - (c.turn % IREM.twinsSwapEvery)) % IREM.twinsSwapEvery;
}
