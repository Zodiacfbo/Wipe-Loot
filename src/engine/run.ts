// La run : la carte de l'acte, les combats, les récompenses, le feu de camp, les événements, les wipes.
import { CARDS, REWARD_POOL, STARTER_DECK } from './cards';
import { createCombat } from './combat';
import { BOSS_ENCOUNTER, EASY_ENCOUNTERS, ELITE_ENCOUNTERS, HARD_ENCOUNTERS, type Encounter } from './enemies';
import { AMBUSH, EVENTS } from './events';
import { COMMON_POOL, ITEMS, LOOT_TABLES, emptyEquipment, gearEffects, slotsFor, type SlotKey } from './items';
import { generateMap, reachable } from './map';
import { random } from './rng';
import type { CardInstance, Rarity, RunState, ShopCard } from './types';

export const MAX_WIPES = 3;
export const SAVE_VERSION = 4;
export const SERVICE_BASE_PRICE = 75;
export const SERVICE_PRICE_STEP = 25;

export function newRun(seed: number = Date.now() % 2147483647): RunState {
  let uid = 1;
  const deck: CardInstance[] = STARTER_DECK.map((id) => ({ uid: uid++, id, upgraded: false }));
  const run: RunState = {
    version: 4, seed, rng: seed, maxHp: 80, hp: 80, deck, wipesLeft: MAX_WIPES, gold: 99, rewardGold: 0,
    removals: 0, upgradesBought: 0, shop: null, equipment: emptyEquipment(), pendingItem: null, screen: 'map',
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
      startEncounter(run, ELITE_ENCOUNTERS[node.elite ?? Math.floor(random(run) * ELITE_ENCOUNTERS.length)]);
      break;
    case 'boss':
      startEncounter(run, BOSS_ENCOUNTER);
      break;
    case 'campfire':
      run.screen = 'campfire';
      break;
    case 'shop':
      openShop(run);
      break;
    case 'chest':
      run.rewardChoices = [];
      run.rewardTitle = 'Coffre';
      run.rewardGold = 0;
      run.pendingItem = rollItem(run);
      run.screen = 'reward';
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
  run.combat = createCombat(encounter, run.deck, run.hp, run.maxHp, run.rng, run.nextUid, gearEffects(run.equipment));
  run.screen = 'combat';
}

function backToMap(run: RunState): void {
  run.combat = null;
  run.shop = null;
  run.rewardGold = 0;
  run.pendingItem = null;
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
    run.hp = Math.min(run.maxHp, c.player.hp + (gearEffects(run.equipment).healAfterCombat ?? 0));
    if (currentNode(run)?.type === 'boss') {
      run.screen = 'victory';
      run.combat = null;
    } else {
      const elite = currentNode(run)?.type === 'elite';
      const gold = elite ? 25 + Math.floor(random(run) * 11) : 10 + Math.floor(random(run) * 11);
      run.gold += gold;
      offerCards(run, 'Victoire !', elite ? 'peu_commune' : 'commune');
      run.rewardGold = gold;
      const table = run.encounter?.loot ? LOOT_TABLES[run.encounter.loot] : null;
      if (table) run.pendingItem = table[Math.floor(random(run) * table.length)];
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
  run.rewardGold = 0;
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

// --- Vendeur gobelin ---

const PRICE_RANGE: Record<string, [number, number]> = {
  commune: [45, 55],
  peu_commune: [68, 82],
  rare: [135, 165],
};

export function servicePrice(count: number): number {
  return SERVICE_BASE_PRICE + SERVICE_PRICE_STEP * count;
}

function openShop(run: RunState): void {
  const rarities: Rarity[] = ['commune', 'commune', 'peu_commune', 'peu_commune', 'rare'];
  const cards: ShopCard[] = [];
  for (const rarity of rarities) {
    const pool = REWARD_POOL.filter((id) => CARDS[id].rarity === rarity && !cards.some((c) => c.id === id));
    if (pool.length === 0) continue;
    const id = pool[Math.floor(random(run) * pool.length)];
    const [min, max] = PRICE_RANGE[rarity];
    cards.push({ id, price: min + Math.floor(random(run) * (max - min + 1)), sold: false });
  }
  // La promo du jour : une carte à moitié prix.
  const promo = Math.floor(random(run) * cards.length);
  cards[promo].price = Math.floor(cards[promo].price / 2);
  const items: ShopCard[] = [];
  while (items.length < 2) {
    const id = rollItem(run);
    if (items.some((i) => i.id === id)) continue;
    const rare = ITEMS[id].rarity === 'rare';
    items.push({ id, price: rare ? 190 + Math.floor(random(run) * 41) : 120 + Math.floor(random(run) * 31), sold: false });
  }
  run.shop = { cards, items, removeUsed: false, upgradeUsed: false };
  run.screen = 'shop';
}

export function buyCard(run: RunState, index: number): boolean {
  const item = run.shop?.cards[index];
  if (run.screen !== 'shop' || !item || item.sold || run.gold < item.price) return false;
  run.gold -= item.price;
  item.sold = true;
  run.deck.push({ uid: run.nextUid++, id: item.id, upgraded: false });
  return true;
}

export function buyRemoval(run: RunState, uid: number): boolean {
  const price = servicePrice(run.removals);
  if (run.screen !== 'shop' || !run.shop || run.shop.removeUsed || run.gold < price) return false;
  const i = run.deck.findIndex((c) => c.uid === uid);
  if (i < 0) return false;
  run.deck.splice(i, 1);
  run.gold -= price;
  run.removals += 1;
  run.shop.removeUsed = true;
  return true;
}

export function buyUpgrade(run: RunState, uid: number): boolean {
  const price = servicePrice(run.upgradesBought);
  if (run.screen !== 'shop' || !run.shop || run.shop.upgradeUsed || run.gold < price) return false;
  const card = run.deck.find((c) => c.uid === uid);
  if (!card || card.upgraded) return false;
  card.upgraded = true;
  run.gold -= price;
  run.upgradesBought += 1;
  run.shop.upgradeUsed = true;
  return true;
}

export function leaveShop(run: RunState): void {
  if (run.screen === 'shop') backToMap(run);
}

export function buyItem(run: RunState, index: number, slot: SlotKey): boolean {
  const item = run.shop?.items[index];
  if (run.screen !== 'shop' || !item || item.sold || run.gold < item.price) return false;
  if (!slotsFor(item.id).includes(slot)) return false;
  run.gold -= item.price;
  item.sold = true;
  putOn(run, item.id, slot);
  return true;
}

// --- Équipement ---

/** Un objet au hasard parmi ceux des coffres et du vendeur (70 % communs, 30 % rares). */
function rollItem(run: RunState): string {
  const rarity = random(run) < 0.7 ? 'commun' : 'rare';
  const pool = COMMON_POOL.filter((id) => ITEMS[id].rarity === rarity);
  return pool[Math.floor(random(run) * pool.length)];
}

/** Équipe un objet dans un emplacement, en remplaçant l'ancien. Ajuste les PV max. */
function putOn(run: RunState, itemId: string, slot: SlotKey): void {
  const old = run.equipment[slot];
  if (old) {
    const lost = ITEMS[old].fx.maxHp ?? 0;
    run.maxHp -= lost;
    run.hp = Math.min(run.hp, run.maxHp);
  }
  run.equipment[slot] = itemId;
  const gained = ITEMS[itemId].fx.maxHp ?? 0;
  run.maxHp += gained;
  run.hp += gained;
}

/** Équipe l'objet trouvé (coffre ou butin de boss). */
export function equipPending(run: RunState, slot: SlotKey): boolean {
  const id = run.pendingItem;
  if (!id || !slotsFor(id).includes(slot)) return false;
  putOn(run, id, slot);
  run.pendingItem = null;
  return true;
}

/** Laisse l'objet trouvé. */
export function leavePending(run: RunState): void {
  run.pendingItem = null;
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
