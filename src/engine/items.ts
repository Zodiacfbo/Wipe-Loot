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

/** Les objets que l'on trouve dans les coffres et chez le vendeur. */
export const COMMON_POOL: string[] = [
  'epee_longue', 'hache_de_guerre', 'amulette_vigueur', 'amulette_rempart', 'amulette_sang', 'anneau_force',
  'anneau_soldat', 'bague_vivacite', 'pierre_braise', 'charme_epines', 'talisman_rage',
];

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
