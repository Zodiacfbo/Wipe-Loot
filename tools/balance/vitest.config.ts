import { defineConfig } from 'vite';

// Banc d'équilibrage (lent) : séparé des tests normaux.
export default defineConfig({
  test: {
    include: ['tools/balance/*.sim.ts'],
    root: '../..',
  },
});
