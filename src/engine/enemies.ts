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
  /** Cycle utilisé sous 50 % de PV (boss secondaires). */
  cycleLow?: Intent[];
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
    cycleLow: [
      { kind: 'attack', dmg: 5, addZone: 3 },
      { kind: 'attack', dmg: 8 },
      { kind: 'attack', dmg: 20, cast: 'Embrasement' },
    ],
  },
  gardien: {
    // Au début de son tour : +6 blocage. Tant qu'il a du blocage, il renvoie 3 dégâts à chaque Attaque reçue.
    id: 'gardien', name: 'Gardien de lave', hpMin: 32, hpMax: 32,
    cycle: [{ kind: 'attack', dmg: 7 }],
  },
  pretre: {
    id: 'pretre', name: 'Prêtre de la flamme', hpMin: 22, hpMax: 22,
    cycle: [
      { kind: 'heal', amount: 12 },
      { kind: 'attack', dmg: 5 },
      { kind: 'buff', puissance: 2, target: 'allies', cast: 'Bénédiction ardente' },
    ],
  },
  morvax: {
    id: 'morvax', name: 'Morvax le Maudisseur', hpMin: 85, hpMax: 85, elite: true,
    cycle: [
      { kind: 'curse', label: 'Malédiction de faiblesse', demoralise: 4 },
      { kind: 'attack', dmg: 12 },
      { kind: 'curse', label: 'Malédiction du fardeau', fardeau: 2 },
      { kind: 'attack', dmg: 14 },
    ],
    cycleLow: [
      { kind: 'curse', label: 'Malédiction de faiblesse', demoralise: 4 },
      { kind: 'attack', dmg: 12 },
      { kind: 'curse', label: 'Malédiction du fardeau', fardeau: 2 },
      { kind: 'attack', dmg: 14 },
      { kind: 'curse', label: 'Malédiction de l\'impie', impie: 3 },
    ],
  },
  croc: {
    id: 'croc', name: 'Croc-de-lave', hpMin: 90, hpMax: 90, elite: true,
    cycle: [
      { kind: 'attack', dmg: 10 },
      { kind: 'attack', dmg: 10 },
      { kind: 'curse', label: 'Hurlement de terreur', panic: 2 },
    ],
    cycleLow: [
      { kind: 'attack', dmg: 10, times: 2 },
      { kind: 'attack', dmg: 10, times: 2 },
      { kind: 'curse', label: 'Hurlement de terreur', panic: 2 },
    ],
  },
  gorlok: {
    // Au début de son tour : +4 blocage par Éclat encore en vie.
    id: 'gorlok', name: 'Gorlok le Fragmenté', hpMin: 70, hpMax: 70, elite: true,
    cycle: [
      { kind: 'attack', dmg: 10 },
      { kind: 'summon', id: 'eclat', max: 4, label: 'Rappel des éclats' },
      { kind: 'attack', dmg: 12 },
    ],
  },
  eclat: {
    // À sa mort, il explose : 5 dégâts au joueur.
    id: 'eclat', name: 'Éclat de Gorlok', hpMin: 10, hpMax: 10,
    cycle: [{ kind: 'attack', dmg: 3 }],
  },
  vossk: {
    id: 'vossk', name: 'Baron Vossk', hpMin: 95, hpMax: 95, elite: true,
    cycle: [
      { kind: 'curse', label: 'Bombe vivante', bomb: 1 },
      { kind: 'attack', dmg: 11 },
      { kind: 'curse', label: 'Embrasement de mana', manaBurn: 1 },
      { kind: 'attack', dmg: 11 },
      { kind: 'attack', dmg: 4, times: 4, cast: 'Inferno' },
    ],
  },
  zhaal: {
    // Passif : Contresort, la 3e carte de Sort de chaque tour est contrée.
    id: 'zhaal', name: 'Zhaal le Tisseur', hpMin: 80, hpMax: 80, elite: true,
    cycle: [
      { kind: 'attack', dmg: 12 },
      { kind: 'blink' },
      { kind: 'attack', dmg: 12 },
      { kind: 'curse', label: 'Malédiction arcanique', arcane: 1 },
    ],
  },
  kragg: {
    // Passif : gagne 1 Puissance au début de chacun de ses tours.
    id: 'kragg', name: 'Krâgg le Mange-roche', hpMin: 110, hpMax: 110, elite: true,
    cycle: [
      { kind: 'attack', dmg: 14 },
      { kind: 'attack', dmg: 14 },
      { kind: 'heal', amount: 10, self: true },
    ],
  },
  molosse_enrage: {
    // Tant que Krâgg est en vie, se relève 2 tours après sa mort avec la moitié de ses PV.
    id: 'molosse_enrage', name: 'Molosse enragé', hpMin: 30, hpMax: 30,
    cycle: [{ kind: 'attack', dmg: 6 }],
  },
  saldris: {
    // Alterne Bouclier anti-coups / anti-sorts, donne 8 blocage à un garde chaque tour, se rend sans ses gardes.
    id: 'saldris', name: 'Grand Intendant Saldris', hpMin: 60, hpMax: 60, elite: true,
    cycle: [{ kind: 'attack', dmg: 8 }],
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

export function intentAt(def: EnemyDef, step: number, phase = 1, low = false): Intent {
  if (phase >= 2 && def.cycle2) return def.cycle2[step % def.cycle2.length];
  if (low && def.cycleLow) return def.cycleLow[step % def.cycleLow.length];
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
  /** Table de loot (boss secondaires). */
  loot?: string;
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
  { kind: 'combat', name: 'Sœur Cendrine', enemies: ['cendrine'], enrageTurn: 10, loot: 'cendrine' },
  { kind: 'combat', name: 'Le Héraut Brannoc', enemies: ['lieutenant', 'brannoc', 'lieutenant'], enrageTurn: 10, loot: 'brannoc' },
  { kind: 'combat', name: 'Morvax le Maudisseur', enemies: ['morvax'], enrageTurn: 10, loot: 'morvax' },
  { kind: 'combat', name: 'Croc-de-lave, le Molosse ancestral', enemies: ['croc'], enrageTurn: 10, loot: 'croc' },
  { kind: 'combat', name: 'Gorlok le Fragmenté', enemies: ['eclat', 'eclat', 'gorlok', 'eclat', 'eclat'], enrageTurn: 10, loot: 'gorlok' },
  { kind: 'combat', name: 'Le Baron Vossk', enemies: ['vossk'], enrageTurn: 10, loot: 'vossk' },
  { kind: 'combat', name: 'Zhaal le Tisseur d\'arcanes', enemies: ['zhaal'], enrageTurn: 10, loot: 'zhaal' },
  { kind: 'combat', name: 'Krâgg le Mange-roche', enemies: ['molosse_enrage', 'kragg', 'molosse_enrage'], enrageTurn: 10, loot: 'kragg' },
  { kind: 'combat', name: 'Le Grand Intendant Saldris', enemies: ['pretre', 'gardien', 'saldris', 'gardien', 'pretre'], enrageTurn: 10, loot: 'saldris' },
];

/** Boss de fin d'acte. */
export const BOSS_ENCOUNTER: Encounter = {
  kind: 'combat', name: 'Vulkhar, Souverain des flammes', enemies: ['vulkhar'], enrageTurn: 14,
};
