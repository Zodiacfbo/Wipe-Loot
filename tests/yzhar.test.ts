import { describe, expect, it } from 'vitest';
import { canPlayCard, canUseSpell, createCombat, endTurn, playCard } from '../src/engine/combat';
import { BOSS_ENCOUNTER_3, YZHAR } from '../src/engine/enemies_acte3';
import { damageEnemy } from '../src/engine/actions';
import type { CardInstance, CombatState, EnemyState } from '../src/engine/types';

function deckOf(ids: string[]): CardInstance[] {
  return ids.map((id, i) => ({ uid: 1000 + i, id, upgraded: false }));
}

function fight(classId = 'guerrier', hp = 300): CombatState {
  return createCombat(BOSS_ENCOUNTER_3, deckOf(Array(12).fill('frappe')), hp, hp, 5, 1, {}, ['charge'], undefined, classId);
}

const yzhar = (c: CombatState): EnemyState => c.enemies.find((e) => e.defId === 'yzhar')!;
const count = (c: CombatState, id: string) => c.enemies.filter((e) => e.defId === id && !e.dead).length;

describe('Yzhar, le Dieu dormant', () => {
  it('commence par l\'Œil (200 PV), enrage au tour 18, et donne 1 Folie à chacun de ses tours', () => {
    const c = fight();
    expect(yzhar(c).maxHp).toBe(200);
    expect(c.enrageTurn).toBe(18);
    endTurn(c);
    expect(c.folie).toBe(1);
  });

  it('l\'Œil appelle des Tentacules oculaires tous les 2 tours', () => {
    const c = fight();
    endTurn(c); // tour 1
    expect(count(c, 'tentacule')).toBe(0);
    endTurn(c); // tour 2
    expect(count(c, 'tentacule')).toBe(YZHAR.eyeTentacles);
  });

  it('Regard sombre : 12 dégâts à la fin du tour, sauf si on se met à couvert', () => {
    const c = fight();
    endTurn(c);
    endTurn(c);
    endTurn(c); // le Regard sombre est lancé au 3e tour d'Yzhar
    expect(c.regard).toBe(3);
    const i = c.hand.findIndex((card) => card.id === 'a_couvert');
    expect(i).toBeGreaterThanOrEqual(0);
    // On se met à couvert : pas de dégâts du Regard.
    c.player.block = 0;
    const before = c.player.hp;
    c.player.energy = 5;
    expect(canPlayCard(c, i)).toBe(true);
    playCard(c, i);
    c.enemies.forEach((e) => { if (e.defId !== 'yzhar') e.dead = true; });
    yzhar(c).intent = { kind: 'idle', label: 'Attend' };
    endTurn(c);
    expect(c.player.hp).toBe(before);
    expect(c.regard).toBe(2);
    // Sans se couvrir : 12 dégâts.
    const hp2 = c.player.hp;
    c.player.block = 0;
    yzhar(c).intent = { kind: 'idle', label: 'Attend' };
    endTurn(c);
    expect(hp2 - c.player.hp).toBeGreaterThanOrEqual(YZHAR.regardDmg);
  });

  it('quand l\'Œil se ferme, ses Tentacules aussi, et le Corps se réveille avec sa Carapace divine', () => {
    const c = fight();
    const y = yzhar(c);
    endTurn(c);
    endTurn(c);
    expect(count(c, 'tentacule')).toBeGreaterThan(0);
    damageEnemy(c, y, 250);
    expect(count(c, 'tentacule')).toBe(0);
    expect(y.dead).toBeFalsy();
    expect(y.phase).toBe(2);
    expect(y.maxHp).toBe(YZHAR.bodyHp);
    expect(c.phase).toBe('player');
    y.block = 0;
    const hp = y.hp;
    damageEnemy(c, y, 40);
    expect(hp - y.hp).toBe(Math.floor(40 * YZHAR.carapace));
  });

  it('Avaler : 2 tours dans les entrailles, et la Carapace tombe si les Tentacules intérieurs meurent', () => {
    const c = fight();
    const y = yzhar(c);
    damageEnemy(c, y, 200);
    y.step = 3;
    y.intent = { kind: 'curse', label: 'Avaler', cast: 'Avaler', swallow: true, uninterruptible: true };
    endTurn(c);
    expect(c.swallowed).toBe(2);
    expect(y.submerged).toBeTruthy();
    expect(c.hand.length).toBeLessThanOrEqual(YZHAR.swallowHand + 1);
    expect(canUseSpell(c, 0)).toBe(false);
    const inner = c.enemies.filter((e) => e.defId === 'tentacule_interieur');
    expect(inner).toHaveLength(2);
    for (const t of inner) damageEnemy(c, t, 99);
    expect(c.phase).toBe('player');
    endTurn(c);
    expect(c.swallowed).toBe(1);
    endTurn(c);
    expect(c.swallowed).toBe(0);
    expect(y.submerged).toBeFalsy();
    expect(c.carapaceDown).toBe(YZHAR.carapaceDownTurns);
    const hp = y.hp;
    damageEnemy(c, y, 10);
    expect(hp - y.hp).toBe(20); // double dégâts
  });

  it('le Rayon oculaire étourdit le familier du Démoniste', () => {
    const c = fight('demoniste');
    expect(c.pet).toBeTruthy();
    endTurn(c);
    expect(c.petStunned).toBe(1);
  });

  it('étourdi, le familier du Démoniste obéit encore aux Ordres mais saute son action de fin de tour', () => {
    const c = fight('demoniste');
    endTurn(c); // Rayon oculaire
    const y = yzhar(c);
    c.hand.push({ uid: 9001, id: 'ordre_assaut', upgraded: false });
    c.player.energy = 5;
    const before = y.hp + y.block;
    playCard(c, c.hand.length - 1, y.uid);
    expect(c.petStunned).toBe(1); // l'Ordre ne consomme pas l'étourdissement
    expect(y.hp + y.block).toBeLessThan(before);
    endTurn(c); // fin de tour sautée, puis nouveau Rayon
    expect(c.log.some((l) => l.includes('étourdi : il ne fait rien à la fin du tour'))).toBe(true);
  });

  it('étourdi, le compagnon du Chasseur obéit encore aux Ordres mais saute son action de fin de tour', () => {
    const c = createCombat(BOSS_ENCOUNTER_3, deckOf(Array(12).fill('repli')), 300, 300, 5, 1, {}, ['tir_arcanique'], undefined, 'chasseur', undefined, 'loup');
    endTurn(c); // Rayon oculaire
    expect(c.petStunned).toBe(1);
    const y = yzhar(c);
    c.hand.push({ uid: 9002, id: 'ordre_attaque', upgraded: false });
    const before = y.hp;
    playCard(c, c.hand.length - 1, y.uid);
    expect(y.hp).toBeLessThan(before); // l'Ordre : Attaque marche
    y.buffs.saignement = 0; // le Saignement du Loup coulerait pendant le tour ennemi
    y.buffs.saignementTours = 0;
    const afterOrder = y.hp;
    c.hand = [];
    endTurn(c);
    expect(y.hp).toBe(afterOrder); // pas d'action de fin de tour
    expect(c.petStunned).toBe(1); // le Rayon suivant l'étourdit de nouveau
  });

  it('se joue sans erreur jusqu\'au bout', () => {
    for (const cls of ['guerrier', 'mage', 'demoniste', 'pretre', 'voleur', 'paladin']) {
      const c = fight(cls, 999);
      for (let t = 0; t < 30 && c.phase === 'player'; t++) {
        for (let k = 0; k < 4; k++) {
          const i = c.hand.findIndex((card, j) => canPlayCard(c, j) && card.id !== 'hallucination');
          const target = c.enemies.find((e) => !e.dead && !e.untargetable && !e.submerged);
          if (i >= 0) playCard(c, i, target?.uid);
        }
        endTurn(c);
      }
      expect(['player', 'victory', 'defeat']).toContain(c.phase);
    }
  });
});
