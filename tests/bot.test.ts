// Le bot d'équilibrage (tools/balance/bot.ts) doit savoir finir une run avec chacune des 9 classes,
// dans ses deux modes : sinon les mesures d'équilibrage ne veulent rien dire.
import { afterAll, describe, expect, it } from 'vitest';
import { CLASSES } from '../src/engine/classes';
import { setBotMode, simulateRun } from '../tools/balance/bot';

const playable = CLASSES.filter((c) => c.playable).map((c) => c.id);

describe('le bot d\'équilibrage', () => {
  afterAll(() => setBotMode('essai'));
  it('connaît les 9 classes', () => expect(playable).toHaveLength(9));
  for (const mode of ['simple', 'essai'] as const) {
    it.each(playable)(`finit une run (${mode}) : %s`, (cls) => {
      setBotMode(mode, 1);
      const r = simulateRun(3 * 104729, [], 0, cls);
      expect(r.ended).toBe(true);
      expect(r.floor).toBeGreaterThan(0);
    }, 60000);
  }
});
