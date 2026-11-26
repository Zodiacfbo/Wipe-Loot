import { describe, expect, it } from 'vitest';
import { CARDS } from '../src/engine/cards';
import { canPlayCard, createCombat, endTurn, playCard, resolveTarget } from '../src/engine/combat';
import type { Encounter } from '../src/engine/enemies';
import { EASY_ENCOUNTERS_3, HARD_ENCOUNTERS_3 } from '../src/engine/enemies_acte3';
import { addHallucination, folieStartTurn, gainFolie } from '../src/engine/folie';
import { dispelMagic } from '../src/engine/pretre';
import type { CardInstance, CombatState } from '../src/engine/types';

function deckOf(ids: string[]): CardInstance[] {
  return ids.map((id, i) => ({ uid: 1000 + i, id, upgraded: false }));
}

function combat(enemies: string[], cards: string[] = Array(10).fill('frappe')): CombatState {
  const enc: Encounter = { kind: 'combat', name: 'Test', enemies };
  return createCombat(enc, deckOf(cards), 80, 80, 7, 1);
}

describe('acte 3 : la Folie', () => {
  it('à 5 Folie, une Hallucination qui imite une carte du deck arrive en début de tour', () => {
    const c = combat(['soldat_irem'], ['parade', 'parade', 'parade', 'parade', 'parade', 'parade']);
    gainFolie(c, 5);
    const before = c.hand.length;
    folieStartTurn(c);
    expect(c.hand.length).toBe(before + 1);
    const h = c.hand[c.hand.length - 1];
    expect(h.id).toBe('hallucination');
    expect(h.mimic).toBe('parade');
  });

  it('jouer une Hallucination : aucun effet, 2 PV perdus, puis elle disparaît', () => {
    const c = combat(['soldat_irem']);
    addHallucination(c);
    const i = c.hand.findIndex((card) => card.id === 'hallucination');
    const hp = c.player.hp;
    const block = c.player.block;
    expect(playCard(c, i)).toBe(true);
    expect(c.player.hp).toBe(hp - 2);
    expect(c.player.block).toBe(block);
    expect(c.exhaust.some((card) => card.id === 'hallucination')).toBe(true);
  });

  it('à 10 Folie : Crise de folie, le prochain tour est perdu et la Folie retombe à 0', () => {
    const c = combat(['soldat_irem']);
    gainFolie(c, 12);
    expect(c.folie).toBe(10);
    expect(c.crisis).toBe(true);
    endTurn(c);
    expect(c.player.energy).toBe(0);
    expect(c.hand).toEqual([]);
    expect(c.folie).toBe(0);
    expect(c.crisis).toBe(false);
  });

  it('les Murmures du Prêtre-insecte donnent 2 Folie ; une Dissipation (Magie) en retire 3', () => {
    const c = combat(['pretre_insecte']);
    endTurn(c);
    expect(c.folie).toBe(2);
    gainFolie(c, 2);
    expect(dispelMagic(c)).toBe(true);
    expect(c.folie).toBe(1);
  });

  it('l\'Amulette de lucidité et le Bandeau de l\'oracle réduisent la Folie', () => {
    const c = combat(['soldat_irem']);
    c.gear = { folieLess: 1 };
    gainFolie(c, 2);
    expect(c.folie).toBe(1);
    c.gear = { folieImmune: 1 };
    gainFolie(c, 4);
    expect(c.folie).toBe(1);
  });
});

describe('acte 3 : les ennemis', () => {
  it('la Momie ajoute 2 Sable injouables à la pioche', () => {
    const c = combat(['momie']);
    c.enemies[0].step = 1;
    c.enemies[0].intent = { kind: 'curse', label: 'Malédiction des sables', sable: 2 };
    endTurn(c);
    const sand = [...c.draw, ...c.hand, ...c.discard].filter((card) => card.id === 'sable');
    expect(sand.length).toBe(2);
    expect(CARDS.sable.unplayable).toBe(true);
    const inHand = c.hand.findIndex((card) => card.id === 'sable');
    if (inHand >= 0) expect(canPlayCard(c, inHand)).toBe(false);
  });

  it('le Ver des sables s\'enfouit (impossible à cibler, mais les DoT le touchent), puis surgit', () => {
    const c = combat(['ver_mineur']);
    const ver = c.enemies[0];
    expect(ver.intent.kind).toBe('burrow');
    endTurn(c);
    expect(ver.buried).toBe(1);
    expect(resolveTarget(c, true, ver.uid)).toBe('invalid');
    ver.buffs.saignement = 3;
    ver.buffs.saignementTours = 3;
    c.player.block = 0;
    const hp = c.player.hp;
    endTurn(c);
    expect(ver.hp).toBe(ver.maxHp - 3); // le Saignement l'a touché sous le sable
    expect(ver.buried).toBe(0);
    expect(c.player.hp).toBe(hp - 13); // Surgissement
    expect(resolveTarget(c, true, ver.uid)).not.toBe('invalid');
  });

  it('Résistance : les Tentacules encaissent moitié moins des Attaques', () => {
    const c = combat(['tentacule']);
    const e = c.enemies[0];
    playCard(c, c.hand.findIndex((card) => card.id === 'frappe'));
    expect(e.maxHp - e.hp).toBe(3);
  });

  it('la Frappe perçante du Soldat ignore le blocage', () => {
    const c = combat(['soldat_irem']);
    const e = c.enemies[0];
    e.intent = { kind: 'attack', dmg: 8, pierce: true };
    c.player.block = 50;
    const hp = c.player.hp;
    endTurn(c);
    expect(c.player.hp).toBe(hp - 8);
  });

  it('Nuée : quand un Scarabée meurt, les autres gagnent 1 Puissance', () => {
    const c = combat(['scarabee', 'scarabee', 'scarabee']);
    c.enemies[0].hp = 4;
    playCard(c, c.hand.findIndex((card) => card.id === 'frappe'), c.enemies[0].uid);
    expect(c.enemies[0].dead).toBe(true);
    expect(c.enemies[1].buffs.puissance).toBe(1);
    expect(c.enemies[2].buffs.puissance).toBe(1);
  });

  it('chaque groupe de l\'acte 3 se joue sans erreur pendant 8 tours', () => {
    for (const enc of [...EASY_ENCOUNTERS_3, ...HARD_ENCOUNTERS_3]) {
      const c = createCombat(enc, deckOf(Array(12).fill('frappe')), 200, 200, 3, 1);
      for (let t = 0; t < 8 && c.phase === 'player'; t++) {
        const i = c.hand.findIndex((card, k) => card.id === 'frappe' && canPlayCard(c, k));
        const target = c.enemies.find((e) => !e.dead && !e.untargetable);
        if (i >= 0 && target) playCard(c, i, target.uid);
        endTurn(c);
      }
      expect(c.player.hp, enc.name).toBeLessThan(200);
    }
  });
});
