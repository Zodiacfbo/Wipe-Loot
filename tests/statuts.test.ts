// Bug du 27 novembre 2026 : le Cercle de téléportation retirait aussi « Se mettre à couvert » (Regard sombre d'Yzhar).
// Les sorts qui nettoient la main ne retirent que les cartes-statut gênantes.
import { describe, expect, it } from 'vitest';
import { createCombat } from '../src/engine/combat';
import { SPELLS } from '../src/engine/spells';
import { damageEnemy } from '../src/engine/actions';
import { BOSS_ENCOUNTER } from '../src/engine/enemies';
import type { CardInstance, CombatState } from '../src/engine/types';

function deckOf(ids: string[]): CardInstance[] {
  return ids.map((id, i) => ({ uid: 1000 + i, id, upgraded: false }));
}

function withHand(ids: string[]): CombatState {
  const c = createCombat(BOSS_ENCOUNTER, deckOf(Array(12).fill('frappe')), 80, 80, 3, 1, {}, [], undefined, 'mage');
  c.hand = ids.map((id, i) => ({ uid: 5000 + i, id, upgraded: false }));
  return c;
}

const HAND = ['zone_de_feu', 'a_couvert', 'fardeau', 'fiole_instable', 'frappe'];

describe('Sorts qui retirent les cartes-statut', () => {
  for (const id of ['cercle_teleportation', 'clignement', 'pas_de_cote']) {
    it(`${id} garde « Se mettre à couvert » et les statuts utiles`, () => {
      const c = withHand(HAND);
      SPELLS[id].cast(c, null);
      const left = c.hand.map((k) => k.id).sort();
      expect(left).toEqual(['a_couvert', 'fiole_instable', 'frappe']);
    });
  }
});

// Retour du 27 novembre 2026 : l'Étincelle vivante explose à sa mort.
describe('Explosion de l\'Étincelle vivante', () => {
  const enc = { kind: 'combat' as const, name: 'Test', enemies: ['etincelle', 'etincelle'] };
  const fight = () => createCombat(enc, deckOf(Array(12).fill('frappe')), 80, 80, 3, 1, {}, [], undefined, 'guerrier');

  it('le blocage encaisse l\'explosion, et l\'animation le montre', () => {
    const c = fight();
    c.player.block = 10;
    c.fx = [];
    damageEnemy(c, c.enemies[0], 50);
    expect(c.player.hp).toBe(80);
    expect(c.player.block).toBe(6);
    const tick = c.fx.find((f) => f.kind === 'tick' && f.who === 'player');
    expect(tick).toMatchObject({ amount: 0, blocked: 4 });
  });

  it('le dernier ennemi tué n\'explose plus : le combat est gagné', () => {
    const c = fight();
    damageEnemy(c, c.enemies[0], 50);
    expect(c.player.hp).toBe(76);
    damageEnemy(c, c.enemies[1], 50);
    expect(c.player.hp).toBe(76);
    expect(c.phase).toBe('victory');
  });
});
