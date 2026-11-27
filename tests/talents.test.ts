import { describe, expect, it } from 'vitest';
import { changePosture, createCombat, endTurn, playCard } from '../src/engine/combat';
import type { Encounter } from '../src/engine/enemies';
import { afterCombatAction, barCapacity, chooseNode, newRun, runGear } from '../src/engine/run';
import { reachable } from '../src/engine/map';
import { WARRIOR_LOOT_SPELLS } from '../src/engine/spells';
import { TALENTS, TREES, clampAlloc, emptyAlloc, pointsUsed, talentIds, toggleTalent } from '../src/engine/talents';
import type { CardInstance } from '../src/engine/types';

const deck = (ids: string[]): CardInstance[] => ids.map((id, i) => ({ uid: 1000 + i, id, upgraded: false }));

describe('les arbres de talents', () => {
  it('3 arbres de 5 paliers : 2 choix aux paliers 1 à 4, la carte épique au palier 5', () => {
    expect(TREES.map((t) => t.id)).toEqual(['armes', 'fureur', 'protection']);
    for (const tree of TREES) {
      expect(tree.tiers).toHaveLength(5);
      tree.tiers.slice(0, 4).forEach((tier) => expect(tier).toHaveLength(2));
      expect(tree.tiers[4][0].card).toBeTruthy();
    }
  });

  it('il faut le palier précédent, et pas plus de points que le niveau', () => {
    const a = emptyAlloc();
    expect(toggleTalent(a, 'armes', 1, 'A', 10)).toBe(false); // palier 2 sans le 1
    expect(toggleTalent(a, 'armes', 0, 'A', 2)).toBe(true);
    expect(toggleTalent(a, 'armes', 1, 'B', 2)).toBe(true);
    expect(toggleTalent(a, 'fureur', 0, 'A', 2)).toBe(false); // plus de points
    expect(pointsUsed(a)).toBe(2);
  });

  it('changer de choix, retirer le dernier palier, ramener aux points disponibles', () => {
    const a = emptyAlloc();
    toggleTalent(a, 'protection', 0, 'A', 10);
    toggleTalent(a, 'protection', 1, 'A', 10);
    expect(toggleTalent(a, 'protection', 0, 'B', 10)).toBe(true); // change de choix
    expect(a.protection).toEqual(['B', 'A']);
    expect(toggleTalent(a, 'protection', 0, 'B', 10)).toBe(false); // pas le dernier palier
    expect(toggleTalent(a, 'protection', 1, 'A', 10)).toBe(true); // retire le dernier
    expect(a.protection).toEqual(['B']);
    a.armes = ['A', 'A', 'A'];
    expect(pointsUsed(clampAlloc(a, 2))).toBe(2);
  });

  it('le palier 5 coûte 3 points : un seul arbre complet avec 10 points', () => {
    const a = emptyAlloc();
    for (let tier = 0; tier < 4; tier++) toggleTalent(a, 'armes', tier, 'A', 10);
    expect(toggleTalent(a, 'armes', 4, 'A', 6)).toBe(false); // 4 + 3 > 6
    expect(toggleTalent(a, 'armes', 4, 'A', 7)).toBe(true);
    expect(pointsUsed(a)).toBe(7);
    for (let tier = 0; tier < 3; tier++) expect(toggleTalent(a, 'fureur', tier, 'A', 10)).toBe(true);
    expect(pointsUsed(a)).toBe(10);
    expect(toggleTalent(a, 'fureur', 3, 'A', 10)).toBe(false); // plus de points
    // Retirer la carte épique rend 3 points.
    expect(toggleTalent(a, 'armes', 4, 'A', 10)).toBe(true);
    expect(pointsUsed(a)).toBe(7);
  });

  it('une ancienne sauvegarde 5 + 5 devient 7 + 3 (le premier arbre garde sa carte épique)', () => {
    const old = { ...emptyAlloc(), armes: ['A', 'B', 'A', 'B', 'A'], fureur: ['A', 'A', 'A', 'A', 'A'] } as ReturnType<typeof emptyAlloc>;
    const a = clampAlloc(old, 10);
    expect(a.armes).toEqual(['A', 'B', 'A', 'B', 'A']);
    expect(a.fureur).toEqual(['A', 'A', 'A']);
    expect(pointsUsed(a)).toBe(10);
    // Niveau 5 avec un arbre complet : la carte épique part, les paliers 1 à 4 restent.
    expect(clampAlloc({ ...emptyAlloc(), protection: ['A', 'A', 'A', 'A', 'A'] }, 5).protection).toEqual(['A', 'A', 'A', 'A']);
  });
});

describe('les talents dans la run', () => {
  it('PV max, sorts de barre, carte épique, et la barre s\'agrandit au besoin', () => {
    const a = emptyAlloc();
    a.protection = ['A', 'A', 'A', 'A', 'A']; // Bouclier lourd, Garde haute, Rempart, Dernier rempart, Heurt de bouclier
    a.fureur = ['B', 'A', 'B', 'A']; // Robuste, Plaies profondes, Régénération enragée, Témérité
    const run = newRun(3, null, talentIds(a));
    expect(run.maxHp).toBe(90);
    expect(run.spells).toEqual(['charge', 'regeneration_enragee', 'temerite', 'rempart', 'dernier_rempart']);
    expect(barCapacity(run)).toBe(5);
    expect(run.deck.some((c) => c.id === 'heurt_de_bouclier')).toBe(true);
    expect(runGear(run).startBlock).toBe(5);
  });

  it('les sorts de talent ne tombent plus sur les boss ; les épiques seulement si débloquées', () => {
    expect(WARRIOR_LOOT_SPELLS.sort()).toEqual(['cri_commandement', 'rage_berserker', 'vague_de_choc']);
    let epics = 0;
    for (let seed = 1; seed < 80; seed++) {
      const run = newRun(seed);
      const node = run.map.nodes.find((n) => n.type === 'elite');
      if (!node) continue;
      run.position = run.map.nodes.find((n) => n.next.includes(node.id))!.id;
      chooseNode(run, node.id);
      run.combat!.phase = 'victory';
      afterCombatAction(run);
      epics += run.rewardChoices.filter((id) => ['frappe_mortelle', 'sanguinaire', 'heurt_de_bouclier'].includes(id)).length;
    }
    expect(epics).toBe(0);
  });

  it('les récompenses penchent vers l\'arbre investi', () => {
    const a = emptyAlloc();
    a.protection = ['A', 'A', 'A', 'A'];
    const prot = TREES[2].cards;
    let withTalents = 0;
    let without = 0;
    for (let seed = 1; seed <= 60; seed++) {
      for (const [ids, add] of [[talentIds(a), (n: number) => (withTalents += n)], [[], (n: number) => (without += n)]] as const) {
        const run = newRun(seed, null, ids as string[]);
        chooseNode(run, reachable(run.map, null)[0].id);
        run.combat!.phase = 'victory';
        afterCombatAction(run);
        add(run.rewardChoices.filter((id) => prot.includes(id)).length);
      }
    }
    expect(withTalents).toBeGreaterThan(without);
  });
});

describe('les effets des talents en combat', () => {
  const fight = (fx: object, cards: string[], enemies = ['seigneur']) =>
    createCombat({ kind: 'combat', name: 'T', enemies } as Encounter, deck(cards), 80, 80, 3, 1, fx);

  it('Lame aiguisée, Main gauche, Arme lourde', () => {
    const c = fight({ strikeBonus: 2, zeroCostBonus: 2, heavyAttackBonus: 4 }, ['frappe', 'taillade', 'frappe_ecrasante', 'parade', 'parade']);
    const e = c.enemies[0];
    const hit = (id: string) => { const hp = e.hp; c.player.energy = 9; playCard(c, c.hand.findIndex((k) => k.id === id)); return hp - e.hp; };
    expect(hit('frappe')).toBe(8);
    expect(hit('taillade')).toBe(5);
    expect(hit('frappe_ecrasante')).toBe(20);
  });

  it('changer de posture garde la rage ; Colère intérieure ; rage maximale 15', () => {
    const c = fight({ turnRage: 1, maxRage: 15 }, Array(10).fill('parade'));
    expect(c.player.maxRage).toBe(15);
    c.player.rage = 12;
    changePosture(c, 'defensive');
    expect(c.player.rage).toBe(12);
    c.player.block = 999;
    endTurn(c);
    expect(c.player.rage).toBeGreaterThanOrEqual(7);
  });

  it('Implacable : tuer un ennemi rend 2 rage et pioche 1 carte', () => {
    const c = fight({ killRage: 2, killDraw: 1 }, Array(10).fill('frappe'), ['etincelle', 'lieutenant']);
    c.enemies[0].hp = 1;
    const hand = c.hand.length;
    playCard(c, 0, c.enemies[0].uid);
    expect(c.player.rage).toBe(1 + 2);
    expect(c.hand.length).toBe(hand - 1 + 1);
  });

  it('chaque talent est défini une seule fois', () => {
    expect(Object.keys(TALENTS)).toHaveLength(243); // 27 par classe jouable
  });
});
