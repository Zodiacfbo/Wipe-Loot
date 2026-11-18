import { describe, expect, it } from 'vitest';
import { createCombat, endTurn } from '../src/engine/combat';
import { BOSS_ENCOUNTER, ELITE_ENCOUNTERS } from '../src/engine/enemies';
import { EVENTS, HIDDEN_FIGHTS } from '../src/engine/events';
import {
  afterCombatAction, campfireReforge, chooseBlessing, chooseNode, eventChoiceLock, newRun, offerBlessing, resolveEvent,
} from '../src/engine/run';
import type { RunState } from '../src/engine/types';

function atEvent(id: string, seed = 3): RunState {
  const run = newRun(seed);
  run.screen = 'event';
  run.eventId = id;
  return run;
}

/** Va jusqu'à un nœud d'un type donné et le choisit. */
function enter(run: RunState, type: string, elite?: number): void {
  const node = run.map.nodes.find((n) => n.type === type && (elite === undefined || n.elite === elite)) ?? run.map.nodes.find((n) => n.type === type)!;
  if (elite !== undefined) node.elite = elite;
  run.position = node.floor === 0 ? null : run.map.nodes.find((n) => n.next.includes(node.id))!.id;
  run.screen = 'map';
  chooseNode(run, node.id);
}

function win(run: RunState): void {
  for (const e of run.combat!.enemies) e.dead = true;
  run.combat!.phase = 'victory';
  afterCombatAction(run);
}

describe('Brégan le Passeur', () => {
  it('propose 4 bonus différents au début de la run', () => {
    const run = newRun(1);
    offerBlessing(run);
    expect(run.screen).toBe('blessing');
    expect(new Set(run.blessings).size).toBe(4);
  });

  it('chaque bonus fait ce qu\'il annonce', () => {
    const run = newRun(1);
    run.screen = 'blessing';
    run.blessings = ['provisions', 'bourse', 'marche', 'allegement'];
    expect(chooseBlessing(run, 'provisions')).toBe(true);
    expect(run.maxHp).toBe(88);
    expect(run.screen).toBe('map');

    const r2 = newRun(1);
    r2.screen = 'blessing';
    r2.blessings = ['marche'];
    chooseBlessing(r2, 'marche');
    expect(r2.gold).toBe(299);
    expect(r2.deck.some((c) => c.id === 'malediction')).toBe(true);

    const r3 = newRun(1);
    r3.screen = 'blessing';
    r3.blessings = ['allegement'];
    expect(chooseBlessing(r3, 'allegement')).toBe(false); // il faut choisir une carte
    expect(chooseBlessing(r3, 'allegement', r3.deck[0].uid)).toBe(true);
    expect(r3.deck).toHaveLength(9);
  });

  it('le Pari risqué coûte 10 % des PV max et propose 3 objets rares', () => {
    const run = newRun(4);
    run.screen = 'blessing';
    run.blessings = ['pari'];
    chooseBlessing(run, 'pari');
    expect(run.maxHp).toBe(72);
    expect(run.screen).toBe('reward');
    expect(run.pendingAlts).toHaveLength(2);
    expect(new Set([run.pendingItem, ...run.pendingAlts]).size).toBe(3);
  });
});

describe('les événements de l\'acte 1', () => {
  it('un choix impossible est grisé avec sa raison', () => {
    const run = atEvent('trappeur');
    expect(eventChoiceLock(run, 0)).toBe('Il te faut une potion');
    resolveEvent(run, 0);
    expect(run.eventOutcome).toBeNull();
    run.potions[0] = 'potion_soins';
    expect(eventChoiceLock(run, 0)).toBeNull();
    resolveEvent(run, 0);
    expect(run.potions[0]).toBeNull();
    expect(run.maxHp).toBe(86);
    expect(run.eventOutcome).toContain('+6 PV max');
  });

  it('la chapelle : piller l\'autel donne 80 or et une Malédiction ; le cercle l\'enlève', () => {
    const run = atEvent('chapelle');
    resolveEvent(run, 1);
    expect(run.gold).toBe(179);
    expect(run.deck.filter((c) => c.id === 'malediction')).toHaveLength(1);
    run.eventId = 'cercle';
    run.eventOutcome = null;
    resolveEvent(run, 0);
    expect(run.deck.some((c) => c.id === 'malediction')).toBe(false);
  });

  it('le fantôme du forgeron renforce l\'arme équipée', () => {
    const run = atEvent('fantome');
    expect(eventChoiceLock(run, 0)).not.toBeNull();
    run.equipment.arme = 'epee_longue';
    resolveEvent(run, 0);
    expect(run.hp).toBe(70);
    expect(run.weaponUpgrade).toBe('epee_longue');
  });

  it('la rivière : le détour transforme le prochain nœud en combat difficile', () => {
    const run = atEvent('riviere');
    resolveEvent(run, 1);
    expect(run.detour).toBe(true);
    enter(run, 'shop');
    expect(run.screen).toBe('combat');
    expect(run.encounter!.name).toBe('Le détour');
  });

  it('le joueur qui fonce : un combat difficile, puis un objet rare', () => {
    const run = atEvent('fonceur');
    run.position = run.map.nodes.find((n) => n.floor === 2)!.id;
    resolveEvent(run, 0);
    expect(run.screen).toBe('combat');
    win(run);
    expect(run.pendingItem).toBeTruthy();
  });

  it('les combats cachés : embuscade (les ennemis frappent d\'abord) et gobelin mimique (vole de l\'or)', () => {
    const ambush = createCombat(HIDDEN_FIGHTS[0], [{ uid: 1, id: 'parade', upgraded: false }], 80, 80, 5, 10);
    expect(ambush.player.hp).toBeLessThan(80);
    const mimic = createCombat(HIDDEN_FIGHTS[1], Array.from({ length: 10 }, (_, i) => ({ uid: i + 1, id: 'frappe', upgraded: false })), 80, 80, 5, 20);
    endTurn(mimic);
    endTurn(mimic);
    expect(mimic.goldStolen).toBe(15);
  });

  it('chaque événement n\'apparaît qu\'une fois par run', () => {
    expect(Object.keys(EVENTS).length).toBeGreaterThanOrEqual(10);
    const run = newRun(8);
    const seen = new Set<string>();
    for (let i = 0; i < 30; i++) {
      enter(run, 'event');
      if (run.screen === 'event') {
        expect(seen.has(run.eventId!)).toBe(false);
        seen.add(run.eventId!);
      }
      run.screen = 'map';
      run.combat = null;
    }
  });
});

describe('la quête des Gardiens des Sources', () => {
  it('accepter : le prochain boss secondaire porte la rune ; le battre affaiblit Vulkhar', () => {
    const run = atEvent('sources');
    resolveEvent(run, 0);
    expect(run.sourcesQuest).toBe('active');
    enter(run, 'elite');
    expect(run.encounter!.rune).toBe(true);
    win(run);
    expect(run.sourcesQuest).toBe('done');
    expect(run.questNote).toContain('Eau des profondeurs');
    enter(run, 'boss');
    expect(run.encounter!.weakened).toBe(true);
    const v = run.combat!.enemies[0];
    expect(v.hp).toBe(Math.floor(v.maxHp * 0.85));
  });

  it('Vulkhar affaibli lève son premier Marteau des flammes un tour plus tard', () => {
    const deck = Array.from({ length: 10 }, (_, i) => ({ uid: i + 1, id: 'parade', upgraded: false }));
    const normal = createCombat(BOSS_ENCOUNTER, deck, 300, 300, 5, 50);
    const weak = createCombat({ ...BOSS_ENCOUNTER, weakened: true }, deck, 300, 300, 5, 50);
    endTurn(normal); endTurn(normal);
    endTurn(weak); endTurn(weak);
    expect(normal.enemies[0].intent.cast).toBe('Marteau des flammes');
    expect(weak.enemies[0].intent.cast).toBeUndefined();
    endTurn(weak);
    expect(weak.enemies[0].intent.cast).toBe('Marteau des flammes');
  });

  it('refuser : ils te soignent de 10 PV', () => {
    const run = atEvent('sources');
    run.hp = 50;
    resolveEvent(run, 1);
    expect(run.hp).toBe(60);
  });
});

describe('la quête légendaire Brisemonts', () => {
  it('Lame brisée → Cœur de la montagne sur Krâgg → Reforger à un feu de camp de l\'acte 2', () => {
    const run = atEvent('forge');
    resolveEvent(run, 0);
    expect(run.brisemonts).toBe('lame');
    const kragg = ELITE_ENCOUNTERS.findIndex((e) => e.loot === 'kragg');
    enter(run, 'elite', kragg);
    win(run);
    expect(run.brisemonts).toBe('coeur');
    run.equipment.arme = 'epee_longue';
    run.screen = 'campfire';
    expect(campfireReforge(run)).toBe(false); // pas avant l'acte 2
    run.act = 2;
    expect(campfireReforge(run)).toBe(true);
    expect(run.equipment.arme).toBe('brisemonts');
    expect(run.brisemonts).toBe('forged');
  });

  it('Brisemonts : +1 rage quand on perd des PV, Exécution toujours au bonus', () => {
    const run = newRun(2);
    run.equipment.arme = 'brisemonts';
    enter(run, 'combat');
    const c = run.combat!;
    c.player.block = 0;
    const rage = c.player.rage;
    endTurn(c);
    expect(c.player.rage).toBeGreaterThanOrEqual(rage + 2); // 1 (coup reçu) + 1 (Brisemonts)
  });
});
