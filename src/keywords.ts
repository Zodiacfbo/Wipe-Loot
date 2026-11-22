// Le lexique des infobulles : les mots-clés des cartes, des buffs et des débuffs.
// Appui long (téléphone) ou survol (PC) sur un mot souligné d'une carte, sur une carte ou sur une pastille.
// Les textes restent courts et sans chiffre propre à une carte (le chiffre est sur la carte ou la pastille).

export interface Keyword {
  /** Le nom affiché en titre de la bulle. */
  name: string;
  /** Les formes du mot reconnues dans les textes (sensible à la casse : « Charge », le sort, n'est pas « charge »). */
  words: string[];
  text: string;
  /** Mot trop courant pour être souligné (il reste expliqué à l'appui long sur la carte). */
  discret?: boolean;
}

export const KEYWORDS: Keyword[] = [
  // Communs
  { name: 'Puissance', words: ['Puissance'], text: '+1 dégât par point sur chaque attaque et chaque Sort de dégâts.' },
  { name: 'Robustesse', words: ['Robustesse'], text: '+1 blocage par point sur chaque carte qui donne du blocage.' },
  { name: 'Armure fracassée', words: ['Armure fracassée', 'Armures fracassées'], text: 'Subit 50 % de dégâts en plus. Le nombre indique les tours restants.' },
  { name: 'Démoralisé', words: ['Démoralisé', 'Démoralisée', 'Démoralisés', 'Démoralisées'], text: 'Inflige 25 % de dégâts en moins. Le nombre indique les tours restants.' },
  { name: 'Ralenti', words: ['Ralenti', 'Ralentie', 'Ralentis', 'Ralenties'], text: 'Gagne 25 % de blocage en moins. Le nombre indique les tours restants.' },
  { name: 'Saignement', words: ['Saignement'], text: 'Perd ce nombre de PV au début de chacun de ses tours, en ignorant le blocage. Un nouveau Saignement s\'ajoute et relance la durée.' },
  { name: 'DoT', words: ['DoT', 'DoTs'], text: 'Dégâts sur la durée : la cible perd des PV au début de chacun de ses tours.' },
  { name: 'Contrôlé', words: ['Contrôlé', 'Contrôlée', 'Contrôlés', 'Contrôlées', 'Contrôle'], text: 'Ne fait rien pendant le nombre de tours indiqué. Les boss y sont immunisés.' },
  { name: 'Assommé', words: ['Assommé', 'Assommée', 'Assommés'], text: 'Ne fait rien, mais se réveille s\'il subit des dégâts. Les boss y sont immunisés.' },
  { name: 'Apeuré', words: ['Apeuré', 'Apeurée', 'Apeurés', 'Apeurées', 'Peur'], text: 'Ne peut pas agir pendant un tour. Les boss y résistent.' },
  { name: 'Interruption', words: ['Interruption'], text: 'Annule l\'Incantation en cours de la cible.' },
  { name: 'Incantation', words: ['Incantation', 'Incantations'], text: 'Un sort puissant annoncé un tour à l\'avance. Il peut être interrompu, sauf mention contraire.' },
  { name: 'Dissipation', words: ['Dissipation', 'Dissipe'], text: 'Retire un effet néfaste du type indiqué.' },
  { name: 'Insaisissable', words: ['Insaisissable'], text: 'Ne peut pas être ciblé jusqu\'à son prochain tour.' },
  { name: 'Mort-vivant', words: ['Mort-vivant', 'Morts-vivants'], text: 'Type d\'ennemi : certaines cartes et certains objets sont plus forts contre lui.' },
  { name: 'Démon', words: ['Démon', 'Démons'], text: 'Type d\'ennemi : certaines cartes et certains objets sont plus forts contre lui.' },
  // Acte 3
  { name: 'Folie', words: ['Folie'], text: 'À 5 ou plus, une Hallucination arrive dans ta main à chaque tour. À 10 : Crise de folie, tu perds ton prochain tour. Une Dissipation (Magie) en retire 3. Retombe à 0 après le combat.' },
  { name: 'Hallucination', words: ['Hallucination', 'Hallucinations'], text: 'Une fausse carte qui imite une carte de ton deck (cadre violacé, texte qui tremble). La jouer : aucun effet et tu perds 2 PV.' },
  { name: 'Sable', words: ['Sable'], text: 'Une carte injouable qui prend une place dans ta main. Disparaît à la fin du tour.' },
  { name: 'Enseveli', words: ['Enseveli', 'Ensevelissement'], text: 'Sous le sable : il ne peut pas être ciblé, mais les DoT et les attaques de zone le touchent. Il resurgit en frappant.' },
  { name: 'Résistance', words: ['Résistance'], text: 'Il subit 50 % de dégâts en moins du type indiqué (Attaques ou Sorts).' },
  { name: 'Immunisé', words: ['Immunisé', 'Immunisée', 'Immunisés', 'immunités', 'Échange'], text: 'Il ne subit aucun dégât du type indiqué (Attaques ou Sorts). Les DoT et les effets de zone le touchent quand même. Les Rois-Jumeaux échangent leurs immunités tous les 3 tours.' },
  { name: 'Lien des jumeaux', words: ['Lien des jumeaux'], text: 'Si un Roi meurt et que l\'autre vit encore 2 tours plus tard, il est ressuscité. Il faut les tuer presque en même temps.' },
  { name: 'Copie', words: ['Copie', 'Copies'], text: 'Un reflet de Méhkar : même aspect, moitié moins de dégâts, et il disparaît dès qu\'il subit 15 dégâts. On ne sait pas lequel est le vrai tant qu\'il n\'a pas été touché.' },
  { name: 'Domination mentale', words: ['Domination mentale'], text: 'Pendant ton prochain tour, ta première Attaque te frappe toi-même : tu subis ses dégâts (ton blocage compte), et ses autres effets sont perdus.' },
  { name: 'Vengeance royale', words: ['Vengeance royale'], text: 'Quand un enfant de la ruche meurt, les autres se soignent de 20 PV et frappent 50 % plus fort jusqu\'à la fin du combat.' },
  { name: 'Figeage', words: ['Figeage'], text: 'Chaque débuff appliqué au Limon (Ralenti, Démoralisé, Armure fracassée, Gel, Malédictions…, mais pas les DoT) ajoute 1 cumul. À 5, il est Figé.' },
  { name: 'Figé', words: ['Figé'], text: 'N\'agit plus pendant 2 tours et subit double dégâts au lieu de moitié. S\'il meurt Figé, il ne se divise pas.' },
  { name: 'Corps visqueux', words: ['Corps visqueux'], text: 'Le Limon subit 50 % de dégâts en moins, sauf quand il est Figé.' },
  { name: 'Suprématie', words: ['Suprématie'], text: 'Sartaq gagne 25 blocage au début de chacun de ses tours. Le Cristal d\'obsidienne la brise un moment.' },
  { name: 'Chœur des murmures', words: ['Chœur des murmures'], text: 'Au début de chacun des tours de Nebet, tu gagnes de la Folie.' },
  { name: 'Toxine', words: ['Toxine'], text: 'Un poison : 2 dégâts au début de chacun des tours restants.' },
  // Cartes
  { name: 'Épuisé', words: ['Épuisé', 'Épuisée'], text: 'Une fois jouée, la carte est retirée pour le reste du combat.' },
  { name: 'Éphémère', words: ['Éphémère'], text: 'Si la carte est encore dans ta main à la fin du tour, elle est retirée du combat.' },
  { name: 'Inné', words: ['Inné', 'Innée'], text: 'La carte est toujours dans ta main au début du combat.' },
  { name: 'Injouable', words: ['Injouable'], text: 'La carte ne peut pas être jouée.' },
  // Mage
  { name: 'Brûlure', words: ['Brûlure'], text: 'Perd ce nombre de PV au début de son tour, puis la Brûlure baisse de 1.' },
  { name: 'Gel', words: ['Gel'], text: 'Des cumuls de froid. Au seuil indiqué, la cible est Gelée.' },
  { name: 'Gelé', words: ['Gelé', 'Gelée', 'Gelés', 'Gelées'], text: 'Un ennemi normal perd son prochain tour ; un boss voit sa prochaine attaque réduite de moitié.' },
  { name: 'Fracasser', words: ['Fracasser'], text: 'Double dégâts si la cible a 3 Gel ou plus, ou si elle est Gelée.' },
  { name: 'Charges arcaniques', words: ['charges arcaniques', 'charge arcanique', 'charges', 'charge'], text: 'De 0 à 4, gardées tout le combat. Chaque charge donne +2 dégâts à tes Sorts arcaniques.' },
  { name: 'Surcharge', words: ['Surcharge'], text: 'À 4 charges arcaniques, tu perds 2 PV à la fin de ton tour.' },
  // Voleur
  { name: 'Camouflé', words: ['Camouflé', 'Camouflage'], text: 'Tu commences chaque combat Camouflé. Tant que tu l\'es, tu peux jouer les Ouvertures. Une Attaque qui n\'est pas une Ouverture te fait sortir de l\'ombre.' },
  { name: 'Ouverture', words: ['Ouverture', 'Ouvertures'], text: 'Une Attaque très forte, jouable seulement quand tu es Camouflé.' },
  { name: 'Points de combo', words: ['points de combo', 'point de combo', 'combo'], text: 'De 0 à 5. Tes Attaques en donnent ; les finishers les dépensent tous.', discret: true },
  { name: 'Finisher', words: ['Finisher', 'finisher'], text: 'Consomme tous tes points de combo : plus tu en as, plus l\'effet est fort. Un finisher qui inflige des dégâts est une Attaque (il profite des bonus aux Attaques) ; les autres sont des Compétences.' },
  { name: 'Poison', words: ['Poison'], text: 'Chaque Attaque qui touche la cible lui inflige ce nombre de dégâts en plus. Baisse de 1 à la fin de son tour.' },
  // Prêtre
  { name: 'Égide', words: ['Égide'], text: 'Un bouclier qui absorbe les dégâts après le blocage et ne disparaît pas d\'un tour à l\'autre. 30 au plus.' },
  { name: 'Foi', words: ['Foi'], text: 'De 0 à 10, remise à 0 à chaque combat. +1 quand une de tes cartes te soigne ou te donne de l\'Égide. Certaines cartes la dépensent.' },
  // Démoniste
  { name: 'Éclats d\'âme', words: ['éclats d\'âme', 'éclat d\'âme', 'Éclats d\'âme'], text: 'De 0 à 5, gardés d\'un combat à l\'autre. +1 quand un ennemi meurt avec un de tes DoT ou une de tes Malédictions. Certaines cartes les dépensent.' },
  // Paladin
  { name: 'Sceau', words: ['Sceau', 'Sceaux'], text: 'Un seul Sceau actif à la fois : un nouveau remplace l\'ancien. Le sort Jugement le consomme pour déclencher son effet.' },
  { name: 'Jugement', words: ['Jugement'], text: 'Sort de barre du Paladin : consomme le Sceau actif pour déclencher son effet de Jugement.' },
  { name: 'Mouton', words: ['mouton'], text: 'Ne fait rien pendant le nombre de tours indiqué, et reprend sa forme dès qu\'il est blessé.' },
  { name: 'Invocation', words: ['Invoque'], text: 'Ton familier est remplacé par celui-ci pour le reste du combat, et il agit tout de suite.' },
  { name: 'Forme d\'Ombre', words: ['Forme d\'Ombre'], text: 'Jusqu\'à la fin du combat : Sorts d\'Ombre +30 %, DoT +1. Tes soins sont réduits de 25 %, et tu ne gagnes plus de Foi.' },
  { name: 'Poison d\'arme', words: ['Poison d\'arme'], text: 'Tes Attaques appliquent cet effet jusqu\'à la fin du combat. Un seul Poison d\'arme à la fois : le nouveau remplace l\'ancien.' },
  { name: 'Aura', words: ['Aura', 'Auras'], text: 'Un Pouvoir du Paladin. Une seule Aura active à la fois : une nouvelle remplace l\'ancienne.' },
  { name: 'Censure', words: ['Censure'], text: 'Inflige ce nombre de dégâts au début du tour de la cible. Le Jugement du Sceau de vengeance la consomme.' },
  // Chasseur
  { name: 'Compagnon', words: ['compagnon'], text: 'Ton Loup, ton Ours ou ton Raptor. Il agit seul à la fin de chacun de tes tours, sur ta dernière cible. Il ne peut pas mourir.', discret: true },
  { name: 'Ordre', words: ['Ordre', 'Ordres'], text: 'Une carte qui fait agir ton compagnon tout de suite, ou autrement.' },
  { name: 'Esprit', words: ['Esprit'], text: 'Un seul Esprit animal actif à la fois : un nouveau remplace l\'ancien. Il dure jusqu\'à la fin du combat.' },
  { name: 'Piège', words: ['Piège', 'Pièges'], text: '3 au plus. Il se déclenche au début du prochain tour ennemi, sur le premier ennemi qui agit (marqué « ici »).' },
  { name: 'Marquée', words: ['Marquée', 'Marqué'], text: 'Une seule cible marquée à la fois, pour tout le combat : tes Attaques et ton compagnon lui infligent des dégâts en plus.' },
];

const BY_WORD = new Map<string, Keyword>();
for (const k of KEYWORDS) for (const w of k.words) BY_WORD.set(w, k);

// Les formes les plus longues d'abord (« Armure fracassée » avant « Armure », « charges arcaniques » avant « charges »).
const WORDS = [...BY_WORD.keys()].sort((a, b) => b.length - a.length);
const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const PATTERN = new RegExp(`(?<![\\p{L}'-])(${WORDS.map(escape).join('|')})(?![\\p{L}-])`, 'gu');

export function keywordByName(name: string): Keyword | undefined {
  return KEYWORDS.find((k) => k.name === name);
}

/** Les mots-clés cités dans un texte, dans l'ordre, sans doublon. */
export function keywordsIn(text: string): Keyword[] {
  const found: Keyword[] = [];
  for (const m of text.matchAll(PATTERN)) {
    const k = BY_WORD.get(m[1])!;
    if (!found.includes(k)) found.push(k);
  }
  return found;
}

/** Souligne les mots-clés d'un texte (déjà sûr pour le HTML). */
export function markKeywords(text: string): string {
  return text.replace(PATTERN, (w) => (BY_WORD.get(w)!.discret ? w : `<span class="mot" data-mot="${BY_WORD.get(w)!.name}">${w}</span>`));
}

/** Le mot-clé d'une pastille (« Saignement 3 », « Gel 2/5 », « Poison mortel 2 »…) : le plus long mot reconnu au début. */
export function keywordOfLabel(label: string): Keyword | undefined {
  const l = label.trim();
  const w = WORDS.find((word) => l.startsWith(word) && !/[\p{L}-]/u.test(l.charAt(word.length)));
  return w ? BY_WORD.get(w) : undefined;
}
