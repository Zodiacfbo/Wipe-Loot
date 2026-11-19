// Les icônes de l'écran des talents.
// Une carte épique montre sa propre illustration. Les autres talents reprennent l'illustration d'une carte
// proche (`carte_<id>`), ou une icône dessinée pour eux (`talent_<id>`, tools/pixel/icones_talents.py).
import type { TalentDef } from './talents';

export const TALENT_ICONS: Record<string, string> = {
  // Guerrier
  lame_aiguisee: 'carte_frappe_heroique', maitrise_tactique: 'carte_concentration_martiale',
  plaies_profondes: 'carte_taillade', entaille: 'carte_entaille_profonde',
  t_coup_de_pommeau: 'carte_assommer', impact: 'carte_execution',
  implacable: 'carte_coup_de_grace', arme_lourde: 'carte_frappe_ecrasante',
  cruaute: 'carte_rage_sanglante', colere_interieure: 'carte_enrage',
  voix_de_stentor: 'carte_cri_de_guerre', main_gauche_talent: 'carte_main_gauche',
  t_rage_du_berserker: 'carte_hurlement_furieux', fureur_sans_fin: 'carte_furie_inextinguible',
  t_temerite: 'carte_ruee_sanguinaire', frenesie: 'carte_frappe_frenetique',
  bouclier_lourd: 'carte_coup_de_bouclier', robuste: 'carte_peau_de_fer',
  garde_haute: 'carte_garde_de_fer', presence_menacante: 'carte_cri_demoralisant',
  t_rempart: 'carte_bastion', t_cri_de_defi: 'carte_provocation',
  t_dernier_rempart: 'carte_ignorer_la_douleur', quatrieme_emplacement: 'talent_emplacement',
  // Mage
  subtilite_arcanique: 'carte_concentration_arcanique', meditation: 'carte_erudition',
  stabilite: 'carte_barriere', esprit_clair: 'carte_barrage_arcanique',
  t_evocation: 'carte_inspiration', t_pouvoir_arcanes: 'carte_explosion_des_arcanes',
  t_clignement: 'carte_image_miroir', m_quatrieme_emplacement: 'talent_emplacement',
  feu_intense: 'carte_chaleur_intense', m_impact: 'carte_boule_de_feu',
  brasier: 'carte_embrasement', souffle_du_dragon: 'carte_cone_de_flammes',
  t_combustion: 'carte_incendie', t_souffle_ardent: 'carte_explosion_de_flammes',
  pyromane: 'carte_pyromanie', flammes_eternelles: 'carte_eruption',
  hiver_precoce: 'carte_gelure', givre_durable: 'carte_morsure_du_froid',
  froid_glacial: 'carte_toucher_glacial', fragilite: 'carte_fragmentation',
  t_carapace_de_glace: 'carte_barriere_de_glace', t_orbe_glaciale: 'carte_nova_de_givre',
  coeur_gele: 'carte_coeur_de_glace', hiver_sans_fin: 'carte_tempete_de_neige',
  // Démoniste
  corruption_amelioree: 'carte_corruption', malediction_durable: 'carte_malediction_souffrance',
  moisson_ames: 'carte_moisson_sombre', double_malediction: 'carte_malediction_elements',
  t_amplifier: 'carte_tourment', t_spirale_mortelle: 'carte_hurlement_terreur',
  contagion_naturelle: 'carte_contagion', d_quatrieme_emplacement_a: 'talent_emplacement',
  demon_robuste: 'carte_ordre_assaut', peau_demoniaque: 'carte_armure_demoniaque',
  invocation_rapide: 'carte_rituel_invocateur', lien_maitre: 'carte_lien_vital',
  t_pacte_demoniaque: 'carte_pacte_ombres', t_pierre_ame: 'carte_pierre_de_vie_carte',
  maitre_invocateur: 'carte_maitre_pactes', d_quatrieme_emplacement_b: 'talent_emplacement',
  trait_ombre_ameliore: 'carte_trait_ombre', devastation: 'carte_immolation',
  pyroclasme: 'carte_pluie_de_feu', intensite: 'carte_pacte_noir',
  t_brulure_ombre: 'carte_ombre_et_flammes', t_rempart_ombre: 'carte_garde_sombre',
  ruine_amelioree: 'carte_feu_ame', embrasement_durable: 'carte_conflagration',
  // Prêtre
  egide_amelioree: 'carte_egide_renforcee', volonte: 'carte_ame_inebranlable',
  meditation_profonde: 'carte_meditation_sacree', esprit_martyr: 'carte_sacrifice_soi',
  t_transfusion: 'carte_inspiration_divine', t_focalisation_interieure: 'carte_clarte',
  lumiere_interieure: 'carte_priere_garde', p_quatrieme_emplacement: 'talent_emplacement',
  soins_ameliores: 'carte_soins_superieurs', chatiment_ameliore: 'carte_chatiment',
  foi_ardente: 'carte_eclat_foi', lumiere_benie: 'carte_lumiere_persistante',
  t_priere_desesperee: 'carte_grace_divine', t_nova_lumiere: 'carte_nova_sacree',
  gardien_celeste: 'carte_ange_gardien', courroux_sacre: 'carte_courroux_celeste',
  douleur_amelioree: 'carte_murmure_douleur', concentration_ombre: 'carte_fouet_psychique',
  ombres_tenaces: 'carte_murmures_neant', esprit_sombre: 'carte_attaque_mentale',
  t_silence: 'talent_silence', t_cri_psychique: 'carte_esprit_tourmente',
  puissance_vide: 'carte_tenebres_interieures', faim_vampirique: 'carte_etreinte_vampirique',
  // Voleur
  lames_malicieuses: 'carte_attaque_sinistre', poison_renforce: 'carte_poison_mortel',
  finesse_meurtriere: 'carte_evisceration', reflexes: 'carte_coup_aux_reins',
  t_coup_de_pied: 'talent_coup_de_pied', t_voile_obscur: 'carte_tenebres_voleur',
  impitoyable: 'carte_marque_mort', v_quatrieme_emplacement_a: 'talent_emplacement',
  precision: 'carte_embrocher', v_endurance: 'carte_second_souffle',
  agression: 'carte_initiative', lames_sanglantes: 'carte_coup_bas',
  t_poussee_adrenaline: 'talent_adrenaline', t_evasion: 'carte_esquive_agile',
  t_coup_de_pied_combat: 'talent_coup_de_pied', maitre_d_armes: 'carte_valse_lames',
  maitre_discretion: 'carte_embuscade', pas_de_velours: 'carte_bond_ombre',
  prepare: 'carte_premeditation', insaisissable: 'carte_esquive',
  t_disparition: 'carte_fumigene', t_preparation: 'carte_plan_parfait',
  ombres_profondes: 'talent_ombres_profondes', v_quatrieme_emplacement_f: 'talent_emplacement',
  // Paladin
  lumiere_amelioree: 'carte_lumiere_bienfaisante', esprit_divin: 'carte_benediction_royale',
  purification_rapide: 'carte_lumiere_purificatrice', sagesse_accrue: 'carte_sceau_sagesse',
  t_imposition_mains: 'carte_main_sacree', t_purification_pal: 'carte_aube_purificatrice',
  pa_lumiere_benie: 'carte_lueur_protectrice', pa_quatrieme_emplacement_s: 'talent_emplacement',
  bouclier_ameliore: 'carte_bouclier_beni', pa_robustesse: 'carte_resolution_sacree',
  devotion_accrue: 'carte_aura_devotion', garde_sacree: 'carte_garde_vigilante',
  t_bouclier_divin: 'carte_pavois_sacre', t_marteau_jugement: 'carte_marteau_chatiment',
  consecration_durable: 'carte_consecration', retribution: 'carte_juste_chatiment',
  jugements_rapides: 'carte_frappe_divine', pa_precision: 'carte_zele',
  sceaux_benis: 'carte_sceau_lumiere', conviction: 'carte_exorcisme',
  t_ailes_justice: 'carte_exaltation', t_marteau_jugement_v: 'carte_marteau_chatiment',
  vengeance_divine: 'carte_vengeance_pal', double_sceau: 'carte_sceau_croise',
};

/** Le fichier de l'icône d'un talent (dans public/assets/). */
export function talentIcon(def: TalentDef): string {
  return `${def.card ? `carte_${def.card}` : TALENT_ICONS[def.id] ?? 'talent_emplacement'}.png`;
}
