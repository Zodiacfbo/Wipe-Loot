// Mesure le poids de chaque talent, pris seul (avec juste ses paliers précédents).
import { it } from 'vitest';
import { emptyAlloc, talentIds, treesFor, type Choice } from '../../src/engine/talents';
import { simulateRun } from './bot';

const RUNS = Number(process.env.RUNS ?? 200);
// La classe mesurée (CLASSE=mage).
const CLS = process.env.CLASSE ?? 'guerrier';
const cache = new Map<string, number>();

function winRate(talents: string[]): number {
  const key = talents.join(',');
  if (cache.has(key)) return cache.get(key)!;
  let wins = 0;
  for (let seed = 1; seed <= RUNS; seed++) if (simulateRun(seed * 104729, talents, 0, CLS).victory) wins++;
  const rate = Math.round((100 * wins) / RUNS);
  cache.set(key, rate);
  return rate;
}

it('poids des talents', () => {
  const base = winRate([]);
  const out = [`Aucun talent : ${base} %`];
  for (const tree of treesFor(CLS)) {
    for (let tier = 0; tier < 5; tier++) {
      for (const choice of (tier < 4 ? ['A', 'B'] : ['A']) as Choice[]) {
        // Les paliers précédents avec le choix A, puis ce talent-ci.
        const a = emptyAlloc(CLS);
        a[tree.id] = [...Array(tier).fill('A'), choice] as Choice[];
        const prev = emptyAlloc(CLS);
        prev[tree.id] = Array(tier).fill('A') as Choice[];
        const gain = winRate(talentIds(a, CLS)) - winRate(talentIds(prev, CLS));
        out.push(`${tree.name} ${tier + 1}${choice} ${tree.tiers[tier][choice === 'A' ? 0 : 1].name.padEnd(24)} : ${gain >= 0 ? '+' : ''}${gain}`);
      }
    }
  }
  console.log(out.join('\n'));
}, 3600000);
