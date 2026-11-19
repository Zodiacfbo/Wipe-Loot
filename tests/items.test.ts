import { describe, expect, it } from 'vitest';
import { createCombat, playCard } from '../src/engine/combat';
import type { Encounter } from '../src/engine/enemies';
import { ELITE_ENCOUNTERS } from '../src/engine/enemies';
import { gearEffects, LOOT_TABLES, slotsFor } from '../src/engine/items';
import { afterCombatAction, buyItem, chooseNode, equipPending, leavePending, newRun } from '../src/engine/run';
import { migrate } from '../src/engine/save';
import type { CardInstance, CombatState, RunState } from '../src/engine/types';

function deckOf(ids: string[]): CardInstance[] {
  return ids.map((id, i) => ({ uid: 1000 + i, id, upgraded: false }));
}

function combatWith(gear: Record<string, number>, enemies = ['lieutenant'], cards = ['frappe', 'frappe', 'frappe', 'frappe', 'frappe']): CombatState {
  const enc: Encounter = { kind: 'combat', name: 'Test', enemies };
  return createCombat(enc, deckOf(cards), 80, 80, 42, 1, gear);
}

/** Place le joueur juste avant un nœud et y entre. */
function enter(run: RunState, type: string): void {
  const node = run.map.nodes.find((n) => n.type === type)!;
  run.position = node.floor === 0 ? null : run.map.nodes.find((n) => n.next.includes(node.id))!.id;
  chooseNode(run, node.id);
}

describe('effets de l\'équipement en combat', () => {
  it('+X dégâts aux Attaques, et bonus sur la première Attaque du combat', () => {
    const base = combatWith({});
    const hp = base.enemies[0].hp;
    playCard(base, 0);
    const normal = hp - base.enemies[0].hp;

    const c = combatWith({ attackBonus: 1, firstAttackBonus: 10 });
    playCard(c, 0);
    expect(hp - c.enemies[0].hp).toBe(normal + 11);
    const after = c.enemies[0].hp;
    playCard(c, 0);
    expect(after - c.enemies[0].hp).toBe(normal + 1);
  });

  it('blocage, Puissance et énergie de départ', () => {
    const c = combatWith({ startBlock: 6, startPuissance: 1, firstTurnEnergy: 1 });
    expect(c.player.block).toBe(6);
    expect(c.player.energy).toBe(4);
  });

  it('un ennemi qui meurt explose sur les autres', () => {
    const c = combatWith({ onKillAoe: 5 }, ['lieutenant', 'lieutenant']);
    const other = c.enemies[1].hp;
    c.enemies[0].hp = 1;
    playCard(c, 0, c.enemies[0].uid);
    expect(c.enemies[0].dead).toBe(true);
    expect(c.enemies[1].hp).toBeLessThanOrEqual(other - 5);
  });
});

describe('équiper et remplacer', () => {
  it('un coffre donne un objet, qu\'on peut équiper', () => {
    const run = newRun(11);
    enter(run, 'chest');
    expect(run.screen).toBe('reward');
    const id = run.pendingItem!;
    expect(id).toBeTruthy();
    expect(equipPending(run, slotsFor(id)[0])).toBe(true);
    expect(run.equipment[slotsFor(id)[0]]).toBe(id);
    expect(run.pendingItem).toBeNull();
  });

  it('remplacer un objet à PV max retire son bonus', () => {
    const run = newRun(11);
    run.pendingItem = 'amulette_vigueur';
    equipPending(run, 'amulette');
    expect(run.maxHp).toBe(88);
    expect(run.hp).toBe(88);
    run.pendingItem = 'amulette_rempart';
    expect(equipPending(run, 'arme')).toBe(false); // mauvais emplacement
    equipPending(run, 'amulette');
    expect(run.maxHp).toBe(80);
    expect(run.hp).toBe(80);
    expect(gearEffects(run.equipment)).toEqual({ startBlock: 6 });
  });

  it('on peut laisser un objet', () => {
    const run = newRun(11);
    run.pendingItem = 'epee_longue';
    leavePending(run);
    expect(run.pendingItem).toBeNull();
    expect(run.equipment.arme).toBeNull();
  });

  it('un boss secondaire vaincu laisse un objet de sa table de loot', () => {
    const run = newRun(4);
    run.encounter = ELITE_ENCOUNTERS[0];
    enter(run, 'elite');
    const loot = run.encounter!.loot!;
    for (const e of run.combat!.enemies) e.dead = true;
    run.combat!.phase = 'victory';
    afterCombatAction(run);
    expect(run.screen).toBe('reward');
    expect(LOOT_TABLES[loot]).toContain(run.pendingItem);
  });

  it('le vendeur vend 2 objets, à équiper dans un emplacement valide', () => {
    const run = newRun(3);
    enter(run, 'shop');
    expect(run.shop!.items.length).toBe(2);
    const item = run.shop!.items[0];
    run.gold = item.price;
    expect(buyItem(run, 0, slotsFor(item.id)[0])).toBe(true);
    expect(run.gold).toBe(0);
    expect(run.equipment[slotsFor(item.id)[0]]).toBe(item.id);
    expect(buyItem(run, 0, slotsFor(item.id)[0])).toBe(false);
  });

  it('une sauvegarde v3 reçoit un équipement vide', () => {
    const old = { ...newRun(5), version: 3 } as Record<string, unknown>;
    delete old.equipment;
    delete old.pendingItem;
    const run = migrate(old)!;
    expect(run.version).toBe(21);
    expect(run.equipment.arme).toBeNull();
    expect(run.pendingItem).toBeNull();
  });
});
