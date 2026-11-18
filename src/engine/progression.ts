// La progression entre les runs : le score d'une run, l'expérience et le niveau de chaque classe (1 à 10).
// Référence : docs/CONCEPT.md (§9.1, §15.2 et §15.3)
import { MAX_WIPES } from './run';
import type { RunState } from './types';

export const MAX_LEVEL = 10;
/** Expérience pour passer du niveau N au niveau N+1 (N = 1 à 9). Total : 1 440, soit 10 à 15 runs. */
export const XP_PER_LEVEL = [80, 100, 120, 140, 160, 180, 200, 220, 240];

export interface ClassProgress {
  xp: number;
}

/** La partie du profil qui concerne la progression. */
export interface ProgressProfile {
  classes: Record<string, ClassProgress>;
  stats: { runs: number; wins: number };
}

export interface LevelInfo {
  level: number;
  /** Expérience déjà gagnée dans le niveau en cours, et ce qu'il faut pour le suivant (0 au niveau max). */
  into: number;
  needed: number;
}

export function levelFromXp(xp: number): LevelInfo {
  let level = 1;
  let rest = xp;
  while (level < MAX_LEVEL && rest >= XP_PER_LEVEL[level - 1]) {
    rest -= XP_PER_LEVEL[level - 1];
    level += 1;
  }
  return { level, into: level === MAX_LEVEL ? 0 : rest, needed: level === MAX_LEVEL ? 0 : XP_PER_LEVEL[level - 1] };
}

export function classLevel(profile: ProgressProfile, classId: string): LevelInfo {
  return levelFromXp(profile.classes[classId]?.xp ?? 0);
}

/** Le meilleur niveau atteint par une autre classe (pour le rattrapage). */
export function bestOtherLevel(profile: ProgressProfile, classId: string): number {
  return Math.max(1, ...Object.keys(profile.classes).filter((id) => id !== classId).map((id) => classLevel(profile, id).level));
}

export interface ScoreLine {
  label: string;
  points: number;
}

export interface RunSummary {
  victory: boolean;
  lines: ScoreLine[];
  score: number;
  xp: number;
  /** Rattrapage : expérience doublée. */
  catchup: boolean;
  levelBefore: number;
  levelAfter: number;
  /** Niveau atteint après la run, pour la barre d'expérience. */
  into: number;
  needed: number;
}

export function scoreRun(run: RunState): ScoreLine[] {
  const victory = run.screen === 'victory';
  const wipes = MAX_WIPES - run.wipesLeft;
  const lines: ScoreLine[] = [
    { label: `Étages atteints (${run.path.length})`, points: run.path.length * 10 },
    { label: `Combats gagnés (${run.stats.combats})`, points: run.stats.combats * 5 },
    { label: `Boss secondaires vaincus (${run.stats.elites})`, points: run.stats.elites * 25 },
  ];
  if (victory) lines.push({ label: 'Vulkhar vaincu', points: 100 });
  if (run.sourcesQuest === 'done') lines.push({ label: 'Quête : les Gardiens des Sources', points: 20 });
  if (victory && wipes === 0) lines.push({ label: 'Aucun wipe', points: 30 });
  if (wipes > 0) lines.push({ label: `Wipes (${wipes})`, points: -15 * wipes });
  return lines.filter((l) => l.points !== 0);
}

/**
 * Fin de run : calcule le score, donne l'expérience à la classe, met à jour les statistiques.
 * À n'appeler qu'une fois par run (voir run.summary).
 */
export function awardRun(profile: ProgressProfile, run: RunState, classId = 'guerrier'): RunSummary {
  const lines = scoreRun(run);
  const score = Math.max(10, lines.reduce((a, l) => a + l.points, 0));
  const before = classLevel(profile, classId);
  const catchup = before.level < bestOtherLevel(profile, classId);
  const xp = catchup ? score * 2 : score;
  const entry = (profile.classes[classId] ??= { xp: 0 });
  entry.xp += xp;
  const after = classLevel(profile, classId);
  const victory = run.screen === 'victory';
  profile.stats.runs += 1;
  if (victory) profile.stats.wins += 1;
  return {
    victory, lines, score, xp, catchup,
    levelBefore: before.level, levelAfter: after.level, into: after.into, needed: after.needed,
  };
}
