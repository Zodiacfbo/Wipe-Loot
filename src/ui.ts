// L'interface : affiche l'état de la run et transmet les actions du joueur au moteur.
import { CARDS, energyCost, rewardPool, shardCost, starterCards } from './engine/cards';
import { DOT_LABEL, MAX_SHARDS, PETS } from './engine/demoniste';
import {
  SPELLS,
  canPlayCard,
  canUseSpell,
  changePosture,
  choosePet,
  endTurn,
  isEnraged,
  playCard,
  previewIntentDamage,
  useSpell,
} from './engine/combat';
import { ENEMIES, TUNING, intentAt, isInterruptible } from './engine/enemies';
import { AFFLICTIONS, ENEMIES_ACTE2, GRIZZIK_POTIONS } from './engine/enemies_acte2';
import { MUTATION_LABEL } from './engine/actions';
import { ACTS, actDef } from './engine/acts';
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
  canBindStaff,
  canForgeEquinoxe,
  campfireEquinoxe,
  canForgeAurore,
  campfireAurore,
  campfireBindStaff,
  canRest,
  startNextAct,
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
import { TALENT_REFS, talentIcon } from './engine/talent_icons';
import { freezeThreshold } from './engine/actions';
import { CLASSES, CLASS_BY_ID, chooseStartClass, classInfo, nextUnlockAt, totalXp, unlockClass, unlocksAvailable } from './engine/classes';
import { DIFFICULTY_TEXT } from './engine/difficulty';
import { LORE, recordKills, recordSeen } from './engine/archives';
import { COMMON_POOL } from './engine/items';
import { POTION_IDS } from './engine/potions';
import { MAX_LEVEL, awardRun, classLevel, type RunSummary } from './engine/progression';
import { CHEST_SIZE, chestRoomAfterReturn, depositableSlots, heirloomSlot, settleChest, takeHeirloom } from './engine/guild';
import { emptyProfile, loadProfile, localSave, saveProfile } from './engine/save';
// Outil de test (version dev seulement)
import { devGold, devHeal, devNextAct, devResetClass, devSetLevel, devUnlockClasses, devUnlockDifficulties, devWinCombat } from './engine/devtools';
import { AURA_NAMES, SEAL_NAMES, SEAL_TEXT } from './engine/paladin';
import { ITEMS, REPAIR_PRICE, SLOT_KEYS, SLOT_LABEL, LOOT_TABLES, slotOf, slotsFor, uselessFx, type Slot, type SlotKey } from './engine/items';
import { ELITE_ENCOUNTERS } from './engine/enemies';
import { initFx, playFx } from './fx';
import type { CardInstance, CombatState, EnemyState, Intent, Posture, RunState } from './engine/types';

const A = (file: string) => `${import.meta.env.BASE_URL}assets/${file}`;

type Selection = { kind: 'card'; index: number } | { kind: 'spell'; index: number } | null;

interface UiState {
  run: RunState | null;
  selection: Selection;
  overlay: 'deck' | 'menu' | 'equipement' | 'loot' | 'potion' | 'coffre' | 'pile' | 'abandon' | 'difficultes' | 'test' | null;
  /** Outil de test : la classe choisie dans le panneau. */
  devClass?: string;
  /** Objet du coffre choisi dans le hall pour la prochaine expédition (index). */
  heirloom: number | null;
  pileKind: 'draw' | 'discard' | 'exhaust';
  /** Potion ouverte (emplacement du joueur), ou potion du vendeur regardée. */
  potionSlot: number | null;
  shopPotion: number | null;
  campfireUpgrade: boolean;
  /** Feu de camp : choisir la carte rare à sacrifier pour le Bâton du Veilleur. */
  bindStaff?: boolean;
  shopMode: 'remove' | 'upgrade' | null;
  shopItem: number | null;
  /** Vendeur : la carte regardée (sa fiche s'ouvre en fenêtre). */
  shopCard?: number | null;
  /** Brégan : choix de la carte à retirer (Allègement). */
  blessingRemove: boolean;
  /** Écran des talents (avant une run). */
  talentScreen: boolean;
  /** Talent regardé (sa fiche s'affiche à droite). */
  talentSel: { tree: TreeId; tier: number; choice: Choice } | null;
  /** Écran des classes : choix de la classe de départ, ou consultation. */
  classScreen: boolean;
  /** Classe regardée sur l'écran des classes. */
  classSel: string | null;
  /** Archives de la guilde : écran ouvert et onglet. */
  archivesScreen: boolean;
  archiveTab: 'cartes' | 'objets' | 'potions' | 'monstres';
  /** Archives : l'icône regardée (sa fiche s'affiche à droite). */
  archiveSel?: string | null;
  /** Équipement : la case regardée (emplacement d'objet, ou « sort-<index> » pour la barre de sorts). */
  equipSel?: string | null;
  /** Carte dont on regarde l'amélioration avant de la confirmer. */
  upgradeUid: number | null;
  /** Objet choisi pour le dépôt, quand le coffre est plein (on choisit ensuite quoi remplacer). */
  depositSlot: SlotKey | null;
}

const ui: UiState = { run: null, selection: null, overlay: null, campfireUpgrade: false, shopMode: null, shopItem: null, potionSlot: null, shopPotion: null, depositSlot: null, blessingRemove: false, talentScreen: false, talentSel: null, classScreen: false, classSel: null, upgradeUid: null, pileKind: 'draw', heirloom: null, archivesScreen: false, archiveTab: 'monstres' };
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

const SCHOOL_LABEL = { arcane: 'Arcane', feu: 'Feu', givre: 'Givre', sacre: 'Sacré', ombre: 'Ombre' } as const;

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
    ${def.faithCost !== undefined ? `<span class="cout-rage cout-foi" title="Foi">${def.faithCost === 'all' ? 'X' : def.faithCost}</span>` : ''}
    ${def.shardCost !== undefined && shardCost(opts.combat ?? null, card.id, card.upgraded) !== 0 ? `<span class="cout-rage cout-eclat" title="Éclats d'âme">${shardCost(opts.combat ?? null, card.id, card.upgraded) === 'all' ? 'X' : shardCost(opts.combat ?? null, card.id, card.upgraded)}</span>` : ''}
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
  const useless = uselessNote(id);
  const note = useless ? `<i class="note-objet">${useless}</i>` : '';
  return `<div class="objet ${it.rarity} ${broken ? 'brise' : ''}"><span class="objet-icone">${SLOT_ICON[it.slot]}</span><div><b>${it.name}</b><em>${SLOT_LABEL[slotsFor(id)[0]]} · ${it.rarity === 'commun' ? 'commun' : it.rarity === 'rare' ? 'rare' : it.rarity === 'epique' ? 'épique' : 'légendaire'}${broken ? ' · <strong class="mention-brise">brisé</strong>' : ''}</em><span>${broken ? `Effet désactivé jusqu'à la réparation (${REPAIR_PRICE[it.rarity]} or chez le vendeur gobelin). ` : ''}${it.text}</span>${note}</div>${extra}</div>`;
}

const RARITY_LABEL: Record<string, string> = { commun: 'commun', rare: 'rare', epique: 'épique', legendaire: 'légendaire' };

/** La remarque « sans effet pour ta classe » d'un objet (vide si tout lui sert). */
function uselessNote(id: string): string {
  const cls = ui.run?.classId ?? activeClass();
  const name = classInfo(cls).name;
  const useless = uselessFx(id, cls);
  if (useless.length === 0) return '';
  return useless.length === Object.keys(ITEMS[id].fx).length
    ? `Sans effet pour le ${name}.`
    : `${cls === 'guerrier' || cls === 'voleur' ? 'Le bonus aux Sorts' : 'Le bonus aux Attaques'} ne sert pas au ${name}.`;
}

/** Où se place chaque emplacement autour du héros (colonne gauche ou droite, rang 1 à 3). */
const EQUIP_LAYOUT: Record<SlotKey, [string, number]> = {
  arme: ['g', 1], bague1: ['g', 2], bijou1: ['g', 3], amulette: ['d', 1], bague2: ['d', 2], bijou2: ['d', 3],
};

/** L'équipement : le héros entouré de ses 6 emplacements, la barre de sorts dessous, et la fiche de la case touchée à droite. */
function equipmentOverlay(run: RunState): string {
  const hero = classInfo(run.classId);
  const cap = barCapacity(run);
  const sel = ui.equipSel ?? 'arme';
  const slots = SLOT_KEYS.map((k) => {
    const id = run.equipment[k];
    const broken = run.broken.includes(k);
    const [col, row] = EQUIP_LAYOUT[k];
    const cls = id ? `${ITEMS[id].rarity}${broken ? ' brise' : ''}` : 'vide';
    return `<button type="button" class="case-equipement ${cls} ${sel === k ? 'choisie' : ''}" style="grid-area:${row} / ${col === 'g' ? 1 : 3}" data-action="equip-voir" data-id="${k}" aria-label="${SLOT_LABEL[k]}${id ? ` : ${ITEMS[id].name}` : ' : vide'}">
      ${SLOT_ICON[slotOf(k)]}${broken ? '<span class="pastille-brise">!</span>' : ''}<span class="nom-case">${SLOT_LABEL[k]}</span></button>`;
  }).join('');
  const spells = Array.from({ length: cap }, (_, i) => {
    const id = run.spells[i];
    const key = `sort-${i}`;
    return id
      ? `<button type="button" class="case-equipement case-sort ${sel === key ? 'choisie' : ''}" data-action="equip-voir" data-id="${key}" aria-label="${SPELLS[id].name}">${ICON[SPELLS[id].icon]}</button>`
      : `<button type="button" class="case-equipement case-sort vide ${sel === key ? 'choisie' : ''}" data-action="equip-voir" data-id="${key}" aria-label="Emplacement de sort libre"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M12 6v12M6 12h12"/></svg></button>`;
  }).join('');
  return `<div class="overlay"><div class="ecran-equipement">
    <section class="poupee">
      <h2>Équipement</h2>
      <div class="poupee-grille">${slots}<img class="px poupee-heros" src="${A(hero.sprite ?? 'guerrier.png')}" alt="Le ${hero.name}"></div>
      <div class="poupee-sorts"><span class="titre-rappel">Barre de sorts · ${run.spells.length}/${cap}</span><div>${spells}</div></div>
    </section>
    ${equipmentSheet(run, sel)}
  </div></div>`;
}

/** La fiche de la case touchée dans l'équipement. */
function equipmentSheet(run: RunState, sel: string): string {
  const close = '<div class="bas-fiche"><button type="button" class="gros-bouton secondaire" data-action="fermer">Fermer</button></div>';
  if (sel.startsWith('sort-')) {
    const id = run.spells[Number(sel.slice(5))];
    if (!id) {
      return `<aside class="fiche-talent fiche-equipement"><div class="haut-fiche"><span class="case-equipement case-sort vide grande"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M12 6v12M6 12h12"/></svg></span><div class="titre-fiche">Emplacement libre</div></div>
        <div class="texte-fiche"><p>Un sort de barre de ta classe peut tomber des boss secondaires : il se range ici.</p></div>${close}</aside>`;
    }
    const d = SPELLS[id];
    return `<aside class="fiche-talent fiche-equipement"><div class="haut-fiche"><span class="case-equipement case-sort grande">${ICON[d.icon]}</span><div><div class="titre-fiche">${d.name}</div>
      <div class="etiquettes"><span class="type-talent k-sort">Sort de barre</span><span class="type-talent">${d.cost > 0 ? `${d.cost} énergie` : 'gratuit'}</span><span class="type-talent">${d.once ? 'une fois par combat' : `recharge ${d.cooldown} tours`}</span></div></div></div>
      <div class="texte-fiche"><p>${d.text}</p></div>${close}</aside>`;
  }
  const key = sel as SlotKey;
  const id = run.equipment[key];
  const icon = SLOT_ICON[slotOf(key)];
  if (!id) {
    const what = slotOf(key) === 'bague' || slotOf(key) === 'bijou' ? `Tu peux porter 2 ${SLOT_LABEL[key].toLowerCase()}x.` : '';
    return `<aside class="fiche-talent fiche-equipement"><div class="haut-fiche"><span class="case-equipement vide grande">${icon}</span><div class="titre-fiche">${SLOT_LABEL[key]} · vide</div></div>
      <div class="texte-fiche"><p>${what} On trouve des objets chez les boss secondaires, dans les coffres et chez le vendeur gobelin.</p></div>${close}</aside>`;
  }
  const it = ITEMS[id];
  const broken = run.broken.includes(key);
  const note = uselessNote(id);
  return `<aside class="fiche-talent fiche-equipement ${broken ? 'brisee' : ''}"><div class="haut-fiche"><span class="case-equipement ${it.rarity}${broken ? ' brise' : ''} grande">${icon}</span><div><div class="titre-fiche">${it.name}</div>
    <div class="etiquettes"><span class="type-talent">${SLOT_LABEL[key]}</span><span class="type-talent r-${it.rarity}">${RARITY_LABEL[it.rarity]}</span>${broken ? '<span class="type-talent k-brise">brisé</span>' : ''}</div></div></div>
    <div class="texte-fiche"><p>${it.text}</p>${broken ? `<p class="alerte-brise">Effet désactivé jusqu'à la réparation : ${REPAIR_PRICE[it.rarity]} or chez le vendeur gobelin.</p>` : ''}${note ? `<p class="note">${note}</p>` : ''}</div>${close}</aside>`;
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
      ${run.classId === 'demoniste' ? `<span class="stat eclats" title="Éclats d'âme (conservés d'un combat à l'autre)">◆ <span>${run.combat?.shards ?? run.shards}/${MAX_SHARDS}</span></span>` : ''}
      <span class="potions">${run.potions.map((id, i) => `<button type="button" class="potion-slot ${id ? '' : 'vide'}" ${id ? `data-action="potion" data-slot="${i}" aria-label="${POTIONS[id].name}" title="${POTIONS[id].name}"` : 'disabled aria-label="Emplacement de potion vide"'}>${potionIcon(id)}</button>`).join('')}</span>
    </div>
    <div style="display:flex;flex-direction:column;align-items:center;gap:4px">
      <span class="etape">Acte ${run.act} · ${actDef(run.act).name} · ${etageLabel(run)}</span>
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
  if (run.veilleur === 'fragment') lines.push(run.act >= 2 ? '<b>Bâton du Veilleur</b> : trouve l\'observatoire en ruine (un « ? » de l\'acte 2).' : '<b>Bâton du Veilleur</b> : garde le Fragment. L\'esprit du Veilleur t\'attend à l\'acte 2.');
  if (run.equinoxe === 'baton') lines.push(run.act >= 2 ? '<b>Équinoxe</b> : bats Ysolde la Rouge (boss secondaire de l\'acte 2) pour sa Larme.' : '<b>Équinoxe</b> : garde le Bâton nu. La pierre qu\'il lui faut est gardée par Ysolde la Rouge, à l\'acte 2.');
  if (run.sillon === 'gauche' || run.sillon === 'droit') lines.push(run.act > 1 ? '<b>Sillon d\'orage</b> : il te manquait un fermoir. La quête ne pourra pas être terminée cette fois.' : `<b>Sillon d'orage</b> : bats ${run.sillon === 'gauche' ? 'le Baron Vossk' : 'Gorlok le Fragmenté'} (boss secondaire) pour le second fermoir.`);
  if (run.sillon === 'deux') lines.push(run.act >= 2 ? '<b>Sillon d\'orage</b> : Ventor t\'attend derrière un « ? » de cet acte.' : '<b>Sillon d\'orage</b> : les deux fermoirs sont réunis. Ventor t\'attendra derrière un « ? » de l\'acte 2.');
  if (run.aurore === 'lame') lines.push('<b>L\'Aurore ardente</b> : bats Ossyrax, le Drake ressuscité (boss secondaire de l\'acte 2), pour purifier la Lame ternie.');
  if (run.aurore === 'purifiee') lines.push('<b>L\'Aurore ardente</b> : rallume la lame au prochain feu de camp.');
  if (run.equinoxe === 'larme') lines.push('<b>Équinoxe</b> : accomplis le Rituel de l\'équinoxe au prochain feu de camp.');
  if (run.veilleur === 'tete') lines.push('<b>Bâton du Veilleur</b> : lie les fragments au prochain feu de camp (une carte rare à sacrifier).');
  if (run.eggsLeft && run.act === 2) lines.push('<b>Les œufs de dragon</b> : Vhaeryx aura un add de plus à chaque vague.');
  if ((run.stargazing ?? 0) > 0) lines.push(`<b>Les étoiles</b> : tu vois les intentions suivantes pendant ${run.stargazing} combat${run.stargazing > 1 ? 's' : ''}.`);
  if (run.brisemonts === 'lame' && run.act > 1) lines.push('<b>Brisemonts</b> : Krâgg n\'a pas été vaincu. La quête ne pourra pas être terminée cette fois.');
  else if (run.brisemonts === 'lame') lines.push(run.map.nodes.some((n) => n.type === 'elite' && n.elite === KRAGG_INDEX)
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

  const piece = (price: number, ok: boolean, promo = false) => `<span class="prix ${ok ? '' : 'trop-cher'} ${promo ? 'promo' : ''}">${ICON.piece}${price}${promo ? ' · promo' : ''}</span>`;
  const isPromo = (id: string, price: number) => price < (CARDS[id].rarity === 'commune' ? 45 : CARDS[id].rarity === 'peu_commune' ? 68 : 135);

  // L'étal : toucher un article ouvre sa fiche (en fenêtre), l'achat se confirme dans la fiche.
  const cards = shop.cards.map((item, i) => item.sold
    ? '<div class="article vendu"><div class="vendu-texte">Vendu</div></div>'
    : `<div class="article">
      ${cardHtml({ uid: 0, id: item.id, upgraded: false }, { action: `data-action="carte-boutique" data-index="${i}"`, disabled: run.gold < item.price })}
      ${piece(item.price, run.gold >= item.price, isPromo(item.id, item.price))}
    </div>`).join('');
  const shopItems = shop.items.map((item, i) => item.sold
    ? '<div class="article-tuile"><span class="case-equipement vide vendu-tuile">Vendu</span></div>'
    : `<button type="button" class="article-tuile" data-action="objet-boutique" data-index="${i}" aria-label="${ITEMS[item.id].name}">
      <span class="case-equipement ${ITEMS[item.id].rarity}">${SLOT_ICON[ITEMS[item.id].slot]}</span>${piece(item.price, run.gold >= item.price)}</button>`).join('');
  const shopPotions = shop.potions.map((item, i) => item.sold
    ? '<div class="article-tuile"><span class="case-equipement vide vendu-tuile">Vendu</span></div>'
    : `<button type="button" class="article-tuile" data-action="potion-boutique" data-index="${i}" aria-label="${POTIONS[item.id].name}">
      <span class="case-equipement ${POTIONS[item.id].rarity}">${potionIcon(item.id, 44)}</span>${piece(item.price, run.gold >= item.price)}</button>`).join('');

  const service = (kind: 'remove' | 'upgrade', label: string, used: boolean, count: number) => {
    const price = servicePrice(count);
    const ok = !used && run.gold >= price;
    return `<button type="button" class="service" ${ok ? `data-action="service" data-service="${kind}"` : 'disabled'}>
      <b>${label}</b><span>${used ? 'Déjà utilisé lors de cette visite' : `${ICON.piece} ${price} or`}</span>
    </button>`;
  };

  return `${topbar(run, run.hp)}
    <div class="boutique">
      <div class="vendeur">
        <img class="px" src="${A('vendeur_gobelin.png')}" alt="Le vendeur gobelin" style="width:192px;height:192px">
        <p class="replique">« Tout est à vendre, champion ! Même ce qui ne m'appartient pas. »</p>
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
      <div class="etal">
        <h2 class="titre-boutique">Le vendeur gobelin</h2>
        <div class="articles">${cards}</div>
        <div class="rayons">
          <div class="rayon"><span class="titre-rappel">Objets</span><div>${shopItems}</div></div>
          <div class="rayon"><span class="titre-rappel">Potions</span><div>${shopPotions}</div></div>
        </div>
      </div>
    </div>
    ${shopSheet(run)}`;
}

/** La fiche d'un article du vendeur, en fenêtre par-dessus l'étal, avec le bouton d'achat (la confirmation). */
function shopSheet(run: RunState): string {
  const shop = run.shop!;
  const tag = (text: string, cls = '') => `<span class="type-talent ${cls}">${text}</span>`;
  const back = (action: string) => `<button type="button" class="gros-bouton secondaire" data-action="${action}">Retour</button>`;
  const noGold = '<p class="note">Pas assez d\'or.</p>';
  let body = '';
  if (ui.shopCard != null && shop.cards[ui.shopCard] && !shop.cards[ui.shopCard].sold) {
    const item = shop.cards[ui.shopCard];
    const def = CARDS[item.id];
    const ok = run.gold >= item.price;
    body = `<div class="titre-fiche">${def.name}</div>
      <div class="etiquettes">${tag(def.type)}${tag(CARD_RARITY_LABEL[def.rarity] ?? def.rarity)}</div>
      <div class="cartes-rappel">${cardHtml({ uid: 0, id: item.id, upgraded: false }, { action: 'disabled' })}</div>
      ${ok ? '' : noGold}
      <div class="boutons-fiche"><button type="button" class="gros-bouton" ${ok ? `data-action="acheter" data-index="${ui.shopCard}"` : 'disabled'}>Acheter · ${item.price} or</button>${back('annuler-carte')}</div>`;
  } else if (ui.shopItem !== null && shop.items[ui.shopItem] && !shop.items[ui.shopItem].sold) {
    const item = shop.items[ui.shopItem];
    const it = ITEMS[item.id];
    const ok = run.gold >= item.price;
    const note = uselessNote(item.id);
    body = `<div class="haut-fiche"><span class="case-equipement ${it.rarity} grande">${SLOT_ICON[it.slot]}</span><div><div class="titre-fiche">${it.name}</div>
      <div class="etiquettes">${tag(SLOT_LABEL[slotsFor(item.id)[0]])}${tag(RARITY_LABEL[it.rarity], `r-${it.rarity}`)}</div></div></div>
      <div class="texte-fiche"><p>${it.text}</p>${note ? `<p class="note">${note}</p>` : ''}</div>
      ${ok
        ? `<p class="note">Acheter pour <b>${item.price} or</b> : choisis l'emplacement. Un objet remplacé est perdu.</p>${equipChoices(run, item.id, `data-action="acheter-objet" data-index="${ui.shopItem}"`, back('annuler-objet'))}`
        : `${noGold}<div class="boutons-fiche"><button type="button" class="gros-bouton" disabled>Acheter · ${item.price} or</button>${back('annuler-objet')}</div>`}`;
  } else if (ui.shopPotion !== null && shop.potions[ui.shopPotion] && !shop.potions[ui.shopPotion].sold) {
    const item = shop.potions[ui.shopPotion];
    const d = POTIONS[item.id];
    const free = run.potions.includes(null);
    const ok = free && run.gold >= item.price;
    const why = !free ? 'Tes emplacements de potion sont pleins : jette ou bois une potion d\'abord.' : run.gold < item.price ? 'Pas assez d\'or.' : '';
    body = `<div class="haut-fiche"><span class="case-equipement ${d.rarity} grande">${potionIcon(item.id, 52)}</span><div><div class="titre-fiche">${d.name}</div>
      <div class="etiquettes">${tag('Potion')}${tag(d.rarity, `r-${d.rarity}`)}</div></div></div>
      <div class="texte-fiche"><p>${d.text}</p></div>
      ${why ? `<p class="note">${why}</p>` : ''}
      <div class="boutons-fiche"><button type="button" class="gros-bouton" ${ok ? `data-action="acheter-potion" data-index="${ui.shopPotion}"` : 'disabled'}>Acheter · ${item.price} or</button>${back('annuler-potion')}</div>`;
  }
  return body ? `<div class="fenetre-boutique"><aside class="fiche-talent fiche-boutique">${body}</aside></div>` : '';
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
  for (const d of e.dots ?? []) chips.push(`<span class="chip ombre" title="${d.dmg} dégâts au début de son tour${d.grow ? `, +${d.grow} à chaque fois` : ''}, encore ${d.turns} tours">${DOT_LABEL[d.id] ?? 'DoT'} ${d.dmg} · ${d.turns}t</span>`);
  if (e.curses?.includes('fatigue')) chips.push(`<span class="chip ombre">Fatigue : −${e.fatigue} dégâts (${e.fatigueTurns}t)</span>`);
  if (e.curses?.includes('elements')) chips.push(`<span class="chip ombre">Éléments : Sorts +${e.elements} % (${e.elementsTurns}t)</span>`);
  if (e.tongues) chips.push(`<span class="chip ombre" title="Ses prochaines Incantations prennent un tour de plus">Langages ${e.tongues}</span>`);
  if (e.curses?.includes('faiblesse')) chips.push('<span class="chip ombre">Malédiction de faiblesse</span>');
  if (e.haunted) chips.push(`<span class="chip ombre">Hanté : DoT +50 % (${e.haunted}t)</span>`);
  if (e.enslaved) chips.push(`<span class="chip">Asservi ${e.enslaved} : frappe ses alliés</span>`);
  if (e.flying) chips.push('<span class="chip" title="Tes Attaques à cible unique ne peuvent pas le viser (les Sorts et les zones, si)">En vol</span>');
  if (e.mutations?.length) chips.push(`<span class="chip ${e.mutated ? 'debuff' : ''}" title="${e.mutated ? 'Mutation active' : 'Sous 50 % de PV'}">${e.mutated ? 'Muté' : 'Mutation à 50 %'} : ${e.mutations.map((m) => MUTATION_LABEL[m]).join(', ')}</span>`);
  if (e.breaths) chips.push(`<span class="chip">Souffles : ${e.breaths.map((b) => ({ brulant: 'brûlant', corrosif: 'corrosif', glacial: 'glacial', foudre: 'de foudre', chair: 'de chair' } as Record<string, string>)[b]).join(' et ')}</span>`);
  if (e.giant) chips.push(`<span class="chip">Géant : +5 dégâts (${e.giant} tours)</span>`);
  if (e.haste) chips.push('<span class="chip">Vitesse : agit deux fois</span>');
  if (e.defId === 'ossyrax' && !e.revived) chips.push('<span class="chip">Deux vies</span>');
  if (e.defId === 'skarn' && (e.phase ?? 1) === 1) chips.push('<span class="chip">Immunisé (Œufs)</span>');
  if (ui.run?.encounter?.rune && ENEMIES[e.defId].elite) chips.push('<span class="chip rune">Rune des Sources</span>');
  if (b.peur) chips.push('<span class="chip debuff">Apeuré</span>');
  if (b.censure) chips.push(`<span class="chip sacre" title="${b.censure} dégâts au début de son tour ; le Jugement du Sceau de vengeance la consomme">Censure ${b.censure}</span>`);
  if (ui.run?.classId === 'paladin' && ENEMIES[e.defId].tags?.includes('mortvivant')) chips.push('<span class="chip impie">Mort-vivant</span>');
  if (ui.run?.classId === 'paladin' && ENEMIES[e.defId].tags?.includes('demon')) chips.push('<span class="chip impie">Démon</span>');
  if (b.poison) chips.push(`<span class="chip poison" title="Chaque Attaque qui le touche : +${b.poison} dégâts. −1 à la fin de son tour">Poison ${b.poison}</span>`);
  if (e.vendetta) chips.push('<span class="chip debuff" title="Tes Attaques : +50 % et +2 Poison">Vendetta</span>');
  if (e.stun) chips.push(`<span class="chip debuff">Contrôlé ${e.stun}</span>`);
  if (e.sap) chips.push(`<span class="chip debuff" title="Ne fait rien ; se réveille s'il est blessé">Assommé ${e.sap}</span>`);
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
    case 'blink': return i.flight ? 'Envol' : 'Clignement';
    case 'idle': return i.label;
    case 'hatch': return i.label;
    case 'potion': return i.label;
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
  if (i.lignee) {
    const cls = ui.run?.classId;
    parts.push(cls === 'mage' ? 'Malédiction de lignée : ta prochaine main n\'a que 3 cartes'
      : cls === 'demoniste' ? 'Malédiction de lignée : ton familier se retourne contre toi 2 tours'
      : cls === 'pretre' ? 'Malédiction de lignée : tes soins te blessent 2 tours'
      : cls === 'voleur' ? 'Malédiction de lignée : tes points de combo s\'envolent, plus de combo pendant 2 tours'
      : cls === 'paladin' ? 'Malédiction de lignée : ton Sceau se brise, plus de Sceau pendant 2 tours'
      : 'Malédiction de lignée : forcé en posture Berserker 2 tours');
  }
  const text = parts.join(', ');
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function intentHtml(c: CombatState, e: EnemyState): string {
  const next = c.gear?.seeTwoIntents || c.seeAll ? `<div class="intention-suivante">Ensuite : ${intentShort(intentAt(ENEMIES[e.defId], e.step + 1, e.phase ?? 1, e.hp < e.maxHp / 2))}</div>` : '';
  return intentNow(c, e) + next;
}

function intentNow(c: CombatState, e: EnemyState): string {
  const i = e.intent;
  if (e.mouton) return `<div class="intention interrompu">Mouton : ne fait rien</div>`;
  if (e.stun) return `<div class="intention interrompu">Contrôlé : ne fait rien</div>`;
  if (e.sap) return `<div class="intention interrompu">Assommé : ne fait rien</div>`;
  if (e.gele === 'skip') return `<div class="intention interrompu gele">Gelé : passe son tour</div>`;
  if (e.interrupted) return `<div class="intention interrompu">Interrompu</div>`;
  if (i.cast) {
    const effet =
      i.kind === 'attack'
        ? `${previewIntentDamage(c, e)} dégâts à la fin de ce tour${i.drawPenalty ? `, et tu pioches ${i.drawPenalty} cartes de moins` : ''}`
        : i.kind === 'heal' ? `Soigne un allié de ${i.amount} PV à la fin de ce tour`
        : i.kind === 'potion' ? `${GRIZZIK_POTIONS[i.potion].split(' : ')[1]}, à la fin de ce tour`
        : i.kind === 'hatch' ? 'Tous les Œufs éclosent à la fin de ce tour'
        : i.kind === 'curse' ? curseText(i)
        : 'Prend effet à la fin de ce tour';
    const locked = !isInterruptible(i);
    return `<div class="cast ${locked ? 'bloque' : ''}"><div class="tete"><span>${i.cast}${e.delayed ? ' (retardé)' : ''}</span><b>${locked ? 'Impossible à interrompre' : 'Interruptible'}</b></div><div class="jauge"><div></div></div><div class="effet">${effet}</div></div>`;
  }
  switch (i.kind) {
    case 'attack': {
      const dmg = previewIntentDamage(c, e) ?? 0;
      const times = i.times && i.times > 1 ? ` × ${i.times}` : '';
      const zone = i.addZone ? ' + Zone de feu' : i.stealGold ? ` + vole ${i.stealGold} or` : '';
      const extra = i.effect ? ` + ${i.effect.label}` : '';
      return `<div class="intention">${ICON.epee}<span>${dmg}${times}${zone}${extra}</span></div>`;
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
      if (i.flight) return `<div class="intention malediction">${ICON.charge}<span>Va s'envoler</span></div><div class="effet-intention">Pendant ton prochain tour, tes Attaques à cible unique ne pourront pas le viser (les Sorts et les zones, si)</div>`;
      return `<div class="intention malediction">${ICON.charge}<span>Va se dérober</span></div><div class="effet-intention">À la fin de ce tour, il Cligne : pendant ton prochain tour, tu ne pourras pas le cibler (les attaques de zone le touchent)</div>`;
    case 'idle':
      return `<div class="intention soutien"><span>${i.label}</span></div>`;
    case 'hatch':
      return `<div class="intention malediction">${ICON.hausse}<span>${i.label}</span></div><div class="effet-intention">${i.self ? 'Il éclôt en Dragonnet noir' : i.count === 'all' ? 'Tous les Œufs éclosent' : `${i.count} Œufs éclosent`}</div>`;
    case 'potion':
      return `<div class="intention soutien">${ICON.hausse}<span>${i.label}</span></div><div class="effet-intention">${GRIZZIK_POTIONS[i.potion].split(' : ')[1] ?? ''}</div>`;
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
  armure_demoniaque: ['Armure démoniaque', 'Soigne 1 PV au début de ton tour'],
  etreinte: ['Étreinte de l\'ombre', 'Tes DoT : +dégâts'],
  tourment: ['Tourment', 'Chaque tick de DoT te soigne'],
  liens_demoniaques: ['Liens démoniaques', 'Familier : effets +50 %'],
  eclat_partage: ['Éclat partagé', 'Ton familier tue : +1 éclat'],
  lien_ame: ['Lien de l\'âme', 'Dégâts du familier → blocage'],
  maitre_pactes: ['Maître des pactes', 'Pactes : moins de PV'],
  ombre_et_flammes: ['Ombre et flammes', 'Trait de l\'ombre, Incinérer, Immolation : +dégâts'],
  contrecoup: ['Contrecoup', 'Perdre des PV : Trait de l\'ombre gratuit'],
  ruine: ['Ruine', 'Sorts à 2 énergie : +dégâts'],
  feu_interieur: ['Feu intérieur', 'Puissance et Robustesse'],
  meditation_sacree: ['Méditation', 'Égide : +1 Foi par tour'],
  lumiere_persistante: ['Lumière persistante', 'Égide à chaque tour'],
  expiation: ['Expiation', 'Sort qui touche : soin'],
  ame_inebranlable: ['Âme inébranlable', 'Égide max 50, +2 par tour'],
  sol_sacre: ['Sol sacré', 'Dégâts à tous et soin à chaque tour'],
  chant_lumiere: ['Chant de lumière', 'Gagner de la Foi : dégâts'],
  ange_gardien: ['Ange gardien', 'À 0 PV : reste à 1, soigné de 15'],
  esprit_guerison: ['Esprit de guérison', 'Tout le soin en trop devient Égide'],
  ascension: ['Ascension lumineuse', 'Chaque soin frappe un ennemi'],
  etreinte_vampirique: ['Étreinte vampirique', 'Sort d\'Ombre : soin'],
  esprit_tourmente: ['Esprit tourmenté', 'DoT qui tue : pioche'],
  tenebres: ['Ténèbres intérieures', 'Tes DoT : +dégâts'],
  bagarreur: ['Bagarreur', 'Puissance'],
  toxines_virulentes: ['Toxines virulentes', 'Le Poison passe d\'un mort à un vivant'],
  lames_empoisonnees: ['Lames empoisonnées', 'Le Poison ne diminue plus'],
  opportunite: ['Opportunité', 'Finisher à 5 points : énergie et combo'],
  tourbillon_lames: ['Tourbillon de lames', 'Cible unique : un 2e ennemi à moitié'],
  second_souffle: ['Second souffle', 'Finisher : blocage'],
  ambidextrie_experte: ['Ambidextrie experte', '1re Attaque du tour jouée deux fois'],
  initiative: ['Initiative', 'Ouverture : +2 combo'],
  opportuniste: ['Opportuniste', 'Ennemis contrôlés : +dégâts'],
  seigneur_ombres: ['Seigneur des ombres', 'Camouflé à chaque tour'],
  rayonnement: ['Rayonnement', 'Chaque soin blesse tous les ennemis'],
  grace_croise: ['Grâce du croisé', 'Soin au début de chaque tour'],
  illumination: ['Illumination', '1er soin du tour : +1 énergie'],
  avatar_lumiere: ['Avatar de lumière', 'Soins +25 %, chaque soin frappe un ennemi'],
  sanctuaire: ['Sanctuaire', 'Attaques ennemies : −dégâts'],
  fervent: ['Fervent', 'Attaque bloquée entièrement : +1 énergie au prochain tour'],
  dernier_serment: ['Dernier serment', 'Sous 20 % des PV : soin de 15, une fois'],
  zele: ['Zèle', 'Sceau activé : +1 Puissance (5 max)'],
  science_combat: ['Science du combat', '2e Attaque du tour : prochain soin gratuit'],
  vengeance_pal: ['Vengeance', 'Ennemi tué : +1 Puissance'],
  croisade: ['Croisade', 'Attaques +2, +4 contre Morts-vivants et Démons'],
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
  if (d?.toxine) chips.push(`<span class="chip debuff" title="2 dégâts au début de tes prochains tours">Toxine ${d.toxine}</span>`);
  if (d?.peste) chips.push(`<span class="chip debuff" title="Tes soins sont réduits de moitié">Peste ${d.peste}</span>`);
  if (d?.ralenti) chips.push(`<span class="chip debuff" title="Tu gagnes 25 % de blocage en moins">Ralenti ${d.ralenti}</span>`);
  if (d?.fracasse) chips.push(`<span class="chip debuff" title="Tu subis 50 % de dégâts en plus">Armure fracassée ${d.fracasse}</span>`);
  if (d?.ombre) chips.push(`<span class="chip debuff" title="+2 dégâts par attaque reçue et par cumul, jusqu'à la fin du combat">Ombre rongeuse ${d.ombre}</span>`);
  if (d?.lignee) chips.push(`<span class="chip debuff" title="Vhaeryx vise ta classe">Malédiction de lignée ${d.lignee}</span>`);
  if (d?.discard) chips.push(`<span class="chip debuff">${d.discard} carte${d.discard > 1 ? 's' : ''} défaussée${d.discard > 1 ? 's' : ''} au prochain tour</span>`);
  for (const a of d?.afflictions ?? []) chips.push(`<span class="chip debuff affliction-${a}" title="${AFFLICTIONS[a]}">Sang ${a}</span>`);
  if (c.adrenaline && c.enemies.some((e) => e.defId === 'ysolde' && !e.dead)) chips.push(`<span class="chip brule" title="+3 énergie par tour">Adrénaline : −${c.adrenaline} PV en fin de tour</span>`);
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
  if (c.renew?.turns) chips.push(`<span class="chip">Grâce : +${c.renew.amount} PV (${c.renew.turns} tours)</span>`);
  if (c.undying) chips.push('<span class="chip">Égide des anciens : PV ≥ 1</span>');
  if (c.costDown) chips.push('<span class="chip">Transfusion : cartes −1</span>');
  if (c.shadowForm) chips.push('<span class="chip ombre">Forme d\'Ombre</span>');
  // Paladin
  if (p.divineShield) chips.push('<span class="chip sacre">Bouclier divin : immunisé, Attaques ÷ 2</span>');
  if (c.favor) chips.push('<span class="chip sacre">Faveur divine : prochain soin ou Sort ×2</span>');
  if (c.consecration?.turns) chips.push(`<span class="chip sacre">Consécration : ${c.consecration.dmg} à tous (${c.consecration.turns}t)</span>`);
  if (c.pavois) chips.push(`<span class="chip sacre">Pavois : ${c.pavois} aux attaquants bloqués</span>`);
  if (c.crusaderShield) chips.push('<span class="chip sacre">Bouclier du croisé</span>');
  if (c.wings) chips.push(`<span class="chip sacre">Ailes de justice : +2 Puissance (${c.wings}t)</span>`);
  if (c.judgeBonus) chips.push(`<span class="chip sacre">Vengeance divine : +${c.judgeBonus} à la prochaine Attaque</span>`);
  if (c.healFree) chips.push('<span class="chip sacre">Prochaine carte de soin gratuite</span>');
  if (c.weaponPoison) chips.push(`<span class="chip poison" title="Tes Attaques appliquent ce Poison">Poison ${c.weaponPoison.id} ${c.weaponPoison.amount}</span>`);
  if (c.bladeDance?.turns) chips.push(`<span class="chip">Danse des lames : +${c.bladeDance.bonus} (${c.bladeDance.turns}t)</span>`);
  if (c.coldBlood) chips.push('<span class="chip">Sang-froid : prochaine Attaque ×2</span>');
  if (c.shadowStep) chips.push('<span class="chip ombre">Bond de l\'ombre</span>');
  if (c.stealthNext) chips.push('<span class="chip ombre">Camouflé au prochain tour</span>');
  if (c.openersFree) chips.push('<span class="chip">Plan parfait : Ouvertures gratuites</span>');
  if (p.evasion) chips.push('<span class="chip">Évasion : dégâts ÷ 2</span>');
  if (c.tenebres || c.gear?.longStealth) chips.push('<span class="chip ombre" title="Ton Camouflage de début de combat dure 2 tours">Ombres profondes</span>');
  if (c.soulstone) chips.push('<span class="chip ombre" title="Si tu tombes à 0 PV, tu reviens à 30 %">Pierre d\'âme</span>');
  if (c.amplify) chips.push('<span class="chip ombre">Prochaine Malédiction ×2</span>');
  if (c.doubleNext) chips.push('<span class="chip ombre">Prochain Sort ×2</span>');
  if (c.shadowFree) chips.push('<span class="chip ombre">Trait de l\'ombre gratuit</span>');
  if (c.petDouble) chips.push('<span class="chip ombre">Familier : action doublée</span>');
  if (c.petBonus) chips.push(`<span class="chip ombre">Familier +${c.petBonus} dégâts</span>`);
  if (c.freeNextSpell) chips.push('<span class="chip">Présence d\'esprit : prochain Sort gratuit</span>');
  if (c.shatterReady) chips.push('<span class="chip gel">Toucher glacial : prochain Fracasser</span>');
  for (const [id, v] of Object.entries(c.powers ?? {})) {
    if (POWER_LABEL[id]) chips.push(`<span class="chip pouvoir" title="${POWER_LABEL[id][1]}">${POWER_LABEL[id][0]}${v > 1 ? ` ${v}` : ''}</span>`);
  }
  return chips.join('');
}

/** La Foi et l'Égide du Prêtre. */
function priestResource(c: CombatState): string {
  const f = c.faith ?? 0;
  const max = c.maxFaith ?? 10;
  const pips = Array.from({ length: max }, (_, i) => `<i class="${i < f ? 'plein' : ''}"></i>`).join('');
  const a = c.aegis ?? 0;
  const amax = c.maxAegis ?? 30;
  return `<div class="ligne"><span class="rage-label foi-label">FOI</span><div class="rage foi" style="grid-template-columns: repeat(${max}, minmax(0, 1fr))">${pips}</div><span class="rage-label" style="width:auto">${f}</span></div>
    <div class="ligne"><span class="rage-label egide-label">ÉGIDE</span><div class="barre-egide"><div style="width:${Math.min(100, (a / amax) * 100)}%"></div><span>${a} / ${amax}</span></div></div>
    <div class="aide-posture">${c.shadowForm ? '<b>Forme d\'Ombre</b> : Sorts d\'Ombre +30 %, soins ÷ 2, plus de Foi.' : 'L\'Égide reste d\'un tour à l\'autre. Soigner ou donner de l\'Égide : +1 Foi.'}</div>`;
}

/** Les points de combo et le Camouflage du Voleur. */
function rogueResource(c: CombatState): string {
  const n = c.combo ?? 0;
  const pips = Array.from({ length: 5 }, (_, i) => `<i class="${i < n ? 'plein' : ''}"></i>`).join('');
  const stealth = c.stealth
    ? `<b class="camoufle">Camouflé</b>${(c.stealthTurns ?? 1) > 1 ? ` (${c.stealthTurns} tours)` : ''} : tu peux jouer tes Ouvertures. Une Attaque qui n'en est pas une te fait sortir de l'ombre.`
    : 'Les générateurs donnent du combo, les finishers le dépensent.';
  return `<div class="ligne"><span class="rage-label combo-label">COMBO</span><div class="rage combo">${pips}</div><span class="rage-label" style="width:auto">${n}</span></div>
    <div class="aide-posture">${stealth}</div>`;
}

/** Ce que fera le Jugement maintenant (pour l'interface du Paladin). */
function judgeText(c: CombatState): string {
  const seals = c.seals ?? [];
  return seals.length ? seals.map((s) => SEAL_TEXT[s].judge).join(' + ') : '6 dégâts';
}

/** Les noms courts des Sceaux et des Auras (sous les emblèmes du Paladin). */
const SEAL_SHORT: Record<string, string> = { droiture: 'Droiture', croise: 'Croisé', lumiere: 'Lumière', sagesse: 'Sagesse', rempart: 'Rempart', vengeance: 'Vengeance' };
const AURA_SHORT: Record<string, string> = { devotion: 'Dévotion', resistance: 'Résistance', epines: 'Épines' };
const ICON_SCEAU = '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="12" cy="12" r="4.5"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/></svg>';
const ICON_AURA = '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><ellipse cx="12" cy="6" rx="7" ry="2.5"/><path d="M12 10l2 4h-4l2-4zM8 20h8"/></svg>';

/** Les Sceaux et l'Aura du Paladin : deux emblèmes, et ce que fera le Jugement. */
function paladinResource(c: CombatState): string {
  const seals = c.seals ?? [];
  const aura = c.aura;
  const sealLabel = seals.length ? seals.map((s) => SEAL_SHORT[s]).join(' + ') : 'Aucun Sceau';
  const sealTitle = seals.length ? seals.map((s) => `${SEAL_NAMES[s]} : ${SEAL_TEXT[s].bonus}`).join(' ; ') : 'Joue une carte Sceau';
  const auraTitle = aura ? AURA_NAMES[aura.id] : 'Joue une carte Aura (une seule à la fois)';
  const bonus = seals.map((s) => SEAL_TEXT[s].bonus).join(' ; ');
  return `<div class="ligne pal-tuiles">
      <div class="pal-tuile ${seals.length ? 'actif' : ''}" title="${sealTitle}">${ICON_SCEAU}<span>${sealLabel}</span></div>
      <div class="pal-tuile aura ${aura ? 'actif' : ''}" title="${auraTitle}">${ICON_AURA}<span>${aura ? AURA_SHORT[aura.id] : 'Aucune Aura'}</span></div>
      <div class="pal-jugement"><small>JUGEMENT</small><b>${judgeText(c)}</b></div>
    </div>
    <div class="aide-posture">${seals.length ? `${bonus[0].toUpperCase()}${bonus.slice(1)}.` : 'Joue une carte Sceau, puis juge-la avec le sort Jugement.'}</div>`;
}

/** Les éclats d'âme et le familier du Démoniste. */
function demonResource(c: CombatState): string {
  const n = c.shards ?? 0;
  const pips = Array.from({ length: MAX_SHARDS }, (_, i) => `<i class="${i < n ? 'plein' : ''}"></i>`).join('');
  const pet = c.pet && !c.petSacrificed ? PETS[c.pet] : null;
  const canSwap = c.turn === 1 && (c.cardsThisTurn ?? 0) === 0 && (c.pet === 'diablotin' || c.pet === 'rodeur');
  const swap = canSwap
    ? `<div class="postures" role="group" aria-label="Familier">${(['diablotin', 'rodeur'] as const).map((id) => `<button type="button" class="${c.pet === id ? 'actif' : ''}" data-action="familier" data-pet="${id}" aria-pressed="${c.pet === id}">${PETS[id].name}</button>`).join('')}</div>`
    : '';
  return `<div class="ligne"><span class="rage-label eclats-label">ÉCLATS</span><div class="rage eclats">${pips}</div><span class="rage-label" style="width:auto">${n}</span></div>
    ${swap}
    <div class="aide-posture">${pet ? `<b>${pet.name}</b> : ${pet.text.replace('À la fin de ton tour : ', '')}` : c.petSacrificed ? 'Familier sacrifié : +1 énergie par tour.' : ''}${canSwap ? ' · choisis ton familier avant de jouer' : ''}</div>`;
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
    : run.classId === 'demoniste' ? demonResource(c) : run.classId === 'pretre' ? priestResource(c) : run.classId === 'voleur' ? rogueResource(c) : run.classId === 'paladin' ? paladinResource(c) : '';
  const postures = POSTURES.map((po) => {
    const actif = p.posture === po.id;
    const disabled = !actif && p.postureChanged;
    return `<button type="button" class="${actif ? 'actif' : ''}" data-action="posture" data-posture="${po.id}" ${disabled ? 'disabled' : ''} aria-pressed="${actif}">${po.label}</button>`;
  }).join('');
  const aidePosture = POSTURES.find((po) => po.id === p.posture)?.aide ?? '';

  const enemies = c.enemies.filter((e) => !e.dead && !e.submerged).map((e) => {
    const def = ENEMIES[e.defId];
    const big = e.defId === 'seigneur' || (def.elite && e.defId !== 'croc');
    const small = ['etincelle', 'rejeton', 'eclat', 'dragonnet', 'oeuf', 'oeuf_skarn', 'oeuf_vashka', 'serviteur_os'].includes(e.defId);
    const size = e.defId === 'vulkhar' ? 240 : e.defId === 'vhaeryx' ? 208 : big ? 192 : small ? 96 : 144;
    const sprite = e.defId === 'vhaeryx' && (e.phase ?? 1) >= 2 ? 'ennemi_vhaeryx_dragon.png' : `ennemi_${e.defId}.png`;
    const pct = Math.max(0, (e.hp / e.maxHp) * 100);
    const canTarget = targeting && !e.untargetable;
    const tag = canTarget ? 'button' : 'div';
    return `<${tag} ${canTarget ? 'type="button"' : ''} class="ennemi ${canTarget ? 'ciblable' : ''} ${e.untargetable ? 'insaisissable' : ''}" data-action="cible" data-uid="${e.uid}" aria-label="${e.name}, ${e.hp} PV">
      ${intentHtml(c, e)}
      <img class="px" data-fx="${e.uid}" src="${A(sprite)}" alt="" style="width:${size}px;height:${size}px">
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
      <img class="px ${c.stealth ? 'camoufle-sprite' : ''}" data-fx="player" src="${A(hero.sprite ?? 'guerrier.png')}" alt="Le ${hero.name}" style="width:192px;height:192px">
      ${c.pet && !c.petSacrificed ? `<img class="px familier" src="${A(`familier_${c.pet}.png`)}" alt="${PETS[c.pet].name}" title="${PETS[c.pet].name} : ${PETS[c.pet].text}">` : ''}
      ${c.infernal ? `<img class="px seigneur-infernal" src="${A('familier_seigneur.png')}" alt="Seigneur infernal" title="Seigneur infernal : ${c.infernal} dégâts à tous les ennemis à la fin de ton tour">` : ''}
      <div class="jauges">
        <div class="ligne">
          <div class="bouclier-badge" title="Blocage"><svg width="32" height="32" viewBox="0 0 24 24" fill="#1d2633" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z"/></svg><span>${p.block}</span></div>
          <div class="barre-pv"><div style="width:${hpPct}%"></div><span>${p.hp} / ${p.maxHp}</span></div>
        </div>
        ${resource ? resource : `<div class="ligne"><span class="rage-label">RAGE</span><div class="rage">${rage}</div><span class="rage-label" style="width:auto">${p.rage}</span></div>
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
      <p>Acte ${saved.act ?? 1} · ${saved.position === null ? 'Entrée' : `Étage ${saved.map.nodes[saved.position].floor + 1}/${FLOORS}`} · ${ICON.coeur} ${saved.hp}/${saved.maxHp} · ${ICON.piece} ${saved.gold} · ${saved.wipesLeft} wipe${saved.wipesLeft > 1 ? 's' : ''} restant${saved.wipesLeft > 1 ? 's' : ''}</p>
      <button type="button" class="gros-bouton" data-action="continuer">Continuer</button>
    </div>` : '';
  const stats = profile.stats;
  return `<div class="hall">
    <header class="hall-tete"><span class="titre-jeu petit">Wipe &amp; Loot</span><span class="hall-nom">Hall de la guilde</span>
      <div class="hall-options">${isDevBuild() ? '<button type="button" class="bouton bouton-test" data-action="test">🛠 Test</button>' : ''}${fullscreenButton('bouton')}</div></header>
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
      <span class="butin-titre">L'expédition · ${Object.keys(ACTS).length} actes</span>
      <h2>${ACTS[1].name} → ${ACTS[2].name}</h2>
      <p>Les Profondeurs Ardentes et Vulkhar, puis l'Aire de Vhaeryx au sommet du mont Durgal. 10 étages par acte, des boss secondaires différents à chaque expédition.</p>
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

/** Une entrée des archives : sa clé, si elle est découverte, et le contenu de son icône. */
interface ArchiveEntry { key: string; seen: boolean; icon: string; cls: string; badge?: string }
type ArchiveGroup = { title: string; entries: ArchiveEntry[] };

const CARD_RARITY_LABEL: Record<string, string> = { depart: 'départ', commune: 'commune', peu_commune: 'peu commune', rare: 'rare', epique: 'épique' };

/** Les groupes d'icônes d'un onglet des archives. */
function archiveGroups(tab: UiState['archiveTab']): ArchiveGroup[] {
  const p = loadProfile();
  if (tab === 'cartes') {
    return CLASSES.filter((c) => c.playable).map((c) => ({
      title: c.name,
      entries: [...starterCards(c.id), ...rewardPool(c.id)].map((id) => ({
        key: id, seen: p.seenCards.includes(id), cls: `r-${CARDS[id].rarity}`,
        icon: `<img class="px" src="${A(`carte_${id}.png`)}" alt="">`,
      })),
    }));
  }
  if (tab === 'objets') {
    const groups: [string, string[]][] = [['Coffres et vendeur gobelin', COMMON_POOL],
      ...ELITE_ENCOUNTERS.map((e) => [e.name, LOOT_TABLES[e.loot!]] as [string, string[]]),
      ['Légendaires', Object.keys(ITEMS).filter((id) => ITEMS[id].rarity === 'legendaire')]];
    return groups.map(([title, ids]) => ({
      title,
      entries: ids.map((id) => ({ key: `${title}|${id}`, seen: p.discoveredItems.includes(id), cls: ITEMS[id].rarity, icon: SLOT_ICON[ITEMS[id].slot] })),
    }));
  }
  if (tab === 'potions') {
    return [{ title: 'Potions', entries: POTION_IDS.map((id) => ({ key: id, seen: p.seenPotions.includes(id), cls: POTIONS[id].rarity, icon: potionIcon(p.seenPotions.includes(id) ? id : null, 44) })) }];
  }
  const groups: ArchiveGroup[] = [];
  for (const act of [1, 2]) {
    const ids = Object.keys(ENEMIES).filter((id) => (id in ENEMIES_ACTE2) === (act === 2));
    const kinds: [string, (id: string) => boolean][] = [
      ['Monstres', (id) => !ENEMIES[id].elite && !ENEMIES[id].boss],
      ['Boss secondaires', (id) => !!ENEMIES[id].elite && !ENEMIES[id].boss],
      ['Boss', (id) => !!ENEMIES[id].boss],
    ];
    for (const [kind, test] of kinds) {
      const list = ids.filter(test);
      if (list.length === 0) continue;
      groups.push({
        title: `Acte ${act} · ${kind}`,
        entries: list.map((id) => ({
          key: id, seen: p.seenEnemies.includes(id), cls: ENEMIES[id].boss ? 'boss' : ENEMIES[id].elite ? 'elite' : '',
          icon: `<img class="px" src="${A(`ennemi_${id}.png`)}" alt="">`,
          badge: p.kills[id] ? `×${p.kills[id]}` : undefined,
        })),
      });
    }
  }
  return groups;
}

/** La part découverte d'un onglet des archives (en %). */
function archiveTabProgress(tab: UiState['archiveTab']): { seen: number; total: number; pct: number } {
  const all = archiveGroups(tab).flatMap((g) => g.entries);
  // Un objet peut apparaître dans deux groupes : on le compte une fois.
  const unique = new Map(all.map((e) => [e.key.split('|').pop()!, e.seen]));
  const total = unique.size;
  const seen = [...unique.values()].filter(Boolean).length;
  return { seen, total, pct: total ? Math.floor((100 * seen) / total) : 0 };
}

/** Les archives de la guilde : une grille d'icônes par onglet, et la fiche de l'icône touchée à droite. */
function archivesScreen(): string {
  const tab = ui.archiveTab;
  const tabs = ([['cartes', 'Cartes'], ['objets', 'Objets'], ['potions', 'Potions'], ['monstres', 'Monstres']] as const)
    .map(([id, label]) => `<button type="button" class="onglet ${tab === id ? 'actif' : ''}" data-action="archives-onglet" data-tab="${id}">${label} · ${archiveTabProgress(id).pct} %</button>`).join('');
  const { seen, total } = archiveTabProgress(tab);
  const groups = archiveGroups(tab);
  const body = groups.map((g) => `<section class="groupe-archives"><h3>${g.title} · ${g.entries.filter((e) => e.seen).length}/${g.entries.length}</h3><div class="tuiles-archives">${g.entries.map((e) =>
    `<button type="button" class="tuile-archive ${tab} ${e.cls} ${e.seen ? '' : 'inconnue'} ${ui.archiveSel === e.key ? 'choisie' : ''}" data-action="archives-voir" data-id="${e.key}" aria-label="${e.seen ? archiveName(tab, e.key) : 'Pas encore découvert'}">${e.icon}${e.seen && e.badge ? `<span class="compteur-archive">${e.badge}</span>` : ''}${!e.seen && tab !== 'monstres' ? '<span class="compteur-archive">?</span>' : ''}</button>`).join('')}</div></section>`).join('');
  const entry = groups.flatMap((g) => g.entries).find((e) => e.key === ui.archiveSel);
  return `<div class="ecran ecran-archives">
    <div class="archives-gauche">
      <div class="tete-talents"><h2>Archives</h2><div class="onglets">${tabs}</div><span class="points-talent">${seen} / ${total}</span></div>
      <div class="contenu-archives">${body}</div>
    </div>
    <div class="archives-droite">
      ${entry ? archiveSheet(tab, entry) : `<aside class="fiche-talent vide"><div class="titre-fiche">Archives de la guilde</div><p>Touche une icône pour voir sa fiche.</p><p>Ce que tu n'as pas encore découvert reste caché : une silhouette pour les monstres, un « ? » pour le reste.</p></aside>`}
      <button type="button" class="gros-bouton secondaire" data-action="titre">Retour au hall</button>
    </div>
  </div>`;
}

/** Le nom d'une entrée des archives (pour l'accessibilité). */
function archiveName(tab: UiState['archiveTab'], key: string): string {
  const id = key.split('|').pop()!;
  return tab === 'cartes' ? CARDS[id].name : tab === 'objets' ? ITEMS[id].name : tab === 'potions' ? POTIONS[id].name : ENEMIES[id].name;
}

/** La fiche d'une entrée des archives. */
function archiveSheet(tab: UiState['archiveTab'], e: ArchiveEntry): string {
  const p = loadProfile();
  const big = `<span class="tuile-archive grande ${tab} ${e.cls} ${e.seen ? '' : 'inconnue'}">${e.icon}</span>`;
  const head = (title: string, tags: string) => `<div class="haut-fiche">${big}<div><div class="titre-fiche">${title}</div><div class="etiquettes">${tags}</div></div></div>`;
  const tag = (text: string, cls = '') => `<span class="type-talent ${cls}">${text}</span>`;
  if (tab === 'cartes') {
    const def = CARDS[e.key];
    const cls = CLASSES.find((c) => c.playable && [...starterCards(c.id), ...rewardPool(c.id)].includes(e.key))?.name ?? '';
    if (!e.seen) return `<aside class="fiche-talent">${head('???', tag(cls) + tag(CARD_RARITY_LABEL[def.rarity] ?? def.rarity))}<div class="texte-fiche"><p class="note">Pas encore vue. Elle apparaîtra ici dès qu'elle te sera proposée (récompense, vendeur, deck).</p></div></aside>`;
    return `<aside class="fiche-talent fiche-archive-carte"><div class="titre-fiche">${def.name}</div><div class="etiquettes">${tag(cls)}${tag(CARD_RARITY_LABEL[def.rarity] ?? def.rarity)}</div><div class="cartes-rappel">${cardHtml({ uid: 0, id: e.key, upgraded: false }, { action: 'disabled' })}</div></aside>`;
  }
  if (tab === 'objets') {
    const [source, id] = e.key.split('|');
    const it = ITEMS[id];
    const tags = tag(SLOT_LABEL[slotsFor(id)[0]]) + tag(RARITY_LABEL[it.rarity], `r-${it.rarity}`);
    const where = `<p class="note">Où le trouver : <b>${source === 'Légendaires' ? 'à forger pendant une expédition' : source}</b>.</p>`;
    if (!e.seen) return `<aside class="fiche-talent">${head('???', tags)}<div class="texte-fiche"><p class="note">Pas encore découvert.</p>${where}</div></aside>`;
    const note = uselessNote(id);
    return `<aside class="fiche-talent">${head(it.name, tags)}<div class="texte-fiche"><p>${it.text}</p>${note ? `<p class="note">${note}</p>` : ''}${where}</div></aside>`;
  }
  if (tab === 'potions') {
    const d = POTIONS[e.key];
    if (!e.seen) return `<aside class="fiche-talent">${head('???', tag('Potion'))}<div class="texte-fiche"><p class="note">Pas encore découverte.</p></div></aside>`;
    return `<aside class="fiche-talent">${head(d.name, tag('Potion') + tag(d.rarity, `r-${d.rarity}`))}<div class="texte-fiche"><p>${d.text}</p></div></aside>`;
  }
  const d = ENEMIES[e.key];
  const act = e.key in ENEMIES_ACTE2 ? 2 : 1;
  const kind = d.boss ? 'Boss' : d.elite ? 'Boss secondaire' : 'Monstre';
  const kindTag = tag(`${kind} · acte ${act}`, d.boss ? 'r-legendaire' : d.elite ? 'r-epique' : '');
  if (!e.seen) return `<aside class="fiche-talent">${head('???', kindTag)}<div class="texte-fiche"><p class="note">Pas encore rencontré.</p></div></aside>`;
  const kills = p.kills[e.key] ?? 0;
  return `<aside class="fiche-talent">${head(d.name, kindTag + tag(`${d.hpMax} PV`) + tag(`vaincu ${kills} fois`))}<div class="texte-fiche">${LORE[e.key] ? `<p class="lore-archive">${LORE[e.key]}</p>` : ''}${d.passive ? `<p class="note"><b>Passif :</b> ${d.passive}</p>` : ''}</div></aside>`;
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

/** Entre deux actes : le boss est vaincu, on entre dans l'acte suivant. */
function actScreen(run: RunState): string {
  const next = actDef(run.act + 1);
  return `${topbar(run, run.hp)}<div class="ecran ecran-acte">
    <span class="butin-titre">Acte ${run.act} terminé</span>
    <h1>${next.name}</h1>
    <p class="texte-evenement">${next.intro}</p>
    <p>Avant de repartir, la guilde panse tes blessures : <b>tes PV remontent au maximum</b>.</p>
    <button type="button" class="gros-bouton" data-action="acte-suivant">Entrer dans l'acte ${run.act + 1}</button>
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
  if (ui.bindStaff) {
    const cards = run.deck.map((card) => {
      const ok = CARDS[card.id].rarity === 'rare';
      return cardHtml(card, { action: ok ? `data-action="lier-baton" data-uid="${card.uid}"` : 'disabled', disabled: !ok });
    }).join('');
    return `${topbar(run, run.hp)}<div class="ecran" style="justify-content:flex-start;padding-top:70px;gap:14px">
      <h2>Lier les fragments</h2>
      <p>Le bâton exige un sacrifice : choisis une carte rare de ton deck. Elle disparaît, et le Bâton du Veilleur remplace ton arme.</p>
      <div class="liste-deck">${cards}</div>
      <button type="button" class="gros-bouton secondaire" data-action="feu-retour">Retour</button>
    </div>`;
  }
  const heal = Math.min(campfireHealAmount(run), run.maxHp - run.hp);
  const pct = (n: number) => `${Math.round((100 * n) / run.maxHp)}%`;
  // Les légendaires à forger : une tuile dorée chacun (le texte de l'étape et l'objet obtenu).
  const forges = [
    canReforge(run) && { action: 'reforger', label: 'Reforger Brisemonts', item: 'brisemonts', text: 'Tu poses la Lame brisée sur les braises, et le Cœur de la montagne se met à battre. Reforger Brisemonts prend toute la nuit : pas de repos ni d\'entraînement. L\'épée remplacera ton arme actuelle.' },
    canBindStaff(run) && { action: 'lier-fragments', label: 'Lier les fragments', item: 'baton_veilleur', text: 'Tu poses le Fragment et la Tête du bâton près du feu. Les runes s\'éveillent : le Veilleur attend un dernier sacrifice.' },
    canForgeEquinoxe(run) && { action: 'equinoxe', label: 'Rituel de l\'équinoxe', item: 'equinoxe', text: 'Tu sertis la Larme d\'Ysolde au sommet du Bâton nu. La pierre s\'illumine, puis s\'assombrit, puis s\'illumine encore.' },
    canForgeAurore(run) && { action: 'aurore', label: 'Rallumer l\'Aurore ardente', item: 'aurore_ardente', text: 'Tu poses la lame purifiée dans les braises. Une lueur d\'aube monte de l\'acier, comme si elle n\'attendait que ce feu-là.' },
  ].filter((f): f is { action: string; label: string; item: string; text: string } => !!f);
  const forgeTiles = forges.map((f) => `<button type="button" class="choix-feu legendaire" data-action="${f.action}">
      <span class="case-equipement legendaire">${SLOT_ICON[ITEMS[f.item].slot]}</span>
      <span class="texte-choix"><b>${f.label}</b><span>${f.text}</span><span class="effet-choix"><b>${ITEMS[f.item].name} :</b> ${ITEMS[f.item].text}</span></span></button>`).join('');
  const rest = !canRest(run)
    ? `<button type="button" class="choix-feu" disabled><img class="px" src="${A('icone_repos.png')}" alt=""><span class="texte-choix"><b>Se reposer</b><span>Repos impossible (Flamme captive).</span></span></button>`
    : heal <= 0
      ? `<button type="button" class="choix-feu" disabled><img class="px" src="${A('icone_repos.png')}" alt=""><span class="texte-choix"><b>Se reposer</b><span>Tu as déjà tous tes PV.</span></span></button>`
      : `<button type="button" class="choix-feu principal" data-action="repos"><img class="px" src="${A('icone_repos.png')}" alt=""><span class="texte-choix"><b>Se reposer</b><span>+${heal} PV : ${run.hp} → ${run.hp + heal}</span>
          <span class="apercu-pv"><i style="width:${pct(run.hp)}"></i><u style="left:${pct(run.hp)};width:${pct(heal)}"></u></span></span></button>`;
  const hero = classInfo(run.classId);
  return `${topbar(run, run.hp)}<div class="ecran-feu">
    <div class="scene-feu">
      <img class="px heros-feu" src="${A(hero.sprite ?? 'guerrier.png')}" alt="Le ${hero.name}">
      <span class="lueur-feu"></span>
      <span class="flammes-feu" style="background-image:url(${A('feu_camp.png')})"></span>
    </div>
    <div class="choix-du-feu">
      <h2>Feu de camp</h2>
      <p>La chaleur de la montagne se fait oublier un instant. Une seule action avant de repartir.</p>
      ${forgeTiles}
      ${rest}
      <button type="button" class="choix-feu" data-action="feu-ameliorer"><img class="px" src="${A('icone_enclume.png')}" alt=""><span class="texte-choix"><b>Améliorer une carte</b><span>Le maître de classe améliore une carte de ton deck.</span></span></button>
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

/** L'état d'une classe sur l'écran des classes. */
type ClassStatus = 'libre' | 'jouee' | 'debloquee' | 'a-debloquer' | 'verrouillee' | 'bientot';
const CLASS_BADGE: Record<ClassStatus, string> = { libre: '', jouee: 'Jouée', debloquee: 'Débloquée', 'a-debloquer': 'À débloquer', verrouillee: '🔒 À débloquer', bientot: 'Bientôt' };
const DIFFICULTY_WORD = ['', 'facile', 'moyenne', 'difficile'];

/** L'écran des classes : une grille de sprites, et la fiche de la classe touchée à droite.
 *  Au premier lancement, on y choisit sa classe de départ ; ensuite, on y joue ou débloque une classe. */
function classScreen(): string {
  const profile = loadProfile();
  const first = !profile.startClass;
  const current = activeClass(profile);
  const status = (id: string): ClassStatus => {
    const c = CLASS_BY_ID[id];
    if (!c.playable) return 'bientot';
    if (first) return 'libre';
    if (profile.unlockedClasses.includes(id)) return id === current ? 'jouee' : 'debloquee';
    return unlocksAvailable(profile) > 0 ? 'a-debloquer' : 'verrouillee';
  };
  const selId = ui.classSel && CLASS_BY_ID[ui.classSel] ? ui.classSel : first ? 'guerrier' : current;
  const sprite = (c: (typeof CLASSES)[number]) => (c.sprite ? `<img class="px" src="${A(c.sprite)}" alt="">` : '<span class="sprite-inconnu">?</span>');
  const cards = CLASSES.map((c) => {
    const st = status(c.id);
    const hidden = st === 'bientot' || st === 'verrouillee' || st === 'a-debloquer';
    const stars = '★'.repeat(c.difficulty) + '<i>' + '★'.repeat(3 - c.difficulty) + '</i>';
    return `<button type="button" class="carte-classe ${st} ${hidden ? 'silhouette' : ''} ${c.id === selId ? 'choisie' : ''}" data-action="classe-voir" data-id="${c.id}" style="--couleur:${c.color}">
      ${CLASS_BADGE[st] ? `<span class="badge-classe">${CLASS_BADGE[st]}</span>` : ''}
      <span class="sprite-classe">${sprite(c)}</span><b>${c.name}</b><span class="etoiles">${stars}</span>
    </button>`;
  }).join('');
  const c = CLASS_BY_ID[selId];
  const st = status(selId);
  const next = nextUnlockAt(profile);
  const n = unlocksAvailable(profile);
  const [button, note] = {
    libre: [`<button type="button" class="gros-bouton" data-action="classe-depart" data-id="${c.id}">Commencer avec le ${c.name}</button>`, 'Les autres classes se débloqueront avec l\'expérience.'],
    jouee: ['<button type="button" class="gros-bouton" disabled>Classe jouée</button>', 'C\'est la classe de tes prochaines expéditions.'],
    debloquee: [`<button type="button" class="gros-bouton" data-action="classe-active" data-id="${c.id}">Jouer le ${c.name}</button>`, ''],
    'a-debloquer': [`<button type="button" class="gros-bouton" data-action="debloquer" data-id="${c.id}">Débloquer le ${c.name}</button>`, `Tu peux débloquer ${n} classe${n > 1 ? 's' : ''} : c'est toi qui choisis.`],
    verrouillee: ['<button type="button" class="gros-bouton" disabled>À débloquer</button>', next ? `Prochaine classe à ${next} exp. (tu en as ${totalXp(profile)}).` : ''],
    bientot: ['<button type="button" class="gros-bouton" disabled>En préparation</button>', 'Cette classe arrive dans une prochaine version.'],
  }[st];
  const sub = first
    ? 'Choisis ta classe de départ. Touche une classe pour la découvrir.'
    : `Expérience totale : ${totalXp(profile)}${next ? ` · prochaine classe à ${next}` : ''}`;
  return `<div class="ecran ecran-classes">
    <div class="tete-talents">
      <h2>${first ? 'Choisis ta classe' : 'Les classes'}</h2>
      <span class="points-talent">${sub}</span>
      <button type="button" class="bouton" data-action="titre">Retour</button>
    </div>
    <div class="corps-classes">
      <div class="grille-classes">${cards}</div>
      <aside class="fiche-classe-detail" style="--couleur:${c.color}">
        <div class="portrait-classe ${st === 'bientot' || st === 'verrouillee' ? 'silhouette' : ''}">${sprite(c)}</div>
        <div class="nom-classe"><b>${c.name}</b><span class="etoiles">${'★'.repeat(c.difficulty)}<i>${'★'.repeat(3 - c.difficulty)}</i></span><em>Difficulté ${DIFFICULTY_WORD[c.difficulty]}</em></div>
        <q>${c.quote}</q>
        <div class="infos-classe">
          <img class="px" src="${A('icone_epee.png')}" alt=""><span>${c.role}</span>
          <img class="px" src="${A('icone_pouvoir.png')}" alt=""><span>${c.resource}</span>
          <img class="px" src="${A('icone_sang.png')}" alt=""><span>${c.hp} PV</span>
        </div>
        <p>${c.fantasy}</p>
        <div class="bas-fiche">${note ? `<p class="note">${note}</p>` : ''}${button}</div>
      </aside>
    </div>
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

/** Les trois sortes de talents : la forme de l'icône change (rond, carré, grand cadre violet). */
type TalentKind = 'passif' | 'sort' | 'epique';
const TALENT_KIND_LABEL: Record<TalentKind, string> = { passif: 'Passif', sort: 'Sort de barre', epique: 'Carte épique' };
const talentKind = (d: { card?: string; spell?: string }): TalentKind => (d.card ? 'epique' : d.spell ? 'sort' : 'passif');

/** L'écran des talents : 3 arbres de 5 paliers en icônes ; la fiche du talent touché s'affiche à droite. */
function talentScreen(): string {
  const profile = loadProfile();
  const cls = activeClass(profile);
  const points = classLevel(profile, cls).level;
  const alloc = myAlloc();
  const left = points - pointsUsed(alloc);
  const trees = treesFor(cls);
  const sel = ui.talentSel && trees.some((tr) => tr.id === ui.talentSel!.tree) ? ui.talentSel : null;
  const cols = trees.map((tree) => {
    const picks = alloc[tree.id] ?? [];
    const tiers = tree.tiers.map((options, tier) => {
      const nodes = options.map((d, i) => {
        const choice: Choice = i === 0 ? 'A' : 'B';
        const state = picks[tier] === choice ? 'pris' : tier < picks.length ? 'ecarte' : tier === picks.length ? (left > 0 ? 'dispo' : '') : 'ferme';
        const chosen = sel?.tree === tree.id && sel.tier === tier && sel.choice === choice;
        return `<button type="button" class="noeud-talent k-${talentKind(d)} ${state} ${chosen ? 'choisi' : ''}" data-action="talent-voir" data-tree="${tree.id}" data-tier="${tier}" data-choice="${choice}">
          <span class="icone-talent"><img class="px" src="${A(talentIcon(d))}" alt=""></span><span class="nom-talent">${d.name}</span></button>`;
      }).join('');
      return `<div class="palier-icones">${tier ? `<span class="lien-palier ${tier <= picks.length ? 'ouvert' : ''}"></span>` : ''}${nodes}</div>`;
    }).join('');
    return `<section class="arbre-icones"><h3>${tree.name} <span>${picks.length}/5</span></h3>${tiers}</section>`;
  }).join('');
  return `<div class="ecran ecran-talents">
    <div class="tete-talents">
      <h2>Talents du ${classInfo(cls).name}</h2>
      <span class="points-talent">${left > 0 ? `● ${left} point${left > 1 ? 's' : ''} à placer` : 'Tous tes points sont placés'} · ${points} au total</span>
      <button type="button" class="bouton" data-action="talents-reset" ${pointsUsed(alloc) ? '' : 'disabled'}>Tout retirer</button>
      <button type="button" class="bouton" data-action="titre">Retour</button>
    </div>
    <div class="corps-talents"><div class="arbres-icones">${cols}</div>${talentCard(cls, alloc, left, sel)}</div>
  </div>`;
}

/** Le rappel des cartes et des sorts dont parle un talent (ex. Lame aiguisée → Frappe et Frappe héroïque). */
function talentRefs(id: string): string {
  const refs = TALENT_REFS[id];
  if (!refs) return '';
  const cards = (refs.cards ?? []).map((c) => cardHtml({ uid: 0, id: c, upgraded: false })).join('');
  const spells = (refs.spells ?? []).map(spellHtml).join('');
  return `<div class="rappel-talent"><span class="titre-rappel">Rappel</span>${cards ? `<div class="cartes-rappel">${cards}</div>` : ''}${spells}</div>`;
}

/** La fiche d'un talent : ce qu'il fait, et le bouton qui le prend (c'est la confirmation). */
function talentCard(cls: string, alloc: TalentAlloc, left: number, sel: { tree: TreeId; tier: number; choice: Choice } | null): string {
  if (!sel) {
    return `<aside class="fiche-talent vide">
      <b class="titre-fiche">Touche un talent</b>
      <p>pour voir ce qu'il fait, puis le prendre.</p>
      <div class="legende-talents">
        <span><i class="forme k-passif"></i>Passif</span><span><i class="forme k-sort"></i>Sort de barre</span><span><i class="forme k-epique"></i>Carte épique</span>
      </div>
      <ul>
        <li>1 point par niveau de classe.</li>
        <li>Un seul talent par palier.</li>
        <li>Un talent dans un palier ouvre le suivant.</li>
        <li>Changer ses talents est gratuit entre deux expéditions.</li>
      </ul>
    </aside>`;
  }
  const tree = treesFor(cls).find((tr) => tr.id === sel.tree)!;
  const picks = alloc[tree.id] ?? [];
  const i = sel.choice === 'A' ? 0 : 1;
  const d = tree.tiers[sel.tier][i];
  const other = tree.tiers[sel.tier][1 - i];
  const kind = talentKind(d);
  const chips = [`<span class="type-talent k-${kind}">${TALENT_KIND_LABEL[kind]}</span>`, `<span class="type-talent">${tree.name} · palier ${sel.tier + 1}</span>`];
  let body: string;
  if (d.card) {
    const c = CARDS[d.card];
    chips.push(`<span class="type-talent">${c.type} · ${c.cost} énergie${c.rageCost ? ` + ${c.rageCost === 'all' ? 'toute ta' : c.rageCost} rage` : ''}</span>`);
    body = `<p>${c.text(false)}</p><p class="ameliore">Améliorée : ${c.text(true)}</p><p class="note">Un exemplaire dans ton deck de départ.</p>`;
  } else if (d.spell) {
    // « Ajoute ce sort à ta barre (…) : effet » : le type est déjà dans l'étiquette, on garde l'effet.
    const m = /^Ajoute ce sort à ta barre(?: \(([^)]*)\))? : (.*)$/.exec(d.text);
    const spell = SPELLS[d.spell];
    if (spell) chips.push(`<span class="type-talent">${spell.cost ? `${spell.cost} énergie` : 'Gratuit'} · recharge ${spell.cooldown} tour${spell.cooldown > 1 ? 's' : ''}</span>`);
    body = m ? `<p>${m[2][0].toUpperCase()}${m[2].slice(1)}</p>${m[1] && !/énergie/.test(m[1]) ? `<p class="note">${m[1][0].toUpperCase()}${m[1].slice(1)}.</p>` : ''}` : `<p>${d.text}</p>`;
  } else {
    body = `<p>${d.text}</p>`;
  }
  const taken = picks[sel.tier] === sel.choice;
  let button: string;
  let note = '';
  const act = `data-action="talent" data-tree="${tree.id}" data-tier="${sel.tier}" data-choice="${sel.choice}"`;
  if (taken && sel.tier === picks.length - 1) {
    button = `<button type="button" class="gros-bouton secondaire" ${act}>Retirer ce talent</button>`;
    note = 'Tu récupères 1 point.';
  } else if (taken) {
    button = '<button type="button" class="gros-bouton" disabled>Talent pris</button>';
    note = `Pour le retirer, retire d'abord les paliers suivants de ${tree.name}.`;
  } else if (sel.tier < picks.length) {
    button = `<button type="button" class="gros-bouton" ${act}>Prendre à la place</button>`;
    note = `Remplace <b>${other.name}</b>, sans coûter de point.`;
  } else if (sel.tier === picks.length && left > 0) {
    button = `<button type="button" class="gros-bouton" ${act}>Prendre · 1 point</button>`;
    note = other ? `Un seul talent par palier : l'autre choix est <b>${other.name}</b>.` : '';
  } else if (sel.tier === picks.length) {
    button = '<button type="button" class="gros-bouton" disabled>Plus de point à placer</button>';
    note = 'Tu gagnes 1 point par niveau de classe.';
  } else {
    button = '<button type="button" class="gros-bouton" disabled>Palier fermé</button>';
    note = `Prends d'abord un talent du palier ${picks.length + 1} de ${tree.name}.`;
  }
  return `<aside class="fiche-talent">
    <button type="button" class="fermer-fiche" data-action="talent-fermer" aria-label="Fermer">✕</button>
    <div class="haut-fiche"><span class="icone-talent grande k-${kind} ${taken ? 'pris' : ''}"><img class="px" src="${A(talentIcon(d))}" alt=""></span>
      <div><b class="titre-fiche">${d.name}</b><div class="etiquettes">${chips.join('')}</div></div></div>
    <div class="texte-fiche">${body}</div>
    ${talentRefs(d.id)}
    <div class="bas-fiche">${note ? `<p class="note">${note}</p>` : ''}${button}</div>
  </aside>`;
}

function endScreen(run: RunState, victory: boolean): string {
  if (victory && !run.chestDone) {
    return `<div class="ecran" style="gap:14px">
      <h1>Vhaeryx est vaincu !</h1>
      ${chestPanel(run)}
    </div>`;
  }
  return `<div class="ecran" style="gap:14px">
    <h1>${victory ? 'Vhaeryx est vaincu !' : 'Fin de la run'}</h1>
    <p>${victory ? `Bravo : tu as traversé les Profondeurs Ardentes et l'Aire de Vhaeryx avec ${run.hp} PV et ${(run.maxWipes ?? MAX_WIPES) - run.wipesLeft} wipe${(run.maxWipes ?? MAX_WIPES) - run.wipesLeft > 1 ? 's' : ''}${run.difficulty ? `, en difficulté ${run.difficulty}` : ''}.` : `${actDef(run.act).name} ${run.act === 1 ? 'ont' : 'a'} eu raison de toi. La guilde enverra un autre champion.`}</p>
    ${run.summary ? summaryHtml(run.summary, run.classId) : ''}
    ${victory ? chestPanel(run) : run.heirloom ? `<p class="mention-brise">${ITEMS[run.heirloom].name}, emporté du coffre de la guilde, est perdu.</p>` : ''}
    <div class="actions"><button type="button" class="gros-bouton" data-action="titre">Retour au hall de la guilde</button></div>
  </div>`;
}

function overlayHtml(run: RunState | null): string {
  if (ui.overlay === 'test') return devPanelHtml(run); // Outil de test
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
  if (ui.overlay === 'equipement') return equipmentOverlay(run);
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
        ${isDevBuild() ? '<button type="button" class="gros-bouton secondaire bouton-test" data-action="test">🛠 Outil de test</button>' : ''}
      </div>
    </div></div>`;
  }
  return '';
}

// ---------- Outil de test (version dev seulement, à retirer avant la version 1.0) ----------

/** La version de test (/dev/) ou le jeu lancé en local : jamais la version officielle. */
function isDevBuild(): boolean {
  return location.pathname.includes('/dev/') || location.hostname === 'localhost' || location.hostname === '127.0.0.1';
}

function devPanelHtml(run: RunState | null): string {
  const profile = loadProfile();
  const playable = CLASSES.filter((c) => c.playable);
  const cls = ui.devClass ?? activeClass(profile);
  const lvl = classLevel(profile, cls).level;
  const classes = playable.map((c) => `<button type="button" class="${c.id === cls ? 'actif' : ''}" data-action="test-classe" data-id="${c.id}" style="--couleur:${c.color}">${c.name}</button>`).join('');
  const levels = Array.from({ length: MAX_LEVEL }, (_, i) => `<button type="button" class="${i + 1 === lvl ? 'actif' : ''}" data-action="test-niveau" data-niveau="${i + 1}">${i + 1}</button>`).join('');
  const inRun = run && run.screen !== 'victory' && run.screen !== 'gameover';
  const runPart = inRun ? `<div class="test-bloc">
      <span class="butin-titre">Expédition en cours · acte ${run.act}</span>
      <div class="test-boutons">
        <button type="button" class="bouton" data-action="test-or">+500 or</button>
        <button type="button" class="bouton" data-action="test-pv">PV au maximum</button>
        ${run.screen === 'combat' && run.combat?.phase === 'player' ? '<button type="button" class="bouton" data-action="test-gagner">Gagner le combat</button>' : ''}
        ${run.act < 2 && run.screen !== 'combat' ? '<button type="button" class="bouton" data-action="test-acte">Passer à l\'acte 2</button>' : ''}
      </div>
    </div>` : '';
  return `<div class="overlay"><div class="ecran panneau-test">
    <h2>🛠 Outil de test</h2>
    <p>Visible seulement sur la version de test. Il sera retiré avant la version 1.0.</p>
    <div class="test-bloc">
      <span class="butin-titre">Classe</span>
      <div class="choix-classe-hall">${classes}</div>
      <span class="butin-titre">Niveau de ${classInfo(cls).name} : ${lvl}</span>
      <div class="test-niveaux">${levels}</div>
      <div class="test-boutons">
        <button type="button" class="bouton" data-action="test-difficultes">Débloquer toutes les difficultés (${classInfo(cls).name})</button>
        <button type="button" class="bouton" data-action="test-reset-classe">Remettre ${classInfo(cls).name} à zéro</button>
      </div>
    </div>
    <div class="test-bloc">
      <span class="butin-titre">Profil</span>
      <div class="test-boutons">
        <button type="button" class="bouton" data-action="test-classes">Débloquer toutes les classes jouables</button>
        <button type="button" class="bouton danger" data-action="test-reset-tout">Tout remettre à zéro (profil et expédition)</button>
      </div>
    </div>
    ${runPart}
    <button type="button" class="gros-bouton secondaire" data-action="fermer">Fermer</button>
  </div></div>`;
}

/** Les actions du panneau de test. Renvoie true si l'action a été traitée. */
function devAction(action: string, el: HTMLElement): boolean {
  if (!action.startsWith('test')) return false;
  const profile = loadProfile();
  const cls = ui.devClass ?? activeClass(profile);
  const run = ui.run;
  switch (action) {
    case 'test': ui.overlay = 'test'; break;
    case 'test-classe': ui.devClass = el.dataset.id; break;
    case 'test-niveau': devSetLevel(profile, cls, Number(el.dataset.niveau)); saveProfile(profile); break;
    case 'test-difficultes': devUnlockDifficulties(profile, cls); saveProfile(profile); break;
    case 'test-reset-classe': devResetClass(profile, cls); saveProfile(profile); break;
    case 'test-classes': devUnlockClasses(profile); saveProfile(profile); break;
    case 'test-reset-tout':
      if (!confirm('Tout remettre à zéro : le profil (niveaux, talents, coffre, archives) et l\'expédition en cours ?')) return true;
      saveProfile(emptyProfile());
      localSave.clear();
      ui.run = null;
      ui.overlay = null;
      ui.devClass = undefined;
      break;
    case 'test-or': if (run) devGold(run); break;
    case 'test-pv': if (run) devHeal(run); break;
    case 'test-gagner':
      if (run && devWinCombat(run)) {
        ui.overlay = null;
        void commit();
        return true;
      }
      break;
    case 'test-acte': if (run && devNextAct(run)) ui.overlay = null; break;
    default: return false;
  }
  if (ui.run) localSave.save(ui.run);
  render();
  return true;
}

// ---------- Boucle de rendu ----------

export function render(): void {
  const run = ui.run;
  if (!run) {
    stage.dataset.acte = '1';
    stage.innerHTML = ui.archivesScreen ? archivesScreen() : ui.classScreen ? classScreen() : ui.talentScreen ? talentScreen() : titleScreen() + overlayHtml(null);
    return;
  }
  stage.dataset.acte = String(run.act ?? 1);
  let html = '';
  switch (run.screen) {
    case 'act': html = actScreen(run); break;
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
  if (action && isDevBuild() && devAction(action, el)) return; // Outil de test
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
    case 'archives': ui.run = null; ui.overlay = null; ui.archivesScreen = true; ui.archiveSel = null; render(); return;
    case 'archives-onglet': ui.archiveTab = el.dataset.tab as UiState['archiveTab']; ui.archiveSel = null; render(); return;
    case 'archives-voir': ui.archiveSel = el.dataset.id ?? null; render(); return;
    case 'classes': ui.run = null; ui.overlay = null; ui.classScreen = true; ui.classSel = null; render(); return;
    case 'classe-voir': ui.classSel = el.dataset.id!; render(); return;
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
    case 'talents': ui.run = null; ui.overlay = null; ui.talentScreen = true; ui.talentSel = null; render(); return;
    case 'talent-voir': ui.talentSel = { tree: el.dataset.tree as TreeId, tier: Number(el.dataset.tier), choice: el.dataset.choice as Choice }; render(); return;
    case 'talent-fermer': ui.talentSel = null; render(); return;
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
      if (!confirm('Retirer tous tes talents ? Tu récupères tous tes points.')) return;
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
    case 'equipement': ui.overlay = 'equipement'; ui.equipSel = null; render(); return;
    case 'equip-voir': ui.equipSel = el.dataset.id ?? null; render(); return;
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
    case 'familier':
      if (run.combat && choosePet(run.combat, el.dataset.pet as 'diablotin' | 'rodeur')) commit();
      break;
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
    case 'lier-fragments':
      if (run.classId === 'demoniste') { campfireBindStaff(run); commit(); } else { ui.bindStaff = true; render(); }
      break;
    case 'lier-baton': ui.bindStaff = false; campfireBindStaff(run, Number(el.dataset.uid)); commit(); break;
    case 'acte-suivant': startNextAct(run); commit(); break;
    case 'equinoxe': campfireEquinoxe(run); commit(); break;
    case 'aurore': campfireAurore(run); commit(); break;
    case 'carte-boutique': ui.shopCard = Number(el.dataset.index); render(); break;
    case 'annuler-carte': ui.shopCard = null; render(); break;
    case 'acheter': buyCard(run, Number(el.dataset.index)); ui.shopCard = null; commit(); break;
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
    case 'partir': ui.shopMode = null; ui.shopItem = null; ui.shopPotion = null; ui.shopCard = null; leaveShop(run); commit(); break;
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
    case 'feu-retour': ui.campfireUpgrade = false; ui.upgradeUid = null; ui.bindStaff = false; render(); break;
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
  'guerrier.png', 'mage.png', 'demoniste.png', 'pretre.png', 'voleur.png', 'paladin.png', 'vendeur_gobelin.png', 'bregan.png',
  'feu_camp.png', 'icone_repos.png', 'icone_enclume.png',
  ...['diablotin', 'rodeur', 'succube', 'molosse', 'seigneur'].map((id) => `familier_${id}.png`),
  ...Object.keys(CARDS).map((id) => `carte_${id}.png`),
  ...Object.keys(ENEMIES).map((id) => `ennemi_${id}.png`), 'ennemi_vhaeryx_dragon.png',
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
