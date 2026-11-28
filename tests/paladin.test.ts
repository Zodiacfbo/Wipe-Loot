// Le Paladin, refonte « Puissance sacrée » (27 novembre 2026). Référence : docs/classes/PALADIN.md
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CARDS, rewardPool, starterCards } from '../src/engine/cards';
import { canPlayCard, cardBlockReason, cardNeedsTarget, createCombat, endTurn, playCard, useSpell } from '../src/engine/combat';
import type { Encounter } from '../src/engine/enemies';
import { afterCombatAction, campfireAurore, canForgeAurore, newRun, resolveEvent, startAura, starterDeckFor } from '../src/engine/run';
import { EVENTS } from '../src/engine/events';
import { SPELLS, lootSpells } from '../src/engine/spells';
import { PALADIN_TREES, emptyAlloc, talentIds, toggleTalent } from '../src/engine/talents';
import type { ItemEffects } from '../src/engine/items';
import { auraChangeCost, changeAura } from '../src/engine/paladin';
import { OLD_PALADIN_CARDS } from '../src/engine/cards_paladin';
import { loadProfile, migrate } from '../src/engine/save';
import type { AuraId, CardInstance, CombatState } from '../src/engine/types';

const deck = (ids: string[]): CardInstance[] => ids.map((id, i) => ({ uid: 1000 + i, id, upgraded: false }));
function fight(enemies: string[], hand: string[], gear: ItemEffects = {}, spells: string[] = ['jugement'], aura: AuraId = 'devotion', holy = 0): CombatState {
  const enc: Encounter = { kind: 'combat', name: 'Test', enemies };
  const c = createCombat(enc, deck(Array(10).fill('parade_pal')), 80, 80, 7, 1, gear, spells, undefined, 'paladin');
  c.hand = hand.map((id, i) => ({ uid: 5000 + i, id, upgraded: false }));
  c.player.energy = 10;
  c.aura = aura;
  c.holy = holy;
  for (const e of c.enemies) {
    e.hp = e.maxHp = 200;
    e.block = 0;
    e.intent = { kind: 'block', amount: 0 };
  }
  return c;
}
const play = (c: CombatState, id: string, target?: number) => playCard(c, c.hand.findIndex((k) => k.id === id), target);
const spell = (c: CombatState, id: string, target?: number) => useSpell(c, c.spells.findIndex((s) => s.id === id), target);

describe('le Paladin : la run', () => {
  it('80 PV, son paquet de départ et Jugement', () => {
    const run = newRun(1, null, [], 0, 'paladin');
    expect(run.maxHp).toBe(80);
    expect(run.spells).toEqual(['jugement']);
    const count = (id: string) => run.deck.filter((k) => k.id === id).length;
    expect([count('frappe_pal'), count('parade_pal'), count('frappe_croise'), count('parole_lumiere')]).toEqual([4, 3, 2, 1]);
  });

  it('51 cartes en récompense (+ Frappe et Parade), 14 par arbre, plus aucun Sceau', () => {
    expect(rewardPool('paladin')).toHaveLength(51);
    expect(starterCards('paladin')).toEqual(['frappe_pal', 'parade_pal']);
    for (const tree of PALADIN_TREES) expect(tree.cards).toHaveLength(14);
    for (const tree of PALADIN_TREES) for (const id of tree.cards) expect(CARDS[id]?.classId).toBe('paladin');
    for (const old of Object.keys(OLD_PALADIN_CARDS)) expect(CARDS[old]?.classId).not.toBe('paladin');
    // Chaque arbre a 3 Dépenses ; Parole de lumière est celle du tronc commun.
    for (const tree of PALADIN_TREES) expect(tree.cards.filter((id) => CARDS[id].holyCost === 3)).toHaveLength(3);
    expect(CARDS.parole_lumiere.holyCost).toBe(3);
  });

  it('les talents donnent les sorts de barre et la carte épique', () => {
    const alloc = emptyAlloc('paladin');
    for (let tier = 0; tier < 5; tier++) toggleTalent(alloc, 'vindicte', tier, 'A', 10, 'paladin');
    const run = newRun(1, null, talentIds(alloc, 'paladin'), 0, 'paladin');
    expect(run.spells).toContain('ailes_justice');
    expect(run.deck.some((k) => k.id === 'courroux_vengeur')).toBe(true);
    expect(lootSpells('paladin').sort()).toEqual(['benediction_sauvegarde', 'charge_sacree', 'lumiere_aube']);
  });

  it('l\'arbre principal choisit l\'Aura de départ et change une carte du paquet', () => {
    const ids = (tree: string, n: number) => {
      const alloc = emptyAlloc('paladin');
      for (let tier = 0; tier < n; tier++) toggleTalent(alloc, tree, tier, 'A', 10, 'paladin');
      return talentIds(alloc, 'paladin');
    };
    expect(startAura([])).toBe('devotion');
    expect(startAura(ids('vindicte', 2))).toBe('vindicte');
    expect(startAura(ids('protection_pal', 2))).toBe('devotion');
    expect(startAura(ids('sacre_pal', 2))).toBe('concentration');
    expect(starterDeckFor('paladin', ids('vindicte', 1))).toContain('ferveur');
    expect(starterDeckFor('paladin', ids('vindicte', 1)).filter((id) => id === 'parade_pal')).toHaveLength(2);
    expect(starterDeckFor('paladin', ids('protection_pal', 1))).toContain('pavois_sacre');
    expect(starterDeckFor('paladin', ids('sacre_pal', 1))).toContain('horion_sacre');
  });
});

describe('la Puissance sacrée', () => {
  it('Jugement : 5 dégâts et 2 Puissance sacrée, recharge 2', () => {
    const c = fight(['lieutenant'], []);
    const e = c.enemies[0];
    spell(c, 'jugement', e.uid);
    expect(200 - e.hp).toBe(5);
    expect(c.holy).toBe(2);
    expect(c.spells[0].cooldown).toBe(2);
    expect(SPELLS.jugement.cost).toBe(0);
  });

  it('les cartes ✦ en donnent, jusqu\'à 5 au plus', () => {
    const c = fight(['lieutenant'], ['frappe_croise', 'lame_justice', 'pavois_sacre', 'lame_justice'], {}, ['jugement'], 'devotion', 1);
    const e = c.enemies[0];
    play(c, 'frappe_croise', e.uid);
    expect(c.holy).toBe(2);
    play(c, 'lame_justice', e.uid);
    expect(c.holy).toBe(4);
    play(c, 'lame_justice', e.uid);
    expect(c.holy).toBe(5);
  });

  it('une Dépense coûte 3 Puissance sacrée et 0 énergie, et reçoit le bonus de l\'Aura', () => {
    const c = fight(['lieutenant'], ['verdict_templier'], {}, ['jugement'], 'devotion', 2);
    const i = c.hand.findIndex((k) => k.id === 'verdict_templier');
    expect(canPlayCard(c, i)).toBe(false);
    expect(cardBlockReason(c, i)).toContain('Puissance sacrée');
    c.holy = 4;
    const e = c.enemies[0];
    const energy = c.player.energy;
    play(c, 'verdict_templier', e.uid);
    expect(200 - e.hp).toBe(13);
    expect(c.player.block).toBe(4); // Dévotion : +4 blocage
    expect(c.holy).toBe(1);
    expect(c.player.energy).toBe(energy);
  });

  it('la Puissance sacrée reste d\'un tour à l\'autre', () => {
    const c = fight(['lieutenant'], [], {}, ['jugement'], 'devotion', 3);
    endTurn(c);
    expect(c.holy).toBe(3);
  });

  it('Élan sacré : on commence le combat avec 1 Puissance sacrée', () => {
    const enc: Encounter = { kind: 'combat', name: 'Test', enemies: ['lieutenant'] };
    const c = createCombat(enc, deck(Array(10).fill('parade_pal')), 80, 80, 7, 1, { startHoly: 1 }, ['jugement'], undefined, 'paladin');
    expect(c.holy).toBe(1);
  });
});

describe('les Auras', () => {
  it('Parole de lumière : blocage, dégâts ou soin selon l\'Aura (bonus compris)', () => {
    const dev = fight(['lieutenant'], ['parole_lumiere'], {}, ['jugement'], 'devotion', 3);
    play(dev, 'parole_lumiere');
    expect(dev.player.block).toBe(9 + 4);

    const vin = fight(['lieutenant'], ['parole_lumiere'], {}, ['jugement'], 'vindicte', 3);
    expect(cardNeedsTarget(vin, 'parole_lumiere')).toBe(true);
    play(vin, 'parole_lumiere', vin.enemies[0].uid);
    expect(200 - vin.enemies[0].hp).toBe(7 + 3);

    const con = fight(['lieutenant'], ['parole_lumiere'], {}, ['jugement'], 'concentration', 3);
    con.player.hp = 40;
    play(con, 'parole_lumiere');
    expect(con.player.hp).toBe(40 + 6 + 2);
  });

  it('Vindicte : une Dépense de zone donne son bonus à tous, sans cible', () => {
    const c = fight(['lieutenant', 'lieutenant'], ['tempete_divine'], {}, ['jugement'], 'vindicte', 3);
    expect(cardNeedsTarget(c, 'tempete_divine')).toBe(false);
    play(c, 'tempete_divine');
    expect(c.enemies.map((e) => 200 - e.hp)).toEqual([10, 10]);
  });

  it('les contreparties : Vindicte soigne moins, Concentration frappe moins fort (Dépenses d\'Attaque comprises)', () => {
    const vin = fight(['lieutenant'], ['lumiere_sacree'], {}, ['jugement'], 'vindicte');
    vin.player.hp = 40;
    play(vin, 'lumiere_sacree');
    expect(vin.player.hp).toBe(40 + Math.floor(12 * 0.7));
    const con = fight(['lieutenant'], ['frappe_pal'], {}, ['jugement'], 'concentration');
    play(con, 'frappe_pal', con.enemies[0].uid);
    expect(200 - con.enemies[0].hp).toBeLessThan(6);
  });

  it('gain passif : 1 par tour, à la 1re Attaque (Vindicte) ou au 1er soin, même à PV pleins (Concentration)', () => {
    const vin = fight(['lieutenant'], ['frappe_pal', 'frappe_pal'], {}, ['jugement'], 'vindicte');
    play(vin, 'frappe_pal', vin.enemies[0].uid);
    play(vin, 'frappe_pal', vin.enemies[0].uid);
    expect(vin.holy).toBe(1);
    const con = fight(['lieutenant'], ['main_sacree', 'main_sacree'], {}, ['jugement'], 'concentration');
    play(con, 'main_sacree');
    play(con, 'main_sacree');
    expect(con.holy).toBe(1);
  });

  it('Dévotion : +1 quand une attaque ennemie est entièrement bloquée', () => {
    const c = fight(['lieutenant'], ['bouclier_beni']);
    play(c, 'bouclier_beni');
    c.enemies[0].intent = { kind: 'attack', dmg: 5 };
    endTurn(c);
    expect(c.holy).toBe(1);
  });

  it('changer d\'Aura : le 1er changement du tour est gratuit, puis 1 énergie ; la Puissance sacrée est gardée', () => {
    const c = fight(['lieutenant'], [], {}, ['jugement'], 'devotion', 4);
    const energy = c.player.energy;
    expect(auraChangeCost(c)).toBe(0);
    expect(changeAura(c, 'vindicte')).toBe(true);
    expect(c.player.energy).toBe(energy);
    expect(changeAura(c, 'concentration')).toBe(true);
    expect(c.player.energy).toBe(energy - 1);
    expect(changeAura(c, 'concentration')).toBe(false);
    expect(c.holy).toBe(4);
    endTurn(c);
    expect(auraChangeCost(c)).toBe(0);
  });
});

describe('les Dépenses doublées', () => {
  it('Faveur divine double la prochaine Dépense de ce tour', () => {
    const c = fight(['lieutenant'], ['faveur_divine', 'verdict_templier'], {}, ['jugement'], 'devotion', 3);
    play(c, 'faveur_divine');
    play(c, 'verdict_templier', c.enemies[0].uid);
    expect(200 - c.enemies[0].hp).toBe(26);
    expect(c.favor).toBe(false);
  });

  it('Fin de l\'ère : à 5, la Dépense prend tout et double ; Faveur divine attend la suivante', () => {
    const c = fight(['lieutenant'], ['faveur_divine', 'verdict_templier', 'verdict_templier'], { finEre: 1 }, ['jugement'], 'devotion', 5);
    const e = c.enemies[0];
    play(c, 'faveur_divine');
    play(c, 'verdict_templier', e.uid);
    expect(200 - e.hp).toBe(26);
    expect(c.holy).toBe(0);
    expect(c.favor).toBe(true);
    c.holy = 3;
    play(c, 'verdict_templier', e.uid);
    expect(200 - e.hp).toBe(52);
    expect(c.favor).toBe(false);
  });

  it('Faveur divine se perd à la fin du tour', () => {
    const c = fight(['lieutenant'], ['faveur_divine']);
    play(c, 'faveur_divine');
    endTurn(c);
    expect(c.favor).toBe(false);
  });
});

describe('les cartes et talents des arbres', () => {
  it('Courroux vengeur : les cartes ✦ donnent 1 de plus, les Dépenses +4 dégâts', () => {
    const c = fight(['lieutenant'], ['courroux_vengeur', 'frappe_croise', 'verdict_templier'], {}, ['jugement'], 'devotion', 1);
    const e = c.enemies[0];
    play(c, 'courroux_vengeur');
    play(c, 'frappe_croise', e.uid);
    expect(c.holy).toBe(3);
    const hp = e.hp;
    play(c, 'verdict_templier', e.uid);
    expect(hp - e.hp).toBe(17);
  });

  it('Juste châtiment rend les dégâts bloqués ; Rétribution le fait coûter 2', () => {
    const c = fight(['lieutenant'], ['bouclier_beni'], { retributionCost: 1 }, ['jugement'], 'devotion', 1);
    play(c, 'bouclier_beni');
    c.enemies[0].intent = { kind: 'attack', dmg: 10 };
    endTurn(c);
    const blocked = c.blockedSince!;
    expect(blocked).toBeGreaterThan(0);
    expect(c.holy).toBe(2); // Dévotion : l'attaque était entièrement bloquée
    c.hand.push({ uid: 9000, id: 'juste_chatiment', upgraded: false });
    const e = c.enemies[0];
    const hp = e.hp;
    c.player.block = 0;
    play(c, 'juste_chatiment', e.uid);
    expect(hp - e.hp).toBe(blocked);
    expect(c.holy).toBe(0);
  });

  it('Gardien des rois et Ardent défenseur renforcent chaque Dépense', () => {
    const c = fight(['lieutenant'], ['gardien_rois', 'mot_gloire'], { spendRobustesse: 2 }, ['jugement'], 'concentration', 3);
    play(c, 'gardien_rois');
    play(c, 'mot_gloire');
    expect(c.player.block).toBe(6);
    expect(c.player.robustesse).toBe(2);
    endTurn(c);
    expect(c.player.robustesse).toBe(0);
  });

  it('Illumination et Lumière infusée : la 1re Dépense du tour rend 1 énergie et 1 Puissance sacrée', () => {
    const c = fight(['lieutenant'], ['illumination', 'mot_gloire', 'mot_gloire'], { spendRefund: 1 }, ['jugement'], 'devotion', 6 as number);
    c.holy = 5;
    play(c, 'illumination');
    const energy = c.player.energy;
    play(c, 'mot_gloire');
    expect(c.player.energy).toBe(energy + 1);
    expect(c.holy).toBe(3);
    play(c, 'mot_gloire');
    expect(c.player.energy).toBe(energy + 1);
    expect(c.holy).toBe(0);
  });

  it('Zèle : chaque Dépense donne 1 Puissance', () => {
    const c = fight(['lieutenant'], ['zele', 'parole_lumiere'], {}, ['jugement'], 'devotion', 3);
    play(c, 'zele');
    play(c, 'parole_lumiere');
    expect(c.player.puissance).toBe(1);
  });

  it('Égide de lumière : le blocage suit le soin, même à PV pleins', () => {
    const c = fight(['lieutenant'], ['egide_lumiere'], {}, ['jugement'], 'devotion', 3);
    play(c, 'egide_lumiere');
    expect(c.player.block).toBe(7 + 4);
  });

  it('Exorcisme double contre un Démon', () => {
    const c = fight(['molosse', 'lieutenant'], ['exorcisme', 'exorcisme']);
    const [demon, man] = c.enemies;
    play(c, 'exorcisme', demon.uid);
    play(c, 'exorcisme', man.uid);
    expect(200 - demon.hp).toBe(16);
    expect(200 - man.hp).toBe(8);
  });

  it('Résistance sacrée : les Zones de feu font moitié moins mal', () => {
    const c = fight(['lieutenant'], ['resistance_sacree', 'zone_de_feu']);
    play(c, 'resistance_sacree');
    c.player.block = 0;
    const hp = c.player.hp;
    endTurn(c);
    expect(hp - c.player.hp).toBe(3);
  });

  it('Consécration brûle à la fin de ce tour et du suivant', () => {
    const c = fight(['lieutenant'], ['consecration']);
    play(c, 'consecration');
    const e = c.enemies[0];
    endTurn(c);
    expect(200 - e.hp).toBe(5);
    e.intent = { kind: 'block', amount: 0 };
    endTurn(c);
    expect(200 - e.hp).toBe(10);
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
    play(c, 'frappe_pal', e.uid);
    expect(200 - e.hp).toBe(3);
    e.intent = { kind: 'attack', dmg: 30 };
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

  it('la Malédiction de lignée éteint la Puissance sacrée et empêche d\'en gagner', () => {
    const c = fight(['lieutenant'], ['frappe_croise'], {}, ['jugement'], 'devotion', 4);
    c.player.debuffs!.lignee = 2;
    c.holy = 0;
    play(c, 'frappe_croise', c.enemies[0].uid);
    expect(c.holy).toBe(0);
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

  it('les Dépenses doublent contre les Morts-vivants et soignent', () => {
    const c = fight(['serviteur_os'], ['verdict_templier'], { aurore: 1 }, ['jugement'], 'devotion', 3);
    c.player.hp = 50;
    const e = c.enemies[0];
    play(c, 'verdict_templier', e.uid);
    expect(200 - e.hp).toBe(26);
    expect(c.player.hp).toBe(55);
  });
});

describe('la conversion de l\'ancien Paladin', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('une expédition en cours : cartes, talents et combat convertis', () => {
    const run = newRun(1, null, [], 0, 'paladin') as unknown as Record<string, unknown>;
    run.version = 28;
    run.deck = [{ uid: 1, id: 'sceau_droiture', upgraded: true }, { uid: 2, id: 'verdict_cieux', upgraded: false }, { uid: 3, id: 'frappe_pal', upgraded: false }];
    run.talents = ['double_sceau', 'pa_precision'];
    run.combat = {
      ...fight(['lieutenant'], ['aura_devotion']),
      holy: undefined, aura: { id: 'devotion', value: 2 }, seals: ['droiture'], discard: [{ uid: 4, id: 'sceau_rempart', upgraded: false }],
    };
    (run.combat as CombatState).player.robustesse = 2;
    const m = migrate(JSON.parse(JSON.stringify(run)))!;
    expect(m.version).toBe(29);
    expect(m.deck.map((k) => [k.id, k.upgraded])).toEqual([['parole_lumiere', true], ['courroux_vengeur', false], ['frappe_pal', false]]);
    expect(m.talents).toEqual(['fin_ere', 'pa_precision']);
    const c = m.combat!;
    expect(c.holy).toBe(0);
    expect(c.aura).toBe('devotion');
    expect(c.player.robustesse).toBe(0);
    expect(c.hand.map((k) => k.id)).toEqual(['rempart_lumiere']);
    expect(c.discard.map((k) => k.id)).toEqual(['bouclier_vertueux']);
    for (const k of [...m.deck, ...c.hand, ...c.discard]) expect(CARDS[k.id]).toBeDefined();
  });

  it('le profil : les points de talent du Paladin sont rendus, avec un message', () => {
    const store = new Map<string, string>();
    vi.stubGlobal('localStorage', { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => store.set(k, v), removeItem: (k: string) => store.delete(k) });
    const old = { version: 8, discoveredItems: [], guildChest: [], classes: {}, stats: { runs: 0, wins: 0 }, startClass: 'paladin', unlockedClasses: ['paladin'], difficulty: {}, lastDifficulty: 0, seenCards: [], seenEnemies: [], seenPotions: [], kills: {},
      talents: { paladin: { vindicte: ['A', 'B'], sacre_pal: [], protection_pal: [] }, guerrier: { armes: ['A'] } } };
    store.set('wipe-and-loot:/:profil', JSON.stringify(old));
    const p = loadProfile();
    expect(p.version).toBe(9);
    expect(p.talents.paladin).toBeUndefined();
    expect(p.talents.guerrier).toEqual({ armes: ['A'] });
    expect(p.paladinRework).toBe(true);
  });
});
