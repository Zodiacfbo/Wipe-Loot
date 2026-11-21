// Les ennemis de l'acte 3 : Irem, la cité ensevelie.
// Référence : docs/actes/ACTE3_IREM.md (§4, §6, §7 et §8.2)
import type { EnemyDef, Encounter } from './enemies';

const peste = { label: 'Peste', peste: 3 };
const toxine = { label: 'Toxine', toxine: 3 };

export const ENEMIES_ACTE3: Record<string, EnemyDef> = {
  // --- Trash ---
  scarabee: {
    id: 'scarabee', name: 'Scarabée de la ruche', hpMin: 10, hpMax: 10, tags: ['insecte'],
    passive: 'Nuée : quand un scarabée meurt, les autres gagnent 1 Puissance.',
    cycle: [{ kind: 'attack', dmg: 3 }],
  },
  soldat_irem: {
    id: 'soldat_irem', name: 'Soldat d\'Irem', hpMin: 40, hpMax: 40, tags: ['insecte'],
    cycle: [
      { kind: 'attack', dmg: 10 },
      { kind: 'block', amount: 12 },
      { kind: 'attack', dmg: 8, pierce: true },
    ],
  },
  pretre_insecte: {
    id: 'pretre_insecte', name: 'Prêtre-insecte', hpMin: 28, hpMax: 28, tags: ['insecte'],
    cycle: [
      { kind: 'curse', label: 'Murmures', folie: 2 },
      { kind: 'heal', amount: 12, cast: 'Soins de la ruche' },
      { kind: 'curse', label: 'Vision du dieu', folie: 4, cast: 'Vision du dieu' },
    ],
  },
  momie: {
    id: 'momie', name: 'Momie d\'Irem', hpMin: 38, hpMax: 38, tags: ['mortvivant'],
    cycle: [
      { kind: 'attack', dmg: 8, effect: peste },
      { kind: 'curse', label: 'Malédiction des sables', sable: 2 },
      { kind: 'attack', dmg: 8 },
    ],
  },
  ver_mineur: {
    id: 'ver_mineur', name: 'Ver des sables mineur', hpMin: 35, hpMax: 35, tags: ['insecte'],
    passive: 'S\'enfouit dans le sable, puis resurgit avec une attaque violente.',
    cycle: [
      { kind: 'burrow', turns: 1, label: 'S\'enfouit' },
      { kind: 'attack', dmg: 13 },
      { kind: 'attack', dmg: 8 },
    ],
  },
  gardien_obsidienne: {
    id: 'gardien_obsidienne', name: 'Gardien d\'obsidienne', hpMin: 60, hpMax: 60, tags: ['construct'], resist: 'sorts',
    cycle: [
      { kind: 'attack', dmg: 14 },
      { kind: 'block', amount: 15 },
      { kind: 'attack', dmg: 14 },
    ],
  },
  tentacule: {
    id: 'tentacule', name: 'Tentacule oculaire', hpMin: 20, hpMax: 20, tags: ['aberration'], resist: 'attaques',
    cycle: [{ kind: 'attack', dmg: 6, effect: { label: 'Regard', folie: 1 } }],
  },
  garde_royale: {
    id: 'garde_royale', name: 'Garde royale scarabée', hpMin: 55, hpMax: 55, tags: ['insecte'],
    cycle: [
      { kind: 'attack', dmg: 9, times: 2 },
      { kind: 'buff', puissance: 2, target: 'allies' },
      { kind: 'attack', dmg: 14 },
    ],
  },

  // --- Boss secondaires (§6) ---
  mehkar: {
    id: 'mehkar', name: 'Le Prophète Méhkar', hpMin: 100, hpMax: 100, elite: true, tags: ['insecte'],
    passive: 'À 75 %, 50 % et 25 % de PV, il crée 2 Copies de lui-même : on ne sait plus lequel est le vrai, jusqu\'à ce qu\'il soit touché.',
    cycle: [
      { kind: 'attack', dmg: 12, label: 'Explosion arcanique' },
      { kind: 'curse', label: 'Murmures', folie: 2 },
      { kind: 'curse', label: 'Domination mentale', cast: 'Domination mentale', domination: true },
    ],
  },
  mehkar_copie: {
    id: 'mehkar_copie', name: 'Le Prophète Méhkar', hpMin: 15, hpMax: 15, tags: ['insecte'], copyOf: 'mehkar',
    passive: 'Une Copie : elle disparaît dès qu\'elle subit 15 dégâts, et frappe moitié moins fort.',
    cycle: [
      { kind: 'attack', dmg: 6, label: 'Explosion arcanique' },
      { kind: 'curse', label: 'Murmures', folie: 1 },
      { kind: 'curse', label: 'Domination mentale', cast: 'Domination mentale', domination: true },
    ],
  },
  asheth: {
    id: 'asheth', name: 'Asheth', hpMin: 80, hpMax: 80, elite: true, tags: ['insecte'], immune: 'sorts',
    passive: 'Lien des jumeaux : s\'il meurt et que Neshet vit encore 2 tours plus tard, il est ressuscité. Les Rois échangent leurs immunités tous les 3 tours.',
    cycle: [
      { kind: 'attack', dmg: 12, label: 'Frappe royale' },
      { kind: 'attack', dmg: 10, label: 'Charge', effect: { label: 'Ralenti', ralenti: 1 } },
    ],
  },
  neshet: {
    id: 'neshet', name: 'Neshet', hpMin: 80, hpMax: 80, elite: true, tags: ['insecte'], immune: 'attaques',
    passive: 'Lien des jumeaux : s\'il meurt et qu\'Asheth vit encore 2 tours plus tard, il est ressuscité. Les Rois échangent leurs immunités tous les 3 tours.',
    cycle: [
      { kind: 'attack', dmg: 10, label: 'Explosion d\'ombre' },
      { kind: 'attack', dmg: 20, cast: 'Trait du néant' },
    ],
  },
  gharul: {
    id: 'gharul', name: 'Gharul, le Ver des sables', hpMin: 140, hpMax: 140, elite: true, tags: ['insecte'],
    passive: 'Grondement : tant qu\'il est enseveli, une carte Sable arrive dans ta main au début de chacun de tes tours.',
    cycle: [
      { kind: 'attack', dmg: 14, label: 'Morsure' },
      { kind: 'attack', dmg: 8, label: 'Balayage de queue', effect: { label: 'Balayage de queue', discard: 1 } },
      { kind: 'burrow', turns: 2, label: 'S\'enfouit' },
      { kind: 'attack', dmg: 24, label: 'Surgissement' },
    ],
  },
  kesh: {
    id: 'kesh', name: 'Kesh', hpMin: 60, hpMax: 60, elite: true, tags: ['insecte'],
    passive: 'Vengeance royale : quand un enfant de la ruche meurt, les autres se soignent de 20 PV et frappent 50 % plus fort.',
    cycle: [
      { kind: 'attack', dmg: 10, label: 'Charge' },
      { kind: 'block', amount: 15 },
      { kind: 'attack', dmg: 10, label: 'Charge' },
    ],
  },
  vorra: {
    id: 'vorra', name: 'Vorra', hpMin: 45, hpMax: 45, elite: true, tags: ['insecte'],
    passive: 'Vengeance royale : quand un enfant de la ruche meurt, les autres se soignent de 20 PV et frappent 50 % plus fort.',
    cycle: [
      { kind: 'heal', amount: 15, cast: 'Soins royaux', all: true },
      { kind: 'curse', label: 'Cri de terreur', panic: 2 },
    ],
  },
  tazz: {
    id: 'tazz', name: 'Tazz', hpMin: 40, hpMax: 40, elite: true, tags: ['insecte'],
    passive: 'Vengeance royale : quand un enfant de la ruche meurt, les autres se soignent de 20 PV et frappent 50 % plus fort.',
    cycle: [
      { kind: 'attack', dmg: 6, label: 'Dard', effect: toxine },
      { kind: 'attack', dmg: 6, label: 'Dard', effect: toxine },
      { kind: 'attack', dmg: 4, label: 'Nuage de venin', effect: toxine },
    ],
  },
  limon: {
    id: 'limon', name: 'Le Limon primordial', hpMin: 110, hpMax: 110, elite: true, tags: ['aberration'],
    passive: 'Corps visqueux : −50 % de dégâts. Figeage : 5 débuffs le Figent 2 tours (il n\'agit plus, double dégâts). À 0 PV, s\'il n\'est pas Figé, il se divise en 3.',
    cycle: [
      { kind: 'attack', dmg: 8, label: 'Globule toxique', effect: toxine },
      { kind: 'heal', amount: 15, cast: 'Absorption', self: true },
      { kind: 'attack', dmg: 10, label: 'Vague de limon' },
    ],
  },
  limon_mineur: {
    id: 'limon_mineur', name: 'Limon mineur', hpMin: 20, hpMax: 20, tags: ['aberration'],
    cycle: [{ kind: 'attack', dmg: 5, label: 'Globule toxique', effect: toxine }],
  },
  sartaq: {
    id: 'sartaq', name: 'Sartaq, le Colosse d\'obsidienne', hpMin: 160, hpMax: 160, elite: true, tags: ['construct'],
    passive: 'Suprématie : +25 blocage au début de chacun de ses tours. Tous les 3 tours, un Cristal d\'obsidienne arrive dans ta main.',
    cycle: [
      { kind: 'attack', dmg: 16, label: 'Écrasement' },
      { kind: 'attack', dmg: 8, label: 'Tempête de sable', effect: { label: 'Tempête de sable', sableHand: 2 } },
      { kind: 'attack', dmg: 10, label: 'Piétinement', effect: { label: 'Ralenti', ralenti: 1 } },
    ],
  },
  nebet: {
    id: 'nebet', name: 'Nebet, l\'Oracle aveugle', hpMin: 95, hpMax: 95, elite: true, tags: ['insecte'],
    passive: 'Chœur des murmures : au début de chacun de ses tours, tu gagnes 2 Folie (3 sous 50 % de PV).',
    cycle: [
      { kind: 'attack', dmg: 10, label: 'Fouet de l\'esprit' },
      { kind: 'curse', label: 'Vision partagée', hallucinations: 2 },
      { kind: 'attack', dmg: 8, label: 'Regard du dieu', madBonus: 12 },
    ],
  },

  // --- Le boss final (§7) : la mécanique est dans yzhar.ts ---
  yzhar: {
    id: 'yzhar', name: 'L\'Œil d\'Yzhar', hpMin: 200, hpMax: 200, boss: true, tags: ['aberration'],
    passive: 'Te donne 1 Folie à chacun de ses tours. Tous les 2 tours, un Tentacule oculaire. Quand l\'Œil se ferme, ses Tentacules aussi, et le Corps se réveille.',
    passive2: 'Quand il t\'avale, tue les 2 Tentacules intérieurs : sa Carapace divine tombe 3 tours (double dégâts).',
    cycle: [
      { kind: 'attack', dmg: 8, label: 'Rayon oculaire', effect: { label: 'Rayon oculaire', petStun: 1 } },
      { kind: 'attack', dmg: 8, label: 'Rayon oculaire', effect: { label: 'Rayon oculaire', petStun: 1 } },
      { kind: 'curse', label: 'Regard sombre', cast: 'Regard sombre', regard: 3, uninterruptible: true },
    ],
    cycle2: [
      { kind: 'attack', dmg: 12, label: 'Coup de tentacule géant' },
      { kind: 'curse', label: 'Murmures', folie: 2 },
      { kind: 'attack', dmg: 12, label: 'Coup de tentacule géant' },
      { kind: 'curse', label: 'Avaler', cast: 'Avaler', swallow: true, uninterruptible: true },
    ],
  },
  tentacule_geant: {
    id: 'tentacule_geant', name: 'Tentacule géant', hpMin: 30, hpMax: 30, tags: ['aberration'], resist: 'sorts',
    cycle: [{ kind: 'attack', dmg: 10, label: 'Coup' }],
  },
  tentacule_interieur: {
    id: 'tentacule_interieur', name: 'Tentacule intérieur', hpMin: 25, hpMax: 25, tags: ['aberration'],
    passive: 'Tue les deux avant d\'être recraché : la Carapace divine tombe pendant 3 tours.',
    cycle: [{ kind: 'attack', dmg: 5, label: 'Étreinte' }],
  },
};

export const EASY_ENCOUNTERS_3: Encounter[] = [
  { kind: 'combat', name: 'La nuée', enemies: ['scarabee', 'scarabee', 'scarabee', 'scarabee', 'scarabee'] },
  { kind: 'combat', name: 'Les soldats d\'Irem', enemies: ['soldat_irem', 'soldat_irem'] },
  { kind: 'combat', name: 'Le prêtre et sa ruche', enemies: ['scarabee', 'pretre_insecte', 'scarabee', 'scarabee'] },
  { kind: 'combat', name: 'Les momies', enemies: ['momie', 'momie'] },
  { kind: 'combat', name: 'Ce qui rampe sous le sable', enemies: ['tentacule', 'ver_mineur', 'tentacule'] },
];

export const HARD_ENCOUNTERS_3: Encounter[] = [
  { kind: 'combat', name: 'Le gardien et ses yeux', enemies: ['tentacule', 'gardien_obsidienne', 'tentacule', 'tentacule'] },
  { kind: 'combat', name: 'La garde royale', enemies: ['scarabee', 'scarabee', 'garde_royale', 'scarabee', 'scarabee'] },
  { kind: 'combat', name: 'Le conclave', enemies: ['pretre_insecte', 'soldat_irem', 'pretre_insecte'] },
  { kind: 'combat', name: 'Les sables vivants', enemies: ['ver_mineur', 'momie', 'ver_mineur'] },
  { kind: 'combat', name: 'La garde du temple', enemies: ['garde_royale', 'pretre_insecte', 'gardien_obsidienne'] },
];

export const ELITE_ENCOUNTERS_3: Encounter[] = [
  { kind: 'combat', name: 'Le Prophète Méhkar', enemies: ['mehkar'], enrageTurn: 10, loot: 'mehkar' },
  { kind: 'combat', name: 'Les Rois-Jumeaux Asheth et Neshet', enemies: ['asheth', 'neshet'], enrageTurn: 10, loot: 'rois_jumeaux' },
  { kind: 'combat', name: 'Gharul, le Ver des sables', enemies: ['gharul'], enrageTurn: 10, loot: 'gharul' },
  { kind: 'combat', name: 'La Triade de la Ruche', enemies: ['kesh', 'vorra', 'tazz'], enrageTurn: 10, loot: 'triade' },
  { kind: 'combat', name: 'Le Limon primordial', enemies: ['limon'], enrageTurn: 10, loot: 'limon' },
  { kind: 'combat', name: 'Sartaq, le Colosse d\'obsidienne', enemies: ['sartaq'], enrageTurn: 10, loot: 'sartaq' },
  { kind: 'combat', name: 'Nebet, l\'Oracle aveugle', enemies: ['nebet'], enrageTurn: 10, loot: 'nebet' },
];

export const BOSS_ENCOUNTER_3: Encounter = {
  kind: 'combat', name: 'Yzhar, le Dieu dormant', enemies: ['yzhar'], enrageTurn: 18,
};

/** Les combats cachés derrière un « ? » (§8.2). */
export const HIDDEN_FIGHTS_3: Encounter[] = [
  { kind: 'combat', name: 'L\'embuscade du sable', enemies: ['ver_mineur', 'ver_mineur'], ambush: true },
  { kind: 'combat', name: 'Le gobelin mimique', enemies: ['mimique_3'], goldReward: [150, 220] },
  { kind: 'combat', name: 'Le cauchemar', enemies: ['tentacule', 'tentacule', 'pretre_insecte', 'tentacule', 'tentacule'], startFolie: 4, bonusItem: 'commun' },
  { kind: 'combat', name: 'La garde du temple', enemies: ['garde_royale', 'gardien_obsidienne'], bonusItem: 'rare' },
];

// Le Gobelin mimique de l'acte 3 : encore plus solide.
ENEMIES_ACTE3.mimique_3 = {
  id: 'mimique_3', name: 'Gobelin mimique', hpMin: 75, hpMax: 75,
  passive: 'S\'il te fait perdre des PV avec Avaler, il te vole 25 or.',
  cycle: [{ kind: 'attack', dmg: 13, label: 'Morsure' }, { kind: 'attack', dmg: 13, label: 'Avaler', stealGold: 25 }],
};

/** Les réglages d'Yzhar (à ajuster au lot 5). */
export const YZHAR = {
  bodyHp: 260, // le Corps (l'Œil : les PV de sa fiche) ; la fiche disait 340
  folie: 1, // Folie à chacun de ses tours
  eyeTentacles: 1, // Tentacules oculaires tous les 2 tours (phase 1) ; la fiche disait 2
  maxTentacles: 3,
  maxGiants: 1, // Tentacules géants en vie au maximum (phase 2)
  giantEvery: 3, // un Tentacule géant tous les N tours (la fiche disait 2)
  regardDmg: 10, // Regard sombre, si tu ne te mets pas à couvert
  carapace: 0.5, // le Corps ne subit que 50 % des dégâts (la fiche disait 25 %)
  carapaceDownMult: 2, // … et double dégâts quand la Carapace est tombée
  carapaceDownTurns: 3,
  swallowTurns: 2,
  swallowHand: 3, // cartes en main dans les entrailles
  sucs: 4, // dégâts des Sucs digestifs à chacun de tes tours dans les entrailles
  innerTentacles: 2,
};

/** Les réglages des boss secondaires d'Irem (à ajuster au lot 5). */
export const IREM = {
  mehkarCopies: 2, // copies créées à chaque palier (75 %, 50 %, 25 %)
  twinsSwapEvery: 3, // les Rois-Jumeaux échangent leurs immunités tous les N tours
  twinsReviveDelay: 2, // tours avant la résurrection du jumeau tombé
  twinsReviveRatio: 0.3,
  vengeanceHeal: 20, // Vengeance royale
  vengeanceDamage: 1.5,
  limonStacks: 5, // cumuls de Figeage pour être Figé
  limonFrozenTurns: 2,
  limonSplit: 3,
  sartaqBlock: 25, // Suprématie
  sartaqCrystalEvery: 3,
  sartaqCrystalTurns: 2, // Armure fracassée et Suprématie suspendue
  nebetFolie: 2,
  nebetFolieLow: 3,
};
