// Types partagés par le moteur de jeu. Tout l'état est sérialisable en JSON,
// pour pouvoir être sauvegardé tel quel (navigateur aujourd'hui, Firebase plus tard).

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
  | { kind: 'attack'; dmg: number; times?: number; addZone?: number; cast?: string }
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
}

export interface SpellState {
  id: string;
  cooldown: number;
}

export type CombatPhase = 'player' | 'victory' | 'defeat';

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
  nextUid: number;
  rng: number;
}

export type Screen = 'combat' | 'reward' | 'campfire' | 'wipe' | 'victory' | 'gameover';

export interface RunState {
  version: 1;
  seed: number;
  rng: number;
  maxHp: number;
  hp: number;
  deck: CardInstance[];
  wipesLeft: number;
  step: number;
  screen: Screen;
  combat: CombatState | null;
  entry: { hp: number; deck: CardInstance[] } | null;
  rewardChoices: string[];
  nextUid: number;
}
