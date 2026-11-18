// Types partagés par le moteur de jeu. Tout l'état est sérialisable en JSON,
// pour pouvoir être sauvegardé tel quel (navigateur aujourd'hui, Firebase plus tard).
import type { Encounter } from './enemies';
import type { Equipment, ItemEffects, SlotKey } from './items';
import type { ActMap } from './map';
import type { RunSummary } from './progression';

export type Rarity = 'depart' | 'commune' | 'peu_commune' | 'rare' | 'epique' | 'statut';
export type CardType = 'Attaque' | 'Compétence' | 'Pouvoir' | 'Sort' | 'Statut';
export type Posture = 'combat' | 'berserker' | 'defensive';

export interface CardInstance {
  uid: number;
  id: string;
  upgraded: boolean;
}

export interface EnemyBuffs {
  puissance: number;
  demoralise: number; // tours restants : inflige 25 % de dégâts en moins
  ralenti: number; // tours restants : gagne 25 % de blocage en moins
  armureFracassee: number; // tours restants : subit 50 % de dégâts en plus
  saignement: number; // dégâts par tour
  saignementTours: number;
  /** Apeuré (Cri d'intimidation) : ne fait rien à son prochain tour. */
  peur?: number;
}

export type Intent =
  | {
      kind: 'attack'; dmg: number; times?: number; addZone?: number; cast?: string;
      /** Incantation impossible à interrompre. */
      uninterruptible?: boolean;
      /** Le joueur pioche autant de cartes en moins à son prochain tour. */
      drawPenalty?: number;
      /** Les dégâts augmentent de cette valeur à chaque utilisation. */
      grow?: number;
      /** Vole cet or si l'attaque fait perdre des PV (Gobelin mimique). */
      stealGold?: number;
    }
  | { kind: 'block'; amount: number; cast?: string }
  | { kind: 'buff'; puissance: number; target: 'allies' | 'self'; cast?: string }
  | { kind: 'heal'; amount: number; cast?: string; self?: boolean }
  /** Une malédiction ou un effet sur le joueur, sans dégâts. */
  | { kind: 'curse'; label: string; cast?: string } & PlayerCurse
  /** Rappelle un add (jusqu'à `max` en vie). */
  | { kind: 'summon'; id: string; max: number; label: string; cast?: string }
  /** L'ennemi ne peut plus être ciblé jusqu'à son prochain tour. */
  | { kind: 'blink'; cast?: string };

/** Ce qu'une malédiction ennemie fait au joueur. */
export interface PlayerCurse {
  demoralise?: number; // tours : tes Attaques infligent 25 % de dégâts en moins
  impie?: number; // tours : ta première carte de chaque tour coûte 1 de plus
  arcane?: number; // tours : tes Sorts coûtent 1 de plus
  manaBurn?: number; // énergie en moins au prochain tour
  panic?: number; // cartes Paniquées au prochain tour
  fardeau?: number; // Fardeaux ajoutés à la pioche
  bomb?: number; // Bombes vivantes ajoutées à la main
}

/** Les malédictions actives sur le joueur. */
export interface PlayerDebuffs {
  demoralise: number;
  impie: number;
  arcane: number;
  manaBurn: number;
  panic: number;
}

export interface EnemyState {
  uid: number;
  defId: string;
  name: string;
  hp: number;
  maxHp: number;
  block: number;
  buffs: EnemyBuffs;
  step: number; // position dans la séquence d'intentions
  intent: Intent;
  interrupted: boolean; // l'incantation en cours a été interrompue
  delayed: boolean; // l'incantation est retardée d'un tour
  dead: boolean;
  /** Phase du combat de boss (1 par défaut). */
  phase?: number;
  /** Tours restants sous la lave : l'ennemi ne peut pas être ciblé ni blessé. */
  submerged?: number;
  /** Compteur d'utilisations (attaques qui grandissent). */
  counter?: number;
  /** Clignement : ne peut pas être ciblé jusqu'à son prochain tour. */
  untargetable?: boolean;
  /** Molosse de Krâgg : se relève dans ce nombre de tours. */
  reviveIn?: number;
  /** Vulkhar affaibli par l'Eau des profondeurs : son premier Marteau des flammes arrive un tour plus tard. */
  delayHammer?: boolean;
  /** Saldris : bouclier actif (renvoie 50 % des dégâts de ce type). */
  shield?: 'coups' | 'sorts';
  /** Saldris s'est rendu, ou un Molosse s'est enfui : il n'est plus là. */
  gone?: boolean;
  /** Désarmement : n'attaque pas à son prochain tour (un boss : −30 % de dégâts). */
  disarmed?: boolean;
  /** Frappe mortelle : ne peut plus être soigné. */
  noHeal?: boolean;
}

export interface PlayerState {
  hp: number;
  maxHp: number;
  block: number;
  energy: number;
  maxEnergy: number;
  rage: number;
  maxRage: number;
  posture: Posture;
  postureChanged: boolean;
  puissance: number;
  ignorerDouleur: boolean;
  blockedFullAttack: boolean;
  /** Cartes en moins à piocher au prochain tour (Marteau des flammes). */
  drawPenalty: number;
  /** +1 blocage par point sur chaque carte qui donne du blocage. */
  robustesse: number;
  /** Malédictions des ennemis (Morvax, Croc-de-lave, Vossk, Zhaal). */
  debuffs?: PlayerDebuffs;
  /** Sorts de barre actifs jusqu'au prochain tour. */
  temerite?: boolean;
  rempart?: boolean;
  fearless?: boolean;
  /** Fureur suicidaire : tours restants (+50 % aux Attaques, +25 % de dégâts subis). */
  fureur?: number;
  /** Parade ripostée : dégâts renvoyés à la prochaine attaque reçue. */
  riposte?: number;
  /** Enragé : bonus de dégâts de la prochaine Attaque. */
  enrageReady?: number;
}

export interface SpellState {
  id: string;
  cooldown: number;
}

export type CombatPhase = 'player' | 'victory' | 'defeat';

/** Qui est concerné par un événement : le joueur, ou un ennemi (par son uid). */
export type FxTarget = 'player' | number;

/** Événements produits par le moteur pour que l'interface puisse les animer. */
export type FxEvent =
  | { kind: 'hit'; from: FxTarget; to: FxTarget; amount: number; blocked: number; ranged: boolean }
  | { kind: 'tick'; who: FxTarget; amount: number; label: string }
  | { kind: 'block'; who: FxTarget; amount: number }
  | { kind: 'buff'; who: FxTarget; label: string }
  | { kind: 'heal'; from: FxTarget; to: FxTarget; amount: number }
  | { kind: 'interrupt'; who: number }
  | { kind: 'death'; who: number }
  | { kind: 'banner'; text: string };

export interface CombatState {
  turn: number;
  phase: CombatPhase;
  player: PlayerState;
  enemies: EnemyState[];
  draw: CardInstance[];
  hand: CardInstance[];
  discard: CardInstance[];
  exhaust: CardInstance[];
  spells: SpellState[];
  enrageTurn: number | null;
  log: string[];
  fx?: FxEvent[];
  /** Effets de l'équipement porté, calculés au début du combat. */
  gear?: ItemEffects;
  firstAttackDone?: boolean;
  /** Potion de protection contre le feu : les Zones de feu ne font plus de dégâts. */
  fireProof?: boolean;
  /** Cartes Paniquées (uid) : injouables ce tour-ci. */
  panicked?: number[];
  /** Cartes jouées ce tour-ci, et Sorts joués ce tour-ci (Contresort de Zhaal). */
  cardsThisTurn?: number;
  spellsThisTurn?: number;
  /** Une carte a déjà été jouée pendant ce combat (Bague du tisseur). */
  firstCardDone?: boolean;
  /** L'Orbe de distorsion a déjà servi pendant ce combat. */
  orbUsed?: boolean;
  /** La carte en train d'être jouée (pour les bonus qui dépendent de son coût ou de son type). */
  playing?: { cost: number; type: CardType; id: string };
  /** Les ennemis sont en train de jouer leur tour. */
  enemyActing?: boolean;
  /** Puissance déjà gagnée avec la Pierre de magma. */
  magmaGained?: number;
  /** Les Pouvoirs joués pendant ce combat (id → valeur cumulée). */
  powers?: Record<string, number>;
  /** Attaques jouées ce tour-ci (Frappe frénétique, Rafale). */
  attacksThisTurn?: number;
  /** Balayage : Attaques restantes qui touchent aussi un 2e ennemi, et l'Attaque en cours en profite-t-elle ? */
  cleave?: number;
  cleaving?: boolean;
  /** Or volé par le Gobelin mimique. */
  goldStolen?: number;
  bleedDoneThisTurn?: boolean;
  nextUid: number;
  rng: number;
}

export type Screen = 'blessing' | 'map' | 'combat' | 'reward' | 'campfire' | 'event' | 'shop' | 'wipe' | 'victory' | 'gameover';

export interface ShopCard {
  id: string;
  price: number;
  sold: boolean;
}

export interface ShopState {
  cards: ShopCard[];
  items: ShopCard[];
  potions: ShopCard[];
  removeUsed: boolean;
  upgradeUsed: boolean;
}

export interface RunState {
  version: 14;
  seed: number;
  rng: number;
  maxHp: number;
  hp: number;
  deck: CardInstance[];
  wipesLeft: number;
  gold: number;
  /** Or gagné au dernier combat (pour l'écran de récompense). */
  rewardGold: number;
  /** Nombre de retraits et d'améliorations achetés chez le vendeur pendant la run (le prix augmente). */
  removals: number;
  upgradesBought: number;
  shop: ShopState | null;
  equipment: Equipment;
  /** Objet trouvé, en attente de décision (équiper ou laisser). */
  pendingItem: string | null;
  /** Autres objets proposés au choix (Trousseau de l'intendant, Pari risqué) : on en garde un seul. */
  pendingAlts: string[];
  /** Bénédiction de Brégan : les 4 bonus proposés au début de la run. */
  blessings: string[];
  /** Événements déjà vus pendant la run (chacun n'apparaît qu'une fois). */
  seenEvents: string[];
  /** Ce qui vient de se passer dans un événement (affiché avant de revenir à la carte). */
  eventOutcome: string | null;
  /** Quête des Gardiens des Sources. */
  sourcesQuest: 'active' | 'rune' | 'done' | 'refused' | null;
  /** Quête légendaire Brisemonts (Guerrier). */
  brisemonts: 'lame' | 'coeur' | 'forged' | null;
  /** Objet de quête obtenu au dernier combat (affiché sur l'écran de victoire). */
  questNote: string | null;
  /** Le Fantôme du forgeron a renforcé cette arme (+2 dégâts tant qu'elle est équipée). */
  weaponUpgrade: string | null;
  /** La rivière de lave : le prochain nœud devient un combat difficile. */
  detour: boolean;
  /** L'acte en cours (1 dans le prototype). */
  act: number;
  /** Les talents choisis pour cette run (fixés pendant la run). */
  talents: string[];
  /** Combats et boss secondaires gagnés (pour le score). */
  stats: { combats: number; elites: number };
  /** Le bilan de fin de run, calculé une seule fois (score, expérience, niveau). */
  summary: RunSummary | null;
  /** Emplacements dont l'objet est brisé (effet désactivé jusqu'à la réparation). */
  broken: SlotKey[];
  /** Objet emporté du coffre de la guilde au début de la run (perdu si la run échoue). */
  heirloom: string | null;
  /** Le passage au coffre de la guilde après la victoire est fait. */
  chestDone: boolean;
  /** L'objet déposé au coffre (pour l'écran de fin). */
  chestDeposit: string | null;
  /** Les 3 emplacements de potion (null : vide). */
  potions: (string | null)[];
  /** Potion trouvée après un combat, en attente de décision. */
  pendingPotion: string | null;
  /** La barre de sorts (3 emplacements). */
  spells: string[];
  /** Sort de barre trouvé sur un boss secondaire, en attente de décision. */
  pendingSpell: string | null;
  screen: Screen;
  /** La carte de l'acte (voir map.ts). */
  map: ActMap;
  /** Le nœud où se trouve le joueur (null : avant l'étage 1). */
  position: number | null;
  /** Les nœuds déjà visités, dans l'ordre. */
  path: number[];
  /** La rencontre en cours ou la dernière jouée (pour retenter après un wipe). */
  encounter: Encounter | null;
  combat: CombatState | null;
  entry: { hp: number; deck: CardInstance[]; potions: (string | null)[] } | null;
  rewardChoices: string[];
  rewardTitle: string;
  eventId: string | null;
  nextUid: number;
}
