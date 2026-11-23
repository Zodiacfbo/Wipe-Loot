import { describe, expect, it } from 'vitest';
import { newRun } from '../src/engine/run';
import { runJournal } from '../src/journal';

describe('journal d\'une expédition', () => {
  it('résume la run pour la page admin, avec la version', () => {
    const run = newRun(42, null, [], 0, 'mage');
    run.screen = 'gameover';
    run.encounter = { kind: 'combat', name: 'Krâgg', enemies: ['kragg', 'kragg'] };
    run.deck[0].upgraded = true;
    const j = runJournal(run, undefined, { uid: 'u1', pseudo: 'Aldric' }, 'abc1234', 1000, 1000 + 25 * 60000);
    expect(j).toMatchObject({ uid: 'u1', classe: 'mage', victoire: false, cause: 'Krâgg', causeEnnemis: ['kragg'], version: 'abc1234', dureeMin: 25, chapitre: 1 });
    expect(j.paquet[0].endsWith('+')).toBe(true);
    expect(runJournal(run, undefined, { uid: 'u1', pseudo: 'A' }, 'x', null).dureeMin).toBeNull();
  });
});

describe('journal d\'une expédition abandonnée', () => {
  it('note « Abandon », jamais une victoire', () => {
    const run = newRun(7, null, [], 0, 'guerrier');
    const j = runJournal(run, undefined, { uid: 'u1', pseudo: 'A' }, 'v', null, Date.now(), true);
    expect(j).toMatchObject({ victoire: false, cause: 'Abandon', causeEnnemis: [] });
  });
});
