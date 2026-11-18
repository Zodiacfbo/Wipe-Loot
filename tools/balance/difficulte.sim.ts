// Le taux de victoire du bot selon le niveau de difficulté, au niveau 1 et au niveau 10.
import { it } from 'vitest';
import { emptyAlloc, talentIds } from '../../src/engine/talents';
import { simulateRun } from './bot';

const RUNS = Number(process.env.RUNS ?? 200);
const N10 = talentIds({ ...emptyAlloc(), protection: ['A', 'A', 'A', 'A', 'A'], fureur: ['A', 'B', 'A', 'B', 'A'] });
const N10B = talentIds({ ...emptyAlloc(), armes: ['A', 'B', 'B', 'B', 'A'], fureur: ['A', 'B', 'A', 'B', 'A'] });

it('difficulté', () => {
  const out: string[] = ['Difficulté | Niveau 1 | Niveau 10 (Prot/Fur) | Niveau 10 (Armes/Fur)'];
  for (const d of [0, 5, 10, 15, 20]) {
    const rate = (t: string[]) => {
      let w = 0;
      for (let seed = 1; seed <= RUNS; seed++) if (simulateRun(seed * 104729, t, d).victory) w++;
      return `${Math.round((100 * w) / RUNS)} %`;
    };
    out.push(`${String(d).padStart(10)} | ${rate([]).padStart(8)} | ${rate(N10).padStart(21)} | ${rate(N10B).padStart(22)}`);
  }
  console.log(out.join('\n'));
}, 900000);
