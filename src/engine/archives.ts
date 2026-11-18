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
