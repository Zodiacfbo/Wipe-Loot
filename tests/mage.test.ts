import { describe, expect, it } from 'vitest';
import { CARDS, rewardPool, starterCards } from '../src/engine/cards';
import { createCombat, endTurn, playCard, useSpell } from '../src/engine/combat';
import type { Encounter } from '../src/engine/enemies';
import { afterCombatAction, chooseNode, newRun, runGear } from '../src/engine/run';
import { SPELLS, lootSpells } from '../src/engine/spells';
import { MAGE_TREES, TALENTS, emptyAlloc, talentIds, toggleTalent, treesFor } from '../src/engine/talents';
import type { ItemEffects } from '../src/engine/items';
import type { CardInstance, CombatState } from '../src/engine/types';

const deck = (ids: string[]): CardInstance[] => ids.map((id, i) => ({ uid: 1000 + i, id, upgraded: false }));
function fight(enemies: string[], hand: string[], gear: ItemEffects = {}, spells: string[] = ['contresort']): CombatState {
  const enc: Encounter = { kind: 'combat', name: 'Test', enemies };
  const c = createCombat(enc, deck(Array(10).fill('barriere')), 65, 65, 7, 1, gear, spells, undefined, 'mage');
  c.hand = hand.map((id, i) => ({ uid: 5000 + i, id, upgraded: false }));
  c.player.energy = 10;
  return c;
}
const play = (c: CombatState, id: string, target?: number) => playCard(c, c.hand.findIndex((k) => k.id === id), target);
const spell = (c: CombatState, id: string, target?: number) => useSpell(c, c.spells.findIndex((s) => s.id === id), target);

describe('le Mage : la run', () => {
  it('72 PV, son deck de départ et Contresort', () => {
    const run = newRun(1, null, [], 0, 'mage');
    expect(run.classId).toBe('mage');
    expect(run.maxHp).toBe(72);
    expect(run.spells).toEqual(['contresort']);
    expect(run.deck.map((c) => c.id).sort()).toEqual(
      ['barriere', 'barriere', 'barriere', 'barriere', 'boule_de_feu', 'eclair_de_givre', 'trait_de_magie', 'trait_de_magie', 'trait_de_magie', 'trait_de_magie'].sort(),
    );
  });

  it('52 cartes (+ Trait de magie et Barrière) : 10 de tronc commun et 14 par école ; les récompenses ne proposent que des cartes de Mage', () => {
    const pool = rewardPool('mage');
    expect(pool).toHaveLength(52);
    expect(starterCards('mage')).toEqual(['trait_de_magie', 'barriere']);
    expect(pool.every((id) => CARDS[id].classId === 'mage')).toBe(true);
    for (const tree of MAGE_TREES) expect(tree.cards).toHaveLength(14);
    const run = newRun(3, null, [], 0, 'mage');
    const node = run.map.nodes.find((n) => n.type === 'combat' && n.floor > 1)!;
    run.position = run.map.nodes.find((n) => n.next.includes(node.id))!.id;
    chooseNode(run, node.id);
    run.combat!.phase = 'victory';
    afterCombatAction(run);
    expect(run.rewardChoices.every((id) => CARDS[id].classId === 'mage')).toBe(true);
  });

  it('les talents du Mage : 3 arbres, sorts de barre et carte épique', () => {
    expect(treesFor('mage').map((t) => t.id)).toEqual(['arcane', 'feu', 'givre']);
    const alloc = emptyAlloc('mage');
    for (let tier = 0; tier < 5; tier++) expect(toggleTalent(alloc, 'givre', tier, 'A', 10, 'mage')).toBe(true);
    const ids = talentIds(alloc, 'mage');
    expect(ids).toContain('t_carapace_de_glace');
    const run = newRun(1, null, ids, 0, 'mage');
    expect(run.spells).toEqual(['contresort', 'carapace_de_glace']);
    expect(run.deck.some((c) => c.id === 'fracas_glaciaire')).toBe(true);
    expect(runGear(run).gelBonus).toBe(1);
    expect(Object.keys(TALENTS).filter((id) => MAGE_TREES.some((t) => t.tiers.flat().some((d) => d.id === id)))).toHaveLength(27);
  });

  it('les sorts de loot du Mage', () => {
    expect(lootSpells('mage').sort()).toEqual(['bouclier_feu_ancestral', 'vortex_temporel']);
    expect(lootSpells('guerrier')).not.toContain('vortex_temporel');
  });
});

describe('le Mage : le Feu', () => {
  it('la Brûlure fait ses dégâts au début du tour de la cible, puis diminue de 1', () => {
    const c = fight(['lieutenant'], ['roussir']);
    const e = c.enemies[0];
    const hp = e.hp;
    play(c, 'roussir');
    expect(e.hp).toBe(hp - 3);
    expect(e.buffs.brulure).toBe(2);
    endTurn(c);
    expect(e.hp).toBe(hp - 3 - 2);
    expect(e.buffs.brulure).toBe(1);
  });

  it('Éruption : 2 fois la Brûlure ; Combustion la double ; Feu intense ajoute 1', () => {
    const c = fight(['lieutenant'], ['etincelle', 'eruption'], { burnBonus: 1 }, ['combustion']);
    const e = c.enemies[0];
    play(c, 'etincelle');
    expect(e.buffs.brulure).toBe(4);
    spell(c, 'combustion');
    expect(e.buffs.brulure).toBe(8);
    const hp = e.hp;
    play(c, 'eruption');
    expect(e.hp).toBe(hp - 16);
  });

  it('Pyromanie : +5 aux Sorts de Feu à 2 énergie ; les bonus « aux Attaques » ne touchent pas les Sorts', () => {
    const c = fight(['lieutenant'], ['pyromanie', 'boule_de_feu'], { attackBonus: 3, spellBonus: 1 });
    const e = c.enemies[0];
    play(c, 'pyromanie');
    const hp = e.hp;
    play(c, 'boule_de_feu');
    expect(e.hp).toBe(hp - (14 + 5 + 1));
  });
});

describe('le Mage : le Givre', () => {
  it('Fracas glaciaire : Gel 3 sur la cible, puis 8 dégâts à tous, doublés sur chaque ennemi fracassable', () => {
    const c = fight(['lieutenant', 'lieutenant'], ['fracas_glaciaire']);
    const [t, o] = c.enemies;
    const [ht, ho] = [t.hp, o.hp];
    play(c, 'fracas_glaciaire', t.uid);
    expect(ht - t.hp).toBe(16); // Gel 3 : fracassable
    expect(ho - o.hp).toBe(8);
  });

  it('à 5 Gel, un ennemi normal est Gelé et perd son tour', () => {
    const c = fight(['lieutenant'], ['gelure', 'eclair_de_givre']);
    const e = c.enemies[0];
    play(c, 'gelure');
    expect(e.buffs.gel).toBe(4);
    play(c, 'eclair_de_givre');
    expect(e.buffs.gel).toBe(0);
    expect(e.gele).toBe('skip');
    const hp = c.player.hp;
    c.player.block = 0;
    endTurn(c);
    expect(c.player.hp).toBe(hp);
    expect(e.gele).toBeUndefined();
  });

  it('un boss Gelé voit sa prochaine attaque réduite de moitié', () => {
    const c = fight(['kragg'], ['gelure', 'gelure']);
    const k = c.enemies[0];
    play(c, 'gelure');
    play(c, 'gelure');
    expect(k.gele).toBe('half');
  });

  it('Fracasser : double dégâts à 3 Gel ou plus, triple avec Fragmentation', () => {
    const c = fight(['lieutenant'], ['lance_de_glace', 'gelure', 'lance_de_glace', 'fragmentation', 'lance_de_glace']);
    const e = c.enemies[0];
    let hp = e.hp;
    play(c, 'lance_de_glace');
    expect(e.hp).toBe(hp - 3);
    play(c, 'gelure');
    hp = e.hp;
    play(c, 'lance_de_glace');
    expect(e.hp).toBe(hp - 6);
    play(c, 'fragmentation');
    hp = e.hp;
    play(c, 'lance_de_glace');
    expect(e.hp).toBe(hp - 9);
  });

  it('Carapace de glace : immunisé jusqu\'au prochain tour, et le tour se termine', () => {
    const c = fight(['lieutenant', 'lieutenant'], [], {}, ['carapace_de_glace']);
    c.player.block = 0;
    const hp = c.player.hp;
    const turn = c.turn;
    spell(c, 'carapace_de_glace');
    expect(c.turn).toBe(turn + 1);
    expect(c.player.hp).toBe(hp);
    expect(c.player.iceBlock).toBe(false);
  });

  it('Métamorphose : un mouton ne fait rien, mais reprend forme s\'il est blessé', () => {
    const c = fight(['lieutenant'], ['metamorphose']);
    const e = c.enemies[0];
    play(c, 'metamorphose');
    expect(e.mouton).toBe(2);
    c.player.block = 0;
    const hp = c.player.hp;
    endTurn(c);
    expect(c.player.hp).toBe(hp);
    c.hand = [{ uid: 9000, id: 'trait_de_magie', upgraded: false }];
    play(c, 'trait_de_magie');
    expect(e.mouton).toBe(0);
  });
});

describe('le Mage : l\'Arcane', () => {
  it('chaque charge donne +2 dégâts aux Sorts arcaniques ; 4 au plus', () => {
    const c = fight(['lieutenant'], ['deflagration_arcanique', 'deflagration_arcanique', 'trait_de_magie']);
    const e = c.enemies[0];
    play(c, 'deflagration_arcanique');
    play(c, 'deflagration_arcanique');
    expect(c.player.charges).toBe(2);
    const hp = e.hp;
    play(c, 'trait_de_magie');
    expect(e.hp).toBe(hp - (7 + 4));
  });

  it('Stabilité : chaque charge donne +3 dégâts aux Sorts arcaniques au lieu de +2', () => {
    const base = fight(['lieutenant'], ['trait_de_magie']);
    base.player.charges = 2;
    let hp = base.enemies[0].hp;
    play(base, 'trait_de_magie');
    const normal = hp - base.enemies[0].hp;
    const c = fight(['lieutenant'], ['trait_de_magie'], { chargeBonus: 1 });
    c.player.charges = 2;
    hp = c.enemies[0].hp;
    play(c, 'trait_de_magie');
    expect(hp - c.enemies[0].hp).toBe(normal + 2);
  });

  it('Surcharge : à 4 charges, le Mage perd 2 PV en fin de tour (sauf Stabilité)', () => {
    const c = fight(['etincelle'], []);
    c.player.charges = 4;
    c.player.block = 99;
    const hp = c.player.hp;
    endTurn(c);
    expect(c.player.hp).toBe(hp - 2);
    const d = fight(['etincelle'], [], { noOverload: 1 });
    d.player.charges = 4;
    d.player.block = 99;
    const hp2 = d.player.hp;
    endTurn(d);
    expect(d.player.hp).toBe(hp2);
  });

  it('Tempête arcanique : 6 dégâts à tous par charge, sans les consommer', () => {
    const c = fight(['lieutenant', 'lieutenant'], ['tempete_arcanique']);
    c.player.charges = 3;
    const [a, b] = c.enemies.map((e) => e.hp);
    play(c, 'tempete_arcanique');
    expect(c.player.charges).toBe(3);
    expect(c.enemies[0].hp).toBe(a - 18);
    expect(c.enemies[1].hp).toBe(b - 18);
  });

  it('Inspiration : la prochaine carte coûte 0', () => {
    const c = fight(['lieutenant'], ['inspiration', 'boule_de_feu']);
    c.player.energy = 2;
    play(c, 'inspiration');
    play(c, 'boule_de_feu');
    expect(c.player.energy).toBe(2);
  });

  it('Contresort interrompt une Incantation', () => {
    const c = fight(['seigneur'], []);
    const s = c.enemies[0];
    while (!s.intent.cast) {
      c.player.block = 99;
      endTurn(c);
    }
    expect(spell(c, 'contresort', s.uid)).toBe(true);
    expect(s.interrupted).toBe(true);
    expect(SPELLS.contresort.cost).toBe(0);
  });
});

describe('le Mage : paquet de départ selon l\'arbre principal', () => {
  const ids = (talents: string[]) => newRun(1, null, talents, 0, 'mage').deck.map((c) => c.id);
  const count = (deck: string[], id: string) => deck.filter((x) => x === id).length;

  it('Feu : 2 Roussir à la place de 2 Traits de magie', () => {
    const d = ids(['feu_intense', 'souffle_du_dragon', 't_combustion']);
    expect(count(d, 'trait_de_magie')).toBe(2);
    expect(count(d, 'roussir')).toBe(2);
    expect(d).toHaveLength(10);
  });

  it('Givre : 2 Éclairs de givre de plus, 2 Traits de magie de moins', () => {
    const d = ids(['givre_durable', 'froid_glacial']);
    expect(count(d, 'trait_de_magie')).toBe(2);
    expect(count(d, 'eclair_de_givre')).toBe(3);
  });

  it('Arcane, sans talent ou à égalité : le paquet habituel', () => {
    expect(count(ids(['subtilite_arcanique']), 'trait_de_magie')).toBe(4);
    expect(count(ids([]), 'trait_de_magie')).toBe(4);
    expect(count(ids(['feu_intense', 'hiver_precoce']), 'trait_de_magie')).toBe(4);
  });
});

describe('le Mage : Cœur de glace', () => {
  it('Gel 2 à tous tout de suite, puis Gel 2 au début de chaque tour', () => {
    const c = fight(['lieutenant', 'lieutenant'], ['coeur_de_glace']);
    play(c, 'coeur_de_glace');
    expect(c.enemies.map((e) => e.buffs.gel)).toEqual([2, 2]);
    endTurn(c);
    // −1 à la fin du tour ennemi, +2 au début du tour suivant.
    expect(c.enemies.filter((e) => !e.dead).map((e) => e.buffs.gel)).toEqual([3, 3]);
  });
});
