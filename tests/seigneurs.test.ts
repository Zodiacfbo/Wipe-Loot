// Règle des seigneurs (26 novembre 2026) : la même pour toutes les classes.
// - Vulkhar plonge dans la lave : tes effets sur lui restent, figés (ni dégâts, ni baisse) jusqu'à son retour.
// - L'Œil d'Yzhar se ferme : tout ce que tu avais posé sur lui disparaît.
import { describe, expect, it } from 'vitest';
import { createCombat, endTurn } from '../src/engine/combat';
import { damageEnemy } from '../src/engine/actions';
import { BOSS_ENCOUNTER, type Encounter } from '../src/engine/enemies';
import { BOSS_ENCOUNTER_3 } from '../src/engine/enemies_acte3';
import type { CardInstance, CombatState, EnemyState } from '../src/engine/types';

const CLASSES = ['guerrier', 'mage', 'demoniste', 'pretre', 'voleur', 'paladin', 'chasseur', 'druide', 'chaman'];

function deckOf(ids: string[]): CardInstance[] {
  return ids.map((id, i) => ({ uid: 1000 + i, id, upgraded: false }));
}

function fight(enc: Encounter, classId: string): CombatState {
  return createCombat(enc, deckOf(Array(12).fill('frappe')), 500, 500, 5, 1, {}, [], undefined, classId);
}

/** Pose sur l'ennemi un effet de chaque classe. */
function poseEffects(c: CombatState, e: EnemyState): void {
  Object.assign(e.buffs, { demoralise: 2, ralenti: 2, armureFracassee: 2, saignement: 4, saignementTours: 3, brulure: 5, gel: 3, poison: 4, censure: 3 });
  e.dots = [{ id: 'corruption', dmg: 3, turns: 4 }];
  e.curses = ['faiblesse'];
  e.gele = 'half';
  c.mark = { uid: e.uid, value: 4 };
}

describe('Vulkhar plonge : tes effets restent, figés', () => {
  for (const classId of CLASSES) {
    it(classId, () => {
      const c = fight(BOSS_ENCOUNTER, classId);
      const v = c.enemies.find((e) => e.defId === 'vulkhar')!;
      poseEffects(c, v);
      const buffs = { ...v.buffs };
      v.hp = Math.ceil(v.maxHp / 2) + 1;
      damageEnemy(c, v, 5);
      expect(v.submerged).toBe(2);
      // Les Rejetons meurent : Vulkhar ne se soigne pas en remontant.
      for (const r of c.enemies.filter((e) => e.defId === 'rejeton')) r.dead = true;
      const hp = v.hp;
      endTurn(c);
      // Sous la lave : rien ne frappe, rien ne diminue.
      expect(v.submerged).toBe(1);
      expect(v.hp).toBe(hp);
      expect(v.buffs).toEqual(buffs);
      expect(v.dots?.[0]?.turns).toBe(4);
      expect(v.gele).toBe('half');
      expect(c.mark?.uid).toBe(v.uid);
      endTurn(c);
      // Il remonte avec tout ce que tu avais posé.
      expect(v.submerged).toBe(0);
      expect(v.phase).toBe(2);
      expect(v.dots?.length).toBe(1);
      expect(v.curses).toEqual(['faiblesse']);
    });
  }
});

describe('L\'Œil d\'Yzhar se ferme : tes effets sur lui disparaissent', () => {
  for (const classId of CLASSES) {
    it(classId, () => {
      const c = fight(BOSS_ENCOUNTER_3, classId);
      const y = c.enemies.find((e) => e.defId === 'yzhar')!;
      poseEffects(c, y);
      damageEnemy(c, y, 1000);
      expect(y.phase).toBe(2);
      const { puissance, ...rest } = y.buffs;
      expect(Object.values(rest).every((n) => !n)).toBe(true);
      expect(puissance).toBe(0);
      expect(y.dots).toEqual([]);
      expect(y.curses).toEqual([]);
      expect(y.gele).toBeUndefined();
      expect(c.mark).toBeNull();
    });
  }
});
