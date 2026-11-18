// L'équipement : 6 emplacements (Arme, Amulette, 2 Bagues, 2 Bijoux) et les objets du prototype.
// Référence : docs/CONCEPT.md (§12.2 et §12.7) et docs/actes/ACTE1_PROFONDEURS_ARDENTES.md (§5)

export type Slot = 'arme' | 'amulette' | 'bague' | 'bijou';
export type SlotKey = 'arme' | 'amulette' | 'bague1' | 'bague2' | 'bijou1' | 'bijou2';
export type ItemRarity = 'commun' | 'rare' | 'epique';

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
  bleedFirstAttack?: number; // la première Attaque de chaque tour applique Saignement X
  healOnAttack?: number; // chaque Attaque qui touche soigne X PV
  onKillAoe?: number; // quand un ennemi meurt, X dégâts à tous les autres
  startAoe?: number; // au début du combat, X dégâts à tous les ennemis
  startBlock?: number; // commence chaque combat avec X blocage
  startPuissance?: number; // commence chaque combat avec X Puissance
  startRobustesse?: number; // commence chaque combat avec X Robustesse
  firstTurnEnergy?: number; // +X énergie au premier tour de chaque combat
  zoneReduce?: number; // les Zones de feu infligent X % de dégâts en moins
  zoneBlock?: number; // jouer une Zone de feu (« Bouger ») donne X blocage
  interruptDraw?: number; // interrompre une incantation pioche X cartes
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

export const ITEMS: Record<string, ItemDef> = {
  // --- Objets que l'on trouve partout (coffres, vendeur) ---
  epee_longue: { id: 'epee_longue', name: 'Épée longue', slot: 'arme', rarity: 'commun', text: 'Tes Attaques infligent +1 dégât.', fx: { attackBonus: 1 } },
  hache_de_guerre: { id: 'hache_de_guerre', name: 'Hache de guerre', slot: 'arme', rarity: 'rare', text: 'Tes Attaques infligent +2 dégâts, et +4 contre une cible sous 50 % de PV.', fx: { attackBonus: 2, lowHpBonus: 2 } },
  amulette_vigueur: { id: 'amulette_vigueur', name: 'Amulette de vigueur', slot: 'amulette', rarity: 'commun', text: '+8 PV max.', fx: { maxHp: 8 } },
  amulette_rempart: { id: 'amulette_rempart', name: 'Amulette du rempart', slot: 'amulette', rarity: 'commun', text: 'Commence chaque combat avec 6 blocage.', fx: { startBlock: 6 } },
  anneau_force: { id: 'anneau_force', name: 'Anneau de force', slot: 'bague', rarity: 'rare', text: 'Commence chaque combat avec 1 Puissance.', fx: { startPuissance: 1 } },
  anneau_pierre: { id: 'anneau_pierre', name: 'Anneau de pierre', slot: 'bague', rarity: 'commun', text: 'Commence chaque combat avec 1 Robustesse.', fx: { startRobustesse: 1 } },
  anneau_soldat: { id: 'anneau_soldat', name: 'Anneau du soldat', slot: 'bague', rarity: 'commun', text: '+4 PV max.', fx: { maxHp: 4 } },
  bague_mana_brulant: { id: 'bague_mana_brulant', name: 'Bague de mana brûlant', slot: 'bague', rarity: 'rare', text: '+1 énergie au premier tour de chaque combat.', fx: { firstTurnEnergy: 1 } },
  croc_de_lave: { id: 'croc_de_lave', name: 'Croc de lave', slot: 'bijou', rarity: 'commun', text: 'Ta première Attaque de chaque tour applique Saignement 2.', fx: { bleedFirstAttack: 2 } },
  eclat_gorlok: { id: 'eclat_gorlok', name: 'Éclat de Gorlok', slot: 'bijou', rarity: 'rare', text: 'Quand un ennemi meurt, il explose : 5 dégâts à tous les autres ennemis.', fx: { onKillAoe: 5 } },
  masse_basalte: { id: 'masse_basalte', name: 'Masse de basalte', slot: 'arme', rarity: 'commun', text: 'Tes Attaques infligent +1 dégât. Ta première Attaque de chaque combat inflige +10 dégâts.', fx: { attackBonus: 1, firstAttackBonus: 10 } },
  pierre_braise: { id: 'pierre_braise', name: 'Pierre de braise', slot: 'bijou', rarity: 'commun', text: 'Soigne 4 PV à la fin de chaque combat gagné.', fx: { healAfterCombat: 4 } },

  // --- Table de loot de Sœur Cendrine ---
  amulette_cendres: { id: 'amulette_cendres', name: 'Amulette des cendres', slot: 'amulette', rarity: 'rare', text: 'Les Zones de feu t\'infligent 50 % de dégâts en moins.', fx: { zoneReduce: 50 } },
  encensoir_ardent: { id: 'encensoir_ardent', name: 'Encensoir ardent', slot: 'bijou', rarity: 'rare', text: 'Quand tu joues une Zone de feu (« Bouger »), gagne 4 blocage.', fx: { zoneBlock: 4 } },
  bague_pretresse: { id: 'bague_pretresse', name: 'Bague de la prêtresse', slot: 'bague', rarity: 'rare', text: 'Soigne 5 PV à la fin de chaque combat gagné.', fx: { healAfterCombat: 5 } },
  fleau_cendrine: { id: 'fleau_cendrine', name: 'Fléau de Cendrine', slot: 'arme', rarity: 'rare', text: 'Tes Attaques infligent +2 dégâts.', fx: { attackBonus: 2 } },

  // --- Table de loot du Héraut Brannoc ---
  etendard_heraut: { id: 'etendard_heraut', name: 'Étendard du héraut', slot: 'bijou', rarity: 'rare', text: 'Commence chaque combat avec 1 Puissance et 1 Robustesse.', fx: { startPuissance: 1, startRobustesse: 1 } },
  marteau_brannoc: { id: 'marteau_brannoc', name: 'Marteau de Brannoc', slot: 'arme', rarity: 'rare', text: 'Tes Attaques infligent +2 dégâts et te soignent de 1 PV.', fx: { attackBonus: 2, healOnAttack: 1 } },
  bague_commandement: { id: 'bague_commandement', name: 'Bague de commandement', slot: 'bague', rarity: 'rare', text: 'Chaque fois que tu interromps une incantation, pioche 1 carte.', fx: { interruptDraw: 1 } },
  amulette_heraut: { id: 'amulette_heraut', name: 'Amulette du héraut', slot: 'amulette', rarity: 'rare', text: '+5 PV max. Soigne 5 PV à la fin de chaque combat gagné.', fx: { maxHp: 5, healAfterCombat: 5 } },
};

/** Les objets que l'on trouve dans les coffres et chez le vendeur. */
export const COMMON_POOL: string[] = [
  'epee_longue', 'hache_de_guerre', 'amulette_vigueur', 'amulette_rempart', 'anneau_force', 'anneau_pierre',
  'anneau_soldat', 'bague_mana_brulant', 'croc_de_lave', 'eclat_gorlok', 'masse_basalte', 'pierre_braise',
];

/** Les tables de loot des boss secondaires (clé : id de la table, donnée par la rencontre). */
export const LOOT_TABLES: Record<string, string[]> = {
  cendrine: ['amulette_cendres', 'encensoir_ardent', 'bague_pretresse', 'fleau_cendrine'],
  brannoc: ['etendard_heraut', 'marteau_brannoc', 'bague_commandement', 'amulette_heraut'],
};

export type Equipment = Record<SlotKey, string | null>;

export function emptyEquipment(): Equipment {
  return { arme: null, amulette: null, bague1: null, bague2: null, bijou1: null, bijou2: null };
}

/** Additionne les effets de tout l'équipement porté. */
export function gearEffects(equipment: Equipment): ItemEffects {
  const total: ItemEffects = {};
  for (const key of SLOT_KEYS) {
    const id = equipment[key];
    if (!id) continue;
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
