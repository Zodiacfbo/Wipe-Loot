import { describe, expect, it } from 'vitest';
import { createCombat, endTurn } from '../src/engine/combat';
import { ACTS } from '../src/engine/acts';
import { HIDDEN_FIGHTS_3 } from '../src/engine/enemies_acte3';
import { EVENTS } from '../src/engine/events';
import { BOSS_LOOT, ITEMS } from '../src/engine/items';
import { afterCombatAction, chooseNode, eventChoiceLock, newRun, resolveEvent, runGear } from '../src/engine/run';
import type { CardInstance, RunState } from '../src/engine/types';

function act3(classId = 'guerrier', seed = 4): RunState {
  const run = newRun(seed, null, [], 0, classId);
  run.act = 3;
  run.map = { ...run.map };
  return run;
}

function atEvent(run: RunState, id: string): RunState {
  run.screen = 'event';
  run.eventId = id;
  run.eventOutcome = null;
  return run;
}

function win(run: RunState): void {
  for (const e of run.combat!.enemies) e.dead = true;
  run.combat!.phase = 'victory';
  afterCombatAction(run);
}

const deck = (ids: string[]): CardInstance[] => ids.map((id, i) => ({ uid: 1000 + i, id, upgraded: false }));

describe('acte 3 : les événements d\'Irem', () => {
  const act3Events = Object.values(EVENTS).filter((e) => e.act === 3);

  it('10 événements, qui n\'apparaissent qu\'à l\'acte 3', () => {
    expect(act3Events.map((e) => e.id).sort()).toEqual(
      ['bibliotheque', 'fantome_raideur3', 'fonceur3', 'gong', 'marchand_sables', 'oasis', 'reve', 'statue', 'tombeau', 'veilleurs'].sort(),
    );
    expect(ACTS[3].hidden).toEqual(HIDDEN_FIGHTS_3);
    expect(HIDDEN_FIGHTS_3).toHaveLength(4);
  });

  it('chaque choix possible se résout sans erreur', () => {
    for (const ev of act3Events) {
      for (let i = 0; i < ev.choices.length; i++) {
        const run = atEvent(act3('guerrier', 11 + i), ev.id);
        run.gold = 500;
        run.deck.push({ uid: 9999, id: 'malediction', upgraded: false });
        if (eventChoiceLock(run, i)) continue;
        resolveEvent(run, i);
        expect(['event', 'reward', 'combat', 'map'], `${ev.id}:${i}`).toContain(run.screen);
      }
    }
  });

  it('le gong : un objet épique, puis un pack difficile avec un ennemi de plus', () => {
    const run = atEvent(act3(), 'gong');
    resolveEvent(run, 0);
    expect(run.screen).toBe('reward');
    expect(ITEMS[run.pendingItem!].rarity).toBe('epique');
    expect(run.gong).toBe(true);
    run.screen = 'map';
    run.pendingItem = null;
    const node = run.map.nodes.find((n) => n.type === 'combat' && n.floor === 0) ?? run.map.nodes.find((n) => n.type === 'combat')!;
    run.position = node.floor === 0 ? null : run.map.nodes.find((n) => n.next.includes(node.id))!.id;
    chooseNode(run, node.id);
    expect(run.encounter!.extraEnemy).toBe(true);
    expect(run.combat!.enemies.length).toBe(run.encounter!.enemies.length + 1);
    expect(run.gong).toBe(false);
  });

  it('la statue : une carte épique de ta classe, et 3 Folie au début de chaque combat de l\'acte', () => {
    const run = atEvent(act3(), 'statue');
    const before = run.deck.length;
    resolveEvent(run, 0);
    expect(run.deck.length).toBe(before + 1);
    expect(runGear(run).startFolie).toBe(3);
    const c = createCombat({ kind: 'combat', name: 't', enemies: ['scarabee'] }, deck(Array(8).fill('frappe')), 80, 80, 1, 1, runGear(run));
    expect(c.folie).toBe(3);
  });

  it('le rêve : 3 cartes améliorées, et 4 Folie au prochain combat seulement', () => {
    const run = atEvent(act3(), 'reve');
    resolveEvent(run, 0);
    expect(run.deck.filter((c) => c.upgraded).length).toBe(3);
    expect(run.nextFolie).toBe(4);
  });

  it('les Veilleurs : un indice marque un « ? » de la carte', () => {
    const run = atEvent(act3(), 'veilleurs');
    resolveEvent(run, 2);
    expect(run.map.nodes.some((n) => n.hint)).toBe(true);
  });

  it('les Veilleurs : leur bénédiction dure toute la run', () => {
    const run = atEvent(act3(), 'veilleurs');
    resolveEvent(run, 1);
    expect(runGear(run).undeadBonus).toBe(3);
  });
});

describe('l\'Aurore ardente : l\'étape des Veilleurs', () => {
  it('Lame ternie → les Veilleurs la bénissent → un boss secondaire d\'Irem l\'embrase', () => {
    const run = act3('paladin');
    run.aurore = 'lame';
    expect(EVENTS.veilleurs.quest).toBeTypeOf('function');
    expect((EVENTS.veilleurs.quest as (r: RunState) => boolean)(run)).toBe(true);
    atEvent(run, 'veilleurs');
    expect(eventChoiceLock(run, 0)).toBeNull();
    resolveEvent(run, 0);
    expect(run.aurore).toBe('benie');
    run.screen = 'map';
    run.eventOutcome = null;
    const node = run.map.nodes.find((n) => n.type === 'elite')!;
    run.position = node.floor === 0 ? null : run.map.nodes.find((n) => n.next.includes(node.id))!.id;
    chooseNode(run, node.id);
    win(run);
    expect(run.aurore).toBe('forged');
    expect(run.equipment.arme).toBe('aurore_ardente');
  });

  it('les autres classes ne peuvent pas demander la purification', () => {
    const run = atEvent(act3('guerrier'), 'veilleurs');
    expect(eventChoiceLock(run, 0)).toBe('Réservé au Paladin');
  });
});

describe('le butin de boss des actes 2 et 3', () => {
  it('chaque objet existe, et les épiques sont épiques', () => {
    for (const act of [2, 3]) {
      for (const id of BOSS_LOOT[act].table) expect(ITEMS[id], id).toBeDefined();
      for (const id of BOSS_LOOT[act].epics) expect(ITEMS[id]?.rarity, id).toBe('epique');
    }
  });

  const fight = (fx: Record<string, number>) =>
    createCombat({ kind: 'combat', name: 't', enemies: ['soldat_irem'] }, deck([...Array(8).fill('frappe'), ...Array(4).fill('parade')]), 80, 80, 2, 1, fx);

  it('Couronne d\'Irem : le premier tour est sauté', () => {
    const c = fight({ skipFirstTurn: 1, turnEnergy: 1 });
    expect(c.hand).toHaveLength(0);
    expect(c.player.energy).toBe(0);
    endTurn(c);
    expect(c.hand.length).toBeGreaterThan(0);
    expect(c.player.energy).toBe(4);
  });

  it('Lame de l\'oubli : 2 cartes Épuisées au début ; Bague du dieu dormant : une copie améliorée en main', () => {
    const c = fight({ startExhaust: 2, startCopyUp: 1 });
    expect(c.exhaust).toHaveLength(2);
    expect(c.hand.filter((k) => k.upgraded)).toHaveLength(1);
  });

  it('Carapace divine : 25 % de dégâts en moins ; Écaille de Prismagor : 10 % en plus', () => {
    const base = fight({});
    const less = fight({ hurtPct: -25 });
    const more = fight({ hurtPct: 10 });
    const hit = (c: ReturnType<typeof fight>) => {
      c.player.block = 0;
      const hp = c.player.hp;
      c.hand = [];
      endTurn(c);
      return hp - c.player.hp;
    };
    const b = hit(base);
    expect(hit(less)).toBeLessThan(b);
    expect(hit(more)).toBeGreaterThanOrEqual(b);
  });
});
