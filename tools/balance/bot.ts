// Un bot qui joue des runs entières avec le moteur du jeu, pour mesurer l'équilibrage.
// En combat, il essaie chaque action possible sur une copie de l'état et garde la meilleure
// (une évaluation simple : dégâts infligés, dégâts qu'il va encaisser, ressources, ennemis vaincus).
import { CARDS } from '../../src/engine/cards';
import { canPlayCard, canUseSpell, choosePet, endTurn, playCard, useSpell } from '../../src/engine/combat';
import { ENEMIES } from '../../src/engine/enemies';
import { EVENTS } from '../../src/engine/events';
import { ITEMS, slotsFor } from '../../src/engine/items';
import { reachable } from '../../src/engine/map';
import { POTIONS } from '../../src/engine/potions';
import {
  afterCombatAction, barCapacity, buyCard, buyPotion, buyRemoval, buyUpgrade, campfireReforge, campfireRest, campfireUpgrade,
  canDrink, chooseBlessing, chooseNode, chooseReward, drinkPotion, equipPending, eventChoiceLock, leaveEvent, leavePending,
  leaveShop, learnSpell, newRun, offerBlessing, resolveEvent, retryAfterWipe, takePotion,
  campfireBindStaff, canBindStaff, canRest, startNextAct, campfireEquinoxe, campfireAurore,
} from '../../src/engine/run';
import { previewIntentDamage } from '../../src/engine/combat';
import type { CombatState, EnemyState, RunState } from '../../src/engine/types';

// ---------- Évaluation d'un état de combat ----------

/** Les dégâts qu'un ennemi va infliger à son prochain tour. */
function incomingFrom(c: CombatState, e: EnemyState): number {
  if (e.dead || e.submerged || e.interrupted || (e.stun ?? 0) > 0 || (e.sap ?? 0) > 0 || (e.buffs.peur ?? 0) > 0 || (e.mouton ?? 0) > 0 || e.gele === 'skip' || (e.enslaved ?? 0) > 0) return 0;
  if (c.player.iceBlock) return 0;
  const def = ENEMIES[e.defId];
  if (e.disarmed && !def.elite && !def.boss) return 0;
  const i = e.intent;
  if (i.kind !== 'attack') return 0;
  return (previewIntentDamage(c, e) ?? 0) * (i.times ?? 1);
}

function evaluate(c: CombatState): number {
  if (c.phase === 'victory') return 100000 + c.player.hp * 10;
  if (c.phase === 'defeat') return -100000;
  const p = c.player;
  let incoming = 0;
  let enemyHp = 0;
  let threat = 0;
  for (const e of c.enemies) {
    if (e.dead) continue;
    incoming += incomingFrom(c, e);
    enemyHp += e.hp + e.block * 0.5;
    // Vulkhar en phase 1 : il reste toute la phase 2 à faire. Le pousser sous 50 % est un progrès.
    if (e.defId === 'vulkhar' && (e.phase ?? 1) === 1) enemyHp += e.submerged ? 40 : 260;
    // Chaque Rejeton encore en vie soignera Vulkhar de 15 PV quand il refera surface.
    if (e.defId === 'rejeton') enemyHp += 15;
    threat += 6 + (ENEMIES[e.defId].elite || ENEMIES[e.defId].boss ? 10 : 0);
    // Débuffs posés : ils valent quelque chose pour la suite.
    enemyHp -= e.buffs.saignement * Math.min(3, e.buffs.saignementTours) * 0.8;
    enemyHp -= e.buffs.armureFracassee * 3 + e.buffs.demoralise * 1.5 + e.buffs.ralenti;
    // Mage : la Brûlure à venir, le Gel accumulé.
    const burn = e.buffs.brulure ?? 0;
    enemyHp -= (burn * (burn + 1)) / 2 * 0.6;
    enemyHp -= (e.buffs.gel ?? 0) * 1.5;
    // Démoniste : les DoT à venir et les Malédictions.
    for (const d of e.dots ?? []) enemyHp -= d.dmg * Math.min(4, d.turns) * 0.7;
    enemyHp -= (e.curses?.length ?? 0) * 3;
    // Voleur : le Poison posé, la Vendetta.
    enemyHp -= (e.buffs.poison ?? 0) * 2 + (e.vendetta ? 12 : 0);
  }
  // Ce qui brûlera en fin de tour : Zones de feu et Bombes vivantes gardées en main.
  const burn = c.hand.filter((k) => k.id === 'zone_de_feu').length * (c.fireProof ? 0 : 6)
    + c.hand.filter((k) => k.id === 'bombe_vivante').length * 15;
  // Le Prêtre : l'Égide encaisse aussi, et elle reste pour les tours suivants.
  const unblocked = Math.max(0, incoming - p.block - (c.aegis ?? 0)) * (p.rempart ? 0.5 : 1) + burn;
  const powers = Object.values(c.powers ?? {}).length;
  const charges = (p.charges ?? 0) >= 4 && !c.gear?.noOverload ? 4 * 1.5 - 3 : (p.charges ?? 0) * 1.5;
  // La Pierre d'âme ne vaut le coup (1 éclat) que contre un boss.
  const big = c.enemies.some((e) => !e.dead && (ENEMIES[e.defId].elite || ENEMIES[e.defId].boss));
  const shards = (c.shards ?? 0) * 3 + (c.infernal ?? 0) * 2 + (c.soulstone && big ? 10 : 0)
    + (c.aegis ?? 0) * 0.6 + (c.faith ?? 0) * 1.5 + (c.renew ? c.renew.amount * c.renew.turns : 0)
    // Voleur : les points de combo, le Camouflage (s'il reste une Ouverture en main), le Poison d'arme, Danse des lames.
    + rogueValue(c) + paladinValue(c);
  return p.hp * 1.4 - unblocked * 1.5 - enemyHp - threat + charges + shards + p.rage * 0.5 + p.puissance * 5 + p.robustesse * 3 + powers * 8 + p.energy * 0.1;
}

function rogueValue(c: CombatState): number {
  if (c.combo === undefined) return 0;
  const openers = c.hand.filter((k) => CARDS[k.id].opener).length;
  return c.combo * 2.5 + (c.stealth && openers > 0 ? 6 * openers : 0) + (c.stealthNext ? 4 : 0)
    + (c.weaponPoison ? 6 + c.weaponPoison.amount * 3 : 0)
    + (c.bladeDance ? c.bladeDance.bonus * c.bladeDance.turns * 1.5 : 0) + (c.coldBlood ? 6 : 0) + (c.shadowStep ? 3 : 0)
    + (c.player.evasion ? 8 : 0);
}

function paladinValue(c: CombatState): number {
  if (c.seals === undefined) return 0;
  let v = c.seals.length * 5 + (c.aura ? 8 : 0) + (c.favor ? 4 : 0) + (c.judgeBonus ?? 0) + (c.pavois ?? 0) + (c.crusaderShield ? 8 : 0);
  const living = c.enemies.filter((e) => !e.dead).length;
  if (c.consecration) v += c.consecration.dmg * c.consecration.turns * living * 0.8;
  for (const e of c.enemies) if (!e.dead) v += (e.buffs.censure ?? 0) * 2.5;
  return v;
}

const clone = (c: CombatState): CombatState => JSON.parse(JSON.stringify(c));

interface Action { kind: 'card' | 'spell'; index: number; target?: number }

function candidates(c: CombatState): Action[] {
  const list: Action[] = [];
  const targets = c.enemies.filter((e) => !e.dead && !e.submerged && !e.untargetable).map((e) => e.uid);
  c.hand.forEach((card, i) => {
    if (!canPlayCard(c, i)) return;
    if (CARDS[card.id].needsTarget) targets.forEach((t) => list.push({ kind: 'card', index: i, target: t }));
    else list.push({ kind: 'card', index: i });
  });
  c.spells.forEach((s, i) => {
    if (!canUseSpell(c, i)) return;
    const needs = ['charge', 'coup_de_pommeau', 'coup_de_pied', 'jugement', 'marteau_jugement', 'charge_sacree'].includes(s.id);
    if (needs) targets.forEach((t) => list.push({ kind: 'spell', index: i, target: t }));
    else list.push({ kind: 'spell', index: i });
  });
  return list;
}

function apply(c: CombatState, a: Action): boolean {
  return a.kind === 'card' ? playCard(c, a.index, a.target) : useSpell(c, a.index, a.target);
}

/** Joue un tour complet du joueur, puis finit le tour. */
export function playTurn(run: RunState): void {
  const c = run.combat!;
  // Potions : soin quand on est bas, les autres d'emblée contre un boss.
  const big = c.enemies.some((e) => ENEMIES[e.defId].elite || ENEMIES[e.defId].boss);
  run.potions.forEach((id, slot) => {
    if (!id || c.phase !== 'player') return;
    const heal = POTIONS[id].heal;
    if ((heal && c.player.hp < c.player.maxHp * 0.4) || (!heal && big && c.turn <= 2)) drinkPotion(run, slot);
  });
  // Démoniste : le Rôdeur du néant contre les boss, le Diablotin ailleurs.
  if (c.turn === 1 && c.pet) choosePet(c, big ? 'rodeur' : 'diablotin');
  for (let guard = 0; guard < 25 && c.phase === 'player'; guard++) {
    const base = evaluate(c);
    let best: Action | null = null;
    let bestScore = 0.5;
    for (const a of candidates(c)) {
      const copy = clone(c);
      if (!apply(copy, a)) continue;
      const gain = evaluate(copy) - base;
      if (gain > bestScore) { bestScore = gain; best = a; }
    }
    if (!best) {
      // Pacte de sang (Démoniste) : le bot ne voit qu'une action à l'avance, il ne verrait jamais son intérêt.
      // On le lance comme un joueur le ferait : plus d'énergie, une carte jouable en main, et assez de PV.
      const pact = c.spells.findIndex((s) => s.id === 'pacte_de_sang');
      const playable = c.hand.some((k) => CARDS[k.id].type !== 'Statut' && CARDS[k.id].type !== 'Pouvoir' && CARDS[k.id].cost === 1);
      if (pact >= 0 && c.player.energy === 0 && playable && c.player.hp > c.player.maxHp * 0.45 && canUseSpell(c, pact)) {
        useSpell(c, pact);
        continue;
      }
      break;
    }
    apply(c, best);
  }
  c.fx = [];
  if (c.phase === 'player') endTurn(c);
  c.fx = [];
}

// ---------- Décisions hors combat ----------

const RARITY_RANK: Record<string, number> = { commun: 1, rare: 2, epique: 3, legendaire: 4 };
const CARD_RANK: Record<string, number> = { commune: 1, peu_commune: 2, rare: 3, epique: 4 };

function pickCard(run: RunState): string | null {
  const options = [...run.rewardChoices].sort((a, b) => CARD_RANK[CARDS[b].rarity] - CARD_RANK[CARDS[a].rarity]);
  const best = options[0];
  if (!best) return null;
  if (run.deck.length >= 22 && CARDS[best].rarity === 'commune') return null;
  return best;
}

function handleReward(run: RunState): void {
  if (run.pendingItem) {
    const options = [run.pendingItem, ...run.pendingAlts];
    let done = false;
    for (let alt = 0; alt < options.length && !done; alt++) {
      const id = options[alt];
      for (const slot of slotsFor(id)) {
        const current = run.equipment[slot];
        if (!current || RARITY_RANK[ITEMS[id].rarity] > RARITY_RANK[ITEMS[current].rarity]) {
          equipPending(run, slot, alt === 0 ? undefined : alt - 1);
          done = true;
          break;
        }
      }
    }
    if (!done) leavePending(run);
  }
  if (run.pendingPotion) {
    if (!takePotion(run)) run.pendingPotion = null;
  }
  if (run.pendingSpell) {
    if (run.spells.length < barCapacity(run)) learnSpell(run);
    else run.pendingSpell = null;
  }
  chooseReward(run, pickCard(run));
}

function upgradeTarget(run: RunState): number | null {
  const pool = run.deck.filter((k) => !k.upgraded && !CARDS[k.id].unplayable)
    .sort((a, b) => (CARD_RANK[CARDS[b.id].rarity] ?? 0) - (CARD_RANK[CARDS[a.id].rarity] ?? 0));
  return pool[0]?.uid ?? null;
}

function handleShop(run: RunState): void {
  const shop = run.shop!;
  // Retirer une Malédiction ou une Frappe.
  const bad = run.deck.find((k) => k.id === 'malediction') ?? run.deck.find((k) => ['frappe', 'trait_de_magie', 'attaque_sinistre', 'frappe_pal'].includes(k.id));
  if (bad) buyRemoval(run, bad.uid);
  shop.cards.forEach((item, i) => {
    if (!item.sold && CARD_RANK[CARDS[item.id].rarity] >= 2 && run.gold - item.price >= 60) buyCard(run, i);
  });
  shop.potions.forEach((_, i) => { if (run.gold >= 120) buyPotion(run, i); });
  const up = upgradeTarget(run);
  if (up !== null) buyUpgrade(run, up);
  leaveShop(run);
}

const EVENT_CHOICE: Record<string, (run: RunState) => number> = {
  sources: () => 0,
  riviere: (r) => (r.hp > 30 ? 0 : 1),
  forge: () => 0,
  trappeur: (r) => (r.potions.some((x) => x) ? 0 : 1),
  cercle: (r) => (eventChoiceLock(r, 0) ? 1 : 0),
  chapelle: (r) => (r.classId === 'pretre' && !r.equinoxe ? 2 : 0),
  fantome: (r) => (r.equipment.arme && r.hp > 40 ? 0 : 2),
  gobelin: () => 0,
  fonceur: (r) => (r.hp > r.maxHp * 0.6 ? 0 : 1),
  source_chaude: () => 0,
  cadavre: (r) => (r.hp > 30 ? 0 : 1),
  // Acte 2
  oeufs: (r) => (r.hp > r.maxHp * 0.5 ? 0 : 1),
  observatoire: (r) => (eventChoiceLock(r, 0) ? 1 : 0),
  reliquaire: (r) => (r.classId === 'paladin' && !r.aurore ? 2 : eventChoiceLock(r, 0) ? 1 : 0),
  laboratoire: () => 1,
  dragonnet_cage: () => 0,
  cobayes: (r) => (r.gold >= 60 ? 1 : 2),
  autel: () => 0,
  fantome_raideur: (r) => (r.hp < r.maxHp * 0.6 ? 1 : 0),
  fonceur2: (r) => (r.hp > r.maxHp * 0.6 ? 0 : 1),
  ventor: () => 0,
};

const BLESSING_ORDER = ['pari', 'entrainement', 'provisions', 'potions', 'pret', 'bourse', 'allegement', 'marche'];

/** Un petit générateur aléatoire pour les choix de chemin (le jeu garde le sien). */
function chooser(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

function chooseNextNode(run: RunState, rnd: () => number): number {
  const options = reachable(run.map, run.position);
  const ratio = run.hp / run.maxHp;
  const score = (t: string) => {
    switch (t) {
      case 'campfire': return ratio < 0.5 ? 9 : 3;
      case 'elite': return ratio > 0.7 ? 6 : ratio > 0.5 ? 3 : 0;
      case 'shop': return run.gold >= 150 ? 6 : 2;
      case 'chest': return 7;
      case 'event': return 4;
      default: return ratio > 0.4 ? 5 : 2;
    }
  };
  return options.map((n) => ({ n, s: score(n.type) + rnd() * 2 })).sort((a, b) => b.s - a.s)[0].n.id;
}

export interface FightLog {
  name: string;
  kind: 'combat' | 'elite' | 'boss';
  floor: number;
  /** L'acte du combat (1 par défaut). */
  act?: number;
  /** PV à l'entrée du combat. */
  hpIn?: number;
  wipes: number;
  hpLost: number;
  won: boolean;
  /** À chaque wipe : PV restants des ennemis, tour atteint, et taille du deck. */
  deaths?: { enemyHp: number; turn: number; deck: number; maxHp: number; log?: string[] }[];
}

export interface RunResult {
  victory: boolean;
  floor: number;
  wipesUsed: number;
  fights: FightLog[];
}

/** Joue une run entière. */
/** `onBoss` : appelé à l'entrée de chaque boss de fin d'acte (pour copier la run à ce moment-là). */
export function simulateRun(seed: number, talents: string[], difficulty = 0, classId = 'guerrier', onBoss?: (run: RunState) => void): RunResult {
  const rnd = chooser(seed * 7919);
  const run = newRun(seed, null, talents, difficulty, classId);
  offerBlessing(run);
  const blessing = BLESSING_ORDER.find((b) => run.blessings.includes(b))!;
  if (blessing === 'allegement') chooseBlessing(run, blessing, run.deck.find((k) => ['frappe', 'trait_de_magie', 'attaque_sinistre', 'frappe_pal'].includes(k.id))!.uid);
  else chooseBlessing(run, blessing);
  const fights: FightLog[] = [];
  let current: FightLog | null = null;
  for (let step = 0; step < 3000; step++) {
    switch (run.screen) {
      case 'map': {
        chooseNode(run, chooseNextNode(run, rnd));
        if (run.screen === 'combat') {
          const node = run.map.nodes[run.position!];
          current = { name: run.encounter!.name, kind: node.type === 'elite' ? 'elite' : node.type === 'boss' ? 'boss' : 'combat', floor: node.floor + 1, act: run.act, wipes: 0, hpLost: run.hp, hpIn: run.hp, won: false };
          fights.push(current);
          if (node.type === 'boss') onBoss?.(run);
        }
        break;
      }
      case 'combat':
        if (current && current.name !== run.encounter!.name) {
          current = { name: run.encounter!.name, kind: 'combat', floor: (run.position !== null ? run.map.nodes[run.position].floor : 0) + 1, wipes: 0, hpLost: run.hp, won: false };
          fights.push(current);
        }
        playTurn(run);
        afterCombatAction(run);
        if (current && run.screen !== 'combat' && run.screen !== 'wipe' && run.screen !== 'gameover') {
          current.won = true;
          current.hpLost = current.hpLost - run.hp;
        }
        break;
      case 'wipe':
        if (current) {
          current.wipes++;
          const c = run.combat!;
          (current.deaths ??= []).push({ enemyHp: c.enemies.filter((e) => !e.dead).reduce((a, e) => a + e.hp, 0), turn: c.turn, deck: run.deck.length, maxHp: run.maxHp, log: c.log.slice(-14) });
        }
        retryAfterWipe(run);
        break;
      case 'reward': handleReward(run); break;
      case 'shop': handleShop(run); break;
      case 'campfire': {
        if (campfireReforge(run) || campfireEquinoxe(run) || campfireAurore(run)) break;
        if (canBindStaff(run)) {
          const rare = run.deck.find((k) => CARDS[k.id].rarity === 'rare');
          if (rare && campfireBindStaff(run, rare.uid)) break;
        }
        const up = upgradeTarget(run);
        if ((run.hp < run.maxHp * 0.7 || up === null) && canRest(run)) campfireRest(run);
        else if (up !== null) campfireUpgrade(run, up);
        else run.screen = 'map';
        break;
      }
      case 'act': startNextAct(run); break;
      case 'event': {
        if (run.eventOutcome) { leaveEvent(run); break; }
        const ev = EVENTS[run.eventId!];
        let choice = EVENT_CHOICE[ev.id]?.(run) ?? 0;
        if (eventChoiceLock(run, choice)) choice = ev.choices.findIndex((_, i) => !eventChoiceLock(run, i));
        resolveEvent(run, choice);
        if (run.screen === 'combat') {
          current = { name: run.encounter!.name, kind: 'combat', floor: run.map.nodes[run.position!].floor + 1, wipes: 0, hpLost: run.hp, won: false };
          fights.push(current);
        }
        break;
      }
      case 'blessing': chooseBlessing(run, run.blessings[0]); break;
      case 'victory':
      case 'gameover': {
        const floor = run.floorsDone + (run.position === null ? 0 : run.map.nodes[run.position].floor + 1);
        if (current && run.screen === 'gameover') current.wipes++;
        return { victory: run.screen === 'victory', floor, wipesUsed: run.maxWipes - run.wipesLeft, fights };
      }
    }
    // Une potion de soin entre deux combats si besoin.
    if (run.screen === 'map') run.potions.forEach((id, slot) => { if (id && canDrink(run, slot) && run.hp < run.maxHp * 0.5) drinkPotion(run, slot); });
  }
  return { victory: false, floor: 0, wipesUsed: 3 - run.wipesLeft, fights };
}
