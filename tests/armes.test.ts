import { describe, expect, it } from 'vitest';
import { CLASSES } from '../src/engine/classes';
import { BOSS_LOOT, ITEMS, LOOT_TABLES, WEAPON_FAMILIES, WEAPON_TWINS, canWield, itemFor, uselessFor, withTwins } from '../src/engine/items';

const ALL = Object.values(CLASSES).map((c) => c.id);
const PLAYABLE = Object.values(CLASSES).filter((c) => c.playable).map((c) => c.id);

describe('Armes jumelles', () => {
  it('chaque classe, à venir comprise, a une famille d\'armes', () => {
    for (const id of ALL) expect(WEAPON_FAMILIES[id]?.length, id).toBeGreaterThan(0);
  });

  it('les jumelles existent, sont des armes de même rareté, et se répondent', () => {
    const seen = new Set<string>();
    for (const [m, i] of WEAPON_TWINS) {
      for (const id of [m, i]) {
        expect(ITEMS[id], id).toBeDefined();
        expect(ITEMS[id].slot, id).toBe('arme');
        expect(seen.has(id), `${id} en double`).toBe(false);
        seen.add(id);
      }
      expect(ITEMS[m].rarity, m).toBe(ITEMS[i].rarity);
      expect(ITEMS[m].family).toBe('melee');
      expect(ITEMS[i].family).toBe('incant');
      expect(ITEMS[m].twin).toBe(i);
      expect(ITEMS[i].twin).toBe(m);
      // Même effet, sauf le bonus principal : Attaques d'un côté, Sorts de l'autre.
      const strip = (fx: Record<string, number | undefined>) => Object.fromEntries(Object.entries(fx).filter(([k]) => k !== 'attackBonus' && k !== 'spellBonus'));
      expect(strip(ITEMS[m].fx as Record<string, number>), m).toEqual(strip(ITEMS[i].fx as Record<string, number>));
      expect((ITEMS[m].fx.attackBonus ?? 0), m).toBe(ITEMS[i].fx.spellBonus ?? 0);
    }
  });

  it('toute arme de butin non légendaire a une famille ou est un trophée utile à tous', () => {
    const loot = withTwins([...Object.values(LOOT_TABLES).flat(), ...Object.values(BOSS_LOOT).flatMap((l) => [...l.table, ...l.epics])]);
    for (const id of loot.filter((x) => ITEMS[x].slot === 'arme')) {
      if (ITEMS[id].family) continue;
      for (const cls of PLAYABLE) expect(uselessFor(id, cls), `${id} pour ${cls}`).toBe(false);
    }
  });

  it('une classe reçoit la jumelle de sa famille', () => {
    expect(itemFor('os_dragon', 'pretre')).toBe('baton_os_dragon');
    expect(itemFor('baton_prophete', 'guerrier')).toBe('glaive_prophete');
    expect(itemFor('os_dragon', 'guerrier')).toBe('os_dragon');
    expect(itemFor('coeur_vulkhar', 'mage')).toBe('coeur_vulkhar');
    // Le Paladin manie les deux : l'une ou l'autre au hasard.
    expect(itemFor('os_dragon', 'paladin', () => 0.9)).toBe('os_dragon');
    expect(itemFor('os_dragon', 'paladin', () => 0.1)).toBe('baton_os_dragon');
    expect(canWield('baton_oubli', 'voleur')).toBe(false);
    expect(uselessFor('lame_oubli', 'demoniste')).toBe(true);
  });

  it('chaque famille de classes a autant d\'armes dans chaque table', () => {
    for (const all of [...Object.values(LOOT_TABLES), ...Object.values(BOSS_LOOT).map((l) => [...l.table, ...l.epics])]) {
      const table = all.filter((x) => ITEMS[x].slot === 'arme');
      const counts = PLAYABLE.map((cls) => new Set(table.map((id) => itemFor(id, cls))).size);
      expect(Math.max(...counts) - Math.min(...counts)).toBeLessThanOrEqual(1);
      for (const cls of PLAYABLE) for (const id of table.filter((x) => ITEMS[x].slot === 'arme')) expect(uselessFor(itemFor(id, cls), cls), `${id} pour ${cls}`).toBe(false);
    }
  });

  it('un boss ne fait jamais tomber un objet inutile à ta classe', async () => {
    const { newRun } = await import('../src/engine/run');
    const { rollTableForTest } = await import('../src/engine/run');
    for (const cls of PLAYABLE) {
      const run = newRun(42, null, [], 0, cls);
      for (let i = 0; i < 200; i++) {
        for (const table of Object.values(LOOT_TABLES)) {
          run.pendingItem = null;
          rollTableForTest(run, table);
          if (run.pendingItem) expect(uselessFor(run.pendingItem, cls), `${run.pendingItem} pour ${cls}`).toBe(false);
        }
      }
    }
  });
});
