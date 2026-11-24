// La courbe d'expérience des classes (niveaux 1 à 10), sans dépendance : partagée par la progression,
// le déblocage des classes et la migration des sauvegardes.
// Référence : docs/CONCEPT.md (§15.2 et §15.3)

export const MAX_LEVEL = 10;
/**
 * Expérience pour passer du niveau N au niveau N+1 (N = 1 à 9). Total : 26 700, l'équivalent de 30 victoires
 * en difficulté 0 (une victoire ≈ 890). Douce au début (niveau 2 vers la 3e run), longue ensuite (≈ 50 runs réelles).
 */
export const XP_PER_LEVEL = [600, 900, 1300, 1800, 2400, 3200, 4300, 5400, 6800];
/** L'ancienne courbe (avant le 24 novembre 2026), pour convertir les profils. */
export const OLD_XP_PER_LEVEL = [80, 100, 120, 140, 160, 180, 200, 220, 240];
/** Rattrapage : expérience ×1,5 tant que la classe est en dessous du meilleur niveau d'une autre. */
export const CATCHUP = 1.5;

export interface LevelInfo {
  level: number;
  /** Expérience déjà gagnée dans le niveau en cours, et ce qu'il faut pour le suivant (0 au niveau max). */
  into: number;
  needed: number;
}

export function levelFromXp(xp: number, curve = XP_PER_LEVEL): LevelInfo {
  let level = 1;
  let rest = xp;
  while (level < MAX_LEVEL && rest >= curve[level - 1]) {
    rest -= curve[level - 1];
    level += 1;
  }
  return { level, into: level === MAX_LEVEL ? 0 : rest, needed: level === MAX_LEVEL ? 0 : curve[level - 1] };
}

/** L'expérience qu'il faut pour être pile au début d'un niveau. */
export function xpForLevel(level: number): number {
  const n = Math.max(1, Math.min(MAX_LEVEL, level));
  return XP_PER_LEVEL.slice(0, n - 1).reduce((a, b) => a + b, 0);
}

/** Convertit une expérience de l'ancienne courbe : même niveau, même avancée dans le niveau. */
export function convertOldXp(xp: number): number {
  const old = levelFromXp(xp, OLD_XP_PER_LEVEL);
  if (old.level === MAX_LEVEL) {
    const over = xp - OLD_XP_PER_LEVEL.reduce((a, b) => a + b, 0);
    return xpForLevel(MAX_LEVEL) + Math.round(over * (xpForLevel(MAX_LEVEL) / 1440));
  }
  return xpForLevel(old.level) + Math.round((old.into / old.needed) * XP_PER_LEVEL[old.level - 1]);
}
