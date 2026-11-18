// Actions élémentaires du combat : dégâts, blocage, rage, débuffs, pioche.
// Les cartes et les ennemis s'appuient sur ces fonctions.
import { ENEMIES, intentAt } from './enemies';
import { random, shuffle } from './rng';
import type { CombatState, EnemyState, FxEvent, PlayerDebuffs } from './types';

export function emptyDebuffs(): PlayerDebuffs {
  return { demoralise: 0, impie: 0, arcane: 0, manaBurn: 0, panic: 0 };
}

/** Crée un ennemi (au début du combat, ou quand un boss appelle des renforts). */
export function makeEnemy(c: CombatState, id: string, hp?: number): EnemyState {
  const def = ENEMIES[id];
  const max = hp ?? def.hpMin + Math.floor(random(c) * (def.hpMax - def.hpMin + 1));
  return {
    uid: c.nextUid++, defId: id, name: def.name, hp: max, maxHp: max, block: 0,
    buffs: { puissance: 0, demoralise: 0, ralenti: 0, armureFracassee: 0, saignement: 0, saignementTours: 0 },
    step: 0, intent: intentAt(def, 0), interrupted: false, delayed: false, dead: false,
  };
}

/** Le Gardien de lave et le Grand Intendant renvoient des dégâts. */
function reflectToPlayer(c: CombatState, from: EnemyState, amount: number): void {
  if (amount <= 0 || c.phase !== 'player') return;
  log(c, `${from.name} renvoie ${amount} dégâts.`);
  fx(c, { kind: 'tick', who: 'player', amount, label: 'Renvoi' });
  damagePlayer(c, amount, false);
}

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

/** La valeur d'un Pouvoir actif (0 s'il n'a pas été joué). */
export function power(c: CombatState, id: string): number {
  return c.powers?.[id] ?? 0;
}

export function addPower(c: CombatState, id: string, value: number): void {
  (c.powers ??= {})[id] = power(c, id) + value;
}

export function gainRage(c: CombatState, amount: number): void {
  const p = c.player;
  const before = p.rage;
  p.rage = Math.max(0, Math.min(p.maxRage, p.rage + amount));
  // Furie croissante : atteindre la rage maximale donne de la Puissance.
  const furie = power(c, 'furie_croissante');
  if (furie > 0 && before < p.maxRage && p.rage === p.maxRage) {
    p.puissance += furie;
    fx(c, { kind: 'buff', who: 'player', label: `Furie croissante : Puissance +${furie}` });
  }
}

/** Le joueur vient de perdre des PV (Enragé). */
export function onHpLost(c: CombatState): void {
  const bonus = power(c, 'enrage');
  if (bonus > 0) c.player.enrageReady = (c.player.enrageReady ?? 0) + bonus;
  if (c.gear?.rageOnHpLoss) gainRage(c, c.gear.rageOnHpLoss); // Brisemonts
}

/** `fromCard` : le blocage vient d'une carte (Bâton de l'intendant : +2). */
export function gainBlock(c: CombatState, amount: number, fromCard = true): void {
  const p = c.player;
  let total = amount + (p.robustesse ?? 0) + (fromCard ? c.gear?.blockBonus ?? 0 : 0);
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
  const g = c.gear ?? {};
  let dmg = base + p.puissance + (g.attackBonus ?? 0);
  if (!c.firstAttackDone) dmg += g.firstAttackBonus ?? 0;
  if (c.playing && c.playing.cost >= 2) dmg += g.heavyAttackBonus ?? 0;
  if (c.playing?.type === 'Sort') dmg += g.spellBonus ?? 0;
  if ((p.debuffs?.demoralise ?? 0) > 0) dmg *= 0.75;
  if (target.hp < target.maxHp * 0.5) dmg += g.lowHpBonus ?? 0;
  if (opts.rageCard && p.posture === 'combat') dmg += 3;
  if (opts.rageCard) dmg += power(c, 'maitre_armes');
  dmg += p.enrageReady ?? 0;
  if (p.posture === 'defensive') dmg *= 0.8;
  if (p.temerite) dmg *= 1.5;
  if ((p.fureur ?? 0) > 0) dmg *= 1.5;
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
  if (target.defId === 'gardien' && blockBefore > 0) reflectToPlayer(c, target, 3);
  if (target.defId === 'saldris' && target.shield === 'coups') reflectToPlayer(c, target, Math.floor(dmg / 2));
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
  // Saldris se rend sous 10 % de PV (avant de mourir).
  if (target.defId === 'saldris' && target.hp < target.maxHp * 0.1) {
    target.hp = Math.max(1, target.hp);
    surrender(c, target);
    return;
  }
  if (target.hp <= 0) killEnemy(c, target);
}

/** Le Grand Intendant Saldris se rend : le combat est gagné. */
function surrender(c: CombatState, s: EnemyState): void {
  fx(c, { kind: 'banner', text: 'Saldris se rend !' });
  log(c, 'Le Grand Intendant Saldris se rend. Ses gardes déposent les armes.');
  for (const e of c.enemies) {
    if (e.dead) continue;
    e.dead = true;
    e.gone = true;
    e.block = 0;
    fx(c, { kind: 'death', who: e.uid });
  }
  s.gone = true;
  if (c.phase === 'player') c.phase = 'victory';
}

/** Saldris se rend aussi quand ses 4 gardes sont tombés. */
function checkSaldris(c: CombatState): void {
  const s = c.enemies.find((e) => e.defId === 'saldris' && !e.dead);
  if (!s) return;
  const guards = c.enemies.filter((e) => (e.defId === 'pretre' || e.defId === 'gardien') && !e.dead);
  if (guards.length === 0) surrender(c, s);
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
  for (let i = 0; i < 6; i++) c.enemies.push(makeEnemy(c, 'rejeton', ENEMIES.rejeton.hpMax));
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
  if (c.gear?.healOnKill && c.player.hp > 0) c.player.hp = Math.min(c.player.maxHp, c.player.hp + c.gear.healOnKill);
  // Krâgg tombe : ses Molosses s'enfuient. Un Molosse tué pendant que Krâgg vit se relèvera.
  if (target.defId === 'kragg') {
    for (const m of c.enemies.filter((e) => e.defId === 'molosse_enrage')) {
      m.reviveIn = 0;
      if (!m.dead) {
        m.dead = true;
        m.gone = true;
        fx(c, { kind: 'death', who: m.uid });
      }
    }
    log(c, 'Les Molosses enragés s\'enfuient.');
  }
  if (target.defId === 'molosse_enrage' && c.enemies.some((e) => e.defId === 'kragg' && !e.dead)) {
    target.reviveIn = 2;
    log(c, `${target.name} se relèvera dans 2 tours, tant que Krâgg est en vie.`);
  }
  const onKill = c.gear?.onKillAoe ?? 0;
  if (onKill > 0) {
    for (const other of livingEnemies(c)) {
      if (other.submerged) continue;
      fx(c, { kind: 'tick', who: other.uid, amount: onKill, label: 'Explosion' });
      damageEnemy(c, other, onKill, false);
    }
  }
  if (target.defId === 'etincelle' || target.defId === 'eclat') {
    const boom = target.defId === 'eclat' ? 5 : 4;
    log(c, `${target.name} explose !`);
    fx(c, { kind: 'tick', who: 'player', amount: boom, label: 'Explosion' });
    damagePlayer(c, boom, false);
  }
  checkSaldris(c);
  if (livingEnemies(c).length === 0 && c.phase === 'player') c.phase = 'victory';
}

/** Dégâts subis par le joueur. `isAttack` : une attaque ennemie (donne de la rage). */
export function damagePlayer(c: CombatState, amount: number, isAttack: boolean): number {
  const p = c.player;
  if (!isAttack) amount -= c.gear?.nonAttackReduce ?? 0;
  if (p.rempart) amount = Math.floor(amount / 2);
  if (amount <= 0) return 0;
  const absorbed = Math.min(p.block, amount);
  p.block -= absorbed;
  const hpLoss = amount - absorbed;
  p.hp -= hpLoss;
  if (hpLoss > 0) onHpLost(c);
  if (isAttack) {
    const blockedRage = p.posture === 'defensive' || p.ignorerDouleur;
    if (hpLoss > 0 || blockedRage) gainRage(c, 1);
    if (hpLoss === 0) p.blockedFullAttack = true;
  }
  if (p.hp <= 0) {
    p.hp = 0;
    c.phase = 'defeat';
  }
  // Cœur de la bombe : une grosse perte de PV fait exploser le joueur.
  const boom = c.gear?.bigHitAoe ?? 0;
  if (boom > 0 && hpLoss >= 10 && c.phase === 'player') {
    log(c, `Le Cœur de la bombe explose : ${boom} dégâts à tous les ennemis.`);
    for (const e of livingEnemies(c)) {
      if (e.submerged) continue;
      fx(c, { kind: 'tick', who: e.uid, amount: boom, label: 'Explosion' });
      damageEnemy(c, e, boom);
    }
  }
  return hpLoss;
}

export function applySaignement(target: EnemyState, amount: number, c?: CombatState): void {
  target.buffs.saignement += amount + (c?.gear?.bleedBonus ?? 0);
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

/** Glisse des cartes-statut à des places au hasard dans la pioche (Fardeau). */
export function addStatusToDraw(c: CombatState, id: string, count: number): void {
  for (let i = 0; i < count; i++) {
    const at = Math.floor(random(c) * (c.draw.length + 1));
    c.draw.splice(at, 0, { uid: c.nextUid++, id, upgraded: false });
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
