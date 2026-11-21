// SONDE TEMPORAIRE : chaque arbre complet (7) avec chaque complément (3), par classe.
import { it } from 'vitest';
import { talentIds, emptyAlloc, treesFor, type TalentAlloc } from '../../src/engine/talents';
import { simulateRun } from './bot';
const RUNS = Number(process.env.RUNS ?? 150);
it('arbres', () => {
  const jobs: [string, string, string[]][] = [];
  for (const cls of (process.env.CLS ?? 'guerrier,mage,demoniste,pretre,paladin').split(',')) {
    const trees = treesFor(cls).map((t) => t.id);
    for (const x of trees) for (const y of trees) if (x !== y)
      jobs.push([cls, `${x} 7 + ${y} 3`, talentIds({ ...emptyAlloc(cls), [x]: Array(5).fill('A'), [y]: Array(3).fill('A') } as TalentAlloc, cls)]);
  }
  const [i, n] = (process.env.PART ?? '0/1').split('/').map(Number);
  console.log(jobs.filter((_, k) => k % n === i).map(([cls, name, tal]) => {
    let w = 0; for (let s = 1; s <= RUNS; s++) if (simulateRun(s * 104729, tal, 0, cls).victory) w++;
    return `${cls.padEnd(10)} | ${name.padEnd(36)} | ${Math.round(100 * w / RUNS)} %`;
  }).join('\n'));
}, 7_200_000);
