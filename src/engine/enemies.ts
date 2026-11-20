// Les ennemis de l'acte 1 (et, dans enemies_acte2.ts, ceux de l'acte 2).
// Référence : docs/actes/ACTE1_PROFONDEURS_ARDENTES.md
import { ENEMIES_ACTE2 } from './enemies_acte2';
import { ENEMIES_ACTE3 } from './enemies_acte3';
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
  /** Ce que l'ennemi fait en permanence, affiché sous son nom. */
  passive?: string;
  /** Dragon, Mort-vivant, Humanoïde, Expérience (acte 2), Démon. */
  tags?: ('dragon' | 'mortvivant' | 'humanoide' | 'experience' | 'demon' | 'insecte' | 'construct' | 'aberration')[];
  /** Acte 3 : Résistance, il subit 50 % de dégâts en moins de ce type de cartes. */
  resist?: 'attaques' | 'sorts';
  /** Mutation : tirée au hasard au début du combat, active sous 50 % de PV. */
  mutation?: boolean;
  /** Commence le combat avec cette part de ses PV (Ysolde). */
  startHpRatio?: number;
}

/** Les réglages d'équilibrage des mécaniques spéciales (voir tools/balance/). */
export const TUNING = {
  rejetonHeal: 10, // PV rendus à Vulkhar par Rejeton encore en vie
  gardienBlock: 4, // blocage du Gardien de lave à chaque tour
  saldrisGuardBlock: 6, // blocage donné par Saldris à un garde
  gorlokBlockPerShard: 3, // blocage de Gorlok par Éclat en vie
};

const ENEMIES_ACTE1: Record<string, EnemyDef> = {
  molosse: {
    id: 'molosse', name: 'Molosse de braise', hpMin: 18, hpMax: 22, tags: ['demon'],
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
    passive: 'Explose à sa mort : 4 dégâts sur toi.',
    cycle: [{ kind: 'attack', dmg: 3 }],
  },
  seigneur: {
    id: 'seigneur', name: 'Seigneur des cendres', hpMin: 36, hpMax: 36,
    cycle: [
      { kind: 'attack', dmg: 15, cast: 'Boule de lave' },
      { kind: 'attack', dmg: 7 },
      { kind: 'buff', puissance: 2, target: 'allies' },
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
    passive: 'Sous 50 % de PV : 3 Zones de feu au lieu de 2.',
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
    passive: '+4 blocage à chaque tour. Tant qu\'il a du blocage, renvoie 3 dégâts par Attaque reçue.',
    cycle: [{ kind: 'attack', dmg: 5 }],
  },
  pretre: {
    id: 'pretre', name: 'Prêtre de la flamme', hpMin: 22, hpMax: 22,
    cycle: [
      { kind: 'heal', amount: 10 },
      { kind: 'attack', dmg: 4 },
      { kind: 'buff', puissance: 1, target: 'allies', cast: 'Bénédiction ardente' },
    ],
  },
  morvax: {
    id: 'morvax', name: 'Morvax le Maudisseur', hpMin: 85, hpMax: 85, elite: true, tags: ['demon'],
    passive: 'Sous 50 % de PV : ajoute la Malédiction de l\'impie à son cycle.',
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
    id: 'croc', name: 'Croc-de-lave', hpMin: 90, hpMax: 90, elite: true, tags: ['demon'],
    passive: 'Sous 50 % de PV : ses Morsures frappent deux fois.',
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
    passive: '+3 blocage par Éclat en vie, au début de son tour.',
    cycle: [
      { kind: 'attack', dmg: 10 },
      { kind: 'summon', id: 'eclat', max: 4, label: 'Rappel des éclats' },
      { kind: 'attack', dmg: 12 },
    ],
  },
  eclat: {
    // À sa mort, il explose : 5 dégâts au joueur.
    id: 'eclat', name: 'Éclat de Gorlok', hpMin: 10, hpMax: 10,
    passive: 'Explose à sa mort : 4 dégâts sur toi.',
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
    passive: 'Contresort : ta 3e carte de Sort de chaque tour est annulée.',
    cycle: [
      { kind: 'attack', dmg: 12 },
      { kind: 'blink' },
      { kind: 'attack', dmg: 12 },
      { kind: 'curse', label: 'Malédiction arcanique', arcane: 1 },
    ],
  },
  kragg: {
    // Passif : gagne 1 Puissance au début de chacun de ses tours.
    id: 'kragg', name: 'Krâgg le Mange-roche', hpMin: 95, hpMax: 95, elite: true,
    passive: 'Gagne 1 Puissance au début de chacun de ses tours. Ses Molosses s\'enfuient s\'il meurt.',
    cycle: [
      { kind: 'attack', dmg: 10 },
      { kind: 'attack', dmg: 10 },
      { kind: 'heal', amount: 10, self: true },
    ],
  },
  molosse_enrage: {
    // Tant que Krâgg est en vie, se relève 2 tours après sa mort avec la moitié de ses PV.
    id: 'molosse_enrage', name: 'Molosse enragé', hpMin: 24, hpMax: 24, tags: ['demon'],
    passive: 'Se relève 2 tours après sa mort, tant que Krâgg est en vie.',
    cycle: [{ kind: 'attack', dmg: 5 }],
  },
  saldris: {
    // Alterne Bouclier anti-coups / anti-sorts, donne 8 blocage à un garde chaque tour, se rend sans ses gardes.
    id: 'saldris', name: 'Grand Intendant Saldris', hpMin: 60, hpMax: 60, elite: true,
    passive: 'Bouclier qui renvoie 50 % des dégâts. Se rend quand ses 4 gardes sont tombés, ou sous 10 % de PV.',
    cycle: [{ kind: 'attack', dmg: 6 }],
  },
  mimique: {
    id: 'mimique', name: 'Gobelin mimique', hpMin: 45, hpMax: 45,
    passive: 'S\'il te fait perdre des PV avec Avaler, il te vole 15 or.',
    cycle: [
      { kind: 'attack', dmg: 9 },
      { kind: 'attack', dmg: 9, stealGold: 15 },
    ],
  },
  rejeton: {
    id: 'rejeton', name: 'Rejeton de flamme', hpMin: 12, hpMax: 12,
    cycle: [{ kind: 'attack', dmg: 4 }],
  },
  vulkhar: {
    id: 'vulkhar', name: 'Vulkhar', hpMin: 225, hpMax: 225, boss: true,
    passive: 'À 50 % de PV, plonge dans la lave et appelle des Rejetons.',
    cycle: [
      { kind: 'attack', dmg: 12 },
      { kind: 'attack', dmg: 6, addZone: 2 },
      { kind: 'attack', dmg: 10, cast: 'Marteau des flammes', uninterruptible: true, drawPenalty: 2 },
    ],
    cycle2: [
      { kind: 'attack', dmg: 15 },
      { kind: 'attack', dmg: 8, grow: 3 },
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

export const ENEMIES: Record<string, EnemyDef> = { ...ENEMIES_ACTE1, ...ENEMIES_ACTE2, ...ENEMIES_ACTE3 };

/** L'ennemi porte-t-il ce tag (Dragon, Mort-vivant…) ? */
export function hasTag(id: string, tag: NonNullable<EnemyDef['tags']>[number]): boolean {
  return !!ENEMIES[id]?.tags?.includes(tag);
}

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
  /** Les ennemis agissent avant ton premier tour (embuscade). */
  ambush?: boolean;
  /** Or gagné en plus (Gobelin mimique). */
  goldReward?: [number, number];
  /** Un objet d'équipement en plus après la victoire. */
  bonusItem?: 'commun' | 'rare';
  /** Ce boss secondaire porte la rune des Gardiens des Sources. */
  rune?: boolean;
  /** Vulkhar est affaibli par l'Eau des profondeurs (−15 % de PV, Marteau des flammes retardé). */
  weakened?: boolean;
  /** La Chimère de la cage ouverte porte deux mutations. */
  doubleMutation?: boolean;
  /** Les œufs laissés : Vhaeryx appelle ce nombre d'adds en plus par vague. */
  extraAdds?: number;
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
