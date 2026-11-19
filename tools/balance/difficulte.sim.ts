// Le taux de victoire du bot selon le niveau de difficulté, avec des personnages de niveau 10.
// Variables : RUNS (runs par case), NIVEAUX (ex. "0,5,10,15,20").
import { it } from 'vitest';
import { emptyAlloc, talentIds, type TalentAlloc } from '../../src/engine/talents';
import { simulateRun } from './bot';

const RUNS = Number(process.env.RUNS ?? 100);
const LEVELS = (process.env.NIVEAUX ?? '0,5,10,15,20').split(',').map(Number);
const alloc = (a: Partial<TalentAlloc>, cls = 'guerrier') => talentIds({ ...emptyAlloc(cls), ...a } as TalentAlloc, cls);
const PROFILES: [string, string[], string][] = [
  ['Guerrier Prot/Fur', alloc({ protection: ['A', 'A', 'A', 'A', 'A'], fureur: ['A', 'B', 'A', 'B', 'A'] }), 'guerrier'],
  ['Guerrier Armes/Fur', alloc({ armes: ['A', 'B', 'B', 'B', 'A'], fureur: ['A', 'B', 'A', 'B', 'A'] }), 'guerrier'],
  ['Mage Givre/Feu', alloc({ givre: ['A', 'A', 'A', 'A', 'A'], feu: ['A', 'B', 'A', 'A', 'A'] }, 'mage'), 'mage'],
  ['Mage Arcane/Feu', alloc({ arcane: ['A', 'A', 'A', 'A', 'A'], feu: ['A', 'B', 'A', 'A', 'A'] }, 'mage'), 'mage'],
];

it('difficulté', () => {
  const out: string[] = [`Difficulté | ${PROFILES.map((p) => p[0]).join(' | ')}   (victoire, et acte 2 atteint)`];
  for (const d of LEVELS) {
    const cells = PROFILES.map(([, t, cls]) => {
      let w = 0;
      let a2 = 0;
      for (let seed = 1; seed <= RUNS; seed++) {
        const r = simulateRun(seed * 104729, t, d, cls);
        if (r.victory) w++;
        if (r.floor > 10) a2++;
      }
      return `${Math.round((100 * w) / RUNS)} % (${Math.round((100 * a2) / RUNS)} %)`;
    });
    out.push(`${String(d).padStart(10)} | ${cells.join(' | ')}`);
  }
  console.log(out.join('\n'));
}, 3600000);
