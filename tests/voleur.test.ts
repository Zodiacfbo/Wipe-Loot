import { describe, expect, it } from 'vitest';
import { CARDS, rewardPool, starterCards } from '../src/engine/cards';
import { canPlayCard, createCombat, endTurn, playCard, useSpell } from '../src/engine/combat';
import type { Encounter } from '../src/engine/enemies';
import { afterCombatAction, newRun, resolveEvent, runGear } from '../src/engine/run';
import { lootSpells } from '../src/engine/spells';
import { VOLEUR_TREES, emptyAlloc, talentIds, toggleTalent } from '../src/engine/talents';
import type { ItemEffects } from '../src/engine/items';
import type { CardInstance, CombatState } from '../src/engine/types';

const deck = (ids: string[]): CardInstance[] => ids.map((id, i) => ({ uid: 1000 + i, id, upgraded: false }));
function fight(enemies: string[], hand: string[], gear: ItemEffects = {}, spells: string[] = ['sprint']): CombatState {
  const enc: Encounter = { kind: 'combat', name: 'Test', enemies };
  const c = createCombat(enc, deck(Array(10).fill('esquive')), 70, 70, 7, 1, gear, spells, undefined, 'voleur');
  c.hand = hand.map((id, i) => ({ uid: 5000 + i, id, upgraded: false }));
  c.player.energy = 10;
  for (const e of c.enemies) e.hp = e.maxHp = 200;
  return c;
}
const play = (c: CombatState, id: string, target?: number) => playCard(c, c.hand.findIndex((k) => k.id === id), target);
const spell = (c: CombatState, id: string, target?: number) => useSpell(c, c.spells.findIndex((s) => s.id === id), target);
const idx = (c: CombatState, id: string) => c.hand.findIndex((k) => k.id === id);

describe('le Voleur : la run', () => {
  it('70 PV, son deck de départ et Sprint', () => {
    const run = newRun(1, null, [], 0, 'voleur');
    expect(run.maxHp).toBe(70);
    expect(run.spells).toEqual(['sprint']);
    expect(run.deck.filter((k) => k.id === 'attaque_sinistre')).toHaveLength(4);
    expect(run.deck.some((k) => k.id === 'embuscade')).toBe(true);
  });

  it('51 cartes en récompense (+ Esquive), 14 par arbre', () => {
    expect(rewardPool('voleur')).toHaveLength(51);
    expect(starterCards('voleur')).toEqual(['esquive']);
    for (const tree of VOLEUR_TREES) expect(tree.cards).toHaveLength(14);
    for (const tree of VOLEUR_TREES) for (const id of tree.cards) expect(CARDS[id]?.classId).toBe('voleur');
  });

  it('les talents donnent les sorts de barre et la carte épique', () => {
    const alloc = emptyAlloc('voleur');
    for (let tier = 0; tier < 5; tier++) toggleTalent(alloc, 'finesse', tier, 'A', 10, 'voleur');
    const run = newRun(1, null, talentIds(alloc, 'voleur'), 0, 'voleur');
    expect(run.spells).toContain('disparition');
    expect(run.deck.some((k) => k.id === 'seigneur_ombres')).toBe(true);
    expect(lootSpells('voleur').sort()).toEqual(['lancer_poison', 'pas_de_cote']);
  });
});

describe('les points de combo', () => {
  it('les générateurs en donnent, le finisher les dépense tous (5 au maximum)', () => {
    const c = fight(['lieutenant'], ['attaque_sinistre', 'mutiler', 'marque_mort', 'evisceration']);
    const e = c.enemies[0];
    play(c, 'attaque_sinistre');
    play(c, 'mutiler');
    expect(c.combo).toBe(3);
    play(c, 'marque_mort');
    expect(c.combo).toBe(5);
    const hp = e.hp;
    play(c, 'evisceration');
    expect(hp - e.hp).toBe(4 + 6 * 5);
    expect(c.combo).toBe(0);
  });

  it('ils restent d\'un tour à l\'autre ; Impitoyable compte un point de plus', () => {
    const c = fight(['lieutenant'], ['attaque_sinistre'], { ruthless: 1 });
    play(c, 'attaque_sinistre');
    endTurn(c);
    expect(c.combo).toBe(1);
    c.hand.push({ uid: 9000, id: 'evisceration', upgraded: false });
    c.player.energy = 3;
    const hp = c.enemies[0].hp;
    play(c, 'evisceration');
    expect(hp - c.enemies[0].hp).toBe(4 + 6 * 2);
  });
});

describe('le Camouflage', () => {
  it('au début du combat ; une Attaque qui n\'est pas une Ouverture y met fin', () => {
    const c = fight(['lieutenant'], ['embuscade', 'attaque_sinistre', 'garrot']);
    expect(c.stealth).toBe(true);
    play(c, 'embuscade');
    expect(c.stealth).toBe(true);
    expect(c.combo).toBe(2);
    play(c, 'attaque_sinistre');
    expect(c.stealth).toBe(false);
    expect(canPlayCard(c, idx(c, 'garrot'))).toBe(false);
  });

  it('il prend fin avec le premier tour ; Fumigène le rend au tour suivant', () => {
    const c = fight(['lieutenant'], ['fumigene']);
    play(c, 'fumigene');
    expect(c.stealth).toBe(true);
    c.stealthNext = false;
    endTurn(c);
    expect(c.stealth).toBe(false);
    c.hand = [{ uid: 9001, id: 'fumigene', upgraded: false }];
    c.player.energy = 3;
    play(c, 'fumigene');
    endTurn(c);
    expect(c.stealth).toBe(true);
  });

  it('Coup dans le dos double en Camouflage ; Bond de l\'ombre permet une Ouverture', () => {
    const c = fight(['lieutenant'], ['coup_dans_le_dos', 'bond_ombre', 'egorgement']);
    const e = c.enemies[0];
    let hp = e.hp;
    play(c, 'coup_dans_le_dos');
    expect(hp - e.hp).toBe(18);
    expect(canPlayCard(c, idx(c, 'egorgement'))).toBe(false);
    play(c, 'bond_ombre');
    expect(canPlayCard(c, idx(c, 'egorgement'))).toBe(true);
    hp = e.hp;
    play(c, 'egorgement');
    expect(hp - e.hp).toBe(24);
  });

  it('Ombres profondes : 2 tours ; Ténèbres le garde pour la run', () => {
    const c = fight(['lieutenant'], [], { longStealth: 1 });
    endTurn(c);
    expect(c.stealth).toBe(true);
    const run = newRun(1, null, [], 0, 'voleur');
    run.combat = fight(['lieutenant'], ['tenebres_voleur']);
    play(run.combat, 'tenebres_voleur');
    run.combat.phase = 'victory';
    run.screen = 'combat';
    afterCombatAction(run);
    expect(run.tenebres).toBe(true);
    expect(runGear(run).longStealth).toBe(1);
  });
});

describe('les Poisons', () => {
  it('un seul Poison d\'arme ; chaque Attaque qui touche fait les dégâts du Poison', () => {
    const c = fight(['lieutenant'], ['poison_mortel', 'poison_affaiblissant', 'attaque_sinistre', 'double_frappe']);
    const e = c.enemies[0];
    play(c, 'poison_mortel');
    play(c, 'poison_affaiblissant');
    expect(c.weaponPoison?.id).toBe('affaiblissant');
    play(c, 'attaque_sinistre');
    expect(e.buffs.poison).toBe(1);
    expect(e.buffs.demoralise).toBe(1);
    const hp = e.hp;
    play(c, 'double_frappe');
    // 4 + 1 de Poison, puis 4 + 2 de Poison.
    expect(hp - e.hp).toBe(4 + 1 + 4 + 2);
    expect(e.buffs.poison).toBe(3);
  });

  it('le Poison diminue à la fin du tour ennemi, sauf avec Lames empoisonnées ; Envenimer le double', () => {
    const c = fight(['lieutenant'], ['fiole_venin', 'envenimer']);
    const e = c.enemies[0];
    play(c, 'fiole_venin');
    play(c, 'envenimer');
    expect(e.buffs.poison).toBe(6);
    endTurn(c);
    expect(e.buffs.poison).toBe(5);
    c.powers = { lames_empoisonnees: 1 };
    endTurn(c);
    expect(e.buffs.poison).toBe(5);
  });
});

describe('le contrôle', () => {
  it('Coup aux reins : un ennemi normal ne fait rien ; un boss est Démoralisé', () => {
    const c = fight(['lieutenant'], ['marque_mort', 'coup_aux_reins']);
    play(c, 'marque_mort');
    play(c, 'coup_aux_reins');
    expect(c.enemies[0].stun).toBe(1);
    const hp = c.player.hp;
    c.player.block = 0;
    endTurn(c);
    expect(c.player.hp).toBe(hp);
    const b = fight(['gorlok'], ['marque_mort', 'coup_aux_reins']);
    const boss = b.enemies.find((e) => e.defId === 'gorlok')!;
    play(b, 'marque_mort');
    play(b, 'coup_aux_reins', boss.uid);
    expect(boss.stun ?? 0).toBe(0);
    expect(boss.buffs.demoralise).toBe(5);
  });

  it('Assommer prend fin si la cible est blessée', () => {
    const c = fight(['lieutenant'], ['assommer', 'attaque_sinistre']);
    play(c, 'assommer');
    expect(c.enemies[0].sap).toBe(2);
    play(c, 'attaque_sinistre');
    expect(c.enemies[0].sap).toBe(0);
  });

  it('Coup de pied interrompt une Incantation', () => {
    const c = fight(['lieutenant'], [], {}, ['coup_de_pied']);
    const e = c.enemies[0];
    e.intent = { kind: 'attack', dmg: 10, cast: 'Boule de feu' };
    spell(c, 'coup_de_pied');
    expect(e.interrupted).toBe(true);
  });
});

describe('les Pouvoirs du Voleur', () => {
  it('Ambidextrie experte joue deux fois la première Attaque du tour', () => {
    const c = fight(['lieutenant'], ['ambidextrie_experte', 'tir_pistolet', 'attaque_sinistre']);
    const e = c.enemies[0];
    play(c, 'ambidextrie_experte');
    let hp = e.hp;
    play(c, 'tir_pistolet');
    expect(hp - e.hp).toBe(16);
    expect(c.combo).toBe(2);
    hp = e.hp;
    play(c, 'attaque_sinistre');
    expect(hp - e.hp).toBe(6);
  });

  it('Opportunité : un finisher à 5 points rend 1 énergie et 1 combo', () => {
    const c = fight(['lieutenant'], ['opportunite', 'marque_mort', 'evisceration']);
    play(c, 'opportunite');
    play(c, 'marque_mort');
    const energy = c.player.energy;
    play(c, 'evisceration');
    expect(c.player.energy).toBe(energy - 1 + 1);
    expect(c.combo).toBe(1);
  });
});

describe('Sillon d\'orage', () => {
  it('les deux fermoirs, puis Ventor forge la lame', () => {
    const run = newRun(1, null, [], 0, 'voleur');
    for (const loot of ['gorlok', 'vossk']) {
      run.encounter = { kind: 'combat', name: loot, enemies: [loot], loot };
      run.combat = fight([loot], []);
      run.combat.phase = 'victory';
      run.screen = 'combat';
      afterCombatAction(run);
      run.pendingItem = null;
    }
    expect(run.sillon).toBe('deux');
    run.eventId = 'ventor';
    run.screen = 'event';
    resolveEvent(run, 0);
    expect(run.equipment.arme).toBe('sillon_orage');
    expect(run.sillon).toBe('forged');
  });

  it('toutes les 3 Attaques, un éclair frappe tous les ennemis', () => {
    const c = fight(['lieutenant', 'lieutenant'], ['attaque_sinistre', 'attaque_sinistre', 'attaque_sinistre'], { stormblade: 1 });
    const other = c.enemies[1];
    const t = c.enemies[0].uid;
    play(c, 'attaque_sinistre', t);
    play(c, 'attaque_sinistre', t);
    expect(other.hp).toBe(200);
    play(c, 'attaque_sinistre', t);
    expect(other.hp).toBe(194);
  });
});
