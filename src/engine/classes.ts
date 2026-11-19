// Les 9 classes du jeu : la fiche de présentation affichée au choix de la classe.
// Référence : docs/classes/ (une fiche par classe). Le Guerrier, le Mage, le Démoniste, le Prêtre, le Voleur et le Paladin sont jouables dans le prototype.

export interface ClassInfo {
  id: string;
  name: string;
  quote: string;
  role: string;
  /** 1 = facile, 3 = difficile. */
  difficulty: 1 | 2 | 3;
  hp: number;
  resource: string;
  /** Ce qu'on fait avec cette classe, en une phrase. */
  fantasy: string;
  /** Couleur de la classe (emblème). */
  color: string;
  /** Jouable dans cette version du jeu. */
  playable: boolean;
  /** Le kit de départ (classes jouables) : deck, sort de barre, sprite. */
  starterDeck?: string[];
  startSpell?: string;
  sprite?: string;
}

export const CLASSES: ClassInfo[] = [
  {
    id: 'guerrier', name: 'Guerrier', color: '#C8402A', playable: true, difficulty: 1, hp: 80,
    starterDeck: ['frappe', 'frappe', 'frappe', 'frappe', 'parade', 'parade', 'parade', 'parade', 'frappe_heroique', 'cri_de_guerre'],
    startSpell: 'charge', sprite: 'guerrier.png',
    quote: 'Chaque coup reçu me rend plus fort. Chaque coup donné rapproche la fin.',
    role: 'Dégâts physiques ou tank', resource: 'Rage (0 à 10) et postures',
    fantasy: 'Démarrer lentement, monter en puissance, puis tout raser avec une Exécution à pleine rage.',
  },
  {
    id: 'mage', name: 'Mage', color: '#4C8FE0', playable: true, difficulty: 2, hp: 72,
    starterDeck: ['trait_de_magie', 'trait_de_magie', 'trait_de_magie', 'trait_de_magie', 'barriere', 'barriere', 'barriere', 'barriere', 'boule_de_feu', 'eclair_de_givre'],
    startSpell: 'contresort', sprite: 'mage.png',
    quote: 'Le feu consume, la glace emprisonne, l\'arcane plie le monde. Choisis ta perte.',
    role: 'Dégâts magiques à distance, contrôle', resource: 'Gel, Brûlure et charges arcaniques',
    fantasy: 'Geler un boss sur place, ou le regarder brûler derrière une Carapace de glace.',
  },
  {
    id: 'paladin', name: 'Paladin', color: '#E6B84A', playable: true, difficulty: 1, hp: 80,
    starterDeck: ['frappe_pal', 'frappe_pal', 'frappe_pal', 'frappe_pal', 'parade_pal', 'parade_pal', 'parade_pal', 'parade_pal', 'sceau_droiture', 'lumiere_bienfaisante'],
    startSpell: 'jugement', sprite: 'paladin.png',
    quote: 'Par la lumière, je juge. Par l\'acier, j\'exécute la sentence.',
    role: 'Hybride : dégâts, tank ou survie', resource: 'Sceaux, Jugements et auras',
    fantasy: 'Un chevalier presque indestructible qui frappe les morts-vivants à coups de Jugements.',
  },
  {
    id: 'voleur', name: 'Voleur', color: '#E8D84A', playable: true, difficulty: 2, hp: 70,
    starterDeck: ['attaque_sinistre', 'attaque_sinistre', 'attaque_sinistre', 'attaque_sinistre', 'esquive', 'esquive', 'esquive', 'esquive', 'evisceration', 'embuscade'],
    startSpell: 'sprint', sprite: 'voleur.png',
    quote: 'Tu ne m\'as pas vu arriver. Tu ne me verras pas repartir.',
    role: 'Dégâts physiques rapides, contrôle', resource: 'Points de combo (0 à 5) et Camouflage',
    fantasy: 'Un premier tour parfait depuis l\'ombre, cinq points de combo, et une Éviscération qui achève le boss.',
  },
  {
    id: 'chasseur', name: 'Chasseur', color: '#6FB84A', playable: false, difficulty: 2, hp: 70,
    quote: 'Mon arc vise, ma bête mord. Toi, tu cours.',
    role: 'Dégâts à distance, gestion des adds', resource: 'Compagnon animal, pièges et esprits',
    fantasy: 'Un duo inséparable, le chasseur et sa bête, pendant que les pièges s\'occupent des adds.',
  },
  {
    id: 'pretre', name: 'Prêtre', color: '#E0E0E8', playable: true, difficulty: 2, hp: 70,
    starterDeck: ['chatiment', 'chatiment', 'chatiment', 'chatiment', 'priere_garde', 'priere_garde', 'priere_garde', 'priere_garde', 'soins_rapides', 'murmure_douleur'],
    startSpell: 'egide_sacree', sprite: 'pretre.png',
    quote: 'La lumière protège. L\'ombre dévore. Je porte les deux.',
    role: 'Survie, dégâts sacrés ou d\'ombre', resource: 'Foi (0 à 10) et Égide',
    fantasy: 'Encaisser tout derrière une Égide, puis foudroyer le boss d\'un Courroux céleste à pleine Foi.',
  },
  {
    id: 'demoniste', name: 'Démoniste', color: '#A66BE0', playable: true, difficulty: 3, hp: 74,
    starterDeck: ['trait_ombre', 'trait_ombre', 'trait_ombre', 'trait_ombre', 'garde_sombre', 'garde_sombre', 'garde_sombre', 'garde_sombre', 'corruption', 'siphon_ame'],
    startSpell: 'pacte_de_sang', sprite: 'demoniste.png',
    quote: 'Ma vie est un prix. Ta mort est un gain.',
    role: 'Dégâts dans la durée, invocations', resource: 'Éclats d\'âme et familier démoniaque',
    fantasy: 'Couvrir un boss de malédictions, puis regarder ses PV fondre pendant que son démon le harcèle.',
  },
  {
    id: 'chaman', name: 'Chaman', color: '#3A8EC8', playable: false, difficulty: 3, hp: 75,
    quote: 'La terre me porte, le feu me sert, l\'eau me guérit, l\'air me guide.',
    role: 'Hybride : sorts, mêlée ou survie', resource: 'Totems (Terre, Feu, Eau, Air)',
    fantasy: 'Quatre totems qui travaillent en continu, pendant que la foudre s\'abat sur le boss.',
  },
  {
    id: 'druide', name: 'Druide', color: '#E8742A', playable: false, difficulty: 3, hp: 75,
    quote: 'Je suis l\'ours qui protège, le félin qui chasse, la lune qui foudroie.',
    role: 'Tout à la fois, selon la forme', resource: 'Formes (Ours, Félin, Astrale)',
    fantasy: 'Encaisser le gros coup en ours, puis passer en félin au tour suivant pour l\'achever.',
  },
];

export const CLASS_BY_ID: Record<string, ClassInfo> = Object.fromEntries(CLASSES.map((c) => [c.id, c]));

/** La fiche d'une classe (le Guerrier si l'id est inconnu). */
export function classInfo(id: string | undefined): ClassInfo {
  return CLASS_BY_ID[id ?? 'guerrier'] ?? CLASS_BY_ID.guerrier;
}

/** Expérience totale (toutes classes) qu'il faut pour débloquer la 2e, la 3e… la 9e classe. */
export const CLASS_UNLOCK_XP = [300, 700, 1200, 1800, 2500, 3300, 4200, 5200];

export interface ClassProfile {
  classes: Record<string, { xp: number }>;
  /** La classe choisie au premier lancement (null : pas encore choisie). */
  startClass: string | null;
  unlockedClasses: string[];
}

export function totalXp(profile: ClassProfile): number {
  return Object.values(profile.classes).reduce((a, c) => a + c.xp, 0);
}

/** Combien de classes le joueur a le droit de débloquer en plus de celles qu'il a déjà. */
export function unlocksAvailable(profile: ClassProfile): number {
  if (!profile.startClass) return 0;
  const earned = 1 + CLASS_UNLOCK_XP.filter((x) => totalXp(profile) >= x).length;
  return Math.max(0, earned - profile.unlockedClasses.length);
}

/** Le prochain palier d'expérience totale qui débloque une classe (null s'il n'y en a plus). */
export function nextUnlockAt(profile: ClassProfile): number | null {
  return CLASS_UNLOCK_XP.find((x) => totalXp(profile) < x) ?? null;
}

/** Choisit la classe de départ (premier lancement). */
export function chooseStartClass(profile: ClassProfile, id: string): boolean {
  if (profile.startClass || !CLASS_BY_ID[id]?.playable) return false;
  profile.startClass = id;
  profile.unlockedClasses = [id];
  return true;
}

/** Débloque une classe au choix, si un palier d'expérience le permet. */
export function unlockClass(profile: ClassProfile, id: string): boolean {
  if (unlocksAvailable(profile) <= 0 || profile.unlockedClasses.includes(id) || !CLASS_BY_ID[id]?.playable) return false;
  profile.unlockedClasses.push(id);
  return true;
}
