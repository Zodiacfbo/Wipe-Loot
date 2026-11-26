import { describe, expect, it } from 'vitest';
import { EVENTS } from '../src/engine/events';
import { rackLegendary } from '../src/engine/progression';
import { LEGENDARY_QUEST, newRun } from '../src/engine/run';
import { emptyProfile } from '../src/engine/save';

describe('râtelier de la guilde', () => {
  it('le légendaire emporté prend l\'Arme, et sa quête est déjà faite', () => {
    const run = newRun(1, null, [], 0, 'guerrier', 'brisemonts');
    expect(run.equipment.arme).toBe('brisemonts');
    expect(run.brisemonts).toBe('forged');
    expect(EVENTS.forge.choices[0].locked?.(run)).toBe('Tu l\'as déjà');
  });

  it('sans le légendaire, la quête reste à faire', () => {
    const run = newRun(1, null, [], 0, 'guerrier');
    expect(run.brisemonts).toBeNull();
    expect(EVENTS.forge.choices[0].locked?.(run)).toBeNull();
  });

  it('se combine avec un objet du coffre qui n\'est pas une arme', () => {
    const run = newRun(1, 'amulette_sang', [], 0, 'mage', 'baton_veilleur');
    expect(run.equipment.arme).toBe('baton_veilleur');
    expect(run.equipment.amulette).toBe('amulette_sang');
    expect(run.veilleur).toBe('forged');
  });

  it('une arme du coffre garde l\'emplacement (le hall l\'empêche, le moteur ne perd rien)', () => {
    const run = newRun(1, 'hache_de_guerre', [], 0, 'guerrier', 'brisemonts');
    expect(run.equipment.arme).toBe('hache_de_guerre');
    expect(run.brisemonts).toBeNull();
  });

  it('chaque classe jouable a sa quête légendaire', () => {
    for (const cls of ['guerrier', 'mage', 'demoniste', 'pretre', 'voleur', 'paladin']) expect(LEGENDARY_QUEST[cls]).toBeDefined();
  });

  it('le râtelier lit le légendaire forgé de la classe', () => {
    const profile = emptyProfile();
    expect(rackLegendary(profile, 'guerrier')).toBeNull();
    profile.classes.guerrier = { xp: 0, legendary: 'brisemonts' };
    expect(rackLegendary(profile, 'guerrier')).toBe('brisemonts');
    expect(rackLegendary(profile, 'mage')).toBeNull();
  });
});
