// Les talents : 3 arbres de 5 paliers par classe, 1 point par niveau de classe (10 au maximum).
// Le palier 5 (la carte épique) coûte 3 points : un arbre complet en coûte 7, on ne peut en finir qu'un seul.
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
      [t('subtilite_arcanique', 'Subtilité arcanique', 'Commence chaque combat avec 3 charges arcaniques.', { fx: { startCharges: 3 } }),
        t('meditation', 'Méditation', 'Pioche 1 carte de plus au premier tour de chaque combat.', { fx: { firstTurnDraw: 1 } })],
      [t('stabilite', 'Stabilité', 'La Surcharge ne te fait plus perdre de PV, et chaque charge arcanique donne +3 dégâts au lieu de +2.', { fx: { noOverload: 1, chargeBonus: 1 } }),
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

/** Les arbres du Démoniste. */
export const DEMONISTE_TREES: TreeDef[] = [
  {
    id: 'affliction', name: 'Affliction', theme: 'DoT et Malédictions',
    tiers: [
      [t('corruption_amelioree', 'Corruption améliorée', 'Tes DoT infligent +2 dégâts par tour.', { fx: { dotBonus: 2 } }),
        t('malediction_durable', 'Malédictions durables', 'Tes Malédictions durent 2 tours de plus.', { fx: { curseDuration: 2 } })],
      [t('moisson_ames', 'Moisson d\'âmes', 'Quand un ennemi meurt avec un de tes DoT, gagne 1 éclat d\'âme de plus.', { fx: { harvestShard: 1 } }),
        t('double_malediction', 'Double malédiction', 'Chaque ennemi peut porter 2 de tes Malédictions au lieu d\'une.', { fx: { doubleCurse: 1 } })],
      [t('t_amplifier', 'Amplifier la malédiction', 'Ajoute ce sort à ta barre : l\'effet de ta prochaine Malédiction est doublé.', { spell: 'amplifier' }),
        t('t_spirale_mortelle', 'Spirale mortelle', 'Ajoute ce sort à ta barre : 8 dégâts, soigne 8 PV, Apeuré.', { spell: 'spirale_mortelle' })],
      [t('contagion_naturelle', 'Contagion naturelle', 'Tes DoT durent 1 tour de plus, et quand un ennemi meurt, ses DoT passent à un autre ennemi.', { fx: { naturalContagion: 1, dotDuration: 1 } }),
        t('d_quatrieme_emplacement_a', 'Quatrième emplacement', 'Ta barre de sorts gagne un 4e emplacement.', { barSlots: 1 })],
      [t('t_tempete_afflictions', 'Tempête d\'afflictions', 'Carte épique : un exemplaire dans ton deck de départ.', { card: 'tempete_afflictions' })],
    ],
    cards: ['corruption', 'malediction_souffrance', 'malediction_faiblesse', 'malediction_fatigue', 'pacte_souffrance', 'ombre_persistante',
      'malediction_elements', 'fleau_rampant', 'hantise', 'etreinte_ombre', 'contagion', 'moisson_sombre', 'tourment', 'tempete_afflictions'],
  },
  {
    id: 'demonologie', name: 'Démonologie', theme: 'Le familier',
    tiers: [
      [t('demon_robuste', 'Démon robuste', 'Ton familier inflige +2 dégâts et donne +2 blocage.', { fx: { petBonus: 2 } }),
        t('peau_demoniaque', 'Peau démoniaque', '+10 PV max.', { maxHp: 10 })],
      [t('invocation_rapide', 'Invocation rapide', 'Les Invocations de la Succube et du Molosse infernal ne coûtent plus d\'éclat.', { fx: { quickSummon: 1 } }),
        t('lien_maitre', 'Lien du maître', 'Chaque fois que ton familier agit, gagne 3 blocage.', { fx: { petBlock: 3 } })],
      [t('t_pacte_demoniaque', 'Pacte démoniaque', 'Ajoute ce sort à ta barre : ton familier agit deux fois de plus.', { spell: 'pacte_demoniaque' }),
        t('t_pierre_ame', 'Pierre d\'âme', 'Ajoute ce sort à ta barre : 1 éclat, tu reviens à 30 % de tes PV si tu tombes à 0.', { spell: 'pierre_ame' })],
      [t('maitre_invocateur', 'Maître invocateur', 'Ton familier agit deux fois au tout début de chaque combat.', { fx: { petOpening: 2 } }),
        t('d_quatrieme_emplacement_b', 'Quatrième emplacement', 'Ta barre de sorts gagne un 4e emplacement.', { barSlots: 1 })],
      [t('t_seigneur_infernal', 'Invocation : Seigneur infernal', 'Carte épique : un exemplaire dans ton deck de départ.', { card: 'seigneur_infernal' })],
    ],
    cards: ['ordre_assaut', 'pacte_ombres', 'rituel_invocateur', 'festin_demoniaque', 'lien_vital', 'invocation_succube', 'invocation_molosse',
      'liens_demoniaques', 'eclat_partage', 'lien_ame', 'sacrifice_demoniaque', 'asservissement', 'maitre_pactes', 'seigneur_infernal'],
  },
  {
    id: 'destruction', name: 'Destruction', theme: 'Ombre et flammes',
    tiers: [
      [t('trait_ombre_ameliore', 'Trait de l\'ombre amélioré', 'Trait de l\'ombre inflige +5 dégâts.', { fx: { shadowBoltBonus: 5 } }),
        t('devastation', 'Dévastation', 'Immolation inflige +3 dégâts par tour.', { fx: { immolationBonus: 3 } })],
      [t('pyroclasme', 'Pyroclasme', 'Pluie de feu et Déflagration d\'ombre démoralisent (1 tour).', { fx: { pyroclasm: 1 } }),
        t('intensite', 'Intensité', 'Pacte de sang ne coûte que 3 PV.', { fx: { bloodPactCost: 2 } })],
      [t('t_brulure_ombre', 'Brûlure de l\'ombre', 'Ajoute ce sort à ta barre : 10 dégâts, +1 éclat si la cible meurt.', { spell: 'brulure_ombre' }),
        t('t_rempart_ombre', 'Rempart d\'ombre', 'Ajoute ce sort à ta barre : 10 blocage.', { spell: 'rempart_ombre' })],
      [t('ruine_amelioree', 'Ruine améliorée', 'Feu de l\'âme coûte 0 énergie (il coûte toujours 1 éclat).', { fx: { soulFireFree: 1 } }),
        t('embrasement_durable', 'Embrasement durable', 'Conflagration ne consomme plus l\'Immolation.', { fx: { keepImmolation: 1 } })],
      [t('t_cataclysme', 'Cataclysme de l\'âme', 'Carte épique : un exemplaire dans ton deck de départ.', { card: 'cataclysme' })],
    ],
    cards: ['trait_ombre', 'incinerer', 'immolation', 'deflagration_ombre', 'chaos_instable', 'conflagration', 'embrasement_ame',
      'ombre_et_flammes', 'contrecoup', 'feu_ame', 'trait_chaos', 'pacte_destruction', 'ruine', 'cataclysme'],
  },
];

/** Les arbres du Prêtre. */
export const PRETRE_TREES: TreeDef[] = [
  {
    id: 'discipline', name: 'Discipline', theme: 'L\'Égide',
    tiers: [
      [t('egide_amelioree', 'Égide améliorée', 'Tes cartes d\'Égide donnent +3 Égide.', { fx: { aegisBonus: 3 } }),
        t('volonte', 'Volonté', '+6 PV max.', { maxHp: 6 })],
      [t('meditation_profonde', 'Méditation profonde', 'Ton Égide maximale passe à 40.', { fx: { maxAegis: 40 } }),
        t('esprit_martyr', 'Esprit martyr', 'Quand ton Égide est entièrement détruite, pioche 2 cartes.', { fx: { martyr: 2 } })],
      [t('t_transfusion', 'Transfusion de puissance', 'Ajoute ce sort à ta barre : tes cartes coûtent 1 de moins ce tour-ci.', { spell: 'transfusion' }),
        t('t_focalisation_interieure', 'Focalisation intérieure', 'Ajoute ce sort à ta barre : ta prochaine carte coûte 0.', { spell: 'focalisation_interieure' })],
      [t('lumiere_interieure', 'Lumière intérieure', 'Commence chaque combat avec 8 Égide.', { fx: { startAegis: 8 } }),
        t('p_quatrieme_emplacement', 'Quatrième emplacement', 'Ta barre de sorts gagne un 4e emplacement.', { barSlots: 1 })],
      [t('t_egide_anciens', 'Égide des anciens', 'Carte épique : un exemplaire dans ton deck de départ.', { card: 'egide_anciens' })],
    ],
    cards: ['egide_renforcee', 'penitence', 'bastion_sacre', 'sacrifice_soi', 'priere_protection', 'discernement', 'eclat_foi',
      'rayon_lumiere', 'meditation_sacree', 'lumiere_persistante', 'clarte', 'expiation', 'ame_inebranlable', 'egide_anciens'],
  },
  {
    id: 'sacre', name: 'Sacré', theme: 'Soins et colère divine',
    tiers: [
      [t('soins_ameliores', 'Soins améliorés', 'Tes soins rendent +3 PV.', { fx: { healBonus: 3 } }),
        t('chatiment_ameliore', 'Châtiment amélioré', 'Châtiment et Châtiment ardent infligent +2 dégâts.', { fx: { smiteBonus: 2 } })],
      [t('foi_ardente', 'Foi ardente', 'Ta Foi maximale passe à 15.', { fx: { maxFaith: 15 } }),
        t('lumiere_benie', 'Lumière bénie', 'Chaque soin en trop te donne aussi 1 Foi.', { fx: { blessedLight: 1 } })],
      [t('t_priere_desesperee', 'Prière désespérée', 'Ajoute ce sort à ta barre : soigne 20 PV, une fois par combat.', { spell: 'priere_desesperee' }),
        t('t_nova_lumiere', 'Nova de lumière', 'Ajoute ce sort à ta barre : 6 dégâts à tous, soigne 6 PV.', { spell: 'nova_lumiere' })],
      [t('gardien_celeste', 'Gardien céleste', 'Ange gardien est Inné.', { fx: { guardianInnate: 1 } }),
        t('courroux_sacre', 'Courroux sacré', 'Courroux céleste inflige +1 dégât par point de Foi.', { fx: { wrathBonus: 1 } })],
      [t('t_ascension', 'Ascension lumineuse', 'Carte épique : un exemplaire dans ton deck de départ.', { card: 'ascension_lumineuse' })],
    ],
    cards: ['chatiment_ardent', 'feu_sacre', 'soins_superieurs', 'cercle_soins', 'grace_divine', 'colere_divine', 'lumiere_eclatante',
      'sol_sacre', 'chant_lumiere', 'cantique', 'courroux_celeste', 'ange_gardien', 'esprit_guerison', 'ascension_lumineuse'],
  },
  {
    id: 'ombre', name: 'Ombre', theme: 'DoT et dégâts mentaux',
    tiers: [
      [t('douleur_amelioree', 'Douleur améliorée', 'Murmure de douleur inflige +2 dégâts par tour.', { fx: { painBonus: 2 } }),
        t('concentration_ombre', 'Concentration de l\'ombre', 'Fouet psychique frappe une fois de plus.', { fx: { flayExtra: 1 } })],
      [t('ombres_tenaces', 'Ombres tenaces', 'Tes DoT durent 1 tour de plus.', { fx: { dotDuration: 1 } }),
        t('esprit_sombre', 'Esprit sombre', 'Attaque mentale inflige +4 dégâts.', { fx: { mindBlastBonus: 4 } })],
      [t('t_silence', 'Silence', 'Ajoute ce sort à ta barre : Interruption.', { spell: 'silence' }),
        t('t_cri_psychique', 'Cri psychique', 'Ajoute ce sort à ta barre : ennemis Apeurés, boss Démoralisés.', { spell: 'cri_psychique' })],
      [t('puissance_vide', 'Puissance du vide', 'Commence chaque combat avec 1 Puissance.', { fx: { startPuissance: 1 } }),
        t('faim_vampirique', 'Faim vampirique', 'Étreinte vampirique soigne 1 PV de plus.', { fx: { vampHunger: 1 } })],
      [t('t_forme_ombre', 'Forme d\'Ombre', 'Carte épique : un exemplaire dans ton deck de départ.', { card: 'forme_ombre' })],
    ],
    cards: ['murmure_douleur', 'attaque_mentale', 'fouet_psychique', 'eclat_ombre', 'voile_ombre', 'murmures_neant', 'toucher_vampirique',
      'murmure_mort', 'etreinte_vampirique', 'esprit_tourmente', 'peste_mentale', 'controle_mental', 'tenebres_interieures', 'forme_ombre'],
  },
];

/** Les arbres du Voleur. */
export const VOLEUR_TREES: TreeDef[] = [
  {
    id: 'assassinat', name: 'Assassinat', theme: 'Poisons et coups mortels',
    tiers: [
      [t('lames_malicieuses', 'Lames malicieuses', 'Attaque sinistre inflige +2 dégâts.', { fx: { sinisterBonus: 2 } }),
        t('poison_renforce', 'Poison renforcé', 'Tes applications de Poison sont augmentées de 1.', { fx: { poisonBonus: 1 } })],
      [t('finesse_meurtriere', 'Finesse meurtrière', 'Tes finishers qui infligent des dégâts infligent +3 dégâts par point de combo.', { fx: { finisherBonus: 3 } }),
        t('reflexes', 'Réflexes', 'Coup aux reins retarde aussi l\'Incantation en cours d\'un boss.', { fx: { kidneyDelay: 1 } })],
      [t('t_coup_de_pied', 'Coup de pied', 'Ajoute ce sort à ta barre : Interruption, 3 dégâts.', { spell: 'coup_de_pied' }),
        t('t_voile_obscur', 'Voile de l\'ombre', 'Ajoute ce sort à ta barre : retire tous tes débuffs, une fois par combat.', { spell: 'voile_obscur' })],
      [t('impitoyable', 'Impitoyable', 'Tes finishers comptent comme s\'ils avaient 1 point de combo de plus.', { fx: { ruthless: 1 } }),
        t('v_quatrieme_emplacement_a', 'Quatrième emplacement', 'Ta barre de sorts gagne un 4e emplacement.', { barSlots: 1 })],
      [t('t_vendetta', 'Vendetta', 'Carte épique : un exemplaire dans ton deck de départ.', { card: 'vendetta' })],
    ],
    cards: ['mutiler', 'frappe_gorge', 'fiole_venin', 'rupture', 'poison_affaiblissant', 'poison_engourdissant', 'envenimer',
      'garrot', 'sang_froid', 'toxines_virulentes', 'lames_empoisonnees', 'opportunite', 'coup_au_coeur', 'vendetta'],
  },
  {
    id: 'combat', name: 'Combat', theme: 'Attaques en série',
    tiers: [
      [t('precision', 'Précision', 'Tes Attaques infligent +1 dégât.', { fx: { attackBonus: 1 } }),
        t('v_endurance', 'Endurance', '+6 PV max.', { maxHp: 6 })],
      [t('agression', 'Agression', 'Commence chaque combat avec 2 points de combo.', { fx: { startCombo: 2 } }),
        t('lames_sanglantes', 'Lames sanglantes', 'Tes Attaques qui coûtent 0 infligent +2 dégâts.', { fx: { zeroCostBonus: 2 } })],
      [t('t_poussee_adrenaline', 'Poussée d\'adrénaline', 'Ajoute ce sort à ta barre : +2 énergie.', { spell: 'poussee_adrenaline' }),
        t('t_evasion', 'Évasion', 'Ajoute ce sort à ta barre : les Attaques ennemies infligent 50 % de moins jusqu\'à ton prochain tour.', { spell: 'evasion' })],
      [t('t_coup_de_pied_combat', 'Coup de pied', 'Ajoute ce sort à ta barre (si tu ne l\'as pas déjà) : Interruption, 3 dégâts.', { spell: 'coup_de_pied' }),
        t('maitre_d_armes', 'Maître d\'armes', 'Double frappe et Valse des lames frappent une fois de plus.', { fx: { weaponMaster: 1 } })],
      [t('t_frenesie_meurtriere', 'Frénésie meurtrière', 'Carte épique : un exemplaire dans ton deck de départ.', { card: 'frenesie_meurtriere' })],
    ],
    cards: ['double_frappe', 'tir_pistolet', 'riposte_voleur', 'esquive_agile', 'remise_en_garde', 'bagarreur', 'frappe_elan',
      'coup_bas', 'tourbillon_lames', 'second_souffle', 'valse_lames', 'embrocher', 'ambidextrie_experte', 'frenesie_meurtriere'],
  },
  {
    id: 'finesse', name: 'Finesse', theme: 'Ombres et ouvertures',
    tiers: [
      [t('maitre_discretion', 'Maître de la discrétion', 'Tes Ouvertures et Coup dans le dos infligent +4 dégâts.', { fx: { openerBonus: 4 } }),
        t('pas_de_velours', 'Pas de velours', 'La première carte que tu joues dans chaque combat coûte 0.', { fx: { firstCardFree: 1 } })],
      [t('prepare', 'Préparé', 'Tes Ouvertures donnent +1 combo.', { fx: { openerCombo: 1 } }),
        t('insaisissable', 'Insaisissable', 'Esquive et Esquive agile donnent +2 blocage.', { fx: { evadeBonus: 2 } })],
      [t('t_disparition', 'Disparition', 'Ajoute ce sort à ta barre : 10 blocage, tu redeviens Camouflé.', { spell: 'disparition' }),
        t('t_preparation', 'Préparation', 'Ajoute ce sort à ta barre : remet à zéro tes autres sorts, une fois par combat.', { spell: 'preparation' })],
      [t('ombres_profondes', 'Ombres profondes', 'Ton Camouflage de début de combat dure 2 tours.', { fx: { longStealth: 1 } }),
        t('v_quatrieme_emplacement_f', 'Quatrième emplacement', 'Ta barre de sorts gagne un 4e emplacement.', { barSlots: 1 })],
      [t('t_seigneur_ombres', 'Seigneur des ombres', 'Carte épique : un exemplaire dans ton deck de départ.', { card: 'seigneur_ombres' })],
    ],
    cards: ['coup_dans_le_dos', 'hemorragie', 'premeditation', 'lame_ombre', 'plan_parfait', 'bond_ombre', 'fumigene',
      'initiative', 'marque_mort', 'coup_fourre', 'egorgement', 'opportuniste', 'tenebres_voleur', 'seigneur_ombres'],
  },
];

/** Les arbres du Paladin. */
export const PALADIN_TREES: TreeDef[] = [
  {
    id: 'sacre_pal', name: 'Sacré', theme: 'Soins et lumière',
    tiers: [
      [t('lumiere_amelioree', 'Lumière améliorée', 'Tes cartes de soin rendent +2 PV.', { fx: { healBonus: 2 } }),
        t('esprit_divin', 'Esprit divin', '+6 PV max.', { maxHp: 6 })],
      [t('purification_rapide', 'Purification rapide', 'Lumière purificatrice coûte 0.', { fx: { purifyFree: 1 } }),
        t('sagesse_accrue', 'Sagesse accrue', 'Le Jugement du Sceau de sagesse donne 1 énergie de plus.', { fx: { wisdomBonus: 1 } })],
      [t('t_imposition_mains', 'Imposition des mains', 'Ajoute ce sort à ta barre : sous 30 % de tes PV, soigne 30 % de tes PV max, une fois par combat.', { spell: 'imposition_mains' }),
        t('t_purification_pal', 'Purification', 'Ajoute ce sort à ta barre : Dissipation (Magie, Poison, Maladie).', { spell: 'purification_pal' })],
      [t('pa_lumiere_benie', 'Lumière bénie', 'Chaque soin te donne aussi un quart de son montant en blocage.', { fx: { blessedHealBlock: 1 } }),
        t('pa_quatrieme_emplacement_s', 'Quatrième emplacement', 'Ta barre de sorts gagne un 4e emplacement.', { barSlots: 1 })],
      [t('t_avatar_lumiere', 'Avatar de lumière', 'Carte épique : un exemplaire dans ton deck de départ.', { card: 'avatar_lumiere' })],
    ],
    cards: ['lumiere_sacree', 'onde_sacree', 'main_sacree', 'lueur_protectrice', 'eclair_foi', 'sceau_sagesse', 'faveur_divine',
      'lumiere_purificatrice', 'rayonnement', 'grace_croise', 'illumination', 'benediction_royale', 'aube_purificatrice', 'avatar_lumiere'],
  },
  {
    id: 'protection_pal', name: 'Protection', theme: 'Le bouclier',
    tiers: [
      [t('bouclier_ameliore', 'Bouclier amélioré', 'Tes cartes de blocage donnent +1 blocage.', { fx: { blockBonus: 1 } }),
        t('pa_robustesse', 'Robustesse', '+8 PV max.', { maxHp: 8 })],
      [t('devotion_accrue', 'Dévotion accrue', 'L\'Aura de dévotion donne 1 Robustesse de plus.', { fx: { devotionBonus: 1 } }),
        t('garde_sacree', 'Garde sacrée', 'Commence chaque combat avec 8 blocage.', { fx: { startBlock: 8 } })],
      [t('t_bouclier_divin', 'Bouclier divin', 'Ajoute ce sort à ta barre (1 énergie) : immunisé à tous les dégâts jusqu\'à ton prochain tour.', { spell: 'bouclier_divin' }),
        t('t_marteau_jugement', 'Marteau du jugement', 'Ajoute ce sort à ta barre : Interruption, 6 dégâts, la cible est Contrôlée 1 tour.', { spell: 'marteau_jugement' })],
      [t('consecration_durable', 'Consécration durable', 'Consécration dure 1 tour de plus.', { fx: { consecrationLong: 1 } }),
        t('retribution', 'Rétribution', 'Juste châtiment coûte 0.', { fx: { retributionFree: 1 } })],
      [t('t_bouclier_croise', 'Bouclier du croisé', 'Carte épique : un exemplaire dans ton deck de départ.', { card: 'bouclier_croise' })],
    ],
    cards: ['bouclier_beni', 'pavois_sacre', 'marteau_piete', 'resolution_sacree', 'garde_vigilante', 'consecration', 'bouclier_lance',
      'sceau_rempart', 'sanctuaire', 'fervent', 'aura_epines', 'dernier_serment', 'juste_chatiment', 'bouclier_croise'],
  },
  {
    id: 'vindicte', name: 'Vindicte', theme: 'La croisade',
    tiers: [
      [t('jugements_rapides', 'Jugements rapides', 'La recharge de Jugement passe à 1 tour.', { fx: { judgeCd: 1 } }),
        t('pa_precision', 'Précision', 'Commence chaque combat avec 1 Puissance.', { fx: { startPuissance: 1 } })],
      [t('sceaux_benis', 'Sceaux bénis', 'Tous les Sceaux coûtent 0.', { fx: { sealsFree: 1 } }),
        t('conviction', 'Conviction', 'Tes Attaques infligent +3 dégâts aux Morts-vivants et aux Démons.', { fx: { holyBonus: 3 } })],
      [t('t_ailes_justice', 'Ailes de justice', 'Ajoute ce sort à ta barre : +2 Puissance pendant 3 tours.', { spell: 'ailes_justice' }),
        t('t_marteau_jugement_v', 'Marteau du jugement', 'Ajoute ce sort à ta barre (si tu ne l\'as pas déjà) : Interruption, 6 dégâts, Contrôle 1 tour.', { spell: 'marteau_jugement' })],
      [t('vengeance_divine', 'Vengeance divine', 'Après un Jugement, ta prochaine Attaque inflige +4 dégâts.', { fx: { vengeanceDivine: 4 } }),
        t('double_sceau', 'Double sceau', 'Tu peux avoir 2 Sceaux actifs en même temps. Jugement les consomme tous les deux.', { fx: { doubleSeal: 1 } })],
      [t('t_verdict_cieux', 'Verdict des cieux', 'Carte épique : un exemplaire dans ton deck de départ.', { card: 'verdict_cieux' })],
    ],
    cards: ['lame_justice', 'ferveur', 'frappe_divine', 'inquisition', 'tourbillon_sacre', 'sceau_vengeance', 'marteau_chatiment',
      'zele', 'science_combat', 'exaltation', 'repentance', 'vengeance_pal', 'croisade', 'verdict_cieux'],
  },
];

/** Les arbres du Chasseur. Référence : docs/classes/CHASSEUR.md (§7) */
export const CHASSEUR_TREES: TreeDef[] = [
  {
    id: 'betes', name: 'Maîtrise des bêtes', theme: 'Le compagnon',
    tiers: [
      [t('compagnon_robuste', 'Compagnon robuste', 'Ton compagnon inflige +1 dégât.', { fx: { compBonus: 1 } }),
        t('lien_endurant', 'Lien endurant', '+6 PV max.', { maxHp: 6 })],
      [t('ferocite', 'Férocité', 'Les attaques de ton compagnon appliquent Saignement 1.', { fx: { compBleed: 1 } }),
        t('esprit_animal', 'Esprit animal', 'Ton compagnon agit une fois au tout début de chaque combat.', { fx: { compOpening: 1 } })],
      [t('t_fureur_bestiale', 'Fureur bestiale', 'Ajoute ce sort à ta barre : ton compagnon agit 3 fois.', { spell: 'fureur_bestiale' }),
        t('t_feindre_mort', 'Feindre la mort', 'Ajoute ce sort à ta barre : les attaques ennemies t\'infligent 50 % de dégâts en moins jusqu\'à ton prochain tour.', { spell: 'feindre_mort' })],
      [t('maitre_meute', 'Maître de meute', 'Esprit de meute coûte 0.', { fx: { packFree: 1 } }),
        t('h_quatrieme_emplacement_b', 'Quatrième emplacement', 'Ta barre de sorts gagne un 4e emplacement.', { barSlots: 1 })],
      [t('t_fureur_primitive', 'Fureur primitive', 'Carte épique : un exemplaire dans ton deck de départ.', { card: 'fureur_primitive' })],
    ],
    cards: ['ordre_attaque', 'ordre_protege', 'ordre_hurlement', 'ordre_egorge', 'bete_interieure', 'rage_compagnon', 'morsure_partagee',
      'lien_sauvage', 'frenesie_chasseur', 'intimidation_bete', 'dressage', 'esprit_meute', 'instinct_tueur', 'fureur_primitive'],
  },
  {
    id: 'precision', name: 'Précision', theme: 'Le tireur d\'élite',
    tiers: [
      [t('tirs_ameliores', 'Tirs améliorés', 'Tir et Tir ajusté infligent +2 dégâts.', { fx: { shotBonus: 2 } }),
        t('oeil_faucon', 'Œil de faucon', 'Marque de la proie donne +1 dégât de plus.', { fx: { markBonus: 1 } })],
      [t('mortalite', 'Mortalité', 'Tir fatal triple ses dégâts sous 30 % de PV au lieu de 20 %.', { fx: { fatalBonus: 10 } }),
        t('h_sang_froid', 'Sang-froid', 'Ta première Attaque de chaque combat coûte 0.', { fx: { hunterFirstFree: 1 } })],
      [t('t_tir_rapide', 'Tir rapide', 'Ajoute ce sort à ta barre : tes Attaques coûtent 1 de moins ce tour-ci.', { spell: 'tir_rapide' }),
        t('t_fleche_museliere', 'Flèche muselière', 'Ajoute ce sort à ta barre : Interruption, 3 dégâts.', { spell: 'fleche_museliere' })],
      [t('tireur_elite', 'Tireur d\'élite', 'Tes Attaques qui coûtent 2 énergie ou plus infligent +3 dégâts.', { fx: { heavyAttackBonus: 3 } }),
        t('h_quatrieme_emplacement_p', 'Quatrième emplacement', 'Ta barre de sorts gagne un 4e emplacement.', { barSlots: 1 })],
      [t('t_tir_du_coeur', 'Tir du cœur', 'Carte épique : un exemplaire dans ton deck de départ.', { card: 'tir_du_coeur' })],
    ],
    cards: ['tir_ajuste', 'tir_percant', 'tir_rafale', 'tir_double', 'fleche_ardente', 'concentration_tir', 'respiration_lente',
      'tir_fatal', 'visee_assuree', 'salve', 'tir_precision', 'calme_absolu', 'maitre_tireur', 'tir_du_coeur'],
  },
  {
    id: 'survie', name: 'Survie', theme: 'Pièges et corps à corps',
    tiers: [
      [t('pieges_ameliores', 'Pièges améliorés', 'Tes Pièges infligent +3 dégâts (+1 par tour pour les DoT).', { fx: { trapBonus: 3 } }),
        t('h_endurance', 'Endurance', '+8 PV max.', { maxHp: 8 })],
      [t('h_reflexes', 'Réflexes', 'Désengagement donne +3 blocage de plus.', { fx: { disengageBonus: 3 } }),
        t('piegeur_ne', 'Piégeur né', 'Commence chaque combat avec un Piège explosif posé.', { fx: { startTrap: 1 } })],
      [t('t_fleche_apaisante', 'Flèche apaisante', 'Ajoute ce sort à ta barre : retire les buffs de la cible, suspend le Berserk d\'un boss.', { spell: 'fleche_apaisante' }),
        t('t_feindre_mort_s', 'Feindre la mort', 'Ajoute ce sort à ta barre (si tu ne l\'as pas déjà) : les attaques ennemies t\'infligent 50 % de dégâts en moins.', { spell: 'feindre_mort' })],
      [t('instinct_chasseur', 'Instinct du chasseur', 'Quand un de tes Pièges se déclenche, gagne 1 énergie au prochain tour (1 fois par tour).', { fx: { trapEnergy: 1 } }),
        t('survivant', 'Survivant', 'À la fin de chaque combat gagné, soigne 4 PV.', { fx: { healAfterCombat: 4 } })],
      [t('t_champ_pieges', 'Champ de pièges', 'Carte épique : un exemplaire dans ton deck de départ.', { card: 'champ_pieges' })],
    ],
    cards: ['piege_immolation', 'piege_venin', 'riposte_sauvage', 'coup_hachette', 'desengagement', 'lancer_filet', 'sens_aiguises',
      'piege_explosif', 'contre_attaque', 'dard_paralysant', 'instinct_survie', 'maitre_pieges', 'pieges_serie', 'champ_pieges'],
  },
];

/** Les arbres du Druide. Référence : docs/classes/DRUIDE.md (§7) */
export const DRUIDE_TREES: TreeDef[] = [
  {
    id: 'equilibre', name: 'Équilibre', theme: 'La forme astrale',
    tiers: [
      [t('colere_amelioree', 'Colère améliorée', 'Colère inflige +2 dégâts.', { fx: { wrathDruidBonus: 2 } }),
        t('lune_ardente', 'Lune ardente', 'Feu de lune inflige +1 dégât par tour.', { fx: { moonfireBonus: 1 } })],
      [t('lumiere_stellaire', 'Lumière stellaire', 'Une fois par tour, Feu stellaire coûte 1 de moins.', { fx: { starfireDiscount: 1 } }),
        t('nature_implacable', 'Nature implacable', 'Tes DoT durent 1 tour de plus.', { fx: { dotDuration: 1 } })],
      [t('t_cyclone', 'Cyclone', 'Ajoute ce sort à ta barre (1 énergie) : Contrôle 2 tours, Interruption contre un boss.', { spell: 'cyclone' }),
        t('t_ecorce', 'Écorce', 'Ajoute ce sort à ta barre : −30 % de dégâts subis jusqu\'à ton prochain tour.', { spell: 'ecorce' })],
      [t('equilibre_parfait', 'Équilibre parfait', 'Éclipse est Inné.', { fx: { eclipseInnate: 1 } }),
        t('dr_quatrieme_emplacement_e', 'Quatrième emplacement', 'Ta barre de sorts gagne un 4e emplacement.', { barSlots: 1 })],
      [t('t_convergence', 'Convergence céleste', 'Carte épique : un exemplaire dans ton deck de départ.', { card: 'convergence' })],
    ],
    cards: ['forme_astrale', 'feu_stellaire', 'eclat_lunaire', 'nuee_insectes', 'lueur_lunaire', 'etoiles_filantes', 'rayon_lunaire',
      'typhon', 'grace_nature', 'puissance_astrale', 'ouragan', 'eclipse', 'sylvains', 'convergence'],
  },
  {
    id: 'farouche', name: 'Combat farouche', theme: 'L\'ours et le félin',
    tiers: [
      [t('dr_ferocite', 'Férocité', 'Tes Attaques d\'Ours et de Félin infligent +2 dégâts.', { fx: { feralBonus: 2 } }),
        t('fourrure_epaisse', 'Fourrure épaisse', '+8 PV max.', { maxHp: 8 })],
      [t('rage_instinctive', 'Rage instinctive', 'En forme d\'ours, à la fin de ton tour, gagne 1 blocage par point de rage.', { fx: { rageBlock: 1 } }),
        t('instinct_predateur', 'Instinct du prédateur', 'Prendre la forme de félin donne 1 point de combo.', { fx: { catEnterCombo: 1 } })],
      [t('t_regeneration_sauvage', 'Régénération sauvage', 'Ajoute ce sort à ta barre : en Ours, dépense ta rage, soigne 2 PV par point.', { spell: 'regeneration_sauvage' }),
        t('t_instinct_survie_druide', 'Instinct de survie', 'Ajoute ce sort à ta barre : 15 blocage.', { spell: 'instinct_survie_druide' })],
      [t('metamorphose_rapide', 'Métamorphose rapide', 'Une fois par tour, changer de forme avec le bouton coûte 0.', { fx: { freeShift: 1 } }),
        t('dr_quatrieme_emplacement_f', 'Quatrième emplacement', 'Ta barre de sorts gagne un 4e emplacement.', { barSlots: 1 })],
      [t('t_coeur_sauvage', 'Cœur sauvage', 'Carte épique : un exemplaire dans ton deck de départ.', { card: 'coeur_sauvage' })],
    ],
    cards: ['forme_ours', 'coup_de_griffe', 'rugissement', 'revers_patte', 'rage_frenetique', 'charge_farouche', 'cuir_epais', 'instinct_protecteur',
      'forme_felin', 'griffure', 'laceration', 'morsure_feroce', 'dechirure', 'roder', 'fureur_tigre', 'coeur_sauvage'],
  },
  {
    id: 'restauration', name: 'Restauration', theme: 'La sève qui guérit',
    tiers: [
      [t('dr_soins_ameliores', 'Soins améliorés', 'Tes soins rendent +2 PV.', { fx: { healBonus: 2 } }),
        t('ecorce_naturelle', 'Écorce naturelle', 'Commence chaque combat avec 6 blocage.', { fx: { startBlock: 6 } })],
      [t('renouveau_ameliore', 'Renouveau amélioré', 'Renouveau et Rétablissement soignent 1 PV de plus par tour.', { fx: { renewBonus: 1 } }),
        t('harmonie', 'Harmonie', 'En forme normale, chaque soin te donne la moitié de son montant en blocage.', { fx: { harmony: 1 } })],
      [t('t_renaissance', 'Renaissance', 'Ajoute ce sort à ta barre : une fois par combat, reviens à 40 % de tes PV si tu tombes à 0.', { spell: 'renaissance' }),
        t('t_benediction_sylvestre', 'Bénédiction sylvestre', 'Ajoute ce sort à ta barre (1 énergie) : soigne 8 PV, gagne 8 blocage.', { spell: 'benediction_sylvestre' })],
      [t('racines_vie', 'Racines de vie', 'À la fin de chaque combat gagné, soigne 4 PV.', { fx: { healAfterCombat: 4 } }),
        t('dr_quatrieme_emplacement_r', 'Quatrième emplacement', 'Ta barre de sorts gagne un 4e emplacement.', { barSlots: 1 })],
      [t('t_arbre_vie', 'Arbre de vie', 'Carte épique : un exemplaire dans ton deck de départ.', { card: 'arbre_vie' })],
    ],
    cards: ['toucher_guerisseur', 'retablissement', 'ecorce_vive', 'bourgeon', 'fleurs_sauvages', 'enracinement', 'pollen_apaisant',
      'eclosion', 'germination', 'elan_nature', 'esprit_foret', 'tranquillite', 'symbiose', 'arbre_vie'],
  },
];

/** Les arbres de chaque classe jouable. */
export const CLASS_TREES: Record<string, TreeDef[]> = { guerrier: TREES, mage: MAGE_TREES, demoniste: DEMONISTE_TREES, pretre: PRETRE_TREES, voleur: VOLEUR_TREES, paladin: PALADIN_TREES, chasseur: CHASSEUR_TREES, druide: DRUIDE_TREES };

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

/** Le coût d'un palier : 1 point, 3 pour le palier 5 (la carte épique). */
export const EPIC_TIER_COST = 3;
export function tierCost(tier: number): number {
  return tier === 4 ? EPIC_TIER_COST : 1;
}

/** Les points dépensés dans un arbre (7 pour un arbre complet). */
export function treePoints(picks: Choice[]): number {
  return picks.reduce((a, _c, tier) => a + tierCost(tier), 0);
}

export function pointsUsed(alloc: TalentAlloc): number {
  return Object.values(alloc).reduce((a, picks) => a + treePoints(picks), 0);
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
  if (tier !== picks.length || pointsUsed(alloc) + tierCost(tier) > points) return false;
  picks.push(choice);
  return true;
}

/**
 * Ramène la répartition dans les limites (points disponibles). Sert aussi aux anciennes sauvegardes,
 * d'avant le palier 5 à 3 points : un 5 + 5 devient 7 + 3 (le premier arbre complet garde sa carte épique).
 */
export function clampAlloc(alloc: TalentAlloc, points: number, classId = 'guerrier'): TalentAlloc {
  const ids = treesFor(classId).map((tree) => tree.id);
  const a: TalentAlloc = Object.fromEntries(ids.map((id) => [id, [...(alloc[id] ?? [])]]));
  while (pointsUsed(a) > points) {
    const full = ids.filter((id) => a[id].length === 5);
    // Plus de points que permis : on retire d'abord les cartes épiques en trop (on garde la première),
    // puis le dernier palier de l'arbre le plus long qui n'est pas complet.
    const open = ids.filter((id) => a[id].length > 0 && a[id].length < 5);
    const from = full.length > 1 ? full[full.length - 1]
      : open.length ? open.reduce((x, y) => (a[x].length >= a[y].length ? x : y))
        : ids.reduce((x, y) => (a[x].length >= a[y].length ? x : y));
    a[from].pop();
  }
  return a;
}
