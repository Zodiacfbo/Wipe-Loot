import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { defineConfig } from 'vite';

/** Une commande git, ou la valeur de secours si git n'est pas disponible. */
function git(cmd: string, fallback: string): string {
  try {
    return execSync(`git ${cmd}`, { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim() || fallback;
  } catch {
    return fallback;
  }
}

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf-8')) as { version: string };

// base relative : le jeu fonctionne aussi bien à la racine qu'en sous-dossier (GitHub Pages).
export default defineConfig({
  base: './',
  // Numéro de version, calculé à la construction (affiché dans le hall, voir src/version.ts).
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
    __BUILD_COMMIT__: JSON.stringify(git('rev-parse --short HEAD', 'local')),
    __BUILD_DATE__: JSON.stringify(git('log -1 --format=%cs', '')),
  },
  test: {
    include: ['tests/**/*.test.ts'],
  },
});
