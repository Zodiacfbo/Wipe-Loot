import { describe, expect, it } from 'vitest';
import { CARDS, energyCost, rewardPool, starterCards } from '../src/engine/cards';
import { createCombat, endTurn, playCard, useSpell } from '../src/engine/combat';
import type { Encounter } from '../src/engine/enemies';
import { afterCombatAction, newRun, resolveEvent } from '../src/engine/run';
import { lootSpells } from '../src/engine/spells';
import { totemDescription } from '../src/engine/chaman';
import { CHAMAN_TREES, emptyAlloc, talentIds, toggleTalent } from '../src/engine/talents';
import type { ItemEffects } from '../src/engine/items';
import type { CardInstance, CombatState } from '../src/engine/types';

const deck = (ids: string[]): CardInstance[] => ids.map((id, i) => ({ uid: 1000 + i, id, upgraded: false }));
function fight(enemies: string[], hand: string[], gear: ItemEffects = {}, spells: string[] = ['choc_tellurique'], ankh = true): CombatState {
  const enc: Encounter = { kind: 'combat', name: 'Test', enemies };
  const c = createCombat(enc, deck(Array(10).fill('garde_de_pierre')), 75, 75, 7, 1, gear, spells, undefined, 'chaman', undefined, undefined, ankh);
  c.hand = hand.map((id, i) => ({ uid: 5000 + i, id, upgraded: false }));
  c.player.energy = 10;
  for (const e of c.enemies) e.hp = e.maxHp = 200;
  return c;
}
const play = (c: CombatState, id: string, target?: number) => playCard(c, c.hand.findIndex((k) => k.id === id), target);
const spell = (c: CombatState, id: string, target?: number) => useSpell(c, c.spells.findIndex((s) => s.id === id), target);
const lost = (c: CombatState, i = 0) => 200 - c.enemies[i].hp;

describe('le Chaman : la run', () => {
  it('75 PV, son deck de départ et Choc tellurique', () => {
    const run = newRun(1, null, [], 0, 'chaman');
    expect(run.maxHp).toBe(75);
    expect(run.spells).toEqual(['choc_tellurique']);
    expect(run.deck.filter((k) => k.id === 'eclair')).toHaveLength(4);
    expect(run.deck.some((k) => k.id === 'totem_braise')).toBe(true);
  });

  it('51 cartes en récompense (+ Garde de pierre), 14 par arbre', () => {
    expect(rewardPool('chaman')).toHaveLength(51);
    expect(starterCards('chaman')).toEqual(['garde_de_pierre']);
    for (const tree of CHAMAN_TREES) expect(tree.cards).toHaveLength(14);
    for (const tree of CHAMAN_TREES) for (const id of tree.cards) expect(CARDS[id]?.classId).toBe('chaman');
  });

  it('les talents donnent les sorts de barre et la carte épique', () => {
    const alloc = emptyAlloc('chaman');
    for (let tier = 0; tier < 5; tier++) toggleTalent(alloc, 'elementaire', tier, 'A', 10, 'chaman');
    const run = newRun(1, null, talentIds(alloc, 'chaman'), 0, 'chaman');
    expect(run.spells).toContain('maitrise_elementaire');
    expect(run.deck.some((k) => k.id === 'avatar_tempete')).toBe(true);
    expect(lootSpells('chaman').sort()).toEqual(['fouet_lave', 'tempete_sable', 'totem_glebe']);
  });
});

describe('les totems', () => {
  it('un totem agit au début du tour ; un nouveau remplace celui de son élément', () => {
    const c = fight(['lieutenant'], ['totem_braise', 'totem_lave', 'totem_pierre']);
    play(c, 'totem_braise');
    play(c, 'totem_lave');
    expect(c.totems!.feu!.id).toBe('lave');
    play(c, 'totem_pierre');
    c.player.block = 100;
    endTurn(c);
    expect(lost(c)).toBe(2);
    expect(c.player.block).toBe(4);
  });

  it('Résonance (Air) : Éclair fait plus avec un totem d\'Air', () => {
    const c = fight(['lieutenant'], ['eclair', 'totem_vents', 'eclair']);
    play(c, 'eclair');
    expect(lost(c)).toBe(7);
    play(c, 'totem_vents');
    play(c, 'eclair');
    expect(lost(c)).toBe(7 + 9);
  });

  it('le Totem de force donne de la Puissance tant qu\'il est en jeu', () => {
    const c = fight(['lieutenant'], ['totem_force', 'totem_pierre']);
    play(c, 'totem_force');
    expect(c.player.puissance).toBe(1);
    play(c, 'totem_pierre');
    expect(c.player.puissance).toBe(0);
  });

  it('le même totem reposé est renforcé : +50 % par renfort, 2 fois au plus', () => {
    const c = fight(['lieutenant'], ['totem_pierre', 'totem_pierre', 'totem_pierre', 'totem_pierre', 'totem_force']);
    play(c, 'totem_pierre');
    expect(c.totems!.terre!.value).toBe(4);
    play(c, 'totem_pierre');
    expect(c.totems!.terre).toMatchObject({ value: 6, stacks: 1 });
    play(c, 'totem_pierre');
    expect(c.totems!.terre).toMatchObject({ value: 8, stacks: 2 });
    expect(totemDescription(c, 'terre')).toContain('Renfort au maximum');
    play(c, 'totem_pierre');
    expect(c.totems!.terre).toMatchObject({ value: 8, stacks: 2 });
    // Un autre totem du même élément remplace, sans renfort.
    play(c, 'totem_force');
    expect(c.totems!.terre!.stacks).toBeUndefined();
    expect(c.player.puissance).toBe(1);
  });

  it('la bulle d\'un totem donne ses valeurs réelles', () => {
    const c = fight(['lieutenant'], ['totem_lave'], { fireTotemBonus: 2 });
    play(c, 'totem_lave');
    expect(totemDescription(c, 'feu')).toContain('4 dégâts à tous les ennemis');
    expect(totemDescription(c, 'eau')).toBeNull();
  });

  it('le Marteau des ancêtres fait agir les totems deux fois', () => {
    const c = fight(['lieutenant'], ['totem_lave'], { marteauAncetres: 1 });
    play(c, 'totem_lave');
    c.player.block = 100;
    endTurn(c);
    expect(lost(c)).toBe(4);
  });
});

describe('les Armes élémentaires et les sorts', () => {
  it('une seule Arme à la fois ; l\'Arme de flammes renforce les Attaques', () => {
    const c = fight(['lieutenant'], ['arme_givre', 'arme_flammes', 'frappe_primitive']);
    play(c, 'arme_givre');
    play(c, 'arme_flammes');
    expect(c.imbues!.map((w) => w.id)).toEqual(['flammes']);
    play(c, 'frappe_primitive');
    expect(lost(c)).toBe(9);
  });

  it('l\'Arme des vents fait frapper la première Attaque deux fois', () => {
    const c = fight(['lieutenant'], ['arme_vents', 'frappe_primitive', 'frappe_primitive']);
    play(c, 'arme_vents');
    play(c, 'frappe_primitive');
    expect(lost(c)).toBe(14);
    play(c, 'frappe_primitive');
    expect(lost(c)).toBe(21);
  });

  it('Concentration élémentaire : le Sort qui suit un gros Sort coûte 1 de moins', () => {
    const c = fight(['lieutenant'], ['concentration_elementaire', 'jet_lave', 'eclair']);
    play(c, 'concentration_elementaire');
    play(c, 'jet_lave');
    expect(energyCost(c, 'eclair', false)).toBe(0);
  });

  it('Choc tellurique interrompt ; Maîtrise élémentaire double le prochain Sort et le rend gratuit', () => {
    const c = fight(['lieutenant'], ['eclair'], {}, ['maitrise_elementaire']);
    spell(c, 'maitrise_elementaire');
    expect(energyCost(c, 'eclair', false)).toBe(0);
    play(c, 'eclair');
    expect(lost(c)).toBe(14);
  });
});

describe('la Réincarnation', () => {
  it('une fois par run, à 0 PV, le Chaman revient à 40 % de ses PV', () => {
    const c = fight(['lieutenant'], []);
    c.player.hp = 1;
    c.player.block = 0;
    endTurn(c);
    expect(c.phase).toBe('player');
    expect(c.ankhUsed).toBe(true);
    expect(c.player.hp).toBeGreaterThan(0);
  });

  it('la run retient qu\'elle a servi', () => {
    const run = newRun(1, null, [], 0, 'chaman');
    run.encounter = { kind: 'combat', name: 'Test', enemies: ['lieutenant'] };
    run.combat = createCombat(run.encounter, run.deck, run.hp, run.maxHp, 1, 100, {}, run.spells, undefined, 'chaman', undefined, undefined, !run.reincarnated);
    run.combat.ankhUsed = true;
    run.screen = 'combat';
    afterCombatAction(run);
    expect(run.reincarnated).toBe(true);
  });
});

describe('le Marteau des ancêtres', () => {
  it('le cercle des anciens, Skarn, puis l\'épreuve des éléments', () => {
    const run = newRun(1, null, [], 0, 'chaman');
    run.eventId = 'cercle';
    run.screen = 'event';
    resolveEvent(run, 2);
    expect(run.marteau).toBe('tete');
    const win = (enc: Encounter) => {
      run.encounter = enc;
      run.combat = createCombat(enc, run.deck, run.hp, run.maxHp, 1, 100, {}, run.spells, undefined, 'chaman');
      run.combat.phase = 'victory';
      run.screen = 'combat';
      afterCombatAction(run);
    };
    win({ kind: 'combat', name: 'Skarn', enemies: ['skarn'], loot: 'skarn' });
    expect(run.marteau).toBe('manche');
    run.act = 2;
    run.eventId = 'appel';
    run.eventOutcome = null;
    run.screen = 'event';
    resolveEvent(run, 0);
    expect(run.screen).toBe('combat');
    expect(run.encounter?.marteau).toBe(true);
    win(run.encounter!);
    expect(run.marteau).toBe('forged');
    expect(run.equipment.arme).toBe('marteau_ancetres');
  });
});
