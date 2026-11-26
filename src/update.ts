// Prévenir le joueur qu'une nouvelle version du jeu est en ligne.
// La construction écrit version.json (le commit) à côté du jeu (vite.config.ts) ; le jeu le relit
// en revenant au hall, en revenant dans l'application et toutes les 10 minutes. Si le commit a changé,
// le hall propose de recharger (fenêtre « Nouvelle version », jamais pendant une expédition).
import { VERSION } from './version';

/** Une vérification au plus toutes les minutes. */
const MIN_GAP_MS = 60 * 1000;
/** Vérification régulière, même sans rien toucher. */
export const CHECK_EVERY_MS = 10 * 60 * 1000;

export const update = { available: false, lastCheck: 0 };

/** Le commit en ligne diffère-t-il de celui qui tourne ? (« local » : jamais, pour le jeu en local et les tests.) */
export function isNewer(onlineCommit: unknown, current = VERSION.commit): boolean {
  return current !== 'local' && typeof onlineCommit === 'string' && onlineCommit !== '' && onlineCommit !== current;
}

/** Relit version.json ; appelle `changed` la première fois qu'une nouvelle version est trouvée. */
export async function checkUpdate(changed: () => void, now = Date.now()): Promise<void> {
  if (update.available || VERSION.commit === 'local' || now - update.lastCheck < MIN_GAP_MS) return;
  update.lastCheck = now;
  try {
    const res = await fetch(`./version.json?t=${now}`, { cache: 'no-store' });
    if (!res.ok) return;
    const data = (await res.json()) as { commit?: unknown };
    if (isNewer(data.commit)) {
      update.available = true;
      changed();
    }
  } catch {
    // Pas de réseau : on réessaiera plus tard.
  }
}
