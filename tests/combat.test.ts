import { describe, expect, it } from 'vitest';
import { changePosture, createCombat, endTurn, playCard, useSpell } from '../src/engine/combat';
import { TUNING, type Encounter } from '../src/engine/enemies';
import { reachable } from '../src/engine/map';
import {
  afterCombatAction, buyCard, buyRemoval, buyUpgrade, chooseNode, chooseReward, defaultBreakSlot, newRun, retryAfterWipe, retryHp, servicePrice, wipeBreaks,
} from '../src/engine/run';
import { migrate } from '../src/engine/save';
import type { RunState } from '../src/engine/types';
import type { CardInstance, CombatState } from '../src/engine/types';

function deckOf(ids: string[]): CardInstance[] {
  return ids.map((id, i) => ({ uid: 1000 + i, id, upgraded: false }));
}

function combat(enemies: string[], cards: string[], enrageTurn?: number): CombatState {
  const enc: Encounter = { kind: 'combat', name: 'Test', enemies, enrageTurn };
  return createCombat(enc, deckOf(cards), 80, 80, 42, 1);
}

function handIndex(c: CombatState, id: string): number {
  return c.hand.findIndex((card) => card.id === id);
}

describe('rage et postures', () => {
  it('une Attaque qui touche donne 1 rage, 2 en Berserker', () => {
    const c = combat(['lieutenant'], ['frappe', 'frappe', 'frappe', 'frappe', 'frappe']);
    playCard(c, handIndex(c, 'frappe'));
    expect(c.player.rage).toBe(1);
    changePosture(c, 'berserker');
    playCard(c, handIndex(c, 'frappe'));
    expect(c.player.rage).toBe(3);
  });

  it('changer de posture plafonne la rage à 3, une seule fois par tour', () => {
    const c = combat(['lieutenant'], ['parade', 'parade', 'parade', 'parade', 'parade']);
    c.player.rage = 8;
    expect(changePosture(c, 'defensive')).toBe(true);
    expect(c.player.rage).toBe(3);
    expect(changePosture(c, 'combat')).toBe(false);
  });

  it('Charge donne 3 rage et passe en recharge 3 tours', () => {
    const c = combat(['lieutenant'], ['parade', 'parade', 'parade', 'parade', 'parade']);
    expect(useSpell(c, 0)).toBe(true);
    expect(c.player.rage).toBe(3);
    expect(c.spells[0].cooldown).toBe(3);
    expect(useSpell(c, 0)).toBe(false);
  });

  it('Frappe héroïque coûte 3 rage et profite du bonus de la posture de Combat', () => {
    const c = combat(['lieutenant'], ['frappe_heroique', 'parade', 'parade', 'parade', 'parade']);
    const i = handIndex(c, 'frappe_heroique');
    expect(playCard(c, i)).toBe(false); // pas assez de rage
    c.player.rage = 3;
    const hp = c.enemies[0].hp;
    expect(playCard(c, handIndex(c, 'frappe_heroique'))).toBe(true);
    expect(hp - c.enemies[0].hp).toBe(17);
    expect(c.player.rage).toBe(1); // 3 - 3 + 1 (l'attaque a touché)
  });

  it('Exécution dépense toute la rage', () => {
    const c = combat(['lieutenant'], ['execution', 'parade', 'parade', 'parade', 'parade']);
    c.player.rage = 5;
    const hp = c.enemies[0].hp;
    playCard(c, handIndex(c, 'execution'));
    expect(hp - c.enemies[0].hp).toBe(5 * 4 + 3); // 4 par point + bonus de la posture de Combat
  });
});

describe('incantations', () => {
  it('Coup de bouclier interrompt une incantation : l\'ennemi ne fait rien ce tour-là', () => {
    const c = combat(['seigneur'], ['coup_de_bouclier', 'parade', 'parade', 'parade', 'parade']);
    expect(c.enemies[0].intent.cast).toBe('Boule de lave');
    playCard(c, handIndex(c, 'coup_de_bouclier'));
    expect(c.enemies[0].interrupted).toBe(true);
    endTurn(c);
    expect(c.player.hp).toBe(80);
    expect(c.enemies[0].intent.cast).toBeUndefined();
  });

  it('sans interruption, la Boule de lave frappe', () => {
    const c = combat(['seigneur'], ['parade', 'parade', 'parade', 'parade', 'parade']);
    endTurn(c);
    expect(c.player.hp).toBe(80 - 15);
  });
});

describe('statuts et effets', () => {
  it('une Zone de feu gardée en main inflige 6 dégâts à la fin du tour', () => {
    const c = combat(['lieutenant'], ['parade', 'parade', 'parade', 'parade', 'parade']);
    c.hand.push({ uid: 999, id: 'zone_de_feu', upgraded: false });
    c.player.block = 0;
    endTurn(c);
    // 6 (zone de feu) + 7 (attaque du lieutenant)
    expect(c.player.hp).toBe(80 - 6 - 7);
  });

  it('le Saignement blesse l\'ennemi au début de son tour', () => {
    const c = combat(['lieutenant'], ['pourfendre', 'parade', 'parade', 'parade', 'parade']);
    playCard(c, handIndex(c, 'pourfendre'));
    const hp = c.enemies[0].hp;
    endTurn(c);
    expect(hp - c.enemies[0].hp).toBe(5);
  });

  it('l\'Étincelle vivante explose à sa mort', () => {
    const c = combat(['etincelle', 'lieutenant'], ['frappe', 'frappe', 'frappe', 'frappe', 'frappe']);
    playCard(c, handIndex(c, 'frappe'), c.enemies[0].uid);
    playCard(c, handIndex(c, 'frappe'), c.enemies[0].uid);
    expect(c.enemies[0].dead).toBe(true);
    expect(c.player.hp).toBe(76);
  });

  it('un boss secondaire en enrage inflige double dégâts', () => {
    const c = combat(['brannoc'], ['parade', 'parade', 'parade', 'parade', 'parade'], 1);
    c.enemies[0].intent = { kind: 'attack', dmg: 9 };
    endTurn(c);
    expect(c.player.hp).toBe(80 - 18);
  });
});

describe('run et carte', () => {
  it('est déterministe pour une même graine', () => {
    const a = newRun(1234);
    const b = newRun(1234);
    expect(a.map).toEqual(b.map);
  });

  it('la carte a 10 étages, un coffre au 5e, un feu de camp au 9e et un seul boss', () => {
    for (let seed = 1; seed < 40; seed++) {
      const run = newRun(seed);
      const nodes = run.map.nodes;
      expect(nodes.filter((n) => n.type === 'boss').length).toBe(1);
      expect(nodes.filter((n) => n.floor === 4).every((n) => n.type === 'chest')).toBe(true);
      expect(nodes.filter((n) => n.floor === 8).every((n) => n.type === 'campfire')).toBe(true);
      expect(nodes.filter((n) => n.floor === 0).every((n) => n.type === 'combat')).toBe(true);
      expect(nodes.filter((n) => n.floor < 5).some((n) => n.type === 'elite')).toBe(false);
      // chaque nœud mène quelque part, sauf le boss
      for (const n of nodes) if (n.type !== 'boss') expect(n.next.length).toBeGreaterThan(0);
      // le boss est atteignable depuis chaque départ
      for (const start of reachable(run.map, null)) {
        let frontier = [start.id];
        for (let f = 0; f < 9; f++) frontier = [...new Set(frontier.flatMap((id) => nodes[id].next))];
        expect(frontier).toContain(nodes.find((n) => n.type === 'boss')!.id);
      }
    }
  });

  it('on ne peut aller que sur un nœud accessible', () => {
    const run = newRun(7);
    const far = run.map.nodes.find((n) => n.floor === 3)!;
    expect(chooseNode(run, far.id)).toBe(false);
    const start = reachable(run.map, null)[0];
    expect(chooseNode(run, start.id)).toBe(true);
    expect(run.screen).toBe('combat');
  });

  it('une victoire mène aux récompenses, puis à la carte', () => {
    const run = newRun(7);
    chooseNode(run, reachable(run.map, null)[0].id);
    for (const e of run.combat!.enemies) e.dead = true;
    run.combat!.phase = 'victory';
    afterCombatAction(run);
    expect(run.screen).toBe('reward');
    expect(run.rewardChoices.length).toBe(3);
    const size = run.deck.length;
    chooseReward(run, run.rewardChoices[0]);
    expect(run.deck.length).toBe(size + 1);
    expect(run.screen).toBe('map');
    expect(reachable(run.map, run.position).every((n) => n.floor === 1)).toBe(true);
  });

  it('se relever : PV d\'entrée, avec au moins 50 % des PV max', () => {
    const run = newRun(7);
    run.hp = 10;
    chooseNode(run, reachable(run.map, null)[0].id);
    run.combat!.player.hp = 0;
    run.combat!.phase = 'defeat';
    afterCombatAction(run);
    expect(retryHp(run)).toBe(40); // 10 PV en entrant, mais 50 % de 80
    retryAfterWipe(run);
    expect(run.combat!.player.hp).toBe(40);
  });

  it('sans or pour la facture : on choisit l\'objet brisé (le moins précieux par défaut)', () => {
    const run = newRun(7);
    run.equipment.arme = 'hache_de_guerre';
    run.equipment.amulette = 'amulette_vigueur';
    run.maxHp += 8;
    chooseNode(run, reachable(run.map, null)[0].id);
    run.gold = 0;
    run.combat!.player.hp = 0;
    run.combat!.phase = 'defeat';
    afterCombatAction(run);
    expect(wipeBreaks(run)).toBe(true);
    expect(defaultBreakSlot(run)).toBe('amulette');
    expect(retryHp(run, 'amulette')).toBe(80); // l'amulette brisée retire ses 8 PV max
    retryAfterWipe(run, 'arme');
    expect(run.broken).toEqual(['arme']);
    expect(run.maxHp).toBe(88);
  });

  it('un wipe permet de retenter le même combat', () => {
    const run = newRun(7);
    chooseNode(run, reachable(run.map, null)[0].id);
    const name = run.encounter!.name;
    run.combat!.player.hp = 0;
    run.combat!.phase = 'defeat';
    afterCombatAction(run);
    expect(run.screen).toBe('wipe');
    retryAfterWipe(run);
    expect(run.wipesLeft).toBe(2);
    expect(run.screen).toBe('combat');
    expect(run.encounter!.name).toBe(name);
    expect(run.combat!.player.hp).toBe(80);
  });
});

describe('or et vendeur gobelin', () => {
  function atShop(seed = 3): RunState {
    const run = newRun(seed);
    const shopNode = run.map.nodes.find((n) => n.type === 'shop')!;
    run.position = run.map.nodes.find((n) => n.next.includes(shopNode.id))?.id ?? null;
    if (shopNode.floor === 0) run.position = null;
    chooseNode(run, shopNode.id);
    return run;
  }

  it('chaque carte compte au moins un vendeur', () => {
    for (let seed = 1; seed < 60; seed++) {
      expect(newRun(seed).map.nodes.some((n) => n.type === 'shop')).toBe(true);
    }
  });

  it('une victoire rapporte de l\'or', () => {
    const run = newRun(7);
    chooseNode(run, reachable(run.map, null)[0].id);
    run.combat!.phase = 'victory';
    afterCombatAction(run);
    expect(run.gold).toBeGreaterThanOrEqual(99 + 10);
    expect(run.gold).toBeLessThanOrEqual(99 + 20);
    expect(run.rewardGold).toBe(run.gold - 99);
  });

  it('le vendeur propose 5 cartes, dont une à moitié prix', () => {
    const run = atShop();
    expect(run.screen).toBe('shop');
    expect(run.shop!.cards.length).toBe(5);
  });

  it('acheter une carte coûte de l\'or et l\'ajoute au deck ; impossible sans assez d\'or', () => {
    const run = atShop();
    const item = run.shop!.cards[0];
    run.gold = item.price;
    const size = run.deck.length;
    expect(buyCard(run, 0)).toBe(true);
    expect(run.gold).toBe(0);
    expect(run.deck.length).toBe(size + 1);
    expect(buyCard(run, 0)).toBe(false); // déjà vendue
    expect(buyCard(run, 1)).toBe(false); // plus d'or
  });

  it('retirer et améliorer une carte : une fois par visite, prix croissant', () => {
    const run = atShop();
    run.gold = 1000;
    const [a, b] = run.deck;
    expect(buyRemoval(run, a.uid)).toBe(true);
    expect(run.deck.some((c) => c.uid === a.uid)).toBe(false);
    expect(buyRemoval(run, b.uid)).toBe(false);
    expect(buyUpgrade(run, b.uid)).toBe(true);
    expect(b.upgraded).toBe(true);
    expect(run.gold).toBe(1000 - 75 - 75);
    expect(servicePrice(run.removals)).toBe(100);
  });

  it('une sauvegarde de la version précédente est convertie', () => {
    const old = { ...newRun(5), version: 2 } as Record<string, unknown>;
    delete old.gold;
    const run = migrate(old)!;
    expect(run.version).toBe(26);
    expect(run.gold).toBe(99);
  });
});

describe('Vulkhar, Souverain des flammes', () => {
  function vulkhar(cards = ['parade', 'parade', 'parade', 'parade', 'parade']): CombatState {
    return combat(['vulkhar'], cards, 14);
  }

  it('le Marteau des flammes ne peut pas être interrompu et assomme le joueur', () => {
    const c = vulkhar(['coup_de_bouclier', 'parade', 'parade', 'parade', 'parade', 'parade', 'parade', 'parade']);
    const v = c.enemies[0];
    v.step = 2;
    v.intent = { kind: 'attack', dmg: 10, cast: 'Marteau des flammes', uninterruptible: true, drawPenalty: 2 };
    playCard(c, handIndex(c, 'coup_de_bouclier'));
    expect(v.interrupted).toBe(false);
    endTurn(c);
    expect(c.player.hp).toBe(80 - 10);
    expect(c.hand.length).toBe(3);
  });

  it('à 50 % de PV, il plonge dans la lave et 6 Rejetons apparaissent', () => {
    const c = vulkhar(['frappe', 'frappe', 'frappe', 'frappe', 'frappe']);
    const v = c.enemies[0];
    const half = Math.ceil(v.maxHp / 2);
    v.hp = half + 2;
    playCard(c, handIndex(c, 'frappe'));
    expect(v.hp).toBe(half);
    expect(v.submerged).toBe(2);
    expect(c.enemies.filter((e) => e.defId === 'rejeton').length).toBe(6);
    // il ne peut plus être ciblé
    const hp = v.hp;
    expect(playCard(c, handIndex(c, 'frappe'), v.uid)).toBe(false);
    expect(v.hp).toBe(hp);
    // une attaque de zone touche les Rejetons, mais pas Vulkhar ni ses débuffs
    c.hand.push({ uid: 990, id: 'coup_de_tonnerre', upgraded: false });
    playCard(c, handIndex(c, 'coup_de_tonnerre'));
    expect(v.hp).toBe(hp);
    expect(v.buffs.ralenti).toBe(0);
    expect(c.enemies.filter((e) => e.defId === 'rejeton').every((r) => r.hp === 8)).toBe(true);
  });

  it('en refaisant surface, il absorbe les Rejetons en vie (+10 PV chacun) et passe en phase 2', () => {
    const c = vulkhar(['frappe', 'frappe', 'frappe', 'frappe', 'frappe']);
    const v = c.enemies[0];
    const half = Math.ceil(v.maxHp / 2);
    v.hp = half + 2;
    playCard(c, handIndex(c, 'frappe'));
    const rejetons = c.enemies.filter((e) => e.defId === 'rejeton');
    rejetons.slice(0, 4).forEach((r) => { r.dead = true; });
    c.player.hp = 500;
    endTurn(c);
    endTurn(c);
    expect(v.submerged).toBe(0);
    expect(v.phase).toBe(2);
    expect(v.hp).toBe(half + 2 * TUNING.rejetonHeal);
    expect(c.enemies.filter((e) => e.defId === 'rejeton' && !e.dead).length).toBe(0);
  });

  it('en phase 2, l\'Éruption frappe de plus en plus fort', () => {
    const c = vulkhar();
    const v = c.enemies[0];
    v.phase = 2;
    v.intent = { kind: 'attack', dmg: 8, grow: 4 };
    c.player.hp = 500;
    endTurn(c);
    expect(500 - c.player.hp).toBe(8);
    v.intent = { kind: 'attack', dmg: 8, grow: 4 };
    // la Zone de feu ajoutée par Vulkhar en phase 2 est dans la main : on la retire pour ne mesurer que l'Éruption
    expect(c.hand.some((card) => card.id === 'zone_de_feu')).toBe(true);
    c.hand = c.hand.filter((card) => card.id !== 'zone_de_feu');
    const before = c.player.hp;
    c.player.block = 0;
    endTurn(c);
    expect(before - c.player.hp).toBe(12);
  });
});
