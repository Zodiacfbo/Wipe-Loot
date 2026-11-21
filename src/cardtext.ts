// Le chiffre de dégâts corrigé dans le texte d'une carte, en combat (Puissance, posture, objets, combo, cible…).
// Le total remplace le chiffre de base. Quand les dégâts dépendent d'un compteur (« 6 dégâts par combo »,
// « 4 dégâts + 6 par combo »), le total s'affiche d'abord et la formule reste entre parenthèses :
// « 22 dégâts (4 + 6 par combo) », pour qu'on ne lise jamais le total comme un montant « par point ».

/** Où placer le total : `before` + total + `after`, et `base` le chiffre d'origine (pour la couleur). */
export interface HitText {
  before: string;
  after: string;
  base: number;
}

export function placeHit(text: string, hit: number | null | undefined): HitText | null {
  if (hit === null || hit === undefined) return null;
  // « N dégâts + M par X » : une base et une part qui dépend du compteur.
  const plus = /(\d+)([\s ]+dégâts?)[\s ]+\+[\s ]+(\d+)[\s ]+par[\s ]+([^\s.,;()]+(?:[\s ]+de[\s ]+[^\s.,;()]+)?)/.exec(text);
  // Une variante déjà entre parenthèses (« 4 dégâts par point (8 sous 30 % PV) ») : on ne touche à rien.
  const alt = (m: RegExpExecArray | RegExpMatchArray) => /^[\s\u00a0]*\(/.test(text.slice(m.index! + m[0].length));
  if (plus && alt(plus)) return null;
  if (plus) {
    const rest = `${plus[2]} (${plus[1]} + ${plus[3]} par ${plus[4]})`;
    return { before: text.slice(0, plus.index), after: rest + text.slice(plus.index + plus[0].length), base: Number(plus[1]) };
  }
  // « N dégâts par X » : tout dépend du compteur.
  const per = [...text.matchAll(/(\d+)([\s ]+dégâts?)[\s ]+par[\s ]+([^\s.,;()]+(?:[\s ]+de[\s ]+[^\s.,;()]+)?)/g)];
  if (per.length === 1) {
    const m = per[0];
    if (alt(m)) return null;
    const rest = `${m[2]} (${m[1]} par ${m[3]})`;
    return { before: text.slice(0, m.index), after: rest + text.slice(m.index! + m[0].length), base: Number(m[1]) };
  }
  // Un seul « N dégâts » simple : on remplace le chiffre, s'il change.
  const simple = [...text.matchAll(/(\d+)([\s ]+dégâts?)(?![\s ]+(?:par|\+))/g)];
  if (simple.length === 1 && per.length === 0 && Number(simple[0][1]) !== hit) {
    const m = simple[0];
    return { before: text.slice(0, m.index), after: text.slice(m.index! + m[1].length), base: Number(m[1]) };
  }
  return null;
}

/** Les mots qui passent du début du texte au bandeau de la carte. */
const RIBBON_PREFIX = /^(Finisher|Sceau|Aura|Ouverture|Poison d'arme)[\s\u00a0]*:[\s\u00a0]*/;

/** « Finisher : inflige… » → bandeau « Finisher », texte « Inflige… » (de la place sur téléphone). */
export function splitRibbon(full: string): { ribbon: string | null; text: string } {
  const m = RIBBON_PREFIX.exec(full);
  if (!m) return { ribbon: null, text: full };
  return { ribbon: m[1], text: full.slice(m[0].length).replace(/^\p{Ll}/u, (c) => c.toUpperCase()) };
}

/** La longueur visée d'un texte de carte : 3 ou 4 lignes sur téléphone. */
export const CARD_TEXT_MAX = 72;
