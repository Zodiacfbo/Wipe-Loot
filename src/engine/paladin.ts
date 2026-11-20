// Les mécaniques du Paladin : les Sceaux et le Jugement, les Auras, et sa lumière.
// Référence : docs/classes/PALADIN.md (§2 et §3)
import { damageEnemy, fx, gainBlock, healPlayer, livingEnemies, log, playerAttack, power } from './actions';
import { hasTag } from './enemies';
import { dispelDraw, dispelMagic, dispelPoison } from './pretre';
import { random } from './rng';
import type { AuraId, CombatState, EnemyState, SealId } from './types';

export const SEAL_NAMES: Record<SealId, string> = {
  droiture: 'Sceau de droiture',
  croise: 'Sceau du croisé',
  lumiere: 'Sceau de lumière',
  sagesse: 'Sceau de sagesse',
  rempart: 'Sceau du rempart',
  vengeance: 'Sceau de vengeance',
};

/** Ce que fait chaque Sceau tant qu'il est actif, puis quand il est jugé (textes des cartes et de l'interface). */
export const SEAL_TEXT: Record<SealId, { bonus: string; judge: string }> = {
  droiture: { bonus: 'tes Attaques infligent +3 dégâts', judge: '12 dégâts' },
  croise: { bonus: 'tes Attaques +1 par Attaque déjà jouée ce tour', judge: 'Armure fracassée 2 tours' },
  lumiere: { bonus: 'tes Attaques te soignent de 2 PV', judge: 'soigne 8 PV' },
  sagesse: { bonus: '+1 carte par tour', judge: '+1 énergie' },
  rempart: { bonus: 'tes Attaques te donnent 3 blocage', judge: '12 blocage' },
  vengeance: { bonus: 'tes Attaques appliquent 1 Censure', judge: '5 dégâts par Censure' },
};

export const AURA_NAMES: Record<AuraId, string> = {
  devotion: 'Aura de dévotion',
  resistance: 'Aura de résistance',
  epines: 'Aura d\'épines sacrées',
};

/** Le combat est-il celui d'un Paladin ? */
export function isPaladin(c: CombatState): boolean {
  return c.seals !== undefined;
}

/** Un Mort-vivant ou un Démon : les ennemis préférés du Paladin. */
export function isUnholy(e: EnemyState): boolean {
  return hasTag(e.defId, 'mortvivant') || hasTag(e.defId, 'demon');
}

export function hasSeal(c: CombatState, id: SealId): boolean {
  return !!c.seals?.includes(id);
}

/** Active un Sceau. Un seul à la fois (deux avec Double sceau) : le plus ancien est remplacé. */
export function activateSeal(c: CombatState, id: SealId): void {
  if (!c.seals) return;
  if ((c.player.debuffs?.lignee ?? 0) > 0) {
    log(c, 'La Malédiction de lignée étouffe ta lumière : tu ne peux pas activer de Sceau.');
    return;
  }
  const max = c.gear?.doubleSeal ? 2 : 1;
  c.seals = c.seals.filter((s) => s !== id);
  c.seals.push(id);
  while (c.seals.length > max) c.seals.shift();
  fx(c, { kind: 'buff', who: 'player', label: SEAL_NAMES[id] });
  // Zèle : chaque Sceau activé donne 1 Puissance (5 au maximum).
  const zeal = power(c, 'zele');
  if (zeal > 0 && (c.zealGained ?? 0) < 5) {
    const n = Math.min(zeal, 5 - (c.zealGained ?? 0));
    c.player.puissance += n;
    c.zealGained = (c.zealGained ?? 0) + n;
  }
}

/** Le bonus de dégâts des Sceaux, de Croisade et de Vengeance divine sur une Attaque du Paladin. */
export function paladinAttackBonus(c: CombatState, target: EnemyState): number {
  let dmg = 0;
  if (hasSeal(c, 'droiture')) dmg += 3;
  if (hasSeal(c, 'croise')) dmg += c.attacksThisTurn ?? 0;
  const unholy = isUnholy(target);
  const crusade = power(c, 'croisade');
  if (crusade) dmg += unholy ? crusade * 2 : crusade;
  if (unholy) dmg += c.gear?.holyBonus ?? 0;
  dmg += c.judgeBonus ?? 0;
  return dmg;
}

/** Une Attaque du Paladin touche : le Sceau de vengeance applique la Censure. */
export function onPaladinHit(c: CombatState, t: EnemyState): void {
  if (t.dead || t.submerged || !hasSeal(c, 'vengeance')) return;
  t.buffs.censure = (t.buffs.censure ?? 0) + 1;
}

/** Le Jugement d'un Sceau. `consume` : le Sceau est consommé (Verdict des cieux le garde). */
export function judge(c: CombatState, target: EnemyState | null, consume = true): void {
  const seals = [...(c.seals ?? [])];
  const g = c.gear ?? {};
  // L'Aurore ardente : double dégâts contre les Morts-vivants et les Démons.
  const mult = g.aurore && target && isUnholy(target) ? 2 : 1;
  const strike = (n: number) => {
    if (target && !target.dead && n > 0) playerAttack(c, target, n * mult);
  };
  if (seals.length === 0) strike(6);
  for (const s of seals) {
    switch (s) {
      case 'droiture':
        strike(12);
        break;
      case 'croise':
        if (target && !target.dead) {
          target.buffs.armureFracassee = Math.max(target.buffs.armureFracassee, 2);
          fx(c, { kind: 'buff', who: target.uid, label: 'Armure fracassée' });
        }
        break;
      case 'lumiere':
        palHeal(c, 8);
        break;
      case 'sagesse':
        c.player.energy += 1 + (g.wisdomBonus ?? 0);
        fx(c, { kind: 'buff', who: 'player', label: `+${1 + (g.wisdomBonus ?? 0)} énergie` });
        break;
      case 'rempart':
        gainBlock(c, 12, false);
        break;
      case 'vengeance': {
        const n = target?.buffs.censure ?? 0;
        if (target && n > 0) {
          target.buffs.censure = 0;
          strike(5 * n);
        }
        break;
      }
    }
  }
  if (g.aurore) palHeal(c, 5);
  if (consume && seals.length > 0) {
    c.lastJudged = seals[seals.length - 1];
    c.seals = [];
  }
  // Vengeance divine : la prochaine Attaque après un Jugement frappe plus fort.
  if (g.vengeanceDivine) c.judgeBonus = g.vengeanceDivine;
  fx(c, { kind: 'banner', text: seals.length ? `Jugement : ${seals.map((s) => SEAL_NAMES[s].replace('Sceau ', '')).join(' et ')}` : 'Jugement' });
}

/** Un soin du Paladin, avec l'animation. */
export function palHeal(c: CombatState, n: number): number {
  const healed = healPlayer(c, n);
  if (healed > 0) fx(c, { kind: 'heal', from: 'player', to: 'player', amount: healed });
  return healed;
}

/** Le montant d'un soin du Paladin : Lumière améliorée (sur les cartes seulement), Avatar de lumière, Faveur divine. */
export function paladinHealAmount(c: CombatState, base: number): number {
  let heal = base + (c.playing ? c.gear?.healBonus ?? 0 : 0);
  if (power(c, 'avatar_lumiere')) heal = Math.floor(heal * 1.25);
  if (c.favor && c.playing) heal *= 2;
  return heal;
}

/** Après un soin du Paladin : Rayonnement, Avatar de lumière, Illumination, Lumière bénie. */
export function paladinOnHeal(c: CombatState, healed: number): void {
  if (healed <= 0) return;
  if (c.playing) c.palHealed = true;
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
  if (power(c, 'illumination') && !c.illumUsed && !c.enemyActing && c.phase === 'player') {
    c.illumUsed = true;
    c.player.energy += 1;
    fx(c, { kind: 'buff', who: 'player', label: 'Illumination : +1 énergie' });
  }
  if (c.gear?.blessedHealBlock) gainBlock(c, Math.floor(healed / 4), false);
}

/** Change d'Aura (une seule à la fois) : l'Aura de dévotion rend sa Robustesse en partant. */
export function setAura(c: CombatState, id: AuraId, value: number): void {
  const old = c.aura;
  if (old?.id === 'devotion') c.player.robustesse -= old.value;
  if (id === 'devotion') c.player.robustesse += value;
  c.aura = { id, value };
  fx(c, { kind: 'buff', who: 'player', label: AURA_NAMES[id] });
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

/** Le début du tour du Paladin : Sceau de sagesse, Grâce du croisé, Fervent, Ailes de justice. */
export function paladinStartTurn(c: CombatState): number {
  const p = c.player;
  c.pavois = 0;
  c.crusaderShield = undefined;
  c.illumUsed = false;
  c.ferventUsed = false;
  c.healFree = false;
  p.divineShield = false;
  if (c.ferventNext) {
    p.energy += 1;
    c.ferventNext = false;
    fx(c, { kind: 'buff', who: 'player', label: 'Fervent : +1 énergie' });
  }
  if (c.turn > 1 && (c.wings ?? 0) > 0) {
    c.wings! -= 1;
    if (c.wings === 0) p.puissance -= 2;
  }
  if (power(c, 'grace_croise')) palHeal(c, power(c, 'grace_croise'));
  // Le Sceau de sagesse : une carte de plus.
  return (c.seals ?? []).filter((s) => s === 'sagesse').length;
}

/** La fin du tour du Paladin : la Consécration brûle le sol. */
export function paladinEndTurn(c: CombatState): void {
  c.blockedSince = 0;
  const cons = c.consecration;
  if (!cons || cons.turns <= 0) return;
  for (const e of livingEnemies(c)) {
    if (e.submerged || c.phase !== 'player') continue;
    fx(c, { kind: 'tick', who: e.uid, amount: cons.dmg, label: 'Consécration' });
    damageEnemy(c, e, cons.dmg);
  }
  cons.turns -= 1;
}

/** Une attaque ennemie vient de frapper le Paladin : épines, Pavois, Bouclier du croisé, Fervent, Juste châtiment. */
export function paladinOnAttacked(c: CombatState, e: EnemyState, dmg: number, blocked: number, lost: number): void {
  if (!isPaladin(c) || dmg <= 0) return;
  c.blockedSince = (c.blockedSince ?? 0) + blocked;
  if (lost === 0 && power(c, 'fervent') && !c.ferventUsed) {
    c.ferventUsed = true;
    c.ferventNext = true;
  }
  if (c.phase !== 'player' || e.dead) return;
  let back = c.aura?.id === 'epines' ? c.aura.value : 0;
  if (blocked > 0) back += (c.pavois ?? 0) + (c.crusaderShield?.dmg ?? 0);
  if (back > 0) {
    fx(c, { kind: 'tick', who: e.uid, amount: back, label: 'Épines sacrées' });
    damageEnemy(c, e, back);
  }
  if (blocked > 0 && c.crusaderShield) palHeal(c, c.crusaderShield.heal);
}

/** Au début du tour d'un ennemi : la Censure le brûle. */
export function censureTick(c: CombatState, e: EnemyState): void {
  const n = e.buffs.censure ?? 0;
  if (n <= 0) return;
  log(c, `${e.name} subit la Censure : ${n} dégâts.`);
  fx(c, { kind: 'tick', who: e.uid, amount: n, label: 'Censure' });
  damageEnemy(c, e, n, true);
}

/** Vengeance : chaque ennemi tué donne de la Puissance. */
export function paladinOnDeath(c: CombatState): void {
  const v = power(c, 'vengeance_pal');
  if (v > 0 && isPaladin(c)) c.player.puissance += v;
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

/** Après une carte du Paladin : Sceau de lumière et du rempart, Faveur divine, Science du combat, Vengeance divine. */
export function afterPaladinCard(c: CombatState, def: { type: string; healCard?: boolean; id: string }, attack: boolean): void {
  if (attack) {
    if (hasSeal(c, 'lumiere')) palHeal(c, 2);
    if (hasSeal(c, 'rempart')) gainBlock(c, 3, false);
    c.judgeBonus = 0;
    // Science du combat : après ta 2e Attaque du tour, ta prochaine carte de soin coûte 0.
    if (power(c, 'science_combat') && c.attacksThisTurn === 2) c.healFree = true;
  }
  if (def.healCard) c.healFree = false;
  if (c.favor && def.id !== 'faveur_divine' && (def.type === 'Sort' || c.palHealed)) c.favor = false;
  c.palHealed = false;
}
