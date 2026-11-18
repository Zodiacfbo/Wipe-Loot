// Types partagés par le moteur de jeu. Tout l'état est sérialisable en JSON,
// pour pouvoir être sauvegardé tel quel (navigateur aujourd'hui, Firebase plus tard).
import type { Encounter } from './enemies';
import type { Equipment, ItemEffects } from './items';
import type { ActMap } from './map';

export type Rarity = 'depart' | 'commune' | 'peu_commune' | 'rare' | 'epique' | 'statut';
export type CardType = 'Attaque' | 'Compétence' | 'Pouvoir' | 'Statut';
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
    }
  | { kind: 'block'; amount: number; cast?: string }
  | { kind: 'buff'; puissance: number; target: 'allies' | 'self'; cast?: string }
  | { kind: 'heal'; amount: number; cast?: string };

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
  bleedDoneThisTurn?: boolean;
  nextUid: number;
  rng: number;
}

export type Screen = 'map' | 'combat' | 'reward' | 'campfire' | 'event' | 'shop' | 'wipe' | 'victory' | 'gameover';

export interface ShopCard {
  id: string;
  price: number;
  sold: boolean;
}

export interface ShopState {
  cards: ShopCard[];
  items: ShopCard[];
  removeUsed: boolean;
  upgradeUsed: boolean;
}

export interface RunState {
  version: 4;
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
  entry: { hp: number; deck: CardInstance[] } | null;
  rewardChoices: string[];
  rewardTitle: string;
  eventId: string | null;
  nextUid: number;
}
