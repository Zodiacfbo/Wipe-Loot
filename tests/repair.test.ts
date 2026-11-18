import { describe, expect, it } from 'vitest';
import { reachable } from '../src/engine/map';
import { gearEffects } from '../src/engine/items';
import { afterCombatAction, chooseNode, equipPending, newRun, repairBill, repairItem, retryAfterWipe } from '../src/engine/run';
import { migrate } from '../src/engine/save';
import type { RunState } from '../src/engine/types';

function wiped(run: RunState): void {
  if (run.screen !== 'combat') chooseNode(run, reachable(run.map, null)[0].id);
  run.combat!.player.hp = 0;
  run.combat!.phase = 'defeat';
  afterCombatAction(run);
}

describe('facture de réparation', () => {
  it('chaque wipe coûte 50, puis 100, puis 150 or', () => {
    const run = newRun(7);
    run.gold = 1000;
    for (const bill of [50, 100, 150]) {
      wiped(run);
      expect(repairBill(run)).toBe(bill);
      const before = run.gold;
      retryAfterWipe(run);
      expect(run.gold).toBe(before - bill);
    }
    expect(run.broken).toEqual([]);
  });

  it('sans assez d\'or, un objet au hasard est brisé : son effet disparaît', () => {
    const run = newRun(7);
    run.gold = 20;
    run.pendingItem = 'amulette_vigueur';
    equipPending(run, 'amulette');
    expect(run.maxHp).toBe(88);
    wiped(run);
    retryAfterWipe(run);
    expect(run.gold).toBe(20); // rien n'est payé
    expect(run.broken).toEqual(['amulette']);
    expect(run.maxHp).toBe(80);
    expect(gearEffects(run.equipment, run.broken)).toEqual({});
    expect(run.combat!.fx?.[0]).toEqual({ kind: 'banner', text: 'Objet brisé : Amulette de vigueur' });
  });

  it('sans or ni objet, on retente quand même', () => {
    const run = newRun(7);
    run.gold = 0;
    wiped(run);
    retryAfterWipe(run);
    expect(run.screen).toBe('combat');
    expect(run.wipesLeft).toBe(2);
  });

  it('le vendeur répare un objet brisé', () => {
    const run = newRun(3);
    run.equipment.amulette = 'amulette_vigueur';
    run.broken = ['amulette'];
    const node = run.map.nodes.find((n) => n.type === 'shop')!;
    run.position = node.floor === 0 ? null : run.map.nodes.find((n) => n.next.includes(node.id))!.id;
    chooseNode(run, node.id);
    run.gold = 60;
    expect(repairItem(run, 'amulette')).toBe(true);
    expect(run.gold).toBe(10);
    expect(run.broken).toEqual([]);
    expect(run.maxHp).toBe(88);
  });

  it('remplacer un objet brisé le fait disparaître sans retirer deux fois ses PV max', () => {
    const run = newRun(3);
    run.pendingItem = 'amulette_vigueur';
    equipPending(run, 'amulette');
    run.broken = ['amulette'];
    run.maxHp = 80;
    run.hp = 80;
    run.pendingItem = 'amulette_rempart';
    equipPending(run, 'amulette');
    expect(run.maxHp).toBe(80);
    expect(run.broken).toEqual([]);
  });

  it('une sauvegarde v5 n\'a aucun objet brisé', () => {
    const old = { ...newRun(5), version: 5 } as Record<string, unknown>;
    delete old.broken;
    expect(migrate(old)!.broken).toEqual([]);
  });
});
