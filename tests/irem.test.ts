import { describe, expect, it } from 'vitest';
import { CARDS } from '../src/engine/cards';
import { canPlayCard, createCombat, endTurn, playCard } from '../src/engine/combat';
import { ENEMIES, type Encounter } from '../src/engine/enemies';
import { ELITE_ENCOUNTERS_3, IREM } from '../src/engine/enemies_acte3';
import { damageEnemy } from '../src/engine/actions';
import { ITEMS, LOOT_TABLES, uselessFor } from '../src/engine/items';
import { dispelMagic } from '../src/engine/pretre';
import type { CardInstance, CombatState } from '../src/engine/types';

function deckOf(ids: string[]): CardInstance[] {
  return ids.map((id, i) => ({ uid: 1000 + i, id, upgraded: false }));
}

function combat(enemies: string[], cards: string[] = Array(10).fill('frappe'), classId = 'guerrier'): CombatState {
  const enc: Encounter = { kind: 'combat', name: 'Test', enemies, enrageTurn: 10 };
  return createCombat(enc, deckOf(cards), 200, 200, 7, 1, {}, ['charge'], undefined, classId);
}

/** Met une carte en main (en tête) et renvoie son index. */
function give(c: CombatState, id: string): number {
  c.hand.unshift({ uid: c.nextUid++, id, upgraded: false });
  c.player.energy = 10;
  return 0;
}

const living = (c: CombatState) => c.enemies.filter((e) => !e.dead);

describe('acte 3 : les boss secondaires', () => {
  it('7 boss secondaires, chacun avec sa table de 4 objets', () => {
    expect(ELITE_ENCOUNTERS_3).toHaveLength(7);
    for (const enc of ELITE_ENCOUNTERS_3) {
      expect(enc.enrageTurn).toBe(10);
      expect(LOOT_TABLES[enc.loot!]).toHaveLength(4);
      for (const id of LOOT_TABLES[enc.loot!]) expect(ITEMS[id], id).toBeDefined();
      for (const id of enc.enemies) expect(ENEMIES[id].elite, id).toBe(true);
    }
  });

  it('chaque boss se joue sans erreur pendant 12 tours', () => {
    for (const enc of ELITE_ENCOUNTERS_3) {
      const c = createCombat(enc, deckOf([...Array(8).fill('frappe'), 'tourbillon', 'cri_demoralisant', 'parade', 'parade']), 300, 300, 3, 1);
      for (let t = 0; t < 12 && c.phase === 'player'; t++) {
        for (let k = 0; k < 3; k++) {
          const i = c.hand.findIndex((card, j) => canPlayCard(c, j) && card.id !== 'hallucination');
          const target = living(c).find((e) => !e.untargetable);
          if (i >= 0) playCard(c, i, target?.uid);
        }
        endTurn(c);
      }
      expect(c.player.hp, enc.name).toBeLessThan(300);
    }
  });
});

describe('Méhkar', () => {
  it('à 75 % de PV, il crée 2 Copies, et plus personne n\'est reconnaissable', () => {
    const c = combat(['mehkar']);
    const m = c.enemies[0];
    damageEnemy(c, m, 26);
    expect(living(c)).toHaveLength(3);
    expect(living(c).every((e) => e.masked)).toBe(true);
    expect(living(c).filter((e) => e.defId === 'mehkar_copie')).toHaveLength(2);
    // Toucher le vrai le révèle.
    damageEnemy(c, m, 1);
    expect(m.masked).toBe(false);
  });

  it('une Copie disparaît dès qu\'elle subit 15 dégâts ; le vrai tombé, les Copies s\'évanouissent', () => {
    const c = combat(['mehkar']);
    const m = c.enemies[0];
    damageEnemy(c, m, 60); // 75 % puis 50 % : 4 Copies
    const copies = living(c).filter((e) => e.defId === 'mehkar_copie');
    expect(copies).toHaveLength(4);
    damageEnemy(c, copies[0], 15);
    expect(copies[0].dead).toBe(true);
    expect(copies[0].gone).toBe(true);
    damageEnemy(c, m, 40);
    expect(m.dead).toBe(true);
    expect(c.phase).toBe('victory');
  });

  it('Domination mentale : ta prochaine Attaque te frappe toi-même, ses autres effets sont perdus', () => {
    const c = combat(['mehkar']);
    c.dominated = true;
    const m = c.enemies[0];
    const hp = c.player.hp;
    const rage = c.player.rage;
    playCard(c, give(c, 'frappe'), m.uid);
    expect(m.hp).toBe(m.maxHp);
    expect(c.player.hp).toBe(hp - 6);
    expect(c.player.rage).toBe(rage);
    expect(c.dominated).toBe(false);
    // Une Attaque de zone te frappe une fois.
    c.dominated = true;
    c.player.block = 3;
    playCard(c, give(c, 'tourbillon'));
    expect(c.player.hp).toBe(hp - 6 - 5);
    expect(c.player.block).toBe(0);
    // La suivante redevient normale.
    playCard(c, give(c, 'frappe'), m.uid);
    expect(m.hp).toBe(m.maxHp - 6);
  });

  it('l\'incantation Domination mentale annoncée place la Domination', () => {
    const c = combat(['mehkar']);
    const m = c.enemies[0];
    m.intent = ENEMIES.mehkar.cycle[2];
    endTurn(c);
    expect(c.dominated).toBe(true);
  });
});

describe('les Rois-Jumeaux', () => {
  it('Asheth est immunisé aux Sorts, Neshet aux Attaques ; les zones passent', () => {
    const c = combat(['asheth', 'neshet'], Array(10).fill('frappe'), 'mage');
    const [a, n] = c.enemies;
    playCard(c, give(c, 'frappe'), n.uid);
    expect(n.hp).toBe(n.maxHp);
    playCard(c, give(c, 'eclair_de_givre'), a.uid);
    expect(a.hp).toBe(a.maxHp);
    playCard(c, give(c, 'frappe'), a.uid);
    expect(a.hp).toBe(a.maxHp - 6);
    playCard(c, give(c, 'tourbillon'));
    expect(n.hp).toBe(n.maxHp - 8);
  });

  it('tous les 3 tours, ils échangent leurs immunités', () => {
    const c = combat(['asheth', 'neshet']);
    endTurn(c);
    endTurn(c);
    expect(c.enemies[0].immune).toBe('sorts');
    endTurn(c);
    expect(c.enemies[0].immune).toBe('attaques');
    expect(c.enemies[1].immune).toBe('sorts');
  });

  it('Lien des jumeaux : le Roi tombé se relève 2 tours plus tard à 30 % de PV', () => {
    const c = combat(['asheth', 'neshet']);
    const [a, n] = c.enemies;
    damageEnemy(c, a, 999);
    expect(a.dead).toBe(true);
    expect(c.phase).toBe('player');
    endTurn(c);
    expect(a.dead).toBe(true);
    endTurn(c);
    expect(a.dead).toBe(false);
    expect(a.hp).toBe(Math.round(a.maxHp * IREM.twinsReviveRatio));
    // Les deux tués à temps : victoire.
    damageEnemy(c, a, 999);
    damageEnemy(c, n, 999);
    expect(c.phase).toBe('victory');
  });
});

describe('Gharul', () => {
  it('s\'enfouit 2 tours ; pendant ce temps, une carte Sable arrive dans ta main à chaque tour', () => {
    const c = combat(['gharul']);
    const g = c.enemies[0];
    g.step = 2;
    g.intent = ENEMIES.gharul.cycle[2];
    endTurn(c);
    expect(g.buried).toBe(2);
    expect(c.hand.filter((card) => card.id === 'sable')).toHaveLength(1);
    endTurn(c);
    expect(g.buried).toBe(1);
    expect(c.hand.filter((card) => card.id === 'sable')).toHaveLength(1);
    c.player.block = 0;
    const hp = c.player.hp;
    endTurn(c);
    expect(g.buried).toBe(0);
    expect(c.player.hp).toBe(hp - 24); // Surgissement
  });

  it('Dent de Gharul : double dégâts sur l\'ennemi qui vient de resurgir', () => {
    const c = combat(['gharul']);
    c.gear = { surfaceDouble: 1 };
    const g = c.enemies[0];
    g.surfaced = true;
    playCard(c, give(c, 'frappe'), g.uid);
    expect(g.maxHp - g.hp).toBe(12);
    playCard(c, give(c, 'frappe'), g.uid);
    expect(g.maxHp - g.hp).toBe(18);
  });
});

describe('la Triade de la Ruche', () => {
  it('Vengeance royale : les survivants se soignent de 20 et frappent 50 % plus fort', () => {
    const c = combat(['kesh', 'vorra', 'tazz']);
    const [k, v, t] = c.enemies;
    k.hp = 30;
    damageEnemy(c, t, 999);
    expect(k.hp).toBe(50);
    expect(k.vengeance && v.vengeance).toBe(true);
    k.intent = { kind: 'attack', dmg: 10 };
    v.intent = { kind: 'block', amount: 0 };
    c.player.block = 0;
    const hp = c.player.hp;
    endTurn(c);
    expect(c.player.hp).toBe(hp - 15);
  });

  it('Soins royaux : Vorra soigne les deux autres', () => {
    const c = combat(['kesh', 'vorra', 'tazz']);
    const [k, , t] = c.enemies;
    k.hp = 30;
    t.hp = 10;
    k.intent = { kind: 'block', amount: 0 };
    t.intent = { kind: 'block', amount: 0 };
    endTurn(c);
    expect(k.hp).toBe(45);
    expect(t.hp).toBe(25);
  });
});

describe('le Limon primordial', () => {
  it('Corps visqueux : moitié moins de dégâts', () => {
    const c = combat(['limon']);
    playCard(c, give(c, 'frappe'), c.enemies[0].uid);
    expect(c.enemies[0].maxHp - c.enemies[0].hp).toBe(3);
  });

  it('Figeage : 5 débuffs le Figent (il n\'agit plus, double dégâts) ; les DoT ne comptent pas', () => {
    const c = combat(['limon']);
    const l = c.enemies[0];
    l.buffs.saignement = 5;
    l.buffs.saignementTours = 3;
    playCard(c, give(c, 'frappe'), l.uid);
    expect(l.figeage ?? 0).toBe(0);
    playCard(c, give(c, 'cri_demoralisant'));
    playCard(c, give(c, 'fracasser_armure'), l.uid);
    playCard(c, give(c, 'coup_de_tonnerre'));
    expect(l.figeage).toBe(3);
    playCard(c, give(c, 'cri_demoralisant'));
    playCard(c, give(c, 'fracasser_armure'), l.uid);
    expect(l.fige).toBe(IREM.limonFrozenTurns);
    expect(l.figeage).toBe(0);
    const before = l.hp;
    playCard(c, give(c, 'frappe'), l.uid);
    expect(before - l.hp).toBe(Math.floor(6 * 1.5) * 2); // Armure fracassée, puis double
    l.intent = { kind: 'attack', dmg: 50 };
    const hp = c.player.hp;
    c.player.block = 0;
    endTurn(c);
    expect(c.player.hp).toBeGreaterThan(hp - 20); // il n'a pas frappé (seul le saignement des débuffs joue)
  });

  it('à 0 PV, il se divise en 3 s\'il n\'est pas Figé ; Figé, il meurt pour de bon', () => {
    const c = combat(['limon']);
    damageEnemy(c, c.enemies[0], 999);
    expect(living(c).map((e) => e.defId)).toEqual(['limon_mineur', 'limon_mineur', 'limon_mineur']);
    expect(c.phase).toBe('player');
    const c2 = combat(['limon']);
    c2.enemies[0].fige = 2;
    damageEnemy(c2, c2.enemies[0], 999);
    expect(c2.phase).toBe('victory');
  });

  it('Fiole de limon et Bague primordiale', () => {
    const c = combat(['soldat_irem']);
    c.gear = { debuffDamage: 2, debuffLonger: 1 };
    const e = c.enemies[0];
    playCard(c, give(c, 'cri_demoralisant'));
    expect(e.maxHp - e.hp).toBe(2);
    expect(e.buffs.demoralise).toBe(3);
  });
});

describe('Sartaq', () => {
  it('Suprématie : +25 blocage à chacun de ses tours ; le Cristal tous les 3 tours brise sa défense', () => {
    const c = combat(['sartaq']);
    const s = c.enemies[0];
    endTurn(c);
    expect(s.block).toBe(IREM.sartaqBlock);
    endTurn(c);
    expect(c.hand.some((card) => card.id === 'cristal_obsidienne')).toBe(true);
    const i = c.hand.findIndex((card) => card.id === 'cristal_obsidienne');
    c.player.energy = 5;
    playCard(c, i);
    expect(s.block).toBe(0);
    expect(s.buffs.armureFracassee).toBe(2);
    playCard(c, give(c, 'frappe'), s.uid);
    expect(s.maxHp - s.hp).toBe(9);
    endTurn(c);
    expect(s.block).toBe(0); // Suprématie suspendue
    endTurn(c);
    expect(s.block).toBe(IREM.sartaqBlock);
    expect(CARDS.cristal_obsidienne.exhaust).toBe(true);
  });
});

describe('Nebet', () => {
  it('Chœur des murmures : +2 Folie à chacun de ses tours, 3 sous 50 %', () => {
    const c = combat(['nebet']);
    const n = c.enemies[0];
    n.intent = { kind: 'block', amount: 0 };
    endTurn(c);
    expect(c.folie).toBe(2);
    n.hp = 40;
    n.intent = { kind: 'block', amount: 0 };
    endTurn(c);
    expect(c.folie).toBe(5);
  });

  it('Vision partagée : 2 Hallucinations ; Regard du dieu : 20 dégâts à 5 Folie ou plus', () => {
    const c = combat(['nebet']);
    const n = c.enemies[0];
    n.intent = ENEMIES.nebet.cycle[1];
    endTurn(c);
    expect(c.hand.filter((card) => card.id === 'hallucination').length).toBeGreaterThanOrEqual(2);
    c.folie = 5;
    n.intent = ENEMIES.nebet.cycle[2];
    c.player.block = 0;
    const hp = c.player.hp;
    endTurn(c);
    expect(hp - c.player.hp).toBe(20);
  });
});

describe('le butin d\'Irem', () => {
  it('Bague de l\'esprit clair : une Dissipation pioche 1 carte', () => {
    const c = combat(['nebet'], Array(10).fill('frappe'), 'pretre');
    c.gear = { dispelDraw: 1 };
    const n = c.hand.length;
    dispelMagic(c);
    expect(c.hand.length).toBe(n + 1);
  });

  it('Bague du sable mouvant : le Sable et les Hallucinations quittent ta main ; Larme du rêveur : +1 énergie', () => {
    const c = combat(['gharul']);
    c.gear = { statusPurge: 1, hallucinationEnergy: 1 };
    c.enemies[0].buried = 2;
    c.enemies[0].intent = { kind: 'block', amount: 0 };
    c.hand.push({ uid: 999, id: 'hallucination', upgraded: false, mimic: 'frappe' });
    endTurn(c);
    expect(c.hand.some((card) => card.id === 'sable' || card.id === 'hallucination')).toBe(false);
  });

  it('Bague des reflets : la première carte de Sort du combat est jouée deux fois', () => {
    const c = combat(['soldat_irem'], Array(10).fill('frappe'), 'mage');
    c.gear = { firstSpellTwice: 1 };
    const e = c.enemies[0];
    playCard(c, give(c, 'eclair_de_givre'), e.uid);
    expect(e.maxHp - e.hp).toBe(14);
    playCard(c, give(c, 'eclair_de_givre'), e.uid);
    expect(e.maxHp - e.hp).toBe(21);
  });

  it('Amulette gélatineuse : −2 dégâts sur les attaques de 10 ou plus', () => {
    const c = combat(['soldat_irem']);
    c.gear = { bigHitReduce: 2 };
    c.enemies[0].intent = { kind: 'attack', dmg: 10 };
    c.player.block = 0;
    const hp = c.player.hp;
    endTurn(c);
    expect(hp - c.player.hp).toBe(8);
  });

  it('les objets d\'Attaque sont signalés inutiles aux classes de Sorts', () => {
    expect(uselessFor('dent_gharul', 'mage')).toBe(true);
    expect(uselessFor('bague_reflets', 'guerrier')).toBe(true);
    expect(uselessFor('peau_ver', 'mage')).toBe(false);
  });
});
