// La run : la carte de l'acte, les combats, les récompenses, le feu de camp, les événements, les wipes.
import { CARDS, rewardPool } from './cards';
import { classInfo } from './classes';
import { createCombat } from './combat';
import { type Encounter } from './enemies';
import { LAST_ACT, actDef } from './acts';
import { BLESSINGS, EVENTS, HIDDEN_FIGHTS } from './events';
import { BOSS_LOOT, COMMON_POOL, ITEMS, uselessFor, LOOT_TABLES, REPAIR_PRICE, SLOT_KEYS, emptyEquipment, gearEffects, slotsFor, type ItemEffects, type SlotKey } from './items';
import { generateMap, reachable } from './map';
import { POTIONS, POTION_IDS, POTION_SLOTS, drinkInCombat } from './potions';
import { BAR_SLOTS, lootSpells } from './spells';
import { EPIC_CARDS, TALENTS, treesFor } from './talents';
import { difficultyMods } from './difficulty';
import { random } from './rng';
import type { CardInstance, Rarity, RunState, ShopCard } from './types';

export const MAX_WIPES = 3;
export const SAVE_VERSION = 22;
/** Les légendaires ne se forgent pas avant cet acte. */
export const LEGENDARY_MIN_ACT = 2;
/** La facture de réparation du 1er, 2e et 3e wipe. */
export const REPAIR_BILLS = [50, 100, 150];
/** Chance de trouver une potion après un combat gagné (hors boss de fin d'acte). */
export const POTION_DROP_CHANCE = 0.4;
export const SERVICE_BASE_PRICE = 75;
export const SERVICE_PRICE_STEP = 25;

/**
 * `heirloom` : l'objet emporté du coffre de la guilde, équipé dès le départ.
 * `talents` : les talents choisis avant la run (ids, voir talents.ts).
 * `classId` : la classe jouée (le Guerrier par défaut).
 * `legendary` : le légendaire de la classe emporté depuis le râtelier de la guilde (jamais perdu).
 *   Il prend l'emplacement d'Arme, et sa quête est déjà faite pour cette expédition.
 */
export function newRun(seed: number = Date.now() % 2147483647, heirloom: string | null = null, talents: string[] = [], difficulty = 0, classId = 'guerrier', legendary: string | null = null): RunState {
  const mods = difficultyMods(difficulty);
  const info = classInfo(classId);
  let uid = 1;
  const deck: CardInstance[] = (info.starterDeck ?? []).map((id) => ({ uid: uid++, id, upgraded: false }));
  const run: RunState = {
    version: 22, classId: info.id, seed, rng: seed, maxHp: info.hp, hp: info.hp, deck, wipesLeft: mods.wipes, gold: 99, rewardGold: 0, difficulty, maxWipes: mods.wipes, kills: {},
    removals: 0, upgradesBought: 0, shop: null, equipment: emptyEquipment(), pendingItem: null, pendingAlts: [], broken: [], heirloom, chestDone: false, chestDeposit: null,
    potions: Array.from({ length: POTION_SLOTS }, () => null), pendingPotion: null, spells: [info.startSpell ?? 'charge'], pendingSpell: null, screen: 'map',
    map: { floors: 0, lanes: 0, nodes: [] }, position: null, path: [], encounter: null, combat: null, entry: null,
    rewardChoices: [], rewardTitle: '', eventId: null, nextUid: uid,
    blessings: [], seenEvents: [], eventOutcome: null, sourcesQuest: null, brisemonts: null, questNote: null,
    weaponUpgrade: null, detour: false, act: 1, stats: { combats: 0, elites: 0 }, summary: null, talents: [],
    floorsDone: 0, bossStage: null, actBuffs: {}, eggsLeft: false, stargazing: 0, veilleur: null, shards: 0, pet: 'diablotin', equinoxe: null, sillon: null, tenebres: false, aurore: null,
  };
  run.map = mapFor(run, 1);
  applyTalents(run, talents);
  if (mods.startCurse) run.deck.push({ uid: run.nextUid++, id: 'malediction', upgraded: false });
  run.hp = Math.round(run.maxHp * mods.startHpRatio);
  if (heirloom && ITEMS[heirloom]) putOn(run, heirloom, slotsFor(heirloom)[0]);
  // Le légendaire du râtelier (si l'objet du coffre n'a pas déjà pris l'Arme : le hall l'empêche).
  if (legendary && ITEMS[legendary] && !run.equipment.arme) {
    putOn(run, legendary, 'arme');
    const quest = LEGENDARY_QUEST[run.classId];
    if (quest) run[quest] = 'forged';
  }
  return run;
}

/** L'état de la quête légendaire de chaque classe. */
export const LEGENDARY_QUEST = {
  guerrier: 'brisemonts', mage: 'veilleur', demoniste: 'veilleur', pretre: 'equinoxe', voleur: 'sillon', paladin: 'aurore',
} as Record<string, 'brisemonts' | 'veilleur' | 'equinoxe' | 'sillon' | 'aurore'>;

/** La carte d'un acte. */
function mapFor(run: RunState, act: number) {
  const def = actDef(act);
  return generateMap(run, difficultyMods(run.difficulty ?? 0).eliteWeight, { early: def.earlyNodes, late: def.lateNodes, elites: def.elites.length });
}

/** Le boss de fin d'acte est vaincu : sa table de loot, puis le butin de boss, puis l'acte suivant. */
function bossDefeated(run: RunState): void {
  const loot = BOSS_LOOT[run.act];
  run.bossStage = 'loot';
  offerCards(run, `${actDef(run.act).boss.name.split(',')[0]} est vaincu !`, 'rare');
  const gold = Math.round((70 + Math.floor(random(run) * 31)) * mods(run).goldMult);
  run.gold += gold;
  run.rewardGold = gold;
  // Sa table : 4 objets et un sort de barre de ta classe.
  const roll = Math.floor(random(run) * (loot.table.length + 1));
  const spells = lootSpells(run.classId).filter((id) => !run.spells.includes(id));
  if (roll === loot.table.length && spells.length > 0) run.pendingSpell = spells[Math.floor(random(run) * spells.length)];
  else run.pendingItem = loot.table[roll % loot.table.length];
}

/** Le butin de boss : un objet épique au choix parmi 3 (utile à ta classe). */
function offerEpics(run: RunState): void {
  const pool = BOSS_LOOT[run.act].epics.filter((id) => !uselessFor(id, run.classId));
  const picks: string[] = [];
  while (picks.length < 3 && picks.length < pool.length) {
    const id = pool[Math.floor(random(run) * pool.length)];
    if (!picks.includes(id)) picks.push(id);
  }
  run.rewardChoices = [];
  run.rewardTitle = 'Le butin de boss';
  run.rewardGold = 0;
  run.questNote = null;
  run.pendingItem = picks[0] ?? null;
  run.pendingAlts = picks.slice(1);
  run.bossStage = 'epic';
  run.screen = 'reward';
}

/** On entre dans l'acte suivant : nouvelle carte, PV au maximum, les bonus de l'acte précédent s'arrêtent. */
export function startNextAct(run: RunState): boolean {
  if (run.screen !== 'act' || run.act >= LAST_ACT) return false;
  run.floorsDone += run.path.length;
  run.act += 1;
  run.map = mapFor(run, run.act);
  run.position = null;
  run.path = [];
  run.hp = run.maxHp;
  run.actBuffs = {};
  run.detour = false;
  run.bossStage = null;
  run.screen = 'map';
  return true;
}

/** Les talents au début de la run : PV max, sorts de barre, carte épique dans le deck. */
function applyTalents(run: RunState, ids: string[]): void {
  run.talents = ids.filter((id) => TALENTS[id]);
  for (const id of run.talents) {
    const t = TALENTS[id];
    if (t.maxHp) {
      run.maxHp += t.maxHp;
      run.hp += t.maxHp;
    }
    if (t.spell && !run.spells.includes(t.spell)) run.spells.push(t.spell);
    if (t.card) run.deck.push({ uid: run.nextUid++, id: t.card, upgraded: false });
  }
}

/** La taille de la barre de sorts : 3, +1 avec Quatrième emplacement ; jamais moins que les sorts donnés par les talents. */
export function barCapacity(run: RunState): number {
  const bonus = run.talents.reduce((a, id) => a + (TALENTS[id]?.barSlots ?? 0), 0);
  const fromTalents = 1 + run.talents.filter((id) => TALENTS[id]?.spell).length;
  return Math.max(BAR_SLOTS + bonus, fromTalents);
}

/** Les effets de l'équipement porté, avec le renfort du Fantôme du forgeron. */
export function runGear(run: RunState): ItemEffects {
  const g = gearEffects(run.equipment, run.broken);
  // Les talents s'ajoutent aux effets de l'équipement.
  for (const id of run.talents ?? []) {
    for (const [k, v] of Object.entries(TALENTS[id]?.fx ?? {}) as [keyof ItemEffects, number][]) g[k] = (g[k] ?? 0) + v;
  }
  // Les bonus de l'acte en cours (Autel chromatique, sérum) et l'Observatoire.
  for (const [k, v] of Object.entries(run.actBuffs ?? {}) as [keyof ItemEffects, number][]) g[k] = (g[k] ?? 0) + v;
  if ((run.stargazing ?? 0) > 0) g.seeTwoIntents = 1;
  if (run.tenebres) g.longStealth = 1; // Ténèbres (Voleur)
  if (run.weaponUpgrade && run.equipment.arme === run.weaponUpgrade && !run.broken.includes('arme')) {
    // Le renfort profite aux Attaques du Guerrier, ou aux Sorts du Mage.
    if (run.classId === 'mage') g.spellBonus = (g.spellBonus ?? 0) + 2;
    else g.attackBonus = (g.attackBonus ?? 0) + 2;
  }
  return g;
}

/** Les contraintes de difficulté de la run. */
function mods(run: RunState) {
  return difficultyMods(run.difficulty ?? 0);
}

/** Ce que soigne le repos au feu de camp. */
export function campfireHealAmount(run: RunState): number {
  return Math.min(run.maxHp - run.hp, Math.floor(run.maxHp * mods(run).campfireHeal));
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
  // La rivière de lave : le détour mène droit dans un pack difficile.
  const act = actDef(run.act);
  if (run.detour && node.type !== 'boss') {
    run.detour = false;
    startEncounter(run, { ...pick(run, act.hard), name: 'Le détour' });
    return true;
  }
  switch (node.type) {
    case 'combat':
      startEncounter(run, pick(run, node.floor <= 3 ? act.easy : act.hard));
      break;
    case 'elite': {
      const enc = act.elites[(node.elite ?? Math.floor(random(run) * act.elites.length)) % act.elites.length];
      // Quête des Gardiens des Sources : le premier boss secondaire affronté porte la rune.
      if (run.sourcesQuest === 'active') {
        run.sourcesQuest = 'rune';
        startEncounter(run, { ...enc, rune: true });
      } else {
        startEncounter(run, enc);
      }
      break;
    }
    case 'boss':
      if (run.act === 1 && run.sourcesQuest === 'done') startEncounter(run, { ...act.boss, weakened: true });
      else if (run.act === 2 && run.eggsLeft) startEncounter(run, { ...act.boss, extraAdds: 1 });
      else startEncounter(run, act.boss);
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
      // Trousseau de l'intendant : deux objets au choix.
      if (runGear(run).chestChoice) run.pendingAlts = [rollOther(run, [run.pendingItem])];
      run.screen = 'reward';
      break;
    case 'event': {
      // Un « ? » cache parfois un combat.
      const pool = Object.values(EVENTS).filter((e) => (e.act ?? 1) === run.act && !run.seenEvents.includes(e.id) && (e.available?.(run) ?? true));
      // Un événement de quête légendaire passe en premier (Ventor).
      const quest = pool.find((e) => (typeof e.quest === 'function' ? e.quest(run) : e.quest));
      if (quest) {
        run.eventId = quest.id;
        run.seenEvents.push(quest.id);
        run.eventOutcome = null;
        run.screen = 'event';
      } else if (random(run) < 0.2 || pool.length === 0) {
        startEncounter(run, pick(run, act.hidden ?? HIDDEN_FIGHTS));
      } else {
        const ev = pick(run, pool);
        run.eventId = ev.id;
        run.seenEvents.push(ev.id);
        run.eventOutcome = null;
        run.screen = 'event';
      }
      break;
    }
  }
  return true;
}

export function startEncounter(run: RunState, encounter: Encounter): void {
  run.encounter = encounter;
  run.entry = { hp: run.hp, deck: run.deck.map((c) => ({ ...c })), potions: [...run.potions] };
  run.combat = createCombat(encounter, run.deck, run.hp, run.maxHp, run.rng, run.nextUid, runGear(run), run.spells, difficultyMods(run.difficulty ?? 0), run.classId, { shards: run.shards ?? 0, pet: run.pet ?? 'diablotin' });
  run.screen = 'combat';
}

function backToMap(run: RunState): void {
  // Après le boss de fin d'acte : le butin de boss, puis l'entrée dans l'acte suivant.
  if (run.bossStage === 'loot') {
    run.combat = null;
    run.pendingPotion = null;
    run.pendingSpell = null;
    offerEpics(run);
    return;
  }
  if (run.bossStage === 'epic') {
    run.pendingItem = null;
    run.pendingAlts = [];
    run.rewardChoices = [];
    run.bossStage = null;
    run.screen = 'act';
    return;
  }
  run.combat = null;
  run.shop = null;
  run.rewardGold = 0;
  run.pendingItem = null;
  run.pendingAlts = [];
  run.pendingPotion = null;
  run.pendingSpell = null;
  run.questNote = null;
  run.rewardChoices = [];
  run.eventId = null;
  run.eventOutcome = null;
  run.screen = 'map';
}

// --- Fin de combat ---

/** À appeler après chaque action de combat : gère la victoire et la défaite. */
export function afterCombatAction(run: RunState): void {
  const c = run.combat;
  if (!c || run.screen !== 'combat') return;
  run.rng = c.rng;
  run.nextUid = c.nextUid;
  // Démoniste : les éclats d'âme se gardent d'un combat à l'autre ; les Pierres de vie vont dans la ceinture.
  if (c.shards !== undefined) run.shards = c.shards;
  if (c.pet === 'diablotin' || c.pet === 'rodeur') run.pet = c.pet;
  for (const id of c.newPotions ?? []) {
    const slot = run.potions.findIndex((p) => !p);
    if (slot >= 0) run.potions[slot] = id;
  }
  c.newPotions = [];
  // Voleur : Ténèbres reste active jusqu'à la fin de la run.
  if (c.tenebres) run.tenebres = true;
  // Prêtre : Bénédiction de vigueur (PV max pour toute la run).
  if (c.maxHpGain) {
    run.maxHp += c.maxHpGain;
    run.hp += c.maxHpGain;
    c.maxHpGain = 0;
  }
  if (c.phase === 'victory' || c.phase === 'defeat') {
    // Le Gobelin mimique a avalé de l'or.
    run.gold = Math.max(0, run.gold - (c.goldStolen ?? 0));
    c.goldStolen = 0;
  }
  if (c.phase === 'victory') {
    run.hp = Math.min(run.maxHp, c.player.hp + (runGear(run).healAfterCombat ?? 0));
    // Archives : les monstres vaincus.
    for (const e of c.enemies) if (e.dead && !e.gone) run.kills[e.defId] = (run.kills[e.defId] ?? 0) + 1;
    // Un boss secondaire (sa rencontre a une table de loot ; l'outil de test en lance hors de la carte).
    const eliteFight = currentNode(run)?.type === 'elite' || !!run.encounter?.loot;
    if (eliteFight) run.stats.elites += 1;
    else run.stats.combats += 1;
    // L'Observatoire : un combat de moins à voir les intentions. La fiole du laboratoire ne dure qu'un combat.
    if ((run.stargazing ?? 0) > 0) run.stargazing -= 1;
    delete run.actBuffs.startToxine;
    if (currentNode(run)?.type === 'boss') {
      if (run.act < LAST_ACT) {
        bossDefeated(run);
      } else {
        run.screen = 'victory';
        run.combat = null;
      }
    } else {
      const elite = eliteFight;
      const gold = Math.round((elite ? 25 + Math.floor(random(run) * 11) : 10 + Math.floor(random(run) * 11)) * mods(run).goldMult);
      run.gold += gold;
      offerCards(run, 'Victoire !', elite ? 'peu_commune' : 'commune');
      run.rewardGold = gold;
      const table = run.encounter?.loot ? LOOT_TABLES[run.encounter.loot] : null;
      if (table) {
        // 5 entrées : les 4 objets du boss, et un sort de barre de ta classe.
        const roll = Math.floor(random(run) * (table.length + 1));
        const spells = lootSpells(run.classId).filter((id) => !run.spells.includes(id));
        if (roll === table.length && spells.length > 0) run.pendingSpell = spells[Math.floor(random(run) * spells.length)];
        else run.pendingItem = table[roll % table.length];
      }
      if (random(run) < mods(run).potionChance) run.pendingPotion = rollPotion(run);
      const enc = run.encounter;
      if (enc?.goldReward) {
        const [min, max] = enc.goldReward;
        const extra = Math.round((min + Math.floor(random(run) * (max - min + 1))) * mods(run).goldMult);
        run.gold += extra;
        run.rewardGold += extra;
      }
      if (enc?.bonusItem && !run.pendingItem) run.pendingItem = rollItem(run, enc.bonusItem);
      // Quêtes
      if (enc?.rune && run.sourcesQuest === 'rune') {
        run.sourcesQuest = 'done';
        run.questNote = 'Eau des profondeurs : les Gardiens des Sources sont libres. Vulkhar commencera le combat affaibli.';
      }
      if (enc?.loot === 'ysolde' && run.classId === 'pretre' && run.equinoxe === 'baton') {
        run.equinoxe = 'larme';
        run.questNote = 'Larme d\'Ysolde : libérée, la dragonne laisse une pierre qui contient la lumière et l\'ombre. Au prochain feu de camp, tu pourras forger Équinoxe.';
      }
      // L'Aurore ardente (Paladin) : la mort d'Ossyrax purifie la Lame ternie.
      if (enc?.loot === 'ossyrax' && run.classId === 'paladin' && run.aurore === 'lame') {
        run.aurore = 'purifiee';
        run.questNote = 'La Lame ternie : quand Ossyrax s\'effondre pour de bon, la nécromancie quitte la lame, qui se met à luire. Au prochain feu de camp, tu pourras rallumer l\'Aurore ardente.';
      }
      if (enc?.loot === 'zhaal' && (run.classId === 'mage' || run.classId === 'demoniste') && !run.veilleur) {
        run.veilleur = 'fragment';
        run.questNote = 'Fragment du Veilleur : un éclat du bâton du premier gardien des arcanes. L\'esprit du Veilleur t\'attend dans un observatoire en ruine, à l\'acte 2.';
      }
      // Sillon d'orage (Voleur) : les deux Fermoirs de l'orage, sur Gorlok et sur le Baron Vossk.
      if ((enc?.loot === 'gorlok' || enc?.loot === 'vossk') && run.classId === 'voleur' && run.sillon !== 'deux' && run.sillon !== 'forged') {
        const side = enc.loot === 'gorlok' ? 'gauche' : 'droit';
        if (run.sillon !== side) {
          run.sillon = run.sillon ? 'deux' : side;
          run.questNote = run.sillon === 'deux'
            ? `Fermoir ${side} de l'orage : les deux fermoirs sont réunis. Ventor, le Prince des tempêtes, t'attend derrière un « ? » de l'acte ${LEGENDARY_MIN_ACT}.`
            : `Fermoir ${side} de l'orage : il en manque un, gardé par ${side === 'gauche' ? 'le Baron Vossk' : 'Gorlok le Fragmenté'}.`;
        }
      }
      if (enc?.loot === 'kragg' && run.brisemonts === 'lame') {
        run.brisemonts = 'coeur';
        run.questNote = `Cœur de la montagne : la pierre en fusion de Krâgg. Au premier feu de camp de l'acte ${LEGENDARY_MIN_ACT}, tu pourras reforger Brisemonts.`;
      }
    }
  } else if (c.phase === 'defeat') {
    run.screen = run.wipesLeft > 0 ? 'wipe' : 'gameover';
  }
}

// --- Récompenses ---

function rollRarity(run: RunState, min: Rarity): Rarity {
  const roll = random(run);
  // Boss secondaire : cartes peu communes et rares ; les épiques (normalement débloquées
  // par le dernier palier de talent) y apparaissent rarement, en attendant les talents.
  if (min === 'rare') return roll < 0.85 ? 'rare' : 'epique';
  if (min === 'peu_commune') return roll < 0.65 ? 'peu_commune' : roll < 0.92 ? 'rare' : 'epique';
  return roll < 0.6 ? 'commune' : roll < 0.9 ? 'peu_commune' : 'rare';
}

/** Une carte épique n'apparaît que si le palier 5 de son arbre est pris. */
function cardUnlocked(run: RunState, id: string): boolean {
  return !EPIC_CARDS.has(id) || run.talents.some((t) => TALENTS[t]?.card === id);
}

/** Les récompenses penchent vers les arbres où l'on a mis des points. */
function weightedCard(run: RunState, pool: string[]): string {
  const points = (id: string) => {
    const tree = treesFor(run.classId).find((t) => t.cards.includes(id));
    return tree ? run.talents.filter((t) => tree.tiers.flat().some((d) => d.id === t)).length : 0;
  };
  const weights = pool.map((id) => 1 + 0.5 * points(id));
  let r = random(run) * weights.reduce((a, b) => a + b, 0);
  for (let i = 0; i < pool.length; i++) {
    r -= weights[i];
    if (r <= 0) return pool[i];
  }
  return pool[pool.length - 1];
}

function offerCards(run: RunState, title: string, min: Rarity): void {
  const choices: string[] = [];
  let guard = 0;
  // Couronne de cendres : une carte de moins.
  const count = 3 - (runGear(run).fewerCards ?? 0);
  while (choices.length < count && guard++ < 100) {
    const rarity = rollRarity(run, min);
    const pool = rewardPool(run.classId).filter((id) => CARDS[id].rarity === rarity && !choices.includes(id) && cardUnlocked(run, id));
    if (pool.length === 0) continue;
    choices.push(weightedCard(run, pool));
  }
  run.rewardChoices = choices;
  run.rewardTitle = title;
  run.rewardGold = 0;
  run.questNote = null;
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
    const pool = rewardPool(run.classId).filter((id) => CARDS[id].rarity === rarity && !cards.some((c) => c.id === id));
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
  const potions: ShopCard[] = [];
  while (potions.length < 3) {
    const id = rollPotion(run);
    if (potions.some((p) => p.id === id)) continue;
    const rare = POTIONS[id].rarity === 'rare';
    potions.push({ id, price: rare ? 80 + Math.floor(random(run) * 21) : 50 + Math.floor(random(run) * 16), sold: false });
  }
  // Difficulté : le vendeur est plus cher.
  const m = mods(run).shopMult;
  if (m !== 1) for (const it of [...cards, ...items, ...potions]) it.price = Math.round(it.price * m);
  run.shop = { cards, items, potions, removeUsed: false, upgradeUsed: false };
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
function rollItem(run: RunState, forced?: 'commun' | 'rare'): string {
  const rarity = forced ?? (random(run) < 0.7 ? 'commun' : 'rare');
  // Les coffres et le vendeur ne proposent que des objets utiles à la classe.
  const pool = COMMON_POOL.filter((id) => ITEMS[id].rarity === rarity && !uselessFor(id, run.classId));
  return pool[Math.floor(random(run) * pool.length)];
}

/** Un objet différent de ceux de `not`. */
function rollOther(run: RunState, not: (string | null)[], forced?: 'commun' | 'rare'): string {
  let id = rollItem(run, forced);
  for (let i = 0; i < 30 && not.includes(id); i++) id = rollItem(run, forced);
  return id;
}

/** Ajuste le nombre d'emplacements de potion à l'équipement (Amulette de l'intendant). */
export function syncPotionSlots(run: RunState): void {
  const wanted = POTION_SLOTS + (runGear(run).potionSlots ?? 0);
  while (run.potions.length < wanted) run.potions.push(null);
  while (run.potions.length > wanted) {
    // On retire d'abord un emplacement vide ; sinon la dernière potion est perdue.
    const empty = run.potions.lastIndexOf(null);
    run.potions.splice(empty >= 0 ? empty : run.potions.length - 1, 1);
  }
}

/** Équipe un objet dans un emplacement, en remplaçant l'ancien. Ajuste les PV max. */
function putOn(run: RunState, itemId: string, slot: SlotKey): void {
  const old = run.equipment[slot];
  if (run.broken.includes(slot)) {
    // L'ancien objet était brisé : son bonus de PV max était déjà retiré.
    run.broken = run.broken.filter((k) => k !== slot);
  } else if (old) {
    const lost = ITEMS[old].fx.maxHp ?? 0;
    run.maxHp -= lost;
    run.hp = Math.min(run.hp, run.maxHp);
  }
  run.equipment[slot] = itemId;
  const gained = ITEMS[itemId].fx.maxHp ?? 0;
  run.maxHp += gained;
  run.hp += gained;
  syncPotionSlots(run);
}

/** Équipe l'objet trouvé (coffre ou butin de boss). */
/** `alt` : l'index de l'objet choisi parmi les autres propositions (Trousseau, Pari risqué). */
export function equipPending(run: RunState, slot: SlotKey, alt?: number): boolean {
  const id = alt === undefined ? run.pendingItem : run.pendingAlts[alt];
  if (!id || !slotsFor(id).includes(slot)) return false;
  putOn(run, id, slot);
  run.pendingItem = null;
  run.pendingAlts = [];
  return true;
}

/** Laisse l'objet trouvé. */
export function leavePending(run: RunState): void {
  run.pendingItem = null;
  run.pendingAlts = [];
}

/** Répare un objet brisé chez le vendeur. */
export function repairItem(run: RunState, slot: SlotKey): boolean {
  const id = run.equipment[slot];
  if (run.screen !== 'shop' || !id || !run.broken.includes(slot)) return false;
  const price = REPAIR_PRICE[ITEMS[id].rarity];
  if (run.gold < price) return false;
  run.gold -= price;
  run.broken = run.broken.filter((k) => k !== slot);
  const gained = ITEMS[id].fx.maxHp ?? 0;
  run.maxHp += gained;
  run.hp += gained;
  syncPotionSlots(run);
  return true;
}

// --- Sorts de barre ---

/** Ajoute le sort trouvé à la barre : dans un emplacement libre, ou à la place du sort `replace`. */
export function learnSpell(run: RunState, replace?: number): boolean {
  const id = run.pendingSpell;
  if (!id) return false;
  if (replace === undefined) {
    if (run.spells.length >= barCapacity(run)) return false;
    run.spells.push(id);
  } else {
    if (!run.spells[replace]) return false;
    run.spells[replace] = id;
  }
  run.pendingSpell = null;
  return true;
}

// --- Potions ---

/** Une potion au hasard (75 % communes, 25 % rares). */
function rollPotion(run: RunState): string {
  const rarity = random(run) < 0.75 ? 'commun' : 'rare';
  const pool = POTION_IDS.filter((id) => POTIONS[id].rarity === rarity && !POTIONS[id].noDrop);
  return pool[Math.floor(random(run) * pool.length)];
}

function freePotionSlot(run: RunState): number {
  return run.potions.indexOf(null);
}

/** Peut-on boire cette potion maintenant ? En combat pendant son tour, ou hors combat pour un soin. */
export function canDrink(run: RunState, slot: number): boolean {
  const id = run.potions[slot];
  if (!id) return false;
  if (run.screen === 'combat') return run.combat?.phase === 'player';
  return !!POTIONS[id].heal && run.screen !== 'gameover' && run.screen !== 'victory' && run.hp < run.maxHp;
}

export function drinkPotion(run: RunState, slot: number): boolean {
  if (!canDrink(run, slot)) return false;
  const id = run.potions[slot]!;
  run.potions[slot] = null;
  if (run.screen === 'combat' && run.combat) {
    drinkInCombat(run.combat, id);
  } else {
    run.hp = Math.min(run.maxHp, run.hp + (POTIONS[id].heal ?? 0));
  }
  return true;
}

export function discardPotion(run: RunState, slot: number): void {
  if (run.screen === 'combat' && run.combat?.phase !== 'player') return;
  run.potions[slot] = null;
}

/** Prend la potion trouvée : dans un emplacement libre, ou à la place de celle de `slot`. */
export function takePotion(run: RunState, slot?: number): boolean {
  const id = run.pendingPotion;
  if (!id) return false;
  const target = slot ?? freePotionSlot(run);
  if (target < 0 || target >= run.potions.length) return false;
  run.potions[target] = id;
  run.pendingPotion = null;
  return true;
}

export function buyPotion(run: RunState, index: number): boolean {
  const item = run.shop?.potions[index];
  if (run.screen !== 'shop' || !item || item.sold || run.gold < item.price) return false;
  const slot = freePotionSlot(run);
  if (slot < 0) return false;
  run.gold -= item.price;
  item.sold = true;
  run.potions[slot] = item.id;
  return true;
}

// --- Événements ---

/** Un choix d'événement est-il possible ? (null : oui ; sinon la raison) */
export function eventChoiceLock(run: RunState, choice: number): string | null {
  const ev = run.eventId ? EVENTS[run.eventId] : null;
  return ev?.choices[choice]?.locked?.(run) ?? null;
}

function addCurse(run: RunState): void {
  run.deck.push({ uid: run.nextUid++, id: 'malediction', upgraded: false });
}

function upgradeRandom(run: RunState, count: number): string[] {
  const names: string[] = [];
  for (let i = 0; i < count; i++) {
    const pool = run.deck.filter((c) => !c.upgraded && !CARDS[c.id].unplayable);
    if (pool.length === 0) break;
    const card = pick(run, pool);
    card.upgraded = true;
    names.push(CARDS[card.id].name);
  }
  return names;
}

/** Affiche le résultat d'un événement avant de revenir à la carte. */
function outcome(run: RunState, text: string): void {
  run.eventOutcome = text;
}

export function resolveEvent(run: RunState, choice: number): void {
  if (run.screen !== 'event' || !run.eventId || run.eventOutcome) return;
  const ev = EVENTS[run.eventId];
  if (!ev?.choices[choice] || eventChoiceLock(run, choice)) return;
  const heal = (n: number) => { const before = run.hp; run.hp = Math.min(run.maxHp, run.hp + n); return run.hp - before; };
  const hurt = (n: number) => { run.hp = Math.max(1, run.hp - n); };

  switch (`${ev.id}:${choice}`) {
    case 'sources:0':
      run.sourcesQuest = 'active';
      return outcome(run, 'Les Gardiens tracent une rune d\'eau sur ta lame. Le prochain boss secondaire que tu affronteras portera la rune qui les enchaîne.');
    case 'sources:1':
      run.sourcesQuest = 'refused';
      return outcome(run, `Ils t'aspergent d'une eau fraîche. Tu récupères ${heal(10)} PV.`);
    case 'riviere:0':
      hurt(8);
      return outcome(run, 'Tu traverses en serrant les dents. Tu perds 8 PV.');
    case 'riviere:1':
      run.detour = true;
      return outcome(run, 'Le détour longe un nid de créatures de feu. Le prochain nœud sera un combat difficile.');
    case 'forge:0':
      run.brisemonts = 'lame';
      return outcome(run, 'Tu emportes la Lame brisée de Brisemonts. Pour la reforger, il te faut le Cœur de la montagne… que garde Krâgg le Mange-roche.');
    case 'forge:1': {
      hurt(6);
      const up = upgradeRandom(run, 2);
      return outcome(run, `Tu rallumes la forge et tu y passes un moment. Tu perds 6 PV. Cartes améliorées : ${up.join(', ') || 'aucune'}.`);
    }
    case 'forge:2':
      run.gold += 40;
      return outcome(run, 'Sous les gravats, une bourse oubliée : 40 or.');
    case 'trappeur:0': {
      const i = run.potions.findIndex((p) => p);
      if (i >= 0) run.potions[i] = null;
      run.maxHp += 6;
      run.hp += 6;
      return outcome(run, '« Merci, l\'ami. » Il te montre comment tenir dans le froid comme dans le feu. +6 PV max.');
    }
    case 'cercle:0': {
      const i = run.deck.findIndex((c) => c.id === 'malediction');
      if (i >= 0) run.deck.splice(i, 1);
      return outcome(run, 'Les esprits murmurent, et le poids qui t\'accablait se dissipe. Une Malédiction quitte ton deck.');
    }
    case 'cercle:1':
      return outcome(run, `Le silence des pierres t'apaise. Tu récupères ${heal(10)} PV.`);
    case 'chapelle:0':
      run.maxHp += 5;
      run.hp += 5;
      return outcome(run, 'Une chaleur douce t\'envahit. +5 PV max.');
    case 'chapelle:2':
      run.equinoxe = 'baton';
      return outcome(run, 'Sous les pierres de l\'autel, un bâton sans pierre, tiède sous les doigts : le Bâton nu. Il lui manque une pierre qui contient la lumière et l\'ombre… On dit qu\'une dragonne rouge, enchaînée dans l\'Aire de Vhaeryx, en garde une.');
    case 'chapelle:1':
      run.gold += 80;
      addCurse(run);
      return outcome(run, 'Tu remplis ta bourse : 80 or. Mais une ombre te suit désormais : une Malédiction rejoint ton deck.');
    case 'fantome:0':
      hurt(10);
      run.weaponUpgrade = run.equipment.arme;
      return outcome(run, `Le forgeron guide tes mains. Tu perds 10 PV, mais ${ITEMS[run.equipment.arme!].name} inflige +2 dégâts pour le reste de la run.`);
    case 'gobelin:0':
      if (random(run) < 0.5) {
        backToMap(run);
        run.rewardChoices = [];
        run.rewardTitle = 'Le gobelin reconnaissant';
        run.rewardGold = 0;
        run.pendingItem = rollItem(run);
        run.screen = 'reward';
        return;
      }
      run.eventId = null;
      startEncounter(run, HIDDEN_FIGHTS.find((f) => f.enemies[0] === 'mimique')!);
      return;
    case 'gobelin:1':
      run.gold += 120;
      addCurse(run);
      return outcome(run, 'Tu repars avec le coffre sous le bras : 120 or. Les jurons du gobelin te suivent : une Malédiction rejoint ton deck.');
    case 'fonceur:0':
      run.eventId = null;
      startEncounter(run, { ...pick(run, actDef(run.act).hard), name: 'Le joueur qui fonce', bonusItem: 'rare' });
      return;
    case 'source_chaude:0':
      return outcome(run, `L'eau brûlante te revigore. Tu récupères ${heal(15)} PV.`);
    case 'cadavre:0':
      hurt(6);
      run.eventId = null;
      offerCards(run, 'Le sac du raideur', 'commune');
      return;
    // --- Acte 2 ---
    case 'oeufs:0':
      run.eventId = null;
      startEncounter(run, { kind: 'combat', name: 'Les œufs de dragon', enemies: ['dragonnet', 'dragonnet', 'dragonnet', 'dragonnet'], bonusItem: 'commun' });
      return;
    case 'oeufs:1':
      run.eggsLeft = true;
      return outcome(run, 'Tu refermes doucement la porte. Derrière toi, une coquille craque.');
    case 'ventor:0':
      putOn(run, 'sillon_orage', 'arme');
      run.sillon = 'forged';
      return outcome(run, 'Tu brises les chaînes avec les deux fermoirs. Ventor se redresse, la foudre aux poings, et scelle l\'orage dans une lame : Sillon d\'orage. « Garde-la bien, petit voleur. Je viendrai la reprendre. »');
    case 'ventor:1':
      run.gold += 75;
      return outcome(run, 'Tu revends les fermoirs à un marchand peu regardant : 75 or. Au loin, le tonnerre gronde.');
    case 'observatoire:0':
      run.maxHp = Math.max(1, run.maxHp - 8);
      run.hp = Math.min(run.hp, run.maxHp);
      run.veilleur = 'tete';
      return outcome(run, '« Tu as su renoncer. C\'est le premier pas de la sagesse. » Le Veilleur te confie la Tête du bâton. Au prochain feu de camp, tu pourras lier les fragments. −8 PV max.');
    case 'observatoire:1':
      run.stargazing = 3;
      return outcome(run, 'Les étoiles s\'alignent. Pendant les 3 prochains combats, tu verras venir les coups de tes ennemis.');
    case 'observatoire:2':
      run.gold += 60;
      return outcome(run, 'Dans un tiroir du bureau de l\'astronome : 60 or.');
    case 'reliquaire:0': {
      const i = run.deck.findIndex((c) => c.id === 'malediction');
      if (i >= 0) run.deck.splice(i, 1);
      return outcome(run, 'Tu rends les reliques à leurs autels. Une Malédiction quitte ton deck.');
    }
    case 'reliquaire:2':
      run.aurore = 'lame';
      return outcome(run, 'Au fond de la crypte, une épée dort sur un autel brisé, noircie par la nécromancie : la Lame ternie des Veilleurs de l\'Aurore. Elle frémit dans ta main. Pour la purifier, il faudra abattre le mort-vivant qui l\'a souillée : Ossyrax, le Drake ressuscité.');
    case 'reliquaire:1':
      run.gold += 100;
      addCurse(run);
      return outcome(run, 'Tu remplis ton sac : 100 or. Les prières oubliées te maudissent : une Malédiction rejoint ton deck.');
    case 'laboratoire:0': {
      const roll = Math.floor(random(run) * 4);
      if (roll === 0) {
        run.maxHp += 6;
        run.hp += 6;
        return outcome(run, 'Une chaleur agréable : +6 PV max.');
      }
      if (roll === 1) return outcome(run, `Ton esprit s'éclaircit. Carte améliorée : ${upgradeRandom(run, 1).join(', ') || 'aucune'}.`);
      if (roll === 2) {
        hurt(8);
        return outcome(run, 'Ça brûle ! Tu perds 8 PV.');
      }
      run.actBuffs.startToxine = 3;
      return outcome(run, 'Un goût de métal… Tu auras la Toxine au début de ton prochain combat.');
    }
    case 'laboratoire:1': {
      let got = 0;
      for (let i = 0; i < 2; i++) {
        const slot = run.potions.findIndex((p) => !p);
        if (slot < 0) break;
        run.potions[slot] = rollPotion(run);
        got++;
      }
      return outcome(run, got > 0 ? `Tu glisses ${got} fiole${got > 1 ? 's' : ''} dans ta ceinture.` : 'Ta ceinture est pleine : tu ne peux rien emporter.');
    }
    case 'dragonnet_cage:0':
      backToMap(run);
      run.rewardChoices = [];
      run.rewardTitle = 'Le dragonnet libéré';
      run.rewardGold = 0;
      run.pendingItem = 'dragonnet_compagnie';
      run.screen = 'reward';
      return;
    case 'dragonnet_cage:1':
      run.gold += 90;
      return outcome(run, 'Le gobelin repart avec la cage sous le bras. Tu as 90 or, et un pincement au cœur.');
    case 'cobayes:0':
      run.maxHp = Math.max(1, run.maxHp - 6);
      run.hp = Math.min(run.hp, run.maxHp);
      run.gold += 100;
      return outcome(run, 'Le gobelin remplit ses fioles avec un sourire gourmand. −6 PV max, +100 or.');
    case 'cobayes:1':
      run.gold -= 60;
      run.actBuffs.startPuissance = (run.actBuffs.startPuissance ?? 0) + 1;
      return outcome(run, 'Le sérum pique. Jusqu\'à la fin de l\'acte, tu commences chaque combat avec 1 Puissance.');
    case 'autel:0':
      run.actBuffs.startPuissance = (run.actBuffs.startPuissance ?? 0) + 1;
      run.maxHp = Math.max(1, run.maxHp - 5);
      run.hp = Math.min(run.hp, run.maxHp);
      return outcome(run, 'Le sang rouge te brûle les veines. +1 Puissance au début de chaque combat de l\'acte, −5 PV max.');
    case 'autel:1':
      run.actBuffs.firstTurnDraw = (run.actBuffs.firstTurnDraw ?? 0) + 1;
      run.actBuffs.potionSlots = (run.actBuffs.potionSlots ?? 0) - 1;
      syncPotionSlots(run);
      return outcome(run, 'Le sang bleu t\'éclaircit l\'esprit. Pioche 1 carte de plus au premier tour, mais un emplacement de potion de moins, jusqu\'à la fin de l\'acte.');
    case 'autel:2':
      run.actBuffs.healAfterCombat = (run.actBuffs.healAfterCombat ?? 0) + 3;
      return outcome(run, 'Le sang vert apaise tes blessures : 3 PV après chaque combat gagné, jusqu\'à la fin de l\'acte.');
    case 'autel:3':
      run.actBuffs.attackBonus = (run.actBuffs.attackBonus ?? 0) + 2;
      run.actBuffs.spellBonus = (run.actBuffs.spellBonus ?? 0) + 2;
      run.actBuffs.extraHurt = (run.actBuffs.extraHurt ?? 0) + 2;
      return outcome(run, 'Le sang noir te rend féroce : +2 dégâts, mais tu subis 2 dégâts de plus par attaque, jusqu\'à la fin de l\'acte.');
    case 'fantome_raideur:0':
      addCurse(run);
      backToMap(run);
      run.rewardChoices = [];
      run.rewardTitle = 'L\'équipement du raideur';
      run.rewardGold = 0;
      run.pendingItem = rollItem(run);
      run.screen = 'reward';
      return;
    case 'fantome_raideur:1':
      return outcome(run, `Le fantôme s'apaise et disparaît. Tu récupères ${heal(12)} PV.`);
    case 'fonceur2:0':
      run.eventId = null;
      startEncounter(run, { ...pick(run, actDef(run.act).hard), name: 'Le joueur qui fonce', bonusItem: 'rare' });
      return;
  }
  backToMap(run);
}

/** Quitte l'écran d'événement après avoir lu le résultat. */
export function leaveEvent(run: RunState): void {
  if (run.screen === 'event') backToMap(run);
}

// --- Bénédiction d'entrée : Brégan le Passeur ---

/** Au tout début de la run, Brégan propose 4 bonus au hasard. */
export function offerBlessing(run: RunState): void {
  const ids = Object.keys(BLESSINGS);
  const choices: string[] = [];
  while (choices.length < 4) {
    const id = pick(run, ids);
    if (!choices.includes(id)) choices.push(id);
  }
  run.blessings = choices;
  run.screen = 'blessing';
}

/** Choisit un bonus de Brégan. `uid` : la carte retirée (Allègement). */
export function chooseBlessing(run: RunState, id: string, uid?: number): boolean {
  if (run.screen !== 'blessing' || !run.blessings.includes(id)) return false;
  if (id === 'allegement' && !run.deck.some((c) => c.uid === uid)) return false;
  run.blessings = [];
  run.screen = 'map';
  switch (id) {
    case 'provisions':
      run.maxHp += 8;
      run.hp += 8;
      break;
    case 'bourse':
      run.gold += 100;
      break;
    case 'potions':
      for (let i = 0; i < 2; i++) {
        const slot = run.potions.indexOf(null);
        if (slot >= 0) run.potions[slot] = rollPotion(run);
      }
      break;
    case 'entrainement':
      upgradeRandom(run, 2);
      break;
    case 'allegement':
      run.deck = run.deck.filter((c) => c.uid !== uid);
      break;
    case 'marche':
      addCurse(run);
      run.gold += 200;
      break;
    case 'pret':
    case 'pari': {
      if (id === 'pari') {
        const lost = Math.floor(run.maxHp * 0.1);
        run.maxHp -= lost;
        run.hp = Math.min(run.hp, run.maxHp);
      }
      run.rewardChoices = [];
      run.rewardGold = 0;
      run.rewardTitle = id === 'pari' ? 'Le pari de Brégan' : 'L\'équipement de prêt';
      const rarity = id === 'pari' ? 'rare' : 'commun';
      run.pendingItem = rollItem(run, rarity);
      if (id === 'pari') {
        const second = rollOther(run, [run.pendingItem], 'rare');
        run.pendingAlts = [second, rollOther(run, [run.pendingItem, second], 'rare')];
      }
      run.screen = 'reward';
      break;
    }
  }
  return true;
}

// --- Feu de camp : reforger Brisemonts ---

/** Peut-on reforger Brisemonts ici ? Il faut la Lame et le Cœur, et être au moins à l'acte 2. */
export function canReforge(run: RunState): boolean {
  return run.screen === 'campfire' && run.brisemonts === 'coeur' && run.act >= LEGENDARY_MIN_ACT;
}

/** Au feu de camp, avec la Lame brisée et le Cœur de la montagne : Brisemonts est reforgée et équipée. */
export function campfireReforge(run: RunState): boolean {
  if (!canReforge(run)) return false;
  putOn(run, 'brisemonts', 'arme');
  run.brisemonts = 'forged';
  backToMap(run);
  return true;
}

// --- Feu de camp : lier les fragments du Bâton du Veilleur (Mage) ---

/** Peut-on lier les fragments ici ? Il faut la Tête du bâton, et une carte rare à sacrifier (Mage) ou 3 éclats d'âme (Démoniste). */
export function canBindStaff(run: RunState): boolean {
  if (run.screen !== 'campfire' || run.veilleur !== 'tete' || run.act < LEGENDARY_MIN_ACT) return false;
  return run.classId === 'demoniste' ? run.shards >= 3 : run.deck.some((c) => CARDS[c.id].rarity === 'rare');
}

/** Scelle le Bâton du Veilleur, qui est équipé : le Mage sacrifie une carte rare, le Démoniste 3 éclats d'âme. */
export function campfireBindStaff(run: RunState, uid?: number): boolean {
  if (!canBindStaff(run)) return false;
  if (run.classId === 'demoniste') {
    run.shards -= 3;
    putOn(run, 'baton_veilleur_demo', 'arme');
    run.veilleur = 'forged';
    backToMap(run);
    return true;
  }
  const i = run.deck.findIndex((c) => c.uid === uid && CARDS[c.id].rarity === 'rare');
  if (i < 0) return false;
  run.deck.splice(i, 1);
  putOn(run, 'baton_veilleur', 'arme');
  run.veilleur = 'forged';
  backToMap(run);
  return true;
}

// --- Feu de camp : le Rituel de l'équinoxe (Prêtre) ---

export function canForgeEquinoxe(run: RunState): boolean {
  return run.screen === 'campfire' && run.equinoxe === 'larme' && run.act >= LEGENDARY_MIN_ACT;
}

/** Le Prêtre sertit la Larme d'Ysolde : Équinoxe est équipée. */
export function campfireEquinoxe(run: RunState): boolean {
  if (!canForgeEquinoxe(run)) return false;
  putOn(run, 'equinoxe', 'arme');
  run.equinoxe = 'forged';
  backToMap(run);
  return true;
}

// --- Feu de camp : l'Aurore ardente (Paladin) ---

export function canForgeAurore(run: RunState): boolean {
  return run.screen === 'campfire' && run.aurore === 'purifiee' && run.act >= LEGENDARY_MIN_ACT;
}

/** Le Paladin rallume la flamme de la lame purifiée : l'Aurore ardente est équipée. */
export function campfireAurore(run: RunState): boolean {
  if (!canForgeAurore(run)) return false;
  putOn(run, 'aurore_ardente', 'arme');
  run.aurore = 'forged';
  backToMap(run);
  return true;
}

// --- Wipe ---

/** La facture du prochain wipe à payer. */
export function repairBill(run: RunState): number {
  const used = (run.maxWipes ?? MAX_WIPES) - run.wipesLeft;
  return Math.round(REPAIR_BILLS[Math.min(used, REPAIR_BILLS.length - 1)] * mods(run).repairMult);
}

/** Les objets portés qui peuvent encore être brisés. */
export function breakableSlots(run: RunState): SlotKey[] {
  return SLOT_KEYS.filter((k) => run.equipment[k] && !run.broken.includes(k));
}

function breakItem(run: RunState, slot: SlotKey): void {
  run.broken.push(slot);
  const lost = ITEMS[run.equipment[slot]!].fx.maxHp ?? 0;
  run.maxHp -= lost;
  run.hp = Math.min(run.hp, run.maxHp);
  syncPotionSlots(run);
}

export function retryAfterWipe(run: RunState): void {
  if (run.screen !== 'wipe' || !run.entry || !run.encounter || run.wipesLeft <= 0) return;
  // La facture de réparation : on paie, ou un objet au hasard est brisé.
  const bill = repairBill(run);
  let brokenNow: string | null = null;
  if (run.gold >= bill) {
    run.gold -= bill;
  } else {
    const slots = breakableSlots(run);
    if (slots.length > 0) {
      const slot = pick(run, slots);
      breakItem(run, slot);
      brokenNow = ITEMS[run.equipment[slot]!].name;
    }
  }
  run.wipesLeft -= 1;
  run.hp = Math.min(run.maxHp, Math.max(run.entry.hp, Math.ceil(run.maxHp * 0.5)));
  run.deck = run.entry.deck.map((c) => ({ ...c }));
  // Les potions bues pendant l'essai raté sont perdues… mais on retrouve celles qu'on avait en entrant.
  if (run.entry.potions) run.potions = [...run.entry.potions];
  syncPotionSlots(run);
  startEncounter(run, run.encounter);
  if (brokenNow) run.combat!.fx = [{ kind: 'banner', text: `Objet brisé : ${brokenNow}` }];
}

export function abandonRun(run: RunState): void {
  run.screen = 'gameover';
  run.combat = null;
}

// --- Feu de camp ---

/** Flamme captive : on ne peut plus se reposer. */
export function canRest(run: RunState): boolean {
  return run.screen === 'campfire' && !runGear(run).noRest;
}

export function campfireRest(run: RunState): void {
  if (!canRest(run)) return;
  run.hp = Math.min(run.maxHp, run.hp + campfireHealAmount(run));
  backToMap(run);
}

export function campfireUpgrade(run: RunState, uid: number): void {
  if (run.screen !== 'campfire') return;
  const card = run.deck.find((c) => c.uid === uid);
  if (!card || card.upgraded) return;
  card.upgraded = true;
  backToMap(run);
}
