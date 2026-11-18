import { describe, expect, it } from 'vitest';
import { LORE, recordKills, recordSeen, type ArchiveProfile } from '../src/engine/archives';
import { ENEMIES } from '../src/engine/enemies';
import { reachable } from '../src/engine/map';
import { afterCombatAction, chooseNode, newRun } from '../src/engine/run';

const fresh = (): ArchiveProfile => ({ seenCards: [], seenEnemies: [], kills: {}, seenPotions: [] });

describe('les archives de la guilde', () => {
  it('chaque monstre a une entrée dans les archives', () => {
    expect(Object.keys(ENEMIES).filter((id) => !LORE[id])).toEqual([]);
  });

  it('on consigne ce qu\'on voit, sans doublon', () => {
    const p = fresh();
    expect(recordSeen(p, ['frappe', 'frappe', 'parade'], ['molosse'], ['potion_soins', null])).toBe(true);
    expect(p.seenCards).toEqual(['frappe', 'parade']);
    expect(recordSeen(p, ['frappe'], ['molosse'], [null])).toBe(false);
  });

  it('les monstres vaincus pendant la run sont comptés, puis ajoutés au profil', () => {
    const run = newRun(7);
    chooseNode(run, reachable(run.map, null)[0].id);
    const ids = run.combat!.enemies.map((e) => e.defId);
    for (const e of run.combat!.enemies) e.dead = true;
    run.combat!.phase = 'victory';
    afterCombatAction(run);
    expect(Object.values(run.kills).reduce((a, b) => a + b, 0)).toBe(ids.length);
    const p = fresh();
    recordKills(p, run.kills);
    recordKills(p, run.kills);
    expect(p.kills[ids[0]]).toBe(2 * ids.filter((x) => x === ids[0]).length);
  });
});
