// Les événements des nœuds « ? », la bénédiction d'entrée de Brégan et les combats cachés de l'acte 1.
// Référence : docs/actes/ACTE1_PROFONDEURS_ARDENTES.md (§7)
// Les conséquences des choix sont appliquées dans run.ts (resolveEvent, chooseBlessing).
import type { Encounter } from './enemies';
import type { RunState } from './types';

export interface EventChoice {
  label: string;
  detail: string;
  /** Si le choix n'est pas possible : la raison, affichée sur le bouton grisé. */
  locked?: (run: RunState) => string | null;
}

export interface EventDef {
  id: string;
  title: string;
  text: string;
  /** Texte spécial pour le Guerrier (les autres classes viendront plus tard). */
  warriorText?: string;
  choices: EventChoice[];
  /** L'événement peut-il apparaître ? */
  available?: (run: RunState) => boolean;
}

const hasCurse = (run: RunState) => run.deck.some((c) => c.id === 'malediction');

export const EVENTS: Record<string, EventDef> = {
  sources: {
    id: 'sources',
    title: 'Les Gardiens des Sources',
    text: 'Des élémentaires d\'eau, prisonniers d\'une coulée de lave, t\'appellent d\'une voix qui ruisselle. « Un serviteur de Vulkhar garde la rune qui nous enchaîne. Abats-le, et l\'eau des profondeurs affaiblira le Souverain. »',
    choices: [
      { label: 'Accepter leur quête', detail: 'Le prochain boss secondaire que tu affronteras porte la rune. Bats-le pour obtenir l\'Eau des profondeurs : Vulkhar commencera affaibli.' },
      { label: 'Refuser', detail: 'Ils te soignent de 10 PV.' },
    ],
    available: (run) => !run.sourcesQuest,
  },
  riviere: {
    id: 'riviere',
    title: 'La rivière de lave',
    text: 'Un passage étroit court au-dessus d\'une rivière de lave. Les pierres sont brûlantes, et certaines bougent quand on s\'y appuie.',
    choices: [
      { label: 'Traverser', detail: 'Perds 8 PV.' },
      { label: 'Faire le détour', detail: 'Le prochain nœud devient un combat difficile.' },
    ],
  },
  forge: {
    id: 'forge',
    title: 'La forge éteinte',
    text: 'Une forge naine abandonnée, à moitié noyée sous la roche. L\'enclume porte encore les runes des rois du mont Durgal.',
    warriorText: 'Sous l\'enclume, enveloppée dans un tissu calciné, tu trouves une lame brisée. Les runes de la garde ne laissent aucun doute : c\'est Brisemonts, l\'épée des anciens rois nains.',
    choices: [
      { label: 'Prendre la Lame brisée', detail: 'Quête légendaire Brisemonts, étape 1 sur 3.', locked: (run) => ((run.classId ?? 'guerrier') === 'guerrier' ? null : 'Réservé au Guerrier') },
      { label: 'Rallumer la forge', detail: 'Perds 6 PV. Améliore 2 cartes au hasard.' },
      { label: 'Fouiller les décombres', detail: 'Gagne 40 or.' },
    ],
  },
  trappeur: {
    id: 'trappeur',
    title: 'Le campement du vieux trappeur',
    text: 'Un vieux chasseur nain, blessé à la jambe, se réchauffe près d\'un feu de braises. « Un coup de main, l\'ami ? »',
    choices: [
      { label: 'Le soigner', detail: 'Perds 1 potion. En échange, il t\'apprend ses astuces de vieux chasseur : +6 PV max.', locked: (run) => (run.potions.some((p) => p) ? null : 'Il te faut une potion') },
      { label: 'L\'ignorer', detail: 'Rien ne se passe.' },
    ],
  },
  cercle: {
    id: 'cercle',
    title: 'Le cercle des anciens',
    text: 'Un cercle de pierres dressées où murmurent des esprits. Leurs voix parlent de la montagne d\'avant le feu.',
    choices: [
      { label: 'Écouter leur sagesse', detail: 'Retire une Malédiction de ton deck.', locked: (run) => (hasCurse(run) ? null : 'Tu n\'as pas de Malédiction') },
      { label: 'Te recueillir', detail: 'Soigne 10 PV.' },
    ],
  },
  chapelle: {
    id: 'chapelle',
    title: 'La chapelle effondrée',
    text: 'Une chapelle naine écrasée par la roche. Sur l\'autel, des offrandes d\'or ont fondu en flaques brillantes.',
    choices: [
      { label: 'Prier', detail: '+5 PV max.' },
      { label: 'Piller l\'autel', detail: 'Gagne 80 or, mais une Malédiction rejoint ton deck.' },
    ],
  },
  fantome: {
    id: 'fantome',
    title: 'Le fantôme du forgeron',
    text: 'Un forgeron spectral martèle une enclume invisible. Il voudrait finir son dernier ouvrage, mais ses mains passent à travers le métal.',
    choices: [
      { label: 'L\'aider', detail: 'Perds 10 PV. Ton arme gagne +2 dégâts pour la run.', locked: (run) => (run.equipment.arme ? null : 'Il te faut une arme équipée') },
      { label: 'Le libérer', detail: 'Il t\'offre un objet d\'équipement rare.', locked: () => 'Réservé au Paladin et au Prêtre' },
      { label: 'Partir', detail: 'Rien ne se passe.' },
    ],
  },
  gobelin: {
    id: 'gobelin',
    title: 'Un gobelin coincé dans un coffre',
    text: 'Un coffre renforcé gigote et jure en gobelin. « Sors-moi de là, et je te ferai un prix ! »',
    choices: [
      { label: 'Le libérer', detail: '50 % : il te donne un objet. 50 % : c\'est un Gobelin mimique !' },
      { label: 'Prendre le coffre et partir', detail: 'Gagne 120 or, mais une Malédiction rejoint ton deck.' },
    ],
  },
  fonceur: {
    id: 'fonceur',
    title: 'Le joueur qui fonce',
    text: 'Un aventurier fonce dans un pack de Molosses en hurlant son propre nom. Il est clairement en train de perdre.',
    choices: [
      { label: 'L\'aider', detail: 'Un combat difficile, puis il te donne un objet rare.' },
      { label: 'Le laisser', detail: 'Rien ne se passe. On entend un wipe au loin.' },
    ],
  },
  source_chaude: {
    id: 'source_chaude',
    title: 'La source chaude',
    text: 'Entre deux coulées de lave, une source d\'eau claire jaillit de la roche. Elle est brûlante, mais elle sent les herbes des montagnes.',
    choices: [
      { label: 'Boire', detail: 'Soigne 15 PV.' },
      { label: 'Passer ton chemin', detail: 'Rien ne se passe.' },
    ],
  },
  cadavre: {
    id: 'cadavre',
    title: 'Le raideur tombé',
    text: 'Un aventurier gît contre la paroi, son sac encore sur le dos. Il n\'a pas survécu à son dernier wipe. La roche autour de lui est encore chaude.',
    choices: [
      { label: 'Fouiller le sac', detail: 'Perds 6 PV. Choisis une carte parmi 3.' },
      { label: 'Le laisser reposer', detail: 'Rien ne se passe.' },
    ],
  },
};

// --- Combats cachés derrière un « ? » ---

export const HIDDEN_FIGHTS: Encounter[] = [
  { kind: 'combat', name: 'L\'embuscade cendreuse', enemies: ['eclaireur', 'eclaireur', 'eclaireur'], ambush: true },
  { kind: 'combat', name: 'Le gobelin mimique', enemies: ['mimique'], goldReward: [100, 150] },
  { kind: 'combat', name: 'La patrouille de la flamme', enemies: ['pretre', 'seigneur'], bonusItem: 'commun' },
];

// --- La bénédiction d'entrée : Brégan le Passeur ---

export interface BlessingDef {
  id: string;
  name: string;
  text: string;
}

export const BLESSINGS: Record<string, BlessingDef> = {
  provisions: { id: 'provisions', name: 'Provisions', text: '+8 PV max.' },
  bourse: { id: 'bourse', name: 'Bourse de la guilde', text: '+100 or.' },
  potions: { id: 'potions', name: 'Potions de route', text: '2 potions au hasard.' },
  entrainement: { id: 'entrainement', name: 'Entraînement', text: 'Améliore 2 cartes au hasard.' },
  allegement: { id: 'allegement', name: 'Allègement', text: 'Retire 1 carte de ton deck.' },
  pret: { id: 'pret', name: 'Équipement de prêt', text: 'Un objet d\'équipement commun au hasard.' },
  pari: { id: 'pari', name: 'Pari risqué', text: 'Perds 10 % de tes PV max. Choisis un objet rare parmi 3.' },
  marche: { id: 'marche', name: 'Marché de l\'ombre', text: 'Une Malédiction permanente rejoint ton deck. Gagne 200 or.' },
};
