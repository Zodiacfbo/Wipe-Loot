import { describe, expect, it } from 'vitest';
import { afterCombatAction, chooseNode, chooseReward, newRun } from '../src/engine/run';
import { reachable } from '../src/engine/map';
import { MAX_CHOICES, logChoice } from '../src/engine/choices';
import { cardOfferRates, costlyFights } from '../src/admin/stats';
import { runJournal, type RunJournal } from '../src/journal';

describe('le journal des choix', () => {
  it('note le nœud, le combat (tours, PV perdus) et les cartes proposées', () => {
    const run = newRun(7);
    chooseNode(run, reachable(run.map, null)[0].id);
    run.combat!.player.hp = run.hp - 9;
    run.combat!.turn = 4;
    for (const e of run.combat!.enemies) e.dead = true;
    run.combat!.phase = 'victory';
    afterCombatAction(run);
    const offered = [...run.rewardChoices];
    chooseReward(run, offered[1]);
    const [noeud, combat, cartes] = run.choix;
    expect(noeud).toMatchObject({ t: 'noeud', e: 1 });
    expect(combat).toMatchObject({ t: 'combat', e: 1, tours: 4, pv: 9, fin: 'victoire' });
    expect(cartes).toEqual({ t: 'cartes', e: 1, o: offered, p: offered[1] });
    // Il part avec le journal de fin d'expédition.
    expect(runJournal(run, undefined, { uid: 'u', pseudo: 'p' }, 'v', null).choix).toHaveLength(3);
  });

  it('une carte refusée est notée « aucune », et le journal a une taille limitée', () => {
    const run = newRun(7);
    run.screen = 'reward';
    run.rewardChoices = ['enchainement', 'pourfendre', 'vengeance'];
    chooseReward(run, null);
    expect(run.choix.at(-1)).toMatchObject({ t: 'cartes', p: null });
    for (let i = 0; i < MAX_CHOICES + 50; i++) logChoice(run, { t: 'feu', e: 1, k: 'repos' });
    expect(run.choix).toHaveLength(MAX_CHOICES);
  });
});

describe('les statistiques de l\'admin', () => {
  const j = (choix: RunJournal['choix']): RunJournal => ({ classe: 'guerrier', choix } as RunJournal);
  it('cartes proposées et prises', () => {
    const runs = [
      j([{ t: 'cartes', e: 1, o: ['a', 'b', 'c'], p: 'a' }, { t: 'cartes', e: 2, o: ['a', 'b', 'd'], p: 'b' }]),
      j([{ t: 'cartes', e: 1, o: ['a', 'b', 'c'], p: null }]),
    ];
    const rates = cardOfferRates(runs, 'guerrier', 2);
    expect(rates.find((r) => r.id === 'a')).toEqual({ id: 'a', offered: 3, taken: 1, pct: 33 });
    expect(rates.find((r) => r.id === 'c')).toEqual({ id: 'c', offered: 2, taken: 0, pct: 0 });
    expect(rates[0].id).toBe('c');
  });

  it('combats qui coûtent le plus de PV', () => {
    const runs = [j([
      { t: 'combat', e: 1, n: 'Krâgg', k: 'elite', tours: 6, pv: 30, fin: 'victoire' },
      { t: 'combat', e: 1, n: 'Krâgg', k: 'elite', tours: 4, pv: 50, fin: 'chute' },
      { t: 'combat', e: 2, n: 'Sbires', k: 'combat', tours: 3, pv: 5, fin: 'victoire' },
    ])];
    expect(costlyFights(runs, 2)).toEqual([{ name: 'Krâgg', count: 2, pv: 40, falls: 50 }]);
  });
});
