// Le Guerrier revu le 27 novembre 2026 (fiche §12) : la pleine rage, les postures, les arbres.
import { describe, expect, it } from 'vitest';
import { changePosture, createCombat, FULL_RAGE, fullRageReady, playCard, useSpell } from '../src/engine/combat';
import type { Encounter } from '../src/engine/enemies';
import { allowedSlots, newRun, startEncounter, startPosture, starterDeckFor } from '../src/engine/run';
import { emptyAlloc, talentIds, type TalentAlloc } from '../src/engine/talents';
import type { CardInstance, CombatState } from '../src/engine/types';

const deck = (ids: string[]): CardInstance[] => ids.map((id, i) => ({ uid: 1000 + i, id, upgraded: false }));
function fight(hand: string[], enemies = ['lieutenant'], gear: object = {}, spells: string[] = ['charge']): CombatState {
  const c = createCombat({ kind: 'combat', name: 'Test', enemies } as Encounter, deck(Array(10).fill('parade')), 80, 80, 7, 1, gear, spells);
  c.hand = hand.map((id, i) => ({ uid: 5000 + i, id, upgraded: false }));
  c.player.energy = 10;
  for (const e of c.enemies) e.block = 0;
  return c;
}
const play = (c: CombatState, id: string, target?: number) => playCard(c, c.hand.findIndex((k) => k.id === id), target ?? c.enemies[0].uid);
const alloc = (a: Partial<TalentAlloc>) => talentIds({ ...emptyAlloc('guerrier'), ...a } as TalentAlloc, 'guerrier');

describe('la pleine rage', () => {
  it('Combat : à rage maximale, la prochaine Attaque fait +10 dégâts et vide la rage', () => {
    const c = fight(['frappe', 'frappe']);
    const e = c.enemies[0];
    c.player.rage = 10;
    expect(fullRageReady(c)).toBe(true);
    play(c, 'frappe');
    expect(e.maxHp - e.hp).toBe(6 + 10);
    expect(c.player.rage).toBe(0);
    // Sous le maximum : rien de plus.
    const hp = e.hp;
    play(c, 'frappe');
    expect(hp - e.hp).toBe(6);
    expect(c.player.rage).toBe(1);
  });

  it('Berserker : le coup (+5) frappe aussi tous les autres ennemis', () => {
    const c = fight(['frappe'], ['etincelle', 'lieutenant', 'lieutenant']);
    c.player.posture = 'berserker';
    c.player.rage = 10;
    const [a, b, d] = c.enemies;
    play(c, 'frappe', b.uid);
    expect(b.maxHp - b.hp).toBe(11);
    expect(a.maxHp - a.hp).toBe(Math.min(a.maxHp, 11));
    expect(d.maxHp - d.hp).toBe(11);
    expect(c.player.rage).toBe(0);
  });

  it('Défensive : le coup donne 12 blocage', () => {
    const c = fight(['frappe']);
    c.player.posture = 'defensive';
    c.player.rage = 10;
    play(c, 'frappe');
    expect(c.player.block).toBe(FULL_RAGE.block);
    expect(c.player.rage).toBe(0);
  });

  it('Exécution à pleine rage reçoit aussi le bonus', () => {
    const c = fight(['execution']);
    const e = c.enemies[0];
    c.player.rage = 10;
    play(c, 'execution');
    expect(e.maxHp - e.hp).toBe(Math.min(e.maxHp, 10 * 4 + 3 + 10)); // 4 par point, +3 posture de Combat, +10 pleine rage
  });

  it('une carte à rage paie son coût, puis la pleine rage vide le reste', () => {
    const c = fight(['frappe_heroique']);
    const e = c.enemies[0];
    c.player.rage = 10;
    play(c, 'frappe_heroique');
    expect(e.maxHp - e.hp).toBe(14 + 3 + 10);
    expect(c.player.rage).toBe(0);
  });

  it('une Attaque qui ne blesse pas (Pourfendre) ne libère rien', () => {
    const c = fight(['pourfendre']);
    c.player.rage = 10;
    play(c, 'pourfendre');
    expect(c.player.rage).toBe(10);
    expect(c.fullRage).toBeUndefined();
  });

  it('avec une rage maximale de 15, la pleine rage arrive à 15', () => {
    const c = fight(['frappe']);
    c.player.maxRage = 15;
    c.player.rage = 10;
    expect(fullRageReady(c)).toBe(false);
  });
});

describe('les postures et le départ', () => {
  it('changer de posture ne fait plus perdre de rage', () => {
    const c = fight([]);
    c.player.rage = 9;
    expect(changePosture(c, 'berserker')).toBe(true);
    expect(c.player.rage).toBe(9);
  });

  it('la posture de départ suit l\'arbre principal', () => {
    expect(startPosture([])).toBe('combat');
    expect(startPosture(alloc({ armes: ['A', 'A'] }))).toBe('combat');
    expect(startPosture(alloc({ fureur: ['A', 'A'] }))).toBe('berserker');
    expect(startPosture(alloc({ protection: ['A', 'A'], fureur: ['A'] }))).toBe('defensive');
    const run = newRun(5, null, alloc({ protection: ['A', 'A'] }));
    startEncounter(run, { kind: 'combat', name: 'T', enemies: ['lieutenant'] } as Encounter);
    expect(run.combat!.player.posture).toBe('defensive');
  });

  it('le paquet de départ : 2 Frappes héroïques, et il suit l\'arbre principal', () => {
    const count = (d: string[], id: string) => d.filter((x) => x === id).length;
    const base = starterDeckFor('guerrier', []);
    expect(base).toHaveLength(10);
    expect(count(base, 'frappe_heroique')).toBe(2);
    expect(count(base, 'frappe')).toBe(3);
    const fureur = starterDeckFor('guerrier', alloc({ fureur: ['A'] }));
    expect(count(fureur, 'coup_de_folie')).toBe(2);
    expect(count(fureur, 'frappe')).toBe(1);
    const prot = starterDeckFor('guerrier', alloc({ protection: ['A'] }));
    expect(count(prot, 'levee_de_bouclier')).toBe(2);
    expect(count(prot, 'parade')).toBe(2);
  });
});

describe('les nouveautés des arbres', () => {
  it('Deux armes : une arme de mêlée peut aller dans le 2e bijou', () => {
    const sans = newRun(5, null, []);
    expect(allowedSlots(sans, 'hache_de_guerre')).toEqual(['arme']);
    const avec = newRun(5, null, alloc({ fureur: ['A', 'A', 'A'] }));
    expect(allowedSlots(avec, 'hache_de_guerre')).toEqual(['arme', 'bijou2']);
    expect(allowedSlots(avec, 'talisman_rage')).toEqual(['bijou1', 'bijou2']);
  });

  it('Soif de sang : frapper un ennemi qui Saigne soigne 1 PV', () => {
    const c = fight(['frappe'], ['lieutenant'], { bleedLeech: 1 });
    c.player.hp = 50;
    c.enemies[0].buffs.saignement = 3;
    c.enemies[0].buffs.saignementTours = 3;
    play(c, 'frappe');
    expect(c.player.hp).toBe(51);
  });

  it('Brise-armure et Entaille : l\'Armure fracassée dure plus, et suit les Attaques lourdes', () => {
    const c = fight(['fracasser_armure', 'frappe_ecrasante'], ['lieutenant'], { fractureDuration: 1, heavyFracture: 1 });
    const e = c.enemies[0];
    play(c, 'fracasser_armure');
    expect(e.buffs.armureFracassee).toBe(3);
    play(c, 'frappe_ecrasante');
    expect(e.buffs.armureFracassee).toBe(3 + 2);
  });

  it('Brise-guerre : tous les ennemis, Armure fracassée', () => {
    const c = fight(['brise_guerre'], ['lieutenant', 'lieutenant']);
    c.player.rage = 3;
    play(c, 'brise_guerre');
    for (const e of c.enemies) {
      expect(e.maxHp - e.hp).toBe(12 + 3); // +3 : posture de Combat
      expect(e.buffs.armureFracassee).toBe(2);
    }
    expect(c.player.rage).toBe(1);
  });

  it('Régénération enragée : toute la rage soigne 2 PV par point, une fois', () => {
    const c = fight([], ['lieutenant'], {}, ['regeneration_enragee']);
    c.player.hp = 40;
    c.player.rage = 6;
    expect(useSpell(c, 0)).toBe(true);
    expect(c.player.hp).toBe(52);
    expect(c.player.rage).toBe(0);
    c.player.rage = 6;
    expect(useSpell(c, 0)).toBe(false);
  });

  it('Sanguinaire soigne 5 PV', () => {
    const c = fight(['sanguinaire']);
    c.player.hp = 40;
    c.player.rage = 3;
    play(c, 'sanguinaire');
    expect(c.player.hp).toBe(45);
  });
});
