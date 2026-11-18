// Actions élémentaires du combat : dégâts, blocage, rage, débuffs, pioche.
// Les cartes et les ennemis s'appuient sur ces fonctions.
import { shuffle } from './rng';
import type { CombatState, EnemyState } from './types';

export function log(c: CombatState, msg: string): void {
  c.log.push(msg);
  if (c.log.length > 40) c.log.splice(0, c.log.length - 40);
}

export function livingEnemies(c: CombatState): EnemyState[] {
  return c.enemies.filter((e) => !e.dead);
}

export function gainRage(c: CombatState, amount: number): void {
  const p = c.player;
  p.rage = Math.max(0, Math.min(p.maxRage, p.rage + amount));
}

export function gainBlock(c: CombatState, amount: number): void {
  const p = c.player;
  let total = amount;
  if (p.posture === 'defensive') total += 3;
  p.block += Math.max(0, total);
}

export interface AttackOptions {
  rageCard?: boolean; // carte qui coûte de la rage (bonus de la posture de Combat)
  ignoreBlock?: boolean;
}

/** Calcule les dégâts d'une Attaque du joueur avant le blocage de la cible. */
export function attackDamage(c: CombatState, target: EnemyState, base: number, opts: AttackOptions = {}): number {
  const p = c.player;
  let dmg = base + p.puissance;
  if (opts.rageCard && p.posture === 'combat') dmg += 3;
  if (p.posture === 'defensive') dmg *= 0.8;
  if (target.buffs.armureFracassee > 0) dmg *= 1.5;
  return Math.max(0, Math.floor(dmg));
}

/** Inflige une Attaque du joueur à un ennemi. Renvoie les dégâts infligés (avant blocage). */
export function playerAttack(c: CombatState, target: EnemyState, base: number, opts: AttackOptions = {}): number {
  if (target.dead) return 0;
  const dmg = attackDamage(c, target, base, opts);
  damageEnemy(c, target, dmg, opts.ignoreBlock ?? false);
  return dmg;
}

export function damageEnemy(c: CombatState, target: EnemyState, amount: number, ignoreBlock = false): void {
  if (target.dead || amount <= 0) return;
  let rest = amount;
  if (!ignoreBlock) {
    const absorbed = Math.min(target.block, rest);
    target.block -= absorbed;
    rest -= absorbed;
  }
  target.hp -= rest;
  if (target.hp <= 0) killEnemy(c, target);
}

export function killEnemy(c: CombatState, target: EnemyState): void {
  if (target.dead) return;
  target.hp = 0;
  target.dead = true;
  target.block = 0;
  log(c, `${target.name} est vaincu.`);
  if (target.defId === 'etincelle') {
    log(c, `L'Étincelle vivante explose !`);
    damagePlayer(c, 4, false);
  }
  if (livingEnemies(c).length === 0 && c.phase === 'player') c.phase = 'victory';
}

/** Dégâts subis par le joueur. `isAttack` : une attaque ennemie (donne de la rage). */
export function damagePlayer(c: CombatState, amount: number, isAttack: boolean): number {
  const p = c.player;
  if (amount <= 0) return 0;
  const absorbed = Math.min(p.block, amount);
  p.block -= absorbed;
  const hpLoss = amount - absorbed;
  p.hp -= hpLoss;
  if (isAttack) {
    const blockedRage = p.posture === 'defensive' || p.ignorerDouleur;
    if (hpLoss > 0 || blockedRage) gainRage(c, 1);
    if (hpLoss === 0) p.blockedFullAttack = true;
  }
  if (p.hp <= 0) {
    p.hp = 0;
    c.phase = 'defeat';
  }
  return hpLoss;
}

export function applySaignement(target: EnemyState, amount: number): void {
  target.buffs.saignement += amount;
  target.buffs.saignementTours = 3;
}

export function drawCards(c: CombatState, count: number): void {
  for (let i = 0; i < count; i++) {
    if (c.hand.length >= 10) return;
    if (c.draw.length === 0) {
      if (c.discard.length === 0) return;
      c.draw = shuffle(c, c.discard);
      c.discard = [];
    }
    const card = c.draw.shift();
    if (card) c.hand.push(card);
  }
}

export function addStatusToHand(c: CombatState, id: string, count: number): void {
  for (let i = 0; i < count; i++) {
    if (c.hand.length >= 10) {
      c.discard.push({ uid: c.nextUid++, id, upgraded: false });
    } else {
      c.hand.push({ uid: c.nextUid++, id, upgraded: false });
    }
  }
}
