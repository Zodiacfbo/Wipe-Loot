// Sauvegarde de la run et du profil dans le navigateur (localStorage). C'est la sauvegarde principale :
// le jeu marche sans réseau. La copie en ligne (src/cloud.ts) est prévenue à chaque écriture
// par `onLocalSave`, et passe par exportLocal / importLocal / clearLocal.
import type { ArchiveProfile } from './archives';
import type { ProgressProfile } from './progression';
import { convertOldXp } from './xp';
import type { TalentAlloc } from './talents';
import type { CompanionId, RunState } from './types';
import { OLD_PALADIN_CARDS } from './cards_paladin';

// La clé dépend du chemin du site : la version officielle (/) et la version de test (/dev/)
// ont chacune leur sauvegarde.
const KEY = `wipe-and-loot:${import.meta.env.BASE_URL === './' ? location.pathname.replace(/[^/]*$/, '') : import.meta.env.BASE_URL}:run`;

/** Une clé de stockage propre à ce site (ex. « compte » pour le propriétaire de la sauvegarde). */
export function localKey(name: string): string {
  return KEY.replace(/:run$/, `:${name}`);
}

/** Met une ancienne sauvegarde au format actuel. Renvoie null si elle est trop ancienne. */
export function migrate(raw: unknown): RunState | null {
  const run = raw as Record<string, unknown>;
  if (!run || typeof run !== 'object') return null;
  if (run.version === 2) {
    run.gold = 99;
    run.rewardGold = 0;
    run.removals = 0;
    run.upgradesBought = 0;
    run.shop = null;
    run.version = 3;
  }
  if (run.version === 3) {
    run.equipment = { arme: null, amulette: null, bague1: null, bague2: null, bijou1: null, bijou2: null };
    run.pendingItem = null;
    if (run.shop) (run.shop as Record<string, unknown>).items = [];
    run.version = 4;
  }
  if (run.version === 4) {
    run.potions = [null, null, null];
    run.pendingPotion = null;
    if (run.shop) (run.shop as Record<string, unknown>).potions = [];
    if (run.entry) (run.entry as Record<string, unknown>).potions = [null, null, null];
    run.version = 5;
  }
  if (run.version === 5) {
    run.broken = [];
    run.version = 6;
  }
  if (run.version === 6) {
    run.heirloom = null;
    run.chestDone = false;
    run.chestDeposit = null;
    run.version = 7;
  }
  if (run.version === 7) {
    run.pendingAlt = null;
    run.version = 8;
  }
  if (run.version === 8) {
    run.spells = ['charge'];
    run.pendingSpell = null;
    run.version = 9;
  }
  if (run.version === 9) {
    run.pendingAlts = run.pendingAlt ? [run.pendingAlt] : [];
    delete run.pendingAlt;
    run.blessings = [];
    run.seenEvents = [];
    run.eventOutcome = null;
    run.sourcesQuest = null;
    run.brisemonts = null;
    run.questNote = null;
    run.weaponUpgrade = null;
    run.detour = false;
    if (run.eventId === 'source') run.eventId = 'source_chaude';
    run.version = 10;
  }
  if (run.version === 10) {
    run.act = 1;
    run.version = 11;
  }
  if (run.version === 11) {
    // Les cartes de profession ont été retirées du jeu.
    const keep = (cards: unknown) => (cards as { id: string }[]).filter((c) => c.id !== 'bandage_de_lin');
    run.deck = keep(run.deck);
    const entry = run.entry as Record<string, unknown> | null;
    if (entry) entry.deck = keep(entry.deck);
    const combat = run.combat as Record<string, unknown> | null;
    if (combat) for (const pile of ['draw', 'hand', 'discard', 'exhaust']) combat[pile] = keep(combat[pile]);
    run.version = 12;
  }
  if (run.version === 12) {
    run.stats = { combats: 0, elites: 0 };
    run.summary = null;
    run.version = 13;
  }
  if (run.version === 13) {
    run.talents = [];
    run.version = 14;
  }
  if (run.version === 14) {
    run.difficulty = 0;
    run.maxWipes = 3;
    run.version = 15;
  }
  if (run.version === 15) {
    run.kills = {};
    run.version = 16;
  }
  if (run.version === 16) {
    run.classId = 'guerrier';
    run.version = 17;
  }
  if (run.version === 17) {
    run.floorsDone = 0;
    run.bossStage = null;
    run.actBuffs = {};
    run.eggsLeft = false;
    run.stargazing = 0;
    run.veilleur = null;
    run.version = 18;
  }
  if (run.version === 18) {
    run.shards = 0;
    run.pet = 'diablotin';
    run.version = 19;
  }
  if (run.version === 19) {
    run.equinoxe = null;
    run.version = 20;
  }
  if (run.version === 20) {
    run.sillon = null;
    run.tenebres = false;
    run.version = 21;
  }
  if (run.version === 21) {
    run.aurore = null;
    run.version = 22;
  }
  if (run.version === 22) {
    run.runBuffs = {};
    run.gong = false;
    run.nextFolie = 0;
    run.version = 23;
  }
  if (run.version === 23) {
    // Le Chasseur : son compagnon et sa quête légendaire.
    run.companion = 'loup';
    run.corde = null;
    run.version = 24;
  }
  if (run.version === 24) {
    // Le Chaman : sa Réincarnation et sa quête légendaire.
    run.reincarnated = false;
    run.marteau = null;
    run.version = 25;
  }
  if (run.version === 25) {
    // Rentrer à la guilde après un seigneur.
    run.retreated = false;
    run.version = 26;
  }
  if (run.version === 26) {
    // Le journal des choix (commencé en cours d'expédition : vide).
    run.choix = [];
    run.version = 27;
  }
  if (run.version === 27) {
    // Chasseur (27 novembre 2026) : les Pièges se posent sur un ennemi. Ceux d'un combat en cours vont sur le premier ennemi.
    const c = run.combat as { traps?: unknown[]; enemies: { dead?: boolean; submerged?: number; traps?: unknown[] }[] } | null;
    if (c?.traps?.length) {
      const first = c.enemies.find((e) => !e.dead && !e.submerged);
      if (first) for (const t of c.traps as { id: string }[]) if (!(first.traps ??= []).some((o) => (o as { id: string }).id === t.id)) first.traps.push(t);
    }
    if (c) delete c.traps;
    run.version = 28;
  }
  if (run.version === 28) {
    if (run.classId === 'paladin') convertOldPaladin(run);
    run.version = 29;
  }
  return run.version === 29 ? (run as unknown as RunState) : null;
}

/** Les talents de l'ancien Paladin et ceux qui les remplacent (même arbre). */
const OLD_PALADIN_TALENTS: Record<string, string> = {
  sagesse_accrue: 'sagesse_jugement', pa_lumiere_benie: 'lumiere_infusee', devotion_accrue: 'jugement_croise',
  consecration_durable: 'ardent_defenseur', t_bouclier_croise: 't_gardien_rois', jugements_rapides: 'elan_sacre',
  sceaux_benis: 'jugement_aiguise', double_sceau: 'fin_ere', t_verdict_cieux: 't_courroux_vengeur',
};

/**
 * Refonte du Paladin (27 novembre 2026) : une expédition en cours avec l'ancien Paladin (Sceaux) est convertie.
 * Chaque ancienne carte devient sa plus proche cousine (amélioration gardée), les talents de la run suivent,
 * et un combat en cours passe à la Puissance sacrée.
 */
function convertOldPaladin(run: Record<string, unknown>): void {
  type Card = { id: string };
  const fix = (cards: unknown) => {
    if (Array.isArray(cards)) for (const card of cards as Card[]) if (card && OLD_PALADIN_CARDS[card.id]) card.id = OLD_PALADIN_CARDS[card.id];
  };
  fix(run.deck);
  fix((run.entry as { deck?: unknown } | null)?.deck);
  if (Array.isArray(run.rewardChoices)) run.rewardChoices = (run.rewardChoices as string[]).map((id) => OLD_PALADIN_CARDS[id] ?? id);
  const shop = run.shop as { cards?: Card[] } | null;
  if (shop?.cards) fix(shop.cards);
  if (Array.isArray(run.talents)) run.talents = (run.talents as string[]).map((id) => OLD_PALADIN_TALENTS[id] ?? id);
  const c = run.combat as Record<string, unknown> | null;
  if (c) {
    for (const pile of ['draw', 'hand', 'discard', 'exhaust']) fix(c[pile]);
    const aura = c.aura as { id?: string } | null | undefined;
    if (aura && typeof aura === 'object' && aura.id === 'devotion') (c.player as { robustesse: number }).robustesse -= (aura as { value?: number }).value ?? 0;
    c.aura = 'devotion';
    c.holy = 0;
    for (const k of ['seals', 'lastJudged', 'pavois', 'crusaderShield', 'healFree', 'illumUsed', 'ferventNext', 'ferventUsed', 'palHealed']) delete c[k];
    for (const e of (c.enemies ?? []) as { buffs?: { censure?: number } }[]) if (e.buffs) e.buffs.censure = 0;
  }
}

/** Prévenu à chaque écriture locale (run ou profil) : sert à la sauvegarde en ligne. */
type SaveListener = (what: 'run' | 'profil', run?: RunState | null) => void;
let saveListener: SaveListener | null = null;
export function onLocalSave(fn: SaveListener | null): void {
  saveListener = fn;
}

/** La sauvegarde locale brute (textes JSON), pour l'envoyer en ligne. */
export function exportLocal(): { profil: string | null; run: string | null } {
  try {
    return { profil: localStorage.getItem(PROFILE_KEY), run: localStorage.getItem(KEY) };
  } catch {
    return { profil: null, run: null };
  }
}

/** Remplace la sauvegarde locale par celle reçue en ligne (sans prévenir l'écouteur). */
export function importLocal(data: { profil: string | null; run: string | null }): void {
  try {
    if (data.profil) localStorage.setItem(PROFILE_KEY, data.profil);
    else localStorage.removeItem(PROFILE_KEY);
    if (data.run) localStorage.setItem(KEY, data.run);
    else localStorage.removeItem(KEY);
  } catch {
    // stockage indisponible
  }
}

/** Efface la run et le profil de cet appareil (déconnexion, nouvelle saison). */
export function clearLocal(): void {
  importLocal({ profil: null, run: null });
}

export interface SaveBackend {
  load(): RunState | null;
  save(run: RunState): void;
  clear(): void;
}

export const localSave: SaveBackend = {
  load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return null;
      const run = JSON.parse(raw) as RunState;
      return migrate(run);
    } catch {
      return null;
    }
  },
  save(run) {
    try {
      localStorage.setItem(KEY, JSON.stringify(run));
      saveListener?.('run', run);
    } catch {
      // Stockage indisponible (navigation privée, quota…) : la partie continue sans sauvegarde.
    }
  },
  clear() {
    try {
      localStorage.removeItem(KEY);
      saveListener?.('run', null);
    } catch {
      // rien à faire
    }
  },
};

// --- Profil du joueur (gardé d'une run à l'autre) ---

const PROFILE_KEY = KEY.replace(/:run$/, ':profil');

export interface Profile extends ProgressProfile, ArchiveProfile {
  version: 9;
  /** Refonte du Paladin (27 novembre 2026) : ses points de talent ont été rendus, un message le dit une fois. */
  paladinRework?: boolean;
  /** Le dernier niveau de difficulté choisi dans le hall. */
  lastDifficulty: number;
  /** La classe choisie au premier lancement, et les classes débloquées. */
  startClass: string | null;
  unlockedClasses: string[];
  /** La classe jouée depuis le hall (la classe de départ si absente). */
  currentClass?: string;
  /** Chasseur : le dernier compagnon choisi (proposé par défaut au départ). */
  lastCompanion?: CompanionId;
  /** La répartition des points de talent, par classe. */
  talents: Record<string, TalentAlloc>;
  /** Objets déjà obtenus au moins une fois : ils sont visibles dans les tables de loot. */
  discoveredItems: string[];
  /** Le coffre de la guilde (6 objets au plus). */
  guildChest: string[];
  /** Le tutoriel : visite du hall vue, classes dont le tuto du combat est fini (« Compris »), mini-bulles vues. */
  tuto?: { hall?: boolean; classes?: string[]; mini?: string[] };
}

export function loadProfile(): Profile {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (raw) {
      const p = JSON.parse(raw) as Record<string, unknown>;
      if (p.version === 1 && Array.isArray(p.discoveredItems)) {
        p.guildChest = [];
        p.version = 2;
      }
      if (p.version === 2) {
        p.classes = {};
        p.stats = { runs: 0, wins: 0 };
        p.version = 3;
      }
      if (p.version === 3) {
        p.talents = {};
        p.version = 4;
      }
      if (p.version === 4) {
        // Un joueur qui a déjà joué le Guerrier l'a de fait choisi comme classe de départ.
        const played = !!(p.classes as Record<string, unknown>).guerrier;
        p.startClass = played ? 'guerrier' : null;
        p.unlockedClasses = played ? ['guerrier'] : [];
        p.version = 5;
      }
      if (p.version === 5) {
        p.difficulty = {};
        p.lastDifficulty = 0;
        p.version = 6;
      }
      if (p.version === 6) {
        p.seenCards = [];
        p.seenEnemies = [];
        p.seenPotions = [];
        p.kills = {};
        p.version = 7;
      }
      if (p.version === 7) {
        // Nouvelle courbe d'expérience (24 novembre 2026) : chaque classe garde son niveau et son avancée.
        for (const c of Object.values((p.classes ?? {}) as Record<string, { xp: number }>)) c.xp = convertOldXp(c.xp ?? 0);
        p.version = 8;
      }
      if (p.version === 8) {
        // Refonte du Paladin (27 novembre 2026) : ses talents ont changé, ses points sont rendus.
        const talents = (p.talents ?? {}) as Record<string, Record<string, unknown[]>>;
        if (talents.paladin && Object.values(talents.paladin).some((picks) => picks.length > 0)) {
          delete talents.paladin;
          p.paladinRework = true;
        }
        p.version = 9;
      }
      if (p.version === 9 && Array.isArray(p.discoveredItems) && Array.isArray(p.guildChest)) return p as unknown as Profile;
    }
  } catch {
    // profil illisible : on repart d'un profil vide
  }
  return emptyProfile();
}

/** Un profil tout neuf (premier lancement). */
export function emptyProfile(): Profile {
  return { version: 9, discoveredItems: [], guildChest: [], classes: {}, stats: { runs: 0, wins: 0 }, talents: {}, startClass: null, unlockedClasses: [], difficulty: {}, lastDifficulty: 0, seenCards: [], seenEnemies: [], seenPotions: [], kills: {} };
}

export function saveProfile(profile: Profile): void {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    saveListener?.('profil');
  } catch {
    // stockage indisponible
  }
}
