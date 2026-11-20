// Les ennemis de l'acte 3 : Irem, la cité ensevelie.
// Référence : docs/actes/ACTE3_IREM.md (§4 ; les boss secondaires et Yzhar viendront ensuite)
import type { EnemyDef, Encounter } from './enemies';

const peste = { label: 'Peste', peste: 3 };

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
