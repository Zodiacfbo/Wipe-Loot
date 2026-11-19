import { describe, expect, it } from 'vitest';
import { ACTS, LAST_ACT } from '../src/engine/acts';
import { createCombat, endTurn, playCard } from '../src/engine/combat';
import type { Encounter } from '../src/engine/enemies';
import { ENEMIES } from '../src/engine/enemies';
import { BOSS_LOOT, ITEMS, LOOT_TABLES } from '../src/engine/items';
import { afterCombatAction, chooseNode, chooseReward, leavePending, newRun, resolveEvent, startNextAct } from '../src/engine/run';
import { EVENTS } from '../src/engine/events';
import type { CardInstance, CombatState, RunState } from '../src/engine/types';

const deck = (ids: string[]): CardInstance[] => ids.map((id, i) => ({ uid: 1000 + i, id, upgraded: false }));
function fight(enemies: string[], hand: string[] = [], classId = 'guerrier'): CombatState {
  const enc: Encounter = { kind: 'combat', name: 'Test', enemies };
  const c = createCombat(enc, deck(Array(10).fill('parade')), 80, 80, 7, 1, {}, ['charge'], undefined, classId);
  c.hand = hand.map((id, i) => ({ uid: 5000 + i, id, upgraded: false }));
  c.player.energy = 10;
  return c;
}
const play = (c: CombatState, id: string, target?: number) => playCard(c, c.hand.findIndex((k) => k.id === id), target);

/** Gagne le combat de boss de l'acte en cours. */
function beatBoss(run: RunState): void {
  const boss = run.map.nodes.find((n) => n.type === 'boss')!;
  run.position = run.map.nodes.find((n) => n.next.includes(boss.id))!.id;
  chooseNode(run, boss.id);
  run.combat!.phase = 'victory';
  afterCombatAction(run);
}

describe('l\'enchaînement des actes', () => {
  it('Vulkhar vaincu : sa table de loot, puis le butin de boss (3 épiques au choix), puis l\'acte 2', () => {
    const run = newRun(5);
    beatBoss(run);
    expect(run.screen).toBe('reward');
    expect(run.bossStage).toBe('loot');
    expect(run.pendingItem ? BOSS_LOOT[1].table.includes(run.pendingItem) : !!run.pendingSpell).toBe(true);
    chooseReward(run, null);
    expect(run.bossStage).toBe('epic');
    expect([run.pendingItem, ...run.pendingAlts].every((id) => ITEMS[id!].rarity === 'epique')).toBe(true);
    expect(run.pendingAlts).toHaveLength(2);
    leavePending(run);
    chooseReward(run, null);
    expect(run.screen).toBe('act');
    run.hp = 10;
    expect(startNextAct(run)).toBe(true);
    expect(run.act).toBe(2);
    expect(run.hp).toBe(run.maxHp);
    expect(run.position).toBeNull();
    expect(run.floorsDone).toBe(1);
  });

  it('l\'acte 2 a ses propres rencontres, et Vhaeryx termine la run', () => {
    const run = newRun(9);
    run.act = 2;
    run.screen = 'act';
    run.act = 1;
    run.screen = 'act';
    startNextAct(run);
    const first = run.map.nodes.find((n) => n.floor === 0)!;
    chooseNode(run, first.id);
    const ids = run.combat!.enemies.map((e) => e.defId);
    expect(ACTS[2].easy.some((enc) => enc.enemies.every((id) => ids.includes(id)))).toBe(true);
    run.combat = null;
    run.screen = 'map';
    expect(LAST_ACT).toBe(2);
    beatBoss(run);
    expect(run.screen).toBe('victory');
  });

  it('chaque boss secondaire de l\'acte 2 a sa table de loot de 4 objets', () => {
    for (const enc of ACTS[2].elites) {
      expect(LOOT_TABLES[enc.loot!]).toHaveLength(4);
      for (const id of LOOT_TABLES[enc.loot!]) expect(ITEMS[id]).toBeDefined();
    }
  });

  it('les événements de l\'acte 2 n\'apparaissent qu\'à l\'acte 2', () => {
    const act2 = Object.values(EVENTS).filter((e) => e.act === 2).map((e) => e.id);
    expect(act2).toContain('autel');
    expect(act2).toContain('observatoire');
  });
});

describe('les ennemis de l\'acte 2', () => {
  it('Envol : un dragonnet en vol ne peut pas être visé par une Attaque, mais par un Sort', () => {
    const c = fight(['dragonnet', 'dragonnet'], ['frappe']);
    c.enemies[0].flying = true;
    expect(play(c, 'frappe', c.enemies[0].uid)).toBe(false);
    expect(play(c, 'frappe', c.enemies[1].uid)).toBe(true);
    const m = fight(['dragonnet', 'dragonnet'], ['trait_de_magie'], 'mage');
    m.enemies[0].flying = true;
    expect(play(m, 'trait_de_magie', m.enemies[0].uid)).toBe(true);
  });

  it('la Chimère affiche sa mutation dès le début, et mute sous 50 % de PV', () => {
    const c = fight(['chimere']);
    const ch = c.enemies[0];
    expect(ch.mutations).toHaveLength(1);
    expect(ch.mutated).toBeFalsy();
    ch.hp = 24;
    c.hand = [{ uid: 1, id: 'frappe', upgraded: false }];
    play(c, 'frappe');
    expect(ch.mutated).toBe(true);
  });

  it('un Serviteur rapiécé se relève une fois tant qu\'un Alchimiste vit', () => {
    const c = fight(['alchimiste', 'serviteur'], ['frappe', 'frappe']);
    const s = c.enemies[1];
    s.hp = 3;
    play(c, 'frappe', s.uid);
    expect(s.dead).toBe(false);
    expect(s.hp).toBe(10);
    s.hp = 3;
    play(c, 'frappe', s.uid);
    expect(s.dead).toBe(true);
  });

  it('Toxine : 2 dégâts au début de tes tours ; Peste : soins réduits de moitié', () => {
    const c = fight(['oeuf']);
    c.player.debuffs!.toxine = 3;
    c.player.block = 0;
    const hp = c.player.hp;
    endTurn(c);
    expect(c.player.hp).toBe(hp - 2);
    c.player.debuffs!.peste = 2;
    c.player.hp = 50;
    c.hand = [{ uid: 1, id: 'sanguinaire', upgraded: true }];
    c.player.rage = 5;
    play(c, 'sanguinaire', c.enemies[0].uid);
    expect(c.player.hp).toBe(52);
  });

  it('un Œuf de dragon éclôt au bout de 3 tours', () => {
    const c = fight(['oeuf']);
    for (let i = 0; i < 3; i++) {
      c.player.block = 99;
      endTurn(c);
    }
    expect(c.enemies.some((e) => e.defId === 'dragonnet' && !e.dead)).toBe(true);
  });
});

describe('les boss secondaires de l\'acte 2', () => {
  it('Skarn est immunisé tant qu\'il reste des Œufs ; le Sceptre de domination les détruit', () => {
    const c = fight(['oeuf_skarn', 'skarn']);
    const [egg, skarn] = c.enemies;
    c.player.block = 99;
    endTurn(c);
    expect(c.hand.some((k) => k.id === 'sceptre_domination')).toBe(true);
    c.player.energy = 10;
    const hp = skarn.hp;
    c.hand.push({ uid: 7, id: 'frappe', upgraded: false });
    play(c, 'frappe', skarn.uid);
    expect(skarn.hp).toBe(hp);
    play(c, 'sceptre_domination', egg.uid);
    expect(egg.dead).toBe(true);
    expect(skarn.phase).toBe(2);
  });

  it('Ysolde : +3 énergie par tour, et des PV perdus qui augmentent (3, 5, 7…)', () => {
    const c = fight(['ysolde']);
    expect(c.enemies[0].hp).toBe(80);
    expect(c.player.energy).toBe(10);
    c.player.energy = 0;
    c.player.block = 99;
    const hp = c.player.hp;
    endTurn(c);
    expect(c.player.hp).toBe(hp - 3);
    expect(c.player.energy).toBe(6);
    c.player.block = 99;
    endTurn(c);
    expect(c.player.hp).toBe(hp - 3 - 5);
  });

  it('Ossyrax se relève une fois avec 45 PV', () => {
    const c = fight(['ossyrax'], ['frappe', 'frappe']);
    const o = c.enemies[0];
    o.hp = 2;
    play(c, 'frappe');
    expect(o.dead).toBe(false);
    expect(o.hp).toBe(45);
    o.hp = 2;
    play(c, 'frappe');
    expect(o.dead).toBe(true);
  });

  it('les Trois Souffles : un drake qui tombe enrage les deux autres', () => {
    const c = fight(['drake_braise', 'drake_ombre', 'drake_cendre'], ['frappe']);
    c.enemies[0].hp = 1;
    play(c, 'frappe', c.enemies[0].uid);
    expect(c.enemies[1].buffs.puissance).toBe(3);
    expect(c.enemies[2].buffs.puissance).toBe(3);
  });

  it('Prismagor tire deux Souffles ; les cinq Afflictions transforment le joueur', () => {
    const c = fight(['prismagor']);
    expect(c.enemies[0].breaths).toHaveLength(2);
    c.player.debuffs!.afflictions = ['rouge', 'bleue', 'verte', 'noire'];
    c.enemies[0].intent = { kind: 'attack', dmg: 1, effect: { label: 'Affliction de sang', affliction: true } };
    c.player.block = 99;
    endTurn(c);
    expect(c.player.energy).toBe(0);
    expect(c.hand).toHaveLength(0);
    expect(c.player.debuffs!.afflictions).toEqual([]);
  });

  it('Draksis frappe de plus en plus fort', () => {
    const c = fight(['draksis']);
    c.player.block = 0;
    let hp = c.player.hp;
    endTurn(c);
    expect(hp - c.player.hp).toBe(8);
    hp = c.player.hp;
    c.player.block = 0;
    endTurn(c);
    expect(hp - c.player.hp).toBe(11);
  });

  it('Vashka : la Couvée accélérée fait éclore tous les Œufs', () => {
    const c = fight(['oeuf_vashka', 'oeuf_vashka', 'vashka']);
    c.enemies[2].intent = ENEMIES.vashka.cycle[1];
    c.player.block = 99;
    endTurn(c);
    expect(c.enemies.filter((e) => e.defId === 'dragonnet' && !e.dead)).toHaveLength(2);
  });
});

describe('Vhaeryx', () => {
  it('à 60 %, il devient dragon ; sous 20 %, les adds tombés se relèvent', () => {
    const c = fight(['vhaeryx', 'drakonide_chroma'], ['frappe', 'frappe', 'frappe']);
    const [v, add] = c.enemies;
    add.hp = 1;
    play(c, 'frappe', add.uid);
    expect(c.fallen).toBe(1);
    v.hp = 190;
    play(c, 'frappe', v.uid);
    expect(v.phase).toBe(2);
    v.hp = 60;
    play(c, 'frappe', v.uid);
    expect(v.phase).toBe(3);
    expect(c.enemies.filter((e) => e.defId === 'serviteur_os')).toHaveLength(1);
  });

  it('la Malédiction de lignée force le Guerrier en Berserker, et réduit la main du Mage', () => {
    const c = fight(['vhaeryx']);
    c.enemies[0].intent = ENEMIES.vhaeryx.cycle[1];
    c.player.block = 99;
    endTurn(c);
    expect(c.player.posture).toBe('berserker');
    const m = fight(['vhaeryx'], [], 'mage');
    m.enemies[0].intent = ENEMIES.vhaeryx.cycle[1];
    m.player.block = 99;
    endTurn(m);
    expect(m.hand.length).toBe(3);
  });
});

describe('la quête du Bâton du Veilleur', () => {
  it('Zhaal donne le Fragment au Mage, l\'Observatoire la Tête', () => {
    const run = newRun(3, null, [], 0, 'mage');
    run.veilleur = 'fragment';
    run.act = 2;
    run.eventId = 'observatoire';
    run.screen = 'event';
    const max = run.maxHp;
    resolveEvent(run, 0);
    expect(run.veilleur).toBe('tete');
    expect(run.maxHp).toBe(max - 8);
  });
});
