// Le numéro de version du jeu, affiché dans le hall. Indispensable pour les retours de bug
// et, plus tard, pour les statistiques (chaque run sera notée avec sa version).
// Les valeurs sont calculées à la construction par vite.config.ts.

declare const __APP_VERSION__: string;
declare const __BUILD_COMMIT__: string;
declare const __BUILD_DATE__: string;

export const VERSION = {
  /** Le numéro du package.json (ex. « 0.1.0 »). */
  number: __APP_VERSION__,
  /** Le code court du dernier commit (ex. « 1c9c433 »), « local » sans git. */
  commit: __BUILD_COMMIT__,
  /** La date du dernier commit, AAAA-MM-JJ (vide sans git). */
  date: __BUILD_DATE__,
};

export type Site = 'officiel' | 'playtest' | 'dev' | 'local';

/** Le site sur lequel tourne le jeu, d'après l'adresse. */
export function siteOf(pathname: string, hostname: string): Site {
  if (hostname === 'localhost' || hostname === '127.0.0.1') return 'local';
  if (pathname.includes('/playtest/')) return 'playtest';
  if (pathname.includes('/dev/')) return 'dev';
  return 'officiel';
}

/** Le texte affiché : « v0.1.0 · 23/11/2026 · 1c9c433 · playtest » (sans le site pour la version officielle). */
export function versionLabel(site: Site, v = VERSION): string {
  const [y, m, d] = v.date.split('-');
  const parts = [`v${v.number}`];
  if (y && m && d) parts.push(`${d}/${m}/${y}`);
  parts.push(v.commit);
  if (site !== 'officiel') parts.push(site);
  return parts.join(' · ');
}
