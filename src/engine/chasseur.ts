// Les mécaniques du Chasseur : le compagnon animal, les Esprits animaux, les Pièges et la Marque de la proie.
// Référence : docs/classes/CHASSEUR.md (§2 et §3)
import { addStatusToHand, applySaignement, damageEnemy, drawCards, fx, gainBlock, isBossEnemy, livingEnemies, log, power } from './actions';
import { applyDot } from './demoniste';
import { stun } from './voleur';
import type { AspectId, CombatState, CompanionId, EnemyState, Trap, TrapId } from './types';

export const COMPANIONS: Record<CompanionId, { name: string; role: string; text: string; dmg: number; block: number; bleed: number }> = {
  loup: { name: 'Loup', role: 'Dégâts', text: 'Fin de ton tour : 5 dégâts à ta cible.', dmg: 5, block: 0, bleed: 0 },
  ours: { name: 'Ours', role: 'Défense', text: 'Fin de ton tour : 3 dégâts à ta cible, 3 blocage pour toi.', dmg: 3, block: 3, bleed: 0 },
  raptor: { name: 'Raptor', role: 'Dans la durée', text: 'Fin de ton tour : 3 dégâts et Saignement 2 à ta cible.', dmg: 3, block: 0, bleed: 2 },
};
export const COMPANION_IDS = Object.keys(COMPANIONS) as CompanionId[];

export const ASPECTS: Record<AspectId, { name: string; short: string; text: string }> = {
  aigle: { name: 'Esprit de l\'aigle', short: 'Aigle', text: 'Tes Attaques infligent +2 dégâts.' },
  tortue: { name: 'Esprit de la tortue', short: 'Tortue', text: 'Tes cartes de blocage donnent +3 blocage.' },
  guepard: { name: 'Esprit du guépard', short: 'Guépard', text: 'Pioche 1 carte de plus par tour. Tu subis 10 % de dégâts en plus.' },
};

export const TRAPS: Record<TrapId, { name: string; short: string }> = {
  givrant: { name: 'Piège givrant', short: 'Givrant' },
  immolation: { name: 'Piège immolation', short: 'Immolation' },
  venin: { name: 'Piège à venin', short: 'Venin' },
  explosif: { name: 'Piège explosif', short: 'Explosif' },
};

/** Un combat de Chasseur (le compagnon est toujours là). */
export function isHunter(c: CombatState): boolean {
  return c.companion !== undefined;
}

// --- Le compagnon ---

/** La cible du compagnon : la dernière cible visée si elle vit encore, sinon le premier ennemi. */
export function companionTarget(c: CombatState): EnemyState | null {
  const pool = livingEnemies(c).filter((e) => !e.submerged && !(e.buried ?? 0));
  if (pool.length === 0) return null;
  return pool.find((e) => e.uid === c.lastTarget) ?? pool[0];
}

/** Le bonus de la Marque de la proie contre cette cible (0 si elle n'est pas marquée). */
export function markBonus(c: CombatState, t: EnemyState): number {
  if (!c.mark || c.mark.uid !== t.uid) return 0;
  return c.mark.value + (power(c, 'maitre_tireur') ? 2 : 0) + (c.gear?.markBonus ?? 0);
}

/** Les dégâts d'une attaque du compagnon (sans la Marque). */
export function companionDamage(c: CombatState, base?: number): number {
  const def = COMPANIONS[c.companion ?? 'loup'];
  return (base ?? def.dmg) + (c.compTurnBonus ?? 0) + (c.compNextBonus ?? 0) + (c.frenzyStacks ?? 0)
    + (c.gear?.compBonus ?? 0) + (c.gear?.allyBonus ?? 0) + (c.gear?.petBonus ?? 0);
}

/** Le compagnon frappe sa cible (`base` : des dégâts fixés par un Ordre, comme Égorge). */
function companionStrike(c: CombatState, t: EnemyState, base?: number): void {
  const def = COMPANIONS[c.companion!];
  const dmg = companionDamage(c, base) + markBonus(c, t);
  c.compNextBonus = 0;
  fx(c, { kind: 'tick', who: t.uid, amount: dmg, label: def.name });
  c.petActing = true;
  try {
    damageEnemy(c, t, dmg);
  } finally {
    c.petActing = false;
  }
  if (base === undefined) {
    if (def.bleed && !t.dead) applySaignement(t, def.bleed, c);
    if (def.block) gainBlock(c, def.block + (c.gear?.petBonus ?? 0), false);
  }
  if (c.gear?.compBleed && !t.dead) applySaignement(t, c.gear.compBleed, c); // Férocité
  if (power(c, 'lien_sauvage')) gainBlock(c, power(c, 'lien_sauvage'), false);
  if (c.gear?.petBlock) gainBlock(c, c.gear.petBlock, false);
  if (power(c, 'frenesie_chasseur')) c.frenzyStacks = (c.frenzyStacks ?? 0) + power(c, 'frenesie_chasseur');
  // Instinct de tueur : le compagnon achève sa cible.
  if (t.dead && power(c, 'instinct_tueur') && !c.enemyActing) {
    c.player.energy += power(c, 'instinct_tueur');
    drawCards(c, power(c, 'instinct_tueur'));
  }
}

/**
 * Le compagnon agit `times` fois (à la fin de ton tour, ou sur ordre). `base` : les dégâts d'un Ordre (Égorge).
 * Renvoie false s'il n'a rien pu faire (enfui, pas de cible). L'étourdissement ne bloque que l'action de fin de tour.
 */
export function companionAct(c: CombatState, times = 1, base?: number): boolean {
  if (!isHunter(c) || c.phase !== 'player') return false;
  // Malédiction de lignée : le compagnon s'est enfui.
  if ((c.player.debuffs?.lignee ?? 0) > 0) {
    log(c, `Ton ${COMPANIONS[c.companion!].name} s'est enfui : il ne fait rien.`);
    return false;
  }
  let acted = false;
  for (let i = 0; i < times && c.phase === 'player'; i++) {
    const t = companionTarget(c);
    if (!t) break;
    companionStrike(c, t, base);
    acted = true;
  }
  return acted;
}

/** Le compagnon te protège (Ordre : Protège-moi). */
export function companionGuard(c: CombatState, n: number): void {
  gainBlock(c, n + (c.gear?.petBonus ?? 0), false);
  if (power(c, 'lien_sauvage')) gainBlock(c, power(c, 'lien_sauvage'), false);
}

/** À la fin de ton tour : le compagnon (deux fois avec Fureur primitive), puis le Loup spectral. */
export function hunterEndTurn(c: CombatState): void {
  if (!isHunter(c)) return;
  const times = 1 + (power(c, 'fureur_primitive') ? 1 : 0);
  // Rayon oculaire d'Yzhar : étourdi, le compagnon saute son action de fin de tour (les Ordres marchent encore).
  if ((c.petStunned ?? 0) > 0) {
    c.petStunned! -= 1;
    log(c, `Ton ${COMPANIONS[c.companion!].name} est étourdi : il ne fait rien à la fin du tour.`);
  } else companionAct(c, times);
  if (c.spectral && c.phase === 'player') {
    const t = companionTarget(c);
    if (t) {
      fx(c, { kind: 'tick', who: t.uid, amount: c.spectral, label: 'Loup spectral' });
      damageEnemy(c, t, c.spectral);
    }
  }
  c.compTurnBonus = 0;
  c.frenzyStacks = 0; // Frénésie : le bonus repart de zéro à chaque tour.
  c.huntTurnBonus = 0;
  c.focusNext = 0;
  c.breathNow = 0;
  c.counterStun = false;
  // Riposte sauvage : on regarde les attaques bloquées pendant le tour ennemi qui vient.
  c.hunterBlocked = false;
}

/** Au début de ton tour : l'Esprit du guépard fait piocher (renvoyé), Instinct du chasseur rend de l'énergie. */
export function hunterStartTurn(c: CombatState): number {
  if (!isHunter(c)) return 0;
  c.feign = false;
  c.rapidFire = false;
  c.calmUsed = false;
  c.breathNow = c.breathNext ?? 0;
  c.breathNext = 0;
  // Instinct du chasseur : un Piège déclenché donne 1 énergie et 1 carte au tour suivant.
  let draw = 0;
  if (c.trapEnergyNext) {
    c.player.energy += c.trapEnergyNext;
    c.trapEnergyNext = 0;
    draw = 1;
  }
  return (c.aspect === 'guepard' ? 1 : 0) + draw;
}

// --- Corde-des-anciens : la Flèche des anciens (Bander l'arc) ---

/** Dégâts de base de la Flèche des anciens, +5 par tour gardée en main, 15 au plus. */
export const FLECHE = { base: 5, parTour: 5, max: 15 };

/** Les dégâts de la Flèche des anciens ce tour-ci. */
export function flecheDamage(c: CombatState): number {
  return Math.min(FLECHE.max, FLECHE.base + FLECHE.parTour * (c.flecheCharge ?? 0));
}

/** Début de ton tour, avec Corde-des-anciens : une Flèche en main, ou celle qu'on garde se tend un peu plus. */
export function flecheStartTurn(c: CombatState): void {
  if (!c.gear?.cordeAnciens) return;
  if (c.hand.some((k) => k.id === 'fleche_anciens')) {
    if (flecheDamage(c) < FLECHE.max) {
      c.flecheCharge = (c.flecheCharge ?? 0) + 1;
      fx(c, { kind: 'buff', who: 'player', label: `Arc bandé : ${flecheDamage(c)}` });
    }
    return;
  }
  c.flecheCharge = 0;
  addStatusToHand(c, 'fleche_anciens', 1);
}

/** Au début du combat : Esprit animal (le compagnon agit), Piégeur né (un Piège explosif sur le premier ennemi). */
export function hunterStartCombat(c: CombatState): void {
  if (!isHunter(c)) return;
  if (c.gear?.startTrap) placeTrap(c, trappable(c)[0] ?? null, 'explosif', 8);
  if (c.gear?.compOpening) companionAct(c, c.gear.compOpening);
}

// --- Les Esprits ---

export function setAspect(c: CombatState, id: AspectId): void {
  c.aspect = id;
  fx(c, { kind: 'buff', who: 'player', label: ASPECTS[id].name });
}

// --- La Marque de la proie ---

export function markTarget(c: CombatState, t: EnemyState | null, value: number): void {
  if (!t || t.dead) return;
  c.mark = { uid: t.uid, value };
  fx(c, { kind: 'buff', who: t.uid, label: 'Marqué' });
  log(c, `${t.name} est marqué.`);
}

/** Les bonus du Chasseur sur une Attaque : Esprit de l'aigle, Marque, Bête intérieure, Concentration, Respiration lente, Visée assurée. */
export function hunterAttackBonus(c: CombatState, t: EnemyState): number {
  let n = markBonus(c, t) + (c.huntTurnBonus ?? 0) + (c.focusNext ?? 0) + (c.breathNow ?? 0);
  if (c.aspect === 'aigle') n += 2;
  if (c.playing && c.playing.cost >= 2) n += power(c, 'visee_assuree');
  const id = c.playing?.id;
  if (id === 'tir' || id === 'tir_ajuste') n += c.gear?.shotBonus ?? 0; // Tirs améliorés
  return n;
}

/** Après une carte du Chasseur : Concentration et Respiration lente ne servent qu'une fois. */
export function afterHunterCard(c: CombatState, attack: boolean): void {
  if (!attack) return;
  c.focusNext = 0;
  c.breathNow = 0;
}

/** Le seuil de Tir fatal (20 %, 30 % avec Mortalité). */
export function fatalThreshold(c: CombatState): number {
  return (20 + (c.gear?.fatalBonus ?? 0)) / 100;
}

// --- Les Pièges ---
// Depuis le 27 novembre 2026 (fiche §13) : un Piège se pose sur un ennemi choisi, un seul de chaque type
// par ennemi. Il part quand cet ennemi commence à agir ; s'il survit, son action a bien lieu
// (sauf le Piège givrant, dont c'est l'effet). Un ennemi qui meurt avant d'agir emporte ses Pièges.

/** Le type de Piège posé par une carte (null : ce n'est pas une carte Piège). */
export const TRAP_CARDS: Record<string, TrapId> = {
  piege_givrant: 'givrant', piege_immolation: 'immolation', piege_venin: 'venin', piege_explosif: 'explosif', champ_pieges: 'explosif',
};

/** Le bonus des Pièges à DoT (Pièges améliorés : +3 aux dégâts, donc +1 par tour). */
export function trapDotBonus(g?: { trapBonus?: number }): number {
  return Math.ceil((g?.trapBonus ?? 0) / 3);
}

/** Cet ennemi porte-t-il déjà un Piège de ce type ? */
export function hasTrap(e: EnemyState, id: TrapId): boolean {
  return !!e.traps?.some((t) => t.id === id);
}

/** Les ennemis qu'on peut piéger (vivants, visibles). */
function trappable(c: CombatState): EnemyState[] {
  return livingEnemies(c).filter((e) => !e.submerged && !e.untargetable);
}

/** La carte Piège ne peut pas viser cet ennemi : il porte déjà ce type (la raison, ou null). */
export function trapTargetBlock(cardId: string, e: EnemyState): string | null {
  const id = TRAP_CARDS[cardId];
  if (!id || cardId === 'champ_pieges' || !hasTrap(e, id)) return null;
  return `Déjà un ${TRAPS[id].name}`;
}

/** La carte Piège n'a plus aucune cible : tous les ennemis ont déjà ce type (la raison, ou null). */
export function trapCardBlock(c: CombatState, cardId: string): string | null {
  const id = TRAP_CARDS[cardId];
  if (!id) return null;
  const pool = trappable(c);
  if (pool.length === 0 || pool.some((e) => !hasTrap(e, id))) return null;
  return `Tous les ennemis ont déjà un ${TRAPS[id].name}.`;
}

/** Pose un Piège sur un ennemi (rien s'il en porte déjà un de ce type). */
export function placeTrap(c: CombatState, target: EnemyState | null, id: TrapId, value: number): void {
  if (!target || target.dead || hasTrap(target, id)) return;
  (target.traps ??= []).push({ id, value });
  fx(c, { kind: 'buff', who: target.uid, label: TRAPS[id].name });
  log(c, `${TRAPS[id].name} posé sous ${target.name}.`);
}

/** Pose un Piège sur chaque ennemi qui n'en a pas encore de ce type (Champ de pièges). */
export function placeTrapAll(c: CombatState, id: TrapId, value: number): void {
  for (const e of trappable(c)) placeTrap(c, e, id, value);
}

/** L'ordre dans lequel les ennemis agiront (pour les numéros affichés au Chasseur). */
export function actionOrder(c: CombatState): Map<number, number> {
  const order = new Map<number, number>();
  livingEnemies(c).filter((e) => !e.submerged).forEach((e, i) => order.set(e.uid, i + 1));
  return order;
}

function springTrap(c: CombatState, trap: Trap, victim: EnemyState): void {
  const bonus = c.gear?.trapBonus ?? 0;
  const name = TRAPS[trap.id].name;
  log(c, `${victim.name} déclenche ${name}.`);
  switch (trap.id) {
    case 'givrant':
      if (isBossEnemy(victim)) {
        victim.gele = 'half';
        fx(c, { kind: 'buff', who: victim.uid, label: 'Givré' });
      } else {
        victim.trapFrozen = true;
        fx(c, { kind: 'buff', who: victim.uid, label: 'Givré' });
      }
      break;
    case 'immolation':
      applyDot(c, victim, 'piege_immolation', trap.value + trapDotBonus(c.gear), 3);
      fx(c, { kind: 'buff', who: victim.uid, label: name });
      break;
    case 'venin':
      for (const e of livingEnemies(c)) if (!e.submerged) applyDot(c, e, 'piege_venin', trap.value + trapDotBonus(c.gear), 3);
      fx(c, { kind: 'buff', who: victim.uid, label: name });
      break;
    case 'explosif': {
      // L'ennemi piégé prend tout, les autres la moitié.
      const full = trap.value + bonus;
      for (const e of [victim, ...livingEnemies(c).filter((o) => o !== victim)]) {
        if (e.dead || e.submerged || c.phase !== 'player') continue;
        const n = e === victim ? full : Math.ceil(full / 2);
        fx(c, { kind: 'tick', who: e.uid, amount: n, label: 'Piège explosif' });
        damageEnemy(c, e, n);
      }
      break;
    }
  }
  // Pièges en série : pioche 1 (et 2 blocage, amélioré).
  if (power(c, 'pieges_serie')) drawCards(c, 1);
  if (power(c, 'pieges_serie_bloc')) gainBlock(c, power(c, 'pieges_serie_bloc'), false);
  // Instinct du chasseur : +1 énergie au prochain tour (une fois par tour).
  if (c.gear?.trapEnergy && !c.trapEnergyNext) c.trapEnergyNext = c.gear.trapEnergy;
}

/**
 * L'ennemi commence à agir : ses Pièges partent, dans l'ordre où ils ont été posés (deux fois avec Maître des pièges).
 * Renvoie false si l'ennemi ne peut plus agir (mort, ou Givré par un Piège).
 */
export function springTraps(c: CombatState, e: EnemyState): boolean {
  if (!e.traps?.length) return !e.dead;
  const traps = e.traps;
  e.traps = [];
  const times = power(c, 'maitre_pieges') ? 2 : 1;
  for (const trap of traps) {
    for (let i = 0; i < times && c.phase === 'player' && !e.dead; i++) springTrap(c, trap, e);
  }
  if (e.trapFrozen) {
    e.trapFrozen = false;
    if (!e.dead) log(c, `${e.name} est pris dans la glace : il perd son action.`);
    return false;
  }
  return !e.dead && c.phase === 'player';
}

// --- Quand un ennemi attaque ---

/** Feindre la mort et l'Esprit du guépard changent les dégâts reçus. */
export function hunterDamageTaken(c: CombatState, dmg: number): number {
  if (!isHunter(c)) return dmg;
  if (c.aspect === 'guepard') dmg *= 1.1;
  if (c.feign) dmg *= 0.5;
  return dmg;
}

/** Un ennemi t'attaque : Contre-attaque le Contrôle, et on retient qu'une attaque a été bloquée (Riposte sauvage). */
export function hunterOnAttacked(c: CombatState, e: EnemyState, dmg: number, blocked: number): void {
  if (!isHunter(c) || dmg <= 0) return;
  if (blocked > 0) c.hunterBlocked = true;
  if (c.counterStun && !e.dead) {
    c.counterStun = false;
    stun(c, e, 1);
  }
}
