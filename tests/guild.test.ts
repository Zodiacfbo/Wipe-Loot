import { describe, expect, it } from 'vitest';
import { CHEST_SIZE, depositableSlots, settleChest, takeHeirloom } from '../src/engine/guild';
import { allowedSlots, equipPending, isFullVictory, newRun, returnToGuild, rollTableForTest } from '../src/engine/run';
import { awardRun, scoreRun } from '../src/engine/progression';
import { runJournal } from '../src/journal';
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
    expect(run.version).toBe(29);
    expect(run.heirloom).toBeNull();
    expect(run.chestDone).toBe(false);
  });
});

describe('rentrer à la guilde après un seigneur', () => {
  function afterVulkhar(heirloom: string | null = 'amulette_vigueur'): RunState {
    const run = newRun(9, heirloom);
    run.screen = 'act';
    run.act = 1;
    return run;
  }

  it('seulement depuis l\'écran de fin de chapitre', () => {
    const run = newRun(9);
    returnToGuild(run);
    expect(run.retreated).toBe(false);
  });

  it('le coffre comme après une victoire : l\'objet emporté revient, on en dépose un', () => {
    const profile = { guildChest: [] as string[] };
    const run = afterVulkhar();
    run.equipment.arme = 'hache_de_guerre';
    returnToGuild(run);
    expect(run.screen).toBe('victory');
    expect(isFullVictory(run)).toBe(false);
    expect(settleChest(profile, run, 'arme')).toBe(true);
    expect(profile.guildChest).toEqual(['amulette_vigueur', 'hache_de_guerre']);
  });

  it('ce n\'est pas une victoire : Vulkhar compte, mais ni difficulté, ni victoire de classe, ni « Aucune chute »', () => {
    const run = afterVulkhar(null);
    run.difficulty = 0;
    returnToGuild(run);
    const labels = scoreRun(run).map((l) => l.label);
    expect(labels).toContain('Vulkhar vaincu');
    expect(labels).not.toContain('Aucune chute');
    const profile = { classes: {}, stats: { runs: 0, wins: 0 }, difficulty: {} as Record<string, number> };
    const sum = awardRun(profile, run, 'guerrier');
    expect(sum.victory).toBe(false);
    expect(sum.newDifficulty).toBeNull();
    expect(profile.stats.wins).toBe(0);
    const j = runJournal(run, sum, { uid: 'u', pseudo: 'p' }, 'v', null);
    expect(j.victoire).toBe(false);
    expect(j.cause).toBe('Retour à la guilde');
  });

  it('les anciennes runs reçoivent le champ (migration)', () => {
    const run = newRun(9) as unknown as Record<string, unknown>;
    run.version = 25;
    delete run.retreated;
    expect(migrate(run)?.retreated).toBe(false);
  });
});

describe('objet unique : un seul exemplaire porté', () => {
  it('un objet déjà porté ne peut que remplacer son propre exemplaire', () => {
    const run = newRun(9);
    run.equipment.bague1 = 'anneau_force';
    expect(allowedSlots(run, 'anneau_force')).toEqual(['bague1']);
    expect(allowedSlots(run, 'anneau_soldat')).toEqual(['bague1', 'bague2']);
    run.pendingItem = 'anneau_force';
    expect(equipPending(run, 'bague2')).toBe(false);
    expect(run.equipment.bague2).toBeNull();
  });

  it('les tables de butin ne proposent pas un objet déjà porté', () => {
    const run = newRun(9);
    run.equipment.bague1 = 'anneau_force';
    for (let i = 0; i < 30; i++) {
      run.pendingItem = null;
      run.pendingSpell = null;
      rollTableForTest(run, ['anneau_force', 'anneau_soldat']);
      if (run.pendingItem) expect(run.pendingItem).toBe('anneau_soldat');
    }
  });
});
