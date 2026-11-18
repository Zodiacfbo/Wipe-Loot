// Les talents du Guerrier : 3 arbres de 5 paliers, 1 point par niveau de classe (10 au maximum).
// Référence : docs/CONCEPT.md (§9) et docs/classes/GUERRIER.md (§7)
import type { ItemEffects } from './items';

export type TreeId = 'armes' | 'fureur' | 'protection';
export type Choice = 'A' | 'B';
/** La répartition des points : pour chaque arbre, le choix fait à chaque palier pris (dans l'ordre). */
export type TalentAlloc = Record<TreeId, Choice[]>;

export interface TalentDef {
  id: string;
  name: string;
  text: string;
  /** Effets en combat (additionnés à ceux de l'équipement). */
  fx?: ItemEffects;
  /** Sort ajouté à la barre au début de la run. */
  spell?: string;
  /** Carte épique ajoutée au deck de départ (palier 5). */
  card?: string;
  maxHp?: number;
  /** Emplacements de barre en plus. */
  barSlots?: number;
}

export interface TreeDef {
  id: TreeId;
  name: string;
  theme: string;
  /** Paliers 1 à 4 : deux choix ; palier 5 : la carte épique (un seul choix). */
  tiers: TalentDef[][];
  /** Les cartes de cet arbre (pour orienter les récompenses). */
  cards: string[];
}

const t = (id: string, name: string, text: string, extra: Omit<TalentDef, 'id' | 'name' | 'text'> = {}): TalentDef =>
  ({ id, name, text, ...extra });

export const TREES: TreeDef[] = [
  {
    id: 'armes', name: 'Armes', theme: 'Gros coups et saignements',
    tiers: [
      [t('lame_aiguisee', 'Lame aiguisée', 'Frappe et Frappe héroïque infligent +2 dégâts.', { fx: { strikeBonus: 2 } }),
        t('maitrise_tactique', 'Maîtrise tactique', 'Changer de posture conserve jusqu\'à 6 rage (au lieu de 3).', { fx: { postureRage: 6 } })],
      [t('plaies_profondes', 'Plaies profondes', 'Tes Saignements durent 1 tour de plus.', { fx: { bleedDuration: 1 } }),
        t('entaille', 'Entaille', 'Tes Attaques qui coûtent 2 énergie ou plus appliquent Saignement 2.', { fx: { heavyBleed: 2 } })],
      [t('t_coup_de_pommeau', 'Coup de pommeau', 'Ajoute ce sort à ta barre : Interruption, 2 dégâts.', { spell: 'coup_de_pommeau' }),
        t('impact', 'Impact', 'Exécution passe au bonus de dégâts à 40 % de PV de la cible au lieu de 30 %.', { fx: { executeThreshold: 40 } })],
      [t('implacable', 'Implacable', 'Quand tu tues un ennemi, gagne 2 rage et pioche 1 carte.', { fx: { killRage: 2, killDraw: 1 } }),
        t('arme_lourde', 'Arme lourde', 'Tes Attaques qui coûtent 2 énergie ou plus infligent +4 dégâts.', { fx: { heavyAttackBonus: 4 } })],
      [t('t_frappe_mortelle', 'Frappe mortelle', 'Carte épique : un exemplaire dans ton deck de départ.', { card: 'frappe_mortelle' })],
    ],
    cards: ['taillade', 'pourfendre', 'fulgurance', 'frappe_ecrasante', 'parade_ripostee', 'coup_de_grace', 'balayage',
      'entaille_profonde', 'cri_intimidation', 'concentration_martiale', 'frappe_du_colosse', 'tempete_acier', 'maitre_armes', 'frappe_mortelle'],
  },
  {
    id: 'fureur', name: 'Fureur', theme: 'Attaques en rafale et rage illimitée',
    tiers: [
      [t('cruaute', 'Cruauté', 'Commence chaque combat avec 1 Puissance.', { fx: { startPuissance: 1 } }),
        t('colere_interieure', 'Colère intérieure', 'Gagne 1 rage au début de chaque tour.', { fx: { turnRage: 1 } })],
      [t('voix_de_stentor', 'Voix de stentor', 'Tes Cris (et Hurlement furieux) donnent 1 rage de plus, et leurs Démoralisés durent 1 tour de plus.', { fx: { shoutBonus: 1 } }),
        t('main_gauche_talent', 'Main gauche', 'Tes Attaques qui coûtent 0 énergie infligent +2 dégâts.', { fx: { zeroCostBonus: 2 } })],
      [t('t_rage_du_berserker', 'Rage du berserker', 'Ajoute ce sort à ta barre : +5 rage, immunisé aux cartes Paniquées.', { spell: 'rage_berserker' }),
        t('fureur_sans_fin', 'Fureur sans fin', 'Ta rage maximale passe à 15.', { fx: { maxRage: 15 } })],
      [t('t_temerite', 'Témérité', 'Ajoute ce sort à ta barre : Attaques +50 % ce tour-ci, tu subis +25 %.', { spell: 'temerite' }),
        t('frenesie', 'Frénésie', 'Quand tu joues ta 3e Attaque d\'un tour, gagne 1 énergie (1 fois par tour).', { fx: { frenzyEnergy: 1 } })],
      [t('t_sanguinaire', 'Sanguinaire', 'Carte épique : un exemplaire dans ton deck de départ.', { card: 'sanguinaire' })],
    ],
    cards: ['coup_de_folie', 'rage_sanglante', 'frappe_frenetique', 'hurlement_furieux', 'soif_de_bataille', 'ruee_sanguinaire',
      'tourbillon', 'enrage', 'rafale', 'ambidextrie', 'furie_croissante', 'fureur_suicidaire', 'furie_inextinguible', 'sanguinaire'],
  },
  {
    id: 'protection', name: 'Protection', theme: 'Blocage et contre-attaque',
    tiers: [
      [t('bouclier_lourd', 'Bouclier lourd', 'Tes cartes de blocage donnent +2 blocage.', { fx: { blockBonus: 2 } }),
        t('robuste', 'Robuste', '+8 PV max.', { maxHp: 8 })],
      [t('garde_haute', 'Garde haute', 'Commence chaque combat avec 10 blocage.', { fx: { startBlock: 10 } }),
        t('presence_menacante', 'Présence menaçante', 'Au début de chaque combat, tous les ennemis sont Démoralisés 1 tour.', { fx: { startDemoralise: 1 } })],
      [t('t_rempart', 'Rempart', 'Ajoute ce sort à ta barre : dégâts subis divisés par deux jusqu\'au prochain tour.', { spell: 'rempart' }),
        t('t_cri_de_defi', 'Cri de défi', 'Ajoute ce sort à ta barre : tous les ennemis t\'attaquent, incantations annulées.', { spell: 'cri_de_defi' })],
      [t('t_dernier_rempart', 'Dernier rempart', 'Ajoute ce sort à ta barre : soigne 25 % de tes PV max, une fois par combat.', { spell: 'dernier_rempart' }),
        t('quatrieme_emplacement', 'Quatrième emplacement', 'Ta barre de sorts gagne un 4e emplacement.', { barSlots: 1 })],
      [t('t_heurt_de_bouclier', 'Heurt de bouclier', 'Carte épique : un exemplaire dans ton deck de départ.', { card: 'heurt_de_bouclier' })],
    ],
    cards: ['levee_de_bouclier', 'inebranlable', 'coup_de_semonce', 'vengeance', 'resolution', 'provocation', 'desarmement',
      'charge_du_bouclier', 'tenacite', 'peau_de_fer', 'cri_de_ralliement', 'riposte_bouclier', 'garde_de_fer', 'bastion', 'heurt_de_bouclier'],
  },
];

export const TALENTS: Record<string, TalentDef> = Object.fromEntries(
  TREES.flatMap((tree) => tree.tiers.flat()).map((d) => [d.id, d]),
);

/** Les sorts que donnent les talents (ils ne tombent plus sur les boss). */
export const TALENT_SPELLS = new Set(TREES.flatMap((tree) => tree.tiers.flat()).map((d) => d.spell).filter((s): s is string => !!s));
/** Les cartes épiques (débloquées par le palier 5). */
export const EPIC_CARDS = new Set(TREES.map((tree) => tree.tiers[4][0].card!));

export function emptyAlloc(): TalentAlloc {
  return { armes: [], fureur: [], protection: [] };
}

export function pointsUsed(alloc: TalentAlloc): number {
  return alloc.armes.length + alloc.fureur.length + alloc.protection.length;
}

/** Les talents choisis, dans l'ordre des arbres et des paliers. */
export function talentIds(alloc: TalentAlloc): string[] {
  return TREES.flatMap((tree) => alloc[tree.id].map((choice, tier) => tree.tiers[tier][choice === 'B' && tree.tiers[tier][1] ? 1 : 0].id));
}

/**
 * Clique sur un talent : le prend (palier suivant d'un arbre, s'il reste un point), change le choix d'un palier déjà pris,
 * ou retire le dernier palier pris d'un arbre (s'il est déjà choisi). Renvoie false si rien ne change.
 */
export function toggleTalent(alloc: TalentAlloc, tree: TreeId, tier: number, choice: Choice, points: number): boolean {
  const picks = alloc[tree];
  const def = TREES.find((d) => d.id === tree)!;
  if (!def.tiers[tier] || (choice === 'B' && !def.tiers[tier][1])) return false;
  if (tier < picks.length) {
    if (picks[tier] !== choice) {
      picks[tier] = choice;
      return true;
    }
    // Déjà choisi : on ne peut retirer que le dernier palier de l'arbre.
    if (tier === picks.length - 1) {
      picks.pop();
      return true;
    }
    return false;
  }
  if (tier !== picks.length || pointsUsed(alloc) >= points) return false;
  picks.push(choice);
  return true;
}

/** Ramène la répartition dans les limites (points disponibles), au cas où. */
export function clampAlloc(alloc: TalentAlloc, points: number): TalentAlloc {
  const a = { armes: [...alloc.armes], fureur: [...alloc.fureur], protection: [...alloc.protection] };
  while (pointsUsed(a) > points) {
    const longest = (['armes', 'fureur', 'protection'] as TreeId[]).reduce((x, y) => (a[x].length >= a[y].length ? x : y));
    a[longest].pop();
  }
  return a;
}
