// Les talents : 3 arbres de 5 paliers par classe, 1 point par niveau de classe (10 au maximum).
// Référence : docs/CONCEPT.md (§9), docs/classes/GUERRIER.md (§7) et docs/classes/MAGE.md (§7)
import type { ItemEffects } from './items';

export type TreeId = string;
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

/** Les arbres du Guerrier. */
export const TREES: TreeDef[] = [
  {
    id: 'armes', name: 'Armes', theme: 'Gros coups et saignements',
    tiers: [
      [t('lame_aiguisee', 'Lame aiguisée', 'Frappe et Frappe héroïque infligent +3 dégâts.', { fx: { strikeBonus: 3 } }),
        t('maitrise_tactique', 'Maîtrise tactique', 'Changer de posture conserve jusqu\'à 6 rage (au lieu de 3).', { fx: { postureRage: 6 } })],
      [t('plaies_profondes', 'Plaies profondes', 'Tes Saignements durent 1 tour de plus.', { fx: { bleedDuration: 1 } }),
        t('entaille', 'Entaille', 'Tes Attaques qui coûtent 2 énergie ou plus appliquent Saignement 3.', { fx: { heavyBleed: 3 } })],
      [t('t_coup_de_pommeau', 'Coup de pommeau', 'Ajoute ce sort à ta barre : Interruption, 2 dégâts.', { spell: 'coup_de_pommeau' }),
        t('impact', 'Impact', 'Exécution passe au bonus de dégâts à 40 % de PV de la cible au lieu de 30 %.', { fx: { executeThreshold: 40 } })],
      [t('implacable', 'Implacable', 'Quand tu tues un ennemi, gagne 3 rage et pioche 1 carte.', { fx: { killRage: 3, killDraw: 1 } }),
        t('arme_lourde', 'Arme lourde', 'Tes Attaques qui coûtent 2 énergie ou plus infligent +6 dégâts.', { fx: { heavyAttackBonus: 6 } })],
      [t('t_frappe_mortelle', 'Frappe mortelle', 'Carte épique : un exemplaire dans ton deck de départ.', { card: 'frappe_mortelle' })],
    ],
    cards: ['taillade', 'pourfendre', 'fulgurance', 'frappe_ecrasante', 'parade_ripostee', 'coup_de_grace', 'balayage',
      'entaille_profonde', 'cri_intimidation', 'concentration_martiale', 'frappe_du_colosse', 'tempete_acier', 'maitre_armes', 'frappe_mortelle'],
  },
  {
    id: 'fureur', name: 'Fureur', theme: 'Attaques en rafale et rage illimitée',
    tiers: [
      [t('cruaute', 'Cruauté', 'Commence chaque combat avec 1 Puissance.', { fx: { startPuissance: 1 } }),
        t('colere_interieure', 'Colère intérieure', 'Gagne 2 rage au début de chaque tour.', { fx: { turnRage: 2 } })],
      [t('voix_de_stentor', 'Voix de stentor', 'Tes Cris (et Hurlement furieux) donnent 1 rage de plus, et leurs Démoralisés durent 1 tour de plus.', { fx: { shoutBonus: 1 } }),
        t('main_gauche_talent', 'Main gauche', 'Tes Attaques qui coûtent 0 énergie infligent +2 dégâts.', { fx: { zeroCostBonus: 2 } })],
      [t('t_rage_du_berserker', 'Rage du berserker', 'Ajoute ce sort à ta barre : +5 rage, immunisé aux cartes Paniquées.', { spell: 'rage_berserker' }),
        t('fureur_sans_fin', 'Fureur sans fin', 'Ta rage maximale passe à 15, et tu commences chaque combat avec 3 rage.', { fx: { maxRage: 15, startRage: 3 } })],
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
      [t('bouclier_lourd', 'Bouclier lourd', 'Tes cartes de blocage donnent +1 blocage.', { fx: { blockBonus: 1 } }),
        t('robuste', 'Robuste', '+8 PV max.', { maxHp: 8 })],
      [t('garde_haute', 'Garde haute', 'Commence chaque combat avec 5 blocage.', { fx: { startBlock: 5 } }),
        t('presence_menacante', 'Présence menaçante', 'Au début de chaque combat, tous les ennemis sont Démoralisés 1 tour.', { fx: { startDemoralise: 1 } })],
      [t('t_rempart', 'Rempart', 'Ajoute ce sort à ta barre (1 énergie) : dégâts subis divisés par deux jusqu\'au prochain tour.', { spell: 'rempart' }),
        t('t_cri_de_defi', 'Cri de défi', 'Ajoute ce sort à ta barre : tous les ennemis t\'attaquent, incantations annulées.', { spell: 'cri_de_defi' })],
      [t('t_dernier_rempart', 'Dernier rempart', 'Ajoute ce sort à ta barre : soigne 15 % de tes PV max, une fois par combat.', { spell: 'dernier_rempart' }),
        t('quatrieme_emplacement', 'Quatrième emplacement', 'Ta barre de sorts gagne un 4e emplacement.', { barSlots: 1 })],
      [t('t_heurt_de_bouclier', 'Heurt de bouclier', 'Carte épique : un exemplaire dans ton deck de départ.', { card: 'heurt_de_bouclier' })],
    ],
    cards: ['levee_de_bouclier', 'inebranlable', 'coup_de_semonce', 'vengeance', 'resolution', 'provocation', 'desarmement',
      'charge_du_bouclier', 'tenacite', 'peau_de_fer', 'cri_de_ralliement', 'riposte_bouclier', 'garde_de_fer', 'bastion', 'heurt_de_bouclier'],
  },
];

/** Les arbres du Mage. */
export const MAGE_TREES: TreeDef[] = [
  {
    id: 'arcane', name: 'Arcane', theme: 'Puissance brute et pioche',
    tiers: [
      [t('subtilite_arcanique', 'Subtilité arcanique', 'Commence chaque combat avec 2 charges arcaniques.', { fx: { startCharges: 2 } }),
        t('meditation', 'Méditation', 'Pioche 1 carte de plus au premier tour de chaque combat.', { fx: { firstTurnDraw: 1 } })],
      [t('stabilite', 'Stabilité', 'La Surcharge ne te fait plus perdre de PV.', { fx: { noOverload: 1 } }),
        t('esprit_clair', 'Esprit clair', 'Barrage arcanique pioche 1 carte de plus.', { fx: { barrageDraw: 1 } })],
      [t('t_evocation', 'Évocation', 'Ajoute ce sort à ta barre : +2 énergie et pioche 1 carte.', { spell: 'evocation' }),
        t('t_pouvoir_arcanes', 'Pouvoir des arcanes', 'Ajoute ce sort à ta barre : tes Sorts infligent +50 % ce tour-ci.', { spell: 'pouvoir_arcanes' })],
      [t('t_clignement', 'Clignement', 'Ajoute ce sort à ta barre : retire les cartes-statut de ta main sans subir leur effet, 4 blocage.', { spell: 'clignement' }),
        t('m_quatrieme_emplacement', 'Quatrième emplacement', 'Ta barre de sorts gagne un 4e emplacement.', { barSlots: 1 })],
      [t('t_tempete_arcanique', 'Tempête arcanique', 'Carte épique : un exemplaire dans ton deck de départ.', { card: 'tempete_arcanique' })],
    ],
    cards: ['projectiles_arcaniques', 'deflagration_arcanique', 'focalisation', 'flux_arcanique', 'bouclier_arcanique', 'rayon_arcanique',
      'barrage_arcanique', 'presence_esprit', 'resonance', 'reflexion_sorts', 'distorsion_temporelle', 'concentration_arcanique', 'esprit_vif', 'tempete_arcanique'],
  },
  {
    id: 'feu', name: 'Feu', theme: 'La Brûlure qui consume',
    tiers: [
      [t('feu_intense', 'Feu intense', 'Toutes tes applications de Brûlure sont augmentées de 1.', { fx: { burnBonus: 1 } }),
        t('m_impact', 'Impact', 'Boule de feu inflige +3 dégâts.', { fx: { fireballBonus: 3 } })],
      [t('brasier', 'Brasier', 'Quand tu appliques de la Brûlure à une cible qui en a déjà 5 ou plus, applique 2 de plus.', { fx: { brasier: 2 } }),
        t('souffle_du_dragon', 'Souffle du dragon', 'Au début de chaque combat, applique Brûlure 2 à tous les ennemis.', { fx: { startBurn: 2 } })],
      [t('t_combustion', 'Combustion', 'Ajoute ce sort à ta barre : double la Brûlure de tous les ennemis.', { spell: 'combustion' }),
        t('t_souffle_ardent', 'Souffle ardent', 'Ajoute ce sort à ta barre : 4 dégâts et Brûlure 2 à tous les ennemis.', { spell: 'souffle_ardent' })],
      [t('pyromane', 'Pyromane', 'La recharge de Combustion et de Souffle ardent diminue de 1.', { fx: { fireSpellCd: 1 } }),
        t('flammes_eternelles', 'Flammes éternelles', 'La Brûlure des boss et des boss secondaires ne diminue plus.', { fx: { bossBurnKeep: 1 } })],
      [t('t_pyrolance', 'Pyrolance', 'Carte épique : un exemplaire dans ton deck de départ.', { card: 'pyrolance' })],
    ],
    cards: ['roussir', 'etincelle', 'boule_de_feu', 'cone_de_flammes', 'bouclier_de_flammes', 'eruption', 'incendie', 'embrasement',
      'armure_de_lave', 'explosion_de_flammes', 'meteore', 'chaleur_intense', 'pyromanie', 'pyrolance'],
  },
  {
    id: 'givre', name: 'Givre', theme: 'Contrôle et Fracasser',
    tiers: [
      [t('hiver_precoce', 'Hiver précoce', 'Toutes tes applications de Gel sont augmentées de 1.', { fx: { gelBonus: 1 } }),
        t('givre_durable', 'Givre durable', 'Le Gel ne diminue plus à la fin des tours ennemis.', { fx: { gelKeep: 1 } })],
      [t('froid_glacial', 'Froid glacial', 'Un ennemi devient Gelé à 4 cumuls de Gel au lieu de 5.', { fx: { freezeEarly: 1 } }),
        t('fragilite', 'Fragilité', 'Tes cartes avec Fracasser infligent +3 dégâts.', { fx: { shatterBonus: 3 } })],
      [t('t_carapace_de_glace', 'Carapace de glace', 'Ajoute ce sort à ta barre (1 énergie) : immunisé à tous les dégâts jusqu\'au prochain tour, mais ton tour se termine.', { spell: 'carapace_de_glace' }),
        t('t_orbe_glaciale', 'Orbe glaciale', 'Ajoute ce sort à ta barre : 4 dégâts et Gel 2 à tous les ennemis.', { spell: 'orbe_glaciale' })],
      [t('coeur_gele', 'Cœur gelé', 'Chaque fois qu\'un ennemi devient Gelé pendant ton tour, gagne 1 énergie.', { fx: { freezeEnergy: 1 } }),
        t('hiver_sans_fin', 'Hiver sans fin', 'La recharge de Carapace de glace diminue de 2.', { fx: { iceBlockCd: 2 } })],
      [t('t_fracas_glaciaire', 'Fracas glaciaire', 'Carte épique : un exemplaire dans ton deck de départ.', { card: 'fracas_glaciaire' })],
    ],
    cards: ['eclair_de_givre', 'lance_de_glace', 'gelure', 'cone_de_froid', 'barriere_de_glace', 'armure_de_givre', 'morsure_du_froid',
      'toucher_glacial', 'souffle_polaire', 'tempete_de_neige', 'prison_de_glace', 'fragmentation', 'coeur_de_glace', 'fracas_glaciaire'],
  },
];

/** Les arbres de chaque classe jouable. */
export const CLASS_TREES: Record<string, TreeDef[]> = { guerrier: TREES, mage: MAGE_TREES };

/** Les arbres d'une classe (ceux du Guerrier par défaut). */
export function treesFor(classId: string | undefined): TreeDef[] {
  return CLASS_TREES[classId ?? 'guerrier'] ?? TREES;
}

const ALL_TREES = Object.values(CLASS_TREES).flat();

export const TALENTS: Record<string, TalentDef> = Object.fromEntries(
  ALL_TREES.flatMap((tree) => tree.tiers.flat()).map((d) => [d.id, d]),
);

/** Les sorts que donnent les talents (ils ne tombent plus sur les boss). */
export const TALENT_SPELLS = new Set(ALL_TREES.flatMap((tree) => tree.tiers.flat()).map((d) => d.spell).filter((s): s is string => !!s));
/** Les cartes épiques (débloquées par le palier 5). */
export const EPIC_CARDS = new Set(ALL_TREES.map((tree) => tree.tiers[4][0].card!));

export function emptyAlloc(classId = 'guerrier'): TalentAlloc {
  return Object.fromEntries(treesFor(classId).map((tree) => [tree.id, []]));
}

export function pointsUsed(alloc: TalentAlloc): number {
  return Object.values(alloc).reduce((a, picks) => a + picks.length, 0);
}

/** Les talents choisis, dans l'ordre des arbres et des paliers. */
export function talentIds(alloc: TalentAlloc, classId = 'guerrier'): string[] {
  return treesFor(classId).flatMap((tree) => (alloc[tree.id] ?? []).map((choice, tier) => tree.tiers[tier][choice === 'B' && tree.tiers[tier][1] ? 1 : 0].id));
}

/**
 * Clique sur un talent : le prend (palier suivant d'un arbre, s'il reste un point), change le choix d'un palier déjà pris,
 * ou retire le dernier palier pris d'un arbre (s'il est déjà choisi). Renvoie false si rien ne change.
 */
export function toggleTalent(alloc: TalentAlloc, tree: TreeId, tier: number, choice: Choice, points: number, classId = 'guerrier'): boolean {
  const def = treesFor(classId).find((d) => d.id === tree);
  if (!def) return false;
  const picks = (alloc[tree] ??= []);
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
export function clampAlloc(alloc: TalentAlloc, points: number, classId = 'guerrier'): TalentAlloc {
  const ids = treesFor(classId).map((tree) => tree.id);
  const a: TalentAlloc = Object.fromEntries(ids.map((id) => [id, [...(alloc[id] ?? [])]]));
  while (pointsUsed(a) > points) {
    const longest = ids.reduce((x, y) => (a[x].length >= a[y].length ? x : y));
    a[longest].pop();
  }
  return a;
}
