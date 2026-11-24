import { describe, expect, it } from 'vitest';
import { MAX_LEVEL, XP_PER_LEVEL, awardRun, classLevel, levelFromXp, scoreRun, type ProgressProfile } from '../src/engine/progression';
import { afterCombatAction, chooseNode, newRun } from '../src/engine/run';
import { reachable } from '../src/engine/map';
import { OLD_XP_PER_LEVEL, convertOldXp } from '../src/engine/xp';
import type { RunState } from '../src/engine/types';

const fresh = (): ProgressProfile => ({ classes: {}, stats: { runs: 0, wins: 0 } });

function finished(victory: boolean, path = 6, combats = 4, elites = 1, wipesLeft = 3): RunState {
  const run = newRun(1);
  run.path = Array.from({ length: path }, (_, i) => i);
  run.stats = { combats, elites };
  run.wipesLeft = wipesLeft;
  run.screen = victory ? 'victory' : 'gameover';
  return run;
}

describe('niveaux de classe', () => {
  it('niveau 1 au départ, niveau 10 au maximum (26 700 expérience, environ 30 victoires)', () => {
    expect(levelFromXp(0)).toEqual({ level: 1, into: 0, needed: 600 });
    expect(levelFromXp(600).level).toBe(2);
    expect(levelFromXp(1499)).toEqual({ level: 2, into: 899, needed: 900 });
    const total = XP_PER_LEVEL.reduce((a, b) => a + b, 0);
    expect(total).toBe(26700);
    expect(total / 890).toBeGreaterThan(29); // une victoire en difficulté 0 rapporte environ 890
    expect(total / 890).toBeLessThan(31);
    expect(levelFromXp(total)).toEqual({ level: MAX_LEVEL, into: 0, needed: 0 });
    expect(levelFromXp(99999).level).toBe(MAX_LEVEL);
  });
});

describe('score et expérience', () => {
  it('une défaite rapporte quand même de l\'expérience ; les wipes coûtent des points', () => {
    const lines = scoreRun(finished(false, 6, 4, 1, 0));
    const score = lines.reduce((a, l) => a + l.points, 0);
    expect(score).toBe(60 + 20 + 25 - 45);
    const profile = fresh();
    const sum = awardRun(profile, finished(false, 6, 4, 1, 0));
    expect(sum.xp).toBe(60);
    expect(profile.classes.guerrier.xp).toBe(60);
    expect(profile.stats).toEqual({ runs: 1, wins: 0 });
  });

  it('une victoire sans chute : Vulkhar et « Aucune chute »', () => {
    const profile = fresh();
    const sum = awardRun(profile, finished(true, 10, 7, 2, 3));
    expect(sum.score).toBe(100 + 35 + 50 + 100 + 30);
    expect(sum.levelBefore).toBe(1);
    expect(sum.levelAfter).toBe(1); // 315 exp. : il en faut 600 pour le niveau 2
    expect(profile.stats.wins).toBe(1);
  });

  it('le niveau 10 demande environ 30 victoires complètes en difficulté 0', () => {
    const win = () => {
      const run = finished(true, 10, 15, 3, 2);
      run.act = 3;
      run.floorsDone = 20;
      return run;
    };
    expect(scoreRun(win()).reduce((a, l) => a + l.points, 0)).toBe(885);
    const profile = fresh();
    for (let i = 0; i < 29; i++) awardRun(profile, win());
    expect(classLevel(profile, 'guerrier').level).toBeLessThan(MAX_LEVEL);
    for (let i = 0; i < 3; i++) awardRun(profile, win());
    expect(classLevel(profile, 'guerrier').level).toBe(MAX_LEVEL);
  });

  it('les anciens profils gardent leur niveau et leur avancée', () => {
    expect(convertOldXp(0)).toBe(0);
    expect(convertOldXp(80)).toBe(600); // pile niveau 2
    expect(convertOldXp(130)).toBe(1050); // niveau 2, à mi-chemin
    expect(levelFromXp(convertOldXp(1000)).level).toBe(levelFromXp(1000, OLD_XP_PER_LEVEL).level);
    expect(convertOldXp(1440)).toBe(26700);
    expect(levelFromXp(convertOldXp(3000)).level).toBe(MAX_LEVEL);
  });

  it('rattrapage : expérience ×1,5 tant que la classe est en retard sur une autre', () => {
    const profile = fresh();
    profile.classes.mage = { xp: 1000 };
    const sum = awardRun(profile, finished(false));
    expect(sum.catchup).toBe(true);
    expect(sum.xp).toBe(Math.round(sum.score * 1.5));
    profile.classes.guerrier.xp = 1000;
    expect(awardRun(profile, finished(false)).catchup).toBe(false);
  });

  it('les combats et boss secondaires gagnés sont comptés pendant la run', () => {
    const run = newRun(7);
    chooseNode(run, reachable(run.map, null)[0].id);
    run.combat!.phase = 'victory';
    afterCombatAction(run);
    expect(run.stats).toEqual({ combats: 1, elites: 0 });
  });
});

describe('progression par classe : victoires et légendaire forgé', () => {
  it('compte les victoires de la classe et retient le légendaire forgé', () => {
    const profile = fresh();
    awardRun(profile, finished(false));
    expect(profile.classes.guerrier.wins ?? 0).toBe(0);
    const win = finished(true);
    win.equipment.arme = 'brisemonts';
    awardRun(profile, win);
    expect(profile.classes.guerrier.wins).toBe(1);
    expect(profile.classes.guerrier.legendary).toBe('brisemonts');
  });

  it('un légendaire emporté depuis le coffre ne compte pas comme forgé', () => {
    const profile = fresh();
    const run = finished(true);
    run.heirloom = 'brisemonts';
    run.equipment.arme = 'brisemonts';
    awardRun(profile, run);
    expect(profile.classes.guerrier.legendary).toBeUndefined();
  });
});
