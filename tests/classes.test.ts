import { describe, expect, it } from 'vitest';
import { CLASSES, bestLevel, chooseStartClass, nextUnlockLevel, unlockClass, unlocksAvailable, type ClassProfile } from '../src/engine/classes';
import { xpForLevel } from '../src/engine/xp';

const fresh = (): ClassProfile => ({ classes: {}, startClass: null, unlockedClasses: [] });

describe('les classes', () => {
  it('9 classes, le Guerrier, le Mage, le Paladin, le Voleur, le Chasseur, le Prêtre, le Démoniste, le Chaman et le Druide jouables dans le prototype', () => {
    expect(CLASSES).toHaveLength(9);
    expect(CLASSES.filter((c) => c.playable).map((c) => c.id)).toEqual(['guerrier', 'mage', 'paladin', 'voleur', 'chasseur', 'pretre', 'demoniste', 'chaman', 'druide']);
  });

  it('premier lancement : on choisit une classe jouable, une seule fois', () => {
    const p = fresh();
    expect(chooseStartClass(p, 'inconnue')).toBe(false); // pas une classe jouable
    expect(chooseStartClass(p, 'guerrier')).toBe(true);
    expect(p.unlockedClasses).toEqual(['guerrier']);
    expect(chooseStartClass(p, 'guerrier')).toBe(false);
  });

  it('le premier niveau N atteint (par n\'importe quelle classe) ouvre la N-ième classe, au choix', () => {
    const p = fresh();
    chooseStartClass(p, 'guerrier');
    expect(unlocksAvailable(p)).toBe(0);
    expect(nextUnlockLevel(p)).toBe(2);
    p.classes.guerrier = { xp: xpForLevel(3) };
    expect(bestLevel(p)).toBe(3);
    expect(unlocksAvailable(p)).toBe(2);
    expect(nextUnlockLevel(p)).toBe(4);
    expect(unlockClass(p, 'inconnue')).toBe(false); // pas une classe jouable : le déblocage attend
    expect(unlocksAvailable(p)).toBe(2);
    expect(unlockClass(p, 'mage')).toBe(true);
    expect(unlockClass(p, 'voleur')).toBe(true);
    expect(unlocksAvailable(p)).toBe(0);
    // Le Mage atteint le niveau 4 : c'est le meilleur niveau qui compte, pas la classe.
    p.classes.mage = { xp: xpForLevel(4) };
    expect(unlocksAvailable(p)).toBe(1);
    // Au niveau 9, les 9 classes ; au niveau 10, plus rien à débloquer.
    p.classes.mage = { xp: xpForLevel(10) };
    expect(unlocksAvailable(p)).toBe(6);
    expect(nextUnlockLevel(p)).toBe(null);
  });
});
