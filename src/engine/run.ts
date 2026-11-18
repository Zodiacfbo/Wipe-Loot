// La run : la carte de l'acte, les combats, les récompenses, le feu de camp, les événements, les wipes.
import { CARDS, REWARD_POOL, STARTER_DECK } from './cards';
import { createCombat } from './combat';
import { BOSS_ENCOUNTER, EASY_ENCOUNTERS, ELITE_ENCOUNTERS, HARD_ENCOUNTERS, type Encounter } from './enemies';
import { AMBUSH, EVENTS } from './events';
import { generateMap, reachable } from './map';
import { random } from './rng';
import type { CardInstance, Rarity, RunState } from './types';

export const MAX_WIPES = 3;
export const SAVE_VERSION = 2;

export function newRun(seed: number = Date.now() % 2147483647): RunState {
  let uid = 1;
  const deck: CardInstance[] = STARTER_DECK.map((id) => ({ uid: uid++, id, upgraded: false }));
  const run: RunState = {
    version: 2, seed, rng: seed, maxHp: 80, hp: 80, deck, wipesLeft: MAX_WIPES, screen: 'map',
    map: { floors: 0, lanes: 0, nodes: [] }, position: null, path: [], encounter: null, combat: null, entry: null,
    rewardChoices: [], rewardTitle: '', eventId: null, nextUid: uid,
  };
  run.map = generateMap(run);
  return run;
}

export function currentNode(run: RunState) {
  return run.position === null ? null : run.map.nodes[run.position];
}

function pick<T>(run: RunState, list: T[]): T {
  return list[Math.floor(random(run) * list.length)];
}

// --- Déplacement sur la carte ---

export function chooseNode(run: RunState, nodeId: number): boolean {
  if (run.screen !== 'map') return false;
  if (!reachable(run.map, run.position).some((n) => n.id === nodeId)) return false;
  run.position = nodeId;
  run.path.push(nodeId);
  const node = run.map.nodes[nodeId];
  switch (node.type) {
    case 'combat':
      startEncounter(run, pick(run, node.floor <= 3 ? EASY_ENCOUNTERS : HARD_ENCOUNTERS));
      break;
    case 'elite':
      startEncounter(run, pick(run, ELITE_ENCOUNTERS));
      break;
    case 'boss':
      startEncounter(run, BOSS_ENCOUNTER);
      break;
    case 'campfire':
      run.screen = 'campfire';
      break;
    case 'chest':
      offerCards(run, 'Coffre', 'peu_commune');
      break;
    case 'event': {
      const roll = random(run);
      if (roll < 0.25) {
        startEncounter(run, { ...pick(run, node.floor <= 3 ? EASY_ENCOUNTERS : HARD_ENCOUNTERS), name: 'Embuscade !' });
        run.eventId = AMBUSH;
      } else {
        run.eventId = pick(run, Object.keys(EVENTS));
        run.screen = 'event';
      }
      break;
    }
  }
  return true;
}

function startEncounter(run: RunState, encounter: Encounter): void {
  run.encounter = encounter;
  run.entry = { hp: run.hp, deck: run.deck.map((c) => ({ ...c })) };
  run.combat = createCombat(encounter, run.deck, run.hp, run.maxHp, run.rng, run.nextUid);
  run.screen = 'combat';
}

function backToMap(run: RunState): void {
  run.combat = null;
  run.rewardChoices = [];
  run.eventId = null;
  run.screen = 'map';
}

// --- Fin de combat ---

/** À appeler après chaque action de combat : gère la victoire et la défaite. */
export function afterCombatAction(run: RunState): void {
  const c = run.combat;
  if (!c || run.screen !== 'combat') return;
  run.rng = c.rng;
  run.nextUid = c.nextUid;
  if (c.phase === 'victory') {
    run.hp = c.player.hp;
    if (currentNode(run)?.type === 'boss') {
      run.screen = 'victory';
      run.combat = null;
    } else {
      const elite = currentNode(run)?.type === 'elite';
      offerCards(run, 'Victoire !', elite ? 'peu_commune' : 'commune');
    }
  } else if (c.phase === 'defeat') {
    run.screen = run.wipesLeft > 0 ? 'wipe' : 'gameover';
  }
}

// --- Récompenses ---

function rollRarity(run: RunState, min: Rarity): Rarity {
  const roll = random(run);
  if (min === 'peu_commune') return roll < 0.7 ? 'peu_commune' : 'rare';
  return roll < 0.6 ? 'commune' : roll < 0.9 ? 'peu_commune' : 'rare';
}

function offerCards(run: RunState, title: string, min: Rarity): void {
  const choices: string[] = [];
  let guard = 0;
  while (choices.length < 3 && guard++ < 100) {
    const rarity = rollRarity(run, min);
    const pool = REWARD_POOL.filter((id) => CARDS[id].rarity === rarity && !choices.includes(id));
    if (pool.length === 0) continue;
    choices.push(pool[Math.floor(random(run) * pool.length)]);
  }
  run.rewardChoices = choices;
  run.rewardTitle = title;
  run.combat = null;
  run.screen = 'reward';
}

export function chooseReward(run: RunState, cardId: string | null): void {
  if (run.screen !== 'reward') return;
  if (cardId && run.rewardChoices.includes(cardId)) {
    run.deck.push({ uid: run.nextUid++, id: cardId, upgraded: false });
  }
  backToMap(run);
}

// --- Événements ---

export function resolveEvent(run: RunState, choice: number): void {
  if (run.screen !== 'event' || !run.eventId) return;
  const id = run.eventId;
  if (id === 'source' && choice === 0) {
    run.hp = Math.min(run.maxHp, run.hp + 15);
  }
  if (id === 'cadavre' && choice === 0) {
    run.hp = Math.max(1, run.hp - 6);
    offerCards(run, 'Le sac du raideur', 'commune');
    run.eventId = null;
    return;
  }
  backToMap(run);
}

// --- Wipe ---

export function retryAfterWipe(run: RunState): void {
  if (run.screen !== 'wipe' || !run.entry || !run.encounter || run.wipesLeft <= 0) return;
  run.wipesLeft -= 1;
  run.hp = Math.max(run.entry.hp, Math.ceil(run.maxHp * 0.5));
  run.deck = run.entry.deck.map((c) => ({ ...c }));
  startEncounter(run, run.encounter);
}

export function abandonRun(run: RunState): void {
  run.screen = 'gameover';
  run.combat = null;
}

// --- Feu de camp ---

export function campfireRest(run: RunState): void {
  if (run.screen !== 'campfire') return;
  run.hp = Math.min(run.maxHp, run.hp + Math.floor(run.maxHp * 0.3));
  backToMap(run);
}

export function campfireUpgrade(run: RunState, uid: number): void {
  if (run.screen !== 'campfire') return;
  const card = run.deck.find((c) => c.uid === uid);
  if (!card || card.upgraded) return;
  card.upgraded = true;
  backToMap(run);
}
