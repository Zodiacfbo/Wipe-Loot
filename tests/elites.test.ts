import { describe, expect, it } from 'vitest';
import { canPlayCard, createCombat, endTurn, playCard, startPlayerTurn } from '../src/engine/combat';
import { ELITE_ENCOUNTERS, ENEMIES, type Encounter } from '../src/engine/enemies';
import { LOOT_TABLES, ITEMS, type ItemEffects } from '../src/engine/items';
import { generateMap } from '../src/engine/map';
import { chooseNode, equipPending, newRun } from '../src/engine/run';
import type { CardInstance, CombatState, EnemyState } from '../src/engine/types';

function deckOf(ids: string[]): CardInstance[] {
  return ids.map((id, i) => ({ uid: 1000 + i, id, upgraded: false }));
}
const PARADES = ['parade', 'parade', 'parade', 'parade', 'parade', 'parade', 'parade', 'parade', 'parade', 'parade'];
const FRAPPES = ['frappe', 'frappe', 'frappe', 'frappe', 'frappe', 'frappe', 'frappe', 'frappe', 'frappe', 'frappe'];

function fight(enemies: string[], cards = PARADES, gear: ItemEffects = {}): CombatState {
  const enc: Encounter = { kind: 'combat', name: 'Test', enemies, enrageTurn: 10 };
  return createCombat(enc, deckOf(cards), 80, 80, 42, 1, gear);
}
const byId = (c: CombatState, id: string): EnemyState => c.enemies.find((e) => e.defId === id && !e.dead)!;
/** Fait jouer un tour aux ennemis en vidant leur intention vers une valeur donnée. */
function enemiesAct(c: CombatState): void {
  endTurn(c);
}

describe('les 9 boss secondaires de l\'acte 1', () => {
  it('chaque boss secondaire a un sprite, un enrage au tour 10 et une table de 4 objets', () => {
    expect(ELITE_ENCOUNTERS.length).toBe(9);
    for (const enc of ELITE_ENCOUNTERS) {
      expect(enc.enrageTurn).toBe(10);
      expect(LOOT_TABLES[enc.loot!]).toHaveLength(4);
      for (const id of LOOT_TABLES[enc.loot!]) expect(ITEMS[id]).toBeDefined();
      for (const id of enc.enemies) expect(ENEMIES[id]).toBeDefined();
    }
  });

  it('la carte peut tirer chacun des 9 boss secondaires', () => {
    const seen = new Set<number>();
    for (let seed = 1; seed < 200 && seen.size < 9; seed++) {
      for (const n of generateMap({ rng: seed }).nodes) if (n.elite !== undefined) seen.add(n.elite);
    }
    expect(seen.size).toBe(9);
  });
});

describe('Morvax le Maudisseur', () => {
  it('Démoralisé : tes Attaques font 25 % de dégâts en moins, et ça s\'estompe', () => {
    const c = fight(['morvax'], FRAPPES);
    const m = byId(c, 'morvax');
    enemiesAct(c); // Malédiction de faiblesse
    expect(c.player.debuffs!.demoralise).toBe(4);
    const hp = m.hp;
    playCard(c, 0);
    expect(hp - m.hp).toBe(4); // 6 × 0,75
    endTurn(c);
    expect(c.player.debuffs!.demoralise).toBe(3);
  });

  it('les Fardeaux sont injouables ; la Bague de l\'impie raccourcit les malédictions', () => {
    const c = fight(['morvax'], PARADES, { debuffReduce: 1 });
    endTurn(c);
    expect(c.player.debuffs!.demoralise).toBe(3);
    endTurn(c); // Trait d'ombre
    endTurn(c); // Malédiction du fardeau
    const all = [...c.hand, ...c.draw, ...c.discard];
    expect(all.filter((card) => card.id === 'fardeau').length).toBe(2);
    c.hand.push({ uid: 5000, id: 'fardeau', upgraded: false });
    expect(canPlayCard(c, c.hand.length - 1)).toBe(false);
  });

  it('sous 50 % de PV, la Malédiction de l\'impie rend la 1re carte du tour plus chère', () => {
    const c = fight(['morvax']);
    c.player.debuffs!.impie = 2;
    startPlayerTurn(c);
    const energy = c.player.energy;
    playCard(c, 0);
    expect(c.player.energy).toBe(energy - 2);
    playCard(c, 0);
    expect(c.player.energy).toBe(energy - 3);
  });
});

describe('Croc-de-lave', () => {
  it('le Hurlement de terreur Panique 2 cartes au tour suivant (sauf avec le Collier de crocs)', () => {
    const c = fight(['croc']);
    endTurn(c);
    endTurn(c);
    endTurn(c); // Hurlement
    expect(c.panicked).toHaveLength(2);
    const i = c.hand.findIndex((card) => c.panicked!.includes(card.uid));
    expect(canPlayCard(c, i)).toBe(false);

    const safe = fight(['croc'], PARADES, { panicImmune: 1 });
    endTurn(safe);
    endTurn(safe);
    endTurn(safe);
    expect(safe.panicked).toHaveLength(0);
  });

  it('sous 50 % de PV, ses Morsures frappent deux fois', () => {
    const c = fight(['croc']);
    const croc = byId(c, 'croc');
    croc.hp = 40;
    endTurn(c);
    expect(croc.intent).toMatchObject({ kind: 'attack', times: 2 });
  });
});

describe('Gorlok le Fragmenté', () => {
  it('gagne 4 blocage par Éclat en vie ; un Éclat explose (5) et Gorlok en rappelle un', () => {
    const c = fight(['eclat', 'eclat', 'gorlok', 'eclat', 'eclat'], FRAPPES);
    c.player.block = 999;
    endTurn(c);
    expect(byId(c, 'gorlok').block).toBe(16);
    const shard = byId(c, 'eclat');
    shard.hp = 1;
    c.player.block = 0;
    const hp = c.player.hp;
    playCard(c, 0, shard.uid);
    expect(c.player.hp).toBe(hp - 5);
    c.player.block = 999;
    endTurn(c); // Rappel des éclats
    expect(c.enemies.filter((e) => e.defId === 'eclat' && !e.dead)).toHaveLength(4);
  });
});

describe('le Baron Vossk', () => {
  it('une Bombe vivante gardée en main : 15 dégâts au joueur et 5 à chaque ennemi', () => {
    const c = fight(['vossk']);
    endTurn(c); // ajoute la Bombe
    expect(c.hand.some((card) => card.id === 'bombe_vivante')).toBe(true);
    const v = byId(c, 'vossk');
    const vhp = v.hp;
    const hp = c.player.hp;
    c.player.block = 0;
    v.intent = { kind: 'block', amount: 0 };
    endTurn(c);
    expect(c.player.hp).toBe(hp - 15);
    expect(v.hp).toBe(vhp - 5);
  });

  it('l\'Embrasement de mana retire 1 énergie au tour suivant', () => {
    const c = fight(['vossk']);
    c.enemies[0].step = 2;
    c.enemies[0].intent = ENEMIES.vossk.cycle[2];
    endTurn(c);
    expect(c.player.energy).toBe(2);
  });
});

describe('Zhaal et Krâgg', () => {
  it('Zhaal ne peut plus être ciblé après son Clignement', () => {
    const c = fight(['zhaal'], FRAPPES);
    c.player.block = 999;
    endTurn(c);
    endTurn(c); // Clignement
    expect(byId(c, 'zhaal').untargetable).toBe(true);
    expect(playCard(c, 0, byId(c, 'zhaal').uid)).toBe(false);
  });

  it('Krâgg grandit chaque tour ; un Molosse se relève tant que Krâgg vit, et s\'enfuit quand il meurt', () => {
    const c = fight(['molosse_enrage', 'kragg', 'molosse_enrage'], FRAPPES);
    c.player.block = 999;
    endTurn(c);
    expect(byId(c, 'kragg').buffs.puissance).toBe(1);
    const dog = c.enemies[0];
    dog.hp = 1;
    c.player.block = 999;
    playCard(c, 0, dog.uid);
    expect(dog.dead).toBe(true);
    endTurn(c);
    c.player.block = 999;
    endTurn(c);
    expect(dog.dead).toBe(false);
    expect(dog.hp).toBe(15);
    const kragg = byId(c, 'kragg');
    kragg.hp = 1;
    kragg.block = 0;
    playCard(c, 0, kragg.uid);
    expect(c.phase).toBe('victory');
  });
});

describe('le Grand Intendant Saldris', () => {
  it('le Bouclier anti-coups renvoie la moitié des dégâts ; il se rend sans ses gardes', () => {
    const c = fight(['pretre', 'gardien', 'saldris', 'gardien', 'pretre'], FRAPPES);
    const s = byId(c, 'saldris');
    expect(s.shield).toBe('coups');
    const hp = c.player.hp;
    playCard(c, 0, s.uid);
    expect(c.player.hp).toBe(hp - 3);
    for (const e of c.enemies) if (e.defId !== 'saldris') { e.hp = 1; e.block = 0; }
    for (const e of c.enemies.filter((x) => x.defId !== 'saldris')) {
      c.player.energy = 3;
      playCard(c, 0, e.uid);
    }
    expect(c.phase).toBe('victory');
  });

  it('il se rend sous 10 % de PV', () => {
    const c = fight(['pretre', 'gardien', 'saldris', 'gardien', 'pretre'], FRAPPES);
    const s = byId(c, 'saldris');
    s.hp = 7;
    s.shield = 'sorts';
    playCard(c, 0, s.uid);
    expect(c.phase).toBe('victory');
  });
});

describe('les nouveaux objets', () => {
  it('Trousseau de l\'intendant : un coffre propose 2 objets, on en garde un', () => {
    const run = newRun(11);
    run.equipment.bijou1 = 'trousseau_intendant';
    const node = run.map.nodes.find((n) => n.type === 'chest')!;
    run.position = run.map.nodes.find((n) => n.next.includes(node.id))!.id;
    chooseNode(run, node.id);
    expect(run.pendingAlt).toBeTruthy();
    expect(run.pendingAlt).not.toBe(run.pendingItem);
    const alt = run.pendingAlt!;
    const slot = (['arme', 'amulette', 'bague1', 'bijou2'] as const).find((k) => ITEMS[alt].slot === k.replace(/\d/, ''))!;
    expect(equipPending(run, slot, true)).toBe(true);
    expect(run.pendingItem).toBeNull();
  });

  it('Amulette de l\'intendant : un 4e emplacement de potion, perdu si on l\'enlève', () => {
    const run = newRun(11);
    run.pendingItem = 'amulette_intendant';
    equipPending(run, 'amulette');
    expect(run.potions).toHaveLength(4);
    run.potions = ['potion_soins', 'potion_soins', null, 'potion_rage'];
    run.pendingItem = 'amulette_vigueur';
    equipPending(run, 'amulette');
    expect(run.potions).toEqual(['potion_soins', 'potion_soins', 'potion_rage']);
  });

  it('Miroir de l\'intendant : une attaque entièrement bloquée est renvoyée', () => {
    const c = fight(['lieutenant'], PARADES, { blockReflect: 4 });
    const l = c.enemies[0];
    c.player.block = 50;
    endTurn(c);
    expect(l.hp).toBe(l.maxHp - 4);
  });

  it('Poing de Krâgg : +6 aux Attaques qui coûtent 2 ou plus', () => {
    const c = fight(['lieutenant'], ['frappe_ecrasante', 'frappe_ecrasante', 'frappe_ecrasante', 'frappe_ecrasante', 'frappe_ecrasante'], { heavyAttackBonus: 6 });
    const ref = fight(['lieutenant'], ['frappe_ecrasante', 'frappe_ecrasante', 'frappe_ecrasante', 'frappe_ecrasante', 'frappe_ecrasante']);
    playCard(c, 0);
    playCard(ref, 0);
    expect(ref.enemies[0].hp - c.enemies[0].hp).toBe(6);
  });
});
