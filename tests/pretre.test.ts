import { describe, expect, it } from 'vitest';
import { CARDS, rewardPool, starterCards } from '../src/engine/cards';
import { canPlayCard, createCombat, endTurn, playCard, useSpell } from '../src/engine/combat';
import type { Encounter } from '../src/engine/enemies';
import { campfireEquinoxe, canForgeEquinoxe, newRun, resolveEvent } from '../src/engine/run';
import { lootSpells } from '../src/engine/spells';
import { PRETRE_TREES, emptyAlloc, talentIds, toggleTalent } from '../src/engine/talents';
import type { ItemEffects } from '../src/engine/items';
import type { CardInstance, CombatState } from '../src/engine/types';

const deck = (ids: string[]): CardInstance[] => ids.map((id, i) => ({ uid: 1000 + i, id, upgraded: false }));
function fight(enemies: string[], hand: string[], gear: ItemEffects = {}, spells: string[] = ['egide_sacree']): CombatState {
  const enc: Encounter = { kind: 'combat', name: 'Test', enemies };
  const c = createCombat(enc, deck(Array(10).fill('priere_garde')), 70, 70, 7, 1, gear, spells, undefined, 'pretre');
  c.hand = hand.map((id, i) => ({ uid: 5000 + i, id, upgraded: false }));
  c.player.energy = 10;
  return c;
}
const play = (c: CombatState, id: string, target?: number) => playCard(c, c.hand.findIndex((k) => k.id === id), target);
const spell = (c: CombatState, id: string, target?: number) => useSpell(c, c.spells.findIndex((s) => s.id === id), target);

describe('le Prêtre : la run', () => {
  it('70 PV, son deck de départ et Égide sacrée', () => {
    const run = newRun(1, null, [], 0, 'pretre');
    expect(run.maxHp).toBe(70);
    expect(run.spells).toEqual(['egide_sacree']);
    expect(run.deck.filter((k) => k.id === 'chatiment')).toHaveLength(4);
  });

  it('52 cartes en récompense (+ Prière de garde), 14 par arbre', () => {
    expect(rewardPool('pretre')).toHaveLength(52);
    expect(starterCards('pretre')).toEqual(['priere_garde']);
    for (const tree of PRETRE_TREES) expect(tree.cards).toHaveLength(14);
    for (const id of rewardPool('pretre')) expect(CARDS[id].classId).toBe('pretre');
  });

  it('les talents donnent les sorts de barre et la carte épique', () => {
    const alloc = emptyAlloc('pretre');
    for (let tier = 0; tier < 5; tier++) toggleTalent(alloc, 'ombre', tier, 'A', 10, 'pretre');
    const run = newRun(1, null, talentIds(alloc, 'pretre'), 0, 'pretre');
    expect(run.spells).toContain('silence');
    expect(run.deck.some((k) => k.id === 'forme_ombre')).toBe(true);
    expect(lootSpells('pretre').sort()).toEqual(['lien_lumiere', 'pacte_ombre']);
  });
});

describe('l\'Égide', () => {
  it('elle encaisse après le blocage, et reste d\'un tour à l\'autre', () => {
    const c = fight(['lieutenant'], ['egide_renforcee']);
    play(c, 'egide_renforcee');
    expect(c.aegis).toBe(7);
    c.player.block = 3;
    c.enemies[0].intent = { kind: 'attack', dmg: 5 };
    const hp = c.player.hp;
    endTurn(c);
    expect(c.player.hp).toBe(hp);
    expect(c.aegis).toBe(5);
    c.player.block = 0;
    endTurn(c);
    expect(c.aegis).toBeLessThan(5);
  });

  it('plafonnée à 30 ; le soin en trop devient de l\'Égide (la moitié)', () => {
    const c = fight(['lieutenant'], ['bastion_sacre', 'bastion_sacre', 'bastion_sacre', 'soins_superieurs']);
    play(c, 'bastion_sacre');
    play(c, 'bastion_sacre');
    play(c, 'bastion_sacre');
    expect(c.aegis).toBe(30);
    c.aegis = 0;
    c.player.hp = 66;
    play(c, 'soins_superieurs');
    expect(c.player.hp).toBe(70);
    expect(c.aegis).toBe(4);
  });
});

describe('la Foi', () => {
  it('une carte qui soigne ou donne de l\'Égide rapporte 1 Foi', () => {
    const c = fight(['lieutenant'], ['soins_rapides', 'egide_renforcee', 'chatiment']);
    c.player.hp = 50;
    play(c, 'soins_rapides');
    play(c, 'egide_renforcee');
    play(c, 'chatiment');
    expect(c.faith).toBe(2);
  });

  it('Courroux céleste dépense toute la Foi : 4 dégâts par point', () => {
    const c = fight(['kragg'], ['courroux_celeste']);
    expect(canPlayCard(c, 0)).toBe(false);
    c.faith = 5;
    const hp = c.enemies[0].hp;
    play(c, 'courroux_celeste');
    expect(c.faith).toBe(0);
    expect(c.enemies[0].hp).toBe(hp - 20);
  });

  it('la Forme d\'Ombre : Sorts d\'Ombre +30 %, soins réduits de moitié, plus de Foi', () => {
    const c = fight(['kragg'], ['forme_ombre', 'attaque_mentale', 'soins_rapides']);
    play(c, 'forme_ombre');
    const hp = c.enemies[0].hp;
    play(c, 'attaque_mentale');
    expect(c.enemies[0].hp).toBe(hp - Math.floor(9 * 1.3));
    c.player.hp = 50;
    play(c, 'soins_rapides');
    expect(c.player.hp).toBe(53);
    expect(c.faith).toBe(0);
  });
});

describe('les cartes du Prêtre', () => {
  it('Peste mentale : un DoT qui soigne à chaque tick', () => {
    const c = fight(['kragg'], ['peste_mentale']);
    play(c, 'peste_mentale');
    c.player.hp = 50;
    c.player.block = 99;
    endTurn(c);
    expect(c.player.hp).toBeGreaterThanOrEqual(52);
  });

  it('Égide des anciens : 4 Égide par Foi, et les PV ne descendent pas sous 1', () => {
    const c = fight(['lieutenant'], ['egide_anciens']);
    c.faith = 3;
    play(c, 'egide_anciens');
    expect(c.aegis).toBe(12);
    c.aegis = 0;
    c.player.block = 0;
    c.player.hp = 5;
    c.enemies[0].intent = { kind: 'attack', dmg: 40 };
    endTurn(c);
    expect(c.phase).toBe('player');
    expect(c.player.hp).toBe(1);
  });

  it('Ange gardien : une fois, on reste à 1 PV et on est soigné de 15', () => {
    const c = fight(['lieutenant'], ['ange_gardien']);
    play(c, 'ange_gardien');
    c.player.hp = 3;
    c.player.block = 0;
    c.enemies[0].intent = { kind: 'attack', dmg: 40 };
    endTurn(c);
    expect(c.phase).toBe('player');
    expect(c.player.hp).toBe(16);
  });

  it('Bénédiction de vigueur : +4 PV max pour la run', () => {
    const c = fight(['lieutenant'], ['benediction_vigueur']);
    play(c, 'benediction_vigueur');
    expect(c.player.maxHp).toBe(74);
    expect(c.maxHpGain).toBe(4);
  });

  it('Égide sacrée (barre) : 5 Égide, gratuite', () => {
    const c = fight(['lieutenant'], []);
    c.player.energy = 0;
    spell(c, 'egide_sacree');
    expect(c.aegis).toBe(5);
  });
});

describe('Équinoxe', () => {
  it('le Bâton nu à la chapelle, puis le rituel au feu de camp avec la Larme d\'Ysolde', () => {
    const run = newRun(1, null, [], 0, 'pretre');
    run.eventId = 'chapelle';
    run.screen = 'event';
    resolveEvent(run, 2);
    expect(run.equinoxe).toBe('baton');
    run.equinoxe = 'larme';
    run.screen = 'campfire';
    run.act = 2;
    expect(canForgeEquinoxe(run)).toBe(true);
    campfireEquinoxe(run);
    expect(run.equipment.arme).toBe('equinoxe');
  });
});
