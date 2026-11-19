// L'équipement : 6 emplacements (Arme, Amulette, 2 Bagues, 2 Bijoux) et les objets du prototype.
// Référence : docs/CONCEPT.md (§12.2 et §12.7) et docs/actes/ACTE1_PROFONDEURS_ARDENTES.md (§5)

export type Slot = 'arme' | 'amulette' | 'bague' | 'bijou';
export type SlotKey = 'arme' | 'amulette' | 'bague1' | 'bague2' | 'bijou1' | 'bijou2';
export type ItemRarity = 'commun' | 'rare' | 'epique' | 'legendaire';

export const SLOT_KEYS: SlotKey[] = ['arme', 'amulette', 'bague1', 'bague2', 'bijou1', 'bijou2'];

export const SLOT_LABEL: Record<SlotKey, string> = {
  arme: 'Arme', amulette: 'Amulette', bague1: 'Bague', bague2: 'Bague', bijou1: 'Bijou', bijou2: 'Bijou',
};

export function slotOf(key: SlotKey): Slot {
  return key.startsWith('bague') ? 'bague' : key.startsWith('bijou') ? 'bijou' : (key as Slot);
}

/** Les effets possibles d'un objet. Tous les effets d'un même type s'additionnent. */
export interface ItemEffects {
  attackBonus?: number; // +X dégâts aux Attaques
  lowHpBonus?: number; // +X dégâts aux Attaques contre une cible sous 50 % de PV
  firstAttackBonus?: number; // +X dégâts à la première Attaque de chaque combat
  heavyAttackBonus?: number; // +X dégâts aux Attaques qui coûtent 2 énergie ou plus
  spellBonus?: number; // +X dégâts aux Sorts
  bleedFirstAttack?: number; // la première Attaque de chaque tour applique Saignement X
  bleedBonus?: number; // tes Saignements sont augmentés de X
  healOnAttack?: number; // chaque Attaque qui touche soigne X PV
  healOnKill?: number; // soigne X PV quand un ennemi meurt
  onKillAoe?: number; // quand un ennemi meurt, X dégâts à tous les autres
  startAoe?: number; // au début du combat, X dégâts à tous les ennemis
  startBlock?: number; // commence chaque combat avec X blocage
  startPuissance?: number; // commence chaque combat avec X Puissance
  startRobustesse?: number; // commence chaque combat avec X Robustesse
  startRage?: number; // commence chaque combat avec X rage
  startDemoralise?: number; // au début du combat, tous les ennemis sont Démoralisés X tours
  startFardeau?: number; // au début du combat, X Fardeaux dans ta pioche
  firstTurnEnergy?: number; // +X énergie au premier tour de chaque combat
  firstTurnDraw?: number; // pioche X cartes de plus au premier tour de chaque combat
  firstCardFree?: number; // la première carte jouée de chaque combat coûte 0
  blockBonus?: number; // tes cartes de blocage donnent +X blocage
  blockReflect?: number; // quand tu bloques entièrement une attaque, renvoie X dégâts
  bigHitAoe?: number; // quand tu perds 10 PV ou plus en une fois, X dégâts à tous les ennemis
  nonAttackReduce?: number; // les dégâts qui ne viennent pas d'une attaque sont réduits de X
  magmaPuissance?: number; // tous les 2 tours, +1 Puissance (X au maximum par combat)
  zoneReduce?: number; // les Zones de feu infligent X % de dégâts en moins
  zoneBlock?: number; // jouer une Zone de feu (« Bouger ») donne X blocage
  interruptDraw?: number; // interrompre une incantation pioche X cartes
  castCancel?: number; // une fois par combat, la première incantation ennemie est annulée
  debuffReduce?: number; // les malédictions que tu subis durent X tour(s) de moins
  purify?: number; // au début de ton tour, dissipe une malédiction
  panicImmune?: number; // immunisé aux cartes Paniquées
  seeTwoIntents?: number; // tu vois les deux prochaines intentions des ennemis
  allyBonus?: number; // tes alliés (familier, totems…) infligent +X dégâts
  chestChoice?: number; // les coffres proposent 2 objets au choix
  potionSlots?: number; // +X emplacements de potion
  rageOnHpLoss?: number; // +X rage quand tu perds des PV
  executeAlways?: number; // Exécution inflige toujours son bonus
  // Talents du Mage
  startCharges?: number; // charges arcaniques au début du combat
  noOverload?: number; // la Surcharge ne coûte plus de PV
  barrageDraw?: number; // Barrage arcanique pioche X de plus
  burnBonus?: number; // +X à chaque application de Brûlure
  fireballBonus?: number; // Boule de feu +X dégâts
  brasier?: number; // +X Brûlure sur une cible qui en a déjà 5
  startBurn?: number; // Brûlure à tous les ennemis au début du combat
  fireSpellCd?: number; // recharge de Combustion et Souffle ardent −X
  bossBurnKeep?: number; // la Brûlure des boss ne diminue plus
  gelBonus?: number; // +X à chaque application de Gel
  // Talents du Démoniste
  corruptionBonus?: number; // Corruption inflige +X par tour
  curseDuration?: number; // tes Malédictions durent X tours de plus
  harvestShard?: number; // +X éclat quand un ennemi meurt avec un de tes DoT
  doubleCurse?: number; // chaque ennemi peut porter 2 de tes Malédictions
  naturalContagion?: number; // à la mort d'un ennemi, ses DoT passent à un autre
  petBonus?: number; // ton familier inflige +X dégâts et donne +X blocage
  quickSummon?: number; // les Invocations (sauf le Seigneur infernal) ne coûtent plus d'éclat
  petBlock?: number; // +X blocage chaque fois que ton familier agit
  petOpening?: number; // ton familier agit au début de chaque combat
  shadowBoltBonus?: number; // Trait de l'ombre +X dégâts
  immolationBonus?: number; // Immolation +X dégâts par tour
  pyroclasm?: number; // Pluie de feu et Déflagration d'ombre démoralisent
  bloodPactCost?: number; // Pacte de sang coûte X PV de moins
  soulFireFree?: number; // Feu de l'âme coûte 0 énergie
  keepImmolation?: number; // Conflagration ne consomme plus l'Immolation
  dotDuration?: number; // tes DoT durent X tours de plus (Bâton du Veilleur)
  freePact?: number; // une fois par tour, Pacte de sang ne coûte pas de PV
  // Talents du Prêtre
  aegisBonus?: number; // tes cartes d'Égide donnent +X Égide
  maxAegis?: number; // Égide maximale
  martyr?: number; // Égide entièrement détruite : pioche X cartes
  startAegis?: number; // Égide au début du combat
  healBonus?: number; // tes soins rendent +X PV
  smiteBonus?: number; // Châtiment et Châtiment ardent +X dégâts
  maxFaith?: number; // Foi maximale
  blessedLight?: number; // un soin excédentaire donne X Foi
  guardianInnate?: number; // Ange gardien est Inné
  wrathBonus?: number; // Courroux céleste +X dégâts par point de Foi
  painBonus?: number; // Murmure de douleur +X par tour
  flayExtra?: number; // Fouet psychique frappe X fois de plus
  mindBlastBonus?: number; // Attaque mentale +X dégâts
  vampHunger?: number; // Étreinte vampirique soigne X PV de plus
  equinoxe?: number; // le légendaire du Prêtre
  // Talents du Voleur
  sinisterBonus?: number; // Attaque sinistre +X dégâts
  poisonBonus?: number; // tes applications de Poison +X
  evisBonus?: number; // Éviscération +X dégâts par point de combo
  kidneyDelay?: number; // Coup aux reins retarde l'Incantation d'un boss
  ruthless?: number; // tes finishers comptent X points de combo de plus
  startCombo?: number; // points de combo au début du combat
  weaponMaster?: number; // Double frappe et Valse des lames frappent X fois de plus
  openerBonus?: number; // tes Ouvertures +X dégâts
  openerCombo?: number; // tes Ouvertures donnent +X combo
  evadeBonus?: number; // Esquive et Esquive agile +X blocage
  longStealth?: number; // le Camouflage de début de combat dure 2 tours
  stormblade?: number; // le légendaire du Voleur
  // Talents du Paladin
  wisdomBonus?: number; // le Jugement du Sceau de sagesse donne +X énergie
  purifyFree?: number; // Lumière purificatrice coûte 0
  blessedHealBlock?: number; // chaque soin donne la moitié de son montant en blocage
  devotionBonus?: number; // Aura de dévotion +X Robustesse
  consecrationLong?: number; // Consécration dure X tour de plus
  retributionFree?: number; // Juste châtiment coûte 0
  judgeCd?: number; // la recharge de Jugement baisse de X
  sealsFree?: number; // les Sceaux coûtent 0
  holyBonus?: number; // tes Attaques +X dégâts aux Morts-vivants et aux Démons
  vengeanceDivine?: number; // après un Jugement, la prochaine Attaque +X dégâts
  doubleSeal?: number; // deux Sceaux actifs à la fois
  aurore?: number; // le légendaire du Paladin
  gelKeep?: number; // le Gel ne diminue plus
  freezeEarly?: number; // Gelé à 5 − X cumuls
  shatterBonus?: number; // Fracasser +X dégâts
  freezeEnergy?: number; // +X énergie quand un ennemi devient Gelé
  iceBlockCd?: number; // recharge de Carapace de glace −X
  // Effets des talents
  strikeBonus?: number; // Frappe et Frappe héroïque : +X dégâts
  postureRage?: number; // rage conservée en changeant de posture (3 par défaut)
  bleedDuration?: number; // les Saignements durent X tours de plus
  heavyBleed?: number; // les Attaques à 2 énergie ou plus appliquent Saignement X
  executeThreshold?: number; // seuil (en %) du bonus d'Exécution (30 par défaut)
  killRage?: number; // tuer un ennemi : +X rage
  killDraw?: number; // tuer un ennemi : pioche X cartes
  turnRage?: number; // +X rage au début de chaque tour
  shoutBonus?: number; // cartes de Cri : +X rage, Démoralisé +X tour
  zeroCostBonus?: number; // Attaques à 0 énergie : +X dégâts
  maxRage?: number; // rage maximale
  frenzyEnergy?: number; // 3e Attaque du tour : +X énergie
  maxHp?: number; // +X PV max
  healAfterCombat?: number; // soigne X PV à la fin de chaque combat gagné
  // Butin de Vulkhar et de l'acte 2
  attackBurn?: number; // tes Attaques appliquent Brûlure X
  turnEnergy?: number; // +X énergie à chaque tour
  turnDraw?: number; // pioche X cartes de plus à chaque tour
  turnSelfDamage?: number; // tu subis X dégâts au début de chacun de tes tours
  noRest?: number; // tu ne peux plus te reposer aux feux de camp
  startZone?: number; // chaque combat commence avec X Zones de feu en main
  skillCost?: number; // tes Compétences coûtent X de plus
  fewerCards?: number; // les récompenses proposent X carte de moins
  killEnergy?: number; // tuer un ennemi : +X énergie (1 fois par tour)
  startBlockPerEnemy?: number; // X blocage par ennemi au début du combat
  breathReduce?: number; // les Souffles infligent X % de dégâts en moins
  comboBonus?: number; // +X dégâts par Attaque déjà jouée ce tour-ci
  hurtBonus?: number; // perdre des PV : ta prochaine Attaque +X
  enrageDelay?: number; // l'enrage des boss arrive X tours plus tard
  attackCycle?: number; // tes Attaques alternent Brûlure, Ralenti et Démoralisé
  stackCap?: number; // les débuffs cumulables que tu subis sont plafonnés à X
  statusDraw?: number; // quand une carte-statut arrive dans ta main, pioche X carte
  killPuissance?: number; // quand un ennemi meurt : +X Puissance pour le combat
  startRandomBonus?: number; // un bonus au hasard au début de chaque combat
  attackDebuff?: number; // tes Attaques appliquent un débuff au hasard (1 tour)
  purifyEvery2?: number; // dissipe 1 débuff tous les 2 tours
  afflictionImmune?: number; // les Afflictions de sang n'ont pas d'effet
  startFiole?: number; // X Fioles instables en main au début du combat
  potionBoost?: number; // tes potions sont X % plus fortes
  luck?: number; // les effets au hasard choisissent le meilleur résultat 1 fois sur 2
  undeadBonus?: number; // +X dégâts contre les Morts-vivants
  dragonBonus?: number; // +X dégâts contre les Dragons
  cheatDeath?: number; // une fois par combat, tu restes à 1 PV au lieu de mourir
  pesteImmune?: number; // immunisé à la Peste
  aoeBonus?: number; // tes effets de zone infligent +X dégâts
  petDamage?: number; // fin de ton tour : X dégâts à un ennemi au hasard
  lineageImmune?: number; // immunisé à la Malédiction de lignée
  firstSpellFree?: number; // le premier Sort de chaque tour coûte 0 (Bâton du Veilleur)
  // Effets d'événements de l'acte 2 (bonus valables jusqu'à la fin de l'acte)
  startToxine?: number; // Toxine au début du prochain combat (fiole du laboratoire)
  extraHurt?: number; // tu subis X dégâts de plus par attaque (sang noir de l'autel)
  startDragonFracture?: number; // les Dragons commencent avec Armure fracassée X tours
}

export interface ItemDef {
  id: string;
  name: string;
  slot: Slot;
  rarity: ItemRarity;
  text: string;
  fx: ItemEffects;
}

const item = (id: string, name: string, slot: Slot, rarity: ItemRarity, text: string, fx: ItemEffects): ItemDef =>
  ({ id, name, slot, rarity, text, fx });

export const ITEMS: Record<string, ItemDef> = Object.fromEntries([
  // --- Objets que l'on trouve partout (coffres, vendeur) ---
  item('epee_longue', 'Épée longue', 'arme', 'commun', 'Tes Attaques infligent +1 dégât.', { attackBonus: 1 }),
  item('hache_de_guerre', 'Hache de guerre', 'arme', 'rare', 'Tes Attaques infligent +1 dégât, et +3 contre une cible sous 50 % de PV.', { attackBonus: 1, lowHpBonus: 2 }),
  item('amulette_vigueur', 'Amulette de vigueur', 'amulette', 'commun', '+8 PV max.', { maxHp: 8 }),
  item('amulette_rempart', 'Amulette du rempart', 'amulette', 'commun', 'Commence chaque combat avec 6 blocage.', { startBlock: 6 }),
  item('amulette_sang', 'Amulette du sang versé', 'amulette', 'rare', 'Soigne 3 PV chaque fois qu\'un ennemi meurt.', { healOnKill: 3 }),
  item('anneau_force', 'Anneau de force', 'bague', 'rare', 'Commence chaque combat avec 1 Puissance.', { startPuissance: 1 }),
  item('anneau_soldat', 'Anneau du soldat', 'bague', 'commun', '+4 PV max.', { maxHp: 4 }),
  item('bague_vivacite', 'Bague de vivacité', 'bague', 'rare', 'Pioche 1 carte de plus au premier tour de chaque combat.', { firstTurnDraw: 1 }),
  item('pierre_braise', 'Pierre de braise', 'bijou', 'commun', 'Soigne 4 PV à la fin de chaque combat gagné.', { healAfterCombat: 4 }),
  item('charme_epines', 'Charme d\'épines', 'bijou', 'commun', 'Quand tu bloques entièrement une attaque, renvoie 2 dégâts à l\'attaquant.', { blockReflect: 2 }),
  item('talisman_rage', 'Talisman de rage', 'bijou', 'rare', 'Commence chaque combat avec 3 rage.', { startRage: 3 }),
  item('baguette_apprenti', 'Baguette d\'apprenti', 'arme', 'commun', 'Tes Sorts infligent +1 dégât.', { spellBonus: 1 }),
  item('baton_braises', 'Bâton de braises', 'arme', 'rare', 'Tes Sorts infligent +1 dégât, et tes Brûlures sont augmentées de 1.', { spellBonus: 1, burnBonus: 1 }),
  item('pierre_arcanique', 'Pierre arcanique', 'bijou', 'rare', 'Commence chaque combat avec 1 charge arcanique.', { startCharges: 1 }),

  // --- Morvax le Maudisseur ---
  item('bague_impie', 'Bague de l\'impie', 'bague', 'rare', 'Les malédictions que tu subis durent 1 tour de moins.', { debuffReduce: 1 }),
  item('grimoire_morvax', 'Grimoire de Morvax', 'bijou', 'rare', 'Au début de chaque combat, tous les ennemis sont Démoralisés 2 tours.', { startDemoralise: 2 }),
  item('lame_maudite', 'Lame maudite', 'arme', 'rare', 'Tes Attaques infligent +3 dégâts. Au début de chaque combat, un Fardeau est ajouté à ta pioche.', { attackBonus: 3, startFardeau: 1 }),
  item('amulette_purification', 'Amulette de purification', 'amulette', 'rare', 'Au début de ton tour, dissipe automatiquement une malédiction.', { purify: 1 }),

  // --- Croc-de-lave, le Molosse ancestral ---
  item('collier_crocs', 'Collier de crocs', 'amulette', 'rare', '+6 PV max. Tu es immunisé aux cartes Paniquées.', { maxHp: 6, panicImmune: 1 }),
  item('croc_de_lave', 'Croc de lave', 'bijou', 'rare', 'Ta première Attaque de chaque tour applique Saignement 2.', { bleedFirstAttack: 2 }),
  item('hache_molosse', 'Hache du molosse', 'arme', 'rare', 'Tes Attaques infligent +2 dégâts, et +4 contre une cible sous 50 % de PV.', { attackBonus: 2, lowHpBonus: 2 }),
  item('anneau_chasseur', 'Anneau du chasseur de lave', 'bague', 'rare', 'Commence chaque combat avec 1 Puissance et 2 rage.', { startPuissance: 1, startRage: 2 }),

  // --- Sœur Cendrine ---
  item('amulette_cendres', 'Amulette des cendres', 'amulette', 'rare', 'Les Zones de feu t\'infligent 50 % de dégâts en moins.', { zoneReduce: 50 }),
  item('encensoir_ardent', 'Encensoir ardent', 'bijou', 'rare', 'Quand tu joues une Zone de feu (« Bouger »), gagne 4 blocage.', { zoneBlock: 4 }),
  item('bague_pretresse', 'Bague de la prêtresse', 'bague', 'rare', 'Soigne 5 PV à la fin de chaque combat gagné.', { healAfterCombat: 5 }),
  item('fleau_cendrine', 'Fléau de Cendrine', 'arme', 'rare', 'Tes Attaques infligent +2 dégâts.', { attackBonus: 2 }),

  // --- Gorlok le Fragmenté ---
  item('eclat_gorlok', 'Éclat de Gorlok', 'bijou', 'rare', 'Quand un ennemi meurt, il explose : 5 dégâts à tous les autres ennemis.', { onKillAoe: 5 }),
  item('masse_basalte', 'Masse de basalte', 'arme', 'rare', 'Tes Attaques infligent +2 dégâts. Ta première Attaque de chaque combat inflige +10 dégâts.', { attackBonus: 2, firstAttackBonus: 10 }),
  item('anneau_pierre', 'Anneau de pierre', 'bague', 'rare', 'Commence chaque combat avec 1 Robustesse.', { startRobustesse: 1 }),
  item('amulette_granit', 'Amulette de granit', 'amulette', 'rare', 'Commence chaque combat avec 8 blocage.', { startBlock: 8 }),

  // --- Le Baron Vossk ---
  item('coeur_bombe', 'Cœur de la bombe', 'bijou', 'rare', 'Quand tu perds 10 PV ou plus en une fois, inflige 8 dégâts à tous les ennemis.', { bigHitAoe: 8 }),
  item('bague_mana_brulant', 'Bague de mana brûlant', 'bague', 'rare', '+1 énergie au premier tour de chaque combat.', { firstTurnEnergy: 1 }),
  item('sceptre_baron', 'Sceptre du Baron', 'arme', 'rare', 'Tes Sorts infligent +2 dégâts. Tes Saignements sont augmentés de 1.', { spellBonus: 2, bleedBonus: 1 }),
  item('amulette_inferno', 'Amulette de l\'inferno', 'amulette', 'rare', 'Les dégâts qui ne viennent pas d\'une attaque (feu, explosions, poisons) sont réduits de 2.', { nonAttackReduce: 2 }),

  // --- Zhaal le Tisseur d'arcanes ---
  item('bague_tisseur', 'Bague du tisseur', 'bague', 'rare', 'La première carte que tu joues dans chaque combat coûte 0.', { firstCardFree: 1 }),
  item('orbe_distorsion', 'Orbe de distorsion', 'bijou', 'rare', 'Une fois par combat, la première incantation ennemie qui se termine est annulée.', { castCancel: 1 }),
  item('dague_arcanique', 'Dague arcanique', 'arme', 'rare', 'Tes Sorts infligent +2 dégâts. Pioche 1 carte de plus au premier tour de chaque combat.', { spellBonus: 2, firstTurnDraw: 1 }),
  item('amulette_clairvoyance', 'Amulette de clairvoyance', 'amulette', 'rare', 'Tu vois les deux prochaines intentions de chaque ennemi.', { seeTwoIntents: 1 }),

  // --- Le Héraut Brannoc ---
  item('etendard_heraut', 'Étendard du héraut', 'bijou', 'rare', 'Commence chaque combat avec 1 Puissance et 1 Robustesse.', { startPuissance: 1, startRobustesse: 1 }),
  item('marteau_brannoc', 'Marteau de Brannoc', 'arme', 'rare', 'Tes Attaques infligent +2 dégâts et te soignent de 1 PV.', { attackBonus: 2, healOnAttack: 1 }),
  item('bague_commandement', 'Bague de commandement', 'bague', 'rare', 'Chaque fois que tu interromps une incantation, pioche 1 carte.', { interruptDraw: 1 }),
  item('amulette_heraut', 'Amulette du héraut', 'amulette', 'rare', '+5 PV max. Soigne 5 PV à la fin de chaque combat gagné.', { maxHp: 5, healAfterCombat: 5 }),

  // --- Krâgg le Mange-roche ---
  item('poing_kragg', 'Poing de Krâgg', 'arme', 'rare', 'Tes Attaques qui coûtent 2 énergie ou plus infligent +6 dégâts.', { heavyAttackBonus: 6 }),
  item('collier_mange_roche', 'Collier du mange-roche', 'amulette', 'rare', '+10 PV max.', { maxHp: 10 }),
  item('pierre_magma', 'Pierre de magma', 'bijou', 'rare', 'Tous les 2 tours, gagne 1 Puissance (3 au maximum par combat).', { magmaPuissance: 3 }),
  item('bague_molosses', 'Bague des molosses', 'bague', 'rare', 'Tes alliés (familier, compagnon, totems, invocations) infligent +2 dégâts.', { allyBonus: 2 }),

  // --- Le Grand Intendant Saldris ---
  item('baton_intendant', 'Bâton de l\'intendant', 'arme', 'rare', 'Tes Attaques infligent +1 dégât, et tes cartes de blocage donnent +2 blocage.', { attackBonus: 1, blockBonus: 2 }),
  item('miroir_intendant', 'Miroir de l\'intendant', 'bijou', 'rare', 'Quand tu bloques entièrement une attaque, renvoie 4 dégâts à l\'attaquant.', { blockReflect: 4 }),
  item('trousseau_intendant', 'Trousseau de l\'intendant', 'bijou', 'rare', 'Les coffres te proposent 2 objets au choix au lieu d\'un.', { chestChoice: 1 }),
  // --- Légendaires de classe ---
  item('brisemonts', 'Brisemonts', 'arme', 'legendaire', 'Gagne 1 rage de plus chaque fois que tu perds des PV. Exécution inflige toujours son bonus de dégâts, quels que soient les PV de la cible.', { rageOnHpLoss: 1, executeAlways: 1 }),

  item('amulette_intendant', 'Amulette de l\'intendant', 'amulette', 'rare', 'Tu as 1 emplacement de potion de plus.', { potionSlots: 1 }),
].map((d) => [d.id, d]));

// --- Butin de Vulkhar et de l'acte 2 (docs/actes/ACTE1_PROFONDEURS_ARDENTES.md §6, ACTE2_AIRE_DE_VHAERYX.md §5 et §6) ---
Object.assign(ITEMS, Object.fromEntries([
  // Vulkhar
  item('coeur_vulkhar', 'Cœur de Vulkhar', 'bijou', 'rare', 'Au début de chaque combat, applique Brûlure 5 à tous les ennemis.', { startBurn: 5 }),
  item('masse_flammes', 'Masse des flammes', 'arme', 'rare', 'Tes Attaques infligent +3 dégâts et appliquent Brûlure 1.', { attackBonus: 3, attackBurn: 1 }),
  item('collier_souverain', 'Collier du Souverain', 'amulette', 'rare', '+8 PV max. Les Zones de feu ne t\'infligent plus de dégâts.', { maxHp: 8, zoneReduce: 100 }),
  item('anneau_lave', 'Anneau de lave éternelle', 'bague', 'rare', 'Commence chaque combat avec 1 Puissance et 1 Robustesse.', { startPuissance: 1, startRobustesse: 1 }),
  // Butin de boss de Vulkhar (épique)
  item('coeur_magma', 'Cœur de magma', 'bijou', 'epique', '+1 énergie par tour. Tu subis 3 dégâts au début de chacun de tes tours.', { turnEnergy: 1, turnSelfDamage: 3 }),
  item('flamme_captive', 'Flamme captive', 'bijou', 'epique', '+1 énergie par tour. Tu ne peux plus te reposer aux feux de camp.', { turnEnergy: 1, noRest: 1 }),
  item('sceau_souverain', 'Sceau du Souverain', 'amulette', 'epique', 'Pioche 1 carte de plus par tour. −10 PV max.', { turnDraw: 1, maxHp: -10 }),
  item('oeil_brasier', 'Œil du brasier', 'bijou', 'epique', 'Tu vois les deux prochaines intentions des ennemis. Chaque combat commence avec 1 Zone de feu dans ta main.', { seeTwoIntents: 1, startZone: 1 }),
  item('marteau_profondeurs', 'Marteau des profondeurs', 'arme', 'epique', 'Tes Attaques infligent +5 dégâts. Tes Compétences coûtent 1 de plus.', { attackBonus: 5, skillCost: 1 }),
  item('couronne_cendres', 'Couronne de cendres', 'amulette', 'epique', '+1 énergie par tour. Les récompenses ne proposent plus que 2 cartes.', { turnEnergy: 1, fewerCards: 1 }),
  // Skarn
  item('sceptre_gardien', 'Sceptre du gardien', 'arme', 'rare', 'Tes Attaques infligent +2 dégâts. Quand tu tues un ennemi, gagne 1 énergie (1 fois par tour).', { attackBonus: 2, killEnergy: 1 }),
  item('oeuf_petrifie', 'Œuf pétrifié', 'bijou', 'rare', 'Au début de chaque combat, gagne 6 blocage par ennemi.', { startBlockPerEnemy: 6 }),
  item('bague_dompteur', 'Bague du dompteur', 'bague', 'rare', 'Tes alliés (familier, compagnon, totems, invocations) infligent +3 dégâts.', { allyBonus: 3 }),
  item('amulette_couvoirs', 'Amulette des couvoirs', 'amulette', 'rare', '+8 PV max.', { maxHp: 8 }),
  // Ysolde
  item('ecaille_ysolde', 'Écaille d\'Ysolde', 'amulette', 'rare', 'Les Souffles t\'infligent 30 % de dégâts en moins.', { breathReduce: 30 }),
  item('griffe_rouge', 'Griffe rouge', 'arme', 'rare', 'Tes Attaques infligent +3 dégâts.', { attackBonus: 3 }),
  item('coeur_ardent', 'Cœur ardent', 'bijou', 'rare', 'Au premier tour de chaque combat, gagne 2 énergie de plus.', { firstTurnEnergy: 2 }),
  item('bague_delivrance', 'Bague de la délivrance', 'bague', 'rare', 'Les débuffs que tu subis durent 1 tour de moins.', { debuffReduce: 1 }),
  // Draksis
  item('fouet_contremaitre', 'Fouet du contremaître', 'arme', 'rare', 'Tes Attaques et tes Sorts infligent +1 dégât par Attaque ou Sort déjà joué ce tour-ci.', { comboBonus: 1 }),
  item('medaille_endurance', 'Médaille de l\'endurance', 'amulette', 'rare', '+12 PV max.', { maxHp: 12 }),
  item('bague_rage', 'Bague de la rage', 'bague', 'rare', 'Chaque fois que tu perds des PV, ta prochaine Attaque ou ton prochain Sort inflige +3 dégâts.', { hurtBonus: 3 }),
  item('sablier_brise', 'Sablier brisé', 'bijou', 'rare', 'L\'enrage des boss arrive 2 tours plus tard.', { enrageDelay: 2 }),
  // Les Trois Souffles
  item('croc_trois_souffles', 'Croc des trois souffles', 'arme', 'rare', 'Tes Attaques et tes Sorts appliquent, à tour de rôle : Brûlure 2, Ralenti 1, Démoralisé 1.', { attackCycle: 1 }),
  item('ecaille_ombre', 'Écaille d\'ombre', 'bijou', 'rare', 'Les débuffs cumulables que tu subis (Ombre rongeuse) sont plafonnés à 3.', { stackCap: 3 }),
  item('amulette_cendre', 'Amulette de cendre', 'amulette', 'rare', 'Quand une carte-statut arrive dans ta main, pioche 1 carte.', { statusDraw: 1 }),
  item('bague_meute', 'Bague de la meute', 'bague', 'rare', 'Quand un ennemi meurt, gagne 1 Puissance pour ce combat.', { killPuissance: 1 }),
  // Prismagor
  item('coeur_chromatique', 'Cœur chromatique', 'bijou', 'rare', 'Au début de chaque combat, un bonus au hasard : +1 Puissance, +1 Robustesse, +1 énergie au premier tour, ou 10 blocage.', { startRandomBonus: 1 }),
  item('croc_prismagor', 'Croc de Prismagor', 'arme', 'rare', 'Tes Attaques et tes Sorts appliquent un débuff au hasard (1 tour) : Ralenti, Démoralisé ou Armure fracassée.', { attackDebuff: 1 }),
  item('amulette_sang_pur', 'Amulette de sang pur', 'amulette', 'rare', 'Tous les 2 tours, au début de ton tour, dissipe automatiquement un débuff.', { purifyEvery2: 1 }),
  item('bague_cinq_tetes', 'Bague des cinq têtes', 'bague', 'rare', '+5 PV max. Les Afflictions de sang n\'ont pas d\'effet sur toi.', { maxHp: 5, afflictionImmune: 1 }),
  // Grizzik
  item('cle_grizzik', 'Clé à molette de Grizzik', 'arme', 'rare', 'Tes Attaques infligent +2 dégâts. Au début de chaque combat, une Fiole instable arrive dans ta main.', { attackBonus: 2, startFiole: 1 }),
  item('ceinture_fioles', 'Ceinture à fioles', 'amulette', 'rare', 'Tu as 2 emplacements de potion de plus.', { potionSlots: 2 }),
  item('lunettes_alchimiste', 'Lunettes de l\'alchimiste', 'bijou', 'rare', 'Tes potions ont un effet 50 % plus fort.', { potionBoost: 50 }),
  item('bague_chance', 'Bague de la chance', 'bague', 'rare', 'Les effets au hasard (Fioles instables, Cœur chromatique…) choisissent le meilleur résultat 1 fois sur 2.', { luck: 1 }),
  // Ossyrax
  item('os_dragon', 'Os de dragon taillé', 'arme', 'rare', 'Tes Attaques infligent +2 dégâts, et +5 contre les Morts-vivants.', { attackBonus: 2, undeadBonus: 5 }),
  item('phylactere_brise', 'Phylactère brisé', 'bijou', 'rare', 'La première fois de chaque combat que tu tomberais à 0 PV, tu restes à 1 PV.', { cheatDeath: 1 }),
  item('amulette_outre_tombe', 'Amulette de l\'outre-tombe', 'amulette', 'rare', 'Tu es immunisé à la Peste et aux cartes Paniquées.', { pesteImmune: 1, panicImmune: 1 }),
  item('bague_necromancien', 'Bague du nécromancien', 'bague', 'rare', 'Quand un ennemi meurt, soigne 3 PV.', { healOnKill: 3 }),
  // Vashka
  item('lance_couvee', 'Lance de la couvée', 'arme', 'rare', 'Tes Attaques infligent +2 dégâts, et +4 contre les Dragons.', { attackBonus: 2, dragonBonus: 4 }),
  item('coquille_vashka', 'Coquille de Vashka', 'amulette', 'rare', 'Commence chaque combat avec 10 blocage.', { startBlock: 10 }),
  item('bague_mere', 'Bague de la mère', 'bague', 'rare', 'Tes effets de zone infligent +2 dégâts.', { aoeBonus: 2 }),
  item('dragonnet_compagnie', 'Dragonnet de compagnie', 'bijou', 'rare', 'À la fin de chacun de tes tours, un petit dragonnet inflige 3 dégâts à un ennemi au hasard.', { petDamage: 3 }),
  // Vhaeryx
  item('sceau_aire', 'Sceau de l\'Aire', 'bijou', 'rare', 'Au début de chaque combat, les ennemis Dragons reçoivent Armure fracassée 2 tours.', { startDragonFracture: 2 }),
  item('lame_alchimiste', 'Lame du Dragon-Alchimiste', 'arme', 'rare', 'Tes Attaques et tes Sorts infligent +3 dégâts.', { attackBonus: 3, spellBonus: 3 }),
  item('elixir_chromatique', 'Élixir chromatique', 'amulette', 'rare', '+10 PV max. Au début de chaque combat, un bonus au hasard.', { maxHp: 10, startRandomBonus: 1 }),
  item('bague_lignee', 'Bague de lignée', 'bague', 'rare', 'La Malédiction de lignée est sans effet sur toi.', { lineageImmune: 1 }),
  // Légendaire du Mage
  item('baton_veilleur', 'Bâton du Veilleur', 'arme', 'legendaire', 'Le premier Sort de chaque tour coûte 0.', { firstSpellFree: 1 }),
  item('equinoxe', 'Équinoxe', 'arme', 'legendaire', 'Dans la Lumière : tes soins rendent +3 PV et chaque soin te donne 1 Foi. En Forme d\'Ombre : tes DoT infligent +2 dégâts et chacun de leurs ticks te soigne de 1 PV.', { equinoxe: 1 }),
  item('aurore_ardente', 'L\'Aurore ardente', 'arme', 'legendaire', 'Tes Jugements infligent double dégâts aux Morts-vivants et aux Démons, et te soignent de 5 PV.', { aurore: 1 }),
  item('sillon_orage', 'Sillon d\'orage', 'arme', 'legendaire', 'Toutes les 3 Attaques que tu joues, un éclair inflige 6 dégâts à tous les ennemis.', { stormblade: 1 }),
  item('baton_veilleur_demo', 'Bâton du Veilleur (Démoniste)', 'arme', 'legendaire', 'Une fois par tour, Pacte de sang ne coûte pas de PV. Tes DoT durent 1 tour de plus.', { freePact: 1, dotDuration: 1 }),
].map((d) => [d.id, d])));

/** La table de loot de chaque boss de fin d'acte, et son butin épique (un au choix parmi 3). */
export const BOSS_LOOT: Record<number, { table: string[]; epics: string[] }> = {
  1: {
    table: ['coeur_vulkhar', 'masse_flammes', 'collier_souverain', 'anneau_lave'],
    epics: ['coeur_magma', 'flamme_captive', 'sceau_souverain', 'oeil_brasier', 'marteau_profondeurs', 'couronne_cendres'],
  },
};

/** Les objets que l'on trouve dans les coffres et chez le vendeur. */
export const COMMON_POOL: string[] = [
  'epee_longue', 'hache_de_guerre', 'amulette_vigueur', 'amulette_rempart', 'amulette_sang', 'anneau_force',
  'anneau_soldat', 'bague_vivacite', 'pierre_braise', 'charme_epines', 'talisman_rage',
  'baguette_apprenti', 'baton_braises', 'pierre_arcanique',
];

/** Les effets qui ne servent qu'à certaines classes (les Attaques et la rage au Guerrier, les Sorts au Mage et au Démoniste…). */
const KEY_CLASSES: Partial<Record<keyof ItemEffects, string[]>> = {};
for (const k of ['startRage', 'rageOnHpLoss', 'executeAlways', 'maxRage', 'turnRage'] as const) KEY_CLASSES[k] = ['guerrier'];
// Les bonus aux Attaques servent au Guerrier, au Voleur et au Paladin.
for (const k of ['attackBonus', 'lowHpBonus', 'firstAttackBonus', 'heavyAttackBonus', 'bleedFirstAttack', 'bleedBonus', 'healOnAttack', 'attackBurn', 'undeadBonus', 'dragonBonus'] as const) KEY_CLASSES[k] = ['guerrier', 'voleur', 'paladin'];
for (const k of ['wisdomBonus', 'purifyFree', 'blessedHealBlock', 'devotionBonus', 'consecrationLong', 'retributionFree', 'judgeCd', 'sealsFree', 'holyBonus', 'vengeanceDivine', 'doubleSeal', 'aurore'] as const) KEY_CLASSES[k] = ['paladin'];
for (const k of ['sinisterBonus', 'poisonBonus', 'evisBonus', 'kidneyDelay', 'ruthless', 'startCombo', 'weaponMaster', 'openerBonus', 'openerCombo', 'evadeBonus', 'longStealth', 'stormblade'] as const) KEY_CLASSES[k] = ['voleur'];
for (const k of ['startCharges', 'burnBonus', 'firstSpellFree'] as const) KEY_CLASSES[k] = ['mage'];
KEY_CLASSES.spellBonus = ['mage', 'demoniste', 'pretre', 'paladin'];
for (const k of ['aegisBonus', 'maxAegis', 'martyr', 'startAegis', 'smiteBonus', 'maxFaith', 'blessedLight', 'equinoxe'] as const) KEY_CLASSES[k] = ['pretre'];
KEY_CLASSES.healBonus = ['pretre', 'paladin'];
KEY_CLASSES.allyBonus = ['demoniste'];
KEY_CLASSES.freePact = ['demoniste'];
KEY_CLASSES.dotDuration = ['demoniste', 'pretre'];

/** Les effets d'un objet qui ne servent pas à cette classe. */
export function uselessFx(id: string, classId = 'guerrier'): (keyof ItemEffects)[] {
  const keys = Object.keys(ITEMS[id]?.fx ?? {}) as (keyof ItemEffects)[];
  return keys.filter((k) => KEY_CLASSES[k] && !KEY_CLASSES[k]!.includes(classId));
}

/** L'objet ne sert à rien à cette classe. */
export function uselessFor(id: string, classId = 'guerrier'): boolean {
  const keys = Object.keys(ITEMS[id]?.fx ?? {});
  return keys.length > 0 && uselessFx(id, classId).length === keys.length;
}

/** Les tables de loot des boss secondaires (clé : id de la table, donnée par la rencontre). */
export const LOOT_TABLES: Record<string, string[]> = {
  morvax: ['bague_impie', 'grimoire_morvax', 'lame_maudite', 'amulette_purification'],
  croc: ['collier_crocs', 'croc_de_lave', 'hache_molosse', 'anneau_chasseur'],
  cendrine: ['amulette_cendres', 'encensoir_ardent', 'bague_pretresse', 'fleau_cendrine'],
  gorlok: ['eclat_gorlok', 'masse_basalte', 'anneau_pierre', 'amulette_granit'],
  vossk: ['coeur_bombe', 'bague_mana_brulant', 'sceptre_baron', 'amulette_inferno'],
  zhaal: ['bague_tisseur', 'orbe_distorsion', 'dague_arcanique', 'amulette_clairvoyance'],
  brannoc: ['etendard_heraut', 'marteau_brannoc', 'bague_commandement', 'amulette_heraut'],
  kragg: ['poing_kragg', 'collier_mange_roche', 'pierre_magma', 'bague_molosses'],
  saldris: ['baton_intendant', 'miroir_intendant', 'trousseau_intendant', 'amulette_intendant'],
  // Acte 2
  skarn: ['sceptre_gardien', 'oeuf_petrifie', 'bague_dompteur', 'amulette_couvoirs'],
  ysolde: ['ecaille_ysolde', 'griffe_rouge', 'coeur_ardent', 'bague_delivrance'],
  draksis: ['fouet_contremaitre', 'medaille_endurance', 'bague_rage', 'sablier_brise'],
  trois_souffles: ['croc_trois_souffles', 'ecaille_ombre', 'amulette_cendre', 'bague_meute'],
  prismagor: ['coeur_chromatique', 'croc_prismagor', 'amulette_sang_pur', 'bague_cinq_tetes'],
  grizzik: ['cle_grizzik', 'ceinture_fioles', 'lunettes_alchimiste', 'bague_chance'],
  ossyrax: ['os_dragon', 'phylactere_brise', 'amulette_outre_tombe', 'bague_necromancien'],
  vashka: ['lance_couvee', 'coquille_vashka', 'bague_mere', 'dragonnet_compagnie'],
  vhaeryx: ['sceau_aire', 'lame_alchimiste', 'elixir_chromatique', 'bague_lignee'],
};

export type Equipment = Record<SlotKey, string | null>;

/** Prix de la réparation d'un objet brisé chez le vendeur gobelin. */
export const REPAIR_PRICE: Record<ItemRarity, number> = { commun: 50, rare: 75, epique: 100, legendaire: 150 };

export function emptyEquipment(): Equipment {
  return { arme: null, amulette: null, bague1: null, bague2: null, bijou1: null, bijou2: null };
}

/** Additionne les effets de tout l'équipement porté (sauf les objets brisés). */
export function gearEffects(equipment: Equipment, broken: SlotKey[] = []): ItemEffects {
  const total: ItemEffects = {};
  for (const key of SLOT_KEYS) {
    const id = equipment[key];
    if (!id || broken.includes(key)) continue;
    for (const [k, v] of Object.entries(ITEMS[id].fx) as [keyof ItemEffects, number][]) {
      total[k] = (total[k] ?? 0) + v;
    }
  }
  return total;
}

/** Les emplacements où un objet peut aller. */
export function slotsFor(itemId: string): SlotKey[] {
  const slot = ITEMS[itemId].slot;
  return SLOT_KEYS.filter((k) => slotOf(k) === slot);
}
