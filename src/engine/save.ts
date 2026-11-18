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
  return run.version === 3 ? (run as unknown as RunState) : null;
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
