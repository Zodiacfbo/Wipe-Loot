// Sauvegarde de la run. Pour l'instant dans le navigateur (localStorage) ;
// Firebase pourra remplacer ou compléter ce module plus tard sans toucher au reste.
import type { ArchiveProfile } from './archives';
import type { ProgressProfile } from './progression';
import type { TalentAlloc } from './talents';
import type { CompanionId, RunState } from './types';

// La clé dépend du chemin du site : la version officielle (/) et la version de test (/dev/)
// ont chacune leur sauvegarde.
const KEY = `wipe-and-loot:${import.meta.env.BASE_URL === './' ? location.pathname.replace(/[^/]*$/, '') : import.meta.env.BASE_URL}:run`;

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
  return run.version === 25 ? (run as unknown as RunState) : null;
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
    } catch {
      // Stockage indisponible (navigation privée, quota…) : la partie continue sans sauvegarde.
    }
  },
  clear() {
    try {
      localStorage.removeItem(KEY);
    } catch {
      // rien à faire
    }
  },
};

// --- Profil du joueur (gardé d'une run à l'autre) ---

const PROFILE_KEY = KEY.replace(/:run$/, ':profil');

export interface Profile extends ProgressProfile, ArchiveProfile {
  version: 7;
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
      if (p.version === 7 && Array.isArray(p.discoveredItems) && Array.isArray(p.guildChest)) return p as unknown as Profile;
    }
  } catch {
    // profil illisible : on repart d'un profil vide
  }
  return emptyProfile();
}

/** Un profil tout neuf (premier lancement). */
export function emptyProfile(): Profile {
  return { version: 7, discoveredItems: [], guildChest: [], classes: {}, stats: { runs: 0, wins: 0 }, talents: {}, startClass: null, unlockedClasses: [], difficulty: {}, lastDifficulty: 0, seenCards: [], seenEnemies: [], seenPotions: [], kills: {} };
}

export function saveProfile(profile: Profile): void {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch {
    // stockage indisponible
  }
}
