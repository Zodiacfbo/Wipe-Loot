// Les 9 classes du jeu : la fiche de présentation affichée au choix de la classe.
// Référence : docs/classes/ (une fiche par classe). Le Guerrier, le Mage, le Démoniste, le Prêtre, le Voleur, le Paladin, le Chasseur, le Chaman et le Druide sont jouables : les 9 classes dans le prototype.
import { MAX_LEVEL, levelFromXp } from './xp';

export interface ClassInfo {
  id: string;
  name: string;
  quote: string;
  role: string;
  /** 1 = facile, 3 = difficile. */
  /** Les étoiles : la richesse du jeu (1 simple, 2 intermédiaire, 3 riche), pas les chances de gagner. */
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
  /** Le paquet de départ suit l'arbre principal (celui qui a strictement le plus de points) : cartes remplacées, par arbre. */
  starterSwaps?: Record<string, { from: string; to: string; count: number }>;
  startSpell?: string;
  sprite?: string;
}

export const CLASSES: ClassInfo[] = [
  {
    id: 'guerrier', name: 'Guerrier', color: '#C8402A', playable: true, difficulty: 1, hp: 80,
    starterDeck: ['frappe', 'frappe', 'frappe', 'frappe', 'parade', 'parade', 'parade', 'parade', 'frappe_heroique', 'cri_de_guerre'],
    startSpell: 'charge', sprite: 'guerrier.png',
    quote: 'Chaque coup reçu me rend plus fort. Chaque coup donné rapproche la fin.',
    role: 'Frappe fort, ou encaisse tout', resource: 'Rage (0 à 10) et postures',
    fantasy: 'Démarrer lentement, monter en puissance, puis tout raser avec une Exécution à pleine rage.',
  },
  {
    id: 'mage', name: 'Mage', color: '#4C8FE0', playable: true, difficulty: 2, hp: 72,
    starterDeck: ['trait_de_magie', 'trait_de_magie', 'trait_de_magie', 'trait_de_magie', 'barriere', 'barriere', 'barriere', 'barriere', 'boule_de_feu', 'eclair_de_givre'],
    // 26 novembre 2026 : le paquet était un paquet Arcane, le Feu et le Givre démarraient en retard.
    starterSwaps: { feu: { from: 'trait_de_magie', to: 'roussir', count: 2 }, givre: { from: 'trait_de_magie', to: 'eclair_de_givre', count: 2 } },
    startSpell: 'contresort', sprite: 'mage.png',
    quote: 'Le feu consume, la glace emprisonne, l\'arcane plie le monde. Choisis ta perte.',
    role: 'Commande au feu, à la glace et aux arcanes', resource: 'Gel, Brûlure et charges arcaniques',
    fantasy: 'Geler un seigneur sur place, ou le regarder brûler derrière une Carapace de glace.',
  },
  {
    id: 'paladin', name: 'Paladin', color: '#E6B84A', playable: true, difficulty: 1, hp: 80,
    starterDeck: ['frappe_pal', 'frappe_pal', 'frappe_pal', 'frappe_pal', 'parade_pal', 'parade_pal', 'parade_pal', 'sceau_droiture', 'sceau_droiture', 'lumiere_bienfaisante'],
    startSpell: 'jugement', sprite: 'paladin.png',
    quote: 'Par la lumière, je juge. Par l\'acier, j\'exécute la sentence.',
    role: 'Bouclier, marteau et lumière sacrée', resource: 'Sceaux, Jugements et auras',
    fantasy: 'Un chevalier presque indestructible qui frappe les morts-vivants à coups de Jugements.',
  },
  {
    id: 'voleur', name: 'Voleur', color: '#E8D84A', playable: true, difficulty: 2, hp: 70,
    starterDeck: ['attaque_sinistre', 'attaque_sinistre', 'attaque_sinistre', 'esquive', 'esquive', 'esquive', 'esquive', 'evisceration', 'evisceration', 'embuscade'],
    startSpell: 'sprint', sprite: 'voleur.png',
    quote: 'Tu ne m\'as pas vu arriver. Tu ne me verras pas repartir.',
    role: 'Frappe vite, depuis l\'ombre', resource: 'Points de combo (0 à 5) et Camouflage',
    fantasy: 'Un premier tour parfait depuis l\'ombre, cinq points de combo, et une Éviscération qui achève le seigneur.',
  },
  {
    id: 'chasseur', name: 'Chasseur', color: '#6FB84A', playable: true, difficulty: 3, hp: 70,
    // 27 novembre 2026 : un peu de chaque arbre au départ ; l'arbre principal renforce le sien.
    starterDeck: ['tir', 'tir', 'tir', 'tir', 'repli', 'repli', 'repli', 'tir_ajuste', 'ordre_attaque', 'piege_explosif'],
    starterSwaps: {
      precision: { from: 'ordre_attaque', to: 'tir_ajuste', count: 1 },
      betes: { from: 'tir_ajuste', to: 'ordre_attaque', count: 1 },
      survie: { from: 'tir_ajuste', to: 'piege_venin', count: 1 },
    },
    startSpell: 'tir_arcanique', sprite: 'chasseur.png',
    quote: 'Mon arc vise, ma bête mord. Toi, tu cours.',
    role: 'Tire de loin, et vient à bout des hordes', resource: 'Compagnon animal, pièges et esprits',
    fantasy: 'Un duo inséparable, le chasseur et sa bête, pendant que les pièges s\'occupent des sbires.',
  },
  {
    id: 'pretre', name: 'Prêtre', color: '#E0E0E8', playable: true, difficulty: 2, hp: 70,
    starterDeck: ['chatiment', 'chatiment', 'chatiment', 'chatiment', 'priere_garde', 'priere_garde', 'priere_garde', 'priere_garde', 'soins_rapides', 'murmure_douleur'],
    startSpell: 'egide_sacree', sprite: 'pretre.png',
    quote: 'La lumière protège. L\'ombre dévore. Je porte les deux.',
    role: 'Protège par la lumière, ou ronge par l\'ombre', resource: 'Foi (0 à 10) et Égide',
    fantasy: 'Encaisser tout derrière une Égide, puis foudroyer le seigneur d\'un Courroux céleste à pleine Foi.',
  },
  {
    id: 'demoniste', name: 'Démoniste', color: '#A66BE0', playable: true, difficulty: 3, hp: 74,
    starterDeck: ['trait_ombre', 'trait_ombre', 'trait_ombre', 'trait_ombre', 'garde_sombre', 'garde_sombre', 'garde_sombre', 'garde_sombre', 'corruption', 'siphon_ame'],
    startSpell: 'pacte_de_sang', sprite: 'demoniste.png',
    quote: 'Ma vie est un prix. Ta mort est un gain.',
    role: 'Ronge ses ennemis, et commande aux démons', resource: 'Éclats d\'âme et familier démoniaque',
    fantasy: 'Couvrir un seigneur de malédictions, puis regarder ses PV fondre pendant que son démon le harcèle.',
  },
  {
    id: 'chaman', name: 'Chaman', color: '#3A8EC8', playable: true, difficulty: 3, hp: 75,
    starterDeck: ['eclair', 'eclair', 'frappe_primitive', 'frappe_primitive', 'garde_de_pierre', 'garde_de_pierre', 'garde_de_pierre', 'garde_de_pierre', 'choc_flammes', 'totem_braise'],
    startSpell: 'choc_tellurique', sprite: 'chaman.png',
    quote: 'La terre me porte, le feu me sert, l\'eau me guérit, l\'air me guide.',
    role: 'Appelle la terre, le feu, l\'eau et l\'air', resource: 'Totems (Terre, Feu, Eau, Air)',
    fantasy: 'Quatre totems qui travaillent en continu, pendant que la foudre s\'abat sur le seigneur.',
  },
  {
    id: 'druide', name: 'Druide', color: '#E8742A', playable: true, difficulty: 3, hp: 75,
    starterDeck: ['colere', 'colere', 'colere', 'colere', 'garde_sylvestre', 'garde_sylvestre', 'garde_sylvestre', 'garde_sylvestre', 'coup_de_griffe', 'griffure'],
    startSpell: 'seve_vitale', sprite: 'druide.png',
    quote: 'Je suis l\'ours qui protège, le félin qui chasse, la lune qui foudroie.',
    role: 'Ours, félin ou lune : change de forme', resource: 'Formes (Ours, Félin, Astrale)',
    fantasy: 'Encaisser le gros coup en ours, puis passer en félin au tour suivant pour l\'achever.',
  },
];

export const CLASS_BY_ID: Record<string, ClassInfo> = Object.fromEntries(CLASSES.map((c) => [c.id, c]));

/** La fiche d'une classe (le Guerrier si l'id est inconnu). */
export function classInfo(id: string | undefined): ClassInfo {
  return CLASS_BY_ID[id ?? 'guerrier'] ?? CLASS_BY_ID.guerrier;
}

export interface ClassProfile {
  classes: Record<string, { xp: number }>;
  /** La classe choisie au premier lancement (null : pas encore choisie). */
  startClass: string | null;
  unlockedClasses: string[];
}

/** Le meilleur niveau atteint par l'une des classes du joueur (1 au départ). */
export function bestLevel(profile: ClassProfile): number {
  return Math.max(1, ...Object.values(profile.classes).map((c) => levelFromXp(c.xp).level));
}

/**
 * Combien de classes le joueur a le droit de débloquer en plus de celles qu'il a déjà.
 * La première fois qu'une classe (n'importe laquelle) atteint le niveau N, on peut avoir N classes (9 au plus).
 */
export function unlocksAvailable(profile: ClassProfile): number {
  if (!profile.startClass) return 0;
  const earned = Math.min(CLASSES.length, bestLevel(profile));
  return Math.max(0, earned - profile.unlockedClasses.length);
}

/** Le niveau qui débloquera la prochaine classe (null s'il n'y en a plus à débloquer). */
export function nextUnlockLevel(profile: ClassProfile): number | null {
  const next = Math.max(bestLevel(profile), profile.unlockedClasses.length) + 1;
  return next <= Math.min(CLASSES.length, MAX_LEVEL) ? next : null;
}

/** Choisit la classe de départ (premier lancement). */
export function chooseStartClass(profile: ClassProfile, id: string): boolean {
  if (profile.startClass || !CLASS_BY_ID[id]?.playable) return false;
  profile.startClass = id;
  profile.unlockedClasses = [id];
  return true;
}

/** Débloque une classe au choix, si le meilleur niveau atteint le permet. */
export function unlockClass(profile: ClassProfile, id: string): boolean {
  if (unlocksAvailable(profile) <= 0 || profile.unlockedClasses.includes(id) || !CLASS_BY_ID[id]?.playable) return false;
  profile.unlockedClasses.push(id);
  return true;
}
