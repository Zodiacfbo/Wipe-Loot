// OUTIL DE TEST (version dev seulement) : tricher sur le profil et la run pour tester vite.
// À retirer avant la version 1.0 : supprimer ce fichier, devtools.test.ts, et les lignes « Outil de test » de ui.ts.
import { CLASSES } from './classes';
import { MAX_DIFFICULTY } from './difficulty';
import { MAX_LEVEL, XP_PER_LEVEL } from './progression';
import { LAST_ACT } from './acts';
import { BOSS_ENCOUNTER_3, ELITE_ENCOUNTERS_3 } from './enemies_acte3';
import { startEncounter, startNextAct } from './run';
import { clampAlloc, emptyAlloc } from './talents';
import type { Profile } from './save';
import type { RunState } from './types';

/** L'expérience qu'il faut pour être pile au début d'un niveau. */
export function xpForLevel(level: number): number {
  const n = Math.max(1, Math.min(MAX_LEVEL, level));
  return XP_PER_LEVEL.slice(0, n - 1).reduce((a, b) => a + b, 0);
}

/** Met une classe au niveau voulu (les talents en trop sont retirés si on descend). */
export function devSetLevel(profile: Profile, classId: string, level: number): void {
  profile.classes[classId] = { xp: xpForLevel(level) };
  const alloc = profile.talents[classId];
  if (alloc) profile.talents[classId] = clampAlloc(alloc, Math.max(1, Math.min(MAX_LEVEL, level)), classId);
}

/** Remet une classe à zéro : niveau 1, talents vides, difficulté 0. */
export function devResetClass(profile: Profile, classId: string): void {
  profile.classes[classId] = { xp: 0 };
  profile.talents[classId] = emptyAlloc(classId);
  (profile.difficulty ??= {})[classId] = 0;
}

/** Débloque toutes les classes jouables (et choisit une classe de départ s'il n'y en a pas). */
export function devUnlockClasses(profile: Profile): void {
  const playable = CLASSES.filter((c) => c.playable).map((c) => c.id);
  profile.startClass ??= playable[0];
  profile.unlockedClasses = [...new Set([...profile.unlockedClasses, ...playable])];
}

/** Débloque tous les niveaux de difficulté d'une classe. */
export function devUnlockDifficulties(profile: Profile, classId: string): void {
  (profile.difficulty ??= {})[classId] = MAX_DIFFICULTY;
}

/** Pendant une run : de l'or. */
export function devGold(run: RunState, n = 500): void {
  run.gold += n;
}

/** Pendant une run : les PV au maximum (en combat aussi). */
export function devHeal(run: RunState): void {
  run.hp = run.maxHp;
  if (run.combat) run.combat.player.hp = run.combat.player.maxHp;
}

/** Pendant un combat : tous les ennemis meurent, le combat est gagné. */
export function devWinCombat(run: RunState): boolean {
  const c = run.combat;
  if (run.screen !== 'combat' || !c || c.phase !== 'player') return false;
  for (const e of c.enemies) {
    if (e.dead) continue;
    e.hp = 0;
    e.dead = true;
    e.block = 0;
  }
  c.phase = 'victory';
  return true;
}

/** Saute à l'acte suivant (depuis la carte de l'acte en cours). */
export function devNextAct(run: RunState): boolean {
  if (run.act >= LAST_ACT || run.screen === 'combat') return false;
  run.combat = null;
  run.screen = 'act';
  return startNextAct(run);
}

/** Les boss d'Irem que l'outil de test lance depuis la carte : les 7 boss secondaires, puis Yzhar. */
export const DEV_IREM_FIGHTS = [...ELITE_ENCOUNTERS_3, BOSS_ENCOUNTER_3];

/** Acte 3 : affronte un boss d'Irem depuis la carte (les boss secondaires avec leur butin). */
export function devFightIrem(run: RunState, index: number): boolean {
  const enc = DEV_IREM_FIGHTS[index];
  if (!enc || run.screen !== 'map') return false;
  startEncounter(run, enc);
  return true;
}
