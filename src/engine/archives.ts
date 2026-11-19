// Les archives de la guilde : le compendium des cartes, objets, potions et monstres découverts.
// Référence : docs/CONCEPT.md (§15.2)

/** Ce que la guilde a consigné sur chaque monstre. */
export const LORE: Record<string, string> = {
  molosse: 'Des chiens de lave nés des fissures de la montagne. Ils chassent en meute et crachent des braises en mourant d\'envie de mordre.',
  eclaireur: 'Les yeux des Profondeurs. Ils frappent toujours les premiers, depuis l\'ombre des coulées refroidies.',
  etincelle: 'Une flammèche qui a appris à vouloir. Elle ne vit que pour se jeter sur vous, et elle meurt en explosant.',
  seigneur: 'Un élémentaire de cendres qui commande aux flammes mineures. Sa Boule de lave a mis fin à bien des expéditions.',
  lieutenant: 'Les soldats d\'élite de Vulkhar, en armure brûlée. Ils ne reculent jamais tant que le Héraut parle.',
  gardien: 'Un élémentaire en armure qui porte un bouclier de pierre. Tant que son bouclier tient, il rend coup pour coup.',
  pretre: 'Les fidèles de la flamme. Ils soignent leurs alliés et les bénissent de la colère du Souverain.',
  mimique: 'Un gobelin qui s\'est trop longtemps caché dans un coffre. Il a fini par en devenir un, avec les dents en plus.',
  morvax: 'Un démon mineur, lié à Vulkhar par un pacte de feu. Il ne frappe pas fort, mais ses malédictions rongent ceux qui l\'approchent.',
  croc: 'Le premier des molosses de lave, aussi vieux que la montagne. Son hurlement glace le sang, même au cœur du brasier.',
  cendrine: 'Elle fut la première à entendre l\'appel de Vulkhar. Depuis, elle répand ses cendres sur chaque intrus.',
  gorlok: 'Un élémentaire de roche brisé par la chute des forges. Ses éclats gravitent autour de lui, et chacun d\'eux est une bombe.',
  eclat: 'Un morceau de Gorlok, instable et brûlant. Le briser, c\'est le faire exploser.',
  vossk: 'Un seigneur élémentaire au cœur de magma, qui transforme ses ennemis en torches vivantes.',
  zhaal: 'Un mage élémentaire qui tisse la flamme et l\'arcane. Il a volé un fragment du bâton du Veilleur, et sa puissance le rend insaisissable.',
  brannoc: 'Le porte-voix de Vulkhar. Il ne combat presque jamais seul : il soigne et galvanise ses lieutenants.',
  kragg: 'Un géant de roche qui se nourrit de la montagne elle-même. Ses deux molosses ne le quittent jamais.',
  molosse_enrage: 'Les molosses de Krâgg, nourris de magma. Tant que leur maître vit, ils se relèvent.',
  saldris: 'L\'intendant des forges, au service de Vulkhar depuis des siècles. Il protège ses gardes derrière des boucliers magiques qui renvoient les coups.',
  rejeton: 'Des flammes arrachées à Vulkhar lui-même. S\'il refait surface, il les rappelle à lui.',
  // Acte 2 : l'Aire de Vhaeryx
  dragonnet: 'Les petits de la couvée noire. Seuls, ils font sourire. En nuée, ils font fuir. Ils s\'envolent hors de portée des lames.',
  oeuf: 'Un œuf noir, chaud, qui palpite. Il éclôt au bout de trois tours, et il n\'éclôt jamais seul bien longtemps.',
  oeuf_skarn: 'Les œufs de la couvée de Skarn. Tant qu\'il en reste un, leur magie protège leur gardien.',
  oeuf_vashka: 'Les œufs de Vashka. Elle sait les faire éclore tous d\'un coup, si on lui en laisse le temps.',
  drakonide: 'Des guerriers à demi-dragons, nés dans les couvoirs de Vhaeryx. Leur rugissement galvanise toute la couvée.',
  alchimiste: 'Les assistants gobelins de Vhaeryx. Ils lancent des fioles, soignent leurs alliés, et relèvent les cobayes tombés.',
  serviteur: 'Un cobaye raté, recousu et relevé. Tant qu\'un alchimiste veille sur lui, il se relève une fois.',
  drake_os: 'Un drake mort et relevé par l\'alchimie. Son Souffle de mort porte la Peste, qui empêche les plaies de se refermer.',
  chimere: 'Une expérience d\'essai, faite de lion, de serpent et de dragon. Blessée, elle mute : carapace, frénésie ou régénération.',
  garde_draconique: 'L\'élite de la citadelle. Un bouclier plus grand qu\'un homme, et une charge qui ralentit les plus vifs.',
  drakonide_chroma: 'Les drakônides au sang mêlé que Vhaeryx appelle à ses côtés. Ils se relèvent quand leur maître faiblit.',
  serviteur_os: 'Les adds tombés pendant le combat contre Vhaeryx, relevés par son dernier élixir.',
  skarn: 'Le gardien des couvoirs. Tant que ses œufs vivent, rien ne l\'atteint, mais ses propres dragonnets peuvent se retourner contre lui.',
  ysolde: 'Une dragonne rouge, noble et ancienne, enchaînée par l\'alchimie. Elle supplie qu\'on la libère, même s\'il faut la tuer, et elle offre sa force pour y parvenir.',
  draksis: 'Le contremaître des couvoirs. Il frappe de plus en plus fort tant qu\'on lui laisse le temps.',
  drake_braise: 'Le premier des Trois Souffles, nourri au feu. Ses flammes laissent des zones brûlantes.',
  drake_ombre: 'Le deuxième des Trois Souffles. Son ombre ronge : chaque Souffle te rend plus fragile, jusqu\'à la fin du combat.',
  drake_cendre: 'Le troisième des Trois Souffles. Ses cendres t\'aveuglent et encombrent tes mains.',
  prismagor: 'Le plus grand succès de Vhaeryx : un chien-dragon à cinq têtes, une par lignée. Son sang empoisonne de cinq façons.',
  grizzik: 'Le premier assistant de Vhaeryx, qui a goûté à toutes ses potions. Il n\'est plus vraiment sûr de ce qu\'il va boire ensuite.',
  ossyrax: 'Le premier dragon que Vhaeryx a tué et relevé. Il ne connaît plus la douleur, et il refuse de rester mort.',
  vashka: 'La mère de la couvée noire. Elle protège ses œufs avec férocité et peut accélérer leur éclosion.',
  mimique_2: 'Un cousin du gobelin mimique des Profondeurs, plus gros et plus gourmand. Il a avalé un coffre entier de l\'Aire.',
  vhaeryx: '« Des cobayes, enfin. Approchez, approchez. Je me demandais justement ce que donnerait votre sang. » Le dragon-alchimiste fusionne les lignées pour créer une armée invincible.',
  vulkhar: '« Insectes ! Vous osez troubler mon sommeil ? Vous brûlerez, comme brûle la montagne ! » Arraché à son plan par la Grande Brèche, le Souverain des flammes dort sous le mont Durgal.',
};

/** Ce que le profil retient pour les archives. */
export interface ArchiveProfile {
  seenCards: string[];
  seenEnemies: string[];
  kills: Record<string, number>;
  seenPotions: string[];
}

function addAll(list: string[], ids: (string | null | undefined)[]): boolean {
  let changed = false;
  for (const id of ids) {
    if (id && !list.includes(id)) {
      list.push(id);
      changed = true;
    }
  }
  return changed;
}

/** Ajoute aux archives ce que le joueur a vu. Renvoie true si quelque chose de nouveau a été consigné. */
export function recordSeen(profile: ArchiveProfile, cards: string[], enemies: string[], potions: (string | null)[]): boolean {
  const a = addAll(profile.seenCards, cards);
  const b = addAll(profile.seenEnemies, enemies);
  const c = addAll(profile.seenPotions, potions);
  return a || b || c;
}

/** Ajoute les monstres vaincus pendant une run (à la fin de la run). */
export function recordKills(profile: ArchiveProfile, kills: Record<string, number>): void {
  for (const [id, n] of Object.entries(kills)) profile.kills[id] = (profile.kills[id] ?? 0) + n;
}
