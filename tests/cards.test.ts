import { describe, expect, it } from 'vitest';
import { CARDS, REWARD_POOL } from '../src/engine/cards';
import { createCombat, endTurn, playCard } from '../src/engine/combat';
import type { Encounter } from '../src/engine/enemies';
import type { CardInstance, CombatState } from '../src/engine/types';

const deck = (ids: string[]): CardInstance[] => ids.map((id, i) => ({ uid: 1000 + i, id, upgraded: false }));
function fight(enemies: string[], hand: string[], fill = 'parade'): CombatState {
  const enc: Encounter = { kind: 'combat', name: 'Test', enemies };
  const c = createCombat(enc, deck(Array(10).fill(fill)), 80, 80, 7, 1);
  // On remplace la main par les cartes voulues.
  c.hand = hand.map((id, i) => ({ uid: 5000 + i, id, upgraded: false }));
  c.player.energy = 10;
  return c;
}
const play = (c: CombatState, id: string, target?: number) => playCard(c, c.hand.findIndex((k) => k.id === id), target);

describe('les 52 cartes du Guerrier', () => {
  it('toutes les cartes de la fiche existent (52 + le deck de départ)', () => {
    const classCards = Object.values(CARDS).filter((d) => ['commune', 'peu_commune', 'rare', 'epique'].includes(d.rarity));
    expect(classCards).toHaveLength(52);
    expect(REWARD_POOL).toHaveLength(52);
  });

  it('Coup de grâce : un ennemi achevé rend 1 énergie et 3 rage', () => {
    const c = fight(['lieutenant'], ['coup_de_grace']);
    c.enemies[0].hp = 5;
    const energy = c.player.energy;
    play(c, 'coup_de_grace');
    expect(c.player.energy).toBe(energy - 1 + 1);
    expect(c.player.rage).toBe(1 + 3);
  });

  it('Balayage : les 2 prochaines Attaques touchent aussi un 2e ennemi', () => {
    const c = fight(['lieutenant', 'lieutenant'], ['balayage', 'frappe', 'frappe', 'frappe']);
    const [a, b] = c.enemies;
    play(c, 'balayage');
    play(c, 'frappe', a.uid);
    play(c, 'frappe', a.uid);
    play(c, 'frappe', a.uid);
    expect(a.hp).toBe(30 - 18);
    expect(b.hp).toBe(30 - 12);
  });

  it('Cri d\'intimidation : un ennemi apeuré ne fait rien', () => {
    const c = fight(['lieutenant'], ['cri_intimidation']);
    play(c, 'cri_intimidation', c.enemies[0].uid);
    const hp = c.player.hp;
    c.player.block = 0;
    endTurn(c);
    expect(c.player.hp).toBe(hp);
  });

  it('Frappe du colosse retire le blocage ; Frappe mortelle empêche les soins', () => {
    const c = fight(['lieutenant', 'brannoc'], ['frappe_du_colosse', 'frappe_mortelle']);
    const [l] = c.enemies;
    l.block = 20;
    play(c, 'frappe_du_colosse', l.uid);
    expect(l.hp).toBe(20);
    expect(l.buffs.armureFracassee).toBe(2);
    c.player.rage = 3;
    play(c, 'frappe_mortelle', l.uid);
    expect(l.dead || l.noHeal).toBe(true);
  });

  it('Frappe frénétique grandit avec les Attaques du tour ; Rafale pioche à la 3e', () => {
    const c = fight(['seigneur'], ['rafale', 'frappe', 'frappe', 'frappe_frenetique']);
    play(c, 'rafale');
    const e = c.enemies[0];
    play(c, 'frappe');
    play(c, 'frappe');
    const size = c.hand.length;
    const hp = e.hp;
    play(c, 'frappe_frenetique');
    expect(hp - e.hp).toBe(5 + 2 * 2);
    expect(c.hand.length).toBe(size - 1 + 1);
  });

  it('Enragé : perdre des PV renforce la prochaine Attaque', () => {
    const c = fight(['seigneur'], ['enrage', 'rage_sanglante', 'frappe']);
    play(c, 'enrage');
    play(c, 'rage_sanglante');
    const e = c.enemies[0];
    const hp = e.hp;
    play(c, 'frappe');
    expect(hp - e.hp).toBe(9);
    expect(c.player.enrageReady).toBe(0);
  });

  it('Ambidextrie : une Frappe de la main gauche chaque tour, qui disparaît si on la garde', () => {
    const c = fight(['lieutenant'], ['ambidextrie']);
    play(c, 'ambidextrie');
    c.player.block = 999;
    endTurn(c);
    expect(c.hand.some((k) => k.id === 'main_gauche')).toBe(true);
    c.player.block = 999;
    endTurn(c);
    expect(c.exhaust.filter((k) => k.id === 'main_gauche')).toHaveLength(1);
  });

  it('Furie inextinguible et Furie croissante', () => {
    const c = fight(['lieutenant'], ['furie_inextinguible', 'furie_croissante', 'rage_sanglante', 'rage_sanglante', 'rage_sanglante', 'rage_sanglante']);
    play(c, 'furie_inextinguible');
    play(c, 'furie_croissante');
    expect(c.player.maxRage).toBe(15);
    for (let i = 0; i < 4; i++) play(c, 'rage_sanglante');
    expect(c.player.rage).toBe(15);
    expect(c.player.puissance).toBe(1);
  });

  it('Fureur suicidaire : +50 % aux Attaques pendant 3 tours, puis s\'arrête', () => {
    const c = fight(['seigneur'], ['fureur_suicidaire', 'frappe']);
    play(c, 'fureur_suicidaire');
    const e = c.enemies[0];
    const hp = e.hp;
    play(c, 'frappe');
    expect(hp - e.hp).toBe(9);
    for (let i = 0; i < 3; i++) { c.player.block = 999; endTurn(c); }
    expect(c.player.fureur).toBe(0);
  });

  it('Résolution, Provocation, Désarmement', () => {
    const c = fight(['seigneur', 'lieutenant'], ['resolution', 'provocation', 'desarmement']);
    c.player.rage = 6;
    play(c, 'resolution');
    expect(c.player.rage).toBe(3);
    expect(c.player.block).toBe(9);
    const [s, l] = c.enemies;
    play(c, 'provocation', s.uid);
    expect(s.intent).toEqual({ kind: 'attack', dmg: 7 });
    play(c, 'desarmement', l.uid);
    c.player.block = 0;
    const hp = c.player.hp;
    endTurn(c);
    expect(hp - c.player.hp).toBe(7); // seul le Seigneur frappe
  });

  it('Garde de fer, Ténacité et Bastion', () => {
    const c = fight(['lieutenant', 'lieutenant'], ['garde_de_fer', 'tenacite', 'bastion', 'parade']);
    play(c, 'garde_de_fer');
    play(c, 'tenacite');
    play(c, 'bastion');
    play(c, 'parade');
    expect(c.enemies.every((e) => e.hp === 27)).toBe(true);
    c.player.block = 40;
    c.enemies.forEach((e) => { e.intent = { kind: 'block', amount: 0 }; });
    endTurn(c);
    expect(c.player.block).toBe(20 + 3);
  });

  it('Parade ripostée et Riposte au bouclier', () => {
    const c = fight(['lieutenant'], ['riposte_bouclier', 'parade_ripostee']);
    play(c, 'riposte_bouclier');
    play(c, 'parade_ripostee');
    c.player.block = 50;
    const l = c.enemies[0];
    endTurn(c);
    expect(l.hp).toBe(30 - 6 - 5);
  });

  it('Heurt de bouclier frappe aussi fort que ton blocage', () => {
    const c = fight(['seigneur'], ['heurt_de_bouclier']);
    c.player.block = 17;
    c.player.rage = 2;
    const e = c.enemies[0];
    play(c, 'heurt_de_bouclier');
    expect(e.hp).toBe(40 - 17 - 3);
  });
});

describe('les illustrations', () => {
  it('chaque carte a son illustration', () => {
    const files = Object.keys(import.meta.glob('../public/assets/carte_*.png'));
    const missing = Object.keys(CARDS).filter((id) => !files.includes(`../public/assets/carte_${id}.png`));
    expect(missing).toEqual([]);
  });
});
