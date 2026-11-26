import { describe, expect, it } from 'vitest';
import type { RunJournal } from '../src/journal';
import { DAY_MS, cardPickRates, dailyActivity, droppingOut, estimateUsage, isRetreat, mainTree, retreatsByLord, stopsByEncounter, suspicious, usageLevel, winsByClass } from '../src/admin/stats';
import { rewardPool } from '../src/engine/cards';
import { treesFor } from '../src/engine/talents';

const NOW = new Date(2026, 10, 24, 15).getTime();
const run = (o: Partial<RunJournal>): RunJournal => ({
  uid: 'u1', pseudo: 'Aldric', classe: 'mage', talents: [], difficulte: 0, victoire: false, chapitre: 1, etapes: 5, cause: 'Krâgg', causeEnnemis: ['kragg'],
  chutes: 1, combats: 4, gardiens: 0, score: 100, paquet: [], equipement: [], dureeMin: 30, version: 'abc', finMs: NOW, ...o,
});

describe('page admin : les calculs', () => {
  it('estime la consommation de la base et la colore', () => {
    expect(estimateUsage(10, 30, 500)).toEqual({ reads: 10 * (2 * 5 + 6) + 500, writes: 30 * 22 + 20 });
    expect(usageLevel(1000, 50000)).toMatchObject({ level: 'ok', sign: '✓' });
    expect(usageLevel(30000, 50000)).toMatchObject({ level: 'attention', sign: '⚠' });
    expect(usageLevel(45000, 50000)).toMatchObject({ level: 'danger', sign: '⛔' });
  });

  it('compte les joueurs actifs par jour et ceux qui décrochent', () => {
    const players = [{ uid: 'u1', pseudo: 'A', majMs: NOW }, { uid: 'u2', pseudo: 'B', majMs: NOW - 4 * DAY_MS }];
    const runs = [run({ uid: 'u3', finMs: NOW - DAY_MS })];
    const days = dailyActivity(players, runs, 7, NOW);
    expect(days).toHaveLength(7);
    expect(days[6]).toMatchObject({ players: 1, runs: 0 });
    expect(days[5]).toMatchObject({ players: 1, runs: 1 });
    expect(droppingOut(players, NOW).map((p) => p.uid)).toEqual(['u2']);
  });

  it('calcule les taux de victoire et les arrêts', () => {
    const runs = [run({ victoire: true, cause: null }), run({}), run({ classe: 'guerrier', cause: 'Vulkhar' }), run({})];
    expect(winsByClass(runs)[0]).toEqual({ key: 'mage', runs: 3, wins: 1, retreats: 0, pct: 33 });
    expect(stopsByEncounter(runs)[0]).toMatchObject({ cause: 'Krâgg', count: 2 });
  });

  it('compte les retours à la guilde à part : ni victoire, ni défaite', () => {
    const back = (chapitre: number) => run({ classe: 'voleur', cause: 'Retour à la guilde', chapitre });
    const runs = [back(1), back(1), back(2), run({ classe: 'voleur', cause: 'Saldris' })];
    expect(isRetreat(runs[0])).toBe(true);
    expect(isRetreat(runs[3])).toBe(false);
    expect(winsByClass(runs)[0]).toEqual({ key: 'voleur', runs: 4, wins: 0, retreats: 3, pct: 0 });
    expect(stopsByEncounter(runs)).toEqual([{ cause: 'Saldris', count: 1, chapitre: 1 }]);
    expect(retreatsByLord(runs)).toEqual([{ lord: 'Vulkhar', count: 2 }, { lord: 'Vhaeryx', count: 1 }]);
  });

  it('trouve l\'arbre principal d\'une run', () => {
    const tree = treesFor('mage')[1];
    expect(mainTree(run({ talents: [tree.tiers[0][0].id, tree.tiers[1][0].id] }))).toBe(tree.name);
    expect(mainTree(run({}))).toBe('aucun talent');
  });

  it('classe les cartes de la moins prise à la plus prise', () => {
    const pool = rewardPool('mage');
    const rates = cardPickRates([run({ paquet: [pool[0] + '+'] }), run({ paquet: [pool[0]] })], 'mage');
    expect(rates[rates.length - 1]).toEqual({ id: pool[0], pct: 100 });
    expect(rates[0].pct).toBe(0);
  });

  it('repère les scores suspects', () => {
    const s = suspicious([run({ victoire: true, cause: null, dureeMin: 4 }), run({ score: 100 }), run({ score: 120 }), run({ score: 900 })]);
    expect(s.map((x) => x.why)).toEqual(['victoire en 4 min', 'score 900, plus de 2 fois sa médiane (120)']);
  });
});
