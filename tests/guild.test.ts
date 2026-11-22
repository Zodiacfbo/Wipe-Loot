import { describe, expect, it } from 'vitest';
import { CHEST_SIZE, depositableSlots, settleChest, takeHeirloom } from '../src/engine/guild';
import { newRun } from '../src/engine/run';
import { migrate } from '../src/engine/save';
import type { RunState } from '../src/engine/types';

function won(heirloom: string | null = null): RunState {
  const run = newRun(9, heirloom);
  run.screen = 'victory';
  return run;
}

describe('coffre de la guilde', () => {
  it('emporter un objet le retire du coffre et l\'équipe dès le départ', () => {
    const profile = { guildChest: ['amulette_vigueur', 'epee_longue'] };
    const id = takeHeirloom(profile, 0)!;
    expect(profile.guildChest).toEqual(['epee_longue']);
    const run = newRun(1, id);
    expect(run.equipment.amulette).toBe('amulette_vigueur');
    expect(run.maxHp).toBe(88);
    expect(run.heirloom).toBe('amulette_vigueur');
  });

  it('après une victoire, l\'objet emporté revient et on dépose un objet', () => {
    const profile = { guildChest: [] as string[] };
    const run = won('amulette_vigueur');
    run.equipment.arme = 'hache_de_guerre';
    expect(depositableSlots(run)).toEqual(['arme']); // l'amulette revient d'elle-même
    expect(settleChest(profile, run, 'arme')).toBe(true);
    expect(profile.guildChest).toEqual(['amulette_vigueur', 'hache_de_guerre']);
    expect(settleChest(profile, run, null)).toBe(false); // une seule fois
  });

  it('un objet emporté puis remplacé pendant la run ne revient pas', () => {
    const profile = { guildChest: [] as string[] };
    const run = won('epee_longue');
    run.equipment.arme = 'hache_de_guerre';
    settleChest(profile, run, null);
    expect(profile.guildChest).toEqual([]);
  });

  it('coffre plein : il faut choisir quel objet remplacer', () => {
    const full = ['epee_longue', 'anneau_pierre', 'anneau_soldat', 'croc_de_lave', 'pierre_braise', 'amulette_rempart'];
    expect(full.length).toBe(CHEST_SIZE);
    const profile = { guildChest: [...full] };
    const run = won();
    run.equipment.bijou1 = 'eclat_gorlok';
    expect(settleChest(profile, run, 'bijou1')).toBe(false);
    expect(settleChest(profile, run, 'bijou1', 3)).toBe(true);
    expect(profile.guildChest[3]).toBe('eclat_gorlok');
    expect(profile.guildChest.length).toBe(CHEST_SIZE);
  });

  it('on ne peut rien déposer avant la victoire', () => {
    const profile = { guildChest: [] as string[] };
    const run = newRun(2);
    run.equipment.arme = 'epee_longue';
    expect(settleChest(profile, run, 'arme')).toBe(false);
  });

  it('une sauvegarde v6 n\'a pas d\'objet emporté', () => {
    const old = { ...newRun(5), version: 6 } as Record<string, unknown>;
    delete old.heirloom;
    delete old.chestDone;
    const run = migrate(old)!;
    expect(run.version).toBe(24);
    expect(run.heirloom).toBeNull();
    expect(run.chestDone).toBe(false);
  });
});
