// Actions élémentaires du combat : dégâts, blocage, rage, débuffs, pioche.
// Les cartes et les ennemis s'appuient sur ces fonctions.
import { ENEMIES, intentAt } from './enemies';
import { shuffle } from './rng';
import type { CombatState, EnemyState, FxEvent } from './types';

export function log(c: CombatState, msg: string): void {
  c.log.push(msg);
  if (c.log.length > 40) c.log.splice(0, c.log.length - 40);
}

/** Enregistre un événement à animer par l'interface. */
export function fx(c: CombatState, ev: FxEvent): void {
  (c.fx ??= []).push(ev);
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
  if (total > 0) fx(c, { kind: 'block', who: 'player', amount: total });
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
  if (target.dead || target.submerged) return 0;
  const dmg = attackDamage(c, target, base, opts);
  const blockBefore = target.block;
  fx(c, { kind: 'hit', from: 'player', to: target.uid, amount: dmg, blocked: 0, ranged: false });
  const ev = c.fx![c.fx!.length - 1] as { blocked: number };
  damageEnemy(c, target, dmg, opts.ignoreBlock ?? false);
  ev.blocked = opts.ignoreBlock ? 0 : Math.min(blockBefore, dmg);
  return dmg;
}

export function damageEnemy(c: CombatState, target: EnemyState, amount: number, ignoreBlock = false): void {
  if (target.dead || target.submerged || amount <= 0) return;
  let rest = amount;
  if (!ignoreBlock) {
    const absorbed = Math.min(target.block, rest);
    target.block -= absorbed;
    rest -= absorbed;
  }
  target.hp -= rest;
  // Vulkhar plonge dans la lave à 50 % de ses PV.
  if (target.defId === 'vulkhar' && (target.phase ?? 1) === 1 && target.hp <= target.maxHp / 2) {
    target.hp = Math.ceil(target.maxHp / 2);
    submerge(c, target);
    return;
  }
  if (target.hp <= 0) killEnemy(c, target);
}

function submerge(c: CombatState, v: EnemyState): void {
  v.submerged = 2;
  v.block = 0;
  v.interrupted = false;
  v.delayed = false;
  v.buffs.saignement = 0;
  v.buffs.saignementTours = 0;
  fx(c, { kind: 'banner', text: 'Vulkhar plonge dans la lave !' });
  log(c, 'Vulkhar plonge dans la lave ! Des Rejetons de flamme surgissent.');
  for (let i = 0; i < 6; i++) {
    const def = ENEMIES.rejeton;
    c.enemies.push({
      uid: c.nextUid++, defId: def.id, name: def.name, hp: def.hpMax, maxHp: def.hpMax, block: 0,
      buffs: { puissance: 0, demoralise: 0, ralenti: 0, armureFracassee: 0, saignement: 0, saignementTours: 0 },
      step: 0, intent: intentAt(def, 0), interrupted: false, delayed: false, dead: false,
    });
  }
}

/** Vulkhar refait surface : il absorbe les Rejetons encore en vie. */
export function emerge(c: CombatState, v: EnemyState): void {
  const living = c.enemies.filter((e) => e.defId === 'rejeton' && !e.dead);
  for (const r of living) {
    r.dead = true;
    r.hp = 0;
    fx(c, { kind: 'death', who: r.uid });
  }
  const healed = Math.min(v.maxHp - v.hp, living.length * 15);
  v.hp += healed;
  v.submerged = 0;
  v.phase = 2;
  v.step = 0;
  v.counter = 0;
  v.intent = intentAt(ENEMIES.vulkhar, 0, 2);
  fx(c, { kind: 'banner', text: healed > 0 ? `Vulkhar refait surface ! (+${healed} PV)` : 'Vulkhar refait surface !' });
  log(c, `Vulkhar refait surface${healed > 0 ? ` et absorbe ${living.length} Rejeton${living.length > 1 ? 's' : ''} (+${healed} PV)` : ''}.`);
}

export function killEnemy(c: CombatState, target: EnemyState): void {
  if (target.dead) return;
  target.hp = 0;
  target.dead = true;
  target.block = 0;
  fx(c, { kind: 'death', who: target.uid });
  log(c, `${target.name} est vaincu.`);
  if (target.defId === 'etincelle') {
    log(c, `L'Étincelle vivante explose !`);
    fx(c, { kind: 'tick', who: 'player', amount: 4, label: 'Explosion' });
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
