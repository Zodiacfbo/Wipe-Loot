import { describe, expect, it } from 'vitest';
import { CARDS, rewardPool, starterCards } from '../src/engine/cards';
import { canPlayCard, choosePet, createCombat, endTurn, playCard, useSpell } from '../src/engine/combat';
import type { Encounter } from '../src/engine/enemies';
import { afterCombatAction, campfireBindStaff, canBindStaff, chooseNode, newRun } from '../src/engine/run';
import { lootSpells } from '../src/engine/spells';
import { DEMONISTE_TREES, emptyAlloc, talentIds, toggleTalent } from '../src/engine/talents';
import { uselessFor } from '../src/engine/items';
import type { ItemEffects } from '../src/engine/items';
import type { CardInstance, CombatState } from '../src/engine/types';

const deck = (ids: string[]): CardInstance[] => ids.map((id, i) => ({ uid: 1000 + i, id, upgraded: false }));
function fight(enemies: string[], hand: string[], opts: { gear?: ItemEffects; spells?: string[]; shards?: number; pet?: 'diablotin' | 'rodeur' } = {}): CombatState {
  const enc: Encounter = { kind: 'combat', name: 'Test', enemies };
  const c = createCombat(enc, deck(Array(10).fill('garde_sombre')), 70, 70, 7, 1, opts.gear ?? {}, opts.spells ?? ['pacte_de_sang'], undefined, 'demoniste', { shards: opts.shards ?? 0, pet: opts.pet ?? 'diablotin' });
  c.hand = hand.map((id, i) => ({ uid: 5000 + i, id, upgraded: false }));
  c.player.energy = 10;
  return c;
}
const play = (c: CombatState, id: string, target?: number) => playCard(c, c.hand.findIndex((k) => k.id === id), target);
const spell = (c: CombatState, id: string, target?: number) => useSpell(c, c.spells.findIndex((s) => s.id === id), target);

describe('le Démoniste : la run', () => {
  it('74 PV, son deck de départ, Pacte de sang, et 0 éclat', () => {
    const run = newRun(1, null, [], 0, 'demoniste');
    expect(run.maxHp).toBe(74);
    expect(run.spells).toEqual(['pacte_de_sang']);
    expect(run.shards).toBe(0);
    expect(run.deck.filter((c) => c.id === 'trait_ombre')).toHaveLength(4);
  });

  it('51 cartes en récompense (+ Garde sombre), 14 par arbre', () => {
    expect(rewardPool('demoniste')).toHaveLength(51);
    expect(starterCards('demoniste')).toEqual(['garde_sombre']);
    for (const tree of DEMONISTE_TREES) expect(tree.cards).toHaveLength(14);
    for (const id of rewardPool('demoniste')) expect(CARDS[id].classId).toBe('demoniste');
  });

  it('les talents donnent les sorts de barre et la carte épique', () => {
    const alloc = emptyAlloc('demoniste');
    for (let tier = 0; tier < 5; tier++) toggleTalent(alloc, 'destruction', tier, 'A', 10, 'demoniste');
    const run = newRun(1, null, talentIds(alloc, 'demoniste'), 0, 'demoniste');
    expect(run.spells).toContain('brulure_ombre');
    expect(run.deck.some((c) => c.id === 'cataclysme')).toBe(true);
    expect(lootSpells('demoniste').sort()).toEqual(['cercle_teleportation', 'oeil_abime']);
  });

  it('les éclats d\'âme se gardent d\'un combat à l\'autre', () => {
    const run = newRun(3, null, [], 0, 'demoniste');
    run.shards = 2;
    const node = run.map.nodes.find((n) => n.floor === 0)!;
    chooseNode(run, node.id);
    expect(run.combat!.shards).toBe(2);
    run.combat!.shards = 4;
    run.combat!.phase = 'victory';
    afterCombatAction(run);
    expect(run.shards).toBe(4);
  });

  it('les bonus aux Sorts et aux alliés servent au Démoniste, pas les bonus aux Attaques', () => {
    expect(uselessFor('baguette_apprenti', 'demoniste')).toBe(false);
    expect(uselessFor('bague_molosses', 'demoniste')).toBe(false);
    expect(uselessFor('epee_longue', 'demoniste')).toBe(true);
  });
});

describe('le familier', () => {
  it('le Diablotin frappe à la fin de ton tour ; le Rôdeur du néant donne du blocage', () => {
    const c = fight(['lieutenant'], []);
    const hp = c.enemies[0].hp;
    c.player.block = 50;
    endTurn(c);
    expect(c.enemies[0].hp).toBe(hp - 4);
    const r = fight(['etincelle'], [], { pet: 'rodeur' });
    r.enemies[0].intent = { kind: 'attack', dmg: 0 };
    endTurn(r);
    expect(r.player.block).toBe(0); // le blocage du Rôdeur a servi pendant le tour ennemi, puis tombe
  });

  it('on choisit son familier au premier tour, avant de jouer une carte', () => {
    const c = fight(['lieutenant'], ['trait_ombre']);
    expect(choosePet(c, 'rodeur')).toBe(true);
    expect(c.pet).toBe('rodeur');
    play(c, 'trait_ombre');
    expect(choosePet(c, 'diablotin')).toBe(false);
  });

  it('Invocation : Succube coûte 1 éclat (0 une fois améliorée)', () => {
    const c = fight(['lieutenant'], ['invocation_succube']);
    expect(canPlayCard(c, 0)).toBe(false);
    c.shards = 1;
    expect(play(c, 'invocation_succube')).toBe(true);
    expect(c.pet).toBe('succube');
    expect(c.shards).toBe(0);
  });

  it('Sacrifice démoniaque : plus de familier, +2 Puissance et +1 énergie par tour', () => {
    const c = fight(['lieutenant'], ['sacrifice_demoniaque']);
    play(c, 'sacrifice_demoniaque');
    expect(c.player.puissance).toBe(2);
    c.player.block = 99;
    const hp = c.enemies[0].hp;
    endTurn(c);
    expect(c.enemies[0].hp).toBe(hp);
    expect(c.player.energy).toBe(4);
  });
});

describe('DoT, Malédictions et éclats', () => {
  it('Corruption : un DoT qui frappe au début du tour de la cible, en ignorant son blocage', () => {
    const c = fight(['lieutenant'], ['corruption'], { pet: 'rodeur' });
    const e = c.enemies[0];
    play(c, 'corruption');
    expect(e.dots).toEqual([{ id: 'corruption', dmg: 4, turns: 4 }]);
    e.block = 50;
    const hp = e.hp;
    c.player.block = 99;
    endTurn(c);
    expect(e.hp).toBe(hp - 4);
    expect(e.dots![0].turns).toBe(3);
  });

  it('un ennemi qui meurt sous un DoT donne 1 éclat ; Siphon d\'âme en donne 2', () => {
    const c = fight(['etincelle', 'etincelle'], ['corruption', 'trait_ombre', 'siphon_ame']);
    const [a, b] = c.enemies;
    play(c, 'corruption', a.uid);
    a.hp = 6;
    play(c, 'trait_ombre', a.uid);
    expect(a.dead).toBe(true);
    expect(c.shards).toBe(1);
    b.hp = 4;
    play(c, 'siphon_ame', b.uid);
    expect(b.dead).toBe(true);
    expect(c.shards).toBe(3);
  });

  it('une seule Malédiction par ennemi : la nouvelle remplace l\'ancienne', () => {
    const c = fight(['lieutenant'], ['malediction_faiblesse', 'malediction_elements']);
    const e = c.enemies[0];
    play(c, 'malediction_faiblesse');
    expect(e.buffs.demoralise).toBe(5);
    play(c, 'malediction_elements');
    expect(e.curses).toEqual(['elements']);
    expect(e.buffs.demoralise).toBe(0);
    expect(e.elements).toBe(30);
  });

  it('Malédiction des éléments : +30 % de dégâts des Sorts', () => {
    const c = fight(['lieutenant'], ['malediction_elements', 'trait_ombre']);
    const e = c.enemies[0];
    play(c, 'malediction_elements');
    const hp = e.hp;
    play(c, 'trait_ombre');
    expect(e.hp).toBe(hp - Math.floor(7 * 1.3));
  });

  it('Cataclysme de l\'âme : 5 dégâts à tous par éclat possédé, sans les dépenser', () => {
    const c = fight(['lieutenant', 'lieutenant'], ['cataclysme'], { shards: 3 });
    const hp = c.enemies.map((e) => e.hp);
    play(c, 'cataclysme');
    expect(c.shards).toBe(3);
    expect(c.enemies[0].hp).toBe(hp[0] - 15);
    expect(c.enemies[1].hp).toBe(hp[1] - 15);
  });

  it('Corruption améliorée : tes DoT infligent +2 par tour', () => {
    const c = fight(['lieutenant'], ['tempete_afflictions'], { gear: { dotBonus: 2 } });
    const e = c.enemies[0];
    e.dots = [{ id: 'corruption', dmg: 4, turns: 2 }];
    const hp = e.hp;
    play(c, 'tempete_afflictions');
    expect(hp - e.hp).toBe(12);
  });

  it('Tempête d\'afflictions coûte 1, déclenche deux fois les DoT et les prolonge de 1 tour', () => {
    expect(CARDS.tempete_afflictions.cost).toBe(1);
    const c = fight(['lieutenant'], ['tempete_afflictions']);
    const e = c.enemies[0];
    e.dots = [{ id: 'corruption', dmg: 4, turns: 2 }];
    const hp = e.hp;
    play(c, 'tempete_afflictions');
    expect(hp - e.hp).toBe(8);
    expect(e.dots[0].turns).toBe(3);
  });

  it('Conflagration consomme l\'Immolation : 3 fois ce qu\'il lui restait', () => {
    const c = fight(['kragg'], ['immolation', 'conflagration'], { pet: 'rodeur' });
    const e = c.enemies[0];
    play(c, 'immolation');
    const hp = e.hp;
    play(c, 'conflagration');
    expect(e.hp).toBe(hp - 4 * 3 * 3);
    expect(e.dots).toEqual([]);
  });
});

describe('le prix du sang', () => {
  it('Pacte de sang : 5 PV contre 1 énergie et 1 carte', () => {
    const c = fight(['lieutenant'], [], { spells: ['pacte_de_sang'] });
    c.player.energy = 0;
    const hp = c.player.hp;
    spell(c, 'pacte_de_sang');
    expect(c.player.hp).toBe(hp - 5);
    expect(c.player.energy).toBe(1);
    expect(c.hand).toHaveLength(1);
  });

  it('la Pierre d\'âme relève le Démoniste à 30 % de ses PV', () => {
    const c = fight(['lieutenant'], [], { spells: ['pierre_ame'], shards: 1 });
    spell(c, 'pierre_ame');
    expect(c.shards).toBe(0);
    c.player.hp = 3;
    c.player.block = 0;
    c.enemies[0].intent = { kind: 'attack', dmg: 50 };
    endTurn(c);
    expect(c.phase).toBe('player');
    expect(c.player.hp).toBe(Math.floor(70 * 0.3));
  });
});

describe('le Bâton du Veilleur du Démoniste', () => {
  it('au feu de camp, avec la Tête du bâton : 3 éclats d\'âme pour le sceller', () => {
    const run = newRun(1, null, [], 0, 'demoniste');
    run.screen = 'campfire';
    run.act = 2;
    run.veilleur = 'tete';
    run.shards = 2;
    expect(canBindStaff(run)).toBe(false);
    run.shards = 3;
    expect(campfireBindStaff(run)).toBe(true);
    expect(run.equipment.arme).toBe('baton_veilleur_demo');
    expect(run.shards).toBe(0);
  });
});
