// Les mécaniques du Paladin (refonte « Puissance sacrée », 27 novembre 2026) :
// la Puissance sacrée (0 à 5), les Dépenses (3 PS, 0 énergie) et les trois Auras fixes.
// Référence : docs/classes/PALADIN.md (§2 et §3)
import { damageEnemy, fx, gainBlock, healPlayer, livingEnemies, log, playerAttack, power } from './actions';
import { hasTag } from './enemies';
import { dispelDraw, dispelMagic, dispelPoison } from './pretre';
import { random } from './rng';
import type { AuraId, CombatState, EnemyState } from './types';

/** La jauge de Puissance sacrée. */
export const MAX_HOLY = 5;
/** Le coût d'une Dépense. */
export const SPEND_COST = 3;
/** La Puissance sacrée donnée par le Jugement (réglage d'équilibrage). */
export const JUDGE_HOLY = Number(process.env.PAL_JUDGE ?? 1);

export const AURA_IDS: AuraId[] = ['devotion', 'vindicte', 'concentration'];

/** Les trois Auras (textes de l'interface). */
export const AURAS: Record<AuraId, { name: string; short: string; gain: string; bonus: string; cost: string }> = {
  devotion: { name: 'Aura de dévotion', short: 'Dévotion', gain: '+1 PS quand une attaque est entièrement bloquée', bonus: 'Dépenses +4 blocage', cost: '' },
  vindicte: { name: 'Aura de vindicte', short: 'Vindicte', gain: '+1 PS à ta 1re Attaque du tour', bonus: 'Dépenses +4 dégâts', cost: 'soins −30 %' },
  concentration: { name: 'Aura de concentration', short: 'Concentration', gain: '+1 PS à ton 1er soin du tour', bonus: 'Dépenses +3 PV de soin', cost: 'Attaques −20 %' },
};

/** Le bonus d'Aura ajouté à chaque Dépense. */
export const AURA_BONUS: Record<AuraId, number> = { devotion: 4, vindicte: 4, concentration: 3 };

/** Le combat est-il celui d'un Paladin ? */
export function isPaladin(c: CombatState): boolean {
  return c.holy !== undefined;
}

/** Un Mort-vivant ou un Démon : les ennemis préférés du Paladin. */
export function isUnholy(e: EnemyState): boolean {
  return hasTag(e.defId, 'mortvivant') || hasTag(e.defId, 'demon');
}

/** Gagne de la Puissance sacrée (5 au plus). La Malédiction de lignée l'empêche. */
export function gainHoly(c: CombatState, n: number, label = ''): void {
  if (!isPaladin(c) || n <= 0) return;
  if ((c.player.debuffs?.lignee ?? 0) > 0) return;
  const before = c.holy!;
  c.holy = Math.min(MAX_HOLY, before + n);
  if (c.holy > before) fx(c, { kind: 'buff', who: 'player', label: `${label ? `${label} : ` : ''}+${c.holy - before} Puissance sacrée` });
}

/** L'Aura active (Dévotion par défaut). */
export function auraOf(c: CombatState): AuraId {
  return c.aura ?? 'devotion';
}

/** Le gain passif de l'Aura : 1 PS au plus par tour. */
function auraGain(c: CombatState, aura: AuraId): void {
  if (auraOf(c) !== aura || c.auraGained || process.env.PAL_NOAURA) return;
  c.auraGained = true;
  gainHoly(c, 1, AURAS[aura].short);
}

/** Le coût d'un changement d'Aura : le premier du tour est gratuit, les suivants coûtent 1 énergie. */
export function auraChangeCost(c: CombatState): number {
  return (c.auraChanges ?? 0) > 0 ? 1 : 0;
}

/** Peut-on passer à cette Aura maintenant ? */
export function canChangeAura(c: CombatState, aura: AuraId): boolean {
  return isPaladin(c) && c.phase === 'player' && auraOf(c) !== aura && c.player.energy >= auraChangeCost(c);
}

/** Change d'Aura (bouton à côté du héros). La Puissance sacrée est gardée. */
export function changeAura(c: CombatState, aura: AuraId): boolean {
  if (!canChangeAura(c, aura)) return false;
  c.player.energy -= auraChangeCost(c);
  c.auraChanges = (c.auraChanges ?? 0) + 1;
  c.aura = aura;
  fx(c, { kind: 'buff', who: 'player', label: AURAS[aura].name });
  log(c, `${AURAS[aura].name}.`);
  return true;
}

/** Le coût d'une Dépense en Puissance sacrée (Rétribution : Juste châtiment ne coûte que 2). */
export function holyCostOf(c: CombatState, cardId: string, base: number): number {
  if (cardId === 'juste_chatiment' && c.gear?.retributionCost) return Math.max(0, base - c.gear.retributionCost);
  return base;
}

/** Un soin du Paladin, avec l'animation. */
export function palHeal(c: CombatState, n: number): number {
  const healed = healPlayer(c, n);
  if (healed > 0) fx(c, { kind: 'heal', from: 'player', to: 'player', amount: healed });
  return healed;
}

/** Le montant d'un soin du Paladin : Lumière améliorée (cartes seulement), Avatar de lumière, Aura de vindicte. */
export function paladinHealAmount(c: CombatState, base: number): number {
  let heal = base + (c.playing ? c.gear?.healBonus ?? 0 : 0);
  if (power(c, 'avatar_lumiere')) heal = Math.floor(heal * 1.25);
  if (auraOf(c) === 'vindicte') heal = Math.floor(heal * 0.7);
  return heal;
}

/** Les bonus et malus d'une Attaque du Paladin : Croisade, Conviction, Vengeance divine. */
export function paladinAttackBonus(c: CombatState, target: EnemyState): number {
  let dmg = 0;
  const unholy = isUnholy(target);
  const crusade = power(c, 'croisade');
  if (crusade) dmg += unholy ? crusade * 2 : crusade;
  if (unholy) dmg += c.gear?.holyBonus ?? 0;
  dmg += c.judgeBonus ?? 0;
  return dmg;
}

/** Le multiplicateur d'un coup du Paladin : Aura de concentration (Attaques −20 %), Aurore ardente (Dépenses ×2 contre les impies). */
export function paladinDamageMult(c: CombatState, target: EnemyState): number {
  let m = 1;
  if (c.playing?.type === 'Attaque' && auraOf(c) === 'concentration') m *= 0.8;
  if (c.spending && c.gear?.aurore && isUnholy(target)) m *= 2;
  return m;
}

/**
 * Après un soin du Paladin : Aura de concentration (même à PV pleins : c'est le soin lancé qui compte),
 * Rayonnement, Avatar de lumière.
 */
export function paladinOnHeal(c: CombatState, healed: number, attempted = healed): void {
  if (attempted > 0 && c.phase === 'player' && !c.enemyActing) auraGain(c, 'concentration');
  if (healed <= 0) return;
  const ray = power(c, 'rayonnement');
  if (ray > 0) {
    for (const e of livingEnemies(c)) {
      if (e.submerged || c.phase !== 'player') continue;
      fx(c, { kind: 'tick', who: e.uid, amount: ray, label: 'Rayonnement' });
      damageEnemy(c, e, ray);
    }
  }
  if (power(c, 'avatar_lumiere')) {
    const pool = livingEnemies(c).filter((e) => !e.submerged);
    if (pool.length > 0 && c.phase === 'player') {
      const t = pool[Math.floor(random(c) * pool.length)];
      const dmg = Math.floor(healed / 2);
      fx(c, { kind: 'tick', who: t.uid, amount: dmg, label: 'Avatar de lumière' });
      damageEnemy(c, t, dmg);
    }
  }
}

/**
 * Le Jugement (sort de barre de départ) : 5 dégâts et 2 Puissance sacrée.
 * Talents : Jugement aiguisé (+3 dégâts), Sagesse (soigne 3), Jugement du croisé (5 blocage), Vengeance divine.
 */
export function judge(c: CombatState, target: EnemyState | null): void {
  const g = c.gear ?? {};
  if (target && !target.dead) playerAttack(c, target, 5 + (g.judgeDmg ?? 0));
  gainHoly(c, JUDGE_HOLY, 'Jugement');
  if (g.judgeHeal) palHeal(c, g.judgeHeal);
  if (g.judgeBlock) gainBlock(c, g.judgeBlock, false);
  if (g.vengeanceDivine) c.judgeBonus = g.vengeanceDivine;
  fx(c, { kind: 'banner', text: 'Jugement' });
}

/** Une Dépense est-elle doublée ? Fin de l'ère (à 5 PS, elle les prend toutes), sinon Faveur divine. Jamais les deux. */
export function spendPlan(c: CombatState): { double: boolean; endOfEra: boolean; favor: boolean } {
  const endOfEra = !!c.gear?.finEre && (c.holy ?? 0) >= MAX_HOLY;
  if (endOfEra) return { double: true, endOfEra, favor: false };
  return { double: !!c.favor, endOfEra: false, favor: !!c.favor };
}

/**
 * Le bonus d'Aura d'une Dépense, ajouté après son effet : Dévotion +4 blocage, Vindicte +4 dégâts à la cible
 * (à tous pour une Dépense de zone), Concentration +3 PV. Bénédiction de puissance : +3 à la 1re Dépense du tour.
 */
export function auraBonus(c: CombatState, target: EnemyState | null, aoe: boolean): void {
  const aura = auraOf(c);
  let n = AURA_BONUS[aura];
  if (power(c, 'benediction_puissance') && !c.blessingUsed) {
    c.blessingUsed = true;
    n += 3;
  }
  if (aura === 'devotion') gainBlock(c, n, false);
  else if (aura === 'concentration') palHeal(c, n);
  else {
    const targets = aoe ? livingEnemies(c).filter((e) => !e.submerged) : target && !target.dead ? [target] : [];
    for (const e of targets) playerAttack(c, e, n);
  }
}

/** Après une Dépense : Zèle, Ardent défenseur, Illumination, Lumière infusée, Gardien des rois, l'Aurore ardente. */
export function afterSpend(c: CombatState): void {
  const g = c.gear ?? {};
  const p = c.player;
  const zeal = power(c, 'zele');
  if (zeal > 0 && (c.zealGained ?? 0) < 5) {
    const n = Math.min(zeal, 5 - (c.zealGained ?? 0));
    p.puissance += n;
    c.zealGained = (c.zealGained ?? 0) + n;
  }
  if (power(c, 'gardien_rois')) gainBlock(c, 6 * power(c, 'gardien_rois'), false);
  if (g.spendRobustesse) {
    p.robustesse += g.spendRobustesse;
    c.ardentRob = (c.ardentRob ?? 0) + g.spendRobustesse;
  }
  if (g.aurore) palHeal(c, 5);
  const first = (c.spendsThisTurn ?? 0) === 1;
  if (first && power(c, 'illumination')) {
    p.energy += 1;
    fx(c, { kind: 'buff', who: 'player', label: 'Illumination : +1 énergie' });
  }
  if (first && g.spendRefund) gainHoly(c, g.spendRefund, 'Lumière infusée');
}

/** Dissipation de tous les types (Lumière purificatrice). */
export function dispelAll(c: CombatState): void {
  dispelDraw(c, () => {
    dispelMagic(c);
    dispelPoison(c);
    const d = c.player.debuffs;
    if (d) Object.assign(d, { ralenti: 0, ombre: 0, discard: 0, transmute: 0, afflictions: [] });
  });
}

/** Le début du tour du Paladin : les compteurs du tour, Ailes de justice, Courroux vengeur, Résistance sacrée, Grâce du croisé. */
export function paladinStartTurn(c: CombatState): void {
  const p = c.player;
  c.auraChanges = 0;
  c.auraGained = false;
  c.guardianUsed = false;
  c.spendsThisTurn = 0;
  c.blessingUsed = false;
  c.artUsed = false;
  p.divineShield = false;
  if (c.turn > 1) {
    if ((c.wings ?? 0) > 0) {
      c.wings! -= 1;
      if (c.wings === 0) p.puissance -= 2;
    }
    if ((c.courroux ?? 0) > 0) c.courroux! -= 1;
    if ((c.holyResist ?? 0) > 0) c.holyResist! -= 1;
  }
  if (power(c, 'grace_croise')) palHeal(c, power(c, 'grace_croise'));
}

/** La fin du tour du Paladin : la Consécration brûle le sol, Faveur divine et Ardent défenseur s'arrêtent. */
export function paladinEndTurn(c: CombatState): void {
  c.blockedSince = 0;
  c.favor = false;
  if (c.ardentRob) {
    c.player.robustesse -= c.ardentRob;
    c.ardentRob = 0;
  }
  const cons = c.consecration;
  if (!cons || cons.turns <= 0) return;
  for (const e of livingEnemies(c)) {
    if (e.submerged || c.phase !== 'player') continue;
    fx(c, { kind: 'tick', who: e.uid, amount: cons.dmg, label: 'Consécration' });
    damageEnemy(c, e, cons.dmg);
  }
  cons.turns -= 1;
}

/** Une attaque ennemie vient de frapper le Paladin : Aura de dévotion, Ferveur du gardien, Gardien des rois, Juste châtiment. */
export function paladinOnAttacked(c: CombatState, e: EnemyState, dmg: number, blocked: number, lost: number): void {
  if (!isPaladin(c) || dmg <= 0) return;
  c.blockedSince = (c.blockedSince ?? 0) + blocked;
  if (lost === 0 && blocked > 0) {
    auraGain(c, 'devotion');
    if (power(c, 'ferveur_gardien') && !c.guardianUsed) {
      c.guardianUsed = true;
      gainHoly(c, power(c, 'ferveur_gardien'), 'Ferveur du gardien');
    }
  }
  if (c.phase !== 'player' || e.dead) return;
  const back = blocked > 0 ? 3 * power(c, 'gardien_rois') : 0;
  if (back > 0) {
    fx(c, { kind: 'tick', who: e.uid, amount: back, label: 'Gardien des rois' });
    damageEnemy(c, e, back);
  }
}

/** Vengeance : chaque ennemi tué donne de la Puissance et 1 Puissance sacrée. */
export function paladinOnDeath(c: CombatState): void {
  const v = power(c, 'vengeance_pal');
  if (v > 0 && isPaladin(c)) {
    c.player.puissance += v;
    gainHoly(c, v, 'Vengeance');
  }
}

/** Dernier serment : la première fois que tu passes sous 20 % de tes PV max, tu es soigné. */
export function lastOath(c: CombatState): void {
  const p = c.player;
  if (!power(c, 'dernier_serment') || c.oathUsed || p.hp >= p.maxHp * 0.2) return;
  c.oathUsed = true;
  p.hp = Math.max(1, p.hp);
  palHeal(c, 15);
  fx(c, { kind: 'banner', text: 'Dernier serment !' });
}

/** Après une carte du Paladin : la Puissance sacrée des cartes ✦, Aura de vindicte, Art de la guerre, Vengeance divine. */
export function afterPaladinCard(c: CombatState, def: { holyGain?: number }, attack: boolean): void {
  if (def.holyGain) gainHoly(c, def.holyGain + ((c.courroux ?? 0) > 0 ? 1 : 0));
  if (attack) {
    c.judgeBonus = 0;
    if ((c.attacksThisTurn ?? 0) === 1) auraGain(c, 'vindicte');
    // Art de la guerre : après ta 2e Attaque du tour, 1 Puissance sacrée.
    if (power(c, 'art_guerre') && (c.attacksThisTurn ?? 0) >= 2 && !c.artUsed) {
      c.artUsed = true;
      gainHoly(c, power(c, 'art_guerre'), 'Art de la guerre');
    }
  }
}

/** Les zones de feu et les DoT font-ils moitié moins mal (Résistance sacrée) ? */
export function holyResistActive(c: CombatState): boolean {
  return (c.holyResist ?? 0) > 0;
}
