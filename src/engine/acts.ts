// Les actes d'une run : leurs ennemis, leurs boss, et la forme de leur carte.
// Référence : docs/CONCEPT.md (§4) et docs/actes/
import { BOSS_ENCOUNTER, EASY_ENCOUNTERS, ELITE_ENCOUNTERS, HARD_ENCOUNTERS, type Encounter } from './enemies';
import { BOSS_ENCOUNTER_2, EASY_ENCOUNTERS_2, ELITE_ENCOUNTERS_2, HARD_ENCOUNTERS_2, HIDDEN_FIGHTS_2 } from './enemies_acte2';
import { BOSS_ENCOUNTER_3, EASY_ENCOUNTERS_3, ELITE_ENCOUNTERS_3, HARD_ENCOUNTERS_3, HIDDEN_FIGHTS_3 } from './enemies_acte3';
import type { NodeType } from './map';

export interface ActDef {
  num: number;
  name: string;
  /** Ce que l'on voit dans le hall et à l'entrée de l'acte. */
  intro: string;
  easy: Encounter[];
  hard: Encounter[];
  elites: Encounter[];
  boss: Encounter;
  /** Les combats cachés derrière un « ? » (ceux du chapitre I sont dans events.ts). */
  hidden?: Encounter[];
  /** La part de chaque type de nœud aux étages 2 à 4, puis 6 à 8 (le poids des gardiens vient de la difficulté). */
  earlyNodes: [NodeType, number][];
  lateNodes: [NodeType, number][];
}

export const ACTS: Record<number, ActDef> = {
  1: {
    num: 1, name: 'Les Profondeurs Ardentes',
    intro: '10 étages de lave et de cendres, 9 boss secondaires possibles, et Vulkhar, le Souverain des flammes, au bout du chemin.',
    easy: EASY_ENCOUNTERS, hard: HARD_ENCOUNTERS, elites: ELITE_ENCOUNTERS, boss: BOSS_ENCOUNTER,
    earlyNodes: [['combat', 52], ['event', 34], ['shop', 14]],
    lateNodes: [['combat', 36], ['event', 22], ['shop', 10], ['campfire', 10]],
  },
  2: {
    num: 2, name: 'L\'Aire de Vhaeryx',
    intro: 'Au sommet du mont Durgal, le dragon-alchimiste Vhaeryx fusionne le sang des dragons. Ses Souffles ne s\'interrompent pas : il faudra les encaisser.',
    easy: EASY_ENCOUNTERS_2, hard: HARD_ENCOUNTERS_2, elites: ELITE_ENCOUNTERS_2, boss: BOSS_ENCOUNTER_2, hidden: HIDDEN_FIGHTS_2,
    earlyNodes: [['combat', 50], ['event', 36], ['shop', 14]],
    lateNodes: [['combat', 40], ['event', 26], ['shop', 8], ['campfire', 8]],
  },
  3: {
    num: 3, name: 'Irem, la cité ensevelie',
    intro: 'Sous les sables, la cité d\'Irem prie un dieu qui dort. Ses murmures rendent fou : garde la tête froide jusqu\'à Yzhar, le Dieu dormant.',
    easy: EASY_ENCOUNTERS_3, hard: HARD_ENCOUNTERS_3, elites: ELITE_ENCOUNTERS_3, boss: BOSS_ENCOUNTER_3, hidden: HIDDEN_FIGHTS_3,
    earlyNodes: [['combat', 48], ['event', 38], ['shop', 14]],
    lateNodes: [['combat', 42], ['event', 26], ['shop', 8], ['campfire', 8]],
  },
};

/** Le dernier acte jouable dans cette version : la run se termine après son boss. */
export const LAST_ACT = 3;

/** « chapitre II » : un acte, dans le vocabulaire du jeu (issue #8). */
export function chapterName(num: number): string {
  return `chapitre ${['', 'I', 'II', 'III', 'IV', 'V'][num] ?? num}`;
}

export function actDef(num: number): ActDef {
  return ACTS[num] ?? ACTS[1];
}
