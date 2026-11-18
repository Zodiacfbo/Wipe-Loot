// Les ennemis de l'acte 1 utilisés par le prototype.
// Référence : docs/actes/ACTE1_PROFONDEURS_ARDENTES.md
import type { Intent } from './types';

export interface EnemyDef {
  id: string;
  name: string;
  hpMin: number;
  hpMax: number;
  elite?: boolean;
  boss?: boolean;
  firstIntents?: Intent[];
  cycle: Intent[];
  /** Cycle de la phase 2 (boss). */
  cycle2?: Intent[];
}

export const ENEMIES: Record<string, EnemyDef> = {
  molosse: {
    id: 'molosse', name: 'Molosse de braise', hpMin: 18, hpMax: 22,
    cycle: [
      { kind: 'attack', dmg: 6 },
      { kind: 'attack', dmg: 6 },
      { kind: 'attack', dmg: 4, addZone: 1 },
    ],
  },
  eclaireur: {
    id: 'eclaireur', name: 'Éclaireur cendreux', hpMin: 14, hpMax: 16,
    firstIntents: [{ kind: 'attack', dmg: 9 }],
    cycle: [{ kind: 'attack', dmg: 5 }],
  },
  etincelle: {
    id: 'etincelle', name: 'Étincelle vivante', hpMin: 8, hpMax: 8,
    cycle: [{ kind: 'attack', dmg: 3 }],
  },
  seigneur: {
    id: 'seigneur', name: 'Seigneur des cendres', hpMin: 40, hpMax: 40,
    cycle: [
      { kind: 'attack', dmg: 18, cast: 'Boule de lave' },
      { kind: 'attack', dmg: 7 },
      { kind: 'buff', puissance: 3, target: 'allies' },
    ],
  },
  lieutenant: {
    id: 'lieutenant', name: 'Lieutenant ardent', hpMin: 30, hpMax: 30,
    cycle: [
      { kind: 'attack', dmg: 7 },
      { kind: 'attack', dmg: 7 },
      { kind: 'block', amount: 8 },
    ],
  },
  cendrine: {
    id: 'cendrine', name: 'Sœur Cendrine', hpMin: 75, hpMax: 75, elite: true,
    cycle: [
      { kind: 'attack', dmg: 5, addZone: 2 },
      { kind: 'attack', dmg: 8 },
      { kind: 'attack', dmg: 20, cast: 'Embrasement' },
    ],
  },
  rejeton: {
    id: 'rejeton', name: 'Rejeton de flamme', hpMin: 12, hpMax: 12,
    cycle: [{ kind: 'attack', dmg: 4 }],
  },
  vulkhar: {
    id: 'vulkhar', name: 'Vulkhar', hpMin: 300, hpMax: 300, boss: true,
    cycle: [
      { kind: 'attack', dmg: 14 },
      { kind: 'attack', dmg: 6, addZone: 2 },
      { kind: 'attack', dmg: 10, cast: 'Marteau des flammes', uninterruptible: true, drawPenalty: 2 },
    ],
    cycle2: [
      { kind: 'attack', dmg: 18 },
      { kind: 'attack', dmg: 8, grow: 4 },
      { kind: 'attack', dmg: 10, cast: 'Marteau des flammes', uninterruptible: true, drawPenalty: 2 },
    ],
  },
  brannoc: {
    id: 'brannoc', name: 'Héraut Brannoc', hpMin: 70, hpMax: 70, elite: true,
    cycle: [
      { kind: 'heal', amount: 25, cast: 'Soins de flamme' },
      { kind: 'buff', puissance: 3, target: 'allies' },
      { kind: 'attack', dmg: 9 },
    ],
  },
};

export function intentAt(def: EnemyDef, step: number, phase = 1): Intent {
  if (phase >= 2 && def.cycle2) return def.cycle2[step % def.cycle2.length];
  const first = def.firstIntents ?? [];
  if (step < first.length) return first[step];
  return def.cycle[(step - first.length) % def.cycle.length];
}

/** Une incantation peut-elle être interrompue ? */
export function isInterruptible(intent: Intent): boolean {
  return !!intent.cast && !(intent.kind === 'attack' && intent.uninterruptible);
}

export interface Encounter {
  kind: 'combat';
  name: string;
  enemies: string[];
  enrageTurn?: number;
}

/** Packs faciles (étages 1 à 4). */
export const EASY_ENCOUNTERS: Encounter[] = [
  { kind: 'combat', name: 'Les molosses de braise', enemies: ['molosse', 'molosse'] },
  { kind: 'combat', name: 'Les éclaireurs cendreux', enemies: ['eclaireur', 'eclaireur', 'eclaireur'] },
  { kind: 'combat', name: 'Les étincelles vivantes', enemies: ['etincelle', 'etincelle', 'etincelle', 'etincelle'] },
  { kind: 'combat', name: 'L\'éclaireur et ses étincelles', enemies: ['eclaireur', 'etincelle', 'etincelle'] },
];

/** Packs difficiles (étages 6 à 8). */
export const HARD_ENCOUNTERS: Encounter[] = [
  { kind: 'combat', name: 'Le Seigneur des cendres', enemies: ['molosse', 'seigneur', 'molosse'] },
  { kind: 'combat', name: 'Le Seigneur et les étincelles', enemies: ['etincelle', 'seigneur', 'etincelle', 'etincelle'] },
  { kind: 'combat', name: 'La patrouille ardente', enemies: ['lieutenant', 'eclaireur', 'lieutenant'] },
  { kind: 'combat', name: 'La meute', enemies: ['molosse', 'molosse', 'molosse'] },
];

/** Boss secondaires. */
export const ELITE_ENCOUNTERS: Encounter[] = [
  { kind: 'combat', name: 'Sœur Cendrine', enemies: ['cendrine'], enrageTurn: 10 },
  { kind: 'combat', name: 'Le Héraut Brannoc', enemies: ['lieutenant', 'brannoc', 'lieutenant'], enrageTurn: 10 },
];

/** Boss de fin d'acte. */
export const BOSS_ENCOUNTER: Encounter = {
  kind: 'combat', name: 'Vulkhar, Souverain des flammes', enemies: ['vulkhar'], enrageTurn: 14,
};
