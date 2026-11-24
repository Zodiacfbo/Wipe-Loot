// Outil de test (version dev seulement) : à retirer avec src/engine/devtools.ts.
import { describe, expect, it } from 'vitest';
import { devGold, devHeal, devNextAct, devResetClass, devSetLevel, devUnlockClasses, devUnlockDifficulties, devWinCombat, xpForLevel } from '../src/engine/devtools';
import { emptyProfile } from '../src/engine/save';
import { classLevel } from '../src/engine/progression';
import { CLASSES } from '../src/engine/classes';
import { createCombat } from '../src/engine/combat';
import { afterCombatAction, newRun } from '../src/engine/run';

describe('l\'outil de test', () => {
  it('met une classe au niveau voulu, et retire les talents en trop', () => {
    const p = emptyProfile();
    devSetLevel(p, 'paladin', 10);
    expect(classLevel(p, 'paladin').level).toBe(10);
    expect(xpForLevel(10)).toBe(26700);
    p.talents.paladin = { sacre_pal: ['A', 'A', 'A', 'A', 'A'], protection_pal: ['A', 'A'], vindicte: [] };
    devSetLevel(p, 'paladin', 3);
    expect(classLevel(p, 'paladin').level).toBe(3);
    expect(Object.values(p.talents.paladin).flat()).toHaveLength(3);
  });

  it('remet une classe à zéro, débloque les classes et les difficultés', () => {
    const p = emptyProfile();
    devSetLevel(p, 'mage', 7);
    devUnlockDifficulties(p, 'mage');
    expect(p.difficulty!.mage).toBe(20);
    devResetClass(p, 'mage');
    expect(classLevel(p, 'mage').level).toBe(1);
    expect(p.difficulty!.mage).toBe(0);
    devUnlockClasses(p);
    expect(p.startClass).not.toBeNull();
    expect(p.unlockedClasses.sort()).toEqual(CLASSES.filter((c) => c.playable).map((c) => c.id).sort());
  });

  it('pendant une run : or, PV, combat gagné, acte suivant', () => {
    const run = newRun(1, null, [], 0, 'paladin');
    run.hp = 10;
    devGold(run);
    devHeal(run);
    expect(run.gold).toBe(599);
    expect(run.hp).toBe(run.maxHp);
    run.encounter = { kind: 'combat', name: 'Test', enemies: ['lieutenant'] };
    run.position = run.map.nodes.find((n) => n.floor === 0)!.id;
    run.combat = createCombat(run.encounter, run.deck, run.hp, run.maxHp, 1, 500, {}, run.spells, undefined, 'paladin');
    run.screen = 'combat';
    expect(devNextAct(run)).toBe(false);
    expect(devWinCombat(run)).toBe(true);
    afterCombatAction(run);
    expect(run.screen).toBe('reward');
    expect(devNextAct(run)).toBe(true);
    expect(run.act).toBe(2);
    expect(run.screen).toBe('map');
  });
});
