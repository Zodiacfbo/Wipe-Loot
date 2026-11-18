import { describe, expect, it } from 'vitest';
import { createCombat } from '../src/engine/combat';
import { DIFFICULTY_TEXT, MAX_DIFFICULTY, difficultyMods } from '../src/engine/difficulty';
import { BOSS_ENCOUNTER, ELITE_ENCOUNTERS } from '../src/engine/enemies';
import { awardRun } from '../src/engine/progression';
import { campfireHealAmount, newRun, repairBill } from '../src/engine/run';

const deck = Array.from({ length: 10 }, (_, i) => ({ uid: i + 1, id: 'parade', upgraded: false }));

describe('les niveaux de difficulté', () => {
  it('21 niveaux (0 à 20), et les contraintes s\'additionnent', () => {
    expect(DIFFICULTY_TEXT).toHaveLength(MAX_DIFFICULTY + 1);
    expect(difficultyMods(0).wipes).toBe(3);
    expect(difficultyMods(7).wipes).toBe(2);
    expect(difficultyMods(12).wipes).toBe(1);
    expect(difficultyMods(20).wipes).toBe(0);
    expect(difficultyMods(20).normalHp).toBe(1.1); // la contrainte du niveau 2 reste
  });

  it('la run : PV de départ, Malédiction, wipes, feu de camp, factures', () => {
    const run = newRun(5, null, [], 14);
    expect(run.hp).toBe(64); // 80 %
    expect(run.deck.some((c) => c.id === 'malediction')).toBe(true);
    expect(run.wipesLeft).toBe(1);
    expect(campfireHealAmount({ ...run, hp: 10 })).toBe(20); // 25 % de 80
    expect(repairBill(run)).toBe(75); // 50 × 1,5
  });

  it('plus de boss secondaires sur la carte à partir de la difficulté 1', () => {
    let normal = 0;
    let hard = 0;
    for (let seed = 1; seed <= 40; seed++) {
      normal += newRun(seed, null, [], 0).map.nodes.filter((n) => n.type === 'elite').length;
      hard += newRun(seed, null, [], 1).map.nodes.filter((n) => n.type === 'elite').length;
    }
    expect(hard).toBeGreaterThan(normal);
  });

  it('les ennemis : PV, Puissance et enrage', () => {
    const m = difficultyMods(20);
    const boss = createCombat(BOSS_ENCOUNTER, deck, 80, 80, 5, 100, {}, ['charge'], m);
    const v = boss.enemies[0];
    expect(v.maxHp).toBe(Math.round(225 * 1.2));
    expect(v.buffs.puissance).toBe(2);
    expect(boss.enrageTurn).toBe(14 - 2 - 3);
    const elite = createCombat(ELITE_ENCOUNTERS[0], deck, 80, 80, 5, 100, {}, ['charge'], m);
    expect(elite.enemies[0].maxHp).toBe(Math.round(75 * 1.15));
    expect(elite.enemies[0].buffs.puissance).toBe(2);
  });

  it('gagner au plus haut niveau débloque le suivant ; le score monte de 5 % par niveau', () => {
    const profile = { classes: {}, stats: { runs: 0, wins: 0 }, difficulty: {} as Record<string, number> };
    const run = newRun(1, null, [], 0);
    run.path = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    run.screen = 'victory';
    expect(awardRun(profile, run).newDifficulty).toBe(1);
    expect(profile.difficulty.guerrier).toBe(1);
    const hard = newRun(1, null, [], 1);
    hard.path = run.path;
    hard.screen = 'victory';
    const sum = awardRun(profile, hard);
    expect(sum.lines.some((l) => l.label.startsWith('Difficulté 1'))).toBe(true);
    expect(profile.difficulty.guerrier).toBe(2);
    // Gagner à un niveau plus bas ne débloque rien.
    expect(awardRun(profile, run).newDifficulty).toBeNull();
  });
});
