// L'interface : affiche l'état de la run et transmet les actions du joueur au moteur.
import { CARDS, energyCost } from './engine/cards';
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
import { ENEMIES, intentAt, isInterruptible } from './engine/enemies';
import { EVENTS } from './engine/events';
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
  retryAfterWipe,
  servicePrice,
  buyPotion,
  canDrink,
  discardPotion,
  drinkPotion,
  takePotion,
  breakableSlots,
  repairBill,
  repairItem,
} from './engine/run';
import { POTIONS } from './engine/potions';
import { CHEST_SIZE, chestRoomAfterReturn, depositableSlots, heirloomSlot, settleChest, takeHeirloom } from './engine/guild';
import { loadProfile, localSave, saveProfile } from './engine/save';
import { ITEMS, REPAIR_PRICE, SLOT_KEYS, SLOT_LABEL, LOOT_TABLES, slotsFor, type Slot, type SlotKey } from './engine/items';
import { ELITE_ENCOUNTERS } from './engine/enemies';
import { initFx, playFx } from './fx';
import type { CardInstance, CombatState, EnemyState, Intent, Posture, RunState } from './engine/types';

const A = (file: string) => `${import.meta.env.BASE_URL}assets/${file}`;

type Selection = { kind: 'card'; index: number } | { kind: 'spell'; index: number } | null;

interface UiState {
  run: RunState | null;
  selection: Selection;
  overlay: 'deck' | 'menu' | 'equipement' | 'loot' | 'potion' | 'coffre' | null;
  /** Potion ouverte (emplacement du joueur), ou potion du vendeur regardée. */
  potionSlot: number | null;
  shopPotion: number | null;
  campfireUpgrade: boolean;
  shopMode: 'remove' | 'upgrade' | null;
  shopItem: number | null;
  /** Écran du coffre avant une nouvelle run. */
  chestPick: boolean;
  /** Objet choisi pour le dépôt, quand le coffre est plein (on choisit ensuite quoi remplacer). */
  depositSlot: SlotKey | null;
}

const ui: UiState = { run: null, selection: null, overlay: null, campfireUpgrade: false, shopMode: null, shopItem: null, potionSlot: null, shopPotion: null, chestPick: false, depositSlot: null };
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

function cardHtml(card: CardInstance, opts: { action?: string; disabled?: boolean; selected?: boolean; combat?: CombatState | null; panicked?: boolean } = {}): string {
  const def = CARDS[card.id];
  const frame = `cadre_${RARITY_FRAME[def.rarity]}${def.rageCost !== undefined ? '_rage' : ''}.png`;
  const cost = opts.combat ? energyCost(opts.combat, card.id, card.upgraded) : card.upgraded && def.costUp !== undefined ? def.costUp : def.cost;
  const reduced = cost < def.cost;
  const rage = def.rageCost === 'all' ? 'X' : def.rageCost ?? '';
  const classes = ['carte', opts.disabled ? 'injouable' : '', opts.selected ? 'choisie' : '', opts.panicked ? 'paniquee' : ''].join(' ');
  return `<button type="button" class="${classes}" ${opts.action ?? ''} aria-label="${def.name}${card.upgraded ? ' améliorée' : ''}, coût ${cost}. ${def.text(card.upgraded)}">
    <img class="cadre px" src="${A(frame)}" alt="">
    <img class="icone px" src="${A(`icone_${def.icon}.png`)}" alt="">
    <span class="cout ${reduced ? 'reduit' : cost > def.cost ? 'augmente' : ''}">${def.unplayable ? '–' : cost}</span>
    ${opts.panicked ? '<span class="tampon-panique">Paniquée</span>' : ''}
    ${rage !== '' ? `<span class="cout-rage">${rage}</span>` : ''}
    <span class="titre ${card.upgraded ? 'ameliore' : ''} ${def.name.length + (card.upgraded ? 1 : 0) > 14 ? 'long' : ''}">${def.name}${card.upgraded ? '+' : ''}</span>
    <span class="type">${def.type}</span>
    <span class="texte ${def.text(card.upgraded).length > 42 ? 'long' : ''}">${def.text(card.upgraded)}</span>
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
  return `<div class="objet ${it.rarity} ${broken ? 'brise' : ''}"><span class="objet-icone">${SLOT_ICON[it.slot]}</span><div><b>${it.name}</b><em>${SLOT_LABEL[slotsFor(id)[0]]} · ${it.rarity === 'commun' ? 'commun' : it.rarity === 'rare' ? 'rare' : 'épique'}${broken ? ' · <strong class="mention-brise">brisé</strong>' : ''}</em><span>${broken ? `Effet désactivé jusqu'à la réparation (${REPAIR_PRICE[it.rarity]} or chez le vendeur gobelin). ` : ''}${it.text}</span></div>${extra}</div>`;
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

function rememberItems(run: RunState): void {
  const profile = loadProfile();
  const ids = [run.pendingItem, run.pendingAlt, ...SLOT_KEYS.map((k) => run.equipment[k])].filter((x): x is string => !!x);
  const fresh = ids.filter((id) => !profile.discoveredItems.includes(id));
  if (fresh.length > 0) {
    profile.discoveredItems.push(...fresh);
    saveProfile(profile);
  }
}

// ---------- Barre du haut ----------

function topbar(run: RunState, hp: number): string {
  const pips = Array.from({ length: MAX_WIPES }, (_, i) => `<i class="pip ${i < run.wipesLeft ? '' : 'vide'}"></i>`).join('');
  return `<div class="topbar">
    <div class="groupe">
      <span class="nom-classe">Guerrier</span>
      <span class="stat pv">${ICON.coeur}<span>${hp} / ${run.maxHp}</span></span>
      <span class="stat or">${ICON.piece}<span>${run.gold}</span></span>
      <span class="potions">${run.potions.map((id, i) => `<button type="button" class="potion-slot ${id ? '' : 'vide'}" ${id ? `data-action="potion" data-slot="${i}" aria-label="${POTIONS[id].name}" title="${POTIONS[id].name}"` : 'disabled aria-label="Emplacement de potion vide"'}>${potionIcon(id)}</button>`).join('')}</span>
    </div>
    <div style="display:flex;flex-direction:column;align-items:center;gap:4px">
      <span class="etape">Les Profondeurs Ardentes · ${etageLabel(run)}</span>
      <span class="pips">Wipes ${pips} <span>${run.wipesLeft} restant${run.wipesLeft > 1 ? 's' : ''}</span></span>
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
      ${run.map.nodes.some((n) => n.type === 'elite') ? '<button type="button" class="bouton bouton-loot" data-action="loot">Tables de loot</button>' : ''}
    </div>`;
}

function eventScreen(run: RunState): string {
  const ev = run.eventId ? EVENTS[run.eventId] : null;
  if (!ev) return '';
  const choices = ev.choices.map((ch, i) => `<button type="button" class="choix-evenement" data-action="choix" data-index="${i}"><b>${ch.label}</b><span>${ch.detail}</span></button>`).join('');
  return `${topbar(run, run.hp)}<div class="ecran">
    <h2>${ev.title}</h2>
    <p class="texte-evenement">${ev.text}</p>
    <div class="choix-liste">${choices}</div>
  </div>`;
}

// ---------- Vendeur gobelin ----------

function shopScreen(run: RunState): string {
  const shop = run.shop;
  if (!shop) return '';

  if (ui.shopMode) {
    const remove = ui.shopMode === 'remove';
    const cards = run.deck.map((card) => {
      const ok = remove || !card.upgraded;
      return cardHtml(card, { action: ok ? `data-action="service-carte" data-uid="${card.uid}"` : 'disabled', disabled: !ok });
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
  if (e.untargetable) chips.push('<span class="chip">Insaisissable</span>');
  if (e.defId === 'gardien' && e.block > 0) chips.push('<span class="chip">Renvoie 3 par Attaque</span>');
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
      const zone = i.addZone ? ' + Zone de feu' : '';
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
      return `<div class="intention soutien">${ICON.charge}<span>Clignement</span></div><div class="effet-intention">Ne pourra plus être ciblé jusqu'à son prochain tour</div>`;
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
  return chips.join('');
}

function combatScreen(run: RunState, c: CombatState): string {
  const p = c.player;
  const targeting = needsEnemyTarget(c);
  const hpPct = Math.max(0, (p.hp / p.maxHp) * 100);

  const rage = Array.from({ length: p.maxRage }, (_, i) => `<i class="${i < p.rage ? 'plein' : ''}"></i>`).join('');
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
    </${tag}>`;
  }).join('');

  const spells = c.spells.map((s, i) => {
    const def = SPELLS[s.id];
    const ready = canUseSpell(c, i);
    const selected = ui.selection?.kind === 'spell' && ui.selection.index === i;
    return s.cooldown > 0
      ? `<button type="button" class="sort recharge" disabled aria-label="${def.name}, recharge ${s.cooldown} tours"><b>${s.cooldown}</b>${def.name}</button>`
      : `<button type="button" class="sort ${selected ? 'choisi' : ''}" data-action="sort" data-index="${i}" ${ready ? '' : 'disabled'} aria-label="${def.name}, prêt. ${def.text}" title="${def.text}">${ICON.charge}${def.name}</button>`;
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
      : `<div class="enrage">${ICON.sablier}<span>Enrage dans ${c.enrageTurn - c.turn} tour${c.enrageTurn - c.turn > 1 ? 's' : ''}</span></div>`;
  }

  const journal = c.log.slice(-9).map((l) => `<p>${l}</p>`).join('');
  const underLava = c.enemies.find((e) => !e.dead && e.submerged);
  const reviving = c.enemies.filter((e) => e.dead && e.reviveIn);
  const consigne = targeting
    ? `<div class="consigne">Choisis une cible</div>`
    : underLava
      ? `<div class="consigne lave">${underLava.name} est sous la lave : il refait surface dans ${underLava.submerged} tour${underLava.submerged! > 1 ? 's' : ''}. Chaque Rejeton encore en vie le soignera de 15 PV !</div>`
      : reviving.length > 0
        ? `<div class="consigne lave">${reviving.length} Molosse${reviving.length > 1 ? 's' : ''} enragé${reviving.length > 1 ? 's' : ''} se relèvera${reviving.length > 1 ? 'nt' : ''} dans ${Math.min(...reviving.map((e) => e.reviveIn!))} tour${Math.min(...reviving.map((e) => e.reviveIn!)) > 1 ? 's' : ''}, tant que Krâgg est en vie.</div>`
        : '';

  return `<div class="sol"></div>
    ${topbar(run, p.hp)}
    ${enrage}
    <div class="heros">
      <div class="buffs">${playerChips(c)}</div>
      <img class="px" data-fx="player" src="${A('guerrier.png')}" alt="Le Guerrier" style="width:192px;height:192px">
      <div class="jauges">
        <div class="ligne">
          <div class="bouclier-badge" title="Blocage"><svg width="32" height="32" viewBox="0 0 24 24" fill="#1d2633" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z"/></svg><span>${p.block}</span></div>
          <div class="barre-pv"><div style="width:${hpPct}%"></div><span>${p.hp} / ${p.maxHp}</span></div>
        </div>
        <div class="ligne"><span class="rage-label">RAGE</span><div class="rage">${rage}</div><span class="rage-label" style="width:auto">${p.rage}</span></div>
        <div class="postures" role="group" aria-label="Posture">${postures}</div>
        <div class="aide-posture">${aidePosture}${p.postureChanged ? ' · déjà changée ce tour' : ''}</div>
      </div>
    </div>
    <div class="ennemis ${c.enemies.filter((e) => !e.dead && !e.submerged).length > 4 ? 'nombreux' : ''}">${enemies}</div>
    ${consigne}
    <div class="barre-sorts"><span class="titre">SORTS</span>${spells}</div>
    <div class="energie ${p.energy === 0 ? 'vide' : ''}" aria-label="Énergie">${p.energy}/${p.maxEnergy}</div>
    <div class="piles"><span class="pile">Pioche ${c.draw.length}</span><span class="pile">Défausse ${c.discard.length}</span></div>
    <div class="main">${hand}</div>
    <div class="journal" aria-live="polite">${journal}</div>
    <button type="button" class="fin-tour" data-action="fin-tour" ${c.phase === 'player' ? '' : 'disabled'}>Fin du tour</button>`;
}

// ---------- Autres écrans ----------

function titleScreen(): string {
  const saved = localSave.load();
  // Une victoire dont le passage au coffre n'est pas fait peut encore être reprise.
  const canContinue = saved && saved.screen !== 'gameover' && (saved.screen !== 'victory' || !saved.chestDone);
  return `<div class="ecran">
    <img class="px sprite-titre" src="${A('guerrier.png')}" alt="">
    <div class="titre-jeu">Wipe &amp; Loot</div>
    <div class="sous-titre">Prototype · Le Guerrier dans les Profondeurs Ardentes</div>
    <div class="actions">
      ${canContinue ? `<button type="button" class="gros-bouton" data-action="continuer">Continuer</button>` : ''}
      <button type="button" class="gros-bouton ${canContinue ? 'secondaire' : ''}" data-action="nouvelle">Nouvelle partie</button>
      ${fullscreenButton('gros-bouton secondaire')}
    </div>
    <button type="button" class="bouton bouton-coffre" data-action="voir-coffre">Coffre de la guilde · ${loadProfile().guildChest.length}/${CHEST_SIZE}</button>
    <p>Traverse les 10 étages des Profondeurs Ardentes et choisis ton chemin : combats, boss secondaires, coffres, feux de camp et rencontres inattendues. La partie est sauvegardée automatiquement dans ce navigateur.</p>
  </div>`;
}

function potionReward(run: RunState, id: string): string {
  const free = run.potions.includes(null);
  const buttons = free
    ? '<button type="button" class="bouton-objet" data-action="prendre-potion">Prendre</button>'
    : run.potions.map((p, i) => `<button type="button" class="bouton-objet" data-action="prendre-potion" data-slot="${i}">Remplacer : ${POTIONS[p!].name}</button>`).join('');
  return `<div class="butin butin-potion"><span class="butin-titre">Potion</span>${potionHtml(id)}<div class="choix-objet">${buttons}<button type="button" class="bouton-objet secondaire" data-action="laisser-potion">Laisser</button></div></div>`;
}

function rewardScreen(run: RunState): string {
  const cards = run.rewardChoices.map((id) => cardHtml({ uid: 0, id, upgraded: false }, { action: `data-action="recompense" data-id="${id}"` })).join('');
  const crowded = (run.pendingItem || run.pendingPotion) && run.rewardChoices.length > 0;
  return `${topbar(run, run.hp)}<div class="ecran ${crowded ? 'serre' : ''}">
    <h2>${run.rewardTitle}</h2>
    ${run.rewardGold > 0 ? `<div class="gain-or">${ICON.piece}<span>+${run.rewardGold} or</span></div>` : ''}
    ${run.pendingItem || run.pendingPotion ? `<div class="butins">
      ${run.pendingItem ? `<div class="butin"><span class="butin-titre">${run.pendingAlt ? 'Butin · au choix' : 'Butin'}</span>${itemHtml(run.pendingItem)}${equipChoices(run, run.pendingItem, 'data-action="equiper"', run.pendingAlt ? '' : '<button type="button" class="bouton-objet secondaire" data-action="laisser">Laisser</button>')}</div>` : ''}
      ${run.pendingItem && run.pendingAlt ? `<div class="butin"><span class="butin-titre">ou</span>${itemHtml(run.pendingAlt)}${equipChoices(run, run.pendingAlt, 'data-action="equiper" data-alt="1"', '<button type="button" class="bouton-objet secondaire" data-action="laisser">Aucun des deux</button>')}</div>` : ''}
      ${run.pendingPotion ? potionReward(run, run.pendingPotion) : ''}
    </div>` : ''}
    ${run.rewardChoices.length > 0 ? '<p>Choisis une carte à ajouter à ton deck.</p>' : ''}
    ${run.rewardChoices.length > 0 ? `<div class="choix-cartes ${run.pendingItem ? 'compact' : ''}">${cards}</div>` : ''}
    <button type="button" class="gros-bouton secondaire" data-action="recompense" data-id="">${run.rewardChoices.length > 0 ? 'Passer' : 'Continuer'}</button>
  </div>`;
}

function campfireScreen(run: RunState): string {
  if (ui.campfireUpgrade) {
    const cards = run.deck.map((card) => cardHtml(card, {
      action: card.upgraded ? 'disabled' : `data-action="ameliorer" data-uid="${card.uid}"`,
      disabled: card.upgraded,
    })).join('');
    return `${topbar(run, run.hp)}<div class="ecran" style="justify-content:flex-start;padding-top:70px;gap:14px">
      <h2>Le maître de classe</h2>
      <p>Choisis une carte à améliorer.</p>
      <div class="liste-deck">${cards}</div>
      <button type="button" class="gros-bouton secondaire" data-action="feu-retour">Retour</button>
    </div>`;
  }
  const heal = Math.min(run.maxHp - run.hp, Math.floor(run.maxHp * 0.3));
  return `${topbar(run, run.hp)}<div class="ecran">
    <h2>Feu de camp</h2>
    <p>La chaleur de la montagne se fait oublier un instant. Prends le temps de souffler, ou de t'entraîner.</p>
    <div class="actions">
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

function chestPickScreen(): string {
  const chest = loadProfile().guildChest;
  const saved = localSave.load();
  const inProgress = saved && saved.screen !== 'victory' && saved.screen !== 'gameover';
  return `<div class="ecran" style="gap:16px">
    <h2>Le coffre de la guilde</h2>
    <p>Tu peux emporter <b>un</b> objet du coffre. Il sera équipé dès le départ. Si tu gagnes la run, il revient au coffre ; si tu échoues, <b>il est perdu</b>.</p>
    ${inProgress ? `<p class="mention-brise">Attention : commencer une nouvelle partie abandonne la run en cours${saved?.heirloom ? `, et l'objet que tu avais emporté (${ITEMS[saved.heirloom].name}) sera perdu` : ''}.</p>` : ''}
    ${chestGrid(chest, (i) => `data-action="emporter" data-index="${i}"`)}
    <div class="actions">
      <button type="button" class="gros-bouton secondaire" data-action="sans-heritage">Partir sans objet</button>
      <button type="button" class="gros-bouton secondaire" data-action="titre">Retour</button>
    </div>
  </div>`;
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

function endScreen(run: RunState, victory: boolean): string {
  if (victory && !run.chestDone) {
    return `<div class="ecran" style="gap:14px">
      <h1>Vulkhar est vaincu !</h1>
      ${chestPanel(run)}
    </div>`;
  }
  return `<div class="ecran">
    <img class="px sprite-titre" src="${A(victory ? 'guerrier.png' : 'ennemi_vulkhar.png')}" alt="">
    <h1>${victory ? 'Vulkhar est vaincu !' : 'Fin de la run'}</h1>
    <p>${victory ? `Bravo : tu as traversé les Profondeurs Ardentes avec ${run.hp} PV et ${MAX_WIPES - run.wipesLeft} wipe${MAX_WIPES - run.wipesLeft > 1 ? 's' : ''}.` : 'Les Profondeurs Ardentes ont eu raison de toi. La guilde enverra un autre champion.'}</p>
    ${victory ? chestPanel(run) : run.heirloom ? `<p class="mention-brise">${ITEMS[run.heirloom].name}, emporté du coffre de la guilde, est perdu.</p>` : ''}
    <div class="actions"><button type="button" class="gros-bouton" data-action="nouvelle">Nouvelle partie</button></div>
  </div>`;
}

function overlayHtml(run: RunState | null): string {
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
      return `<section class="table-loot"><h3>${enc.name} <span>· étage${floors.includes(',') ? 's' : ''} ${floors}</span></h3><div class="liste-objets">${list}</div></section>`;
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
        <button type="button" class="gros-bouton secondaire" data-action="titre">Écran titre</button>
        <button type="button" class="gros-bouton secondaire" data-action="nouvelle">Recommencer une run</button>
      </div>
    </div></div>`;
  }
  return '';
}

// ---------- Boucle de rendu ----------

export function render(): void {
  const run = ui.run;
  if (!run) {
    stage.innerHTML = ui.chestPick ? chestPickScreen() : titleScreen() + overlayHtml(null);
    return;
  }
  let html = '';
  switch (run.screen) {
    case 'map': html = mapScreen(run); break;
    case 'event': html = eventScreen(run); break;
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

function startNewRun(heirloom: string | null = null): void {
  ui.chestPick = false;
  ui.depositSlot = null;
  ui.run = newRun(undefined, heirloom);
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
  if (sel?.kind === 'spell' && sel.index === index) {
    ui.selection = null;
    render();
    return;
  }
  const def = SPELLS[c.spells[index].id];
  if (def.needsTarget && c.enemies.filter((e) => !e.dead).length > 1) {
    ui.selection = { kind: 'spell', index };
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
    case 'nouvelle':
      if (loadProfile().guildChest.length > 0) { ui.chestPick = true; ui.run = null; ui.overlay = null; render(); } else startNewRun();
      return;
    case 'emporter': {
      const profile = loadProfile();
      const id = takeHeirloom(profile, Number(el.dataset.index));
      saveProfile(profile); // retiré du coffre tout de suite : recharger la page ne le duplique pas
      startNewRun(id);
      return;
    }
    case 'sans-heritage': startNewRun(); return;
    case 'voir-coffre': ui.overlay = 'coffre'; render(); return;
    case 'continuer':
      ui.run = localSave.load();
      ui.overlay = null;
      if (ui.run) afterCombatAction(ui.run); // une victoire ou un wipe sauvegardé pendant l'animation
      render();
      return;
    case 'titre': ui.run = null; ui.overlay = null; ui.chestPick = false; render(); return;
    case 'deck': ui.overlay = 'deck'; render(); return;
    case 'menu': ui.overlay = 'menu'; render(); return;
    case 'fermer': ui.overlay = null; render(); return;
    case 'equipement': ui.overlay = 'equipement'; render(); return;
    case 'loot': ui.overlay = 'loot'; render(); return;
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
    case 'noeud': chooseNode(run, Number(el.dataset.id)); commit(); break;
    case 'choix': resolveEvent(run, Number(el.dataset.index)); commit(); break;
    case 'acheter': buyCard(run, Number(el.dataset.index)); commit(); break;
    case 'service': ui.shopMode = el.dataset.service as 'remove' | 'upgrade'; render(); break;
    case 'service-carte':
      if (ui.shopMode === 'remove') buyRemoval(run, Number(el.dataset.uid));
      else if (ui.shopMode === 'upgrade') buyUpgrade(run, Number(el.dataset.uid));
      ui.shopMode = null;
      commit();
      break;
    case 'boutique-retour': ui.shopMode = null; render(); break;
    case 'partir': ui.shopMode = null; ui.shopItem = null; ui.shopPotion = null; leaveShop(run); commit(); break;
    case 'equiper': equipPending(run, el.dataset.slot as SlotKey, el.dataset.alt === '1'); commit(); break;
    case 'laisser': leavePending(run); commit(); break;
    case 'boire': drinkPotion(run, Number(el.dataset.slot)); ui.overlay = null; ui.selection = null; commit(); break;
    case 'jeter': discardPotion(run, Number(el.dataset.slot)); ui.overlay = null; commit(); break;
    case 'prendre-potion': takePotion(run, el.dataset.slot === undefined ? undefined : Number(el.dataset.slot)); commit(); break;
    case 'laisser-potion': run.pendingPotion = null; commit(); break;
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
    case 'feu-retour': ui.campfireUpgrade = false; render(); break;
    case 'ameliorer': campfireUpgrade(run, Number(el.dataset.uid)); ui.campfireUpgrade = false; commit(); break;
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
  'guerrier.png', 'vendeur_gobelin.png', 'icone_epee.png', 'icone_bouclier.png', 'icone_pouvoir.png', 'icone_feu.png',
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
