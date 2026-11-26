import { describe, expect, it } from 'vitest';
import { CARDS, energyCost, rewardPool, starterCards } from '../src/engine/cards';
import { changeForm, createCombat, endTurn, playCard, useSpell } from '../src/engine/combat';
import type { Encounter } from '../src/engine/enemies';
import { campfireBindStaffDruid, canBindStaff, newRun } from '../src/engine/run';
import { lootSpells } from '../src/engine/spells';
import { DRUIDE_TREES, emptyAlloc, talentIds, toggleTalent } from '../src/engine/talents';
import type { ItemEffects } from '../src/engine/items';
import type { CardInstance, CombatState } from '../src/engine/types';

const deck = (ids: string[]): CardInstance[] => ids.map((id, i) => ({ uid: 1000 + i, id, upgraded: false }));
function fight(enemies: string[], hand: string[], gear: ItemEffects = {}, spells: string[] = ['seve_vitale']): CombatState {
  const enc: Encounter = { kind: 'combat', name: 'Test', enemies };
  const c = createCombat(enc, deck(Array(10).fill('garde_sylvestre')), 75, 75, 7, 1, gear, spells, undefined, 'druide');
  c.hand = hand.map((id, i) => ({ uid: 5000 + i, id, upgraded: false }));
  c.player.energy = 10;
  for (const e of c.enemies) e.hp = e.maxHp = 200;
  return c;
}
const play = (c: CombatState, id: string, target?: number) => playCard(c, c.hand.findIndex((k) => k.id === id), target);
const spell = (c: CombatState, id: string, target?: number) => useSpell(c, c.spells.findIndex((s) => s.id === id), target);
const lost = (c: CombatState, i = 0) => 200 - c.enemies[i].hp;

describe('le Druide : la run', () => {
  it('75 PV, son deck de départ et Sève vitale', () => {
    const run = newRun(1, null, [], 0, 'druide');
    expect(run.maxHp).toBe(75);
    expect(run.spells).toEqual(['seve_vitale']);
    expect(run.deck.filter((k) => k.id === 'colere')).toHaveLength(4);
    expect(run.deck.some((k) => k.id === 'coup_de_griffe')).toBe(true);
    expect(run.deck.some((k) => k.id === 'griffure')).toBe(true);
  });

  it('53 cartes en récompense (+ Garde sylvestre)', () => {
    expect(rewardPool('druide')).toHaveLength(53);
    expect(starterCards('druide')).toEqual(['garde_sylvestre']);
    for (const tree of DRUIDE_TREES) for (const id of tree.cards) expect(CARDS[id]?.classId).toBe('druide');
  });

  it('les talents donnent les sorts de barre et la carte épique', () => {
    const alloc = emptyAlloc('druide');
    for (let tier = 0; tier < 5; tier++) toggleTalent(alloc, 'farouche', tier, 'A', 10, 'druide');
    const run = newRun(1, null, talentIds(alloc, 'druide'), 0, 'druide');
    expect(run.spells).toContain('regeneration_sauvage');
    expect(run.deck.some((k) => k.id === 'coeur_sauvage')).toBe(true);
    expect(lootSpells('druide').sort()).toEqual(['faveur_lune', 'fureur_meute', 'rugissement_defi']);
  });
});

describe('les formes', () => {
  it('le premier changement de forme est gratuit, les suivants coûtent 1', () => {
    const c = fight(['lieutenant'], []);
    expect(c.form).toBe('normale');
    expect(changeForm(c, 'ours')).toBe(true);
    expect(c.player.energy).toBe(10);
    expect(c.player.robustesse).toBe(3);
    expect(changeForm(c, 'felin')).toBe(true);
    expect(c.player.energy).toBe(9);
    expect(c.player.robustesse).toBe(0);
  });

  it('une carte taguée coûte 1 de plus hors de sa forme', () => {
    const c = fight(['lieutenant'], ['coup_de_griffe']);
    expect(energyCost(c, 'coup_de_griffe', false)).toBe(2);
    changeForm(c, 'ours');
    expect(energyCost(c, 'coup_de_griffe', false)).toBe(1);
  });

  it('l\'Ours gagne de la rage, la perd en quittant la forme (sauf Cœur sauvage)', () => {
    const c = fight(['lieutenant'], ['rage_frenetique', 'coup_de_griffe', 'coeur_sauvage']);
    changeForm(c, 'ours');
    play(c, 'rage_frenetique');
    play(c, 'coup_de_griffe');
    expect(c.bearRage).toBe(5);
    changeForm(c, 'felin');
    expect(c.bearRage).toBe(0);
    const k = fight(['lieutenant'], ['rage_frenetique', 'coeur_sauvage']);
    changeForm(k, 'ours');
    play(k, 'coeur_sauvage');
    play(k, 'rage_frenetique');
    changeForm(k, 'felin');
    expect(k.bearRage).toBe(4);
  });

  it('le Félin : +2 aux Attaques, combo et finisher', () => {
    const c = fight(['lieutenant'], ['griffure', 'laceration', 'morsure_feroce']);
    changeForm(c, 'felin');
    play(c, 'griffure');
    expect(lost(c)).toBe(6);
    play(c, 'laceration');
    expect(c.catCombo).toBe(2);
    const before = lost(c);
    play(c, 'morsure_feroce');
    expect(lost(c) - before).toBe(5 + 12 + 2);
    expect(c.catCombo).toBe(0);
  });

  it('l\'Astrale : +3 aux Sorts', () => {
    const c = fight(['lieutenant'], ['colere']);
    changeForm(c, 'astrale');
    play(c, 'colere');
    expect(lost(c)).toBe(10);
  });

  it('la forme normale renforce les soins', () => {
    const c = fight(['lieutenant'], ['bourgeon']);
    c.player.hp = 40;
    play(c, 'bourgeon');
    expect(c.player.hp).toBe(46);
  });

  it('la Malédiction de lignée ramène en forme normale et bloque les changements', () => {
    const c = fight(['lieutenant'], []);
    changeForm(c, 'ours');
    c.player.debuffs!.lignee = 2;
    expect(changeForm(c, 'felin')).toBe(false);
  });
});

describe('les cartes et les sorts', () => {
  it('Éclipse : Feu stellaire puis Feu de lune double', () => {
    const c = fight(['lieutenant'], ['eclipse', 'feu_stellaire', 'feu_de_lune']);
    changeForm(c, 'astrale');
    play(c, 'eclipse');
    play(c, 'feu_stellaire');
    const before = lost(c);
    play(c, 'feu_de_lune');
    expect(lost(c) - before).toBe((4 + 3) * 2);
  });

  it('Renouveau soigne au début des prochains tours', () => {
    const c = fight(['lieutenant'], ['renouveau']);
    play(c, 'renouveau');
    c.player.hp = 40;
    c.player.block = 100;
    endTurn(c);
    expect(c.player.hp).toBe(46);
  });

  it('Sève vitale : +2 énergie ; Renaissance relève à 40 %', () => {
    const c = fight(['lieutenant'], [], {}, ['seve_vitale', 'renaissance']);
    spell(c, 'seve_vitale');
    expect(c.player.energy).toBe(12);
    spell(c, 'renaissance');
    c.player.hp = 1;
    c.player.block = 0;
    endTurn(c);
    expect(c.phase).toBe('player');
  });

  it('Sylvains : 3 × 3 dégâts à la fin du tour', () => {
    const c = fight(['lieutenant'], ['sylvains']);
    play(c, 'sylvains');
    endTurn(c);
    expect(lost(c)).toBe(9);
  });
});

describe('le Bâton du Veilleur (Druide)', () => {
  it('au feu de camp, le Druide rend un objet à la terre', () => {
    const run = newRun(1, null, [], 0, 'druide');
    run.veilleur = 'tete';
    run.act = 2;
    run.screen = 'campfire';
    expect(canBindStaff(run)).toBe(false);
    run.equipment.amulette = 'amulette_vigueur';
    expect(canBindStaff(run)).toBe(true);
    expect(campfireBindStaffDruid(run, 'amulette')).toBe(true);
    expect(run.equipment.amulette).toBeNull();
    expect(run.equipment.arme).toBe('baton_veilleur_druide');
  });

  it('avec le bâton, le bouton de forme ne coûte rien', () => {
    const c = fight(['lieutenant'], ['griffure'], { freeShiftAll: 1 });
    play(c, 'griffure');
    changeForm(c, 'ours');
    changeForm(c, 'felin');
    expect(c.player.energy).toBe(9);
  });
});
