import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

/** Une commande git, ou la valeur de secours si git n'est pas disponible. */
function git(cmd: string, fallback: string): string {
  try {
    return execSync(`git ${cmd}`, { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim() || fallback;
  } catch {
    return fallback;
  }
}

const commit = git('rev-parse --short HEAD', 'local');

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf-8')) as { version: string };

// base relative : le jeu fonctionne aussi bien à la racine qu'en sous-dossier (GitHub Pages).
export default defineConfig({
  base: './',
  // Numéro de version, calculé à la construction (affiché dans le hall, voir src/version.ts).
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
    __BUILD_COMMIT__: JSON.stringify(commit),
    __BUILD_DATE__: JSON.stringify(git('log -1 --format=%cs', '')),
  },
  // version.json : le commit de cette construction, relu par le jeu pour proposer la nouvelle version (src/update.ts).
  plugins: [{
    name: 'version-json',
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'version.json', source: JSON.stringify({ commit }) });
    },
  }],
  // Deux pages : le jeu et la page admin (/admin/, réservée à l'organisateur).
  build: {
    rollupOptions: {
      input: { jeu: fileURLToPath(new URL('./index.html', import.meta.url)), admin: fileURLToPath(new URL('./admin/index.html', import.meta.url)) },
    },
  },
  test: {
    include: ['tests/**/*.test.ts'],
  },
});
