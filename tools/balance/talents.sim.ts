// Mesure le poids de chaque talent, pris seul (avec juste ses paliers précédents).
import { it } from 'vitest';
import { TREES, emptyAlloc, talentIds, type Choice } from '../../src/engine/talents';
import { simulateRun } from './bot';

const RUNS = Number(process.env.RUNS ?? 200);

function winRate(talents: string[]): number {
  let wins = 0;
  for (let seed = 1; seed <= RUNS; seed++) if (simulateRun(seed * 104729, talents).victory) wins++;
  return Math.round((100 * wins) / RUNS);
}

it('poids des talents', () => {
  const base = winRate([]);
  const out = [`Aucun talent : ${base} %`];
  for (const tree of TREES) {
    for (let tier = 0; tier < 5; tier++) {
      for (const choice of (tier < 4 ? ['A', 'B'] : ['A']) as Choice[]) {
        // Les paliers précédents avec le choix A, puis ce talent-ci.
        const a = emptyAlloc();
        a[tree.id] = [...Array(tier).fill('A'), choice] as Choice[];
        const prev = emptyAlloc();
        prev[tree.id] = Array(tier).fill('A') as Choice[];
        const gain = winRate(talentIds(a)) - winRate(talentIds(prev));
        out.push(`${tree.name} ${tier + 1}${choice} ${tree.tiers[tier][choice === 'A' ? 0 : 1].name.padEnd(24)} : ${gain >= 0 ? '+' : ''}${gain}`);
      }
    }
  }
  console.log(out.join('\n'));
}, 900000);
