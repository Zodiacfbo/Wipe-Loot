// Sauvegarde de la run. Pour l'instant dans le navigateur (localStorage) ;
// Firebase pourra remplacer ou compléter ce module plus tard sans toucher au reste.
import type { RunState } from './types';

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
  return run.version === 9 ? (run as unknown as RunState) : null;
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

export interface Profile {
  version: 2;
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
      if (p.version === 2 && Array.isArray(p.discoveredItems) && Array.isArray(p.guildChest)) return p as unknown as Profile;
    }
  } catch {
    // profil illisible : on repart d'un profil vide
  }
  return { version: 2, discoveredItems: [], guildChest: [] };
}

export function saveProfile(profile: Profile): void {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch {
    // stockage indisponible
  }
}
