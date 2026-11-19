// La progression entre les runs : le score d'une run, l'expérience et le niveau de chaque classe (1 à 10).
// Référence : docs/CONCEPT.md (§9.1, §15.2 et §15.3)
import { MAX_DIFFICULTY } from './difficulty';
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
  /** Le plus haut niveau de difficulté débloqué, par classe (0 au départ). */
  difficulty?: Record<string, number>;
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
  /** Niveau de difficulté débloqué par cette victoire (null sinon). */
  newDifficulty: number | null;
  /** Niveau atteint après la run, pour la barre d'expérience. */
  into: number;
  needed: number;
}

export function scoreRun(run: RunState): ScoreLine[] {
  const victory = run.screen === 'victory';
  const wipes = (run.maxWipes ?? MAX_WIPES) - run.wipesLeft;
  const floors = (run.floorsDone ?? 0) + run.path.length;
  const lines: ScoreLine[] = [
    { label: `Étages atteints (${floors})`, points: floors * 10 },
    { label: `Combats gagnés (${run.stats.combats})`, points: run.stats.combats * 5 },
    { label: `Boss secondaires vaincus (${run.stats.elites})`, points: run.stats.elites * 25 },
  ];
  if (victory || (run.act ?? 1) >= 2) lines.push({ label: 'Vulkhar vaincu', points: 100 });
  if (victory && (run.act ?? 1) >= 2) lines.push({ label: 'Vhaeryx vaincu', points: 150 });
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
  // Difficulté : +5 % de score par niveau.
  const base = lines.reduce((a, l) => a + l.points, 0);
  if ((run.difficulty ?? 0) > 0 && base > 0) lines.push({ label: `Difficulté ${run.difficulty} (+${run.difficulty * 5} %)`, points: Math.round(base * 0.05 * run.difficulty) });
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
  // Gagner au niveau de difficulté le plus haut débloque le suivant.
  let newDifficulty: number | null = null;
  const unlocked = (profile.difficulty ??= {})[classId] ?? 0;
  if (victory && (run.difficulty ?? 0) >= unlocked && unlocked < MAX_DIFFICULTY) {
    newDifficulty = (run.difficulty ?? 0) + 1;
    profile.difficulty[classId] = newDifficulty;
  }
  return {
    victory, lines, score, xp, catchup,
    levelBefore: before.level, levelAfter: after.level, into: after.into, needed: after.needed, newDifficulty,
  };
}
