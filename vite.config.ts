import { defineConfig } from 'vite';

// base relative : le jeu fonctionne aussi bien à la racine qu'en sous-dossier (GitHub Pages).
export default defineConfig({
  base: './',
  test: {
    include: ['tests/**/*.test.ts'],
  },
});
