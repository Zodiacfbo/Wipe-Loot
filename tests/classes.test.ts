import { describe, expect, it } from 'vitest';
import { CLASSES, CLASS_UNLOCK_XP, chooseStartClass, nextUnlockAt, totalXp, unlockClass, unlocksAvailable, type ClassProfile } from '../src/engine/classes';

const fresh = (): ClassProfile => ({ classes: {}, startClass: null, unlockedClasses: [] });

describe('les classes', () => {
  it('9 classes, le Guerrier, le Mage et le Démoniste jouables dans le prototype', () => {
    expect(CLASSES).toHaveLength(9);
    expect(CLASSES.filter((c) => c.playable).map((c) => c.id)).toEqual(['guerrier', 'mage', 'demoniste']);
  });

  it('premier lancement : on choisit une classe jouable, une seule fois', () => {
    const p = fresh();
    expect(chooseStartClass(p, 'paladin')).toBe(false); // pas encore jouable
    expect(chooseStartClass(p, 'guerrier')).toBe(true);
    expect(p.unlockedClasses).toEqual(['guerrier']);
    expect(chooseStartClass(p, 'guerrier')).toBe(false);
  });

  it('les paliers d\'expérience totale ouvrent des déblocages au choix', () => {
    const p = fresh();
    chooseStartClass(p, 'guerrier');
    expect(unlocksAvailable(p)).toBe(0);
    expect(nextUnlockAt(p)).toBe(CLASS_UNLOCK_XP[0]);
    p.classes.guerrier = { xp: 750 };
    expect(totalXp(p)).toBe(750);
    expect(unlocksAvailable(p)).toBe(2);
    expect(nextUnlockAt(p)).toBe(1200);
    expect(unlockClass(p, 'paladin')).toBe(false); // pas encore jouable : le déblocage attend
    expect(unlocksAvailable(p)).toBe(2);
    expect(unlockClass(p, 'mage')).toBe(true);
    expect(unlocksAvailable(p)).toBe(1);
  });
});
