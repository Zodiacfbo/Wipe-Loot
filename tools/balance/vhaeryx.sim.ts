// Les morts contre Vhaeryx : à quel tour, et combien de PV il lui restait.
import { it } from 'vitest';
import { emptyAlloc, talentIds } from '../../src/engine/talents';
import { simulateRun } from './bot';

const N10 = talentIds({ ...emptyAlloc(), protection: ['A', 'A', 'A', 'A', 'A'], fureur: ['A', 'B', 'A', 'B', 'A'] });

it('morts contre Vhaeryx', () => {
  const deaths: { enemyHp: number; turn: number; deck: number; maxHp: number }[] = [];
  let fights = 0;
  for (let seed = 1; seed <= Number(process.env.RUNS ?? 100); seed++) {
    const r = simulateRun(seed * 104729, N10);
    const v = r.fights.find((f) => f.kind === 'boss' && f.act === 2);
    if (!v) continue;
    fights++;
    if (v.deaths) deaths.push(...v.deaths);
  }
  const avg = (k: 'enemyHp' | 'turn' | 'deck' | 'maxHp') => (deaths.reduce((a, d) => a + d[k], 0) / Math.max(1, deaths.length)).toFixed(1);
  console.log(`combats ${fights} · morts ${deaths.length} · PV ennemis restants ${avg('enemyHp')} · tour ${avg('turn')} · deck ${avg('deck')} · PV max ${avg('maxHp')}`);
  const buckets = [0, 50, 100, 200, 300, 500].map((x, i, a) => `${x}-${a[i + 1] ?? '+'} : ${deaths.filter((d) => d.enemyHp >= x && d.enemyHp < (a[i + 1] ?? 9999)).length}`);
  console.log(buckets.join(' | '));
  console.log('tours : ' + [4, 8, 12, 16, 20, 99].map((x, i, a) => `≤${x} : ${deaths.filter((d) => d.turn <= x && d.turn > (a[i - 1] ?? 0)).length}`).join(' | '));
}, 1200000);
