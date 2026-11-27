import { describe, expect, it } from 'vitest';
import { CARDS, energyCost, rewardPool, starterCards } from '../src/engine/cards';
import { canPlayCard, cardBlockReason, createCombat, endTurn, isEnraged, playCard, useSpell } from '../src/engine/combat';
import { flecheDamage, flecheStartTurn, trapTargetBlock } from '../src/engine/chasseur';
import { clearPlayerEffects } from '../src/engine/yzhar';
import type { Encounter } from '../src/engine/enemies';
import { afterCombatAction, campfireCorde, canForgeCorde, chooseCompanion, newRun, offerCompanion, resolveEvent } from '../src/engine/run';
import { lootSpells } from '../src/engine/spells';
import { CHASSEUR_TREES, emptyAlloc, talentIds, toggleTalent } from '../src/engine/talents';
import { migrate } from '../src/engine/save';
import type { ItemEffects } from '../src/engine/items';
import type { CardInstance, CombatState, CompanionId } from '../src/engine/types';

const deck = (ids: string[]): CardInstance[] => ids.map((id, i) => ({ uid: 1000 + i, id, upgraded: false }));
function fight(enemies: string[], hand: string[], gear: ItemEffects = {}, companion: CompanionId = 'loup', spells: string[] = ['tir_arcanique']): CombatState {
  const enc: Encounter = { kind: 'combat', name: 'Test', enemies };
  const c = createCombat(enc, deck(Array(10).fill('repli')), 70, 70, 7, 1, gear, spells, undefined, 'chasseur', undefined, companion);
  c.hand = hand.map((id, i) => ({ uid: 5000 + i, id, upgraded: false }));
  c.player.energy = 10;
  for (const e of c.enemies) e.hp = e.maxHp = 200;
  return c;
}
const play = (c: CombatState, id: string, target?: number): boolean => playCard(c, c.hand.findIndex((k) => k.id === id), target);
const spell = (c: CombatState, id: string, target?: number) => useSpell(c, c.spells.findIndex((s) => s.id === id), target);
/** Fin du tour sans que les ennemis ne fassent de dégâts gênants (on regarde seulement leurs PV). */
const lost = (c: CombatState, i = 0) => 200 - c.enemies[i].hp;

describe('le Chasseur : la run', () => {
  it('70 PV, son deck de départ et Tir arcanique', () => {
    const run = newRun(1, null, [], 0, 'chasseur');
    expect(run.maxHp).toBe(70);
    expect(run.spells).toEqual(['tir_arcanique']);
    expect(run.deck.filter((k) => k.id === 'tir')).toHaveLength(4);
    expect(run.deck.filter((k) => k.id === 'repli')).toHaveLength(4);
    expect(run.deck.some((k) => k.id === 'ordre_attaque')).toBe(true);
  });

  it('52 cartes en récompense (+ Tir et Repli), 14 par arbre (15 en Survie avec Coup dans le piège)', () => {
    expect(rewardPool('chasseur')).toHaveLength(52);
    expect(starterCards('chasseur')).toEqual(['tir', 'repli']);
    for (const tree of CHASSEUR_TREES) expect(tree.cards).toHaveLength(tree.id === 'survie' ? 15 : 14);
    for (const tree of CHASSEUR_TREES) for (const id of tree.cards) expect(CARDS[id]?.classId).toBe('chasseur');
  });

  it('les talents donnent les sorts de barre et la carte épique', () => {
    const alloc = emptyAlloc('chasseur');
    for (let tier = 0; tier < 5; tier++) toggleTalent(alloc, 'precision', tier, 'A', 10, 'chasseur');
    const run = newRun(1, null, talentIds(alloc, 'chasseur'), 0, 'chasseur');
    expect(run.spells).toContain('tir_rapide');
    expect(run.deck.some((k) => k.id === 'tir_du_coeur')).toBe(true);
    expect(lootSpells('chasseur').sort()).toEqual(['appel_compagnon', 'fusee_eclairante', 'tir_dispersion']);
  });

  it('le compagnon se choisit au départ, avant Brégan', () => {
    const run = newRun(1, null, [], 0, 'chasseur');
    offerCompanion(run);
    expect(run.screen).toBe('companion');
    expect(chooseCompanion(run, 'ours')).toBe(true);
    expect(run.companion).toBe('ours');
    expect(run.screen).toBe('blessing');
    // Les autres classes vont directement chez Brégan.
    const other = newRun(1, null, [], 0, 'guerrier');
    offerCompanion(other);
    expect(other.screen).toBe('blessing');
  });

  it('une ancienne sauvegarde reçoit un Loup', () => {
    const run = JSON.parse(JSON.stringify(newRun(1, null, [], 0, 'guerrier')));
    run.version = 23;
    delete run.companion;
    delete run.corde;
    const m = migrate(run)!;
    expect(m.version).toBe(28);
    expect(m.companion).toBe('loup');
    expect(m.corde).toBeNull();
  });
});

describe('le compagnon', () => {
  it('le Loup frappe la dernière cible à la fin du tour', () => {
    const c = fight(['lieutenant', 'lieutenant'], ['tir']);
    const b = c.enemies[1];
    play(c, 'tir', b.uid);
    const before = b.hp;
    endTurn(c);
    expect(before - b.hp).toBe(5);
  });

  it('l\'Ours protège, le Raptor fait saigner', () => {
    const c = fight(['lieutenant'], ['ordre_attaque'], {}, 'ours');
    play(c, 'ordre_attaque');
    expect(c.player.block).toBe(3);
    expect(lost(c)).toBe(3);
    const r = fight(['lieutenant'], ['ordre_attaque'], {}, 'raptor');
    play(r, 'ordre_attaque');
    expect(r.enemies[0].buffs.saignement).toBe(2);
  });

  it('Ordre : Égorge, Rage du compagnon et Frénésie', () => {
    const c = fight(['lieutenant'], ['rage_compagnon', 'ordre_egorge', 'frenesie_chasseur', 'ordre_attaque']);
    const e = c.enemies[0];
    play(c, 'rage_compagnon');
    play(c, 'ordre_egorge', e.uid);
    expect(lost(c)).toBe(19);
    play(c, 'frenesie_chasseur');
    play(c, 'ordre_attaque');
    expect(lost(c)).toBe(19 + 5);
    expect(c.frenzyStacks).toBe(1);
    // Le bonus de Frénésie repart de zéro au tour suivant.
    endTurn(c);
    expect(c.frenzyStacks).toBe(0);
  });

  it('Fureur primitive : le compagnon agit 2 fois ; Corde-des-anciens ne le fait plus agir en plus', () => {
    const c = fight(['lieutenant'], ['fureur_primitive'], { cordeAnciens: 1 });
    play(c, 'fureur_primitive');
    const e = c.enemies[0];
    const before = e.hp;
    endTurn(c);
    expect(before - e.hp).toBe(10);
  });

  it('Corde-des-anciens : une Flèche des anciens par tour, qui se tend si on la garde (5, 10, 15)', () => {
    const c = fight(['lieutenant'], ['repli'], { cordeAnciens: 1 });
    c.hand = [];
    flecheStartTurn(c);
    expect(c.hand.filter((k) => k.id === 'fleche_anciens')).toHaveLength(1);
    expect(flecheDamage(c)).toBe(5);
    for (const want of [10, 15, 15]) {
      flecheStartTurn(c); // gardée en main : pas de deuxième flèche, elle se tend
      expect(c.hand.filter((k) => k.id === 'fleche_anciens')).toHaveLength(1);
      expect(flecheDamage(c)).toBe(want);
    }
    const e = c.enemies[0];
    const before = e.hp;
    play(c, 'fleche_anciens', e.uid);
    expect(before - e.hp).toBe(15);
    expect(c.exhaust.some((k) => k.id === 'fleche_anciens')).toBe(true);
    flecheStartTurn(c);
    expect(flecheDamage(c)).toBe(5); // la suivante repart de 5
  });

  it('la Flèche des anciens reste en main à la fin du tour', () => {
    const c = fight(['lieutenant'], ['repli'], { cordeAnciens: 1 });
    flecheStartTurn(c);
    endTurn(c);
    expect(c.hand.some((k) => k.id === 'fleche_anciens')).toBe(true);
    expect(c.flecheCharge).toBe(1);
  });

  it('Dressage : les Ordres coûtent 1 de moins', () => {
    const c = fight(['lieutenant'], ['dressage', 'ordre_egorge']);
    expect(energyCost(c, 'ordre_egorge', false)).toBe(2);
    play(c, 'dressage');
    expect(energyCost(c, 'ordre_egorge', false)).toBe(1);
  });

  it('la Malédiction de lignée fait fuir le compagnon', () => {
    const c = fight(['lieutenant'], ['ordre_attaque']);
    c.player.debuffs!.lignee = 2;
    play(c, 'ordre_attaque');
    expect(lost(c)).toBe(0);
  });
});

describe('les Esprits et la Marque', () => {
  it('un seul Esprit à la fois ; l\'aigle renforce les Attaques', () => {
    const c = fight(['lieutenant'], ['esprit_tortue', 'esprit_aigle', 'tir']);
    play(c, 'esprit_tortue');
    play(c, 'esprit_aigle');
    expect(c.aspect).toBe('aigle');
    play(c, 'tir');
    expect(lost(c)).toBe(8);
  });

  it('la tortue renforce les cartes de blocage', () => {
    const c = fight(['lieutenant'], ['esprit_tortue', 'repli']);
    play(c, 'esprit_tortue');
    play(c, 'repli');
    expect(c.player.block).toBe(9);
  });

  it('la Marque : +3 aux Attaques et au compagnon ; Tir du cœur double sur une cible marquée', () => {
    const c = fight(['lieutenant'], ['marque_proie', 'tir', 'ordre_attaque', 'tir_du_coeur']);
    const e = c.enemies[0];
    play(c, 'marque_proie', e.uid);
    play(c, 'tir');
    expect(lost(c)).toBe(9);
    play(c, 'ordre_attaque');
    expect(lost(c)).toBe(9 + 8);
    e.block = 50;
    play(c, 'tir_du_coeur');
    expect(lost(c)).toBe(17 + 43);
  });
});

describe('les Pièges', () => {
  it('un Piège se pose sur un ennemi et part quand il agit : plein sur lui, moitié aux autres (27 novembre 2026)', () => {
    const c = fight(['lieutenant', 'lieutenant'], ['piege_explosif']);
    c.player.debuffs!.lignee = 5; // le compagnon ne compte pas ici
    const [a, b] = c.enemies;
    play(c, 'piege_explosif', b.uid);
    expect(b.traps!.map((t) => t.id)).toEqual(['explosif']);
    expect(a.traps ?? []).toHaveLength(0);
    const hp = c.player.hp;
    endTurn(c);
    expect(b.traps).toHaveLength(0);
    expect(lost(c, 1)).toBe(8);
    expect(lost(c, 0)).toBe(4);
    // Il survit : son action a bien lieu (les deux Lieutenants frappent).
    expect(c.player.hp).toBeLessThan(hp);
  });

  it('un seul Piège de chaque type par ennemi, et ce qui ne se cumule pas se voit avant de jouer', () => {
    const c = fight(['lieutenant', 'lieutenant'], ['piege_explosif', 'piege_explosif', 'piege_explosif', 'piege_venin']);
    const [a, b] = c.enemies;
    play(c, 'piege_explosif', a.uid);
    expect(trapTargetBlock('piege_explosif', a)).toBe('Déjà un Piège explosif');
    expect(trapTargetBlock('piege_venin', a)).toBeNull();
    expect(play(c, 'piege_explosif', a.uid)).toBe(false);
    expect(play(c, 'piege_explosif', b.uid)).toBe(true);
    // Tous les ennemis en ont un : la carte est grisée et dit pourquoi.
    const i = c.hand.findIndex((k) => k.id === 'piege_explosif');
    expect(canPlayCard(c, i)).toBe(false);
    expect(cardBlockReason(c, i)).toBe('Tous les ennemis ont déjà un Piège explosif.');
    // Un autre type se pose toujours.
    expect(play(c, 'piege_venin', a.uid)).toBe(true);
    expect(a.traps!.map((t) => t.id)).toEqual(['explosif', 'venin']);
  });

  it('Champ de pièges : un Piège explosif sur chaque ennemi qui n\'en a pas ; Maître des pièges les déclenche deux fois', () => {
    const c = fight(['lieutenant', 'lieutenant'], ['champ_pieges', 'piege_explosif', 'maitre_pieges']);
    c.player.debuffs!.lignee = 5;
    const [a, b] = c.enemies;
    play(c, 'piege_explosif', a.uid);
    play(c, 'champ_pieges');
    expect(a.traps!.map((t) => t.value)).toEqual([8]); // déjà piégé : sauté
    expect(b.traps!.map((t) => t.value)).toEqual([12]);
    play(c, 'maitre_pieges');
    endTurn(c);
    // a : 8 ×2 sur lui, puis 6 ×2 du Piège de b ; b : 4 ×2 du Piège de a, puis 12 ×2.
    expect(lost(c, 0)).toBe(16 + 12);
    expect(lost(c, 1)).toBe(8 + 24);
  });

  it('un ennemi qui n\'agit pas ne déclenche pas son Piège ; un ennemi tué avant d\'agir l\'emporte', () => {
    const c = fight(['lieutenant', 'lieutenant'], ['piege_explosif', 'piege_venin']);
    c.player.debuffs!.lignee = 5;
    const [a, b] = c.enemies;
    play(c, 'piege_explosif', a.uid);
    a.stun = 1;
    endTurn(c);
    expect(a.traps!.map((t) => t.id)).toEqual(['explosif']); // il attend
    expect(lost(c, 1)).toBe(0);
    c.hand = [{ uid: 7000, id: 'piege_venin', upgraded: false }];
    c.player.energy = 5;
    play(c, 'piege_venin', b.uid);
    b.dead = true;
    endTurn(c);
    expect(c.enemies[0].dots?.some((d) => d.id === 'piege_venin') ?? false).toBe(false);
  });

  it('Piégeur né : un Piège explosif sur le premier ennemi ; Yzhar qui change de corps efface les Pièges', () => {
    const c = fight(['lieutenant', 'lieutenant'], [], { startTrap: 1 });
    expect(c.enemies[0].traps!.map((t) => t.id)).toEqual(['explosif']);
    expect(c.enemies[1].traps ?? []).toHaveLength(0);
    clearPlayerEffects(c, c.enemies[0]);
    expect(c.enemies[0].traps).toHaveLength(0);
  });

  it('Coup dans le piège : 6 dégâts, puis les Pièges de la cible partent tout de suite', () => {
    const c = fight(['lieutenant', 'lieutenant'], ['piege_explosif', 'piege_givrant', 'coup_dans_le_piege']);
    c.player.debuffs!.lignee = 5;
    const [a] = c.enemies;
    play(c, 'piege_explosif', a.uid);
    play(c, 'piege_givrant', a.uid);
    play(c, 'coup_dans_le_piege', a.uid);
    expect(lost(c, 0)).toBe(6 + 8);
    expect(lost(c, 1)).toBe(4);
    expect(a.traps).toHaveLength(0);
    // Le Givrant a pris : il perd sa prochaine action (seul le 2e Lieutenant frappe).
    const hp = c.player.hp;
    endTurn(c);
    expect(a.trapFrozen).toBeFalsy();
    const solo = fight(['lieutenant'], []);
    solo.player.debuffs!.lignee = 5;
    const hpSolo = solo.player.hp;
    endTurn(solo);
    expect(hp - c.player.hp).toBe(hpSolo - solo.player.hp);
  });

  it('une run sauvegardée avec les anciens Pièges : ils passent sur le premier ennemi', () => {
    const run = newRun(1, null, [], 0, 'chasseur');
    const c = fight(['lieutenant', 'lieutenant'], []);
    run.combat = c;
    const old = JSON.parse(JSON.stringify(run));
    old.version = 27;
    old.combat.traps = [{ id: 'explosif', value: 8 }, { id: 'explosif', value: 12 }, { id: 'venin', value: 2 }];
    const m = migrate(old)!;
    expect(m.version).toBe(28);
    expect(m.combat!.enemies[0].traps!.map((t) => t.id)).toEqual(['explosif', 'venin']);
    expect((m.combat as unknown as { traps?: unknown }).traps).toBeUndefined();
  });

  it('les textes des Pièges comptent Pièges améliorés (27 novembre 2026)', () => {
    const g = { trapBonus: 3 };
    expect(CARDS.piege_explosif.text(false, g)).toContain('11 dégâts');
    expect(CARDS.piege_explosif.text(true, g)).toContain('15 dégâts');
    expect(CARDS.champ_pieges.text(false, g)).toContain('(15 dégâts');
    expect(CARDS.champ_pieges.text(false, {})).toContain('(12 dégâts');
    expect(CARDS.piege_immolation.text(false, g)).toContain('DoT 5');
    expect(CARDS.piege_venin.text(true, g)).toContain('DoT 4');
    // Le texte dit vrai : un Piège explosif amélioré de 15 enlève 15 PV.
    const c = fight(['lieutenant'], ['piege_explosif'], g);
    c.hand[0].upgraded = true;
    c.player.debuffs!.lignee = 5; // le compagnon ne compte pas ici
    play(c, 'piege_explosif');
    endTurn(c);
    expect(lost(c)).toBe(15);
  });

  it('le Piège givrant : l\'ennemi piégé perd son action', () => {
    const c = fight(['lieutenant'], ['piege_givrant']);
    c.player.debuffs!.lignee = 5;
    play(c, 'piege_givrant');
    const hp = c.player.hp;
    endTurn(c);
    expect(c.player.hp).toBe(hp);
    expect(c.enemies[0].trapFrozen).toBeFalsy();
  });

  it('Instinct du chasseur : +1 énergie et +1 carte au tour qui suit un Piège', () => {
    const c = fight(['lieutenant'], ['piege_venin'], { trapEnergy: 1 });
    const sans = fight(['lieutenant'], ['piege_venin']);
    for (const x of [c, sans]) { play(x, 'piege_venin'); endTurn(x); }
    expect(c.player.energy).toBe(4);
    expect(c.hand.length).toBe(sans.hand.length + 1);
    expect(c.enemies[0].dots?.some((d) => d.id === 'piege_venin')).toBe(true);
  });
});

describe('les sorts et les coûts', () => {
  it('Tir arcanique ignore le blocage', () => {
    const c = fight(['lieutenant'], []);
    c.enemies[0].block = 20;
    spell(c, 'tir_arcanique', c.enemies[0].uid);
    expect(lost(c)).toBe(5);
  });

  it('Tir rapide : les Attaques coûtent 1 de moins ce tour-ci', () => {
    const c = fight(['lieutenant'], ['tir_ajuste'], {}, 'loup', ['tir_rapide']);
    spell(c, 'tir_rapide');
    expect(energyCost(c, 'tir_ajuste', false)).toBe(1);
  });

  it('Feindre la mort : moitié moins de dégâts reçus', () => {
    const a = fight(['lieutenant'], [], {}, 'loup', ['feindre_mort']);
    const b = fight(['lieutenant'], [], {}, 'loup', ['feindre_mort']);
    spell(b, 'feindre_mort');
    a.player.block = 0;
    b.player.block = 0;
    endTurn(a);
    endTurn(b);
    expect(70 - b.player.hp).toBe(Math.floor((70 - a.player.hp) / 2));
  });

  it('Flèche apaisante suspend le Berserk pendant le tour', () => {
    const c = fight(['lieutenant'], [], {}, 'loup', ['fleche_apaisante']);
    c.enrageTurn = 1;
    expect(isEnraged(c)).toBe(true);
    spell(c, 'fleche_apaisante', c.enemies[0].uid);
    expect(isEnraged(c)).toBe(false);
  });

  it('Riposte sauvage coûte 0 après une attaque bloquée', () => {
    const c = fight(['lieutenant'], ['riposte_sauvage']);
    c.player.block = 50;
    endTurn(c);
    expect(energyCost(c, 'riposte_sauvage', false)).toBe(0);
  });
});

describe('Corde-des-anciens', () => {
  it('le trappeur, les Trois Souffles, puis le feu de camp', () => {
    const run = newRun(1, null, [], 0, 'chasseur');
    run.eventId = 'trappeur';
    run.screen = 'event';
    resolveEvent(run, 2);
    expect(run.corde).toBe('bois');
    // Les Trois Souffles tombent.
    run.encounter = { kind: 'combat', name: 'Les Trois Souffles', enemies: ['drake_braise'], loot: 'trois_souffles' };
    run.combat = createCombat(run.encounter, run.deck, run.hp, run.maxHp, 1, 100, {}, run.spells, undefined, 'chasseur');
    run.combat.phase = 'victory';
    run.screen = 'combat';
    afterCombatAction(run);
    expect(run.corde).toBe('tendon');
    run.act = 2;
    run.screen = 'campfire';
    expect(canForgeCorde(run)).toBe(true);
    expect(campfireCorde(run)).toBe(true);
    expect(run.equipment.arme).toBe('corde_anciens');
    expect(run.corde).toBe('forged');
  });

  it('le choix du Bois ancien est réservé au Chasseur', () => {
    const run = newRun(1, null, [], 0, 'guerrier');
    run.eventId = 'trappeur';
    run.screen = 'event';
    resolveEvent(run, 2);
    expect(run.corde).toBeNull();
  });
});
