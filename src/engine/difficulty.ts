// Les niveaux de difficulté (l'équivalent de l'Ascension de Slay the Spire) : un défi optionnel.
// Chaque niveau ajoute une contrainte, qui s'ajoute à toutes celles des niveaux précédents.
// Gagner une run avec une classe débloque le niveau suivant pour cette classe.
// Référence : docs/CONCEPT.md (§15.2)

export const MAX_DIFFICULTY = 20;

export const DIFFICULTY_TEXT: string[] = [
  'Difficulté normale.',
  'Les gardiens sont plus fréquents sur la carte.',
  'Les ennemis normaux ont 10 % de PV en plus.',
  'Les gardiens ont 15 % de PV en plus.',
  'Les boss se déchaînent 2 tours plus tôt.',
  'Le feu de camp soigne 25 % des PV max au lieu de 30 %.',
  'Tu commences la run avec 80 % de tes PV.',
  'Une relève de moins (2).',
  'Les ennemis normaux infligent 10 % de dégâts en plus.',
  'Les gardiens infligent 10 % de dégâts en plus.',
  'Ton paquet de départ contient une Malédiction.',
  'Tu gagnes 25 % d\'or en moins.',
  'Une relève de moins (1).',
  'Le vendeur gobelin est 20 % plus cher.',
  'Les factures de réparation coûtent 50 % de plus.',
  'Tu trouves moins de potions après les combats.',
  'Les seigneurs (Vulkhar, Vhaeryx, Yzhar) ont 15 % de PV en plus.',
  'Les seigneurs infligent 10 % de dégâts en plus.',
  'Les gardiens commencent chaque combat avec 1 Puissance.',
  'Les ennemis normaux ont encore 10 % de PV en plus (20 % au total).',
  'Les Souverains enragés : les seigneurs commencent avec 2 Puissance, et se déchaînent 2 tours plus tôt.',
];

/** Tous les effets d'un niveau de difficulté, contraintes des niveaux précédents comprises. */
export interface DifficultyMods {
  eliteWeight: number; // poids des gardiens sur la carte (22 normalement)
  normalHp: number; // multiplicateur de PV
  eliteHp: number;
  bossHp: number;
  normalDmg: number; // multiplicateur de dégâts
  eliteDmg: number;
  bossDmg: number; // dégâts des seigneurs
  enrageEarlier: number; // tours d'avance de l'enrage (boss secondaires et boss)
  bossEnrageEarlier: number; // tours d'avance en plus pour les seigneurs
  campfireHeal: number; // part des PV max soignée au feu de camp
  startHpRatio: number; // PV au départ de la run
  wipes: number;
  startCurse: boolean;
  goldMult: number;
  shopMult: number;
  repairMult: number;
  potionChance: number;
  normalPuissance: number;
  elitePuissance: number;
  bossPuissance: number;
}

export function difficultyMods(level: number): DifficultyMods {
  const at = (n: number) => level >= n;
  return {
    eliteWeight: at(1) ? 34 : 22,
    normalHp: at(19) ? 1.2 : at(2) ? 1.1 : 1,
    eliteHp: at(3) ? 1.15 : 1,
    bossHp: at(16) ? 1.15 : 1,
    enrageEarlier: at(4) ? 2 : 0,
    bossEnrageEarlier: at(20) ? 2 : 0,
    campfireHeal: at(5) ? 0.25 : 0.3,
    startHpRatio: at(6) ? 0.8 : 1,
    // Pas de niveau sans wipe : une run fait deux actes, deux seigneurs.
    wipes: at(12) ? 1 : at(7) ? 2 : 3,
    normalDmg: at(8) ? 1.1 : 1,
    eliteDmg: at(9) ? 1.1 : 1,
    bossDmg: at(17) ? 1.1 : 1,
    startCurse: at(10),
    goldMult: at(11) ? 0.75 : 1,
    shopMult: at(13) ? 1.2 : 1,
    repairMult: at(14) ? 1.5 : 1,
    potionChance: at(15) ? 0.25 : 0.4,
    elitePuissance: at(18) ? 1 : 0,
    normalPuissance: 0,
    bossPuissance: at(20) ? 2 : 0,
  };
}
