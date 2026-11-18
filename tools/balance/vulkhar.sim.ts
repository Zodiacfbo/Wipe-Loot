import { it } from 'vitest';
import { simulateRun } from './bot';

it('morts contre Vulkhar au niveau 1', () => {
  const deaths: { enemyHp: number; turn: number; deck: number; maxHp: number }[] = [];
  let hpIn = 0, n = 0;
  for (let seed = 1; seed <= 200; seed++) {
    const r = simulateRun(seed * 104729, []);
    const v = r.fights.find((f) => f.kind === 'boss');
    if (v?.deaths) deaths.push(...v.deaths);
    if (v) { hpIn += v.hpLost; n++; }
  }
  const avg = (k: 'enemyHp' | 'turn' | 'deck' | 'maxHp') => (deaths.reduce((a, d) => a + d[k], 0) / deaths.length).toFixed(1);
  console.log(`morts : ${deaths.length} · PV ennemis restants ${avg('enemyHp')} · tour ${avg('turn')} · deck ${avg('deck')} cartes · PV max ${avg('maxHp')}`);
  const buckets = [0, 50, 100, 150, 200, 300].map((x, i, a) => `${x}-${a[i + 1] ?? '+'} : ${deaths.filter((d) => d.enemyHp >= x && d.enemyHp < (a[i + 1] ?? 9999)).length}`);
  console.log(buckets.join(' | '));
});
