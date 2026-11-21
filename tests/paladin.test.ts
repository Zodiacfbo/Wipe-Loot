import { describe, expect, it } from 'vitest';
import { CARDS, energyCost, rewardPool, starterCards } from '../src/engine/cards';
import { createCombat, endTurn, playCard, useSpell } from '../src/engine/combat';
import type { Encounter } from '../src/engine/enemies';
import { afterCombatAction, campfireAurore, canForgeAurore, newRun, resolveEvent } from '../src/engine/run';
import { EVENTS } from '../src/engine/events';
import { lootSpells } from '../src/engine/spells';
import { PALADIN_TREES, emptyAlloc, talentIds, toggleTalent } from '../src/engine/talents';
import type { ItemEffects } from '../src/engine/items';
import type { CardInstance, CombatState } from '../src/engine/types';

const deck = (ids: string[]): CardInstance[] => ids.map((id, i) => ({ uid: 1000 + i, id, upgraded: false }));
function fight(enemies: string[], hand: string[], gear: ItemEffects = {}, spells: string[] = ['jugement']): CombatState {
  const enc: Encounter = { kind: 'combat', name: 'Test', enemies };
  const c = createCombat(enc, deck(Array(10).fill('parade_pal')), 80, 80, 7, 1, gear, spells, undefined, 'paladin');
  c.hand = hand.map((id, i) => ({ uid: 5000 + i, id, upgraded: false }));
  c.player.energy = 10;
  for (const e of c.enemies) e.hp = e.maxHp = 200;
  return c;
}
const play = (c: CombatState, id: string, target?: number) => playCard(c, c.hand.findIndex((k) => k.id === id), target);
const spell = (c: CombatState, id: string, target?: number) => useSpell(c, c.spells.findIndex((s) => s.id === id), target);

describe('le Paladin : la run', () => {
  it('80 PV, son deck de départ et Jugement', () => {
    const run = newRun(1, null, [], 0, 'paladin');
    expect(run.maxHp).toBe(80);
    expect(run.spells).toEqual(['jugement']);
    expect(run.deck.filter((k) => k.id === 'frappe_pal')).toHaveLength(4);
    expect(run.deck.some((k) => k.id === 'sceau_droiture')).toBe(true);
  });

  it('51 cartes en récompense (+ Frappe et Parade), 14 par arbre', () => {
    expect(rewardPool('paladin')).toHaveLength(51);
    expect(starterCards('paladin')).toEqual(['frappe_pal', 'parade_pal']);
    for (const tree of PALADIN_TREES) expect(tree.cards).toHaveLength(14);
    for (const tree of PALADIN_TREES) for (const id of tree.cards) expect(CARDS[id]?.classId).toBe('paladin');
  });

  it('les talents donnent les sorts de barre et la carte épique', () => {
    const alloc = emptyAlloc('paladin');
    for (let tier = 0; tier < 5; tier++) toggleTalent(alloc, 'vindicte', tier, 'A', 10, 'paladin');
    const run = newRun(1, null, talentIds(alloc, 'paladin'), 0, 'paladin');
    expect(run.spells).toContain('ailes_justice');
    expect(run.deck.some((k) => k.id === 'verdict_cieux')).toBe(true);
    expect(lootSpells('paladin').sort()).toEqual(['benediction_sauvegarde', 'charge_sacree', 'lumiere_aube']);
  });
});

describe('les Sceaux et le Jugement', () => {
  it('un seul Sceau à la fois ; le Sceau de droiture renforce les Attaques', () => {
    const c = fight(['lieutenant'], ['sceau_croise', 'sceau_droiture', 'frappe_pal']);
    play(c, 'sceau_croise');
    play(c, 'sceau_droiture');
    expect(c.seals).toEqual(['droiture']);
    const e = c.enemies[0];
    const hp = e.hp;
    play(c, 'frappe_pal');
    expect(hp - e.hp).toBe(9);
  });

  it('le Jugement consomme le Sceau ; sans Sceau, il inflige 6 dégâts', () => {
    const c = fight(['lieutenant'], ['sceau_droiture']);
    const e = c.enemies[0];
    let hp = e.hp;
    spell(c, 'jugement');
    expect(hp - e.hp).toBe(6);
    c.spells[0].cooldown = 0;
    play(c, 'sceau_droiture');
    hp = e.hp;
    spell(c, 'jugement');
    expect(hp - e.hp).toBe(12);
    expect(c.seals).toEqual([]);
    expect(c.lastJudged).toBe('droiture');
  });

  it('Sceau du croisé : +1 dégât par Attaque déjà jouée ; son Jugement fracasse l\'armure', () => {
    const c = fight(['lieutenant'], ['sceau_croise', 'frappe_pal', 'frappe_pal']);
    const e = c.enemies[0];
    play(c, 'sceau_croise');
    play(c, 'frappe_pal');
    const hp = e.hp;
    play(c, 'frappe_pal');
    expect(hp - e.hp).toBe(7);
    spell(c, 'jugement');
    expect(e.buffs.armureFracassee).toBe(2);
  });

  it('Sceau de lumière et du rempart : chaque Attaque soigne ou protège', () => {
    const c = fight(['lieutenant'], ['sceau_lumiere', 'frappe_pal', 'sceau_rempart', 'frappe_pal']);
    c.player.hp = 50;
    play(c, 'sceau_lumiere');
    play(c, 'frappe_pal');
    expect(c.player.hp).toBe(52);
    play(c, 'sceau_rempart');
    const block = c.player.block;
    play(c, 'frappe_pal');
    expect(c.player.block).toBe(block + 3);
  });

  it('Sceau de vengeance : la Censure s\'accumule, brûle, puis le Jugement la consomme', () => {
    const c = fight(['lieutenant'], ['sceau_vengeance', 'ferveur']);
    const e = c.enemies[0];
    play(c, 'sceau_vengeance');
    play(c, 'ferveur');
    expect(e.buffs.censure).toBe(2);
    const hp = e.hp;
    spell(c, 'jugement');
    expect(hp - e.hp).toBe(10);
    expect(e.buffs.censure).toBe(0);
  });

  it('Sceau de sagesse : une carte de plus par tour, et de l\'énergie au Jugement', () => {
    const c = fight(['lieutenant'], ['sceau_sagesse']);
    play(c, 'sceau_sagesse');
    endTurn(c);
    expect(c.hand).toHaveLength(6);
    const energy = c.player.energy;
    spell(c, 'jugement');
    expect(c.player.energy).toBe(energy + 1);
  });

  it('Double sceau : deux Sceaux, jugés ensemble ; Verdict des cieux les garde', () => {
    const c = fight(['lieutenant'], ['sceau_droiture', 'sceau_rempart', 'verdict_cieux'], { doubleSeal: 1 });
    play(c, 'sceau_droiture');
    play(c, 'sceau_rempart');
    expect(c.seals).toEqual(['droiture', 'rempart']);
    play(c, 'verdict_cieux');
    expect(c.seals).toEqual(['droiture', 'rempart']);
    const block = c.player.block;
    spell(c, 'jugement');
    expect(c.player.block).toBe(block + 12);
    expect(c.seals).toEqual([]);
  });

  it('Sceaux bénis : les Sceaux coûtent 0 ; Zèle donne de la Puissance (5 au maximum)', () => {
    const c = fight(['lieutenant'], ['zele', ...Array(6).fill('sceau_croise')], { sealsFree: 1 });
    expect(energyCost(c, 'sceau_croise', false)).toBe(0);
    play(c, 'zele');
    for (let i = 0; i < 6; i++) play(c, 'sceau_croise');
    expect(c.player.puissance).toBe(5);
  });

  it('Inquisition réactive le dernier Sceau jugé', () => {
    const c = fight(['lieutenant'], ['sceau_rempart', 'inquisition']);
    play(c, 'sceau_rempart');
    spell(c, 'jugement');
    play(c, 'inquisition');
    expect(c.seals).toEqual(['rempart']);
  });
});

describe('les Auras', () => {
  it('une seule Aura : la dévotion rend sa Robustesse en partant', () => {
    const c = fight(['lieutenant'], ['aura_devotion', 'aura_epines']);
    play(c, 'aura_devotion');
    expect(c.player.robustesse).toBe(2);
    play(c, 'aura_epines');
    expect(c.player.robustesse).toBe(0);
    expect(c.aura?.id).toBe('epines');
  });

  it('Aura d\'épines : chaque attaque ennemie blesse l\'attaquant', () => {
    const c = fight(['molosse'], ['aura_epines']);
    play(c, 'aura_epines');
    const e = c.enemies[0];
    const hp = e.hp;
    endTurn(c);
    expect(hp - e.hp).toBeGreaterThanOrEqual(3);
  });

  it('Aura de résistance : les Zones de feu font moitié moins mal', () => {
    const c = fight(['lieutenant'], ['aura_resistance', 'zone_de_feu']);
    play(c, 'aura_resistance');
    c.player.block = 0;
    c.enemies[0].intent = { kind: 'block', amount: 1 };
    const hp = c.player.hp;
    endTurn(c);
    expect(hp - c.player.hp).toBe(3);
  });
});

describe('les autres cartes', () => {
  it('Exorcisme double contre un Démon ; les Molosses de braise sont des Démons', () => {
    const c = fight(['molosse', 'lieutenant'], ['exorcisme', 'exorcisme']);
    const [demon, man] = c.enemies;
    play(c, 'exorcisme', demon.uid);
    play(c, 'exorcisme', man.uid);
    expect(200 - demon.hp).toBe(18);
    expect(200 - man.hp).toBe(9);
  });

  it('Bouclier du croisé : 12 blocage, renvoi de 4 dégâts et soin de 2 PV par attaque bloquée, pas Épuisé', () => {
    const c = fight(['lieutenant'], ['bouclier_croise']);
    play(c, 'bouclier_croise');
    expect(c.player.block).toBe(12);
    expect(c.crusaderShield).toEqual({ dmg: 4, heal: 2 });
    expect(c.discard.some((k) => k.id === 'bouclier_croise')).toBe(true);
  });

  it('Juste châtiment rend les dégâts bloqués depuis ton dernier tour', () => {
    const c = fight(['lieutenant'], ['bouclier_beni']);
    play(c, 'bouclier_beni');
    c.enemies[0].intent = { kind: 'attack', dmg: 10 };
    endTurn(c);
    expect(c.blockedSince).toBeGreaterThan(0);
    const blocked = c.blockedSince!;
    c.hand.push({ uid: 9000, id: 'juste_chatiment', upgraded: false });
    c.player.energy = 5;
    const e = c.enemies[0];
    const hp = e.hp;
    play(c, 'juste_chatiment');
    expect(hp - e.hp).toBe(blocked);
  });

  it('Consécration brûle à la fin de ce tour et du suivant', () => {
    const c = fight(['lieutenant'], ['consecration']);
    c.enemies[0].intent = { kind: 'block', amount: 0 };
    play(c, 'consecration');
    const e = c.enemies[0];
    endTurn(c);
    expect(200 - e.hp).toBe(5);
    e.intent = { kind: 'block', amount: 0 };
    endTurn(c);
    expect(200 - e.hp).toBe(10);
    e.intent = { kind: 'block', amount: 0 };
    endTurn(c);
    expect(200 - e.hp).toBe(10);
  });

  it('Faveur divine double le prochain soin', () => {
    const c = fight(['lieutenant'], ['faveur_divine', 'lumiere_bienfaisante', 'lumiere_bienfaisante']);
    c.player.hp = 40;
    play(c, 'faveur_divine');
    play(c, 'lumiere_bienfaisante');
    expect(c.player.hp).toBe(50);
    play(c, 'lumiere_bienfaisante');
    expect(c.player.hp).toBe(55);
  });

  it('Rayonnement : chaque soin blesse tous les ennemis ; Illumination rend 1 énergie', () => {
    const c = fight(['lieutenant', 'lieutenant'], ['rayonnement', 'illumination', 'lumiere_bienfaisante']);
    c.player.hp = 40;
    play(c, 'rayonnement');
    play(c, 'illumination');
    const energy = c.player.energy;
    play(c, 'lumiere_bienfaisante');
    expect(c.enemies.map((e) => 200 - e.hp)).toEqual([2, 2]);
    expect(c.player.energy).toBe(energy - 1 + 1);
  });

  it('Science du combat : après 2 Attaques, la prochaine carte de soin coûte 0', () => {
    const c = fight(['lieutenant'], ['science_combat', 'frappe_pal', 'frappe_pal', 'lumiere_sacree']);
    play(c, 'science_combat');
    play(c, 'frappe_pal');
    expect(energyCost(c, 'lumiere_sacree', false)).toBe(2);
    play(c, 'frappe_pal');
    expect(energyCost(c, 'lumiere_sacree', false)).toBe(0);
  });

  it('Dernier serment soigne une fois sous 20 % des PV', () => {
    const c = fight(['lieutenant'], ['dernier_serment']);
    play(c, 'dernier_serment');
    c.player.hp = 20;
    c.player.block = 0;
    c.enemies[0].intent = { kind: 'attack', dmg: 10 };
    endTurn(c);
    expect(c.oathUsed).toBe(true);
    expect(c.player.hp).toBeGreaterThan(15);
  });

  it('Bouclier divin : aucun dégât subi, mais les Attaques font moitié moins', () => {
    const c = fight(['lieutenant'], ['frappe_pal'], {}, ['jugement', 'bouclier_divin']);
    spell(c, 'bouclier_divin');
    const e = c.enemies[0];
    const hp = e.hp;
    play(c, 'frappe_pal');
    expect(hp - e.hp).toBe(3);
    c.enemies[0].intent = { kind: 'attack', dmg: 30 };
    const php = c.player.hp;
    endTurn(c);
    expect(c.player.hp).toBe(php);
  });

  it('Imposition des mains ne sert que sous 30 % des PV', () => {
    const c = fight(['lieutenant'], [], {}, ['jugement', 'imposition_mains']);
    expect(spell(c, 'imposition_mains')).toBe(false);
    c.player.hp = 20;
    expect(spell(c, 'imposition_mains')).toBe(true);
    expect(c.player.hp).toBe(44);
  });

  it('Repentance contrôle un ennemi normal', () => {
    const c = fight(['lieutenant'], ['repentance']);
    play(c, 'repentance');
    expect(c.enemies[0].stun).toBe(2);
  });

  it('la Malédiction de lignée brise le Sceau et empêche d\'en activer', () => {
    const c = fight(['lieutenant'], ['sceau_droiture', 'sceau_croise']);
    play(c, 'sceau_droiture');
    c.player.debuffs!.lignee = 2;
    c.seals = [];
    play(c, 'sceau_croise');
    expect(c.seals).toEqual([]);
  });
});

describe('l\'Aurore ardente', () => {
  it('le reliquaire passe en premier, Ossyrax purifie la lame, puis on la forge au feu de camp', () => {
    const run = newRun(1, null, [], 0, 'paladin');
    expect(typeof EVENTS.reliquaire.quest === 'function' && EVENTS.reliquaire.quest(run)).toBe(true);
    run.eventId = 'reliquaire';
    run.screen = 'event';
    resolveEvent(run, 2);
    expect(run.aurore).toBe('lame');
    run.encounter = { kind: 'combat', name: 'Ossyrax', enemies: ['ossyrax'], loot: 'ossyrax' };
    run.combat = fight(['ossyrax'], []);
    run.combat.phase = 'victory';
    run.screen = 'combat';
    afterCombatAction(run);
    expect(run.aurore).toBe('purifiee');
    run.act = 2;
    run.screen = 'campfire';
    expect(canForgeAurore(run)).toBe(true);
    campfireAurore(run);
    expect(run.equipment.arme).toBe('aurore_ardente');
    expect(run.aurore).toBe('forged');
  });

  it('les Jugements doublent contre les Morts-vivants et soignent', () => {
    const c = fight(['serviteur_os'], ['sceau_droiture'], { aurore: 1 });
    c.player.hp = 50;
    play(c, 'sceau_droiture');
    const e = c.enemies[0];
    spell(c, 'jugement');
    expect(200 - e.hp).toBe(24);
    expect(c.player.hp).toBe(55);
  });
});
