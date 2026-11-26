import { describe, expect, it } from 'vitest';
import { endTurn } from '../src/engine/combat';
import {
  afterCombatAction, buyPotion, canDrink, chooseNode, discardPotion, drinkPotion, newRun, retryAfterWipe, takePotion,
} from '../src/engine/run';
import { reachable } from '../src/engine/map';
import { migrate } from '../src/engine/save';
import type { RunState } from '../src/engine/types';

function inCombat(seed = 7): RunState {
  const run = newRun(seed);
  chooseNode(run, reachable(run.map, null)[0].id);
  return run;
}

describe('potions', () => {
  it('3 emplacements vides au départ', () => {
    expect(newRun(1).potions).toEqual([null, null, null]);
  });

  it('une potion se boit en combat sans énergie et disparaît', () => {
    const run = inCombat();
    run.potions[0] = 'potion_energie';
    const energy = run.combat!.player.energy;
    expect(drinkPotion(run, 0)).toBe(true);
    expect(run.combat!.player.energy).toBe(energy + 2);
    expect(run.potions[0]).toBeNull();
    expect(drinkPotion(run, 0)).toBe(false);
  });

  it('la Potion explosive touche tous les ennemis et peut finir le combat', () => {
    const run = inCombat();
    run.potions[1] = 'potion_explosive';
    for (const e of run.combat!.enemies) { e.hp = 5; e.block = 0; }
    drinkPotion(run, 1);
    expect(run.combat!.phase).toBe('victory');
  });

  it('les potions de soins se boivent aussi hors combat, les autres non', () => {
    const run = newRun(2);
    run.hp = 50;
    run.potions = ['potion_soins', 'flacon_colosse', null];
    expect(canDrink(run, 1)).toBe(false);
    expect(drinkPotion(run, 0)).toBe(true);
    expect(run.hp).toBe(70);
    run.hp = 80;
    run.potions[0] = 'potion_soins';
    expect(canDrink(run, 0)).toBe(false); // déjà tous les PV
  });

  it('la protection contre le feu annule les Zones de feu', () => {
    const hpAfter = (proof: boolean) => {
      const run = inCombat();
      const c = run.combat!;
      c.hand.push({ uid: 999, id: 'zone_de_feu', upgraded: false });
      if (proof) {
        run.potions[0] = 'potion_protection_feu';
        drinkPotion(run, 0);
      }
      endTurn(c);
      return c.player.hp;
    };
    expect(hpAfter(true) - hpAfter(false)).toBe(6);
  });

  it('prendre une potion trouvée : emplacement libre, ou remplacement', () => {
    const run = newRun(3);
    run.pendingPotion = 'elixir_felin';
    expect(takePotion(run)).toBe(true);
    expect(run.potions[0]).toBe('elixir_felin');
    run.potions = ['potion_soins', 'potion_soins', 'potion_soins'];
    run.pendingPotion = 'potion_rage';
    expect(takePotion(run)).toBe(false);
    expect(takePotion(run, 2)).toBe(true);
    expect(run.potions[2]).toBe('potion_rage');
    discardPotion(run, 0);
    expect(run.potions[0]).toBeNull();
  });

  it('les victoires donnent parfois une potion', () => {
    let found = 0;
    for (let seed = 1; seed <= 40; seed++) {
      const run = inCombat(seed);
      run.combat!.phase = 'victory';
      afterCombatAction(run);
      if (run.pendingPotion) found++;
    }
    expect(found).toBeGreaterThan(5);
    expect(found).toBeLessThan(30);
  });

  it('le vendeur vend 3 potions, seulement s\'il reste un emplacement', () => {
    const run = newRun(3);
    const node = run.map.nodes.find((n) => n.type === 'shop')!;
    run.position = node.floor === 0 ? null : run.map.nodes.find((n) => n.next.includes(node.id))!.id;
    chooseNode(run, node.id);
    expect(run.shop!.potions.length).toBe(3);
    run.gold = 1000;
    run.potions = ['potion_soins', 'potion_soins', null];
    expect(buyPotion(run, 0)).toBe(true);
    expect(run.potions[2]).toBe(run.shop!.potions[0].id);
    expect(buyPotion(run, 1)).toBe(false); // plus de place
  });

  it('après un wipe, on retrouve les potions qu\'on avait en entrant', () => {
    const run = newRun(7);
    run.potions = ['potion_soins', null, null];
    chooseNode(run, reachable(run.map, null)[0].id);
    drinkPotion(run, 0);
    run.combat!.player.hp = 0;
    run.combat!.phase = 'defeat';
    afterCombatAction(run);
    retryAfterWipe(run);
    expect(run.potions[0]).toBe('potion_soins');
  });

  it('une sauvegarde v4 reçoit 3 emplacements vides', () => {
    const old = { ...newRun(5), version: 4 } as Record<string, unknown>;
    delete old.potions;
    delete old.pendingPotion;
    const run = migrate(old)!;
    expect(run.version).toBe(27);
    expect(run.potions).toEqual([null, null, null]);
  });
});

describe('la Potion de purification', () => {
  it('dissipe les malédictions et retire les Fardeaux de la main', () => {
    const run = inCombat();
    const c = run.combat!;
    c.player.debuffs!.demoralise = 3;
    c.player.debuffs!.impie = 2;
    c.hand.push({ uid: 7777, id: 'fardeau', upgraded: false });
    run.potions[0] = 'potion_purification';
    drinkPotion(run, 0);
    expect(c.player.debuffs!.demoralise).toBe(0);
    expect(c.player.debuffs!.impie).toBe(0);
    expect(c.hand.some((k) => k.id === 'fardeau')).toBe(false);
  });
});
