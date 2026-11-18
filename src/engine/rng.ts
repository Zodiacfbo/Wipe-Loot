// Générateur pseudo-aléatoire déterministe (mulberry32).
// Son état est un simple nombre stocké dans la sauvegarde : recharger une partie
// ne change pas ce qui va sortir (pas de triche par rechargement).

export interface HasRng {
  rng: number;
}

export function random(s: HasRng): number {
  s.rng = (s.rng + 0x6d2b79f5) | 0;
  let t = s.rng;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

export function randInt(s: HasRng, min: number, max: number): number {
  return min + Math.floor(random(s) * (max - min + 1));
}

export function shuffle<T>(s: HasRng, list: T[]): T[] {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random(s) * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
