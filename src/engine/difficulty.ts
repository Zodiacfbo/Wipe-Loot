// Les niveaux de difficulté (l'équivalent de l'Ascension de Slay the Spire) : un défi optionnel.
// Chaque niveau ajoute une contrainte, qui s'ajoute à toutes celles des niveaux précédents.
// Gagner une run avec une classe débloque le niveau suivant pour cette classe.
// Référence : docs/CONCEPT.md (§15.2)

export const MAX_DIFFICULTY = 20;

/** Chaque niveau : les seigneurs (Vulkhar, Vhaeryx, Yzhar) gagnent ce pourcentage de PV et de dégâts (25 novembre 2026). */
export const LORD_SCALING = { perLevel: 0.02 };
/** La ligne affichée en haut de la liste des niveaux. */
export function lordScalingText(): string {
  return `Chaque niveau : les seigneurs ont +${Math.round(LORD_SCALING.perLevel * 100)} % de PV et de dégâts.`;
}

export const DIFFICULTY_TEXT: string[] = [
  'Difficulté normale.',
  'Les gardiens sont plus fréquents sur la carte.',
  'Les ennemis normaux ont 10 % de PV en plus.',
  'Les gardiens ont 15 % de PV en plus.',
  'Les gardiens et les seigneurs se déchaînent 2 tours plus tôt.',
  'Le feu de camp soigne 25 % des PV max au lieu de 30 %.',
  'Tu commences l\'expédition avec 80 % de tes PV.',
  'Une relève de moins (2).',
  'Les ennemis normaux infligent 10 % de dégâts en plus.',
  'Les gardiens infligent 10 % de dégâts en plus.',
  'Ton paquet de départ contient une Malédiction.',
  'Tu gagnes 25 % d\'or en moins.',
  'Une relève de moins (1).',
  'Le vendeur gobelin est 20 % plus cher.',
  'Les factures de réparation coûtent 50 % de plus.',
  'Tu trouves moins de potions après les combats.',
  'Les récompenses de combat proposent 2 cartes au lieu de 3.',
  'Les sbires des seigneurs ont 25 % de PV en plus.',
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
  /** Cartes proposées en récompense de combat (3, ou 2 à partir du niveau 16). */
  rewardCards: number;
  /** PV des sbires dans le combat d'un seigneur (niveau 17). */
  lordAddHp: number;
  normalPuissance: number;
  elitePuissance: number;
  bossPuissance: number;
}

/** « Ce qui t'attend » (hall, maquette C du 25 novembre 2026) : les contraintes d'un niveau, regroupées par cible. */
export function difficultySummary(level: number): { icon: string; label: string; text: string }[] {
  if (level <= 0) return [];
  const m = difficultyMods(level);
  const pct = (x: number) => `+${Math.round((x - 1) * 100)} %`;
  const at = (n: number) => level >= n;
  const out: { icon: string; label: string; text: string }[] = [];
  const add = (icon: string, label: string, parts: (string | false)[]) => {
    const kept = parts.filter((p): p is string => !!p);
    if (kept.length) out.push({ icon, label, text: kept.join(', ') });
  };
  add('⚔️', 'Seigneurs', [
    `${pct(m.bossHp)} de PV et de dégâts`,
    (m.enrageEarlier + m.bossEnrageEarlier) > 0 && `se déchaînent ${m.enrageEarlier + m.bossEnrageEarlier} tours plus tôt`,
    m.bossPuissance > 0 && `${m.bossPuissance} Puissance au départ`,
    m.lordAddHp > 1 && `leurs sbires ${pct(m.lordAddHp)} de PV`,
  ]);
  add('🛡', 'Gardiens', [
    at(1) && 'plus fréquents',
    m.eliteHp > 1 && `${pct(m.eliteHp)} de PV`,
    m.eliteDmg > 1 && `${pct(m.eliteDmg)} de dégâts`,
    m.enrageEarlier > 0 && 'se déchaînent plus tôt',
    m.elitePuissance > 0 && `${m.elitePuissance} Puissance au départ`,
  ]);
  add('👹', 'Ennemis', [m.normalHp > 1 && `${pct(m.normalHp)} de PV`, m.normalDmg > 1 && `${pct(m.normalDmg)} de dégâts`]);
  add('❤', 'Toi', [
    m.startHpRatio < 1 && `${Math.round(m.startHpRatio * 100)} % de PV au départ`,
    m.campfireHeal < 0.3 && `feu de camp ${Math.round(m.campfireHeal * 100)} %`,
    m.wipes < 3 && `${m.wipes} relève${m.wipes > 1 ? 's' : ''}`,
    m.startCurse && 'une Malédiction dans ton paquet',
    m.rewardCards < 3 && `${m.rewardCards} cartes en récompense`,
  ]);
  add('💰', 'Or et vendeur', [
    m.goldMult < 1 && `${Math.round((1 - m.goldMult) * 100)} % d'or en moins`,
    m.shopMult > 1 && `vendeur ${pct(m.shopMult)}`,
    m.repairMult > 1 && `réparations ${pct(m.repairMult)}`,
    m.potionChance < 0.4 && 'moins de potions',
  ]);
  return out;
}

export function difficultyMods(level: number): DifficultyMods {
  const at = (n: number) => level >= n;
  const lord = 1 + LORD_SCALING.perLevel * Math.max(0, level);
  return {
    eliteWeight: at(1) ? 34 : 22,
    normalHp: at(19) ? 1.2 : at(2) ? 1.1 : 1,
    eliteHp: at(3) ? 1.15 : 1,
    bossHp: lord,
    enrageEarlier: at(4) ? 2 : 0,
    bossEnrageEarlier: at(20) ? 2 : 0,
    campfireHeal: at(5) ? 0.25 : 0.3,
    startHpRatio: at(6) ? 0.8 : 1,
    // Pas de niveau sans wipe : une run fait deux actes, deux seigneurs.
    wipes: at(12) ? 1 : at(7) ? 2 : 3,
    normalDmg: at(8) ? 1.1 : 1,
    eliteDmg: at(9) ? 1.1 : 1,
    bossDmg: lord,
    rewardCards: at(16) ? 2 : 3,
    lordAddHp: at(17) ? 1.25 : 1,
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
