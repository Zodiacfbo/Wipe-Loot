// Les ennemis du chapitre II : l'Aire de Vhaeryx.
// Référence : docs/actes/ACTE2_AIRE_DE_VHAERYX.md (§3, §5 et §6)
import type { EnemyDef, Encounter } from './enemies';

const toxine = { label: 'Toxine', toxine: 3 };
const peste = { label: 'Peste', peste: 3 };

export const ENEMIES_ACTE2: Record<string, EnemyDef> = {
  // --- Trash ---
  dragonnet: {
    id: 'dragonnet', name: 'Dragonnet noir', hpMin: 13, hpMax: 13, tags: ['dragon'],
    cycle: [{ kind: 'attack', dmg: 5 }, { kind: 'attack', dmg: 5 }, { kind: 'blink', flight: true }],
  },
  oeuf: {
    id: 'oeuf', name: 'Œuf de dragon', hpMin: 15, hpMax: 15, tags: ['dragon'],
    passive: 'Éclôt en Dragonnet noir tous les 3 tours.',
    cycle: [{ kind: 'idle', label: 'Frémit' }, { kind: 'idle', label: 'Se fissure' }, { kind: 'hatch', label: 'Éclosion', self: true }],
  },
  drakonide: {
    id: 'drakonide', name: 'Drakônide de la couvée', hpMin: 40, hpMax: 40, tags: ['dragon', 'humanoide'],
    cycle: [{ kind: 'attack', dmg: 11 }, { kind: 'buff', puissance: 2, target: 'allies' }, { kind: 'attack', dmg: 11 }],
  },
  alchimiste: {
    id: 'alchimiste', name: 'Alchimiste gobelin', hpMin: 20, hpMax: 20, tags: ['humanoide'],
    passive: 'Tant qu\'il vit, un Serviteur rapiécé qui tombe se relève une fois.',
    cycle: [
      { kind: 'attack', dmg: 7, effect: toxine },
      { kind: 'heal', amount: 10, cast: 'Fiole de soins' },
      { kind: 'attack', dmg: 16, cast: 'Potion explosive' },
    ],
  },
  serviteur: {
    id: 'serviteur', name: 'Serviteur rapiécé', hpMin: 32, hpMax: 32, tags: ['mortvivant', 'experience'],
    passive: 'À sa mort, se relève une fois avec 10 PV si un Alchimiste gobelin est en vie.',
    cycle: [{ kind: 'attack', dmg: 9 }],
  },
  drake_os: {
    id: 'drake_os', name: 'Drake d\'os', hpMin: 48, hpMax: 48, tags: ['mortvivant', 'dragon'],
    cycle: [
      { kind: 'attack', dmg: 12 },
      { kind: 'attack', dmg: 8, cast: 'Souffle de mort', uninterruptible: true, breath: true, effect: peste },
      { kind: 'attack', dmg: 12 },
    ],
  },
  chimere: {
    id: 'chimere', name: 'Chimère d\'essai', hpMin: 55, hpMax: 55, tags: ['experience'], mutation: true,
    cycle: [{ kind: 'attack', dmg: 13 }],
  },
  garde_draconique: {
    id: 'garde_draconique', name: 'Garde draconique', hpMin: 60, hpMax: 60, tags: ['dragon', 'humanoide'],
    cycle: [
      { kind: 'block', amount: 14 },
      { kind: 'attack', dmg: 14, effect: { label: 'Ralenti', ralenti: 1 } },
      { kind: 'attack', dmg: 9, times: 2 },
    ],
  },
  drakonide_chroma: {
    id: 'drakonide_chroma', name: 'Drakônide chromatique', hpMin: 20, hpMax: 20, tags: ['dragon', 'humanoide'],
    cycle: [{ kind: 'attack', dmg: 6 }],
  },
  serviteur_os: {
    id: 'serviteur_os', name: 'Serviteur d\'os', hpMin: 10, hpMax: 10, tags: ['mortvivant'],
    cycle: [{ kind: 'attack', dmg: 5 }],
  },

  // --- Boss secondaires ---
  skarn: {
    id: 'skarn', name: 'Skarn, Gardien des couvées', hpMin: 100, hpMax: 100, elite: true, tags: ['dragon', 'humanoide'],
    passive: 'Immunisé tant qu\'il reste des Œufs. Chaque tour, tu reçois un Sceptre de domination.',
    cycle: [{ kind: 'summon', id: 'dragonnet', max: 4, label: 'Appel de la couvée', count: 2 }],
    cycle2: [
      { kind: 'attack', dmg: 14 },
      { kind: 'attack', dmg: 10, effect: { label: 'Coup de queue', discard: 1 } },
      { kind: 'attack', dmg: 18, cast: 'Souffle de flammes', uninterruptible: true, breath: true },
    ],
  },
  oeuf_skarn: {
    id: 'oeuf_skarn', name: 'Œuf de la couvée', hpMin: 15, hpMax: 15, tags: ['dragon'],
    passive: 'Tant qu\'il reste un Œuf, Skarn est immunisé.',
    cycle: [{ kind: 'idle', label: 'Couve' }],
  },
  ysolde: {
    id: 'ysolde', name: 'Ysolde la Rouge', hpMin: 160, hpMax: 160, elite: true, tags: ['dragon'], startHpRatio: 0.5,
    passive: 'Adrénaline ardente : +3 énergie par tour, mais tu perds 3, 5, 7… PV à la fin de chacun de tes tours.',
    cycle: [
      { kind: 'attack', dmg: 12 },
      { kind: 'attack', dmg: 15, cast: 'Souffle de flammes', uninterruptible: true, breath: true },
      { kind: 'attack', dmg: 12 },
    ],
  },
  draksis: {
    id: 'draksis', name: 'Contremaître Draksis', hpMin: 130, hpMax: 130, elite: true, tags: ['dragon', 'humanoide'],
    passive: 'Rage croissante : chacune de ses attaques inflige 3 dégâts de plus que la précédente.',
    cycle: [
      { kind: 'attack', dmg: 8, grow: 3 },
      { kind: 'attack', dmg: 8, grow: 3, effect: { label: 'Frappe mortelle', peste: 2 } },
      { kind: 'attack', dmg: 8, grow: 3, effect: { label: 'Projection', discard: 2 } },
    ],
  },
  drake_braise: {
    id: 'drake_braise', name: 'Braise', hpMin: 62, hpMax: 62, elite: true, tags: ['dragon'],
    passive: 'Fureur de la meute : quand un drake meurt, les autres gagnent 3 Puissance.',
    cycle: [
      { kind: 'attack', dmg: 12, addZone: 1, cast: 'Souffle de feu', uninterruptible: true, breath: true },
      { kind: 'attack', dmg: 8 },
      { kind: 'attack', dmg: 8 },
    ],
  },
  drake_ombre: {
    id: 'drake_ombre', name: 'Ombre', hpMin: 62, hpMax: 62, elite: true, tags: ['dragon'],
    passive: 'Fureur de la meute : quand un drake meurt, les autres gagnent 3 Puissance.',
    cycle: [
      { kind: 'attack', dmg: 8 },
      { kind: 'attack', dmg: 8, cast: 'Souffle d\'ombre', uninterruptible: true, breath: true, effect: { label: 'Ombre rongeuse', ombre: 1 } },
      { kind: 'attack', dmg: 8 },
    ],
  },
  drake_cendre: {
    id: 'drake_cendre', name: 'Cendre', hpMin: 62, hpMax: 62, elite: true, tags: ['dragon'],
    passive: 'Fureur de la meute : quand un drake meurt, les autres gagnent 3 Puissance.',
    cycle: [
      { kind: 'attack', dmg: 8 },
      { kind: 'attack', dmg: 8 },
      { kind: 'attack', dmg: 6, cast: 'Souffle de cendres', uninterruptible: true, breath: true, effect: { label: 'Cendres', cendres: 2 } },
    ],
  },
  prismagor: {
    id: 'prismagor', name: 'Prismagor', hpMin: 160, hpMax: 160, elite: true, tags: ['dragon', 'experience'],
    passive: 'Ses Morsures t\'infligent une Affliction de sang. Les 5 couleurs : tu es Transformé. Sous 20 % : mord deux fois.',
    // Le Souffle est remplacé, au début du combat, par l'un des deux Souffles tirés au hasard (voir combat.ts).
    cycle: [
      { kind: 'attack', dmg: 10, effect: { label: 'Affliction de sang', affliction: true } },
      { kind: 'attack', dmg: 10, effect: { label: 'Affliction de sang', affliction: true } },
      { kind: 'attack', dmg: 12, cast: 'Souffle', uninterruptible: true, breath: true },
    ],
  },
  grizzik: {
    id: 'grizzik', name: 'Grizzik l\'Alchimiste fou', hpMin: 110, hpMax: 110, elite: true, tags: ['humanoide'],
    passive: 'Boit une potion au hasard un tour sur deux (annoncée à l\'avance).',
    cycle: [{ kind: 'attack', dmg: 9 }, { kind: 'potion', potion: 'soins', label: 'Potion' }],
  },
  ossyrax: {
    id: 'ossyrax', name: 'Ossyrax, le Drake ressuscité', hpMin: 110, hpMax: 110, elite: true, tags: ['mortvivant', 'dragon'],
    passive: 'Deux vies : la première fois qu\'il meurt, il se relève avec 45 PV et frappe plus fort.',
    cycle: [
      { kind: 'attack', dmg: 12 },
      { kind: 'attack', dmg: 8, cast: 'Souffle de mort', uninterruptible: true, breath: true, effect: peste },
      { kind: 'curse', label: 'Cri d\'outre-tombe', panic: 1 },
    ],
  },
  vashka: {
    id: 'vashka', name: 'Vashka, Gardienne des œufs', hpMin: 100, hpMax: 100, elite: true, tags: ['dragon', 'humanoide'],
    passive: 'Chaque tour : 6 blocage à 2 Œufs. Tous les 2 tours, 2 Œufs éclosent.',
    cycle: [
      { kind: 'attack', dmg: 10 },
      { kind: 'hatch', label: 'Couvée accélérée', count: 'all', cast: 'Couvée accélérée' },
      { kind: 'attack', dmg: 10 },
    ],
  },
  oeuf_vashka: {
    id: 'oeuf_vashka', name: 'Œuf noir', hpMin: 15, hpMax: 15, tags: ['dragon'],
    passive: 'Vashka le fait éclore en Dragonnet noir.',
    cycle: [{ kind: 'idle', label: 'Couve' }],
  },

  // --- Boss de fin d'acte ---
  vhaeryx: {
    id: 'vhaeryx', name: 'Vhaeryx', hpMin: 320, hpMax: 320, boss: true, tags: ['dragon'],
    passive: 'À 60 % de PV, il boit son élixir et devient dragon. Sous 20 %, les sbires tombés se relèvent.',
    cycle: [
      { kind: 'attack', dmg: 14 },
      { kind: 'curse', label: 'Malédiction de lignée', lignee: true },
      { kind: 'attack', dmg: 18, cast: 'Concoction instable' },
    ],
    cycle2: [
      { kind: 'attack', dmg: 12, effect: { label: 'Frappe de queue', discard: 1 } },
      { kind: 'attack', dmg: 22, cast: 'Souffle d\'ombre et de flamme', uninterruptible: true, breath: true },
      { kind: 'curse', label: 'Terreur et Malédiction de lignée', panic: 2, lignee: true },
    ],
  },
};

/** Les Souffles de Prismagor (deux sont tirés au hasard au début du combat). */
export const PRISMAGOR_BREATHS: Record<string, { name: string; dmg: number; effect?: { label: string; [k: string]: unknown }; addZone?: number }> = {
  brulant: { name: 'Souffle brûlant', dmg: 12, addZone: 1 },
  corrosif: { name: 'Souffle corrosif', dmg: 6, effect: { label: 'Armure fracassée', fracasse: 2 } },
  glacial: { name: 'Souffle glacial', dmg: 6, effect: { label: 'Gelé : −1 énergie', energyLoss: 1 } },
  foudre: { name: 'Souffle de foudre', dmg: 10, effect: { label: 'Ralenti', ralenti: 2 } },
  chair: { name: 'Souffle de chair', dmg: 6, effect: { label: 'Peste', peste: 3 } },
};

/** Les potions de Grizzik. */
export const GRIZZIK_POTIONS: Record<string, string> = {
  croissance: 'Potion de croissance : +20 PV, et +5 dégâts pendant 3 tours',
  explosive: 'Potion explosive : 16 dégâts à toi, 8 à lui-même',
  transmutation: 'Potion de transmutation : 2 cartes de ta prochaine main deviennent des Fioles instables',
  soins: 'Potion de soins : se soigne de 20 PV',
  vitesse: 'Potion de vitesse : agit deux fois au prochain tour',
};

/** Les Afflictions de sang de Prismagor. */
export const AFFLICTIONS: Record<string, string> = {
  rouge: 'Rouge : 2 dégâts au début de chaque tour',
  bleue: 'Bleue : ta première carte de chaque tour coûte 1 de plus',
  verte: 'Verte : tes soins sont réduits de 50 %',
  noire: 'Noire : tu subis 20 % de dégâts en plus',
  bronze: 'Bronze : tu es Ralenti',
};

export const EASY_ENCOUNTERS_2: Encounter[] = [
  { kind: 'combat', name: 'Les dragonnets noirs', enemies: ['dragonnet', 'dragonnet', 'dragonnet', 'dragonnet'] },
  { kind: 'combat', name: 'Les alchimistes', enemies: ['alchimiste', 'serviteur', 'alchimiste'] },
  { kind: 'combat', name: 'Le couvoir', enemies: ['oeuf', 'drakonide', 'oeuf'] },
  { kind: 'combat', name: 'Le drake d\'os', enemies: ['drake_os'] },
  { kind: 'combat', name: 'Les cobayes', enemies: ['serviteur', 'dragonnet', 'serviteur', 'dragonnet'] },
];

export const HARD_ENCOUNTERS_2: Encounter[] = [
  { kind: 'combat', name: 'La garde de l\'alchimiste', enemies: ['garde_draconique', 'alchimiste'] },
  { kind: 'combat', name: 'La chimère et ses serviteurs', enemies: ['serviteur', 'chimere', 'serviteur'] },
  { kind: 'combat', name: 'La couvée en armes', enemies: ['dragonnet', 'drakonide', 'dragonnet', 'drakonide', 'dragonnet'] },
  { kind: 'combat', name: 'Les expériences', enemies: ['drake_os', 'chimere'] },
  { kind: 'combat', name: 'La patrouille draconique', enemies: ['garde_draconique', 'drakonide', 'alchimiste'] },
];

export const ELITE_ENCOUNTERS_2: Encounter[] = [
  { kind: 'combat', name: 'Skarn, le Gardien des couvées', enemies: ['oeuf_skarn', 'oeuf_skarn', 'skarn', 'oeuf_skarn', 'oeuf_skarn'], enrageTurn: 10, loot: 'skarn' },
  { kind: 'combat', name: 'Ysolde la Rouge', enemies: ['ysolde'], enrageTurn: 10, loot: 'ysolde' },
  { kind: 'combat', name: 'Le Contremaître Draksis', enemies: ['draksis'], enrageTurn: 10, loot: 'draksis' },
  { kind: 'combat', name: 'Les Trois Souffles', enemies: ['drake_braise', 'drake_ombre', 'drake_cendre'], enrageTurn: 10, loot: 'trois_souffles' },
  { kind: 'combat', name: 'Prismagor, l\'Abomination chromatique', enemies: ['prismagor'], enrageTurn: 10, loot: 'prismagor' },
  { kind: 'combat', name: 'Grizzik, l\'Alchimiste fou', enemies: ['grizzik'], enrageTurn: 10, loot: 'grizzik' },
  { kind: 'combat', name: 'Ossyrax, le Drake ressuscité', enemies: ['ossyrax'], enrageTurn: 10, loot: 'ossyrax' },
  { kind: 'combat', name: 'Vashka, la Gardienne des œufs', enemies: ['oeuf_vashka', 'oeuf_vashka', 'oeuf_vashka', 'vashka', 'oeuf_vashka', 'oeuf_vashka', 'oeuf_vashka'], enrageTurn: 10, loot: 'vashka' },
];

export const BOSS_ENCOUNTER_2: Encounter = {
  kind: 'combat', name: 'Vhaeryx, le Dragon-Alchimiste', enemies: ['vhaeryx'], enrageTurn: 16,
};

export const HIDDEN_FIGHTS_2: Encounter[] = [
  { kind: 'combat', name: 'L\'embuscade drakônide', enemies: ['drakonide', 'drakonide'], ambush: true },
  { kind: 'combat', name: 'Le gobelin mimique', enemies: ['mimique_2'], goldReward: [120, 180] },
  { kind: 'combat', name: 'La cage ouverte', enemies: ['chimere'], bonusItem: 'rare', doubleMutation: true },
  { kind: 'combat', name: 'La patrouille de l\'Aire', enemies: ['garde_draconique', 'alchimiste'], bonusItem: 'commun' },
];

// Le Gobelin mimique du chapitre II : plus solide.
ENEMIES_ACTE2.mimique_2 = {
  id: 'mimique_2', name: 'Gobelin mimique', hpMin: 60, hpMax: 60,
  passive: 'S\'il te fait perdre des PV avec Avaler, il te vole 20 or.',
  cycle: [{ kind: 'attack', dmg: 11 }, { kind: 'attack', dmg: 11, stealGold: 20 }],
};
