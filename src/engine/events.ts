// Les événements des nœuds « ? », la bénédiction d'entrée de Brégan et les combats cachés du chapitre I.
// Référence : docs/actes/ACTE1_PROFONDEURS_ARDENTES.md (§7)
// Les conséquences des choix sont appliquées dans run.ts (resolveEvent, chooseBlessing).
import type { Encounter } from './enemies';
import { ITEMS } from './items';
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
  /** L'acte où il se trouve (1 par défaut). */
  act?: number;
  /** Une étape de quête légendaire : il passe avant les autres événements (ou seulement pour certaines runs). */
  quest?: boolean | ((run: RunState) => boolean);
}

const hasCurse = (run: RunState) => run.deck.some((c) => c.id === 'malediction');

export const EVENTS: Record<string, EventDef> = {
  sources: {
    id: 'sources',
    title: 'Les Gardiens des Sources',
    text: 'Des élémentaires d\'eau, prisonniers d\'une coulée de lave, t\'appellent d\'une voix qui ruisselle. « Un serviteur de Vulkhar garde la rune qui nous enchaîne. Abats-le, et l\'eau des profondeurs affaiblira le Souverain. »',
    choices: [
      { label: 'Accepter leur quête', detail: 'Le prochain gardien que tu affronteras porte la rune. Bats-le pour obtenir l\'Eau des profondeurs : Vulkhar commencera affaibli.' },
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
      { label: 'Prendre la Lame brisée', detail: 'Quête légendaire Brisemonts, étape 1 sur 3.', locked: (run) => ((run.classId ?? 'guerrier') !== 'guerrier' ? 'Réservé au Guerrier' : run.brisemonts ? 'Tu l\'as déjà' : null) },
      { label: 'Rallumer la forge', detail: 'Perds 6 PV. Améliore 2 cartes au hasard.' },
      { label: 'Fouiller les décombres', detail: 'Gagne 40 or.' },
    ],
  },
  trappeur: {
    id: 'trappeur',
    // Pour le Chasseur, le vieux trappeur garde le Bois ancien : il passe avant les autres événements.
    quest: (run) => run.classId === 'chasseur' && !run.corde,
    title: 'Le campement du vieux trappeur',
    text: 'Un vieux chasseur nain, blessé à la jambe, se réchauffe près d\'un feu de braises. « Un coup de main, l\'ami ? »',
    choices: [
      { label: 'Le soigner', detail: 'Perds 1 potion. En échange, il t\'apprend ses astuces de vieux chasseur : +6 PV max.', locked: (run) => (run.potions.some((p) => p) ? null : 'Il te faut une potion') },
      { label: 'L\'ignorer', detail: 'Rien ne se passe.' },
      { label: 'Parler chasse avec lui', detail: 'Il te confie le Bois ancien : quête légendaire Corde-des-anciens, étape 1 sur 3.', locked: (run) => (run.classId !== 'chasseur' ? 'Réservé au Chasseur' : run.corde ? 'Tu l\'as déjà' : null) },
    ],
  },
  cercle: {
    // Pour le Chaman, les esprits du cercle gardent la Tête du marteau : il passe avant les autres événements.
    quest: (run) => run.classId === 'chaman' && !run.marteau,
    id: 'cercle',
    title: 'Le cercle des anciens',
    text: 'Un cercle de pierres dressées où murmurent des esprits. Leurs voix parlent de la montagne d\'avant le feu.',
    choices: [
      { label: 'Écouter leur sagesse', detail: 'Retire une Malédiction de ton paquet.', locked: (run) => (hasCurse(run) ? null : 'Tu n\'as pas de Malédiction') },
      { label: 'Te recueillir', detail: 'Soigne 10 PV.' },
      { label: 'Appeler les esprits des chamans', detail: 'Ils te confient la Tête du marteau : quête légendaire le Marteau des ancêtres, étape 1 sur 3.', locked: (run) => (run.classId !== 'chaman' ? 'Réservé au Chaman' : run.marteau ? 'Tu l\'as déjà' : null) },
    ],
  },
  chapelle: {
    id: 'chapelle',
    title: 'La chapelle effondrée',
    text: 'Une chapelle naine écrasée par la roche. Sur l\'autel, des offrandes d\'or ont fondu en flaques brillantes.',
    choices: [
      { label: 'Prier', detail: '+5 PV max.' },
      { label: 'Piller l\'autel', detail: 'Gagne 80 or, mais une Malédiction rejoint ton paquet.' },
      { label: 'Fouiller sous les décombres', detail: 'Tu trouves le Bâton nu : quête légendaire Équinoxe, étape 1 sur 3.', locked: (run) => (run.classId !== 'pretre' ? 'Réservé au Prêtre' : run.equinoxe ? 'Tu l\'as déjà' : null) },
    ],
  },
  fantome: {
    id: 'fantome',
    title: 'Le fantôme du forgeron',
    text: 'Un forgeron spectral martèle une enclume invisible. Il voudrait finir son dernier ouvrage, mais ses mains passent à travers le métal.',
    choices: [
      { label: 'L\'aider', detail: 'Perds 10 PV. Ton arme gagne +2 dégâts pour l\'expédition.', locked: (run) => (run.equipment.arme ? null : 'Il te faut une arme équipée') },
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
      { label: 'Prendre le coffre et partir', detail: 'Gagne 120 or, mais une Malédiction rejoint ton paquet.' },
    ],
  },
  fonceur: {
    id: 'fonceur',
    title: 'Le joueur qui fonce',
    text: 'Un aventurier fonce dans un pack de Molosses en hurlant son propre nom. Il est clairement en train de perdre.',
    choices: [
      { label: 'L\'aider', detail: 'Un combat difficile, puis il te donne un objet rare.' },
      { label: 'Le laisser', detail: 'Rien ne se passe. On entend une expédition entière tomber au loin.' },
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
    text: 'Un aventurier gît contre la paroi, son sac encore sur le dos. Il ne s\'est pas relevé de sa dernière chute. La roche autour de lui est encore chaude.',
    choices: [
      { label: 'Fouiller le sac', detail: 'Perds 6 PV. Choisis une carte parmi 3.' },
      { label: 'Le laisser reposer', detail: 'Rien ne se passe.' },
    ],
  },

  // --- Acte 2 : l'Aire de Vhaeryx ---
  oeufs: {
    id: 'oeufs', act: 2,
    title: 'Les œufs de dragon',
    text: 'Une salle chaude et humide, remplie d\'œufs noirs qui palpitent doucement. Certains commencent déjà à se fendre.',
    choices: [
      { label: 'Les détruire', detail: 'Un combat contre 4 Dragonnets noirs, puis un objet d\'équipement.' },
      { label: 'Les laisser', detail: 'Rien sur le moment… mais Vhaeryx aura un add de plus à chaque vague.' },
    ],
  },
  observatoire: {
    id: 'observatoire', act: 2,
    title: 'L\'observatoire en ruine',
    text: 'Une tour d\'astronome à moitié effondrée, ouverte sur le ciel. Au centre, l\'esprit d\'un vieil homme flotte au-dessus d\'un télescope brisé : le Veilleur.',
    choices: [
      { label: 'Prouver ta sagesse au Veilleur', detail: 'Perds 8 PV max. Obtiens la Tête du bâton (quête du Bâton du Veilleur, étape 2).', locked: (run) => (!['mage', 'demoniste', 'druide'].includes(run.classId) ? 'Réservé au Mage, au Démoniste et au Druide' : run.veilleur !== 'fragment' ? 'Il te faut le Fragment du Veilleur (Zhaal)' : null) },
      { label: 'Regarder les étoiles', detail: 'Pendant les 3 prochains combats, tu vois les deux prochaines intentions des ennemis.' },
      { label: 'Fouiller la tour', detail: 'Gagne 60 or.' },
    ],
  },
  appel: {
    id: 'appel', act: 2, quest: true,
    title: 'L\'appel des éléments',
    text: 'Au cœur d\'un cratère, la terre tremble, le feu gronde, l\'eau bout et le vent hurle. Les éléments ont senti ton marteau. Pour le bénir, ils veulent te voir combattre.',
    choices: [
      { label: 'Accepter l\'épreuve', detail: 'Un combat contre des élémentaires de lave. Si tu gagnes, le Marteau des ancêtres remplace ton arme.' },
      { label: 'Refuser', detail: 'Rien ne se passe.' },
    ],
    available: (run) => run.classId === 'chaman' && run.marteau === 'manche',
  },
  ventor: {
    id: 'ventor', act: 2, quest: true,
    title: 'Ventor, Prince des tempêtes',
    text: 'Au sommet d\'un piton battu par les vents, un géant de foudre est enchaîné à la roche. Ses chaînes portent deux serrures vides, de la forme exacte de tes fermoirs. « Libère-moi, voleur, et je forgerai pour toi une lame que l\'orage lui-même jalousera. »',
    choices: [
      { label: 'Libérer Ventor', detail: 'Il forge Sillon d\'orage (arme légendaire), qui remplace ton arme.' },
      { label: 'Garder les fermoirs pour toi', detail: 'Tu les revends : 75 or.' },
    ],
    available: (run) => run.classId === 'voleur' && run.sillon === 'deux',
  },
  reliquaire: {
    id: 'reliquaire', act: 2,
    // Pour le Paladin, la crypte cache la Lame ternie : elle passe avant les autres événements.
    quest: (run) => run.classId === 'paladin' && !run.aurore,
    title: 'Le reliquaire profané',
    text: 'Une crypte où Vhaeryx entasse les reliques volées aux temples de la vallée. L\'air y est lourd de prières oubliées.',
    choices: [
      { label: 'Purifier le reliquaire', detail: 'Retire une Malédiction de ton paquet.', locked: (run) => (hasCurse(run) ? null : 'Tu n\'as pas de Malédiction') },
      { label: 'Le piller', detail: 'Gagne 100 or, mais une Malédiction rejoint ton paquet.' },
      { label: 'Descendre au fond de la crypte', detail: 'Tu trouves la Lame ternie : quête légendaire l\'Aurore ardente, étape 1 sur 3.', locked: (run) => (run.classId !== 'paladin' ? 'Réservé au Paladin' : run.aurore ? 'Tu l\'as déjà' : null) },
    ],
  },
  laboratoire: {
    id: 'laboratoire', act: 2,
    title: 'Le laboratoire abandonné',
    text: 'Des alambics encore tièdes, et des fioles intactes alignées sur une table. Les étiquettes sont écrites dans une langue que personne ne parle plus.',
    choices: [
      { label: 'Boire une fiole inconnue', detail: 'Au hasard : +6 PV max, une carte améliorée, perds 8 PV, ou Toxine au prochain combat.' },
      { label: 'Tout emporter', detail: 'Gagne 2 potions au hasard (si tu as de la place).' },
      { label: 'Partir', detail: 'Rien ne se passe.' },
    ],
  },
  dragonnet_cage: {
    id: 'dragonnet_cage', act: 2,
    title: 'Le dragonnet en cage',
    text: 'Dans une cage rouillée, un tout petit dragonnet noir te regarde avec de grands yeux. Il crache une flammèche, plein d\'espoir.',
    choices: [
      { label: 'Le libérer', detail: 'Il te suit : objet Dragonnet de compagnie (3 dégâts à un ennemi à la fin de chacun de tes tours).' },
      { label: 'Le vendre au gobelin du coin', detail: 'Gagne 90 or.' },
      { label: 'Le laisser', detail: 'Rien ne se passe.' },
    ],
  },
  cobayes: {
    id: 'cobayes', act: 2,
    title: 'Le marchand de cobayes',
    text: 'Un gobelin en blouse tachée t\'accoste : « Des échantillons ! J\'achète, je vends, je ne pose pas de questions. »',
    choices: [
      { label: 'Vendre ton sang', detail: 'Perds 6 PV max. Gagne 100 or.' },
      { label: 'Acheter un sérum (60 or)', detail: '+1 Puissance au début de chaque combat de ce chapitre.', locked: (run) => (run.gold >= 60 ? null : 'Il te faut 60 or') },
      { label: 'Partir', detail: 'Rien ne se passe.' },
    ],
  },
  autel: {
    id: 'autel', act: 2,
    title: 'L\'autel chromatique',
    text: 'Cinq vasques de sang de dragon, chacune d\'une couleur. Boire l\'une d\'elles te marquera jusqu\'à la fin du chapitre.',
    choices: [
      { label: 'Rouge', detail: '+1 Puissance au début de chaque combat. −5 PV max.' },
      { label: 'Bleue', detail: 'Pioche 1 carte de plus au premier tour de chaque combat. −1 emplacement de potion.' },
      { label: 'Verte', detail: 'Soigne 3 PV après chaque combat gagné.' },
      { label: 'Noire', detail: 'Tes Attaques et tes Sorts infligent +2 dégâts. Tu subis 2 dégâts de plus par attaque reçue.' },
      { label: 'Ne rien boire', detail: 'Rien ne se passe.' },
    ],
  },
  fantome_raideur: {
    id: 'fantome_raideur', act: 2,
    title: 'Le fantôme du raideur',
    text: 'Le fantôme d\'un aventurier tombé lors d\'une expédition précédente erre près de son équipement. Il ne semble pas vouloir le garder.',
    choices: [
      { label: 'Récupérer son équipement', detail: 'Un objet d\'équipement au hasard, mais une Malédiction rejoint ton paquet.' },
      { label: 'Le laisser reposer', detail: 'Soigne 12 PV.' },
    ],
  },
  fonceur2: {
    id: 'fonceur2', act: 2,
    title: 'Le joueur qui fonce (le retour)',
    text: 'L\'aventurier du chapitre I a survécu. Et il recommence : il fonce seul sur une patrouille draconique, en hurlant son propre nom.',
    choices: [
      { label: 'L\'aider', detail: 'Un combat difficile, puis il te donne un objet rare.' },
      { label: 'Le laisser', detail: 'Rien ne se passe. On entend une expédition entière tomber au loin. Encore.' },
    ],
  },
};

// --- Acte 3 : Irem (docs/actes/ACTE3_IREM.md §8) ---
Object.assign(EVENTS, {
  gong: {
    id: 'gong', act: 3,
    title: 'Le gong des Sables',
    text: 'Devant les portes d\'Irem, un gong immense pend entre deux colonnes. Son bronze est couvert de prières. Le frapper réveillerait toute la cité.',
    choices: [
      { label: 'Le frapper', detail: 'Un objet d\'équipement épique au hasard. Mais ton prochain combat sera un pack difficile, avec un ennemi de plus.' },
      { label: 'Passer ton chemin', detail: 'Rien ne se passe.' },
    ],
  },
  veilleurs: {
    id: 'veilleurs', act: 3,
    // Pour le Paladin qui porte la Lame ternie, les Veilleurs passent avant les autres événements.
    quest: (run: RunState) => run.classId === 'paladin' && run.aurore === 'lame',
    title: 'Les Veilleurs de l\'Aurore',
    text: 'Un campement de croisés, entre deux dunes. Leurs tabards portent un soleil levant. Ils chassent les morts-vivants qui sortent des tombeaux d\'Irem.',
    choices: [
      { label: 'Leur demander de purifier la lame', detail: 'Ils bénissent la Lame ternie. Vaincs un gardien d\'Irem : la lame s\'embrasera (l\'Aurore ardente, étape 2 sur 3).', locked: (run: RunState) => (run.classId !== 'paladin' ? 'Réservé au Paladin' : run.aurore !== 'lame' ? 'Il te faut la Lame ternie' : null) },
      { label: 'Recevoir leur bénédiction', detail: 'Tes Attaques infligent +3 dégâts aux Morts-vivants, jusqu\'à la fin de l\'expédition.' },
      { label: 'Leur demander un indice', detail: 'Un « ? » de la carte est révélé : tu sauras s\'il cache un combat ou un événement.' },
    ],
  },
  oasis: {
    id: 'oasis', act: 3,
    title: 'L\'oasis',
    text: 'Une source claire au milieu du sable, à l\'ombre de trois palmiers. L\'eau est fraîche, et rien ne rôde autour.',
    choices: [
      { label: 'Boire', detail: 'Soigne 20 PV.' },
      { label: 'Remplir tes gourdes', detail: '2 Potions de soins (si tu as de la place).' },
      { label: 'Te baigner', detail: 'Retire toutes les Malédictions de ton paquet.', locked: (run: RunState) => (hasCurse(run) ? null : 'Tu n\'as pas de Malédiction') },
    ],
  },
  bibliotheque: {
    id: 'bibliotheque', act: 3,
    title: 'La bibliothèque engloutie',
    text: 'Des milliers de tablettes d\'argile, à moitié ensevelies. Les rois d\'Irem y ont gravé tout ce qu\'ils savaient… avant de devenir fous.',
    choices: [
      { label: 'Étudier', detail: 'Perds 8 PV. Choisis une carte rare de ta classe parmi 3.' },
      { label: 'Fouiller les rayonnages', detail: '2 potions au hasard (si tu as de la place).' },
      { label: 'Partir', detail: 'Rien ne se passe.' },
    ],
  },
  statue: {
    id: 'statue', act: 3,
    title: 'La statue qui murmure',
    text: 'Une statue d\'Yzhar, haute comme trois hommes. Sa bouche de pierre s\'ouvre lentement, et une voix douce te promet un secret.',
    choices: [
      { label: 'L\'écouter', detail: 'Une carte épique au hasard de ta classe rejoint ton paquet. Mais tu commences chaque combat du chapitre avec 3 Folie.' },
      { label: 'La briser', detail: 'Perds 6 PV. Gagne 80 or.' },
      { label: 'Partir', detail: 'Rien ne se passe.' },
    ],
  },
  marchand_sables: {
    id: 'marchand_sables', act: 3,
    title: 'Le marchand des sables',
    text: 'Un nomade, assis sous une toile tendue entre deux chameaux. « Tout s\'échange, voyageur. Même ce que tu crois tenir. »',
    choices: [
      { label: 'Échanger un objet', detail: 'Il prend ton objet commun ou rare le moins précieux, et te donne un objet du même emplacement, d\'une rareté au-dessus.', locked: (run: RunState) => (tradeable(run) ? null : 'Tu n\'as pas d\'objet commun ou rare à échanger') },
      { label: 'Lui acheter une carte (120 or)', detail: 'Choisis une carte rare de ta classe parmi 3.', locked: (run: RunState) => (run.gold >= 120 ? null : 'Il te faut 120 or') },
      { label: 'Partir', detail: 'Rien ne se passe.' },
    ],
  },
  tombeau: {
    id: 'tombeau', act: 3,
    title: 'Le tombeau du roi',
    text: 'Un sarcophage scellé, gravé au nom d\'un roi oublié. Le sceau est intact, et quelque chose gratte doucement de l\'intérieur.',
    choices: [
      { label: 'L\'ouvrir', detail: 'Un combat contre 3 Momies d\'Irem, puis un objet d\'équipement rare et 100 or.' },
      { label: 'Prier pour le roi', detail: '+5 PV max.' },
    ],
  },
  reve: {
    id: 'reve', act: 3,
    title: 'Le rêve d\'Yzhar',
    text: 'La chaleur te monte à la tête. Tu t\'endors debout, et tu rêves d\'un dieu immense qui te tend la main.',
    choices: [
      { label: 'Accepter le rêve', detail: 'Améliore 3 cartes au hasard. Tu commences le prochain combat avec 4 Folie.' },
      { label: 'Te réveiller de force', detail: 'Perds 6 PV.' },
    ],
  },
  fantome_raideur3: {
    id: 'fantome_raideur3', act: 3,
    title: 'Le fantôme du raideur',
    text: 'Encore un aventurier tombé lors d\'une expédition, cette fois à moitié enseveli dans le sable. Son équipement brille encore.',
    choices: [
      { label: 'Récupérer son équipement', detail: 'Un objet d\'équipement au hasard, mais une Malédiction rejoint ton paquet.' },
      { label: 'Le laisser reposer', detail: 'Soigne 15 PV.' },
    ],
  },
  fonceur3: {
    id: 'fonceur3', act: 3,
    title: 'Le joueur qui fonce (encore)',
    text: 'Il est encore là, un bandage sur la tête. Il fonce seul sur une garde royale d\'Irem, en hurlant son propre nom.',
    choices: [
      { label: 'L\'aider', detail: 'Un combat difficile, puis il te donne un objet épique.' },
      { label: 'Le laisser', detail: 'Il tombe. Mais cette fois, il te salue avant.' },
    ],
  },
} satisfies Record<string, EventDef>);

/** Le marchand des sables : l'objet commun ou rare le moins précieux que tu portes. */
export function tradeable(run: RunState): string | null {
  const keys = (['arme', 'amulette', 'bague1', 'bague2', 'bijou1', 'bijou2'] as const);
  const order = ['commun', 'rare'];
  let best: string | null = null;
  for (const k of keys) {
    const id = run.equipment[k];
    if (!id || run.broken.includes(k)) continue;
    const r = ITEMS[id].rarity;
    if (!order.includes(r)) continue;
    if (!best || order.indexOf(r) < order.indexOf(ITEMS[best].rarity)) best = id;
  }
  return best;
}

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
  allegement: { id: 'allegement', name: 'Allègement', text: 'Retire 1 carte de ton paquet.' },
  pret: { id: 'pret', name: 'Équipement de prêt', text: 'Un objet d\'équipement commun au hasard.' },
  pari: { id: 'pari', name: 'Pari risqué', text: 'Perds 10 % de tes PV max. Choisis un objet rare parmi 3.' },
  marche: { id: 'marche', name: 'Marché de l\'ombre', text: 'Une Malédiction permanente rejoint ton paquet. Gagne 200 or.' },
};
