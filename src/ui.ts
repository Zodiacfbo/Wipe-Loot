// L'interface : affiche l'état de la run et transmet les actions du joueur au moteur.
import { CARDS, energyCost, rewardPool, shardCost, starterCards } from './engine/cards';
import { DOT_LABEL, MAX_SHARDS, PETS } from './engine/demoniste';
import {
  SPELLS,
  canPlayCard,
  canUseSpell,
  cardBlockReason,
  changePosture,
  changeForm,
  choosePet,
  endTurn,
  isEnraged,
  playCard,
  previewIntentDamage,
  useSpell,
} from './engine/combat';
import { ENEMIES, TUNING, intentAt, isInterruptible } from './engine/enemies';
import { AFFLICTIONS, ENEMIES_ACTE2, ELITE_ENCOUNTERS_2, GRIZZIK_POTIONS } from './engine/enemies_acte2';
import { ELITE_ENCOUNTERS_3, ENEMIES_ACTE3, IREM, YZHAR } from './engine/enemies_acte3';
import { turnsBeforeSwap } from './engine/irem';
import { MUTATION_LABEL } from './engine/actions';
import { cardHitValue } from './engine/preview';
import { DIFF_CLOSE, DIFF_OPEN, markDiff, placeHit, splitRibbon } from './cardtext';
import { afterRender, explainCard, initAides } from './aides';
import { closeMini, combatTutoDone, howToPlayHtml, miniHtml, placeTuto, startCombatTuto, startHallTuto, tutoActive, tutoFinish, tutoHtml, tutoMove, tutoStop } from './tuto';
import { cardReady } from './engine/hints';
import { GLOSSARY_EXTRA, KEYWORDS, markKeywords } from './keywords';
import { ACTS, LAST_ACT, actDef } from './engine/acts';
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
  chooseBlessing,
  campfireReforge,
  canReforge,
  canBindStaff,
  canForgeEquinoxe,
  campfireEquinoxe,
  canForgeAurore,
  campfireAurore,
  canForgeCorde,
  campfireCorde,
  campfireBindStaffDruid,
  druidOfferings,
  offerCompanion,
  chooseCompanion,
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
import { siteOf, versionLabel } from './version';
import { cloud, initCloud, logRun, markMessagesSeen, markNewsRead, messagesUnread, newsLastRead, newsUnread, refreshNews, sendMessage, shownNews, signIn, signOut, signUp } from './cloud';
import { MESSAGE_MAX, MESSAGE_STATES, MESSAGE_TYPES, PASSWORD_MIN, PSEUDO_MAX, PSEUDO_MIN, type MessageType } from './cloud_logic';
import { EPIC_TIER_COST, clampAlloc, emptyAlloc, pointsUsed, talentIds, tierCost, toggleTalent, treePoints, treesFor, type Choice, type TalentAlloc, type TreeId } from './engine/talents';
import { TALENT_REFS, talentIcon } from './engine/talent_icons';
import { freezeThreshold } from './engine/actions';
import { CLASSES, CLASS_BY_ID, bestLevel, chooseStartClass, classInfo, nextUnlockLevel, unlockClass, unlocksAvailable } from './engine/classes';
import { DIFFICULTY_TEXT } from './engine/difficulty';
import { LORE, recordKills, recordSeen } from './engine/archives';
import { COMMON_POOL } from './engine/items';
import { POTION_IDS } from './engine/potions';
import { MAX_LEVEL, awardRun, classLevel, rackLegendary, type RunSummary } from './engine/progression';
import { CHEST_SIZE, chestRoomAfterReturn, depositableSlots, heirloomSlot, settleChest, takeHeirloom } from './engine/guild';
import { emptyProfile, loadProfile, localSave, saveProfile } from './engine/save';
// Outil de test (version dev seulement)
import { DEV_IREM_FIGHTS, devFightIrem, devGold, devHeal, devNextAct, devResetClass, devSetLevel, devUnlockClasses, devUnlockDifficulties, devWinCombat } from './engine/devtools';
import { AURA_NAMES, SEAL_NAMES, SEAL_TEXT } from './engine/paladin';
import { ELEMENTS, ELEMENT_NAME, IMBUES, TOTEMS, totemDescription } from './engine/chaman';
import { FORMS, FORM_IDS, MAX_BEAR_RAGE, MAX_CAT_COMBO, canShift, shiftCost } from './engine/druide';
import { ASPECTS, COMPANIONS, COMPANION_IDS, TRAPS, companionDamage, companionTarget, markBonus, trapVictim } from './engine/chasseur';
import { BOSS_LOOT, FAMILY_LABEL, ITEMS, REPAIR_PRICE, SLOT_KEYS, SLOT_LABEL, LOOT_TABLES, itemFor, slotOf, slotsFor, uselessFx, withTwins, type Slot, type SlotKey } from './engine/items';
import { ELITE_ENCOUNTERS } from './engine/enemies';
import { initFx, playFx, transformation } from './fx';
import type { CardInstance, CombatState, CompanionId, EnemyState, FormId, Intent, Posture, RunState } from './engine/types';

const A = (file: string) => `${import.meta.env.BASE_URL}assets/${file}`;

// Sprites animés : pour ces images, une planche anim_<fichier> de N images côte à côte
// (tools/pixel/animations.py) est jouée en boucle par le CSS, comme le feu de camp.
// Tous les ennemis (ennemi_*.png) sont animés, sur 4 images (vérifié par tests/animations.test.ts).
const ANIMES: Record<string, number> = {
  'guerrier.png': 4,
  'mage.png': 4,
  'paladin.png': 4,
  'voleur.png': 4,
  'demoniste.png': 4,
  'chasseur.png': 4,
  'chaman.png': 4,
  'druide.png': 4,
  'druide_ours.png': 4,
  'druide_felin.png': 4,
  'druide_astrale.png': 4,
  'familier_loup.png': 4,
  'familier_ours.png': 4,
  'familier_raptor.png': 4,
  'familier_diablotin.png': 4,
  'familier_rodeur.png': 4,
  'familier_succube.png': 4,
  'familier_molosse.png': 4,
  'familier_seigneur.png': 4,
  'pretre.png': 4,
  'pretre_ombre.png': 4,
  'ennemi_molosse.png': 4,
  'ennemi_etincelle.png': 4,
  'ennemi_vulkhar.png': 4,
};

/** Le sprite du héros en combat : le Prêtre change de tenue en Forme d'Ombre. */
function heroSprite(sprite: string | undefined, c: CombatState): string {
  if (sprite === 'pretre.png' && c.shadowForm) return 'pretre_ombre.png';
  // Le Druide change de sprite avec sa forme.
  if (sprite === 'druide.png' && c.form && c.form !== 'normale') return `druide_${c.form}.png`;
  return sprite ?? 'guerrier.png';
}

/** Couleur du flash quand le héros change de tenue, selon la nouvelle tenue. */
const FLASH_TENUE: Record<string, string> = { 'pretre_ombre.png': '#9a5af0', 'pretre.png': '#ffe27a', 'druide.png': '#8fd49a', 'druide_ours.png': '#c8a070', 'druide_felin.png': '#e8b84a', 'druide_astrale.png': '#8fb8e8' };
let tenueHeros: string | null = null;

/** Après chaque affichage : si la tenue du héros a changé depuis le dernier, flash de transformation. */
function verifierTenue(): void {
  const el = stage.querySelector<HTMLElement>('[data-fx="player"]');
  const tenue = el?.dataset.tenue ?? null;
  if (el && tenue && tenueHeros && tenue !== tenueHeros) transformation(el, FLASH_TENUE[tenue] ?? '#ffffff');
  tenueHeros = tenue;
}

/** Le src, la classe et le style d'un sprite : la planche animée s'il y en a une, sinon l'image fixe.
 *  `decale` décale le début de la boucle, pour que deux ennemis ne respirent pas en même temps. */
function spriteAttrs(file: string, decale = 0): string {
  const n = ANIMES[file] ?? (file.startsWith('ennemi_') ? 4 : 0);
  if (!n) return `src="${A(file)}"`;
  return `src="${A(`anim_${file}`)}" data-anime style="--images:${n};--decalage:-${((decale * 0.37) % 1).toFixed(2)}"`;
}

type Selection = { kind: 'card'; index: number } | { kind: 'spell'; index: number } | null;

interface UiState {
  run: RunState | null;
  /** Chasseur : le compagnon sélectionné sur l'écran du choix (avant de partir). */
  companion?: CompanionId | null;
  selection: Selection;
  overlay: 'deck' | 'menu' | 'equipement' | 'loot' | 'potion' | 'coffre' | 'pile' | 'abandon' | 'difficultes' | 'test' | 'connexion' | 'roue' | 'saison' | 'news' | 'messages' | 'avis' | null;
  /** Fenêtre des messages : l'onglet, le type choisi, le texte tapé, le message d'erreur, l'envoi en cours. */
  /** News : le dernier numéro lu avant d'ouvrir la fenêtre (pour marquer « Nouveau »). Messages : ceux qui avaient du nouveau. */
  newsBefore?: number;
  msgFresh?: Set<string>;
  msg?: { tab: 'ecrire' | 'liste'; type: MessageType; texte: string; error: string | null; busy: boolean; sent: boolean };
  /** Fenêtre de connexion : l'onglet, le pseudo tapé, le message d'erreur, l'attente de Firebase. */
  login?: { tab: 'connexion' | 'creation'; pseudo: string; error: string | null; busy: boolean };
  /** Outil de test : la classe choisie dans le panneau. */
  devClass?: string;
  /** Objet du coffre choisi dans le hall pour la prochaine expédition (index). */
  heirloom: number | null;
  /** Le légendaire du râtelier reste à la guilde pour la prochaine expédition (il part par défaut). */
  leaveLegendary?: boolean;
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
  /** Carte touchée dans une liste où le choix est définitif (retirer, sacrifier) : on demande confirmation. */
  cardConfirm?: number | null;
  /** Écran des talents (avant une run). */
  talentScreen: boolean;
  /** Talent regardé (sa fiche s'affiche à droite). */
  talentSel: { tree: TreeId; tier: number; choice: Choice } | null;
  /** Écran des classes : choix de la classe de départ, ou consultation. */
  classScreen: boolean;
  /** Classe regardée sur l'écran des classes. */
  classSel: string | null;
  /** Premier lancement : la classe de départ dont on confirme le choix (fenêtre), ou null. */
  startConfirm?: string | null;
  /** Archives de la guilde : écran ouvert et onglet. */
  archivesScreen: boolean;
  archiveTab: 'cartes' | 'objets' | 'potions' | 'monstres' | 'mots';
  /** La vue du deck : le type de cartes montré (null : toutes) et le tri. */
  deckType?: string | null;
  deckSort?: 'deck' | 'cout' | 'nom';
  /** Archives : l'icône regardée (sa fiche s'affiche à droite). */
  archiveSel?: string | null;
  /** Coffre détaillé et tables de loot : l'objet regardé. */
  itemSel?: string | null;
  /** Équipement : la case regardée (emplacement d'objet, ou « sort-<index> » pour la barre de sorts). */
  equipSel?: string | null;
  /** Carte dont on regarde l'amélioration avant de la confirmer. */
  upgradeUid: number | null;
  /** Objet choisi pour le dépôt, quand le coffre est plein (on choisit ensuite quoi remplacer). */
  depositSlot: SlotKey | null;
}

const ui: UiState = { run: null, selection: null, overlay: null, campfireUpgrade: false, shopMode: null, shopItem: null, potionSlot: null, shopPotion: null, depositSlot: null, blessingRemove: false, talentScreen: false, talentSel: null, classScreen: false, classSel: null, upgradeUid: null, pileKind: 'draw', heirloom: null, archivesScreen: false, archiveTab: 'monstres' };
let stage: HTMLElement;
/** Un texte écrit par un joueur, sans risque d'injecter du HTML. */
const esc = (t: string) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
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

/**
 * Le texte d'une carte : mots-clés soulignés (infobulles) et, en combat, le chiffre de dégâts corrigé
 * (Puissance, posture, objets, cible…), en vert s'il monte et en rouge s'il baisse.
 */
function cardText(text: string, hit: number | null | undefined): string {
  const place = placeHit(text, hit);
  if (!place) return markKeywords(text);
  const cls = hit! > place.base ? 'plus' : hit! < place.base ? 'moins' : '';
  return `${markKeywords(place.before)}<span class="valeur ${cls}">${hit}</span>${markKeywords(place.after)}`;
}

/** Le texte amélioré, avec ce qui change en vert (aperçu de l'amélioration). */
function diffText(base: string, up: string): string {
  return markKeywords(markDiff(base, up))
    .split(DIFF_OPEN).join('<span class="valeur plus">')
    .split(DIFF_CLOSE).join('</span>');
}

function cardHtml(real: CardInstance, opts: { action?: string; disabled?: boolean; selected?: boolean; combat?: CombatState | null; panicked?: boolean; hit?: number | null; disguise?: boolean; reason?: string | null; ready?: boolean; diffFrom?: string } = {}): string {
  // Acte 3 : dans la main, une Hallucination a l'apparence de la carte qu'elle imite (cadre violacé, texte qui tremble).
  const fake = !!opts.disguise && real.id === 'hallucination' && !!real.mimic && !!CARDS[real.mimic];
  const card = fake ? { ...real, id: real.mimic! } : real;
  const def = CARDS[card.id];
  const frame = `cadre_${RARITY_FRAME[def.rarity]}${def.rageCost !== undefined ? '_rage' : ''}.png`;
  const cost = opts.combat ? energyCost(opts.combat, card.id, card.upgraded) : card.upgraded && def.costUp !== undefined ? def.costUp : def.cost;
  const reduced = cost < def.cost;
  const rage = def.rageCost === 'all' ? 'X' : def.rageCost ?? '';
  const gear = opts.combat?.gear ?? (ui.run ? runGear(ui.run) : undefined);
  // « Finisher : », « Sceau : », « Aura : »… : le mot passe dans le bandeau, le texte commence par l'effet (place sur téléphone).
  const fullText = def.text(card.upgraded, gear);
  const { ribbon, text } = splitRibbon(fullText);
  const classes = ['carte', opts.disabled ? 'injouable' : '', opts.selected ? 'choisie' : '', opts.panicked ? 'paniquee' : '', fake ? 'hallucination' : '', opts.ready && !opts.disabled ? 'prete' : ''].join(' ');
  return `<button type="button" class="${classes}" ${opts.action ?? ''} ${opts.disabled && opts.reason ? `data-raison="${opts.reason.replace(/"/g, '&quot;')}"` : ''} aria-label="${def.name}${card.upgraded ? ' améliorée' : ''}, coût ${cost}. ${fullText}">
    <img class="cadre px" src="${A(frame)}" alt="">
    <img class="icone px" src="${A(`carte_${card.id}.png`)}" alt="">
    <span class="cout ${reduced ? 'reduit' : cost > def.cost ? 'augmente' : ''}">${def.unplayable ? '–' : cost}</span>
    ${opts.panicked ? '<span class="tampon-panique">Paniquée</span>' : ''}
    ${fake && opts.combat?.gear?.seeHallucinations ? '<span class="tampon-panique tampon-hallucination">Hallucination</span>' : ''}
    ${rage !== '' ? `<span class="cout-rage">${rage}</span>` : ''}
    ${def.faithCost !== undefined ? `<span class="cout-rage cout-foi" title="Foi">${def.faithCost === 'all' ? 'X' : def.faithCost}</span>` : ''}
    ${def.shardCost !== undefined && shardCost(opts.combat ?? null, card.id, card.upgraded) !== 0 ? `<span class="cout-rage cout-eclat" title="Éclats d'âme">${shardCost(opts.combat ?? null, card.id, card.upgraded) === 'all' ? 'X' : shardCost(opts.combat ?? null, card.id, card.upgraded)}</span>` : ''}
    <span class="titre ${card.upgraded ? 'ameliore' : ''} ${def.name.length + (card.upgraded ? 1 : 0) > 14 ? 'long' : ''}">${def.name}${card.upgraded ? '+' : ''}</span>
    <span class="type" ${ribbon ? `data-type="${def.type}"` : ''}>${ribbon ?? `${def.type}${def.school ? ` · ${SCHOOL_LABEL[def.school]}` : ''}`}</span>
    <span class="texte ${text.length > 56 ? 'tres-long' : text.length > 42 ? 'long' : ''}"><span>${opts.diffFrom !== undefined ? diffText(opts.diffFrom, text) : cardText(text, opts.hit)}</span></span>
  </button>`;
}

/** La fenêtre de confirmation d'un choix de carte définitif (retirer, sacrifier) : la carte en grand, le bouton et « Retour ». */
function cardConfirmWindow(run: RunState, verb: string, button: string, action: string, note: string): string {
  const card = ui.cardConfirm != null ? run.deck.find((k) => k.uid === ui.cardConfirm) : undefined;
  if (!card) return '';
  const def = CARDS[card.id];
  const name = `${def.name}${card.upgraded ? '+' : ''}`;
  const copies = run.deck.filter((k) => k.id === card.id && k.upgraded === card.upgraded).length;
  const tag = (text: string) => `<span class="type-talent">${text}</span>`;
  return `<div class="fenetre-boutique"><aside class="fiche-talent fiche-boutique">
    <div class="titre-fiche">${verb} ${name} ?</div>
    <div class="etiquettes">${tag(def.type)}${tag(CARD_RARITY_LABEL[def.rarity] ?? def.rarity)}${copies > 1 ? tag(`×${copies} dans ton paquet`) : ''}</div>
    <div class="cartes-rappel">${cardHtml(card, { action: 'disabled' })}</div>
    <p class="note">${note}</p>
    <div class="boutons-fiche"><button type="button" class="gros-bouton" data-action="${action}" data-uid="${card.uid}">${button}</button><button type="button" class="gros-bouton secondaire" data-action="annuler-confirmation">Retour</button></div>
  </aside></div>`;
}

/** Un deck affiché en regroupant les cartes identiques (même carte, même amélioration) : une seule carte, avec « ×N ».
 * Les copies sont interchangeables : choisir la carte du groupe choisit la première copie. */
function deckList(deck: CardInstance[], render: (card: CardInstance) => string): string {
  const groups = new Map<string, { card: CardInstance; count: number }>();
  for (const card of deck) {
    const key = `${card.id}${card.upgraded ? '+' : ''}`;
    const g = groups.get(key);
    if (g) g.count++;
    else groups.set(key, { card, count: 1 });
  }
  return [...groups.values()].map(({ card, count }) => count > 1
    ? `<div class="groupe-cartes">${render(card)}<span class="nombre-cartes">×${count}</span></div>`
    : render(card)).join('');
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
  return `<div class="objet ${it.rarity} ${broken ? 'brise' : ''}"><span class="objet-icone">${SLOT_ICON[it.slot]}</span><div><b>${it.name}</b><em>${it.family ? FAMILY_LABEL[it.family] : it.slot === 'arme' && it.rarity !== 'legendaire' ? 'Arme (trophée)' : SLOT_LABEL[slotsFor(id)[0]]} · ${it.rarity === 'commun' ? 'commun' : it.rarity === 'rare' ? 'rare' : it.rarity === 'epique' ? 'épique' : 'légendaire'}${broken ? ' · <strong class="mention-brise">brisé</strong>' : ''}</em><span>${broken ? `Effet désactivé jusqu'à la réparation (${REPAIR_PRICE[it.rarity]} or chez le vendeur gobelin). ` : ''}${it.text}</span>${note}</div>${extra}</div>`;
}

const RARITY_LABEL: Record<string, string> = { commun: 'commun', rare: 'rare', epique: 'épique', legendaire: 'légendaire' };

/** La remarque « sans effet pour ta classe » d'un objet (vide si tout lui sert). */
function uselessNote(id: string): string {
  const cls = ui.run?.classId ?? activeClass();
  const name = classInfo(cls).name;
  const useless = uselessFx(id, cls);
  if (useless.length === 0) return '';
  if (useless.length === Object.keys(ITEMS[id].fx).length) return `Sans effet pour le ${name}.`;
  // On nomme ce qui ne sert pas (avant, la phrase disait toujours « aux Attaques » ou « aux Sorts », parfois à tort).
  const labels = [...new Set(useless.map((k) => USELESS_LABEL[k] ?? 'Une partie de l\'effet'))];
  return `${labels.join(' et ')} ne ${labels.length > 1 ? 'servent' : 'sert'} pas au ${name}.`;
}

/** Le nom d'un effet d'objet propre à certaines classes, pour dire qu'il ne sert pas. */
const USELESS_LABEL: Partial<Record<string, string>> = {
  attackBonus: 'Le bonus aux Attaques', lowHpBonus: 'Le bonus aux Attaques', firstAttackBonus: 'Le bonus aux Attaques', heavyAttackBonus: 'Le bonus aux Attaques',
  spellBonus: 'Le bonus aux Sorts', firstSpellTwice: 'Le bonus aux Sorts', firstSpellFree: 'Le bonus aux Sorts',
  burnBonus: 'Le bonus aux Brûlures', startCharges: 'Les charges arcaniques', fireballBonus: 'Le bonus à Boule de feu',
  startRage: 'La rage', rageOnHpLoss: 'La rage', maxRage: 'La rage', turnRage: 'La rage', executeAlways: 'Le bonus à Exécution',
  bleedFirstAttack: 'Le Saignement', bleedBonus: 'Le Saignement', attackBurn: 'La Brûlure des Attaques', healOnAttack: 'Le soin des Attaques',
  healBonus: 'Le bonus aux soins', allyBonus: 'Le bonus aux alliés', dotDuration: 'Le bonus aux DoT',
};

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
      <div class="poupee-grille">${slots}<img class="px poupee-heros" ${spriteAttrs(hero.sprite ?? 'guerrier.png')} alt="Le ${hero.name}"></div>
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
        <div class="texte-fiche"><p>Un sort de barre de ta classe peut tomber des gardiens : il se range ici.</p></div>${close}</aside>`;
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
      <div class="texte-fiche"><p>${what} On trouve des objets chez les gardiens, dans les coffres et chez le vendeur gobelin.</p></div>${close}</aside>`;
  }
  const it = ITEMS[id];
  const broken = run.broken.includes(key);
  const note = uselessNote(id);
  return `<aside class="fiche-talent fiche-equipement ${broken ? 'brisee' : ''}"><div class="haut-fiche"><span class="case-equipement ${it.rarity}${broken ? ' brise' : ''} grande">${icon}</span><div><div class="titre-fiche">${it.name}</div>
    <div class="etiquettes"><span class="type-talent">${SLOT_LABEL[key]}</span><span class="type-talent r-${it.rarity}">${RARITY_LABEL[it.rarity]}</span>${broken ? '<span class="type-talent k-brise">brisé</span>' : ''}</div></div></div>
    <div class="texte-fiche"><p>${it.text}</p>${broken ? `<p class="alerte-brise">Effet désactivé jusqu'à la réparation : ${REPAIR_PRICE[it.rarity]} or chez le vendeur gobelin.</p>` : ''}${note ? `<p class="note">${note}</p>` : ''}</div>${close}</aside>`;
}

/** Une fenêtre « grille d'objets + fiche à droite » (coffre détaillé, tables de loot), comme les archives. */
function itemGridOverlay(title: string, intro: string, groups: { title: string; entries: { key: string; id: string; seen: boolean }[]; spell?: boolean }[]): string {
  const sel = groups.flatMap((g) => g.entries).find((e) => e.key === ui.itemSel);
  const body = groups.map((g) => `<section class="groupe-archives"><h3>${g.title}</h3><div class="tuiles-archives">${g.entries.map((e) => {
    const it = ITEMS[e.id];
    return `<button type="button" class="tuile-archive ${it.rarity} ${e.seen ? '' : 'inconnue'} ${ui.itemSel === e.key ? 'choisie' : ''}" data-action="objet-voir" data-id="${e.key}" aria-label="${e.seen ? it.name : 'Pas encore découvert'}">${SLOT_ICON[it.slot]}${e.seen ? '' : '<span class="compteur-archive">?</span>'}</button>`;
  }).join('')}${g.spell ? `<button type="button" class="tuile-archive case-sort ${ui.itemSel === `sort|${g.title}` ? 'choisie' : ''}" data-action="objet-voir" data-id="sort|${g.title}" aria-label="Sort de barre">${ICON.charge}</button>` : ''}</div></section>`).join('') || '<p><i>Rien pour l\'instant.</i></p>';
  let sheet = `<aside class="fiche-talent vide"><p>${intro}</p><p>Touche une icône pour voir sa fiche.</p></aside>`;
  if (ui.itemSel?.startsWith('sort|')) {
    sheet = `<aside class="fiche-talent"><div class="haut-fiche"><span class="tuile-archive case-sort grande">${ICON.charge}</span><div class="titre-fiche">Sort de barre</div></div><div class="texte-fiche"><p>Un sort de barre de ta classe que tu n'as pas encore. Il tombe une fois sur cinq environ.</p></div></aside>`;
  } else if (sel) {
    const it = ITEMS[sel.id];
    const tags = `<span class="type-talent">${SLOT_LABEL[slotsFor(sel.id)[0]]}</span><span class="type-talent r-${it.rarity}">${RARITY_LABEL[it.rarity]}</span>`;
    const note = sel.seen ? uselessNote(sel.id) : '';
    sheet = `<aside class="fiche-talent"><div class="haut-fiche"><span class="tuile-archive grande ${it.rarity} ${sel.seen ? '' : 'inconnue'}">${SLOT_ICON[it.slot]}</span><div><div class="titre-fiche">${sel.seen ? it.name : '???'}</div><div class="etiquettes">${tags}</div></div></div>
      <div class="texte-fiche">${sel.seen ? `<p>${it.text}</p>${note ? `<p class="note">${note}</p>` : ''}` : '<p class="note">Pas encore découvert.</p>'}</div></aside>`;
  }
  return `<div class="overlay"><div class="ecran ecran-archives">
    <div class="archives-gauche"><div class="tete-talents"><h2>${title}</h2></div><div class="contenu-archives">${body}</div></div>
    <div class="archives-droite">${sheet}<button type="button" class="gros-bouton secondaire" data-action="fermer">Fermer</button></div>
  </div></div>`;
}

/** Les boutons pour équiper un objet : un par emplacement possible, plus « Laisser ». */
function equipChoices(run: RunState, id: string, action: string, leave: string): string {
  const buttons = slotsFor(id).map((k) => {
    const current = run.equipment[k];
    const label = current ? `Remplacer : ${ITEMS[current].name}${run.broken.includes(k) ? ' (brisé)' : ''}` : `Équiper (${SLOT_LABEL[k].toLowerCase()} libre)`;
    return `<button type="button" class="bouton-objet" ${action} data-slot="${k}">${label}</button>`;
  }).join('');
  // L'effet des objets qui seraient remplacés, pour comparer.
  const worn = slotsFor(id).map((k) => run.equipment[k]).filter((x, i, a): x is string => !!x && a.indexOf(x) === i);
  const compare = worn.length ? `<p class="comparaison">${worn.map((w) => `Tu portes <b>${ITEMS[w].name}</b> : ${ITEMS[w].text}`).join('<br>')}</p>` : '';
  return `<div class="choix-objet">${buttons}${leave}</div>${compare}`;
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
      <span class="etape">${chapitre(run.act)} · ${actDef(run.act).name} · ${etageLabel(run)}</span>
      <span class="pips">${run.difficulty ? `<b class="badge-difficulte">Difficulté ${run.difficulty}</b>` : ''}Relèves ${pips} <span>${run.wipesLeft} restante${run.wipesLeft > 1 ? 's' : ''}</span></span>
    </div>
    <div class="groupe">
      ${fullscreenButton('bouton')}
      <button type="button" class="bouton" data-action="equipement">Équipement · ${SLOT_KEYS.filter((k) => run.equipment[k]).length}/6${run.broken.length > 0 ? ` <span class="mention-brise">· ${run.broken.length} brisé${run.broken.length > 1 ? 's' : ''}</span>` : ''}</button>
      <button type="button" class="bouton" data-action="deck">Paquet · ${run.deck.length}</button>
      ${run.screen === 'combat' ? `<button type="button" class="bouton tuto-bouton ${combatTutoDone(loadProfile(), run.classId) ? '' : 'brille'}" data-action="tuto" aria-label="Tutoriel du combat" title="Tutoriel du combat">?</button>` : ''}
      <button type="button" class="bouton" data-action="menu">Menu</button>
    </div>
  </div>`;
}

function etageLabel(run: RunState): string {
  const node = currentNode(run);
  if (!node) return 'Entrée';
  const where = run.screen === 'combat' && run.encounter ? ` · ${run.encounter.name}` : '';
  return `Étape ${node.floor + 1}/${FLOORS}${where}`;
}

// ---------- Carte de l'acte ----------

const ROMAINS = ['', 'I', 'II', 'III', 'IV', 'V'];
/** « Chapitre II » : un acte, dans le vocabulaire du jeu (issue #8). */
function chapitre(act: number): string {
  return `Chapitre ${ROMAINS[act] ?? act}`;
}

const NODE_LABEL: Record<NodeType, string> = {
  combat: 'Combat', elite: 'Gardien', event: '?', shop: 'Vendeur', campfire: 'Feu de camp', chest: 'Coffre', boss: 'Seigneur',
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
  if (run.sourcesQuest === 'active') lines.push('<b>Gardiens des Sources</b> : bats le prochain gardien, il portera la rune.');
  if (run.sourcesQuest === 'rune') lines.push('<b>Gardiens des Sources</b> : bats le gardien qui porte la rune.');
  if (run.sourcesQuest === 'done') lines.push('<b>Eau des profondeurs</b> : Vulkhar commencera affaibli.');
  if (run.veilleur === 'fragment') lines.push(run.act >= 2 ? '<b>Bâton du Veilleur</b> : trouve l\'observatoire en ruine (un « ? » du chapitre II).' : '<b>Bâton du Veilleur</b> : garde le Fragment. L\'esprit du Veilleur t\'attend au chapitre II.');
  if (run.equinoxe === 'baton') lines.push(run.act >= 2 ? '<b>Équinoxe</b> : bats Ysolde la Rouge (gardien du chapitre II) pour sa Larme.' : '<b>Équinoxe</b> : garde le Bâton nu. La pierre qu\'il lui faut est gardée par Ysolde la Rouge, au chapitre II.');
  if (run.sillon === 'gauche' || run.sillon === 'droit') lines.push(run.act > 1 ? '<b>Sillon d\'orage</b> : il te manquait un fermoir. La quête ne pourra pas être terminée cette fois.' : `<b>Sillon d'orage</b> : bats ${run.sillon === 'gauche' ? 'le Baron Vossk' : 'Gorlok le Fragmenté'} (gardien) pour le second fermoir.`);
  if (run.sillon === 'deux') lines.push(run.act >= 2 ? '<b>Sillon d\'orage</b> : Ventor t\'attend derrière un « ? » de ce chapitre.' : '<b>Sillon d\'orage</b> : les deux fermoirs sont réunis. Ventor t\'attendra derrière un « ? » du chapitre II.');
  if (run.aurore === 'lame') lines.push(run.act >= 3 ? '<b>L\'Aurore ardente</b> : les Veilleurs de l\'Aurore campent derrière un « ? » de ce chapitre. Ils peuvent bénir la Lame ternie.' : '<b>L\'Aurore ardente</b> : bats Ossyrax, le Drake ressuscité (gardien du chapitre II), pour purifier la Lame ternie. Sinon, les Veilleurs de l\'Aurore t\'attendront au chapitre III.');
  if (run.aurore === 'benie') lines.push('<b>L\'Aurore ardente</b> : la lame est bénie. Bats un gardien d\'Irem : elle s\'embrasera.');
  if (run.aurore === 'purifiee') lines.push('<b>L\'Aurore ardente</b> : rallume la lame au prochain feu de camp.');
  if (run.equinoxe === 'larme') lines.push('<b>Équinoxe</b> : accomplis le Rituel de l\'équinoxe au prochain feu de camp.');
  if (run.veilleur === 'tete') lines.push('<b>Bâton du Veilleur</b> : lie les fragments au prochain feu de camp (une carte rare à sacrifier).');
  if (run.eggsLeft && run.act === 2) lines.push('<b>Les œufs de dragon</b> : Vhaeryx aura un add de plus à chaque vague.');
  if ((run.stargazing ?? 0) > 0) lines.push(`<b>Les étoiles</b> : tu vois les intentions suivantes pendant ${run.stargazing} combat${run.stargazing > 1 ? 's' : ''}.`);
  if (run.brisemonts === 'lame' && run.act > 1) lines.push('<b>Brisemonts</b> : Krâgg n\'a pas été vaincu. La quête ne pourra pas être terminée cette fois.');
  else if (run.brisemonts === 'lame') lines.push(run.map.nodes.some((n) => n.type === 'elite' && n.elite === KRAGG_INDEX)
    ? '<b>Brisemonts</b> : bats Krâgg le Mange-roche pour obtenir le Cœur de la montagne.'
    : '<b>Brisemonts</b> : Krâgg n\'est pas sur cette carte. La quête ne pourra pas être terminée cette fois.');
  if (run.brisemonts === 'coeur') lines.push(run.act >= LEGENDARY_MIN_ACT ? '<b>Brisemonts</b> : reforge l\'épée au prochain feu de camp.' : `<b>Brisemonts</b> : garde la Lame et le Cœur. Tu pourras reforger l'épée à un feu de camp du ${chapitre(LEGENDARY_MIN_ACT).toLowerCase()}.`);
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
    // L'indice des Veilleurs de l'Aurore : ce « ? » cache un combat, ou un vrai événement.
    const hint = n.hint ? `<span class="indice ${n.hint}" title="${n.hint === 'combat' ? 'Indice des Veilleurs : un combat' : 'Indice des Veilleurs : un vrai événement'}">${n.hint === 'combat' ? '⚔' : '✓'}</span>` : '';
    return `<button type="button" class="noeud ${n.type} ${state} ${run.position === n.id ? 'ici' : ''}" style="left:${x - size / 2}px;top:${y - size / 2}px;width:${size}px;height:${size}px"
      ${can.has(n.id) ? `data-action="noeud" data-id="${n.id}"` : 'disabled'} aria-label="Étape ${n.floor + 1} : ${label}${n.hint ? (n.hint === 'combat' ? ' (un combat)' : ' (un événement)') : ''}">${NODE_ICON[n.type]}${hint}</button>`;
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
      ${run.map.nodes.some((n) => n.type === 'elite') ? '<button type="button" class="bouton bouton-loot" data-action="loot">Tables de butin</button>' : ''}
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

/** Le choix du compagnon du Chasseur, au départ de l'expédition (le dernier choisi est proposé). */
function companionScreen(run: RunState): string {
  const chosen: CompanionId = ui.companion ?? loadProfile().lastCompanion ?? 'loup';
  const last = loadProfile().lastCompanion;
  const tiles = COMPANION_IDS.map((id) => {
    const d = COMPANIONS[id];
    return `<button type="button" class="choix-feu choix-compagnon ${id === chosen ? 'principal' : ''}" data-action="compagnon" data-id="${id}" aria-pressed="${id === chosen}">
      <img class="px" ${spriteAttrs(`familier_${id}.png`, COMPANION_IDS.indexOf(id))} alt="">
      <span class="texte-choix"><b>${d.name} <small>· ${d.role}</small></b><span>${d.text}</span>${id === last ? '<span class="effet-choix">Ton dernier compagnon</span>' : ''}</span></button>`;
  }).join('');
  return `${topbar(run, run.hp)}<div class="ecran">
    <h2>Ton compagnon</h2>
    <p class="texte-evenement">Il te suit pour toute l'expédition et agit seul à la fin de chacun de tes tours, sur ta dernière cible.</p>
    <div class="choix-compagnons">${tiles}</div>
    <button type="button" class="gros-bouton" data-action="compagnon-partir">Partir avec le ${COMPANIONS[chosen].name}</button>
  </div>`;
}

function blessingScreen(run: RunState): string {
  if (ui.blessingRemove) {
    const cards = deckList(run.deck, (card) => cardHtml(card, { action: `data-action="carte-a-confirmer" data-uid="${card.uid}"` }));
    return `${topbar(run, run.hp)}<div class="ecran" style="justify-content:flex-start;padding-top:70px;gap:14px">
      <h2>Allègement</h2>
      <p>Choisis la carte à retirer de ton paquet.</p>
      <div class="liste-deck">${cards}</div>
      <button type="button" class="gros-bouton secondaire" data-action="benediction-retour">Retour</button>
    </div>${cardConfirmWindow(run, 'Retirer', 'Retirer', 'benediction-carte', 'La carte disparaît de ton paquet pour toute l\'expédition.')}`;
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
    const cards = deckList(run.deck, (card) => {
      const ok = remove || (!card.upgraded && !CARDS[card.id].unplayable);
      const action = remove ? 'carte-a-confirmer' : 'apercu-amelioration';
      return cardHtml(card, { action: ok ? `data-action="${action}" data-uid="${card.uid}"` : 'disabled', disabled: !ok });
    });
    return `${topbar(run, run.hp)}<div class="ecran" style="justify-content:flex-start;padding-top:70px;gap:14px">
      <h2>${remove ? 'Retirer une carte' : 'Améliorer une carte'}</h2>
      <p>${remove ? 'Choisis la carte à retirer définitivement de ton paquet.' : 'Choisis la carte à améliorer.'} Prix : ${servicePrice(remove ? run.removals : run.upgradesBought)} or.</p>
      <div class="liste-deck">${cards}</div>
      <button type="button" class="gros-bouton secondaire" data-action="boutique-retour">Retour</button>
    </div>${remove ? cardConfirmWindow(run, 'Retirer', `Retirer · ${servicePrice(run.removals)} or`, 'service-carte', 'La carte disparaît de ton paquet pour toute l\'expédition.') : ''}`;
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
  if (e.defId === 'yzhar' && (e.phase ?? 1) >= 2) {
    const down = ui.run?.combat?.carapaceDown;
    chips.push(down ? `<span class="chip debuff" title="La Carapace est tombée : double dégâts">Carapace tombée · ×2</span>` : `<span class="chip" title="Le Corps ne subit que ${Math.round(100 * YZHAR.carapace)} % des dégâts. Fais-la tomber en tuant les 2 Tentacules intérieurs quand il t'avale">Carapace divine · −${Math.round(100 * (1 - YZHAR.carapace))} %</span>`);
  }
  if (e.buried) chips.push(`<span class="chip" title="Ne peut pas être ciblé ; les DoT et les zones le touchent. Resurgit dans ${e.buried} tour${e.buried > 1 ? 's' : ''}">Enseveli</span>`);
  else if (e.untargetable) chips.push('<span class="chip">Insaisissable</span>');
  const resist = ENEMIES[e.defId].resist;
  if (resist) chips.push(`<span class="chip">Résistance (${resist === 'sorts' ? 'Sorts' : 'Attaques'})</span>`);
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
  // Acte 3 : les boss secondaires d'Irem.
  const c3 = ui.run?.combat;
  if (e.masked && c3?.gear?.seeHallucinations) chips.push(`<span class="chip">${e.defId === 'mehkar' ? 'Le vrai Méhkar' : 'Copie'}</span>`);
  if (e.immune) {
    const swap = c3 ? turnsBeforeSwap(c3) : 0;
    chips.push(`<span class="chip bouclier-saldris" title="Ne subit aucun dégât de ce type (les DoT et les effets de zone passent)">Immunisé (${e.immune === 'sorts' ? 'Sorts' : 'Attaques'})</span><span class="chip" title="Les Rois échangent leurs immunités">Échange ${swap === 0 ? 'à la fin de ce tour' : `dans ${swap} tour${swap > 1 ? 's' : ''}`}</span>`);
    const fallen = c3?.enemies.find((o) => o.dead && o.twinRevive && o !== e);
    if (fallen) chips.push(`<span class="chip alerte" title="Lien des jumeaux : tue-le avant, ou son frère se relève">Relève ${fallen.name} dans ${fallen.twinRevive} tour${fallen.twinRevive! > 1 ? 's' : ''}</span>`);
  }
  if (e.vengeance) chips.push('<span class="chip debuff" title="Il frappe 50 % plus fort jusqu\'à la fin du combat">Vengeance royale</span>');
  if (e.defId === 'limon') {
    chips.push((e.fige ?? 0) > 0
      ? `<span class="chip gel" title="N'agit plus et subit double dégâts">Figé ${e.fige}</span>`
      : `<span class="chip" title="Chaque débuff que tu lui appliques ajoute 1 cumul (pas les DoT)">Figeage ${e.figeage ?? 0}/${IREM.limonStacks}</span>`);
  }
  if (e.defId === 'sartaq' && (e.suspended ?? 0) > 0) chips.push('<span class="chip debuff" title="Pas de blocage à son prochain tour">Suprématie brisée</span>');
  if (e.surfaced && c3?.gear?.surfaceDouble) chips.push('<span class="chip">Vient de resurgir</span>');
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
    case 'burrow': return i.label;
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
  if (i.folie) parts.push(`+${i.folie} Folie`);
  if (i.sable) parts.push(`${i.sable} Sable dans ta pioche`);
  if (i.sableHand) parts.push(`${i.sableHand} Sable dans ta main`);
  if (i.hallucinations) parts.push(`${i.hallucinations} Hallucinations dans ta main`);
  if (i.domination) parts.push('pendant ton prochain tour, ta première Attaque te frappera toi-même');
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
        : i.kind === 'heal' ? `${i.all ? 'Soigne tous ses alliés' : 'Soigne un allié'} de ${i.amount} PV à la fin de ce tour`
        : i.kind === 'potion' ? `${GRIZZIK_POTIONS[i.potion].split(' : ')[1]}, à la fin de ce tour`
        : i.kind === 'hatch' ? 'Tous les Œufs éclosent à la fin de ce tour'
        : i.kind === 'curse' ? curseText(i)
        : 'Prend effet à la fin de ce tour';
    const locked = !isInterruptible(i);
    return `<div class="cast ${locked ? 'bloque' : ''}"><div class="tete"><span>${i.cast}${e.delayed ? ' (retardé)' : ''}</span><b>${locked ? 'Impossible à interrompre' : 'Interruptible'}</b></div><div class="jauge"><div></div></div><div class="effet">${effet}</div></div>`;
  }
  switch (i.kind) {
    case 'attack': {
      // Méhkar et ses Copies : leurs dégâts trahiraient le vrai.
      const hidden = e.masked && !c.gear?.seeHallucinations;
      const dmg = hidden ? '?' : previewIntentDamage(c, e) ?? 0;
      const times = i.times && i.times > 1 ? ` × ${i.times}` : '';
      const zone = i.addZone ? ' + Zone de feu' : i.stealGold ? ` + vole ${i.stealGold} or` : '';
      const extra = i.effect && i.effect.label !== i.label ? ` + ${i.effect.label}` : '';
      // Le nom de l'attaque en infobulle (une ligne de plus repousserait l'intention hors de l'écran).
      const name = i.label ? `${i.label}${i.madBonus ? ` : +${i.madBonus} dégâts si tu as 5 Folie ou plus` : ''}` : '';
      return `<div class="intention" ${name ? `title="${name}"` : ''}>${ICON.epee}<span>${dmg}${times}${zone}${extra}</span></div>`;
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
    case 'burrow':
      return `<div class="intention malediction">${ICON.charge}<span>${i.label}</span></div><div class="effet-intention">Il s'enfouit dans le sable${i.turns > 1 ? ` pendant ${i.turns} tours` : ''} : tu ne pourras plus le cibler (les DoT et les zones le touchent), puis il resurgira</div>`;
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
  opportunite: ['Opportunité', 'Coup final à 5 points : énergie et combo'],
  tourbillon_lames: ['Tourbillon de lames', 'Cible unique : un 2e ennemi à moitié'],
  second_souffle: ['Second souffle', 'Coup final : blocage'],
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
  lien_sauvage: ['Lien sauvage', 'Ton compagnon agit : blocage'],
  frenesie_chasseur: ['Frénésie', 'Ton compagnon gagne +1 dégât à chaque attaque'],
  dressage: ['Dressage', 'Les Ordres coûtent 1 de moins'],
  instinct_tueur: ['Instinct de tueur', 'Ton compagnon tue : +1 énergie, pioche 1'],
  fureur_primitive: ['Fureur primitive', 'Ton compagnon agit deux fois'],
  visee_assuree: ['Visée assurée', 'Attaques à 2 énergie ou plus : +dégâts'],
  calme_absolu: ['Calme absolu', '1er Tir ajusté ou Tir de précision du tour : −1 énergie'],
  maitre_tireur: ['Maître tireur', 'La Marque donne +2 dégâts'],
  maitre_pieges: ['Maître des pièges', 'Tes Pièges se déclenchent deux fois'],
  pieges_serie: ['Pièges en série', 'Un Piège se déclenche : pioche 1'],
  epines_druide: ['Épines', 'Tes attaquants subissent des dégâts'],
  grace_nature: ['Grâce de la nature', 'Sort à 2 énergie ou plus : blocage'],
  puissance_astrale: ['Puissance astrale', 'En Astrale : Sorts +dégâts'],
  eclipse: ['Éclipse', 'Feu stellaire et Sorts lunaires s\'alternent'],
  convergence: ['Convergence céleste', 'Chaque Sort : dégâts à tous'],
  cuir_epais: ['Cuir épais', 'En Ours : +Robustesse'],
  instinct_protecteur: ['Instinct protecteur', 'Rage gagnée → blocage'],
  coeur_sauvage: ['Cœur sauvage', 'Rage et combo gardés en changeant de forme'],
  germination: ['Germination', 'Renouveau : +1 tour, +1 PV'],
  esprit_foret: ['Esprit de la forêt', 'Soin au début de ton tour'],
  symbiose: ['Symbiose', 'Chaque soin frappe un ennemi'],
  arbre_vie: ['Arbre de vie', 'Soins +50 %, 2 blocage par soin'],
  bouclier_foudre: ['Bouclier de foudre', '3 premiers attaquants du tour : dégâts'],
  concentration_elementaire: ['Concentration élémentaire', 'Après un Sort à 2 énergie : Sort suivant −1'],
  appel_foudre: ['Appel de la foudre', 'Résonance (Air) toujours active'],
  fureur_elementaire: ['Fureur élémentaire', '3 totems ou plus : Sorts +dégâts'],
  avatar_tempete: ['Avatar de la tempête', 'Chaque Sort : un éclair au hasard'],
  esprit_combatif: ['Esprit combatif', 'Totem posé : prochaine Attaque +dégâts'],
  arme_tourbillonnante: ['Arme tourbillonnante', '5 Attaques : prochain Sort gratuit'],
  bouclier_eau: ['Bouclier d\'eau', '2 premiers coups du tour : soin'],
  maree_montante: ['Marée montante', 'Soins +PV'],
  vigueur_ancestrale: ['Vigueur ancestrale', 'Chaque soin : autant de blocage'],
};

function playerChips(c: CombatState): string {
  const p = c.player;
  const d = p.debuffs;
  const chips: string[] = [];
  // Acte 3 : la Folie (à 5, des Hallucinations ; à 10, Crise de folie).
  if (c.dominated) chips.push('<span class="chip debuff alerte" title="Ce tour-ci, ta première Attaque te frappe toi-même : tu subis ses dégâts, ses autres effets sont perdus">Domination mentale</span>');
  if (c.folie || c.crisis) chips.push(`<span class="chip folie ${(c.folie ?? 0) >= 5 ? 'alerte' : ''}">Folie ${c.folie ?? 0}/10${c.crisis ? ' · Crise !' : ''}</span>`);
  // Yzhar : le Regard sombre, les entrailles, la Carapace tombée, le familier étourdi.
  if ((c.regard ?? 0) > 0) chips.push(`<span class="chip ${c.covered ? '' : 'debuff alerte'}" title="À la fin de ton tour : ${YZHAR.regardDmg} dégâts, sauf si tu joues « Se mettre à couvert ». Encore ${c.regard} tour${c.regard! > 1 ? 's' : ''}">${c.covered ? 'À couvert' : 'Regard sombre'} · ${c.regard}t</span>`);
  if (c.swallowed) chips.push(`<span class="chip debuff alerte" title="${YZHAR.swallowHand} cartes en main, pas de sorts de barre, ${YZHAR.sucs} dégâts par tour. Tue les 2 Tentacules intérieurs avant d'être recraché : la Carapace divine tombera">Dans les entrailles · ${c.swallowed}t</span>`);
  if (c.carapaceDown) chips.push(`<span class="chip alerte" title="Le Corps d'Yzhar subit double dégâts">Carapace tombée · ${c.carapaceDown}t</span>`);
  if (c.petStunned) chips.push(`<span class="chip debuff" title="Ton ${c.companion ? 'compagnon' : 'familier'} ne fera rien à la fin de ce tour">${c.companion ? 'Compagnon' : 'Familier'} étourdi</span>`);
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
  if (c.aegisThorns) chips.push(`<span class="chip" title="Chaque coup absorbé par ton Égide renvoie ${c.aegisThorns} dégâts à l'attaquant.">Égide des anciens : renvoi ${c.aegisThorns}</span>`);
  if (c.costDown) chips.push('<span class="chip">Transfusion : cartes −1</span>');
  if (c.shadowForm) chips.push('<span class="chip ombre">Forme d\'Ombre</span>');
  // Chaman
  if (c.stormstrike) chips.push(`<span class="chip">Frappe d'orage : Sorts +4 (${c.stormstrike}t)</span>`);
  if (c.earthShield) chips.push(`<span class="chip" title="Chaque attaque reçue : soigne 3 PV, 2 blocage">Bouclier de terre ${c.earthShield}</span>`);
  if (c.maelstrom) chips.push(`<span class="chip" title="À 5 : ton prochain Sort coûte 0">Tourbillon ${c.maelstrom}/5</span>`);
  if (c.clearcast) chips.push('<span class="chip">Prochain Sort −1</span>');
  if (c.freeNextSpell) chips.push('<span class="chip">Prochain Sort gratuit</span>');
  if (c.nextAttackBonus) chips.push(`<span class="chip">Esprit combatif : +${c.nextAttackBonus}</span>`);
  if (c.manaTide) chips.push(`<span class="chip">Totem de mana : +1 énergie (${c.manaTide}t)</span>`);
  if (c.ancestorsNext) chips.push('<span class="chip">Cri des ancêtres : +1 énergie, +1 carte au prochain tour</span>');
  if (c.orbs?.length) chips.push(`<span class="chip">Orbe de foudre : ${c.orbs.reduce((a, o) => a + o.dmg, 0)} au prochain tour</span>`);
  // Druide
  if (c.prowl) chips.push('<span class="chip">Rôder : prochaine Attaque ×2</span>');
  if (c.tigerFury) chips.push(`<span class="chip">Fureur du tigre : +${c.tigerFury}</span>`);
  if (c.eclipseLunar) chips.push('<span class="chip">Éclipse : prochain Sort lunaire ×2</span>');
  if (c.eclipseSolar) chips.push('<span class="chip">Éclipse : Feu stellaire −1</span>');
  if (c.treants?.turns) chips.push(`<span class="chip" title="${c.treants.count} × ${c.treants.dmg} dégâts à ta cible à la fin de tes tours">Sylvains (${c.treants.turns}t)</span>`);
  if (c.tranquility) chips.push(`<span class="chip">Tranquillité (${c.tranquility}t)</span>`);
  if (c.rebirth) chips.push('<span class="chip">Renaissance prête</span>');
  if (c.barkskin) chips.push('<span class="chip">Écorce : dégâts −30 %</span>');
  if (c.rooted) chips.push('<span class="chip">Enraciné</span>');
  // Chasseur
  if (c.feign) chips.push('<span class="chip" title="Les attaques ennemies t\'infligent 50 % de dégâts en moins jusqu\'à ton prochain tour">Feindre la mort</span>');
  if (c.rapidFire) chips.push('<span class="chip">Tir rapide : Attaques −1</span>');
  if (c.huntTurnBonus) chips.push(`<span class="chip">Bête intérieure : +${c.huntTurnBonus}</span>`);
  if (c.focusNext) chips.push(`<span class="chip">Concentration : +${c.focusNext} à la prochaine Attaque</span>`);
  if (c.breathNow) chips.push(`<span class="chip">Respiration : +${c.breathNow} à la 1re Attaque</span>`);
  if (c.breathNext) chips.push(`<span class="chip">Respiration : +${c.breathNext} au prochain tour</span>`);
  if (c.counterStun) chips.push('<span class="chip" title="Le prochain ennemi qui t\'attaque est Contrôlé 1 tour">Contre-attaque</span>');
  if (c.spectral) chips.push(`<span class="chip" title="${c.spectral} dégâts à ta cible à la fin de tes tours">Loup spectral ${c.spectral}</span>`);
  if (c.compNextBonus) chips.push(`<span class="chip">Rage du compagnon : +${c.compNextBonus}</span>`);
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
    : 'Les générateurs donnent du combo, les coups finaux le dépensent.';
  return `<div class="ligne"><span class="rage-label combo-label">COMBO</span><div class="rage combo">${pips}</div><span class="rage-label" style="width:auto">${n}</span></div>
    <div class="aide-posture">${stealth}</div>`;
}

/** Les petites icônes des tuiles du Chasseur. */
const ICON_HUNT: Record<string, string> = {
  patte: '<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true"><ellipse cx="12" cy="16" rx="4.6" ry="3.8"/><circle cx="6" cy="10" r="2"/><circle cx="10" cy="6.5" r="2"/><circle cx="14" cy="6.5" r="2"/><circle cx="18" cy="10" r="2"/></svg>',
  aigle: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M2 9c4 0 6 2 10 2s6-2 10-2c-2 4-5 6-8 6l-2 5-2-5c-3 0-6-2-8-6z"/></svg>',
  tortue: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M4 15c0-5 4-8 8-8s8 3 8 8z"/><path d="M8 15l-1 3M16 15l1 3M20 13h2"/></svg>',
  guepard: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M3 14c3-1 5-5 9-5s7 2 9 0M5 18l2-4M17 18l-1-5"/><circle cx="10" cy="12" r=".8" fill="currentColor"/><circle cx="14" cy="11" r=".8" fill="currentColor"/></svg>',
  explosif: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M12 2l2 6 6-3-3 6 5 2-6 2 2 6-6-4-6 4 2-6-6-2 5-2-3-6 6 3z"/></svg>',
  givrant: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M12 2v20M3 7l18 10M21 7L3 17M9 4l3 3 3-3M9 20l3-3 3 3"/></svg>',
  immolation: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M12 22c4 0 7-3 7-7 0-5-5-7-5-12-3 2-5 5-5 8-1-1-2-2-2-4-2 2-2 5-2 8 0 4 3 7 7 7z"/></svg>',
  venin: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M12 3c3 5 6 8 6 12a6 6 0 0 1-12 0c0-4 3-7 6-12z"/></svg>',
};

const ICON_ELEMENT: Record<string, string> = {
  terre: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M3 19l6-10 4 6 3-4 5 8z"/></svg>',
  feu: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M12 22c4 0 7-3 7-7 0-5-5-7-5-12-3 2-5 5-5 8-1-1-2-2-2-4-2 2-2 5-2 8 0 4 3 7 7 7z"/></svg>',
  eau: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M12 3c3 5 6 8 6 12a6 6 0 0 1-12 0c0-4 3-7 6-12z"/></svg>',
  air: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M3 8h11a3 3 0 1 0-3-3M3 13h15a3 3 0 1 1-3 3M3 18h7"/></svg>',
};

/** Le Chaman : ses 4 emplacements de totem (toujours visibles) et son Arme élémentaire. */
function shamanResource(c: CombatState): string {
  const tiles = ELEMENTS.map((el) => {
    const t = c.totems?.[el];
    return t
      ? `<div class="chs-tuile aide actif totem-${el}" data-titre="${TOTEMS[t.id].name}" title="${esc(totemDescription(c, el)!)}">${ICON_ELEMENT[el]}<span>${TOTEMS[t.id].short}${t.stacks ? `<i class="renfort">+${t.stacks}</i>` : ''}</span></div>`
      : `<div class="chs-tuile aide vide totem-${el}" data-titre="Emplacement ${ELEMENT_NAME[el]}" title="Libre. Pose un totem de ${ELEMENT_NAME[el]} pour le remplir.">${ICON_ELEMENT[el]}<span>${ELEMENT_NAME[el]}</span></div>`;
  }).join('');
  const weapons = (c.imbues ?? []).map((w) => IMBUES[w.id].short).join(' + ');
  const weaponsText = (c.imbues ?? []).map((w) => `${IMBUES[w.id].name} : ${IMBUES[w.id].text(w)}`).join(' ');
  const stunned = (c.petStunned ?? 0) > 0 ? ' · totems étourdis' : '';
  return `<div class="ligne chs-tuiles">${tiles}<div class="chs-tuile aide ${weapons ? 'piege' : 'vide'}" data-titre="Arme élémentaire" title="${esc(weaponsText || 'Aucune. Joue une carte d\'Arme élémentaire.')}">${ICON.epee}<span>${weapons || 'Arme'}</span></div></div>
    <div class="aide-posture">${c.ankh ? 'Réincarnation prête' : 'Réincarnation utilisée'}${stunned}</div>`;
}

/** Le Druide : la jauge de la forme (rage de l'Ours, combo du Félin) et les quatre boutons de forme. */
function druidResource(c: CombatState): string {
  const form = c.form ?? 'normale';
  const pips = (n: number, max: number) => Array.from({ length: max }, (_, i) => `<i class="${i < n ? 'plein' : ''}"></i>`).join('');
  const gauge = form === 'ours'
    ? `<div class="ligne"><span class="rage-label">RAGE</span><div class="rage">${pips(c.bearRage ?? 0, MAX_BEAR_RAGE)}</div><span class="rage-label" style="width:auto">${c.bearRage ?? 0}</span></div>`
    : form === 'felin'
      ? `<div class="ligne"><span class="rage-label combo-label">COMBO</span><div class="rage combo">${pips(c.catCombo ?? 0, MAX_CAT_COMBO)}</div><span class="rage-label" style="width:auto">${c.catCombo ?? 0}</span></div>`
      : '';
  const cost = shiftCost(c);
  const buttons = FORM_IDS.map((id) => {
    const actif = form === id;
    return `<button type="button" class="${actif ? 'actif' : ''}" data-action="forme" data-form="${id}" ${actif || canShift(c, id) ? '' : 'disabled'} aria-pressed="${actif}" title="${FORMS[id].name} : ${FORMS[id].text}">${FORMS[id].short}</button>`;
  }).join('');
  const why = c.rooted ? ' · enraciné ce tour-ci' : (c.player.debuffs?.lignee ?? 0) > 0 ? ' · forme bloquée' : cost === 0 ? ' · changer est gratuit' : ' · changer coûte 1 énergie';
  return `${gauge}
    <div class="postures formes" role="group" aria-label="Forme">${buttons}</div>
    <div class="aide-posture"><b>${FORMS[form].short}</b> : ${FORMS[form].text}${why}</div>`;
}

/** Le compagnon, l'Esprit et les Pièges du Chasseur : une rangée de tuiles (maquette C). */
function hunterResource(c: CombatState): string {
  const comp = COMPANIONS[c.companion ?? 'loup'];
  const aspect = c.aspect ? ASPECTS[c.aspect] : null;
  const traps = c.traps ?? [];
  const victim = trapVictim(c);
  const away = (c.player.debuffs?.lignee ?? 0) > 0 || (c.petStunned ?? 0) > 0;
  const tiles = [
    `<div class="chs-tuile aide actif ${away ? 'absent' : ''}" title="${comp.name} : ${comp.text}">${ICON_HUNT.patte}<span>${comp.name} · ${companionDamage(c)}</span></div>`,
    `<div class="chs-tuile aide ${aspect ? 'actif' : ''}" title="${aspect ? `${aspect.name} : ${aspect.text}` : 'Joue une carte Esprit (un seul à la fois)'}">${aspect ? ICON_HUNT[c.aspect!] : ICON_HUNT.aigle}<span>${aspect ? aspect.short : 'Esprit'}</span></div>`,
    ...Array.from({ length: 3 }, (_, i) => {
      const t = traps[i];
      return t
        ? `<div class="chs-tuile aide piege" title="${TRAPS[t.id].name}">${ICON_HUNT[t.id]}<span>${TRAPS[t.id].short}</span></div>`
        : '<div class="chs-tuile aide vide" title="Emplacement de Piège libre"><span>Piège</span></div>';
    }),
  ].join('');
  const help = traps.length && victim
    ? `Les Pièges partent au début du tour ennemi, sur ${victim.name}.`
    : away ? `Ton ${comp.name} ne fera rien à la fin de ce tour.` : `${comp.name} : ${comp.text.replace('Fin de ton tour : ', '')}`;
  return `<div class="ligne chs-tuiles">${tiles}</div>
    <div class="aide-posture">${help}</div>`;
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
    : run.classId === 'demoniste' ? demonResource(c) : run.classId === 'pretre' ? priestResource(c) : run.classId === 'voleur' ? rogueResource(c) : run.classId === 'paladin' ? paladinResource(c) : run.classId === 'chasseur' ? hunterResource(c) : run.classId === 'druide' ? druidResource(c) : run.classId === 'chaman' ? shamanResource(c) : '';
  const postures = POSTURES.map((po) => {
    const actif = p.posture === po.id;
    const disabled = !actif && p.postureChanged;
    return `<button type="button" class="${actif ? 'actif' : ''}" data-action="posture" data-posture="${po.id}" ${disabled ? 'disabled' : ''} aria-pressed="${actif}">${po.label}</button>`;
  }).join('');
  const aidePosture = POSTURES.find((po) => po.id === p.posture)?.aide ?? '';

  // Chasseur : la cible du compagnon et l'ennemi qui déclenchera les Pièges.
  const compTarget = c.companion ? companionTarget(c) : null;
  const trapTarget = c.traps?.length ? trapVictim(c) : null;
  const enemies = c.enemies.filter((e) => !e.dead && !e.submerged).map((e) => {
    const def0 = ENEMIES[e.defId];
    // Une Copie a l'aspect de l'original (taille, cadre, sprite).
    const def = def0.copyOf ? ENEMIES[def0.copyOf] : def0;
    const masked = e.masked && !c.gear?.seeHallucinations;
    // La Triade de la Ruche : trois boss côte à côte, un peu plus petits pour laisser la place aux incantations.
    const big = e.defId === 'seigneur' || (def.elite && e.defId !== 'croc' && !['kesh', 'vorra', 'tazz'].includes(e.defId));
    const small = ['etincelle', 'rejeton', 'eclat', 'dragonnet', 'oeuf', 'oeuf_skarn', 'oeuf_vashka', 'serviteur_os'].includes(e.defId);
    const size = e.defId === 'vulkhar' ? 240 : e.defId === 'vhaeryx' || e.defId === 'yzhar' ? 208 : big ? 192 : small ? 96 : 144;
    // Les boss qui changent de forme : Vhaeryx en dragon, le Corps d'Yzhar.
    const sprite = e.defId === 'vhaeryx' && (e.phase ?? 1) >= 2 ? 'ennemi_vhaeryx_dragon.png'
      : e.defId === 'yzhar' && (e.phase ?? 1) >= 2 ? 'ennemi_yzhar_corps.png' : `ennemi_${def.id}.png`;
    const pct = masked ? 100 : Math.max(0, (e.hp / e.maxHp) * 100);
    const canTarget = targeting && !e.untargetable;
    const tag = canTarget ? 'button' : 'div';
    return `<${tag} ${canTarget ? 'type="button"' : ''} class="ennemi ${canTarget ? 'ciblable' : ''} ${e.untargetable ? 'insaisissable' : ''}" data-action="cible" data-uid="${e.uid}" aria-label="${e.name}${masked ? '' : `, ${e.hp} PV`}">
      ${intentHtml(c, e)}
      ${e === compTarget ? `<span class="chs-cible" title="Ton ${COMPANIONS[c.companion!].name} attaquera cet ennemi à la fin de ton tour">${ICON_HUNT.patte}cible</span>` : ''}
      ${e === trapTarget ? `<span class="chs-ici" title="Il agit en premier : tes Pièges se déclencheront sur lui">${c.traps!.map((t) => ICON_HUNT[t.id]).join('')}ici</span>` : ''}
      <img class="px" data-fx="${e.uid}" ${spriteAttrs(sprite, e.uid)} alt="" width="${size}" height="${size}">
      <span class="nom ${def.elite ? 'elite' : ''}">${def.elite ? 'Gardien · ' : ''}${e.name}</span>
      <div class="barre-pv"><div style="width:${pct}%"></div><span>${masked ? '? / ?' : `${e.hp} / ${e.maxHp}`}</span></div>
      <div class="infos">${e.block > 0 ? `<span class="bloc">${ICON.bouclier} ${e.block}</span>` : ''}${masked ? '<span class="chip" title="Le vrai Méhkar ou une Copie ? Il se révèle quand il est touché">Lequel est le vrai ?</span>' : enemyChips(e)}${c.mark?.uid === e.uid ? `<span class="chip marque" title="Tes Attaques et ton compagnon lui infligent +${markBonus(c, e)} dégâts">Marqué +${markBonus(c, e)}</span>` : ''}</div>
      ${def.passive ? `<div class="passif-ennemi">${(e.phase ?? 1) >= 2 && def.passive2 ? def.passive2 : def.passive}</div>` : ''}
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
    reason: cardBlockReason(c, i),
    ready: cardReady(c, i),
    selected: ui.selection?.kind === 'card' && ui.selection.index === i,
    combat: c,
    hit: cardHitValue(c, i),
    disguise: true,
  })).join('');

  let enrage = '';
  if (c.enrageTurn !== null) {
    enrage = isEnraged(c)
      ? `<div class="enrage actif">${ICON.sablier}<span>Il se déchaîne : ses coups sont doublés</span></div>`
      : `<div class="enrage">${ICON.sablier}<span>Il se déchaîne dans ${c.enrageTurn - c.turn} tour${c.enrageTurn - c.turn > 1 ? 's' : ''} : ses coups doubleront</span></div>`;
  }

  const journal = c.log.slice(-9).map((l) => `<p>${l}</p>`).join('');
  const underLava = c.enemies.find((e) => !e.dead && e.submerged && !e.outside);
  const reviving = c.enemies.filter((e) => e.dead && e.reviveIn);
  const selSpell = ui.selection?.kind === 'spell' ? SPELLS[c.spells[ui.selection.index].id] : null;
  const spellInfo = selSpell
    ? `<div class="info-sort"><b>${selSpell.name}</b><small>${selSpell.cost > 0 ? `${selSpell.cost} énergie` : 'Gratuit'} · ${selSpell.once ? 'une fois par combat' : `recharge ${selSpell.cooldown} tours`}</small><span>${selSpell.text}</span><em>${targeting ? 'Choisis une cible.' : 'Touche à nouveau le sort pour le lancer.'}</em></div>`
    : '';
  const consigne = selSpell
    ? ''
    : targeting
    ? `<div class="consigne">Choisis une cible</div>`
    : c.swallowed
      ? `<div class="consigne lave">Yzhar t'a avalé : tue les 2 Tentacules intérieurs avant d'être recraché (encore ${c.swallowed} tour${c.swallowed > 1 ? 's' : ''}). Sa Carapace tombera.</div>`
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
      <img class="px ${c.stealth ? 'camoufle-sprite' : ''}" data-fx="player" data-tenue="${heroSprite(hero.sprite, c)}" ${spriteAttrs(heroSprite(hero.sprite, c))} alt="Le ${hero.name}" width="192" height="192">
      ${c.pet && !c.petSacrificed ? `<img class="px familier" ${spriteAttrs(`familier_${c.pet}.png`, 1)} alt="${PETS[c.pet].name}" title="${PETS[c.pet].name} : ${PETS[c.pet].text}">` : ''}
      ${c.companion ? `<img class="px familier compagnon ${(c.player.debuffs?.lignee ?? 0) > 0 ? 'enfui' : ''}" ${spriteAttrs(`familier_${c.companion}.png`, 1)} alt="${COMPANIONS[c.companion].name}" title="${COMPANIONS[c.companion].name} : ${COMPANIONS[c.companion].text}">` : ''}
      ${c.spectral ? `<img class="px familier loup-spectral" ${spriteAttrs('familier_loup.png', 3)} alt="Loup spectral" title="Loup spectral : ${c.spectral} dégâts à ta cible à la fin de tes tours">` : ''}
      ${c.infernal ? `<img class="px seigneur-infernal" ${spriteAttrs('familier_seigneur.png', 2)} alt="Seigneur infernal" title="Seigneur infernal : ${c.infernal} dégâts à tous les ennemis à la fin de ton tour">` : ''}
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
  // Avec les comptes en ligne, on ne passe pas l'accueil sans être connecté.
  if (cloud.enabled && !cloud.user) return firstLaunchScreen();
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
  // Le râtelier : le légendaire forgé de la classe, emporté par défaut. Il prend l'emplacement d'Arme.
  const legendary = rackLegendary(profile, cls);
  const carried = legendary && !ui.leaveLegendary ? ITEMS[legendary] : null;
  if (carried && ui.heirloom !== null && ITEMS[chest[ui.heirloom]].slot === 'arme') ui.heirloom = null;
  const tiles = Array.from({ length: CHEST_SIZE }, (_, i) => {
    const id = chest[i];
    if (!id) return '<span class="case-equipement vide case-coffre"></span>';
    const it = ITEMS[id];
    const blocked = carried && it.slot === 'arme';
    return `<button type="button" class="case-equipement case-coffre ${it.rarity} ${ui.heirloom === i ? 'choisie' : ''} ${blocked ? 'bloquee' : ''}" data-action="heritage" data-index="${i}" aria-label="${it.name}${blocked ? ' (ton légendaire occupe l\'emplacement d\'Arme)' : ''}" ${blocked ? 'disabled' : ''}>
      ${SLOT_ICON[it.slot]}${ui.heirloom === i ? '<em>Emporté</em>' : ''}</button>`;
  }).join('');
  const chosen = ui.heirloom !== null ? ITEMS[chest[ui.heirloom]] : null;
  const rack = legendary ? `<span class="butin-titre">Râtelier · légendaire du ${hero.name}</span>
      <div class="ratelier">
        <button type="button" class="case-equipement legendaire ${carried ? 'choisie' : ''}" data-action="ratelier" aria-pressed="${!!carried}" aria-label="${ITEMS[legendary].name} : ${carried ? 'emporté' : 'laissé au râtelier'}">${SLOT_ICON[ITEMS[legendary].slot]}${carried ? '<em>Emporté</em>' : ''}</button>
        <div><b>${ITEMS[legendary].name}</b><span>${ITEMS[legendary].text}</span>
          <em>Gardé pour toujours, jamais perdu. Il prend l'emplacement d'Arme ; sa quête est déjà faite.</em>
          <button type="button" class="lien" data-action="ratelier">${carried ? 'Le laisser au râtelier' : 'L\'emporter'}</button></div>
      </div>` : '';
  const takes = [carried ? `<b>${carried.name}</b> (jamais perdu)` : '', chosen ? `<b>${chosen.name}</b> (perdu si l'expédition échoue)` : ''].filter(Boolean);
  const takeText = takes.length
    ? `Tu emportes : ${takes.join(' et ')}.${carried && !chosen && chest.length ? ' Tu peux ajouter un objet du coffre (pas une arme).' : ''}`
    : chest.length ? 'Tu peux emporter un objet du coffre : touche-le.' : '';
  const run = canContinue && saved ? `<div class="run-en-cours">
      <span class="butin-titre">Expédition en cours · ${classInfo(saved.classId).name}</span>
      <p>${chapitre(saved.act ?? 1)} · ${saved.position === null ? 'Entrée' : `Étape ${saved.map.nodes[saved.position].floor + 1} sur ${FLOORS}`} · ${ICON.coeur} ${saved.hp}/${saved.maxHp} · ${ICON.piece} ${saved.gold} · ${saved.wipesLeft} relève${saved.wipesLeft > 1 ? 's' : ''} restante${saved.wipesLeft > 1 ? 's' : ''}</p>
      <button type="button" class="gros-bouton" data-action="continuer">Continuer</button>
    </div>` : '';
  const stats = profile.stats;
  return `<div class="hall">
    <header class="hall-tete"><span class="titre-jeu petit">Wipe &amp; Loot</span><span class="hall-nom">Hall de la guilde</span>
      <div class="hall-options"><button type="button" class="bouton tuto-bouton" data-action="tuto" aria-label="Revoir la visite du hall" title="Revoir la visite du hall">?</button>${isDevBuild() ? '<button type="button" class="bouton bouton-test" data-action="test">🛠 Test</button>' : ''}${cloud.user ? `<span class="hall-pseudo">👤 <b>${esc(cloud.user.pseudo)}</b></span>` : ''}<button type="button" class="bouton bouton-roue ${ui.overlay === 'roue' ? 'actif' : ''}" data-action="roue" aria-label="Menu" title="Menu">⚙${gearCount() > 0 ? `<span class="pastille">${gearCount()}</span>` : ''}</button></div></header>
    <section class="hall-heros">
      ${switcher}
      <img class="px" ${spriteAttrs(hero.sprite ?? 'guerrier.png')} alt="Le ${hero.name}" width="160" height="160">
      <h3>${hero.name} · niveau ${lvl.level}</h3>
      <div class="description-hall">
        <div><span class="etoiles">${'★'.repeat(hero.difficulty)}<i>${'★'.repeat(3 - hero.difficulty)}</i></span> <em>Difficulté ${DIFFICULTY_WORD[hero.difficulty]}</em></div>
        <span><img class="px" src="${A('icone_epee.png')}" alt="">${hero.role}</span>
        <span><img class="px" src="${A('icone_pouvoir.png')}" alt="">${hero.resource}</span>
      </div>
      <div class="barre-xp"><div style="width:${pct}%"></div><span>${lvl.needed ? `${lvl.into} / ${lvl.needed} expérience` : 'Niveau maximum'}</span></div>
      <div class="hall-arbres">${trees}</div>
      <button type="button" class="gros-bouton secondaire" data-action="talents">Talents · ${pointsUsed(alloc)}/${lvl.level} points</button>
      <button type="button" class="bouton" data-action="classes">Classes${unlocks > 0 ? ` · ${unlocks} à débloquer` : ''}</button>
    </section>
    <section class="hall-expedition">
      <span class="butin-titre">L'expédition · ${Object.keys(ACTS).length} chapitres</span>
      <h2>${ACTS[1].name} → ${ACTS[2].name}</h2>
      <p>Les Profondeurs Ardentes et Vulkhar, puis l'Aire de Vhaeryx au sommet du mont Durgal. 10 étapes par chapitre, des gardiens différents à chaque expédition.</p>
      ${run}
      ${difficultyPicker()}
      <button type="button" class="gros-bouton ${canContinue ? 'secondaire' : ''}" data-action="nouvelle">${canContinue ? 'Nouvelle expédition' : 'Partir en expédition'}</button>
      <p class="emporte-texte">${takeText}</p>
    </section>
    <section class="hall-coffre">
      ${rack}
      <span class="butin-titre">Coffre de la guilde · ${chest.length}/${CHEST_SIZE}</span>
      ${chest.length ? `<div class="grille-coffre">${tiles}</div>
      ${chosen ? `<div class="fiche-coffre ${chosen.rarity}"><b>${chosen.name}</b> <span class="type-talent r-${chosen.rarity}">${RARITY_LABEL[chosen.rarity]}</span><p>${chosen.text}</p><p class="emporte">Emporté pour la prochaine expédition : il revient au coffre si tu gagnes, il est perdu sinon.</p></div>`
        : '<p>Touche un objet pour voir son effet et l\'emporter lors de la prochaine expédition (un seul).</p>'}
      <button type="button" class="bouton" data-action="voir-coffre">Voir le détail du coffre</button>`
        : '<p>Vide pour l\'instant : après une expédition gagnée, tu pourras y mettre un objet à l\'abri.</p>'}
      <button type="button" class="gros-bouton secondaire" data-action="archives">Archives de la guilde · ${archivesProgress()} %</button>
      <div class="hall-stats">
        <span>Expéditions <b>${stats.runs}</b></span><span>Victoires <b>${stats.wins}</b></span><span>Objets découverts <b>${profile.discoveredItems.length}</b></span>
      </div>
      <p class="hall-version">${versionLabel(siteOf(location.pathname, location.hostname))}</p>
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
    // Chaque arme est suivie de sa jumelle (mêlée et incantation).
    const groups: [string, string[]][] = [['Coffres et vendeur gobelin', withTwins(COMMON_POOL)],
      ...[...ELITE_ENCOUNTERS, ...ELITE_ENCOUNTERS_2, ...ELITE_ENCOUNTERS_3].map((e) => [e.name, withTwins(LOOT_TABLES[e.loot!])] as [string, string[]]),
      // Les boss de fin d'acte : leur table, puis leur butin épique.
      ...[1, 2, 3].map((n) => [`${ACTS[n].boss.name.split(',')[0]} (seigneur du ${chapitre(n).toLowerCase()})`, withTwins([...BOSS_LOOT[n].table, ...BOSS_LOOT[n].epics])] as [string, string[]]),
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
  for (const act of [1, 2, 3]) {
    // Les Copies de Méhkar n'ont pas leur propre fiche.
    const ids = Object.keys(ENEMIES).filter((id) => enemyAct(id) === act && !ENEMIES[id].copyOf);
    const kinds: [string, (id: string) => boolean][] = [
      ['Monstres', (id) => !ENEMIES[id].elite && !ENEMIES[id].boss],
      ['Gardiens', (id) => !!ENEMIES[id].elite && !ENEMIES[id].boss],
      ['Seigneurs', (id) => !!ENEMIES[id].boss],
    ];
    for (const [kind, test] of kinds) {
      const list = ids.filter(test);
      if (list.length === 0) continue;
      groups.push({
        title: `${chapitre(act)} · ${kind}`,
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
    .map(([id, label]) => `<button type="button" class="onglet ${tab === id ? 'actif' : ''}" data-action="archives-onglet" data-tab="${id}">${label} · ${archiveTabProgress(id).pct} %</button>`).join('')
    + `<button type="button" class="onglet ${tab === 'mots' ? 'actif' : ''}" data-action="archives-onglet" data-tab="mots">Glossaire</button>`;
  if (tab === 'mots') return glossaryScreen(tabs);
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
      <button type="button" class="bouton bouton-retour" data-action="titre">Retour</button>
      ${entry ? archiveSheet(tab, entry) : `<aside class="fiche-talent vide"><div class="titre-fiche">Archives de la guilde</div><p>Touche une icône pour voir sa fiche.</p><p>Ce que tu n'as pas encore découvert reste caché : une silhouette pour les monstres, un « ? » pour le reste.</p></aside>`}
    </div>
  </div>`;
}

/** Le glossaire des archives : tous les mots-clés expliqués, dans l'ordre alphabétique. */
function glossaryScreen(tabs: string): string {
  const words = [...KEYWORDS, ...GLOSSARY_EXTRA].sort((a, b) => a.name.localeCompare(b.name, 'fr'));
  const list = words.map((k) => `<div class="mot-glossaire"><b>${k.name}</b><span>${k.text}</span></div>`).join('');
  return `<div class="ecran ecran-archives">
    <div class="archives-gauche">
      <div class="tete-talents"><h2>Archives</h2><div class="onglets">${tabs}</div><span class="points-talent">${words.length} mots</span></div>
      <div class="contenu-archives glossaire">${list}</div>
    </div>
    <div class="archives-droite">
      <button type="button" class="bouton bouton-retour" data-action="titre">Retour</button>
      <aside class="fiche-talent vide"><div class="titre-fiche">Glossaire</div><p>Les mots en <span class="mot">or</span> sur les cartes et les pastilles s'expliquent en combat : reste appuyé dessus (téléphone) ou passe la souris (PC).</p><p>Ils sont tous réunis ici, pour les relire tranquillement.</p></aside>
    </div>
  </div>`;
}

/** L'acte d'un monstre. */
function enemyAct(id: string): number {
  return id in ENEMIES_ACTE3 ? 3 : id in ENEMIES_ACTE2 ? 2 : 1;
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
  const act = enemyAct(e.key);
  const kind = d.boss ? 'Seigneur' : d.elite ? 'Gardien' : 'Monstre';
  const kindTag = tag(`${kind} · ${chapitre(act).toLowerCase()}`, d.boss ? 'r-legendaire' : d.elite ? 'r-epique' : '');
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
  const tiles: [string, string, string][] = [
    ['icone_bouclier.png', 'Choisis ton héros', 'Guerrier, mage, druide… neuf héros, chacun avec ses pouvoirs.'],
    ['icone_epee.png', 'Pars en expédition', 'Trois chapitres, des gardiens à chaque détour, et un seigneur au bout du chemin.'],
    ['icone_feu.png', 'Tombe et relève-toi', 'Vaincu ? Panse tes blessures, répare ton armure, et repars au combat.'],
    ['icone_enclume.png', 'Rapporte le butin', 'Arrache leurs armes aux seigneurs, et deviens plus fort d\'une expédition à l\'autre.'],
  ];
  return `<div class="ecran ecran-accueil">
    <img class="px sprite-titre" ${spriteAttrs('guerrier.png')} alt="">
    <div class="titre-jeu">Wipe &amp; Loot</div>
    <div class="sous-titre">Un jeu de cartes et d'aventure au royaume d'Eldrava</div>
    <q class="accroche">Tomber, se relever, et rapporter le butin.</q>
    <div class="tuiles-accueil">${tiles.map(([icon, title, text]) => `<div class="tuile-accueil"><img class="px" src="${A(icon)}" alt=""><b>${title}</b><span>${text}</span></div>`).join('')}</div>
    <div class="actions">
      ${cloud.enabled && !cloud.ready ? '<button type="button" class="gros-bouton" disabled>Connexion…</button>' : '<button type="button" class="gros-bouton" data-action="nouvelle">Commencer</button>'}
      ${fullscreenButton('gros-bouton secondaire')}
    </div>
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
    ${run.rewardChoices.length > 0 ? '<p>Choisis une carte à ajouter à ton paquet.</p>' : ''}
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
      ${cardHtml({ ...card, upgraded: true }, { action: 'disabled', diffFrom: splitRibbon(CARDS[card.id].text(false, runGear(run))).text })}
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
    <span class="butin-titre">${chapitre(run.act)} terminé</span>
    <h1>${next.name}</h1>
    <p class="texte-evenement">${next.intro}</p>
    <p>Avant de repartir, la guilde panse tes blessures : <b>tes PV remontent au maximum</b>.</p>
    <button type="button" class="gros-bouton" data-action="acte-suivant">Entrer dans le ${chapitre(run.act + 1).toLowerCase()}</button>
  </div>`;
}

function campfireScreen(run: RunState): string {
  if (ui.campfireUpgrade && ui.upgradeUid !== null) {
    return `${topbar(run, run.hp)}${upgradePreview(run, ui.upgradeUid, 'Améliorer cette carte', 'data-action="ameliorer"')}`;
  }
  if (ui.campfireUpgrade) {
    const cards = deckList(run.deck, (card) => cardHtml(card, {
      action: card.upgraded || CARDS[card.id].unplayable ? 'disabled' : `data-action="apercu-amelioration" data-uid="${card.uid}"`,
      disabled: card.upgraded || CARDS[card.id].unplayable,
    }));
    return `${topbar(run, run.hp)}<div class="ecran" style="justify-content:flex-start;padding-top:70px;gap:14px">
      <h2>Le maître de classe</h2>
      <p>Choisis une carte à améliorer.</p>
      <div class="liste-deck">${cards}</div>
      <button type="button" class="gros-bouton secondaire" data-action="feu-retour">Retour</button>
    </div>`;
  }
  if (ui.bindStaff && run.classId === 'druide') {
    const items = druidOfferings(run).map((k) => {
      const it = ITEMS[run.equipment[k]!];
      return `<button type="button" class="choix-feu" data-action="offrande" data-slot="${k}"><span class="case-equipement ${it.rarity}">${SLOT_ICON[it.slot]}</span><span class="texte-choix"><b>${it.name}</b><span>${it.text}</span></span></button>`;
    }).join('');
    return `${topbar(run, run.hp)}<div class="ecran" style="justify-content:flex-start;padding-top:70px;gap:14px">
      <h2>Lier par la nature</h2>
      <p>Le bâton demande un don : choisis un objet à rendre à la terre. Il disparaît, et le Bâton du Veilleur remplace ton arme.</p>
      <div class="choix-liste">${items}</div>
      <button type="button" class="gros-bouton secondaire" data-action="feu-retour">Retour</button>
    </div>`;
  }
  if (ui.bindStaff) {
    const cards = deckList(run.deck, (card) => {
      const ok = CARDS[card.id].rarity === 'rare';
      return cardHtml(card, { action: ok ? `data-action="carte-a-confirmer" data-uid="${card.uid}"` : 'disabled', disabled: !ok });
    });
    return `${topbar(run, run.hp)}<div class="ecran" style="justify-content:flex-start;padding-top:70px;gap:14px">
      <h2>Lier les fragments</h2>
      <p>Le bâton exige un sacrifice : choisis une carte rare de ton paquet. Elle disparaît, et le Bâton du Veilleur remplace ton arme.</p>
      <div class="liste-deck">${cards}</div>
      <button type="button" class="gros-bouton secondaire" data-action="feu-retour">Retour</button>
    </div>${cardConfirmWindow(run, 'Sacrifier', 'Sacrifier', 'lier-baton', 'La carte est détruite, et le Bâton du Veilleur remplace ton arme.')}`;
  }
  const heal = Math.min(campfireHealAmount(run), run.maxHp - run.hp);
  const pct = (n: number) => `${Math.round((100 * n) / run.maxHp)}%`;
  // Les légendaires à forger : une tuile dorée chacun (le texte de l'étape et l'objet obtenu).
  const forges = [
    canReforge(run) && { action: 'reforger', label: 'Reforger Brisemonts', item: 'brisemonts', text: 'Tu poses la Lame brisée sur les braises, et le Cœur de la montagne se met à battre. Reforger Brisemonts prend toute la nuit : pas de repos ni d\'entraînement. L\'épée remplacera ton arme actuelle.' },
    canBindStaff(run) && { action: 'lier-fragments', label: run.classId === 'druide' ? 'Lier par la nature' : 'Lier les fragments', item: run.classId === 'druide' ? 'baton_veilleur_druide' : 'baton_veilleur', text: 'Tu poses le Fragment et la Tête du bâton près du feu. Les runes s\'éveillent : le Veilleur attend un dernier sacrifice.' },
    canForgeEquinoxe(run) && { action: 'equinoxe', label: 'Rituel de l\'équinoxe', item: 'equinoxe', text: 'Tu sertis la Larme d\'Ysolde au sommet du Bâton nu. La pierre s\'illumine, puis s\'assombrit, puis s\'illumine encore.' },
    canForgeCorde(run) && { action: 'corde', label: 'Façonner l\'arc', item: 'corde_anciens', text: 'Tu tends le Tendon de drake sur le Bois ancien, près des braises. Le bois chante quand la corde vibre pour la première fois.' },
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
      <img class="px heros-feu" ${spriteAttrs(hero.sprite ?? 'guerrier.png')} alt="Le ${hero.name}">
      <span class="lueur-feu"></span>
      <span class="flammes-feu" style="background-image:url(${A('feu_camp.png')})"></span>
    </div>
    <div class="choix-du-feu">
      <h2>Feu de camp</h2>
      <p>La chaleur de la montagne se fait oublier un instant. Une seule action avant de repartir.</p>
      ${forgeTiles}
      ${rest}
      <button type="button" class="choix-feu" data-action="feu-ameliorer"><img class="px" src="${A('icone_enclume.png')}" alt=""><span class="texte-choix"><b>Améliorer une carte</b><span>Le maître de classe améliore une carte de ton paquet.</span></span></button>
    </div>
  </div>`;
}

function wipeScreen(run: RunState): string {
  const bill = repairBill(run);
  const canPay = run.gold >= bill;
  const breakable = breakableSlots(run).length > 0;
  return `${topbar(run, 0)}<div class="ecran">
    <h1>Tu es tombé !</h1>
    <p>Tu peux te relever et retenter le combat depuis le début, avec au moins la moitié de tes PV et les potions que tu avais en entrant. Il te reste ${run.wipesLeft} relève${run.wipesLeft > 1 ? 's' : ''}.</p>
    <div class="facture">
      <span class="facture-titre">Facture de réparation</span>
      <b>${ICON.piece} ${bill} or</b>
      <span>${canPay ? `Tu as ${run.gold} or.` : breakable ? `Tu n'as que ${run.gold} or : <strong class="mention-brise">un de tes objets, au hasard, sera brisé</strong>. Son effet sera désactivé jusqu'à ce que le vendeur gobelin le répare.` : `Tu n'as que ${run.gold} or, mais aucun objet à briser : le gobelin te fait crédit, pour cette fois.`}</span>
    </div>
    <div class="actions">
      <button type="button" class="gros-bouton" data-action="retenter">${canPay ? `Te relever · ${bill} or` : breakable ? 'Te relever (un objet sera brisé)' : 'Te relever'}</button>
      <button type="button" class="gros-bouton secondaire" data-action="abandonner">Abandonner l'expédition</button>
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
      <b class="gain-xp">+${sum.xp} expérience${sum.catchup ? ' <em>(×1,5 : rattrapage)</em>' : ''}</b>
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
  const sprite = (c: (typeof CLASSES)[number]) => (c.sprite ? `<img class="px" ${spriteAttrs(c.sprite)} alt="">` : '<span class="sprite-inconnu">?</span>');
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
  const next = nextUnlockLevel(profile);
  const n = unlocksAvailable(profile);
  const [button, note] = {
    libre: [`<button type="button" class="gros-bouton" data-action="classe-depart-voir" data-id="${c.id}">Choisir le ${c.name}</button>`, 'Tu arriveras ensuite au hall de la guilde, d\'où partent les expéditions. Les autres classes se débloqueront en montant de niveau.'],
    jouee: ['<button type="button" class="gros-bouton" disabled>Classe jouée</button>', 'C\'est la classe de tes prochaines expéditions.'],
    debloquee: [`<button type="button" class="gros-bouton" data-action="classe-active" data-id="${c.id}">Jouer le ${c.name}</button>`, ''],
    'a-debloquer': [`<button type="button" class="gros-bouton" data-action="debloquer" data-id="${c.id}">Débloquer le ${c.name}</button>`, `Tu peux débloquer ${n} classe${n > 1 ? 's' : ''} : c'est toi qui choisis.`],
    verrouillee: ['<button type="button" class="gros-bouton" disabled>À débloquer</button>', next ? `Prochaine classe quand l\'une de tes classes atteint le niveau ${next}.` : ''],
    bientot: ['<button type="button" class="gros-bouton" disabled>En préparation</button>', 'Cette classe arrive dans une prochaine version.'],
  }[st];
  const sub = first
    ? 'Choisis <b>une seule</b> classe pour commencer. Les autres se débloquent en montant de niveau.'
    : `Meilleur niveau : ${bestLevel(profile)}${next ? ` · prochaine classe au niveau ${next}` : ''}`;
  return `<div class="ecran ecran-classes">
    <div class="tete-talents">
      <h2>${first ? 'Choisis ta classe' : 'Les classes'}</h2>
      <span class="points-talent">${sub}</span>
      <button type="button" class="bouton" data-action="titre">Retour</button>
    </div>
    <div class="corps-classes">
      <div class="grille-classes">${cards}</div>
      <aside class="fiche-classe-detail ${st === 'jouee' || st === 'debloquee' ? 'avec-progression' : ''}" style="--couleur:${c.color}">
        <div class="portrait-classe ${st === 'bientot' || st === 'verrouillee' ? 'silhouette' : ''}">${sprite(c)}</div>
        <div class="nom-classe"><b>${c.name}</b><span class="etoiles">${'★'.repeat(c.difficulty)}<i>${'★'.repeat(3 - c.difficulty)}</i></span><em>Difficulté ${DIFFICULTY_WORD[c.difficulty]}</em></div>
        <div class="infos-classe">
          <span class="info"><img class="px" src="${A('icone_epee.png')}" alt="">${c.role}</span>
          <span class="info"><img class="px" src="${A('icone_pouvoir.png')}" alt="">${c.resource}</span>
          <span class="info"><img class="px" src="${A('icone_sang.png')}" alt="">${c.hp} PV</span>
        </div>
        ${howToPlayHtml(c.id, A)}
        ${st === 'jouee' || st === 'debloquee' ? classProgressHtml(profile, c.id) : ''}
        <div class="bas-fiche">${note ? `<p class="note">${note}</p>` : ''}${button}</div>
      </aside>
    </div>
    ${first && ui.startConfirm && CLASS_BY_ID[ui.startConfirm] ? confirmStartClassHtml(CLASS_BY_ID[ui.startConfirm]) : ''}
  </div>`;
}

/** Premier lancement : confirmer la classe de départ (le choix est définitif) et dire comment viennent les autres. */
function confirmStartClassHtml(c: (typeof CLASSES)[number]): string {
  return `<div class="overlay"><div class="ecran confirmation-depart" style="gap:12px">
    <h2>Commencer avec le ${c.name} ?</h2>
    <p>Tu ne choisis qu'<b>une classe</b> au départ.</p>
    <p>La première fois qu'une de tes classes atteint le <b>niveau 2</b>, tu en débloques une 2<sup>e</sup> au choix ; au <b>niveau 3</b>, une 3<sup>e</sup>… jusqu'aux 9.</p>
    <div class="actions">
      <button type="button" class="gros-bouton" data-action="classe-depart" data-id="${c.id}">Choisir le ${c.name}</button>
      <button type="button" class="gros-bouton secondaire" data-action="classe-depart-annuler">Changer</button>
    </div>
  </div></div>`;
}

/** La classe jouée depuis le hall : celle choisie, si elle est débloquée, sinon la classe de départ. */
function activeClass(profile = loadProfile()): string {
  const id = profile.currentClass;
  if (id && profile.unlockedClasses.includes(id) && CLASS_BY_ID[id]?.playable) return id;
  return profile.startClass ?? 'guerrier';
}

/** La répartition de talents de la classe jouée, ramenée aux points disponibles. */
/** La progression du joueur avec une classe (fiche de l'écran des classes). */
function classProgressHtml(profile: ReturnType<typeof loadProfile>, cls: string): string {
  const lvl = classLevel(profile, cls);
  const pct = lvl.needed ? Math.round((lvl.into / lvl.needed) * 100) : 100;
  const used = pointsUsed(clampAlloc(profile.talents[cls] ?? emptyAlloc(cls), lvl.level, cls));
  const entry = profile.classes[cls];
  const unlocked = profile.difficulty?.[cls] ?? 0;
  const tag = (text: string, cls2 = '') => `<span class="type-talent ${cls2}">${text}</span>`;
  const tags = [
    tag(`Talents ${used}/${lvl.level}`),
    unlocked > 0 ? tag(`Meilleure victoire : difficulté ${unlocked - 1}`) : tag('Pas encore de victoire'),
    entry?.wins ? tag(`${entry.wins} victoire${entry.wins > 1 ? 's' : ''}`) : '',
    entry?.legendary && ITEMS[entry.legendary] ? tag(`Légendaire forgé : ${ITEMS[entry.legendary].name}`, 'r-legendaire') : '',
  ].join('');
  return `<div class="progression-classe"><span class="titre-rappel">Ta progression</span>
    <div class="ligne-niveau"><b>Niveau ${lvl.level}</b><div class="barre-xp petite"><div style="width:${pct}%"></div><span>${lvl.needed ? `${lvl.into} / ${lvl.needed} expérience` : 'Niveau maximum'}</span></div></div>
    <div class="etiquettes">${tags}</div></div>`;
}

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
        const state = picks[tier] === choice ? 'pris' : tier < picks.length ? 'ecarte' : tier === picks.length ? (left >= tierCost(tier) ? 'dispo' : '') : 'ferme';
        const chosen = sel?.tree === tree.id && sel.tier === tier && sel.choice === choice;
        return `<button type="button" class="noeud-talent k-${talentKind(d)} ${state} ${chosen ? 'choisi' : ''}" data-action="talent-voir" data-tree="${tree.id}" data-tier="${tier}" data-choice="${choice}">
          <span class="icone-talent"><img class="px" src="${A(talentIcon(d))}" alt="">${d.card ? `<span class="cout-palier">${EPIC_TIER_COST} pts</span>` : ''}</span><span class="nom-talent">${d.name}</span></button>`;
      }).join('');
      return `<div class="palier-icones">${tier ? `<span class="lien-palier ${tier <= picks.length ? 'ouvert' : ''}"></span>` : ''}${nodes}</div>`;
    }).join('');
    return `<section class="arbre-icones"><h3>${tree.name} <span>${treePoints(picks)}/${treePoints(['A', 'A', 'A', 'A', 'A'])} points</span></h3>${tiers}</section>`;
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
        <li>Un palier coûte 1 point, la carte épique ${EPIC_TIER_COST} : un arbre complet en coûte ${4 + EPIC_TIER_COST}, tu ne peux en finir qu'un seul.</li>
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
  const cost = tierCost(sel.tier);
  const chips = [`<span class="type-talent k-${kind}">${TALENT_KIND_LABEL[kind]}</span>`, `<span class="type-talent">${tree.name} · palier ${sel.tier + 1}</span>`, `<span class="type-talent${cost > 1 ? ' k-epique' : ''}">${cost} point${cost > 1 ? 's' : ''}</span>`];
  let body: string;
  if (d.card) {
    const c = CARDS[d.card];
    chips.push(`<span class="type-talent">${c.type} · ${c.cost} énergie${c.rageCost ? ` + ${c.rageCost === 'all' ? 'toute ta' : c.rageCost} rage` : ''}</span>`);
    body = `<p>${c.text(false)}</p><p class="ameliore">Améliorée : ${c.text(true)}</p><p class="note">Un exemplaire dans ton paquet de départ.</p>`;
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
    note = `Tu récupères ${cost} point${cost > 1 ? 's' : ''}.`;
  } else if (taken) {
    button = '<button type="button" class="gros-bouton" disabled>Talent pris</button>';
    note = `Pour le retirer, retire d'abord les paliers suivants de ${tree.name}.`;
  } else if (sel.tier < picks.length) {
    button = `<button type="button" class="gros-bouton" ${act}>Prendre à la place</button>`;
    note = `Remplace <b>${other.name}</b>, sans coûter de point.`;
  } else if (sel.tier === picks.length && left >= cost) {
    button = `<button type="button" class="gros-bouton" ${act}>Prendre · ${cost} point${cost > 1 ? 's' : ''}</button>`;
    note = other ? `Un seul talent par palier : l'autre choix est <b>${other.name}</b>.` : 'La carte épique de la spécialisation : un seul arbre peut aller jusque-là.';
  } else if (sel.tier === picks.length && left > 0) {
    button = `<button type="button" class="gros-bouton" disabled>Il te faut ${cost} points</button>`;
    note = `Il t'en reste ${left}. Retire des talents ailleurs pour finir cet arbre.`;
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
      <h1>Yzhar est vaincu !</h1>
      ${chestPanel(run)}
    </div>`;
  }
  return `<div class="ecran" style="gap:14px">
    <h1>${victory ? 'Yzhar est vaincu !' : 'Fin de l\'expédition'}</h1>
    <p>${victory ? `Bravo : tu as traversé les Profondeurs Ardentes, l'Aire de Vhaeryx et Irem avec ${run.hp} PV et ${(run.maxWipes ?? MAX_WIPES) - run.wipesLeft} chute${(run.maxWipes ?? MAX_WIPES) - run.wipesLeft > 1 ? 's' : ''}${run.difficulty ? `, en difficulté ${run.difficulty}` : ''}.` : `${actDef(run.act).name} ${run.act === 1 ? 'ont' : 'a'} eu raison de toi. La guilde enverra un autre champion.`}</p>
    ${run.summary ? summaryHtml(run.summary, run.classId) : ''}
    ${victory ? chestPanel(run) : run.heirloom ? `<p class="mention-brise">${ITEMS[run.heirloom].name}, emporté du coffre de la guilde, est perdu.</p>` : ''}
    <div class="actions"><button type="button" class="gros-bouton" data-action="titre">Retour au hall de la guilde</button></div>
  </div>`;
}

// ---------- Comptes en ligne (src/cloud.ts) ----------

/** Fenêtre de connexion (maquette B) : deux onglets, pseudo et mot de passe. */
function loginHtml(): string {
  const l = ui.login ?? { tab: 'connexion', pseudo: '', error: null, busy: false };
  const creation = l.tab === 'creation';
  return `<div class="overlay fenetre-centree" data-action="fermer-fond"><form class="boite-connexion" data-form="connexion" novalidate>
    <div class="onglets-connexion" role="tablist">
      <button type="button" role="tab" class="${creation ? '' : 'actif'}" aria-selected="${!creation}" data-action="connexion-onglet" data-tab="connexion">Se connecter</button>
      <button type="button" role="tab" class="${creation ? 'actif' : ''}" aria-selected="${creation}" data-action="connexion-onglet" data-tab="creation">Créer un compte</button>
    </div>
    <label class="champ">Pseudo<input name="pseudo" autocomplete="username" autocapitalize="off" spellcheck="false" maxlength="${PSEUDO_MAX}" value="${esc(l.pseudo)}" ${l.busy ? 'disabled' : ''}></label>
    <label class="champ">Mot de passe<input name="mdp" type="password" autocomplete="${creation ? 'new-password' : 'current-password'}" ${l.busy ? 'disabled' : ''}></label>
    ${creation ? `<p class="aide-connexion">Pseudo : ${PSEUDO_MIN} à ${PSEUDO_MAX} lettres ou chiffres. Mot de passe : ${PASSWORD_MIN} caractères au moins. Retiens-le bien : il n'y a pas de récupération automatique.</p>` : ''}
    ${l.error ? `<p class="erreur-connexion" role="alert">${esc(l.error)}</p>` : ''}
    <button type="submit" class="gros-bouton" ${l.busy ? 'disabled' : ''}>${l.busy ? 'Un instant…' : creation ? 'Créer mon compte' : 'Entrer dans la guilde'}</button>
    ${creation ? '' : '<p class="aide-connexion">Mot de passe oublié ? Écris à l\'organisateur.</p>'}
    <p class="aide-connexion">Ta progression est gardée en ligne : tu la retrouves sur n'importe quel appareil.</p>
  </form></div>`;
}

/** Le menu de la roue ⚙ du hall. */
function gearMenuHtml(): string {
  const items: string[] = [];
  if (cloud.user) {
    const n = newsUnread();
    const m = messagesUnread();
    items.push(`<button type="button" data-action="ouvrir-news"><span>📰 Quoi de neuf ?<small>${n > 0 ? `${n} nouveauté${n > 1 ? 's' : ''}` : 'Les dernières nouvelles du jeu'}</small></span>${n > 0 ? `<span class="mini-pastille">${n}</span>` : ''}</button>`);
    items.push(`<button type="button" data-action="ouvrir-messages"><span>💡 Bugs, idées, messages<small>${m > 0 ? 'Du nouveau sur tes messages' : 'Écris à l\'organisateur'}</small></span>${m > 0 ? `<span class="mini-pastille">${m}</span>` : ''}</button>`);
  }
  if (canFullscreen()) items.push(`<button type="button" data-action="plein-ecran"><span>⛶ ${document.fullscreenElement ? 'Quitter le plein écran' : 'Plein écran'}</span></button>`);
  if (cloud.user) items.push(`<button type="button" data-action="deconnexion"><span>👤 Mon compte<small>${esc(cloud.user.pseudo)} · se déconnecter</small></span></button>`);
  else items.push('<p class="menu-roue-note">Sauvegarde sur cet appareil seulement.</p>');
  return `<div class="overlay transparent" data-action="fermer-fond"><div class="menu-roue" role="menu">${items.join('')}</div></div>`;
}

const VERSION_TEXT = versionLabel(siteOf(location.pathname, location.hostname));

/** Garde le texte tapé avant de redessiner la fenêtre. */
function keepMessageText(): void {
  const t = stage.querySelector<HTMLTextAreaElement>('textarea[name="texte"]');
  if (t && ui.msg) ui.msg = { ...ui.msg, texte: t.value };
}

/** Marque les messages comme vus, en gardant la mise en avant le temps de la visite. */
function markMessagesSeenLater(): void {
  ui.msgFresh = new Set(cloud.messages.filter((m) => !m.vu).map((m) => m.id));
  markMessagesSeen();
}

/** Le total sur la roue : news pas lues et messages avec du nouveau. */
function gearCount(): number {
  return cloud.user ? newsUnread() + messagesUnread() : 0;
}

/** « Quoi de neuf ? » (maquette A) : les news, la plus récente en premier. */
function newsHtml(): string {
  const list = shownNews();
  const fmt = (d: string) => d.split('-').reverse().join('/');
  const items = list.length
    ? list.map((n) => `<div class="news ${ui.newsBefore !== undefined && n.id > ui.newsBefore ? 'nouv' : ''}"><small>${fmt(n.date)}</small>${ui.newsBefore !== undefined && n.id > ui.newsBefore ? '<span class="tag-nouveau">Nouveau</span>' : ''}<ul>${n.items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul></div>`).join('')
    : '<p class="aide-connexion">Pas encore de nouvelles. Reviens bientôt !</p>';
  return `<div class="overlay fenetre-centree" data-action="fermer-fond"><div class="boite-connexion fenetre-large">
    <h2>📰 Quoi de neuf ?</h2>${items}
    <button type="button" class="gros-bouton secondaire" data-action="fermer">Fermer</button>
  </div></div>`;
}

/** Bugs, idées, messages (maquette A) : un onglet pour écrire, un pour relire ses messages et les réponses. */
function messagesHtml(): string {
  const m = ui.msg ?? { tab: 'ecrire', type: 'bug', texte: '', error: null, busy: false, sent: false };
  const unread = messagesUnread();
  const tabs = `<div class="onglets-connexion" role="tablist">
      <button type="button" role="tab" class="${m.tab === 'ecrire' ? 'actif' : ''}" data-action="msg-onglet" data-tab="ecrire">✍ Écrire</button>
      <button type="button" role="tab" class="${m.tab === 'liste' ? 'actif' : ''}" data-action="msg-onglet" data-tab="liste">📬 Mes messages${unread > 0 ? ` · ${unread}` : ''}</button>
    </div>`;
  let body: string;
  if (m.tab === 'liste') {
    body = cloud.messages.length ? cloud.messages.map((x) => `<div class="msg ${ui.msgFresh?.has(x.id) ? 'nouv' : ''}">
        <div class="msg-entete"><span>${MESSAGE_TYPES[x.type]} · ${new Date(x.dateMs).toLocaleDateString('fr-FR')}</span><span class="etat etat-${x.etat}">${MESSAGE_STATES[x.etat]}</span></div>
        <p>${esc(x.texte)}</p>${x.reponse ? `<div class="reponse"><b>Réponse :</b> ${esc(x.reponse)}</div>` : ''}
      </div>`).join('') : '<p class="aide-connexion">Tu n\'as encore rien envoyé.</p>';
  } else if (m.sent) {
    body = '<p class="envoye">Merci, c\'est envoyé ! Tu verras ici quand l\'organisateur l\'aura lu ou t\'aura répondu.</p><button type="button" class="gros-bouton secondaire" data-action="msg-nouveau">Écrire un autre message</button>';
  } else {
    const ctx = ui.run ? `l'écran en cours (${ui.run.screen}) et une copie de ta partie pour retrouver le bug` : 'l\'écran en cours (hall)';
    body = `<div class="types-message">${(Object.keys(MESSAGE_TYPES) as MessageType[]).map((t) => `<button type="button" class="${m.type === t ? 'actif' : ''}" data-action="msg-type" data-type="${t}">${MESSAGE_TYPES[t]}</button>`).join('')}</div>
      <textarea name="texte" maxlength="${MESSAGE_MAX}" placeholder="${m.type === 'bug' ? 'Que s\'est-il passé ? Qu\'est-ce que tu faisais ?' : m.type === 'idee' ? 'Ton idée pour le jeu…' : 'Ton message…'}" ${m.busy ? 'disabled' : ''}>${esc(m.texte)}</textarea>
      <div class="compteur-message"><span data-compteur>${m.texte.length}</span> / ${MESSAGE_MAX}</div>
      ${m.type === 'bug' ? `<p class="aide-connexion">Joint automatiquement : la version (${VERSION_TEXT}), ton appareil, ${ctx}.</p>` : ''}
      ${m.error ? `<p class="erreur-connexion" role="alert">${esc(m.error)}</p>` : ''}
      <button type="button" class="gros-bouton" data-action="msg-envoyer" ${m.busy ? 'disabled' : ''}>${m.busy ? 'Envoi…' : 'Envoyer'}</button>`;
  }
  return `<div class="overlay fenetre-centree" data-action="fermer-fond"><div class="boite-connexion fenetre-large">${tabs}${body}
    <button type="button" class="lien-fermer" data-action="fermer">Fermer</button></div></div>`;
}

/** Un message de l'organisateur ou du jeu (compte bloqué, progression remise à zéro). */
function noticeHtml(): string {
  return `<div class="overlay fenetre-centree"><div class="boite-connexion"><p>${esc(cloud.notice ?? '')}</p>
    <button type="button" class="gros-bouton" data-action="avis-ok">Compris</button></div></div>`;
}

/** Une nouvelle saison a remis la sauvegarde à zéro. */
function seasonHtml(): string {
  return `<div class="overlay fenetre-centree"><div class="boite-connexion">
    <h2>Nouvelle saison !</h2>
    <p>Le jeu a beaucoup changé depuis ta dernière visite : ta progression repart de zéro pour la saison ${cloud.newSeason ?? ''}. Merci de tester à nouveau !</p>
    <button type="button" class="gros-bouton" data-action="saison-ok">En route</button>
  </div></div>`;
}

/** Firebase a changé d'état (connexion retrouvée, synchronisation faite, déconnexion). */
function cloudChanged(): void {
  if (cloud.user && ui.overlay === 'connexion') {
    ui.overlay = null;
    ui.login = undefined; // la prochaine fois (après une déconnexion), on rouvre sur « Se connecter »
    // Le joueur venait de toucher « Commencer » : un nouveau compte part au choix de la classe.
    if (!loadProfile().startClass) ui.classScreen = true;
  }
  if (cloud.user && cloud.newSeason !== null) { ui.overlay = 'saison'; ui.run = null; ui.classScreen = false; }
  if (!cloud.user && cloud.enabled) ui.run = null;
  if (cloud.notice && ui.overlay !== 'saison') { ui.overlay = 'avis'; ui.login = undefined; }
  render();
}

/** Envoi du formulaire de connexion (bouton ou touche Entrée). */
async function submitLogin(form: HTMLFormElement): Promise<void> {
  const l = ui.login ?? { tab: 'connexion', pseudo: '', error: null, busy: false };
  const pseudo = (form.elements.namedItem('pseudo') as HTMLInputElement).value;
  const mdp = (form.elements.namedItem('mdp') as HTMLInputElement).value;
  ui.login = { ...l, pseudo, error: null, busy: true };
  render();
  const error = l.tab === 'creation' ? await signUp(pseudo, mdp) : await signIn(pseudo, mdp);
  ui.login = { ...ui.login, error, busy: false };
  // En cas de succès, cloudChanged() ferme la fenêtre quand la sauvegarde est prête.
  if (error) render();
}

function overlayHtml(run: RunState | null): string {
  if (ui.overlay === 'connexion') return loginHtml();
  if (ui.overlay === 'roue') return gearMenuHtml();
  if (ui.overlay === 'saison') return seasonHtml();
  if (ui.overlay === 'news') return newsHtml();
  if (ui.overlay === 'messages') return messagesHtml();
  if (ui.overlay === 'avis') return noticeHtml();
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
    return itemGridOverlay(`Le coffre de la guilde · ${chest.length}/${CHEST_SIZE}`,
      'Après une expédition gagnée, tu y déposes un objet. Au début d\'une expédition, tu peux en emporter un.',
      [{ title: 'Objets', entries: chest.map((id, i) => ({ key: `${i}|${id}`, id, seen: true })) }]);
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
    // Trier et filtrer : par type (Attaque, Compétence…) et par coût ou par nom.
    const types = [...new Set(run.deck.map((card) => CARDS[card.id].type))];
    const shown = run.deck.filter((card) => !ui.deckType || CARDS[card.id].type === ui.deckType);
    const sort = ui.deckSort ?? 'deck';
    const sorted = sort === 'deck' ? shown : [...shown].sort((a, b) => sort === 'cout'
      ? CARDS[a.id].cost - CARDS[b.id].cost || CARDS[a.id].name.localeCompare(CARDS[b.id].name, 'fr')
      : CARDS[a.id].name.localeCompare(CARDS[b.id].name, 'fr'));
    const cards = deckList(sorted, (card) => cardHtml(card, { action: 'disabled' }));
    const count = (t: string) => run.deck.filter((card) => CARDS[card.id].type === t).length;
    const filters = [`<button type="button" class="${!ui.deckType ? 'actif' : ''}" data-action="deck-type" data-type="">Toutes · ${run.deck.length}</button>`,
      ...types.map((t) => `<button type="button" class="${ui.deckType === t ? 'actif' : ''}" data-action="deck-type" data-type="${t}">${t} · ${count(t)}</button>`)].join('');
    const sorts = ([['deck', 'Ordre du paquet'], ['cout', 'Coût'], ['nom', 'Nom']] as const)
      .map(([id, label]) => `<button type="button" class="${sort === id ? 'actif' : ''}" data-action="deck-tri" data-tri="${id}">${label}</button>`).join('');
    return `<div class="overlay"><div class="ecran" style="justify-content:flex-start;padding-top:28px;gap:10px">
      <h2>Ton paquet (${run.deck.length} cartes)</h2>
      <div class="filtres-deck"><div class="choix-filtre">${filters}</div><div class="choix-filtre">${sorts}</div></div>
      <div class="liste-deck">${cards || '<p><i>Aucune carte de ce type.</i></p>'}</div>
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
    const groups = elites.filter((n) => !seen.has(n.elite!) && seen.add(n.elite!)).map((n) => {
      const enc = ELITE_ENCOUNTERS[n.elite!];
      const floors = elites.filter((m) => m.elite === n.elite).map((m) => m.floor + 1).join(', ');
      // Les armes montrées dans la version de ta classe.
      const table = enc.loot ? [...new Set(LOOT_TABLES[enc.loot].map((id) => itemFor(id, run.classId)))] : [];
      return {
        title: `${enc.name} · étape${floors.includes(',') ? 's' : ''} ${floors}`,
        entries: table.map((id) => ({ key: `${enc.name}|${id}`, id, seen: profile.discoveredItems.includes(id) })),
        spell: true,
      };
    });
    return itemGridOverlay('Tables de butin', 'Les gardiens de cette carte, et ce qu\'ils peuvent faire tomber. Un objet reste caché tant que tu ne l\'as jamais obtenu.', groups);
  }
  if (ui.overlay === 'menu') {
    return `<div class="overlay"><div class="ecran">
      <h2>Menu</h2>
      <p>La partie est sauvegardée après chaque action : tu peux fermer le navigateur et revenir plus tard.</p>
      <div class="actions">
        <button type="button" class="gros-bouton" data-action="fermer">Reprendre</button>
        <button type="button" class="gros-bouton secondaire" data-action="titre">Retour au hall de la guilde</button>
        ${cloud.user ? '<button type="button" class="gros-bouton secondaire" data-action="ouvrir-messages">💡 Signaler un bug</button>' : ''}
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
        ${run.act < LAST_ACT && run.screen !== 'combat' ? `<button type="button" class="bouton" data-action="test-acte">Passer à l'acte ${run.act + 1}</button>` : ''}
      </div>
      ${run.screen === 'map' ? `<span class="butin-titre">Boss d'Irem (depuis la carte, sans changer d'acte)</span>
      <div class="test-boutons">${DEV_IREM_FIGHTS.map((e, i) => `<button type="button" class="bouton" data-action="test-irem" data-index="${i}">${e.name}</button>`).join('')}</div>` : ''}
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
    case 'test-irem': if (run && devFightIrem(run, Number(el.dataset.index))) ui.overlay = null; break;
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
    const hall = !ui.archivesScreen && !ui.classScreen && !ui.talentScreen;
    if (hall) refreshNews(); // au plus une lecture toutes les 10 minutes
    if (tutoActive()?.kind === 'combat' || (!hall && tutoActive())) tutoStop();
    // La visite du hall se lance toute seule la première fois qu'on y arrive (après le choix de la classe).
    if (hall && !ui.overlay && !tutoActive()) {
      const profile = loadProfile();
      if (profile.startClass && !profile.tuto?.hall) startHallTuto();
    }
    stage.innerHTML = (ui.archivesScreen ? archivesScreen() : ui.classScreen ? classScreen() : ui.talentScreen ? talentScreen() : titleScreen() + overlayHtml(null)) + (hall ? tutoHtml() : '');
    afterRender();
    placeTuto(stage);
    return;
  }
  stage.dataset.acte = String(run.act ?? 1);
  let html = '';
  switch (run.screen) {
    case 'act': html = actScreen(run); break;
    case 'map': html = mapScreen(run); break;
    case 'event': html = eventScreen(run); break;
    case 'companion': html = companionScreen(run); break;
    case 'blessing': html = blessingScreen(run); break;
    case 'shop': html = shopScreen(run); break;
    case 'combat': html = run.combat ? combatScreen(run, run.combat) : ''; break;
    case 'reward': html = rewardScreen(run); break;
    case 'campfire': html = campfireScreen(run); break;
    case 'wipe': html = wipeScreen(run); break;
    case 'victory': html = endScreen(run, true); break;
    case 'gameover': html = endScreen(run, false); break;
  }
  if (tutoActive() && (tutoActive()!.kind !== 'combat' || run.screen !== 'combat' || ui.overlay)) tutoStop();
  const tuto = run.screen === 'combat' && !ui.overlay ? tutoHtml() + miniHtml(loadProfile(), run.classId) : '';
  stage.innerHTML = html + overlayHtml(run) + tuto;
  verifierTenue();
  afterRender();
  placeTuto(stage);
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
      logRun(run, run.summary); // le journal de l'expédition, pour la page admin
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
  const legendary = ui.leaveLegendary ? null : rackLegendary(loadProfile(), cls);
  ui.run = newRun(undefined, heirloom, talentIds(myAlloc(), cls), chosenDifficulty(), cls, legendary);
  // Le Chasseur choisit d'abord son compagnon, puis Brégan propose ses bonus.
  offerCompanion(ui.run);
  ui.blessingRemove = false;
  ui.selection = null;
  ui.overlay = null;
  ui.campfireUpgrade = false;
  commit();
}

function onCard(index: number): void {
  const c = ui.run?.combat;
  if (!c) return;
  // Une carte grisée : on dit pourquoi.
  if (!canPlayCard(c, index)) {
    const el = stage.querySelector<HTMLElement>(`.main .carte[data-index="${index}"]`);
    if (el) explainCard(el);
    return;
  }
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

/** Les boutons du tutoriel : « ? », Suivant, Retour, Passer, Tout revoir. */
function onTuto(action: string): boolean {
  const profile = loadProfile();
  const run = ui.run;
  switch (action) {
    case 'tuto':
      ui.selection = null;
      if (run?.screen === 'combat') startCombatTuto(profile, run.classId);
      else if (!run) startHallTuto();
      break;
    case 'tuto-tout':
      if (run?.screen === 'combat') startCombatTuto(profile, run.classId, true);
      break;
    case 'tuto-suivant':
      if (tutoMove(1)) { tutoFinish(profile, true); saveProfile(profile); }
      break;
    case 'tuto-retour': tutoMove(-1); break;
    case 'tuto-passer': tutoFinish(profile, false); saveProfile(profile); break;
    default: return false;
  }
  render();
  return true;
}

function handleClick(ev: MouseEvent): void {
  if (busy) return;
  const el = (ev.target as HTMLElement).closest<HTMLElement>('[data-action]');
  if (!el || (el as HTMLButtonElement).disabled) return;
  const run = ui.run;
  const action = el.dataset.action;
  if (action && isDevBuild() && devAction(action, el)) return; // Outil de test
  // La mini-bulle du « ? » se ferme au premier toucher en combat.
  if (run?.screen === 'combat' && stage.querySelector('.tuto-mini')) {
    const profile = loadProfile();
    if (closeMini(profile, run.classId)) saveProfile(profile);
    stage.querySelector('.tuto-mini')?.remove();
  }
  if (action?.startsWith('tuto') && onTuto(action)) return;
  switch (action) {
    case 'connexion-onglet':
      ui.login = { tab: el.dataset.tab === 'creation' ? 'creation' : 'connexion', pseudo: (stage.querySelector<HTMLInputElement>('input[name="pseudo"]')?.value ?? ''), error: null, busy: false };
      render();
      return;
    case 'fermer-fond':
      // Toucher le fond sombre ferme la fenêtre (pas un clic dans la fenêtre elle-même).
      if (ev.target === el && !ui.login?.busy) { ui.overlay = null; render(); }
      return;
    case 'ouvrir-news':
      ui.newsBefore = newsLastRead();
      markNewsRead();
      ui.overlay = 'news';
      render();
      return;
    case 'ouvrir-messages':
      ui.msg = { tab: messagesUnread() > 0 ? 'liste' : 'ecrire', type: 'bug', texte: '', error: null, busy: false, sent: false };
      if (ui.msg.tab === 'liste') markMessagesSeenLater();
      ui.overlay = 'messages';
      render();
      return;
    case 'msg-onglet':
      keepMessageText();
      ui.msg = { ...ui.msg!, tab: el.dataset.tab === 'liste' ? 'liste' : 'ecrire', error: null };
      if (ui.msg.tab === 'liste') markMessagesSeenLater();
      render();
      return;
    case 'msg-type': keepMessageText(); ui.msg = { ...ui.msg!, type: el.dataset.type as MessageType }; render(); return;
    case 'msg-nouveau': ui.msg = { ...ui.msg!, texte: '', sent: false, error: null }; render(); return;
    case 'msg-envoyer': {
      keepMessageText();
      const m = ui.msg!;
      ui.msg = { ...m, busy: true, error: null };
      render();
      const screen = ui.run ? ui.run.screen : 'hall';
      void sendMessage(m.type, m.texte, screen, ui.run).then((error) => {
        ui.msg = { ...ui.msg!, busy: false, error, sent: !error, texte: error ? ui.msg!.texte : '' };
        render();
      });
      return;
    }
    case 'avis-ok': cloud.notice = null; ui.overlay = null; render(); return;
    case 'saison-ok':
      cloud.newSeason = null;
      ui.overlay = null;
      ui.classScreen = !loadProfile().startClass;
      render();
      return;
    case 'roue': ui.overlay = ui.overlay === 'roue' ? null : 'roue'; render(); return;
    case 'deconnexion':
      ui.overlay = null;
      ui.run = null;
      void signOut().then(render);
      return;
    case 'nouvelle': {
      if (cloud.enabled && !cloud.user) { ui.overlay = 'connexion'; ui.login ??= { tab: 'connexion', pseudo: '', error: null, busy: false }; render(); return; }
      if (!loadProfile().startClass) { ui.run = null; ui.overlay = null; ui.classScreen = true; render(); return; }
      const saved = localSave.load();
      const inProgress = saved && saved.screen !== 'gameover' && (saved.screen !== 'victory' || !saved.chestDone);
      // Depuis une run (menu) ou avec une run en cours : on revient au hall, ou on confirme l'abandon.
      if (ui.run && inProgress) { ui.run = null; ui.overlay = null; render(); return; }
      if (inProgress) { ui.run = null; ui.overlay = 'abandon'; render(); return; }
      launchFromHall();
      return;
    }
    case 'nouvelle-confirmee': {
      // L'expédition abandonnée laisse quand même son journal (cause « Abandon »).
      const old = localSave.load();
      if (old) logRun(old, undefined, true);
      ui.overlay = null;
      launchFromHall();
      return;
    }
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
    case 'ratelier': ui.leaveLegendary = !ui.leaveLegendary; render(); return;
    case 'voir-coffre': ui.overlay = 'coffre'; ui.itemSel = null; render(); return;
    case 'objet-voir': ui.itemSel = el.dataset.id ?? null; render(); return;
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
    case 'classe-depart-voir': ui.startConfirm = el.dataset.id!; render(); return;
    case 'classe-depart-annuler': ui.startConfirm = null; render(); return;
    case 'classe-depart': {
      ui.startConfirm = null;
      const profile = loadProfile();
      if (chooseStartClass(profile, el.dataset.id!)) saveProfile(profile);
      // Premier lancement : la classe choisie, on arrive au hall de la guilde (l'expédition se lance de là).
      ui.classScreen = false;
      ui.run = null;
      render();
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
    case 'deck-type': ui.deckType = el.dataset.type || null; render(); return;
    case 'deck-tri': ui.deckSort = el.dataset.tri as UiState['deckSort']; render(); return;
    case 'menu': ui.overlay = 'menu'; render(); return;
    case 'fermer': ui.overlay = null; render(); return;
    case 'equipement': ui.overlay = 'equipement'; ui.equipSel = null; render(); return;
    case 'equip-voir': ui.equipSel = el.dataset.id ?? null; render(); return;
    case 'loot': ui.overlay = 'loot'; ui.itemSel = null; render(); return;
    case 'pile': ui.overlay = 'pile'; ui.pileKind = el.dataset.pile as 'draw' | 'discard' | 'exhaust'; render(); return;
    case 'potion': ui.overlay = 'potion'; ui.potionSlot = Number(el.dataset.slot); render(); return;
    case 'plein-ecran': if (ui.overlay === 'roue') ui.overlay = null; void toggleFullscreen(); return;
  }
  if (!run) return;
  switch (action) {
    case 'carte': onCard(Number(el.dataset.index)); break;
    case 'sort': onSpell(Number(el.dataset.index)); break;
    case 'cible': onTarget(Number(el.dataset.uid)); break;
    case 'familier':
      if (run.combat && choosePet(run.combat, el.dataset.pet as 'diablotin' | 'rodeur')) commit();
      break;
    case 'forme':
      if (run.combat) changeForm(run.combat, el.dataset.form as FormId);
      ui.selection = null;
      commit();
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
    case 'carte-a-confirmer': ui.cardConfirm = Number(el.dataset.uid); render(); break;
    case 'annuler-confirmation': ui.cardConfirm = null; render(); break;
    case 'benediction-carte': chooseBlessing(run, 'allegement', Number(el.dataset.uid)); ui.blessingRemove = false; ui.cardConfirm = null; commit(); break;
    case 'benediction-retour': ui.blessingRemove = false; ui.cardConfirm = null; render(); break;
    case 'reforger': campfireReforge(run); commit(); break;
    case 'lier-fragments':
      if (run.classId === 'demoniste') { campfireBindStaff(run); commit(); } else { ui.bindStaff = true; render(); }
      break;
    case 'lier-baton': ui.bindStaff = false; ui.cardConfirm = null; campfireBindStaff(run, Number(el.dataset.uid)); commit(); break;
    case 'acte-suivant': startNextAct(run); commit(); break;
    case 'equinoxe': campfireEquinoxe(run); commit(); break;
    case 'aurore': campfireAurore(run); commit(); break;
    case 'corde': campfireCorde(run); commit(); break;
    case 'offrande': ui.bindStaff = false; campfireBindStaffDruid(run, el.dataset.slot as SlotKey); commit(); break;
    case 'compagnon': ui.companion = el.dataset.id as CompanionId; render(); break;
    case 'compagnon-partir': {
      const id = ui.companion ?? loadProfile().lastCompanion ?? 'loup';
      const profile = loadProfile();
      profile.lastCompanion = id;
      saveProfile(profile);
      ui.companion = null;
      chooseCompanion(run, id);
      commit();
      break;
    }
    case 'carte-boutique': ui.shopCard = Number(el.dataset.index); render(); break;
    case 'annuler-carte': ui.shopCard = null; render(); break;
    case 'acheter': buyCard(run, Number(el.dataset.index)); ui.shopCard = null; commit(); break;
    case 'service': ui.shopMode = el.dataset.service as 'remove' | 'upgrade'; render(); break;
    case 'service-carte':
      if (ui.shopMode === 'remove') buyRemoval(run, Number(el.dataset.uid));
      else if (ui.shopMode === 'upgrade') buyUpgrade(run, Number(el.dataset.uid));
      ui.shopMode = null;
      ui.upgradeUid = null;
      ui.cardConfirm = null;
      commit();
      break;
    case 'apercu-amelioration': ui.upgradeUid = Number(el.dataset.uid); render(); break;
    case 'annuler-amelioration': ui.upgradeUid = null; render(); break;
    case 'boutique-retour': ui.shopMode = null; ui.upgradeUid = null; ui.cardConfirm = null; render(); break;
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
    case 'feu-retour': ui.campfireUpgrade = false; ui.upgradeUid = null; ui.bindStaff = false; ui.cardConfirm = null; render(); break;
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
  ...Object.keys(ANIMES).map((file) => `anim_${file}`),
  ...[...Object.keys(ENEMIES), 'vhaeryx_dragon', 'yzhar_corps'].map((id) => `anim_ennemi_${id}.png`),
  ...['diablotin', 'rodeur', 'succube', 'molosse', 'seigneur', 'loup', 'ours', 'raptor'].map((id) => `familier_${id}.png`),
  'chasseur.png', 'chaman.png',
  ...Object.keys(CARDS).map((id) => `carte_${id}.png`),
  ...Object.keys(ENEMIES).map((id) => `ennemi_${id}.png`), 'ennemi_vhaeryx_dragon.png', 'ennemi_yzhar_corps.png',
  ...Object.values(RARITY_FRAME).flatMap((r) => [`cadre_${r}.png`, `cadre_${r}_rage.png`]),
];

export function mount(root: HTMLElement): void {
  for (const file of PRELOAD) new Image().src = A(file);
  stage = root;
  initFx(root);
  initAides(root, () => ui.run?.combat, () => (ui.selection?.kind === 'card' ? ui.selection.index : null));
  stage.addEventListener('click', handleClick);
  stage.addEventListener('input', (ev) => {
    const t = ev.target as HTMLElement;
    if (t instanceof HTMLTextAreaElement && t.name === 'texte') {
      const c = stage.querySelector('[data-compteur]');
      if (c) c.textContent = String(t.value.length);
    }
  });
  stage.addEventListener('submit', (ev) => {
    const form = ev.target as HTMLFormElement;
    if (form.dataset.form !== 'connexion') return;
    ev.preventDefault();
    if (!ui.login?.busy) void submitLogin(form);
  });
  initCloud(cloudChanged);
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
