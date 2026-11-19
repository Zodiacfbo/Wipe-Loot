// L'interface : affiche l'état de la run et transmet les actions du joueur au moteur.
import { CARDS, energyCost, rewardPool, starterCards } from './engine/cards';
import {
  SPELLS,
  canPlayCard,
  canUseSpell,
  changePosture,
  endTurn,
  isEnraged,
  playCard,
  previewIntentDamage,
  useSpell,
} from './engine/combat';
import { ENEMIES, TUNING, intentAt, isInterruptible } from './engine/enemies';
import { BLESSINGS, EVENTS } from './engine/events';
import { FLOORS, reachable, type MapNode, type NodeType } from './engine/map';
import {
  MAX_WIPES,
  abandonRun,
  afterCombatAction,
  buyCard,
  buyItem,
  buyRemoval,
  buyUpgrade,
  campfireRest,
  campfireUpgrade,
  chooseNode,
  chooseReward,
  currentNode,
  equipPending,
  leavePending,
  leaveShop,
  newRun,
  resolveEvent,
  eventChoiceLock,
  leaveEvent,
  offerBlessing,
  chooseBlessing,
  campfireReforge,
  canReforge,
  LEGENDARY_MIN_ACT,
  retryAfterWipe,
  servicePrice,
  buyPotion,
  canDrink,
  discardPotion,
  drinkPotion,
  takePotion,
  barCapacity,
  campfireHealAmount,
  runGear,
  learnSpell,
  breakableSlots,
  repairBill,
  repairItem,
} from './engine/run';
import { POTIONS } from './engine/potions';
import { clampAlloc, emptyAlloc, pointsUsed, talentIds, toggleTalent, treesFor, type Choice, type TalentAlloc, type TreeId } from './engine/talents';
import { freezeThreshold } from './engine/actions';
import { CLASSES, CLASS_BY_ID, chooseStartClass, classInfo, nextUnlockAt, totalXp, unlockClass, unlocksAvailable } from './engine/classes';
import { DIFFICULTY_TEXT } from './engine/difficulty';
import { LORE, recordKills, recordSeen } from './engine/archives';
import { COMMON_POOL } from './engine/items';
import { POTION_IDS } from './engine/potions';
import { MAX_LEVEL, awardRun, classLevel, type RunSummary } from './engine/progression';
import { CHEST_SIZE, chestRoomAfterReturn, depositableSlots, heirloomSlot, settleChest, takeHeirloom } from './engine/guild';
import { loadProfile, localSave, saveProfile } from './engine/save';
import { ITEMS, REPAIR_PRICE, SLOT_KEYS, SLOT_LABEL, LOOT_TABLES, slotsFor, uselessFx, type Slot, type SlotKey } from './engine/items';
import { ELITE_ENCOUNTERS } from './engine/enemies';
import { initFx, playFx } from './fx';
import type { CardInstance, CombatState, EnemyState, Intent, Posture, RunState } from './engine/types';

const A = (file: string) => `${import.meta.env.BASE_URL}assets/${file}`;

type Selection = { kind: 'card'; index: number } | { kind: 'spell'; index: number } | null;

interface UiState {
  run: RunState | null;
  selection: Selection;
  overlay: 'deck' | 'menu' | 'equipement' | 'loot' | 'potion' | 'coffre' | 'pile' | 'abandon' | 'difficultes' | null;
  /** Objet du coffre choisi dans le hall pour la prochaine expédition (index). */
  heirloom: number | null;
  pileKind: 'draw' | 'discard' | 'exhaust';
  /** Potion ouverte (emplacement du joueur), ou potion du vendeur regardée. */
  potionSlot: number | null;
  shopPotion: number | null;
  campfireUpgrade: boolean;
  shopMode: 'remove' | 'upgrade' | null;
  shopItem: number | null;
  /** Brégan : choix de la carte à retirer (Allègement). */
  blessingRemove: boolean;
  /** Écran des talents (avant une run). */
  talentScreen: boolean;
  /** Écran des classes : choix de la classe de départ, ou consultation. */
  classScreen: boolean;
  /** Archives de la guilde : écran ouvert et onglet. */
  archivesScreen: boolean;
  archiveTab: 'cartes' | 'objets' | 'potions' | 'monstres';
  /** Carte dont on regarde l'amélioration avant de la confirmer. */
  upgradeUid: number | null;
  /** Objet choisi pour le dépôt, quand le coffre est plein (on choisit ensuite quoi remplacer). */
  depositSlot: SlotKey | null;
}

const ui: UiState = { run: null, selection: null, overlay: null, campfireUpgrade: false, shopMode: null, shopItem: null, potionSlot: null, shopPotion: null, depositSlot: null, blessingRemove: false, talentScreen: false, classScreen: false, upgradeUid: null, pileKind: 'draw', heirloom: null, archivesScreen: false, archiveTab: 'monstres' };
let stage: HTMLElement;
let busy = false; // une animation est en cours : on ignore les clics

// ---------- Icônes ----------

const ICON = {
  epee: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M14.5 17.5 3 6V3h3l11.5 11.5"/><path d="M13 19l6-6"/></svg>',
  bouclier: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z"/></svg>',
  hausse: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg>',
  coeur: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8z"/></svg>',
  piece: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="8"/><path d="M12 8v8"/></svg>',
  sablier: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 3h12M6 21h12M7 3c0 5 5 6 5 9s-5 4-5 9M17 3c0 5-5 6-5 9s5 4 5 9"/></svg>',
  crane: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M12 3a8 8 0 0 0-8 8c0 3 1.5 4.5 3 5.5V20h10v-3.5c1.5-1 3-2.5 3-5.5a8 8 0 0 0-8-8z"/><circle cx="9" cy="11" r="1.6" fill="currentColor"/><circle cx="15" cy="11" r="1.6" fill="currentColor"/><path d="M10 20v-2M14 20v-2"/></svg>',
  charge: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h12M13 6l6 6-6 6"/></svg>',
  flamme: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3c1 3 5 5 5 10a5 5 0 0 1-10 0c0-2 1-4 3-5 0 2 1 3 2 3 0-3-1-5 0-8z"/></svg>',
  flocon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M12 2v20M3.3 7l17.4 10M3.3 17L20.7 7M9 4l3 2 3-2M9 20l3-2 3 2"/></svg>',
  etoile: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l2.6 6.2L21 10l-5 4.4L17.5 21 12 17.6 6.5 21 8 14.4 3 10l6.4-.8z"/></svg>',
};

const RARITY_FRAME: Record<string, string> = {
  depart: 'depart', commune: 'commune', peu_commune: 'peu_commune', rare: 'rare', epique: 'epique', statut: 'statut',
};

const POSTURES: { id: Posture; label: string; aide: string }[] = [
  { id: 'combat', label: 'Combat', aide: 'Cartes à rage : +3 dégâts' },
  { id: 'berserker', label: 'Berserker', aide: '+1 rage par Attaque, +20 % de dégâts subis' },
  { id: 'defensive', label: 'Défensive', aide: '+3 blocage, rage même bloqué, −20 % dégâts' },
];

// ---------- Rendu d'une carte ----------

const SCHOOL_LABEL = { arcane: 'Arcane', feu: 'Feu', givre: 'Givre' } as const;

function cardHtml(card: CardInstance, opts: { action?: string; disabled?: boolean; selected?: boolean; combat?: CombatState | null; panicked?: boolean } = {}): string {
  const def = CARDS[card.id];
  const frame = `cadre_${RARITY_FRAME[def.rarity]}${def.rageCost !== undefined ? '_rage' : ''}.png`;
  const cost = opts.combat ? energyCost(opts.combat, card.id, card.upgraded) : card.upgraded && def.costUp !== undefined ? def.costUp : def.cost;
  const reduced = cost < def.cost;
  const rage = def.rageCost === 'all' ? 'X' : def.rageCost ?? '';
  const gear = opts.combat?.gear ?? (ui.run ? runGear(ui.run) : undefined);
  const text = def.text(card.upgraded, gear);
  const classes = ['carte', opts.disabled ? 'injouable' : '', opts.selected ? 'choisie' : '', opts.panicked ? 'paniquee' : ''].join(' ');
  return `<button type="button" class="${classes}" ${opts.action ?? ''} aria-label="${def.name}${card.upgraded ? ' améliorée' : ''}, coût ${cost}. ${text}">
    <img class="cadre px" src="${A(frame)}" alt="">
    <img class="icone px" src="${A(`carte_${card.id}.png`)}" alt="">
    <span class="cout ${reduced ? 'reduit' : cost > def.cost ? 'augmente' : ''}">${def.unplayable ? '–' : cost}</span>
    ${opts.panicked ? '<span class="tampon-panique">Paniquée</span>' : ''}
    ${rage !== '' ? `<span class="cout-rage">${rage}</span>` : ''}
    <span class="titre ${card.upgraded ? 'ameliore' : ''} ${def.name.length + (card.upgraded ? 1 : 0) > 14 ? 'long' : ''}">${def.name}${card.upgraded ? '+' : ''}</span>
    <span class="type">${def.type}${def.school ? ` · ${SCHOOL_LABEL[def.school]}` : ''}</span>
    <span class="texte ${text.length > 56 ? 'tres-long' : text.length > 42 ? 'long' : ''}">${text}</span>
  </button>`;
}

// ---------- Plein écran ----------

function canFullscreen(): boolean {
  const standalone = window.matchMedia('(display-mode: fullscreen), (display-mode: standalone)').matches;
  return !standalone && !!document.fullscreenEnabled;
}

function fullscreenButton(cls: string): string {
  if (!canFullscreen()) return '';
  const on = !!document.fullscreenElement;
  return `<button type="button" class="${cls}" data-action="plein-ecran">${on ? 'Quitter le plein écran' : 'Plein écran'}</button>`;
}

async function toggleFullscreen(): Promise<void> {
  try {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else {
      await document.documentElement.requestFullscreen({ navigationUI: 'hide' });
      const orientation = screen.orientation as ScreenOrientation & { lock?: (o: string) => Promise<void> };
      await orientation.lock?.('landscape').catch(() => {});
    }
  } catch {
    // Le navigateur refuse le plein écran (iPhone, navigateur intégré à une autre appli…).
  }
}

// ---------- Objets ----------

const SLOT_ICON: Record<Slot, string> = {
  arme: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M14.5 17.5 3 6V3h3l11.5 11.5"/><path d="M13 19l6-6"/><path d="M16 16l4 4"/></svg>',
  amulette: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 3c0 5 2.5 8 6 9 3.5-1 6-4 6-9"/><circle cx="12" cy="16" r="4"/></svg>',
  bague: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="15" r="6"/><path d="M9 6l3-3 3 3-3 3z"/></svg>',
  bijou: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M6 4h12l3 5-9 11L3 9z"/><path d="M3 9h18M9 4l3 16 3-16"/></svg>',
};

function itemHtml(id: string | null, slotLabel = '', extra = '', broken = false): string {
  if (!id) {
    return `<div class="objet vide"><span class="objet-icone">${SLOT_ICON[(slotLabel.toLowerCase() as Slot)] ?? ''}</span><div><b>${slotLabel}</b><span>Emplacement vide</span></div></div>`;
  }
  const it = ITEMS[id];
  // Effets qui ne servent pas à la classe jouée : on le dit clairement.
  const cls = ui.run?.classId ?? activeClass();
  const name = classInfo(cls).name;
  const keys = Object.keys(it.fx);
  const useless = uselessFx(id, cls);
  const note = useless.length === 0 ? '' : useless.length === keys.length
    ? `<i class="note-objet">Sans effet pour le ${name}.</i>`
    : `<i class="note-objet">${cls === 'mage' ? 'Le bonus aux Attaques' : 'Le bonus aux Sorts'} ne sert pas au ${name}.</i>`;
  return `<div class="objet ${it.rarity} ${broken ? 'brise' : ''}"><span class="objet-icone">${SLOT_ICON[it.slot]}</span><div><b>${it.name}</b><em>${SLOT_LABEL[slotsFor(id)[0]]} · ${it.rarity === 'commun' ? 'commun' : it.rarity === 'rare' ? 'rare' : it.rarity === 'epique' ? 'épique' : 'légendaire'}${broken ? ' · <strong class="mention-brise">brisé</strong>' : ''}</em><span>${broken ? `Effet désactivé jusqu'à la réparation (${REPAIR_PRICE[it.rarity]} or chez le vendeur gobelin). ` : ''}${it.text}</span>${note}</div>${extra}</div>`;
}

/** Les boutons pour équiper un objet : un par emplacement possible, plus « Laisser ». */
function equipChoices(run: RunState, id: string, action: string, leave: string): string {
  const buttons = slotsFor(id).map((k) => {
    const current = run.equipment[k];
    const label = current ? `Remplacer : ${ITEMS[current].name}${run.broken.includes(k) ? ' (brisé)' : ''}` : `Équiper (${SLOT_LABEL[k].toLowerCase()} libre)`;
    return `<button type="button" class="bouton-objet" ${action} data-slot="${k}">${label}</button>`;
  }).join('');
  return `<div class="choix-objet">${buttons}${leave}</div>`;
}

/** Une fiole, teintée de la couleur de la potion. */
function potionIcon(id: string | null, size = 22): string {
  if (!id) return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-dasharray="2 2" aria-hidden="true"><path d="M9 3h6M10 3v5l-5 9a3 3 0 0 0 2.6 4h8.8A3 3 0 0 0 19 17l-5-9V3"/></svg>`;
  const color = POTIONS[id].color;
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" aria-hidden="true"><path d="M7.2 13h9.6l2.2 4a3 3 0 0 1-2.6 4H7.6A3 3 0 0 1 5 17z" fill="${color}"/><path d="M9 3h6M10 3v5l-5 9a3 3 0 0 0 2.6 4h8.8A3 3 0 0 0 19 17l-5-9V3" fill="none" stroke="#f0e6d8" stroke-width="1.6" stroke-linejoin="round"/><circle cx="10" cy="16" r="1" fill="#fff" opacity=".7"/></svg>`;
}

function potionHtml(id: string, extra = ''): string {
  const p = POTIONS[id];
  return `<div class="objet potion-fiche ${p.rarity}"><span class="objet-icone">${potionIcon(id, 30)}</span><div><b>${p.name}</b><em>Potion · ${p.rarity}</em><span>${p.text}</span></div>${extra}</div>`;
}

/** Les archives de la guilde : cartes, monstres et potions vus pendant la run. */
function rememberArchives(run: RunState): void {
  const profile = loadProfile();
  const cards = [...run.deck.map((k) => k.id), ...run.rewardChoices, ...(run.shop?.cards.map((k) => k.id) ?? [])].filter((id) => CARDS[id] && !['statut'].includes(CARDS[id].rarity));
  const enemies = run.combat?.enemies.map((e) => e.defId) ?? [];
  const potions = [...run.potions, run.pendingPotion, ...(run.shop?.potions.map((x) => x.id) ?? [])];
  if (recordSeen(profile, cards, enemies, potions)) saveProfile(profile);
}

function rememberItems(run: RunState): void {
  const profile = loadProfile();
  const ids = [run.pendingItem, ...run.pendingAlts, ...SLOT_KEYS.map((k) => run.equipment[k])].filter((x): x is string => !!x);
  const fresh = ids.filter((id) => !profile.discoveredItems.includes(id));
  if (fresh.length > 0) {
    profile.discoveredItems.push(...fresh);
    saveProfile(profile);
  }
}

// ---------- Barre du haut ----------

function topbar(run: RunState, hp: number): string {
  const pips = Array.from({ length: run.maxWipes ?? MAX_WIPES }, (_, i) => `<i class="pip ${i < run.wipesLeft ? '' : 'vide'}"></i>`).join('');
  return `<div class="topbar">
    <div class="groupe">
      <span class="nom-classe">${classInfo(run.classId).name}</span>
      <span class="stat pv">${ICON.coeur}<span>${hp} / ${run.maxHp}</span></span>
      <span class="stat or">${ICON.piece}<span>${run.gold}</span></span>
      <span class="potions">${run.potions.map((id, i) => `<button type="button" class="potion-slot ${id ? '' : 'vide'}" ${id ? `data-action="potion" data-slot="${i}" aria-label="${POTIONS[id].name}" title="${POTIONS[id].name}"` : 'disabled aria-label="Emplacement de potion vide"'}>${potionIcon(id)}</button>`).join('')}</span>
    </div>
    <div style="display:flex;flex-direction:column;align-items:center;gap:4px">
      <span class="etape">Les Profondeurs Ardentes · ${etageLabel(run)}</span>
      <span class="pips">${run.difficulty ? `<b class="badge-difficulte">Difficulté ${run.difficulty}</b>` : ''}Wipes ${pips} <span>${run.wipesLeft} restant${run.wipesLeft > 1 ? 's' : ''}</span></span>
    </div>
    <div class="groupe">
      ${fullscreenButton('bouton')}
      <button type="button" class="bouton" data-action="equipement">Équipement · ${SLOT_KEYS.filter((k) => run.equipment[k]).length}/6${run.broken.length > 0 ? ` <span class="mention-brise">· ${run.broken.length} brisé${run.broken.length > 1 ? 's' : ''}</span>` : ''}</button>
      <button type="button" class="bouton" data-action="deck">Deck · ${run.deck.length}</button>
      <button type="button" class="bouton" data-action="menu">Menu</button>
    </div>
  </div>`;
}

function etageLabel(run: RunState): string {
  const node = currentNode(run);
  if (!node) return 'Entrée';
  const where = run.screen === 'combat' && run.encounter ? ` · ${run.encounter.name}` : '';
  return `Étage ${node.floor + 1}/${FLOORS}${where}`;
}

// ---------- Carte de l'acte ----------

const NODE_LABEL: Record<NodeType, string> = {
  combat: 'Combat', elite: 'Boss secondaire', event: '?', shop: 'Vendeur', campfire: 'Feu de camp', chest: 'Coffre', boss: 'Boss',
};

const NODE_ICON: Record<NodeType, string> = {
  combat: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M14.5 17.5 3 6V3h3l11.5 11.5"/><path d="M13 19l6-6"/><path d="M16 16l4 4"/></svg>',
  elite: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3a7 7 0 0 0-7 7c0 2.5 1.3 4 3 5v3h8v-3c1.7-1 3-2.5 3-5a7 7 0 0 0-7-7z"/><circle cx="9.5" cy="10.5" r="1.5"/><circle cx="14.5" cy="10.5" r="1.5"/><path d="M10 18v3M14 18v3"/></svg>',
  event: '<span class="noeud-q">?</span>',
  shop: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M6 8h12l1 12H5L6 8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/><circle cx="12" cy="14" r="2"/></svg>',
  campfire: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3c1 3 4 5 4 9a4 4 0 0 1-8 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-5 0-8z"/><path d="M5 21l14-3M19 21L5 18"/></svg>',
  chest: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="9" width="18" height="11" rx="1"/><path d="M3 9a9 5 0 0 1 18 0M3 13h18M12 12v3"/></svg>',
  boss: '<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M3 8l4 4 5-7 5 7 4-4-2 11H5L3 8z"/></svg>',
};

function nodePos(n: MapNode): { x: number; y: number } {
  const jitter = n.type === 'boss' ? 0 : ((n.id * 37) % 21) - 10;
  return { x: 80 + n.floor * 124, y: 170 + n.lane * 118 + jitter };
}

/** Les quêtes en cours, affichées sur la carte. */
function questTracker(run: RunState): string {
  const lines: string[] = [];
  if (run.sourcesQuest === 'active') lines.push('<b>Gardiens des Sources</b> : bats le prochain boss secondaire, il portera la rune.');
  if (run.sourcesQuest === 'rune') lines.push('<b>Gardiens des Sources</b> : bats le boss qui porte la rune.');
  if (run.sourcesQuest === 'done') lines.push('<b>Eau des profondeurs</b> : Vulkhar commencera affaibli.');
  if (run.brisemonts === 'lame') lines.push(run.map.nodes.some((n) => n.type === 'elite' && n.elite === KRAGG_INDEX)
    ? '<b>Brisemonts</b> : bats Krâgg le Mange-roche pour obtenir le Cœur de la montagne.'
    : '<b>Brisemonts</b> : Krâgg n\'est pas sur cette carte. La quête ne pourra pas être terminée cette fois.');
  if (run.brisemonts === 'coeur') lines.push(run.act >= LEGENDARY_MIN_ACT ? '<b>Brisemonts</b> : reforge l\'épée au prochain feu de camp.' : `<b>Brisemonts</b> : garde la Lame et le Cœur. Tu pourras reforger l'épée à un feu de camp de l'acte ${LEGENDARY_MIN_ACT}.`);
  return lines.length ? `<div class="quetes"><span class="butin-titre">Quêtes</span>${lines.map((l) => `<p>${l}</p>`).join('')}</div>` : '';
}

const KRAGG_INDEX = ELITE_ENCOUNTERS.findIndex((e) => e.loot === 'kragg');

function mapScreen(run: RunState): string {
  const nodes = run.map.nodes;
  const can = new Set(reachable(run.map, run.position).map((n) => n.id));
  const visited = new Set(run.path);
  const walked = new Set<string>();
  for (let i = 1; i < run.path.length; i++) walked.add(`${run.path[i - 1]}-${run.path[i]}`);

  const lines = nodes.flatMap((n) => n.next.map((m) => {
    const a = nodePos(n);
    const b = nodePos(nodes[m]);
    const done = walked.has(`${n.id}-${m}`);
    const next = run.position === n.id;
    const cls = done ? 'fait' : next ? 'possible' : '';
    return `<line class="${cls}" x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}"/>`;
  })).join('');

  const buttons = nodes.map((n) => {
    const { x, y } = nodePos(n);
    const state = can.has(n.id) ? 'accessible' : visited.has(n.id) ? 'visite' : run.position === n.id ? 'ici' : '';
    const size = n.type === 'boss' ? 84 : 58;
    const label = n.type === 'boss' ? 'Boss' : NODE_LABEL[n.type];
    return `<button type="button" class="noeud ${n.type} ${state} ${run.position === n.id ? 'ici' : ''}" style="left:${x - size / 2}px;top:${y - size / 2}px;width:${size}px;height:${size}px"
      ${can.has(n.id) ? `data-action="noeud" data-id="${n.id}"` : 'disabled'} aria-label="Étage ${n.floor + 1} : ${label}">${NODE_ICON[n.type]}</button>`;
  }).join('');

  const floorsLabels = Array.from({ length: FLOORS }, (_, f) => `<span class="etage-num" style="left:${80 + f * 124 - 30}px">${f + 1}</span>`).join('');

  const legend = (['combat', 'elite', 'event', 'shop', 'chest', 'campfire', 'boss'] as NodeType[])
    .map((t) => `<span class="legende-item"><span class="noeud mini ${t}">${NODE_ICON[t]}</span>${NODE_LABEL[t] === '?' ? 'Inconnu' : NODE_LABEL[t]}</span>`).join('');

  return `${topbar(run, run.hp)}
    <div class="carte-acte">
      <h2 class="carte-titre">${run.position === null ? 'Choisis ton point de départ' : 'Choisis ton chemin'}</h2>
      ${floorsLabels}
      <svg class="liens" width="1280" height="720" aria-hidden="true">${lines}</svg>
      ${buttons}
      <div class="legende">${legend}</div>
      ${questTracker(run)}
      ${run.map.nodes.some((n) => n.type === 'elite') ? '<button type="button" class="bouton bouton-loot" data-action="loot">Tables de loot</button>' : ''}
    </div>`;
}

function eventScreen(run: RunState): string {
  const ev = run.eventId ? EVENTS[run.eventId] : null;
  if (!ev) return '';
  if (run.eventOutcome) {
    return `${topbar(run, run.hp)}<div class="ecran">
      <h2>${ev.title}</h2>
      <p class="texte-evenement">${run.eventOutcome}</p>
      <button type="button" class="gros-bouton" data-action="evenement-fin">Continuer</button>
    </div>`;
  }
  const choices = ev.choices.map((ch, i) => {
    const lock = eventChoiceLock(run, i);
    return lock
      ? `<button type="button" class="choix-evenement verrouille" disabled><b>${ch.label}</b><span>${ch.detail}</span><em>${lock}</em></button>`
      : `<button type="button" class="choix-evenement" data-action="choix" data-index="${i}"><b>${ch.label}</b><span>${ch.detail}</span></button>`;
  }).join('');
  return `${topbar(run, run.hp)}<div class="ecran">
    <h2>${ev.title}</h2>
    <p class="texte-evenement">${ev.text}</p>
    ${ev.warriorText && run.classId === 'guerrier' ? `<p class="texte-evenement classe">${ev.warriorText}</p>` : ''}
    <div class="choix-liste">${choices}</div>
  </div>`;
}

function blessingScreen(run: RunState): string {
  if (ui.blessingRemove) {
    const cards = run.deck.map((card) => cardHtml(card, { action: `data-action="benediction-carte" data-uid="${card.uid}"` })).join('');
    return `${topbar(run, run.hp)}<div class="ecran" style="justify-content:flex-start;padding-top:70px;gap:14px">
      <h2>Allègement</h2>
      <p>Choisis la carte à retirer de ton deck.</p>
      <div class="liste-deck">${cards}</div>
      <button type="button" class="gros-bouton secondaire" data-action="benediction-retour">Retour</button>
    </div>`;
  }
  const choices = run.blessings.map((id) => {
    const b = BLESSINGS[id];
    return `<button type="button" class="choix-evenement" data-action="benediction" data-id="${id}"><b>${b.name}</b><span>${b.text}</span></button>`;
  }).join('');
  return `${topbar(run, run.hp)}<div class="ecran">
    <img class="px" src="${A('bregan.png')}" alt="Brégan le Passeur" style="width:144px;height:144px">
    <h2>Brégan le Passeur</h2>
    <p class="texte-evenement">À l'entrée des Profondeurs Ardentes, un vieux nain t'attend près de sa barque. « Les profondeurs n'aiment pas les visiteurs. Prends ceci, ça pourrait te sauver la vie. »</p>
    <div class="choix-liste grille">${choices}</div>
  </div>`;
}

// ---------- Vendeur gobelin ----------

function shopScreen(run: RunState): string {
  const shop = run.shop;
  if (!shop) return '';

  if (ui.shopMode === 'upgrade' && ui.upgradeUid !== null) {
    return `${topbar(run, run.hp)}${upgradePreview(run, ui.upgradeUid, `Améliorer pour ${servicePrice(run.upgradesBought)} or`, 'data-action="service-carte"')}`;
  }
  if (ui.shopMode) {
    const remove = ui.shopMode === 'remove';
    const cards = run.deck.map((card) => {
      const ok = remove || (!card.upgraded && !CARDS[card.id].unplayable);
      const action = remove ? 'service-carte' : 'apercu-amelioration';
      return cardHtml(card, { action: ok ? `data-action="${action}" data-uid="${card.uid}"` : 'disabled', disabled: !ok });
    }).join('');
    return `${topbar(run, run.hp)}<div class="ecran" style="justify-content:flex-start;padding-top:70px;gap:14px">
      <h2>${remove ? 'Retirer une carte' : 'Améliorer une carte'}</h2>
      <p>${remove ? 'Choisis la carte à retirer définitivement de ton deck.' : 'Choisis la carte à améliorer.'} Prix : ${servicePrice(remove ? run.removals : run.upgradesBought)} or.</p>
      <div class="liste-deck">${cards}</div>
      <button type="button" class="gros-bouton secondaire" data-action="boutique-retour">Retour</button>
    </div>`;
  }

  const items = shop.cards.map((item, i) => {
    const affordable = run.gold >= item.price;
    const def = CARDS[item.id];
    const promo = item.price < (def.rarity === 'commune' ? 45 : def.rarity === 'peu_commune' ? 68 : 135);
    if (item.sold) return `<div class="article vendu"><div class="vendu-texte">Vendu</div></div>`;
    return `<div class="article">
      ${cardHtml({ uid: 0, id: item.id, upgraded: false }, { action: affordable ? `data-action="acheter" data-index="${i}"` : 'disabled', disabled: !affordable })}
      <span class="prix ${affordable ? '' : 'trop-cher'} ${promo ? 'promo' : ''}">${ICON.piece}${item.price}${promo ? ' · promo' : ''}</span>
    </div>`;
  }).join('');

  const service = (kind: 'remove' | 'upgrade', label: string, used: boolean, count: number) => {
    const price = servicePrice(count);
    const ok = !used && run.gold >= price;
    return `<button type="button" class="service" ${ok ? `data-action="service" data-service="${kind}"` : 'disabled'}>
      <b>${label}</b><span>${used ? 'Déjà utilisé lors de cette visite' : `${ICON.piece} ${price} or`}</span>
    </button>`;
  };

  if (ui.shopPotion !== null && shop.potions[ui.shopPotion] && !shop.potions[ui.shopPotion].sold) {
    const item = shop.potions[ui.shopPotion];
    const free = run.potions.includes(null);
    const ok = free && run.gold >= item.price;
    const why = !free ? 'Tes 3 emplacements de potion sont pleins : jette ou bois une potion d\'abord.' : run.gold < item.price ? 'Pas assez d\'or.' : '';
    return `${topbar(run, run.hp)}<div class="ecran">
      <h2>Acheter pour ${item.price} or ?</h2>
      ${potionHtml(item.id)}
      ${why ? `<p>${why}</p>` : ''}
      <div class="choix-objet">
        <button type="button" class="bouton-objet" ${ok ? `data-action="acheter-potion" data-index="${ui.shopPotion}"` : 'disabled'}>Acheter</button>
        <button type="button" class="bouton-objet secondaire" data-action="annuler-potion">Retour</button>
      </div>
    </div>`;
  }

  if (ui.shopItem !== null && shop.items[ui.shopItem] && !shop.items[ui.shopItem].sold) {
    const item = shop.items[ui.shopItem];
    return `${topbar(run, run.hp)}<div class="ecran">
      <h2>Acheter pour ${item.price} or ?</h2>
      ${itemHtml(item.id)}
      <p>Choisis l'emplacement. Un objet remplacé est perdu.</p>
      ${equipChoices(run, item.id, `data-action="acheter-objet" data-index="${ui.shopItem}"`, '<button type="button" class="bouton-objet secondaire" data-action="annuler-objet">Annuler</button>')}
    </div>`;
  }

  const shopPotions = shop.potions.map((item, i) => {
    if (item.sold) return `<div class="article-potion vendu-potion">Vendu</div>`;
    const ok = run.gold >= item.price;
    return `<button type="button" class="article-potion" data-action="potion-boutique" data-index="${i}" aria-label="${POTIONS[item.id].name}">
      ${potionIcon(item.id, 44)}<span class="nom-potion">${POTIONS[item.id].name}</span><span class="prix ${ok ? '' : 'trop-cher'}">${ICON.piece}${item.price}</span></button>`;
  }).join('');

  const shopItems = shop.items.map((item, i) => {
    if (item.sold) return `<div class="objet vendu-objet">Vendu</div>`;
    const ok = run.gold >= item.price;
    return `<button type="button" class="article-objet ${ok ? '' : 'trop-cher'}" ${ok ? `data-action="objet-boutique" data-index="${i}"` : 'disabled'}>
      ${itemHtml(item.id)}<span class="prix ${ok ? '' : 'trop-cher'}">${ICON.piece}${item.price}</span></button>`;
  }).join('');

  return `${topbar(run, run.hp)}
    <div class="boutique">
      <div class="vendeur">
        <img class="px" src="${A('vendeur_gobelin.png')}" alt="Le vendeur gobelin" style="width:192px;height:192px">
        <p class="replique">« Tout est à vendre, champion ! Même ce qui ne m'appartient pas. »</p>
      </div>
      <div class="etal">
        <h2 class="titre-boutique">Le vendeur gobelin</h2>
        <div class="articles">${items}</div>
        <div class="objets-boutique">${shopItems}<div class="potions-boutique">${shopPotions}</div></div>
        <div class="services">
          ${service('remove', 'Retirer une carte', shop.removeUsed, run.removals)}
          ${service('upgrade', 'Améliorer une carte', shop.upgradeUsed, run.upgradesBought)}
          ${run.broken.map((k) => {
            const id = run.equipment[k]!;
            const price = REPAIR_PRICE[ITEMS[id].rarity];
            const ok = run.gold >= price;
            return `<button type="button" class="service reparation" ${ok ? `data-action="reparer" data-slot="${k}"` : 'disabled'}><b>Réparer : ${ITEMS[id].name}</b><span>${ICON.piece} ${price} or</span></button>`;
          }).join('')}
          <button type="button" class="gros-bouton secondaire" data-action="partir">Partir</button>
        </div>
      </div>
    </div>`;
}

// ---------- Écran de combat ----------

function enemyChips(e: EnemyState): string {
  const b = e.buffs;
  const chips: string[] = [];
  if (b.puissance > 0) chips.push(`<span class="chip">Puissance ${b.puissance}</span>`);
  if (b.demoralise > 0) chips.push(`<span class="chip debuff">Démoralisé ${b.demoralise}</span>`);
  if (b.ralenti > 0) chips.push(`<span class="chip debuff">Ralenti ${b.ralenti}</span>`);
  if (b.armureFracassee > 0) chips.push(`<span class="chip debuff">Armure fracassée ${b.armureFracassee}</span>`);
  if (b.saignement > 0) chips.push(`<span class="chip saigne">Saignement ${b.saignement}</span>`);
  if (b.brulure) chips.push(`<span class="chip brule" title="Dégâts au début de son tour, puis −1">Brûlure ${b.brulure}</span>`);
  if (b.gel) chips.push(`<span class="chip gel" title="À ${ui.run?.combat ? freezeThreshold(ui.run.combat) : 5} cumuls : Gelé">Gel ${b.gel}/${ui.run?.combat ? freezeThreshold(ui.run.combat) : 5}</span>`);
  if (e.gele) chips.push(`<span class="chip gel" title="${e.gele === 'skip' ? 'Perd son prochain tour' : 'Prochaine attaque réduite de moitié'}">Gelé${e.gele === 'half' ? ' : attaque ÷ 2' : ''}</span>`);
  if (e.mouton) chips.push(`<span class="chip debuff" title="Ne fait rien ; reprend forme s'il est blessé">Mouton ${e.mouton}</span>`);
  if (e.untargetable) chips.push('<span class="chip">Insaisissable</span>');
  if (ui.run?.encounter?.rune && ENEMIES[e.defId].elite) chips.push('<span class="chip rune">Rune des Sources</span>');
  if (b.peur) chips.push('<span class="chip debuff">Apeuré</span>');
  if (e.disarmed) chips.push('<span class="chip debuff">Désarmé</span>');
  if (e.noHeal) chips.push('<span class="chip debuff">Insoignable</span>');
  if (e.shield) chips.push(`<span class="chip bouclier-saldris">Anti-${e.shield} : renvoie 50 %</span><span class="chip">Ensuite : anti-${e.shield === 'coups' ? 'sorts' : 'coups'}</span>`);
  return chips.join('');
}

/** Résumé court d'une intention (Amulette de clairvoyance). */
function intentShort(i: Intent): string {
  if (i.cast) return `Incantation : ${i.cast}`;
  switch (i.kind) {
    case 'attack': return `Attaque ${i.dmg}${i.times && i.times > 1 ? ` × ${i.times}` : ''}`;
    case 'block': return `Blocage ${i.amount}`;
    case 'buff': return `Puissance +${i.puissance}`;
    case 'heal': return `Soin ${i.amount}`;
    case 'curse': return i.label;
    case 'summon': return i.label;
    case 'blink': return 'Clignement';
  }
}

/** Ce que fait une malédiction, en une phrase. */
function curseText(i: Extract<Intent, { kind: 'curse' }>): string {
  const parts: string[] = [];
  if (i.demoralise) parts.push(`Démoralisé ${i.demoralise} tours (tes Attaques −25 %)`);
  if (i.impie) parts.push(`ta 1re carte de chaque tour coûte 1 de plus (${i.impie} tours)`);
  if (i.arcane) parts.push('tes Sorts coûtent 1 de plus au prochain tour');
  if (i.manaBurn) parts.push(`${i.manaBurn} énergie de moins au prochain tour`);
  if (i.panic) parts.push(`${i.panic} cartes Paniquées au prochain tour`);
  if (i.fardeau) parts.push(`${i.fardeau} Fardeaux dans ta pioche`);
  if (i.bomb) parts.push('une Bombe vivante dans ta main');
  const text = parts.join(', ');
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function intentHtml(c: CombatState, e: EnemyState): string {
  const next = c.gear?.seeTwoIntents ? `<div class="intention-suivante">Ensuite : ${intentShort(intentAt(ENEMIES[e.defId], e.step + 1, e.phase ?? 1, e.hp < e.maxHp / 2))}</div>` : '';
  return intentNow(c, e) + next;
}

function intentNow(c: CombatState, e: EnemyState): string {
  const i = e.intent;
  if (e.mouton) return `<div class="intention interrompu">Mouton : ne fait rien</div>`;
  if (e.gele === 'skip') return `<div class="intention interrompu gele">Gelé : passe son tour</div>`;
  if (e.interrupted) return `<div class="intention interrompu">Interrompu</div>`;
  if (i.cast) {
    const effet =
      i.kind === 'attack'
        ? `${previewIntentDamage(c, e)} dégâts à la fin de ce tour${i.drawPenalty ? `, et tu pioches ${i.drawPenalty} cartes de moins` : ''}`
        : i.kind === 'heal' ? `Soigne un allié de ${i.amount} PV à la fin de ce tour`
        : 'Prend effet à la fin de ce tour';
    const locked = !isInterruptible(i);
    return `<div class="cast ${locked ? 'bloque' : ''}"><div class="tete"><span>${i.cast}${e.delayed ? ' (retardé)' : ''}</span><b>${locked ? 'Impossible à interrompre' : 'Interruptible'}</b></div><div class="jauge"><div></div></div><div class="effet">${effet}</div></div>`;
  }
  switch (i.kind) {
    case 'attack': {
      const dmg = previewIntentDamage(c, e) ?? 0;
      const times = i.times && i.times > 1 ? ` × ${i.times}` : '';
      const zone = i.addZone ? ' + Zone de feu' : i.stealGold ? ` + vole ${i.stealGold} or` : '';
      return `<div class="intention">${ICON.epee}<span>${dmg}${times}${zone}</span></div>`;
    }
    case 'block':
      return `<div class="intention defense">${ICON.bouclier}<span>+${i.amount}</span></div>`;
    case 'buff':
      return `<div class="intention soutien">${ICON.hausse}<span>Puissance +${i.puissance}</span></div>`;
    case 'heal':
      return `<div class="intention soutien">${ICON.coeur}<span>Soin ${i.amount}</span></div>`;
    case 'curse':
      return `<div class="intention malediction" title="${curseText(i)}">${ICON.crane}<span>${i.label}</span></div><div class="effet-intention">${curseText(i)}</div>`;
    case 'summon':
      return `<div class="intention soutien">${ICON.hausse}<span>${i.label}</span></div>`;
    case 'blink':
      return `<div class="intention malediction">${ICON.charge}<span>Va se dérober</span></div><div class="effet-intention">À la fin de ce tour, il Cligne : pendant ton prochain tour, tu ne pourras pas le cibler (les attaques de zone le touchent)</div>`;
  }
}

function needsEnemyTarget(c: CombatState): boolean {
  const sel = ui.selection;
  if (!sel) return false;
  if (sel.kind === 'card') {
    const card = c.hand[sel.index];
    return !!card && CARDS[card.id].needsTarget;
  }
  return SPELLS[c.spells[sel.index].id].needsTarget;
}

/** Nom court et description des Pouvoirs actifs. */
const POWER_LABEL: Record<string, [string, string]> = {
  entaille_profonde: ['Entaille profonde', 'Tes Attaques à rage appliquent Saignement'],
  concentration: ['Concentration', '+1 énergie si tu as 5 rage ou plus'],
  maitre_armes: ['Maître d\'armes', 'Attaques à rage : +dégâts'],
  enrage: ['Enragé', 'Perdre des PV renforce ta prochaine Attaque'],
  rafale: ['Rafale', '3e Attaque du tour : pioche 1 carte'],
  ambidextrie: ['Ambidextrie', 'Une Frappe de la main gauche chaque tour'],
  furie_croissante: ['Furie croissante', 'Rage au maximum : +1 Puissance'],
  furie_inextinguible: ['Furie inextinguible', 'Rage max 15, rage à chaque tour'],
  tenacite: ['Ténacité', 'Blocage au début de chaque tour'],
  riposte_bouclier: ['Riposte au bouclier', 'Attaque bloquée : dégâts à l\'attaquant'],
  garde_de_fer: ['Garde de fer', 'Tu gardes la moitié de ton blocage'],
  bastion: ['Bastion', 'Carte de blocage : dégâts à tous'],
  erudition: ['Érudition', 'Pioche 1 carte de plus à chaque tour'],
  resonance: ['Résonance', '6 charges arcaniques au maximum'],
  concentration_arcanique: ['Concentration arcanique', '3e Sort du tour : +1 énergie'],
  esprit_vif: ['Esprit vif', '+1 charge au début de chaque tour'],
  embrasement: ['Embrasement', 'Sort de 10 dégâts ou plus : Brûlure'],
  armure_de_lave: ['Armure de lave', 'Tes attaquants reçoivent de la Brûlure'],
  chaleur_intense: ['Chaleur intense', 'La Brûlure des ennemis augmente à chaque tour'],
  pyromanie: ['Pyromanie', 'Sorts de Feu à 2 énergie : +dégâts'],
  armure_de_givre: ['Armure de givre', 'Tes attaquants reçoivent du Gel'],
  morsure_du_froid: ['Morsure du froid', 'Un ennemi Gelé subit des dégâts'],
  fragmentation: ['Fragmentation', 'Fracasser : triple dégâts'],
  coeur_de_glace: ['Cœur de glace', 'Gel 1 à tous au début de ton tour'],
};

function playerChips(c: CombatState): string {
  const p = c.player;
  const d = p.debuffs;
  const chips: string[] = [];
  if (p.puissance > 0) chips.push(`<span class="chip">Puissance ${p.puissance}</span>`);
  if (p.robustesse > 0) chips.push(`<span class="chip">Robustesse ${p.robustesse}</span>`);
  if (d?.demoralise) chips.push(`<span class="chip debuff" title="Tes Attaques infligent 25 % de dégâts en moins">Démoralisé ${d.demoralise}</span>`);
  if (d?.impie) chips.push(`<span class="chip debuff" title="Ta première carte de chaque tour coûte 1 de plus">Impie ${d.impie}</span>`);
  if (d?.arcane) chips.push(`<span class="chip debuff" title="Tes Sorts coûtent 1 de plus">Malédiction arcanique ${d.arcane}</span>`);
  if (d?.manaBurn) chips.push(`<span class="chip debuff">Mana brûlé : −${d.manaBurn} énergie au prochain tour</span>`);
  if (d?.panic) chips.push(`<span class="chip debuff">Terreur : ${d.panic} cartes Paniquées au prochain tour</span>`);
  if (c.fireProof) chips.push('<span class="chip">Protégé du feu</span>');
  if (p.temerite) chips.push('<span class="chip">Témérité : +50 % / subis +25 %</span>');
  if (p.rempart) chips.push('<span class="chip">Rempart : dégâts ÷ 2</span>');
  if (p.fearless) chips.push('<span class="chip">Sans peur</span>');
  if (p.fureur) chips.push(`<span class="chip">Fureur ${p.fureur} : +50 % / subis +25 %</span>`);
  if (p.riposte) chips.push(`<span class="chip">Riposte ${p.riposte}</span>`);
  if (p.enrageReady) chips.push(`<span class="chip">Enragé : +${p.enrageReady} à la prochaine Attaque</span>`);
  if (c.cleave) chips.push(`<span class="chip">Balayage : ${c.cleave} Attaque${c.cleave > 1 ? 's' : ''}</span>`);
  if (p.arcanePower) chips.push('<span class="chip">Pouvoir des arcanes : Sorts +50 %</span>');
  if (p.iceBlock) chips.push('<span class="chip gel">Carapace de glace : immunisé</span>');
  if (p.manaShield) chips.push('<span class="chip" title="S\'il te reste du blocage au début de ton tour : pioche 1 carte">Bouclier de mana</span>');
  if (p.distortion) chips.push('<span class="chip">Distorsion : +1 énergie et +2 cartes au prochain tour</span>');
  if (p.spellReflect) chips.push('<span class="chip">Réflexion des sorts</span>');
  if (p.fireShield) chips.push(`<span class="chip brule">Bouclier de feu : Brûlure ${p.fireShield} aux attaquants</span>`);
  if (c.freeNext) chips.push('<span class="chip">Inspiration : prochaine carte gratuite</span>');
  if (c.freeNextSpell) chips.push('<span class="chip">Présence d\'esprit : prochain Sort gratuit</span>');
  if (c.shatterReady) chips.push('<span class="chip gel">Toucher glacial : prochain Fracasser</span>');
  for (const [id, v] of Object.entries(c.powers ?? {})) {
    if (POWER_LABEL[id]) chips.push(`<span class="chip pouvoir" title="${POWER_LABEL[id][1]}">${POWER_LABEL[id][0]}${v > 1 ? ` ${v}` : ''}</span>`);
  }
  return chips.join('');
}

function combatScreen(run: RunState, c: CombatState): string {
  const p = c.player;
  const targeting = needsEnemyTarget(c);
  const hpPct = Math.max(0, (p.hp / p.maxHp) * 100);

  const mage = run.classId === 'mage';
  const hero = classInfo(run.classId);
  const rage = Array.from({ length: p.maxRage }, (_, i) => `<i class="${i < p.rage ? 'plein' : ''}"></i>`).join('');
  const charges = Array.from({ length: p.maxCharges ?? 4 }, (_, i) => `<i class="${i < (p.charges ?? 0) ? 'plein' : ''} ${i >= 3 ? 'surcharge' : ''}"></i>`).join('');
  const resource = mage
    ? `<div class="ligne"><span class="rage-label charges-label">CHARGES</span><div class="rage charges">${charges}</div><span class="rage-label" style="width:auto">${p.charges ?? 0}</span></div>
        <div class="aide-posture">Chaque charge : +2 dégâts aux Sorts arcaniques.${(p.charges ?? 0) >= 4 && !c.gear?.noOverload ? ' <b class="alerte">Surcharge : −2 PV en fin de tour</b>' : ' Surcharge à 4 : −2 PV par tour.'}</div>`
    : '';
  const postures = POSTURES.map((po) => {
    const actif = p.posture === po.id;
    const disabled = !actif && p.postureChanged;
    return `<button type="button" class="${actif ? 'actif' : ''}" data-action="posture" data-posture="${po.id}" ${disabled ? 'disabled' : ''} aria-pressed="${actif}">${po.label}</button>`;
  }).join('');
  const aidePosture = POSTURES.find((po) => po.id === p.posture)?.aide ?? '';

  const enemies = c.enemies.filter((e) => !e.dead && !e.submerged).map((e) => {
    const def = ENEMIES[e.defId];
    const big = e.defId === 'seigneur' || (def.elite && e.defId !== 'croc');
    const small = e.defId === 'etincelle' || e.defId === 'rejeton' || e.defId === 'eclat';
    const size = e.defId === 'vulkhar' ? 240 : big ? 192 : small ? 96 : 144;
    const pct = Math.max(0, (e.hp / e.maxHp) * 100);
    const canTarget = targeting && !e.untargetable;
    const tag = canTarget ? 'button' : 'div';
    return `<${tag} ${canTarget ? 'type="button"' : ''} class="ennemi ${canTarget ? 'ciblable' : ''} ${e.untargetable ? 'insaisissable' : ''}" data-action="cible" data-uid="${e.uid}" aria-label="${e.name}, ${e.hp} PV">
      ${intentHtml(c, e)}
      <img class="px" data-fx="${e.uid}" src="${A(`ennemi_${e.defId}.png`)}" alt="" style="width:${size}px;height:${size}px">
      <span class="nom ${def.elite ? 'elite' : ''}">${def.elite ? 'Boss secondaire · ' : ''}${e.name}</span>
      <div class="barre-pv"><div style="width:${pct}%"></div><span>${e.hp} / ${e.maxHp}</span></div>
      <div class="infos">${e.block > 0 ? `<span class="bloc">${ICON.bouclier} ${e.block}</span>` : ''}${enemyChips(e)}</div>
      ${def.passive ? `<div class="passif-ennemi">${def.passive}</div>` : ''}
    </${tag}>`;
  }).join('');

  const spells = c.spells.map((s, i) => {
    const def = SPELLS[s.id];
    const ready = canUseSpell(c, i);
    const selected = ui.selection?.kind === 'spell' && ui.selection.index === i;
    if (s.cooldown > 0) {
      return def.once
        ? `<button type="button" class="sort recharge" disabled aria-label="${def.name}, déjà utilisé"><b>✓</b>${def.name}</button>`
        : `<button type="button" class="sort recharge" disabled aria-label="${def.name}, recharge ${s.cooldown} tours"><b>${s.cooldown}</b>${def.name}</button>`;
    }
    return `<button type="button" class="sort ${selected ? 'choisi' : ''}" data-action="sort" data-index="${i}" ${ready ? '' : 'disabled'} aria-label="${def.name}, prêt. ${def.text}" title="${def.text}">${def.cost > 0 ? `<span class="cout-sort">${def.cost}</span>` : ''}${ICON[def.icon]}${def.name}</button>`;
  }).join('');

  const hand = c.hand.map((card, i) => cardHtml(card, {
    panicked: c.panicked?.includes(card.uid),
    action: `data-action="carte" data-index="${i}"`,
    disabled: !canPlayCard(c, i),
    selected: ui.selection?.kind === 'card' && ui.selection.index === i,
    combat: c,
  })).join('');

  let enrage = '';
  if (c.enrageTurn !== null) {
    enrage = isEnraged(c)
      ? `<div class="enrage actif">${ICON.sablier}<span>ENRAGE : dégâts du boss doublés</span></div>`
      : `<div class="enrage">${ICON.sablier}<span>Enrage dans ${c.enrageTurn - c.turn} tour${c.enrageTurn - c.turn > 1 ? 's' : ''} : ses dégâts doubleront</span></div>`;
  }

  const journal = c.log.slice(-9).map((l) => `<p>${l}</p>`).join('');
  const underLava = c.enemies.find((e) => !e.dead && e.submerged);
  const reviving = c.enemies.filter((e) => e.dead && e.reviveIn);
  const selSpell = ui.selection?.kind === 'spell' ? SPELLS[c.spells[ui.selection.index].id] : null;
  const spellInfo = selSpell
    ? `<div class="info-sort"><b>${selSpell.name}</b><small>${selSpell.cost > 0 ? `${selSpell.cost} énergie` : 'Gratuit'} · ${selSpell.once ? 'une fois par combat' : `recharge ${selSpell.cooldown} tours`}</small><span>${selSpell.text}</span><em>${targeting ? 'Choisis une cible.' : 'Touche à nouveau le sort pour le lancer.'}</em></div>`
    : '';
  const consigne = selSpell
    ? ''
    : targeting
    ? `<div class="consigne">Choisis une cible</div>`
    : underLava
      ? `<div class="consigne lave">${underLava.name} est sous la lave : il refait surface dans ${underLava.submerged} tour${underLava.submerged! > 1 ? 's' : ''}. Chaque Rejeton encore en vie le soignera de ${TUNING.rejetonHeal} PV !</div>`
      : reviving.length > 0
        ? `<div class="consigne lave">${reviving.length} Molosse${reviving.length > 1 ? 's' : ''} enragé${reviving.length > 1 ? 's' : ''} se relèvera${reviving.length > 1 ? 'nt' : ''} dans ${Math.min(...reviving.map((e) => e.reviveIn!))} tour${Math.min(...reviving.map((e) => e.reviveIn!)) > 1 ? 's' : ''}, tant que Krâgg est en vie.</div>`
        : '';

  return `<div class="sol"></div>
    ${topbar(run, p.hp)}
    ${enrage}
    <div class="heros">
      <div class="buffs">${playerChips(c)}</div>
      <img class="px" data-fx="player" src="${A(hero.sprite ?? 'guerrier.png')}" alt="Le ${hero.name}" style="width:192px;height:192px">
      <div class="jauges">
        <div class="ligne">
          <div class="bouclier-badge" title="Blocage"><svg width="32" height="32" viewBox="0 0 24 24" fill="#1d2633" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z"/></svg><span>${p.block}</span></div>
          <div class="barre-pv"><div style="width:${hpPct}%"></div><span>${p.hp} / ${p.maxHp}</span></div>
        </div>
        ${mage ? resource : `<div class="ligne"><span class="rage-label">RAGE</span><div class="rage">${rage}</div><span class="rage-label" style="width:auto">${p.rage}</span></div>
        <div class="postures" role="group" aria-label="Posture">${postures}</div>
        <div class="aide-posture">${aidePosture}${p.postureChanged ? ' · déjà changée ce tour' : ''}</div>`}
      </div>
    </div>
    <div class="ennemis ${c.enemies.filter((e) => !e.dead && !e.submerged).length > 4 ? 'nombreux' : ''}">${enemies}</div>
    ${consigne}
    <div class="barre-sorts"><span class="titre">SORTS</span>${spells}${selSpell ? spellInfo : ''}</div>
    <div class="energie ${p.energy === 0 ? 'vide' : ''}" aria-label="Énergie">${p.energy}/${p.maxEnergy}</div>
    <div class="piles"><button type="button" class="pile" data-action="pile" data-pile="draw">Pioche ${c.draw.length}</button><button type="button" class="pile" data-action="pile" data-pile="discard">Défausse ${c.discard.length}</button>${c.exhaust.length ? `<button type="button" class="pile" data-action="pile" data-pile="exhaust">Épuisées ${c.exhaust.length}</button>` : ''}</div>
    <div class="main">${hand}</div>
    <div class="journal" aria-live="polite">${journal}</div>
    <button type="button" class="fin-tour" data-action="fin-tour" ${c.phase === 'player' ? '' : 'disabled'}>Fin du tour</button>`;
}

// ---------- Autres écrans ----------

/** Le hall de la guilde : l'écran principal du jeu. */
function titleScreen(): string {
  const profile = loadProfile();
  if (!profile.startClass) return firstLaunchScreen();
  const saved = localSave.load();
  // Une victoire dont le passage au coffre n'est pas fait peut encore être reprise.
  const canContinue = saved && saved.screen !== 'gameover' && (saved.screen !== 'victory' || !saved.chestDone);
  const cls = activeClass(profile);
  const hero = classInfo(cls);
  const lvl = classLevel(profile, cls);
  const pct = lvl.needed ? Math.round((lvl.into / lvl.needed) * 100) : 100;
  const alloc = myAlloc();
  const trees = treesFor(cls).map((t) => `<span class="${(alloc[t.id] ?? []).length === 5 ? 'complet' : ''}">${t.name} <b>${(alloc[t.id] ?? []).length}</b></span>`).join('');
  const playable = profile.unlockedClasses.filter((id) => CLASS_BY_ID[id]?.playable);
  const switcher = playable.length > 1
    ? `<div class="choix-classe-hall" role="group" aria-label="Classe jouée">${playable.map((id) => `<button type="button" class="${id === cls ? 'actif' : ''}" data-action="classe-active" data-id="${id}" aria-pressed="${id === cls}" style="--couleur:${CLASS_BY_ID[id].color}">${CLASS_BY_ID[id].name}</button>`).join('')}</div>`
    : '';
  const unlocks = unlocksAvailable(profile);
  const chest = profile.guildChest;
  if (ui.heirloom !== null && !chest[ui.heirloom]) ui.heirloom = null;
  const tiles = Array.from({ length: CHEST_SIZE }, (_, i) => {
    const id = chest[i];
    if (!id) return '<div class="tuile-coffre vide"></div>';
    const it = ITEMS[id];
    return `<button type="button" class="tuile-coffre ${it.rarity} ${ui.heirloom === i ? 'emporte' : ''}" data-action="heritage" data-index="${i}" title="${it.name} : ${it.text}">
      <span class="objet-icone">${SLOT_ICON[it.slot]}</span><b>${it.name}</b>${ui.heirloom === i ? '<em>Emporté</em>' : ''}</button>`;
  }).join('');
  const chosen = ui.heirloom !== null ? ITEMS[chest[ui.heirloom]] : null;
  const run = canContinue && saved ? `<div class="run-en-cours">
      <span class="butin-titre">Expédition en cours · ${classInfo(saved.classId).name}</span>
      <p>${saved.position === null ? 'Entrée des Profondeurs' : `Étage ${saved.map.nodes[saved.position].floor + 1}/${FLOORS}`} · ${ICON.coeur} ${saved.hp}/${saved.maxHp} · ${ICON.piece} ${saved.gold} · ${saved.wipesLeft} wipe${saved.wipesLeft > 1 ? 's' : ''} restant${saved.wipesLeft > 1 ? 's' : ''}</p>
      <button type="button" class="gros-bouton" data-action="continuer">Continuer</button>
    </div>` : '';
  const stats = profile.stats;
  return `<div class="hall">
    <header class="hall-tete"><span class="titre-jeu petit">Wipe &amp; Loot</span><span class="hall-nom">Hall de la guilde</span>
      <div class="hall-options">${fullscreenButton('bouton')}</div></header>
    <section class="hall-heros">
      ${switcher}
      <img class="px" src="${A(hero.sprite ?? 'guerrier.png')}" alt="Le ${hero.name}" style="width:160px;height:160px">
      <h3>${hero.name} · niveau ${lvl.level}</h3>
      <div class="barre-xp"><div style="width:${pct}%"></div><span>${lvl.needed ? `${lvl.into} / ${lvl.needed} exp.` : 'Niveau maximum'}</span></div>
      <div class="hall-arbres">${trees}</div>
      <button type="button" class="gros-bouton secondaire" data-action="talents">Talents · ${pointsUsed(alloc)}/${lvl.level} points</button>
      <button type="button" class="bouton" data-action="classes">Classes${unlocks > 0 ? ` · ${unlocks} à débloquer` : ''}</button>
    </section>
    <section class="hall-expedition">
      <span class="butin-titre">Acte 1</span>
      <h2>Les Profondeurs Ardentes</h2>
      <p>10 étages de lave et de cendres, 9 boss secondaires possibles, et Vulkhar, le Souverain des flammes, au bout du chemin.</p>
      ${run}
      ${difficultyPicker()}
      <button type="button" class="gros-bouton ${canContinue ? 'secondaire' : ''}" data-action="nouvelle">${canContinue ? 'Nouvelle expédition' : 'Partir en expédition'}</button>
      <p class="emporte-texte">${chosen ? `Tu emportes : <b>${chosen.name}</b> (perdu si l'expédition échoue).` : chest.length ? 'Tu peux emporter un objet du coffre : touche-le.' : ''}</p>
    </section>
    <section class="hall-coffre">
      <span class="butin-titre">Coffre de la guilde · ${chest.length}/${CHEST_SIZE}</span>
      <div class="grille-coffre">${tiles}</div>
      <p>${chest.length ? 'Touche un objet pour l\'emporter lors de la prochaine expédition (un seul). Il revient au coffre si tu gagnes, il est perdu sinon.' : 'Après une expédition gagnée, tu pourras y mettre un objet à l\'abri.'}</p>
      <button type="button" class="bouton" data-action="voir-coffre">Voir le détail du coffre</button>
      <button type="button" class="gros-bouton secondaire" data-action="archives">Archives de la guilde · ${archivesProgress()} %</button>
      <div class="hall-stats">
        <span>Expéditions <b>${stats.runs}</b></span><span>Victoires <b>${stats.wins}</b></span><span>Objets découverts <b>${profile.discoveredItems.length}</b></span>
      </div>
    </section>
  </div>`;
}

/** La progression des archives (en %), pour le hall. */
function archivesProgress(): number {
  const p = loadProfile();
  const all = archiveCards().flatMap(([, ids]) => ids);
  const total = all.length + Object.keys(ITEMS).length + POTION_IDS.length + Object.keys(ENEMIES).length;
  const seenCards = p.seenCards.filter((id) => all.includes(id)).length;
  const found = seenCards + p.discoveredItems.length + p.seenPotions.length + p.seenEnemies.length;
  return Math.min(100, Math.round((100 * found) / total));
}

/** Les cartes des archives, classe par classe (les classes jouables). */
function archiveCards(): [string, string[]][] {
  return CLASSES.filter((c) => c.playable).map((c) => [c.name, [...starterCards(c.id), ...rewardPool(c.id)]]);
}

/** Les archives de la guilde : cartes, objets, potions et monstres découverts. */
function archivesScreen(): string {
  const p = loadProfile();
  const tab = ui.archiveTab;
  const tabs = ([['cartes', 'Cartes'], ['objets', 'Objets'], ['potions', 'Potions'], ['monstres', 'Monstres']] as const)
    .map(([id, label]) => `<button type="button" class="onglet ${tab === id ? 'actif' : ''}" data-action="archives-onglet" data-tab="${id}">${label}</button>`).join('');
  let body = '';
  let count = '';
  if (tab === 'cartes') {
    const groups = archiveCards();
    const ids = groups.flatMap(([, list]) => list);
    const seen = ids.filter((id) => p.seenCards.includes(id));
    count = `${seen.length} / ${ids.length} cartes`;
    body = groups.map(([name, list]) => `<section class="table-loot"><h3>${name} · ${list.filter((id) => p.seenCards.includes(id)).length}/${list.length}</h3><div class="liste-deck archives-cartes">${list.map((id) => p.seenCards.includes(id)
      ? cardHtml({ uid: 0, id, upgraded: false }, { action: 'disabled' })
      : '<div class="carte-inconnue">???</div>').join('')}</div></section>`).join('');
  } else if (tab === 'objets') {
    const groups: [string, string[]][] = [['Coffres et vendeur gobelin', COMMON_POOL],
      ...ELITE_ENCOUNTERS.map((e) => [e.name, LOOT_TABLES[e.loot!]] as [string, string[]]),
      ['Légendaires', Object.keys(ITEMS).filter((id) => ITEMS[id].rarity === 'legendaire')]];
    const all = groups.flatMap((g) => g[1]);
    count = `${all.filter((id) => p.discoveredItems.includes(id)).length} / ${all.length} objets`;
    body = groups.map(([name, ids]) => `<section class="table-loot"><h3>${name}</h3><div class="liste-objets">${ids.map((id) => p.discoveredItems.includes(id)
      ? itemHtml(id)
      : `<div class="objet inconnu"><span class="objet-icone">${SLOT_ICON[ITEMS[id].slot]}</span><div><b>???</b><span>${SLOT_LABEL[slotsFor(id)[0]]} · pas encore découvert</span></div></div>`).join('')}</div></section>`).join('');
  } else if (tab === 'potions') {
    count = `${POTION_IDS.filter((id) => p.seenPotions.includes(id)).length} / ${POTION_IDS.length} potions`;
    body = `<div class="liste-objets">${POTION_IDS.map((id) => p.seenPotions.includes(id)
      ? potionHtml(id)
      : `<div class="objet inconnu"><span class="objet-icone">${potionIcon(null, 30)}</span><div><b>???</b><span>Potion pas encore découverte</span></div></div>`).join('')}</div>`;
  } else {
    const ids = Object.keys(ENEMIES);
    count = `${ids.filter((id) => p.seenEnemies.includes(id)).length} / ${ids.length} monstres`;
    body = `<div class="bestiaire">${ids.map((id) => {
      const d = ENEMIES[id];
      const seen = p.seenEnemies.includes(id);
      const kills = p.kills[id] ?? 0;
      const kind = d.boss ? 'Boss' : d.elite ? 'Boss secondaire' : 'Monstre';
      return `<div class="fiche-monstre ${seen ? '' : 'inconnu'}">
        <img class="px" src="${A(`ennemi_${id}.png`)}" alt="">
        <div><b>${seen ? d.name : '???'}</b><em>${kind}${seen ? ` · ${d.hpMax} PV · vaincu ${kills} fois` : ''}</em>
        <span>${seen ? LORE[id] ?? '' : 'Pas encore rencontré.'}</span>${seen && d.passive ? `<span class="passif-ennemi">${d.passive}</span>` : ''}</div>
      </div>`;
    }).join('')}</div>`;
  }
  return `<div class="ecran ecran-archives">
    <div class="tete-talents"><h2>Archives de la guilde</h2><span class="points-talent">${count}</span></div>
    <div class="onglets">${tabs}</div>
    <div class="contenu-archives">${body}</div>
    <button type="button" class="gros-bouton secondaire" data-action="titre">Retour au hall</button>
  </div>`;
}

/** Le choix du niveau de difficulté, dans le hall. */
function difficultyPicker(): string {
  const max = maxDifficulty();
  const d = chosenDifficulty();
  const text = d === 0
    ? (max === 0 ? 'Gagne une expédition pour débloquer la difficulté 1.' : 'Difficulté normale.')
    : `${DIFFICULTY_TEXT[d]}${d > 1 ? ` <i>(+ les ${d - 1} contrainte${d > 2 ? 's' : ''} précédente${d > 2 ? 's' : ''})</i>` : ''}`;
  return `<div class="choix-difficulte">
    <div class="ligne-difficulte">
      <button type="button" class="bouton" data-action="difficulte" data-delta="-1" ${d === 0 ? 'disabled' : ''} aria-label="Difficulté plus basse">◀</button>
      <b>Difficulté ${d}</b><span class="max-difficulte">/ ${max}</span>
      <button type="button" class="bouton" data-action="difficulte" data-delta="1" ${d >= max ? 'disabled' : ''} aria-label="Difficulté plus haute">▶</button>
      <button type="button" class="bouton" data-action="voir-difficultes">Les 20 niveaux</button>
    </div>
    <p>${text}</p>
  </div>`;
}

/** Tout premier lancement : le titre du jeu, puis le choix de la classe. */
function firstLaunchScreen(): string {
  return `<div class="ecran">
    <img class="px sprite-titre" src="${A('guerrier.png')}" alt="">
    <div class="titre-jeu">Wipe &amp; Loot</div>
    <div class="sous-titre">Un deckbuilder roguelite dans les raids d'Eldrava</div>
    <div class="actions">
      <button type="button" class="gros-bouton" data-action="nouvelle">Commencer</button>
      ${fullscreenButton('gros-bouton secondaire')}
    </div>
    <p>Choisis ta classe, entre dans les Profondeurs Ardentes, et choisis ton chemin : combats, boss secondaires, coffres, feux de camp et rencontres inattendues. Tu peux wiper : on paie la réparation et on retente. La partie est sauvegardée automatiquement dans ce navigateur.</p>
  </div>`;
}

/** Confirmer l'abandon de l'expédition en cours. */
function confirmAbandonHtml(): string {
  const saved = localSave.load();
  return `<div class="overlay"><div class="ecran" style="gap:16px">
    <h2>Abandonner l'expédition en cours ?</h2>
    <p>Elle sera perdue${saved?.heirloom ? `, ainsi que l'objet emporté du coffre (${ITEMS[saved.heirloom].name})` : ''}. Tu ne gagneras pas d'expérience pour elle.</p>
    <div class="actions">
      <button type="button" class="gros-bouton" data-action="nouvelle-confirmee">Oui, partir en nouvelle expédition</button>
      <button type="button" class="gros-bouton secondaire" data-action="fermer">Non</button>
    </div>
  </div></div>`;
}

function potionReward(run: RunState, id: string): string {
  const free = run.potions.includes(null);
  const buttons = free
    ? '<button type="button" class="bouton-objet" data-action="prendre-potion">Prendre</button>'
    : run.potions.map((p, i) => `<button type="button" class="bouton-objet" data-action="prendre-potion" data-slot="${i}">Remplacer : ${POTIONS[p!].name}</button>`).join('');
  return `<div class="butin butin-potion"><span class="butin-titre">Potion</span>${potionHtml(id)}<div class="choix-objet">${buttons}<button type="button" class="bouton-objet secondaire" data-action="laisser-potion">Laisser</button></div></div>`;
}

function spellHtml(id: string): string {
  const d = SPELLS[id];
  return `<div class="objet sort-fiche"><span class="objet-icone">${ICON[d.icon]}</span><div><b>${d.name}</b><em>Sort de barre · ${d.cost > 0 ? `${d.cost} énergie` : 'gratuit'} · ${d.once ? 'une fois par combat' : `recharge ${d.cooldown} tours`}</em><span>${d.text}</span></div></div>`;
}

function spellReward(run: RunState, id: string): string {
  const full = run.spells.length >= barCapacity(run);
  const buttons = full
    ? run.spells.map((s, i) => `<button type="button" class="bouton-objet" data-action="apprendre" data-index="${i}">Remplacer : ${SPELLS[s].name}</button>`).join('')
    : '<button type="button" class="bouton-objet" data-action="apprendre">Ajouter à ta barre</button>';
  return `<div class="butin"><span class="butin-titre">Sort de barre</span>${spellHtml(id)}<div class="choix-objet">${buttons}<button type="button" class="bouton-objet secondaire" data-action="laisser-sort">Laisser</button></div></div>`;
}

function rewardScreen(run: RunState): string {
  const cards = run.rewardChoices.map((id) => cardHtml({ uid: 0, id, upgraded: false }, { action: `data-action="recompense" data-id="${id}"` })).join('');
  const crowded = (run.pendingItem || run.pendingPotion || run.pendingSpell) && run.rewardChoices.length > 0;
  return `${topbar(run, run.hp)}<div class="ecran ${crowded ? 'serre' : ''}">
    <h2>${run.rewardTitle}</h2>
    ${run.rewardGold > 0 ? `<div class="gain-or">${ICON.piece}<span>+${run.rewardGold} or</span></div>` : ''}
    ${run.questNote ? `<div class="note-quete"><span class="butin-titre">Objet de quête</span><p>${run.questNote}</p></div>` : ''}
    ${run.pendingSpell ? spellReward(run, run.pendingSpell) : ''}
    ${run.pendingItem || run.pendingPotion ? `<div class="butins">
      ${run.pendingItem ? `<div class="butin"><span class="butin-titre">${run.pendingAlts.length ? 'Butin · au choix' : 'Butin'}</span>${itemHtml(run.pendingItem)}${equipChoices(run, run.pendingItem, 'data-action="equiper"', run.pendingAlts.length ? '' : '<button type="button" class="bouton-objet secondaire" data-action="laisser">Laisser</button>')}</div>` : ''}
      ${run.pendingItem ? run.pendingAlts.map((alt, i) => `<div class="butin"><span class="butin-titre">ou</span>${itemHtml(alt)}${equipChoices(run, alt, `data-action="equiper" data-alt="${i}"`, i === run.pendingAlts.length - 1 ? '<button type="button" class="bouton-objet secondaire" data-action="laisser">Aucun</button>' : '')}</div>`).join('') : ''}
      ${run.pendingPotion ? potionReward(run, run.pendingPotion) : ''}
    </div>` : ''}
    ${run.rewardChoices.length > 0 ? '<p>Choisis une carte à ajouter à ton deck.</p>' : ''}
    ${run.rewardChoices.length > 0 ? `<div class="choix-cartes ${crowded ? 'compact' : ''}">${cards}</div>` : ''}
    <button type="button" class="gros-bouton secondaire" data-action="recompense" data-id="">${run.rewardChoices.length > 0 ? 'Passer' : 'Continuer'}</button>
  </div>`;
}

/** Avant d'améliorer : la carte telle qu'elle est, et telle qu'elle sera. */
function upgradePreview(run: RunState, uid: number, label: string, confirm: string): string {
  const card = run.deck.find((c) => c.uid === uid);
  if (!card) return '';
  return `<div class="ecran" style="gap:18px">
    <h2>Améliorer ${CARDS[card.id].name} ?</h2>
    <div class="apercu-amelioration">
      ${cardHtml(card, { action: 'disabled' })}
      <span class="fleche-amelioration">→</span>
      ${cardHtml({ ...card, upgraded: true }, { action: 'disabled' })}
    </div>
    <div class="actions">
      <button type="button" class="gros-bouton" ${confirm} data-uid="${uid}">${label}</button>
      <button type="button" class="gros-bouton secondaire" data-action="annuler-amelioration">Choisir une autre carte</button>
    </div>
  </div>`;
}

function campfireScreen(run: RunState): string {
  if (ui.campfireUpgrade && ui.upgradeUid !== null) {
    return `${topbar(run, run.hp)}${upgradePreview(run, ui.upgradeUid, 'Améliorer cette carte', 'data-action="ameliorer"')}`;
  }
  if (ui.campfireUpgrade) {
    const cards = run.deck.map((card) => cardHtml(card, {
      action: card.upgraded || CARDS[card.id].unplayable ? 'disabled' : `data-action="apercu-amelioration" data-uid="${card.uid}"`,
      disabled: card.upgraded || CARDS[card.id].unplayable,
    })).join('');
    return `${topbar(run, run.hp)}<div class="ecran" style="justify-content:flex-start;padding-top:70px;gap:14px">
      <h2>Le maître de classe</h2>
      <p>Choisis une carte à améliorer.</p>
      <div class="liste-deck">${cards}</div>
      <button type="button" class="gros-bouton secondaire" data-action="feu-retour">Retour</button>
    </div>`;
  }
  const heal = campfireHealAmount(run);
  return `${topbar(run, run.hp)}<div class="ecran">
    <h2>Feu de camp</h2>
    <p>La chaleur de la montagne se fait oublier un instant. Prends le temps de souffler, ou de t'entraîner.</p>
    ${canReforge(run) ? `<p class="texte-evenement classe">Tu poses la Lame brisée sur les braises, et le Cœur de la montagne se met à battre. Reforger Brisemonts prend toute la nuit : pas de repos ni d'entraînement. L'épée remplacera ton arme actuelle.</p>${itemHtml('brisemonts')}` : ''}
    <div class="actions">
      ${canReforge(run) ? '<button type="button" class="gros-bouton legendaire" data-action="reforger">Reforger Brisemonts</button>' : ''}
      <button type="button" class="gros-bouton" data-action="repos">Se reposer (+${heal} PV)</button>
      <button type="button" class="gros-bouton secondaire" data-action="feu-ameliorer">Améliorer une carte</button>
    </div>
  </div>`;
}

function wipeScreen(run: RunState): string {
  const bill = repairBill(run);
  const canPay = run.gold >= bill;
  const breakable = breakableSlots(run).length > 0;
  return `${topbar(run, 0)}<div class="ecran">
    <h1>Wipe !</h1>
    <p>Tu peux retenter le combat depuis le début, avec au moins la moitié de tes PV et les potions que tu avais en entrant. Il te reste ${run.wipesLeft} wipe${run.wipesLeft > 1 ? 's' : ''}.</p>
    <div class="facture">
      <span class="facture-titre">Facture de réparation</span>
      <b>${ICON.piece} ${bill} or</b>
      <span>${canPay ? `Tu as ${run.gold} or.` : breakable ? `Tu n'as que ${run.gold} or : <strong class="mention-brise">un de tes objets, au hasard, sera brisé</strong>. Son effet sera désactivé jusqu'à ce que le vendeur gobelin le répare.` : `Tu n'as que ${run.gold} or, mais aucun objet à briser : le gobelin te fait crédit, pour cette fois.`}</span>
    </div>
    <div class="actions">
      <button type="button" class="gros-bouton" data-action="retenter">${canPay ? `Payer ${bill} or et retenter` : breakable ? 'Retenter (un objet sera brisé)' : 'Retenter le combat'}</button>
      <button type="button" class="gros-bouton secondaire" data-action="abandonner">Abandonner la run</button>
    </div>
  </div>`;
}

function chestGrid(ids: string[], action: (i: number) => string): string {
  return `<div class="grille-equipement">${ids.map((id, i) => `<button type="button" class="article-coffre" ${action(i)}>${itemHtml(id)}</button>`).join('')}</div>`;
}

/** Le passage au coffre de la guilde, sur l'écran de victoire. */
function chestPanel(run: RunState): string {
  const profile = loadProfile();
  const back = heirloomSlot(run) ? ITEMS[run.heirloom!].name : null;
  if (run.chestDone) {
    const lines = [
      back ? `${back} est revenu au coffre.` : '',
      run.chestDeposit ? `Tu as déposé ${ITEMS[run.chestDeposit].name} dans le coffre.` : 'Tu n\'as rien déposé.',
    ].filter(Boolean).join(' ');
    return `<div class="coffre-fin"><span class="butin-titre">Coffre de la guilde · ${profile.guildChest.length}/${CHEST_SIZE}</span><p>${lines}</p></div>`;
  }
  if (ui.depositSlot) {
    const id = run.equipment[ui.depositSlot]!;
    return `<div class="coffre-fin"><span class="butin-titre">Le coffre est plein</span>
      <p>Quel objet du coffre ${ITEMS[id].name} doit-il remplacer ? L'objet remplacé est perdu.</p>
      ${chestGrid(profile.guildChest, (i) => `data-action="remplacer-coffre" data-index="${i}"`)}
      <button type="button" class="bouton-objet secondaire" data-action="annuler-depot">Retour</button>
    </div>`;
  }
  const slots = depositableSlots(run);
  return `<div class="coffre-fin"><span class="butin-titre">Coffre de la guilde · ${profile.guildChest.length}/${CHEST_SIZE}</span>
    <p>${back ? `${back} reviendra au coffre. ` : ''}${slots.length > 0 ? 'Choisis un objet à mettre à l\'abri pour tes prochaines runs.' : 'Tu n\'as aucun objet à déposer.'}</p>
    ${slots.length > 0 ? `<div class="grille-equipement">${slots.map((k) => `<button type="button" class="article-coffre" data-action="deposer" data-slot="${k}">${itemHtml(run.equipment[k])}</button>`).join('')}</div>` : ''}
    <button type="button" class="bouton-objet secondaire" data-action="deposer">${slots.length > 0 ? 'Ne rien déposer' : 'Continuer'}</button>
  </div>`;
}

/** Le bilan de la run : le score ligne par ligne, puis l'expérience et le niveau de classe. */
function summaryHtml(sum: RunSummary, classId = 'guerrier'): string {
  const rows = sum.lines.map((l) => `<div class="ligne-score"><span>${l.label}</span><b class="${l.points < 0 ? 'negatif' : ''}">${l.points > 0 ? '+' : ''}${l.points}</b></div>`).join('');
  const up = sum.levelAfter > sum.levelBefore;
  const pct = sum.needed ? Math.round((sum.into / sum.needed) * 100) : 100;
  return `<div class="bilan">
    <div class="bilan-score">${rows}<div class="ligne-score total"><span>Score</span><b>${sum.score}</b></div></div>
    <div class="bilan-xp">
      <span class="butin-titre">${classInfo(classId).name}</span>
      <b class="gain-xp">+${sum.xp} expérience${sum.catchup ? ' <em>(×2 : rattrapage)</em>' : ''}</b>
      <div class="niveau">Niveau ${sum.levelAfter}${sum.levelAfter === MAX_LEVEL ? ' (maximum)' : ''}</div>
      <div class="barre-xp"><div style="width:${pct}%"></div><span>${sum.needed ? `${sum.into} / ${sum.needed}` : 'Niveau maximum'}</span></div>
      ${up ? `<p class="niveau-gagne">Niveau supérieur ! +${sum.levelAfter - sum.levelBefore} point${sum.levelAfter - sum.levelBefore > 1 ? 's' : ''} de talent</p>` : ''}
      ${sum.newDifficulty ? `<p class="niveau-gagne">Difficulté ${sum.newDifficulty} débloquée : ${DIFFICULTY_TEXT[sum.newDifficulty]}</p>` : ''}
    </div>
  </div>`;
}

/** L'écran des classes : au premier lancement, on choisit sa classe de départ ; ensuite, on les consulte. */
function classScreen(): string {
  const profile = loadProfile();
  const first = !profile.startClass;
  const cards = CLASSES.map((c) => {
    const unlocked = profile.unlockedClasses.includes(c.id);
    const stars = '★'.repeat(c.difficulty) + '<i>' + '★'.repeat(3 - c.difficulty) + '</i>';
    const canUnlock = !first && c.playable && !unlocked && unlocksAvailable(profile) > 0;
    const active = !first && unlocked && c.id === activeClass(profile);
    const status = !c.playable ? 'En préparation' : active ? 'Jouée' : unlocked ? 'Débloquée · la jouer' : first ? 'Disponible' : canUnlock ? 'La débloquer' : 'À débloquer';
    const action = first && c.playable ? `data-action="classe-depart" data-id="${c.id}"`
      : canUnlock ? `data-action="debloquer" data-id="${c.id}"`
      : unlocked && c.playable && !active ? `data-action="classe-active" data-id="${c.id}"` : 'disabled';
    return `<button type="button" class="fiche-classe ${c.playable ? '' : 'bientot'} ${unlocked ? 'debloquee' : ''}" ${action} style="--couleur:${c.color}">
      <div class="tete-classe"><span class="embleme">${c.name[0]}</span><div><b>${c.name}</b><span class="etoiles">${stars}</span></div><em class="statut-classe">${status}</em></div>
      <q>${c.quote}</q>
      <dl><dt>Rôle</dt><dd>${c.role}</dd><dt>Ressource</dt><dd>${c.resource}</dd><dt>PV</dt><dd>${c.hp}</dd></dl>
      <p>${c.fantasy}</p>
    </button>`;
  }).join('');
  const next = nextUnlockAt(profile);
  const intro = first
    ? 'Choisis ta classe de départ. Les autres se débloqueront avec l\'expérience, et c\'est toi qui choisiras laquelle. Dans ce prototype, le Guerrier et le Mage sont jouables : les autres classes sont en préparation.'
    : `Expérience totale : ${totalXp(profile)}${next ? ` · prochaine classe à ${next}` : ''}.${unlocksAvailable(profile) > 0 ? ` <b>${unlocksAvailable(profile)} classe${unlocksAvailable(profile) > 1 ? 's' : ''} à débloquer</b> : touche celle que tu veux.` : ''} Touche une classe débloquée pour la jouer.`;
  return `<div class="ecran ecran-classes">
    <h2>${first ? 'Choisis ta classe' : 'Les classes'}</h2>
    <p>${intro}</p>
    <div class="grille-classes">${cards}</div>
    <button type="button" class="gros-bouton secondaire" data-action="titre">Retour</button>
  </div>`;
}

/** La classe jouée depuis le hall : celle choisie, si elle est débloquée, sinon la classe de départ. */
function activeClass(profile = loadProfile()): string {
  const id = profile.currentClass;
  if (id && profile.unlockedClasses.includes(id) && CLASS_BY_ID[id]?.playable) return id;
  return profile.startClass ?? 'guerrier';
}

/** La répartition de talents de la classe jouée, ramenée aux points disponibles. */
function myAlloc(): TalentAlloc {
  const profile = loadProfile();
  const cls = activeClass(profile);
  return clampAlloc(profile.talents[cls] ?? emptyAlloc(cls), classLevel(profile, cls).level, cls);
}

/** L'écran des talents : 3 arbres de 5 paliers. */
function talentScreen(): string {
  const profile = loadProfile();
  const cls = activeClass(profile);
  const points = classLevel(profile, cls).level;
  const alloc = myAlloc();
  const left = points - pointsUsed(alloc);
  const cols = treesFor(cls).map((tree) => {
    const picks = alloc[tree.id] ?? [];
    const tiers = tree.tiers.map((options, tier) => {
      const open = tier <= picks.length;
      const buttons = options.map((d, i) => {
        const choice: Choice = i === 0 ? 'A' : 'B';
        const taken = picks[tier] === choice;
        const can = taken || (tier < picks.length) || (tier === picks.length && left > 0);
        const kind = d.spell ? 'Sort de barre' : d.card ? 'Carte épique' : 'Passif';
        const action = can ? `data-action="talent" data-tree="${tree.id}" data-tier="${tier}" data-choice="${choice}"` : 'disabled';
        if (d.card) {
          // La carte épique : son illustration, son coût et ce qu'elle fait (normale et améliorée).
          const c = CARDS[d.card];
          const cost = `${c.cost} énergie${c.rageCost ? ` + ${c.rageCost === 'all' ? 'toute ta' : c.rageCost} rage` : ''}`;
          return `<button type="button" class="talent epique ${taken ? 'pris' : ''}" ${action}>
            <img class="px illu-talent" src="${A(`carte_${d.card}.png`)}" alt="">
            <div><b>${d.name}</b><em>Carte épique · ${c.type} · ${cost}</em><span>${c.text(false)}</span><span class="ameliore">Améliorée : ${c.text(true)}</span><span class="note-talent">Un exemplaire dans ton deck de départ.</span></div></button>`;
        }
        return `<button type="button" class="talent ${taken ? 'pris' : ''}" ${action}>
          <b>${d.name}</b><em>${kind}</em><span>${d.text}</span></button>`;
      }).join('<span class="ou">ou</span>');
      return `<div class="palier ${open ? '' : 'ferme'}"><span class="num-palier">${tier + 1}</span><div class="choix-palier">${buttons}</div></div>`;
    }).join('');
    return `<section class="arbre"><h3>${tree.name} <span>${picks.length}/5</span></h3><p>${tree.theme}</p>${tiers}</section>`;
  }).join('');
  return `<div class="ecran ecran-talents">
    <div class="tete-talents">
      <h2>Talents du ${classInfo(cls).name}</h2>
      <span class="points-talent">${left} point${left > 1 ? 's' : ''} à répartir sur ${points}</span>
    </div>
    <p>1 point par niveau de classe. Il faut un point dans un palier pour ouvrir le suivant. Touche un talent pris pour changer de choix, ou retirer le dernier palier d'un arbre. Le respec est gratuit entre deux runs.</p>
    <div class="arbres">${cols}</div>
    <div class="actions">
      <button type="button" class="gros-bouton secondaire" data-action="talents-reset">Tout réinitialiser</button>
      <button type="button" class="gros-bouton" data-action="titre">Retour</button>
    </div>
  </div>`;
}

function endScreen(run: RunState, victory: boolean): string {
  if (victory && !run.chestDone) {
    return `<div class="ecran" style="gap:14px">
      <h1>Vulkhar est vaincu !</h1>
      ${chestPanel(run)}
    </div>`;
  }
  return `<div class="ecran" style="gap:14px">
    <h1>${victory ? 'Vulkhar est vaincu !' : 'Fin de la run'}</h1>
    <p>${victory ? `Bravo : tu as traversé les Profondeurs Ardentes avec ${run.hp} PV et ${(run.maxWipes ?? MAX_WIPES) - run.wipesLeft} wipe${(run.maxWipes ?? MAX_WIPES) - run.wipesLeft > 1 ? 's' : ''}${run.difficulty ? `, en difficulté ${run.difficulty}` : ''}.` : 'Les Profondeurs Ardentes ont eu raison de toi. La guilde enverra un autre champion.'}</p>
    ${run.summary ? summaryHtml(run.summary, run.classId) : ''}
    ${victory ? chestPanel(run) : run.heirloom ? `<p class="mention-brise">${ITEMS[run.heirloom].name}, emporté du coffre de la guilde, est perdu.</p>` : ''}
    <div class="actions"><button type="button" class="gros-bouton" data-action="titre">Retour au hall de la guilde</button></div>
  </div>`;
}

function overlayHtml(run: RunState | null): string {
  if (ui.overlay === 'abandon') return confirmAbandonHtml();
  if (ui.overlay === 'difficultes') {
    const max = maxDifficulty();
    const rows = DIFFICULTY_TEXT.map((t, i) => `<li class="${i <= max ? 'debloque' : ''} ${i === chosenDifficulty() ? 'choisi' : ''}"><b>${i}</b><span>${t}</span>${i > max ? '<em>verrouillé</em>' : ''}</li>`).join('');
    return `<div class="overlay"><div class="ecran" style="justify-content:flex-start;padding-top:28px;gap:10px">
      <h2>Les niveaux de difficulté</h2>
      <p>Chaque niveau ajoute une contrainte à toutes celles des niveaux précédents. Gagner une expédition débloque le niveau suivant. Chaque niveau donne +5 % de score.</p>
      <ol class="liste-difficultes">${rows}</ol>
      <button type="button" class="gros-bouton secondaire" data-action="fermer">Fermer</button>
    </div></div>`;
  }
  if (ui.overlay === 'coffre') {
    const chest = loadProfile().guildChest;
    return `<div class="overlay"><div class="ecran" style="gap:16px">
      <h2>Le coffre de la guilde · ${chest.length}/${CHEST_SIZE}</h2>
      <p>Après une run gagnée, tu y déposes un objet. Au début d'une run, tu peux en emporter un.</p>
      ${chest.length > 0 ? `<div class="grille-equipement">${chest.map((id) => itemHtml(id)).join('')}</div>` : '<p><i>Le coffre est vide pour l\'instant.</i></p>'}
      <button type="button" class="gros-bouton secondaire" data-action="fermer">Fermer</button>
    </div></div>`;
  }
  if (!run) return '';
  if (ui.overlay === 'pile' && run.combat) {
    const c = run.combat;
    const kind = ui.pileKind;
    // La pioche est montrée triée : on ne dévoile pas l'ordre des cartes.
    const list = kind === 'draw' ? [...c.draw].sort((a, b) => CARDS[a.id].name.localeCompare(CARDS[b.id].name)) : kind === 'discard' ? c.discard : c.exhaust;
    const title = kind === 'draw' ? 'Pioche' : kind === 'discard' ? 'Défausse' : 'Cartes épuisées';
    return `<div class="overlay"><div class="ecran" style="justify-content:flex-start;padding-top:40px;gap:14px">
      <h2>${title} (${list.length} carte${list.length > 1 ? 's' : ''})</h2>
      ${kind === 'draw' ? '<p>Dans le désordre : l\'ordre de la pioche reste secret.</p>' : ''}
      <div class="liste-deck">${list.map((card) => cardHtml(card, { action: 'disabled' })).join('') || '<p><i>Aucune carte.</i></p>'}</div>
      <button type="button" class="gros-bouton secondaire" data-action="fermer">Fermer</button>
    </div></div>`;
  }
  if (ui.overlay === 'deck') {
    const cards = run.deck.map((card) => cardHtml(card, { action: 'disabled' })).join('');
    return `<div class="overlay"><div class="ecran" style="justify-content:flex-start;padding-top:40px;gap:14px">
      <h2>Ton deck (${run.deck.length} cartes)</h2>
      <div class="liste-deck">${cards}</div>
      <button type="button" class="gros-bouton secondaire" data-action="fermer">Fermer</button>
    </div></div>`;
  }
  if (ui.overlay === 'potion' && ui.potionSlot !== null && run.potions[ui.potionSlot]) {
    const slot = ui.potionSlot;
    const id = run.potions[slot]!;
    const drinkable = canDrink(run, slot);
    const why = drinkable ? '' : run.screen === 'combat' ? '' : POTIONS[id].heal ? 'Tu as déjà tous tes PV.' : 'Cette potion se boit en combat.';
    return `<div class="overlay" data-action="fermer"><div class="ecran" style="gap:16px">
      ${potionHtml(id)}
      ${why ? `<p>${why}</p>` : ''}
      <div class="choix-objet">
        <button type="button" class="bouton-objet" ${drinkable ? `data-action="boire" data-slot="${slot}"` : 'disabled'}>Boire</button>
        <button type="button" class="bouton-objet secondaire" data-action="jeter" data-slot="${slot}">Jeter</button>
        <button type="button" class="bouton-objet secondaire" data-action="fermer">Fermer</button>
      </div>
    </div></div>`;
  }
  if (ui.overlay === 'equipement') {
    const slots = SLOT_KEYS.map((k) => itemHtml(run.equipment[k], SLOT_LABEL[k], '', run.broken.includes(k))).join('');
    return `<div class="overlay"><div class="ecran" style="gap:16px">
      <h2>Équipement</h2>
      <div class="grille-equipement">${slots}</div>
      <h3 class="titre-barre">Barre de sorts · ${run.spells.length}/${barCapacity(run)}</h3>
      <div class="grille-equipement">${run.spells.map((id) => spellHtml(id)).join('')}</div>
      <button type="button" class="gros-bouton secondaire" data-action="fermer">Fermer</button>
    </div></div>`;
  }
  if (ui.overlay === 'loot') {
    const profile = loadProfile();
    const elites = run.map.nodes.filter((n) => n.type === 'elite' && n.elite !== undefined);
    const seen = new Set<number>();
    const blocks = elites.filter((n) => !seen.has(n.elite!) && seen.add(n.elite!)).map((n) => {
      const enc = ELITE_ENCOUNTERS[n.elite!];
      const floors = elites.filter((m) => m.elite === n.elite).map((m) => m.floor + 1).join(', ');
      const table = enc.loot ? LOOT_TABLES[enc.loot] : [];
      const list = table.map((id) => profile.discoveredItems.includes(id)
        ? itemHtml(id)
        : `<div class="objet inconnu"><span class="objet-icone">${SLOT_ICON[ITEMS[id].slot]}</span><div><b>???</b><span>${SLOT_LABEL[slotsFor(id)[0]]} · pas encore découvert</span></div></div>`).join('');
      const spell = `<div class="objet inconnu"><span class="objet-icone">${ICON.charge}</span><div><b>Sort de barre de ta classe</b><span>Un sort que tu n'as pas encore</span></div></div>`;
      return `<section class="table-loot"><h3>${enc.name} <span>· étage${floors.includes(',') ? 's' : ''} ${floors}</span></h3><div class="liste-objets">${list}${spell}</div></section>`;
    }).join('');
    return `<div class="overlay"><div class="ecran" style="justify-content:flex-start;padding-top:36px;gap:14px">
      <h2>Tables de loot</h2>
      <p>Les boss secondaires de cette carte, et ce qu'ils peuvent faire tomber. Un objet reste caché tant que tu ne l'as jamais obtenu.</p>
      <div class="tables-loot">${blocks}</div>
      <button type="button" class="gros-bouton secondaire" data-action="fermer">Fermer</button>
    </div></div>`;
  }
  if (ui.overlay === 'menu') {
    return `<div class="overlay"><div class="ecran">
      <h2>Menu</h2>
      <p>La partie est sauvegardée après chaque action : tu peux fermer le navigateur et revenir plus tard.</p>
      <div class="actions">
        <button type="button" class="gros-bouton" data-action="fermer">Reprendre</button>
        <button type="button" class="gros-bouton secondaire" data-action="titre">Retour au hall de la guilde</button>
      </div>
    </div></div>`;
  }
  return '';
}

// ---------- Boucle de rendu ----------

export function render(): void {
  const run = ui.run;
  if (!run) {
    stage.innerHTML = ui.archivesScreen ? archivesScreen() : ui.classScreen ? classScreen() : ui.talentScreen ? talentScreen() : titleScreen() + overlayHtml(null);
    return;
  }
  let html = '';
  switch (run.screen) {
    case 'map': html = mapScreen(run); break;
    case 'event': html = eventScreen(run); break;
    case 'blessing': html = blessingScreen(run); break;
    case 'shop': html = shopScreen(run); break;
    case 'combat': html = run.combat ? combatScreen(run, run.combat) : ''; break;
    case 'reward': html = rewardScreen(run); break;
    case 'campfire': html = campfireScreen(run); break;
    case 'wipe': html = wipeScreen(run); break;
    case 'victory': html = endScreen(run, true); break;
    case 'gameover': html = endScreen(run, false); break;
  }
  stage.innerHTML = html + overlayHtml(run);
}

async function commit(): Promise<void> {
  const run = ui.run;
  const events = run?.combat?.fx?.splice(0) ?? [];
  // On sauvegarde tout de suite : fermer le jeu pendant une animation ne perd pas l'action.
  if (run) localSave.save(run);
  if (events.length > 0) {
    busy = true;
    try {
      await playFx(events);
    } finally {
      busy = false;
    }
  }
  if (run) {
    afterCombatAction(run);
    // Fin de run : score, expérience et niveau de classe (une seule fois).
    if ((run.screen === 'victory' || run.screen === 'gameover') && !run.summary) {
      const profile = loadProfile();
      run.summary = awardRun(profile, run, run.classId);
      recordKills(profile, run.kills ?? {});
      saveProfile(profile);
    }
    rememberArchives(run);
    localSave.save(run);
    rememberItems(run);
  }
  render();
}

/** Cache tout de suite la carte jouée, pendant que l'animation se joue. */
function hideCard(index: number): void {
  const el = stage.querySelector<HTMLElement>(`.main [data-index="${index}"]`);
  if (el) el.style.visibility = 'hidden';
}

/** Le plus haut niveau de difficulté débloqué pour la classe jouée. */
function maxDifficulty(): number {
  const profile = loadProfile();
  return profile.difficulty?.[activeClass(profile)] ?? 0;
}

/** Le niveau de difficulté choisi dans le hall (le dernier utilisé, dans la limite de ce qui est débloqué). */
function chosenDifficulty(): number {
  return Math.min(loadProfile().lastDifficulty ?? 0, maxDifficulty());
}

/** Lance une expédition depuis le hall, avec l'objet du coffre choisi. */
function launchFromHall(): void {
  let heirloom: string | null = null;
  if (ui.heirloom !== null) {
    const profile = loadProfile();
    heirloom = takeHeirloom(profile, ui.heirloom);
    saveProfile(profile); // retiré du coffre tout de suite : recharger la page ne le duplique pas
    ui.heirloom = null;
  }
  startNewRun(heirloom);
}

function startNewRun(heirloom: string | null = null): void {
  ui.depositSlot = null;
  const cls = activeClass();
  ui.run = newRun(undefined, heirloom, talentIds(myAlloc(), cls), chosenDifficulty(), cls);
  offerBlessing(ui.run);
  ui.blessingRemove = false;
  ui.selection = null;
  ui.overlay = null;
  ui.campfireUpgrade = false;
  commit();
}

function onCard(index: number): void {
  const c = ui.run?.combat;
  if (!c || !canPlayCard(c, index)) return;
  const sel = ui.selection;
  if (sel?.kind === 'card' && sel.index === index) {
    ui.selection = null;
    render();
    return;
  }
  const def = CARDS[c.hand[index].id];
  const alive = c.enemies.filter((e) => !e.dead);
  if (def.needsTarget && alive.length > 1) {
    ui.selection = { kind: 'card', index };
    render();
    return;
  }
  hideCard(index);
  playCard(c, index);
  ui.selection = null;
  void commit();
}

function onSpell(index: number): void {
  const c = ui.run?.combat;
  if (!c || !canUseSpell(c, index)) return;
  const sel = ui.selection;
  const def = SPELLS[c.spells[index].id];
  const targets = c.enemies.filter((e) => !e.dead && !e.submerged && !e.untargetable).length;
  // 1er appui : on affiche le sort (lisible aussi sur téléphone). 2e appui : on le lance.
  if (sel?.kind !== 'spell' || sel.index !== index) {
    ui.selection = { kind: 'spell', index };
    render();
    return;
  }
  if (def.needsTarget && targets > 1) {
    ui.selection = null;
    render();
    return;
  }
  useSpell(c, index);
  ui.selection = null;
  commit();
}

function onTarget(uid: number): void {
  const c = ui.run?.combat;
  const sel = ui.selection;
  if (!c || !sel) return;
  if (sel.kind === 'card') {
    hideCard(sel.index);
    playCard(c, sel.index, uid);
  } else {
    useSpell(c, sel.index, uid);
  }
  ui.selection = null;
  commit();
}

function handleClick(ev: MouseEvent): void {
  if (busy) return;
  const el = (ev.target as HTMLElement).closest<HTMLElement>('[data-action]');
  if (!el || (el as HTMLButtonElement).disabled) return;
  const run = ui.run;
  const action = el.dataset.action;
  switch (action) {
    case 'nouvelle': {
      if (!loadProfile().startClass) { ui.run = null; ui.overlay = null; ui.classScreen = true; render(); return; }
      const saved = localSave.load();
      const inProgress = saved && saved.screen !== 'gameover' && (saved.screen !== 'victory' || !saved.chestDone);
      // Depuis une run (menu) ou avec une run en cours : on revient au hall, ou on confirme l'abandon.
      if (ui.run && inProgress) { ui.run = null; ui.overlay = null; render(); return; }
      if (inProgress) { ui.run = null; ui.overlay = 'abandon'; render(); return; }
      launchFromHall();
      return;
    }
    case 'nouvelle-confirmee': ui.overlay = null; launchFromHall(); return;
    case 'difficulte': {
      const profile = loadProfile();
      profile.lastDifficulty = Math.max(0, Math.min(maxDifficulty(), chosenDifficulty() + Number(el.dataset.delta)));
      saveProfile(profile);
      render();
      return;
    }
    case 'voir-difficultes': ui.overlay = 'difficultes'; render(); return;
    case 'heritage': {
      const i = Number(el.dataset.index);
      ui.heirloom = ui.heirloom === i ? null : i;
      render();
      return;
    }
    case 'voir-coffre': ui.overlay = 'coffre'; render(); return;
    case 'continuer':
      ui.run = localSave.load();
      ui.overlay = null;
      // Une victoire ou un wipe sauvegardé pendant l'animation : commit() termine le combat et fait le bilan.
      void commit();
      return;
    case 'titre': ui.run = null; ui.overlay = null; ui.talentScreen = false; ui.classScreen = false; ui.archivesScreen = false; render(); return;
    case 'archives': ui.run = null; ui.overlay = null; ui.archivesScreen = true; render(); return;
    case 'archives-onglet': ui.archiveTab = el.dataset.tab as UiState['archiveTab']; render(); return;
    case 'classes': ui.run = null; ui.overlay = null; ui.classScreen = true; render(); return;
    case 'classe-depart': {
      const profile = loadProfile();
      if (chooseStartClass(profile, el.dataset.id!)) saveProfile(profile);
      ui.classScreen = false;
      startNewRun();
      return;
    }
    case 'classe-active': {
      const profile = loadProfile();
      if (profile.unlockedClasses.includes(el.dataset.id!)) {
        profile.currentClass = el.dataset.id!;
        saveProfile(profile);
      }
      ui.classScreen = false;
      render();
      return;
    }
    case 'debloquer': {
      const profile = loadProfile();
      if (unlockClass(profile, el.dataset.id!)) {
        profile.currentClass = el.dataset.id!;
        saveProfile(profile);
      }
      render();
      return;
    }
    case 'talents': ui.run = null; ui.overlay = null; ui.talentScreen = true; render(); return;
    case 'talent': {
      const profile = loadProfile();
      const cls = activeClass(profile);
      const alloc = myAlloc();
      if (toggleTalent(alloc, el.dataset.tree as TreeId, Number(el.dataset.tier), el.dataset.choice as Choice, classLevel(profile, cls).level, cls)) {
        profile.talents[cls] = alloc;
        saveProfile(profile);
      }
      render();
      return;
    }
    case 'talents-reset': {
      const profile = loadProfile();
      const cls = activeClass(profile);
      profile.talents[cls] = emptyAlloc(cls);
      saveProfile(profile);
      render();
      return;
    }
    case 'deck': ui.overlay = 'deck'; render(); return;
    case 'menu': ui.overlay = 'menu'; render(); return;
    case 'fermer': ui.overlay = null; render(); return;
    case 'equipement': ui.overlay = 'equipement'; render(); return;
    case 'loot': ui.overlay = 'loot'; render(); return;
    case 'pile': ui.overlay = 'pile'; ui.pileKind = el.dataset.pile as 'draw' | 'discard' | 'exhaust'; render(); return;
    case 'potion': ui.overlay = 'potion'; ui.potionSlot = Number(el.dataset.slot); render(); return;
    case 'plein-ecran': void toggleFullscreen(); return;
  }
  if (!run) return;
  switch (action) {
    case 'carte': onCard(Number(el.dataset.index)); break;
    case 'sort': onSpell(Number(el.dataset.index)); break;
    case 'cible': onTarget(Number(el.dataset.uid)); break;
    case 'posture':
      if (run.combat) changePosture(run.combat, el.dataset.posture as Posture);
      ui.selection = null;
      commit();
      break;
    case 'fin-tour':
      if (run.combat) endTurn(run.combat);
      ui.selection = null;
      commit();
      break;
    case 'recompense': chooseReward(run, el.dataset.id || null); commit(); break;
    case 'noeud': chooseNode(run, Number(el.dataset.id)); render(); commit(); break; // le combat s'affiche avant ses animations (embuscade, rune)
    case 'choix': resolveEvent(run, Number(el.dataset.index)); render(); commit(); break;
    case 'evenement-fin': leaveEvent(run); commit(); break;
    case 'benediction':
      if (el.dataset.id === 'allegement') { ui.blessingRemove = true; render(); break; }
      chooseBlessing(run, el.dataset.id!); commit(); break;
    case 'benediction-carte': chooseBlessing(run, 'allegement', Number(el.dataset.uid)); ui.blessingRemove = false; commit(); break;
    case 'benediction-retour': ui.blessingRemove = false; render(); break;
    case 'reforger': campfireReforge(run); commit(); break;
    case 'acheter': buyCard(run, Number(el.dataset.index)); commit(); break;
    case 'service': ui.shopMode = el.dataset.service as 'remove' | 'upgrade'; render(); break;
    case 'service-carte':
      if (ui.shopMode === 'remove') buyRemoval(run, Number(el.dataset.uid));
      else if (ui.shopMode === 'upgrade') buyUpgrade(run, Number(el.dataset.uid));
      ui.shopMode = null;
      ui.upgradeUid = null;
      commit();
      break;
    case 'apercu-amelioration': ui.upgradeUid = Number(el.dataset.uid); render(); break;
    case 'annuler-amelioration': ui.upgradeUid = null; render(); break;
    case 'boutique-retour': ui.shopMode = null; ui.upgradeUid = null; render(); break;
    case 'partir': ui.shopMode = null; ui.shopItem = null; ui.shopPotion = null; leaveShop(run); commit(); break;
    case 'equiper': equipPending(run, el.dataset.slot as SlotKey, el.dataset.alt === undefined ? undefined : Number(el.dataset.alt)); commit(); break;
    case 'laisser': leavePending(run); commit(); break;
    case 'boire': drinkPotion(run, Number(el.dataset.slot)); ui.overlay = null; ui.selection = null; commit(); break;
    case 'jeter': discardPotion(run, Number(el.dataset.slot)); ui.overlay = null; commit(); break;
    case 'prendre-potion': takePotion(run, el.dataset.slot === undefined ? undefined : Number(el.dataset.slot)); commit(); break;
    case 'laisser-potion': run.pendingPotion = null; commit(); break;
    case 'apprendre': learnSpell(run, el.dataset.index === undefined ? undefined : Number(el.dataset.index)); commit(); break;
    case 'laisser-sort': run.pendingSpell = null; commit(); break;
    case 'potion-boutique': ui.shopPotion = Number(el.dataset.index); render(); break;
    case 'annuler-potion': ui.shopPotion = null; render(); break;
    case 'acheter-potion': buyPotion(run, Number(el.dataset.index)); ui.shopPotion = null; commit(); break;
    case 'objet-boutique': ui.shopItem = Number(el.dataset.index); render(); break;
    case 'annuler-objet': ui.shopItem = null; render(); break;
    case 'acheter-objet': buyItem(run, Number(el.dataset.index), el.dataset.slot as SlotKey); ui.shopItem = null; commit(); break;
    case 'deposer': {
      const slot = (el.dataset.slot as SlotKey | undefined) ?? null;
      const profile = loadProfile();
      if (slot && chestRoomAfterReturn(profile, run) <= 0) { ui.depositSlot = slot; render(); break; }
      if (settleChest(profile, run, slot)) saveProfile(profile);
      commit();
      break;
    }
    case 'remplacer-coffre': {
      const profile = loadProfile();
      if (settleChest(profile, run, ui.depositSlot, Number(el.dataset.index))) saveProfile(profile);
      ui.depositSlot = null;
      commit();
      break;
    }
    case 'annuler-depot': ui.depositSlot = null; render(); break;
    case 'reparer': repairItem(run, el.dataset.slot as SlotKey); commit(); break;
    case 'repos': campfireRest(run); commit(); break;
    case 'feu-ameliorer': ui.campfireUpgrade = true; render(); break;
    case 'feu-retour': ui.campfireUpgrade = false; ui.upgradeUid = null; render(); break;
    case 'ameliorer': campfireUpgrade(run, Number(el.dataset.uid)); ui.campfireUpgrade = false; ui.upgradeUid = null; commit(); break;
    case 'retenter': retryAfterWipe(run); render(); commit(); break; // on affiche le combat avant la bannière « Objet brisé »
    case 'abandonner': abandonRun(run); commit(); break;
  }
}

function fit(): void {
  // La zone de jeu fait 1280 × 720 ; on l'agrandit ou la réduit pour qu'elle tienne dans l'écran.
  const w = window.visualViewport?.width ?? document.documentElement.clientWidth;
  const h = window.visualViewport?.height ?? document.documentElement.clientHeight;
  const scale = Math.min(w / 1280, h / 720);
  const x = (w - 1280 * scale) / 2;
  const y = (h - 720 * scale) / 2;
  stage.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
}

const PRELOAD = [
  'guerrier.png', 'mage.png', 'vendeur_gobelin.png', 'bregan.png',
  ...Object.keys(CARDS).map((id) => `carte_${id}.png`),
  ...Object.keys(ENEMIES).map((id) => `ennemi_${id}.png`),
  ...Object.values(RARITY_FRAME).flatMap((r) => [`cadre_${r}.png`, `cadre_${r}_rage.png`]),
];

export function mount(root: HTMLElement): void {
  for (const file of PRELOAD) new Image().src = A(file);
  stage = root;
  initFx(root);
  stage.addEventListener('click', handleClick);
  window.addEventListener('resize', fit);
  document.addEventListener('fullscreenchange', () => {
    fit();
    render();
  });
  window.visualViewport?.addEventListener('resize', fit);
  window.addEventListener('orientationchange', () => setTimeout(fit, 200));
  window.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape' && (ui.selection || ui.overlay)) {
      ui.selection = null;
      ui.overlay = null;
      render();
    }
  });
  fit();
  render();
}
