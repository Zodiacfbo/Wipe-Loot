import { describe, expect, it } from 'vitest';
// @ts-expect-error : module JavaScript de l'outil d'export
import { buildExport } from '../tools/export/anonymise.mjs';

describe('export pour analyse', () => {
  it('remplace pseudos et identifiants par « Joueur N », de façon stable', () => {
    const out = buildExport({
      site: 'playtest', days: 7, now: 1000,
      runs: [
        { uid: 'b', pseudo: 'Bob', finMs: 20, classe: 'mage' },
        { uid: 'a', pseudo: 'Alice', finMs: 10, classe: 'guerrier' },
        { uid: 'b', pseudo: 'Bob', finMs: 30, classe: 'mage' },
      ],
      players: [{ uid: 'a', pseudo: 'Alice', profil: JSON.stringify({ classes: { guerrier: { xp: 600 } }, stats: { runs: 1, wins: 0 }, guildChest: ['x'] }) }, { uid: 'c', pseudo: 'Cid', profil: 'pas du json' }],
    });
    expect(out.runs.map((r: { joueur: string }) => r.joueur)).toEqual(['Joueur 1', 'Joueur 2', 'Joueur 2']);
    expect(JSON.stringify(out)).not.toMatch(/Alice|Bob|Cid|"uid"|pseudo/);
    expect(out.joueurs[0]).toMatchObject({ joueur: 'Joueur 1', classes: { guerrier: { xp: 600 } }, coffre: ['x'] });
    expect(out.joueurs[1]).toMatchObject({ joueur: 'Joueur 3', classes: {} });
  });
});
