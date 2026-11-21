// Types partagés par le moteur de jeu. Tout l'état est sérialisable en JSON,
// pour pouvoir être sauvegardé tel quel (navigateur aujourd'hui, Firebase plus tard).
import type { Encounter } from './enemies';
import type { Equipment, ItemEffects, SlotKey } from './items';
import type { ActMap } from './map';
import type { RunSummary } from './progression';

export type Rarity = 'depart' | 'commune' | 'peu_commune' | 'rare' | 'epique' | 'statut';
export type CardType = 'Attaque' | 'Compétence' | 'Pouvoir' | 'Sort' | 'Malédiction' | 'Statut';

/** Les familiers du Démoniste. */
export type PetId = 'diablotin' | 'rodeur' | 'succube' | 'molosse';

/** Un effet de dégâts sur la durée du Démoniste (Corruption, Immolation, Malédiction de souffrance…). */
export interface Dot {
  id: string;
  dmg: number;
  turns: number;
  /** Dégâts en plus à chaque tick (Malédiction de souffrance). */
  grow?: number;
  /** PV rendus au lanceur à chaque tick (Toucher vampirique, Peste mentale). */
  heal?: number;
}
/** L'école de magie d'une carte du Mage. */
export type School = 'arcane' | 'feu' | 'givre' | 'sacre' | 'ombre';
export type Posture = 'combat' | 'berserker' | 'defensive';

export interface CardInstance {
  uid: number;
  id: string;
  upgraded: boolean;
  /** Hallucination (acte 3) : la carte du deck dont elle prend l'apparence. */
  mimic?: string;
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
  /** Mage — Brûlure : dégâts au début du tour de l'ennemi, puis −1. */
  brulure?: number;
  /** Démoniste — Démoralisé est aussi utilisé par la Malédiction de faiblesse ; Ralenti par la Malédiction de fatigue. */
  /** Mage — Gel : à 5 cumuls, l'ennemi devient Gelé. */
  gel?: number;
  /** Voleur — Poison : dégâts en plus à chaque Attaque qui le touche, puis −1 à la fin de son tour. */
  poison?: number;
  /** Paladin — Censure : dégâts égaux aux cumuls au début de son tour (consommée par le Jugement du Sceau de vengeance). */
  censure?: number;
}

/** Paladin : les Sceaux et les Auras. */
export type SealId = 'droiture' | 'croise' | 'lumiere' | 'sagesse' | 'rempart' | 'vengeance';
export type AuraId = 'devotion' | 'resistance' | 'epines';

export type Intent =
  | {
      kind: 'attack'; dmg: number; times?: number; addZone?: number; cast?: string;
      /** Le nom de l'attaque (affiché sous l'intention). */
      label?: string;
      /** Acte 3 (Regard du dieu) : dégâts en plus si le joueur a 5 Folie ou plus. */
      madBonus?: number;
      /** Frappe perçante : ignore le blocage. */
      pierce?: boolean;
      /** Incantation impossible à interrompre. */
      uninterruptible?: boolean;
      /** Le joueur pioche autant de cartes en moins à son prochain tour. */
      drawPenalty?: number;
      /** Les dégâts augmentent de cette valeur à chaque utilisation. */
      grow?: number;
      /** Vole cet or si l'attaque fait perdre des PV (Gobelin mimique). */
      stealGold?: number;
      /** Un Souffle de dragon (acte 2) : non interruptible, réduit par l'Écaille d'Ysolde. */
      breath?: boolean;
      /** Un effet en plus des dégâts (Toxine, Peste, Ralenti…). */
      effect?: PlayerCurse & { label: string };
    }
  | { kind: 'block'; amount: number; cast?: string }
  | { kind: 'buff'; puissance: number; target: 'allies' | 'self'; cast?: string }
  | { kind: 'heal'; amount: number; cast?: string; self?: boolean; /** Soigne tous ses alliés (Soins royaux). */ all?: boolean }
  /** Une malédiction ou un effet sur le joueur, sans dégâts. */
  | { kind: 'curse'; label: string; cast?: string } & PlayerCurse
  /** Rappelle un add (jusqu'à `max` en vie). */
  | { kind: 'summon'; id: string; max: number; label: string; cast?: string; count?: number }
  /** L'ennemi ne peut plus être ciblé jusqu'à son prochain tour (Envol : seulement par les Attaques à cible unique). */
  | { kind: 'blink'; cast?: string; flight?: boolean }
  /** L'ennemi ne fait rien (Œuf de dragon). */
  | { kind: 'idle'; label: string; cast?: string }
  /** Des Œufs éclosent : l'ennemi lui-même (`self`), ou `count` Œufs du combat (`all` : tous). */
  | { kind: 'hatch'; label: string; self?: boolean; count?: number | 'all'; cast?: string }
  /** Grizzik : une potion tirée au hasard (annoncée un tour à l'avance). */
  | { kind: 'potion'; potion: string; label: string; cast?: string }
  /** Acte 3 : l'ennemi s'enfouit dans le sable pendant `turns` tours (Ensevelissement). */
  | { kind: 'burrow'; turns: number; label: string; cast?: string };

/** Ce qu'une malédiction ennemie fait au joueur. */
export interface PlayerCurse {
  demoralise?: number; // tours : tes Attaques infligent 25 % de dégâts en moins
  impie?: number; // tours : ta première carte de chaque tour coûte 1 de plus
  arcane?: number; // tours : tes Sorts coûtent 1 de plus
  manaBurn?: number; // énergie en moins au prochain tour
  panic?: number; // cartes Paniquées au prochain tour
  fardeau?: number; // Fardeaux ajoutés à la pioche
  bomb?: number; // Bombes vivantes ajoutées à la main
  // Acte 2
  toxine?: number; // tours : 2 dégâts au début de ton tour
  peste?: number; // tours : tes soins sont réduits de moitié
  ralenti?: number; // tours : tu gagnes 25 % de blocage en moins
  fracasse?: number; // tours : tu subis 50 % de dégâts en plus
  ombre?: number; // cumuls d'Ombre rongeuse : +2 dégâts par attaque reçue, jusqu'à la fin du combat
  discard?: number; // cartes défaussées au hasard au début de ton prochain tour
  cendres?: number; // cartes Cendres ajoutées à la main
  energyLoss?: number; // énergie en moins au prochain tour
  affliction?: boolean; // une Affliction de sang au hasard (Prismagor)
  lignee?: boolean; // Malédiction de lignée (Vhaeryx), selon la classe
  // Acte 3
  folie?: number; // Folie gagnée (voir folie.ts)
  sable?: number; // cartes Sable ajoutées à la pioche
  sableHand?: number; // cartes Sable ajoutées à la main (Tempête de sable)
  hallucinations?: number; // Hallucinations ajoutées à la main (Vision partagée)
  domination?: boolean; // Domination mentale : pendant ton prochain tour, ta première Attaque te vise toi-même
  // Yzhar
  petStun?: number; // le Rayon oculaire rebondit sur ton familier, qui est étourdi X tour
  regard?: number; // Regard sombre : X tours, 12 dégâts à la fin de ton tour si tu ne te mets pas à couvert
  swallow?: boolean; // Avaler : tu passes 2 tours dans les entrailles d'Yzhar
  /** Incantation impossible à interrompre (Regard sombre, Avaler). */
  uninterruptible?: boolean;
}

/** Les malédictions actives sur le joueur. */
export interface PlayerDebuffs {
  demoralise: number;
  impie: number;
  arcane: number;
  manaBurn: number;
  panic: number;
  toxine?: number;
  peste?: number;
  ralenti?: number;
  fracasse?: number;
  ombre?: number;
  discard?: number;
  /** Afflictions de sang portées (rouge, bleue, verte, noire, bronze). */
  afflictions?: string[];
  /** Transformé (les 5 Afflictions) : tu perds ton prochain tour. */
  transformed?: boolean;
  /** Malédiction de lignée : tours restants. */
  lignee?: number;
  /** Potion de transmutation de Grizzik : cartes de la prochaine main changées en Fioles instables. */
  transmute?: number;
}

/** Les contraintes de difficulté appliquées aux ennemis d'un combat. */
export interface CombatMods {
  normalHp: number;
  eliteHp: number;
  bossHp: number;
  normalDmg: number;
  eliteDmg: number;
  bossDmg: number;
  enrageEarlier: number;
  bossEnrageEarlier: number;
  normalPuissance: number;
  elitePuissance: number;
  bossPuissance: number;
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
  /** Yzhar : l'ennemi est resté dehors pendant que tu es dans ses entrailles. */
  outside?: boolean;
  /** Compteur d'utilisations (attaques qui grandissent). */
  counter?: number;
  /** Clignement : ne peut pas être ciblé jusqu'à son prochain tour. */
  untargetable?: boolean;
  /** Acte 3, Ensevelissement : tours restants sous le sable (ne peut pas être ciblé ; les DoT et les zones le touchent). */
  buried?: number;
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
  /** Acte 2 — Envol : ne peut pas être ciblé par une Attaque à cible unique jusqu'à son prochain tour. */
  flying?: boolean;
  /** Démoniste : ses DoT, ses Malédictions (ids) et leurs effets. */
  dots?: Dot[];
  curses?: string[];
  /** Malédiction de fatigue : ses attaques infligent X dégâts de moins (tours restants dans `fatigueTurns`). */
  fatigue?: number;
  fatigueTurns?: number;
  /** Malédiction des éléments : +X % de dégâts des Sorts (tours restants). */
  elements?: number;
  elementsTurns?: number;
  /** Malédiction des langages : ses prochaines Incantations prennent un tour de plus. */
  tongues?: number;
  /** Hantise : tes DoT infligent +50 % pendant ce nombre de tours. */
  haunted?: number;
  /** Asservissement : combat pour toi pendant ce nombre de tours. */
  enslaved?: number;
  /** Mutation (Chimère d'essai) : tirée au début du combat, active sous 50 % de PV. */
  mutations?: string[];
  mutated?: boolean;
  /** Serviteur rapiécé, Ossyrax : s'est déjà relevé une fois. */
  revived?: boolean;
  /** Prismagor : ses deux Souffles, tirés au début du combat. */
  breaths?: string[];
  /** Grizzik : effets de potion en cours. */
  giant?: number;
  haste?: boolean;
  /** Gelé : un ennemi normal perd son prochain tour ('skip'), un boss voit sa prochaine attaque réduite de moitié ('half'). */
  gele?: 'skip' | 'half';
  /** Métamorphose : transformé en mouton (ne fait rien) pendant ce nombre de tours, ou jusqu'à ce qu'il subisse des dégâts. */
  mouton?: number;
  /** Voleur — Contrôlé (Coup aux reins, Coup bas) : ne fait rien pendant ce nombre de tours. */
  stun?: number;
  /** Voleur — Assommé : ne fait rien pendant ce nombre de tours, ou jusqu'à ce qu'il subisse des dégâts. */
  sap?: number;
  /** Voleur — Vendetta : tes Attaques contre lui infligent +50 % et appliquent 2 Poison de plus. */
  vendetta?: boolean;
  // --- Acte 3 : les boss secondaires d'Irem ---
  /** Méhkar et ses Copies : on ne sait pas qui est qui tant qu'il n'a pas été touché. */
  masked?: boolean;
  /** Méhkar : paliers de Copies déjà franchis (75 %, 50 %, 25 %). */
  splits?: number;
  /** Rois-Jumeaux : immunité actuelle (elle s'échange tous les 3 tours). */
  immune?: 'attaques' | 'sorts';
  /** Rois-Jumeaux : se relève dans ce nombre de tours si son jumeau vit encore. */
  twinRevive?: number;
  /** Triade de la Ruche : Vengeance royale (+50 % de dégâts). */
  vengeance?: boolean;
  /** Limon : cumuls de Figeage, et tours Figé restants (n'agit plus, double dégâts). */
  figeage?: number;
  fige?: number;
  /** Les débuffs vus au dernier contrôle (Figeage, Fiole de limon, Bague primordiale). */
  debuffSnap?: Record<string, number>;
  /** Vient de resurgir du sable (Dent de Gharul). */
  surfaced?: boolean;
  /** Sartaq : Suprématie suspendue pendant ce nombre de tours (Cristal d'obsidienne). */
  suspended?: number;
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
  /** Mage — charges arcaniques (0 à `maxCharges`). */
  charges?: number;
  maxCharges?: number;
  /** Pouvoir des arcanes : Sorts +50 % ce tour-ci. */
  arcanePower?: boolean;
  /** Carapace de glace : immunisé à tous les dégâts jusqu'au prochain tour. */
  iceBlock?: boolean;
  /** Bouclier de mana : s'il reste du blocage au début du prochain tour, pioche 1 carte. */
  manaShield?: boolean;
  /** Distorsion temporelle : au prochain tour, +1 énergie et 2 cartes de plus. */
  distortion?: boolean;
  /** Réflexion des sorts : une incantation qui te frappe ce tour-ci renvoie la moitié de ses dégâts. */
  spellReflect?: boolean;
  /** Bouclier de feu ancestral : Brûlure appliquée à chaque attaquant jusqu'au prochain tour. */
  fireShield?: number;
  /** Voleur — Évasion : les Attaques ennemies infligent 50 % de dégâts en moins jusqu'au prochain tour. */
  evasion?: boolean;
  /** Paladin — Bouclier divin : tes Attaques infligent 50 % de dégâts en moins ce tour-ci. */
  divineShield?: boolean;
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
  /** Acte 3 : la Folie du joueur (0 à 10), et la Crise de folie qui lui fera perdre son prochain tour. */
  folie?: number;
  crisis?: boolean;
  /** Domination mentale (Méhkar) : ta prochaine Attaque te vise toi-même. */
  dominated?: boolean;
  /** Yzhar : tours restants dans ses entrailles, Regard sombre, mise à couvert, Carapace tombée, familier étourdi. */
  swallowed?: number;
  /** Les dégâts dans le temps sont en train de tomber (ils passent sous la Carapace divine). */
  dotTicking?: boolean;
  regard?: number;
  covered?: boolean;
  carapaceDown?: number;
  petStunned?: number;
  /** Couronne d'Irem : le premier tour du combat est sauté. */
  skipTurn?: boolean;
  /** Butin d'Irem, une fois par tour ou par combat : Bague du lien royal, Bague des reflets, Larme du rêveur. */
  mixDrawUsed?: boolean;
  spellTwiceUsed?: boolean;
  dreamEnergyUsed?: boolean;
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
  playing?: { cost: number; type: CardType; id: string; school?: School; aoe?: boolean; opener?: boolean };
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
  /** Les contraintes de difficulté qui touchent les ennemis. */
  mods?: CombatMods;
  /** Ysolde : Adrénaline ardente (PV perdus à la fin de ton prochain tour). */
  adrenaline?: number;
  /** Phylactère brisé : déjà utilisé pendant ce combat. */
  cheatedDeath?: boolean;
  /** Vhaeryx : les adds morts pendant le combat (pour la phase 3). */
  fallen?: number;
  /** Les œufs de l'événement ont été laissés : Vhaeryx appelle un add de plus. */
  extraAdds?: number;
  /** Sceptre du gardien : l'énergie de ce tour a déjà été gagnée. */
  killEnergyUsed?: boolean;
  /** Croc des trois souffles : l'effet de la prochaine Attaque (0, 1, 2). */
  fangStep?: number;
  /** Démoniste — éclats d'âme (0 à 5), repris de la run au début du combat. */
  shards?: number;
  /** Démoniste — le familier, et ses bonus pour ce combat. */
  pet?: PetId | null;
  petBonus?: number;
  petDouble?: boolean;
  /** Le familier a été sacrifié (Sacrifice démoniaque) : +1 énergie par tour. */
  petSacrificed?: boolean;
  /** Le Seigneur infernal : dégâts à tous les ennemis à la fin de chacun de tes tours. */
  infernal?: number;
  /** La dernière cible visée (Succube, Molosse infernal). */
  lastTarget?: number;
  /** Ennemis visés par Siphon d'âme ou Brûlure de l'ombre ce tour-ci (uid → éclats gagnés s'il meurt). */
  soulSiphon?: Record<number, number>;
  /** Amplifier la malédiction, Pacte de destruction, Contrecoup. */
  amplify?: boolean;
  doubleNext?: boolean;
  shadowFree?: boolean;
  /** Pierre d'âme : prête à te relever. */
  soulstone?: boolean;
  /** Le Molosse infernal : son Verrou magique est prêt dans ce nombre de tours. */
  felhunterLock?: number;
  /** Pierres de vie créées pendant le combat (rangées dans les emplacements de potion par la run). */
  newPotions?: string[];
  /** Prêtre — l'Égide (bouclier qui reste d'un tour à l'autre), son plafond, et la Foi. */
  aegis?: number;
  maxAegis?: number;
  faith?: number;
  maxFaith?: number;
  /** La carte jouée a soigné ou donné de l'Égide (pour la Foi). */
  healedFlag?: boolean;
  /** Prêtre — en Forme d'Ombre jusqu'à la fin du combat. */
  shadowForm?: boolean;
  /** Grâce : PV rendus au début des prochains tours. */
  renew?: { amount: number; turns: number };
  /** Égide des anciens : tes PV ne descendent pas sous 1 pendant ce nombre de tours. */
  undying?: number;
  /** Ange gardien : déjà utilisé. */
  angelUsed?: boolean;
  /** Transfusion de puissance : tes cartes coûtent 1 de moins ce tour-ci. */
  costDown?: boolean;
  /** PV max gagnés pour toute la run pendant ce combat (Bénédiction de vigueur). */
  maxHpGain?: number;
  /** Voleur — les points de combo (0 à 5) et le Camouflage (tours restants, celui-ci compris). */
  combo?: number;
  stealth?: boolean;
  stealthTurns?: number;
  /** Fumigène, Coup fourré : Camouflé au début du prochain tour. */
  stealthNext?: boolean;
  /** Bond de l'ombre : la prochaine Attaque de ce tour est jouée comme si tu étais Camouflé. */
  shadowStep?: boolean;
  /** Le Poison d'arme actif (un seul à la fois). */
  weaponPoison?: { id: 'mortel' | 'affaiblissant' | 'engourdissant'; amount: number };
  /** Poison engourdissant : déjà utilisé ce tour-ci. */
  numbUsed?: boolean;
  /** Danse des lames : +bonus aux Attaques pendant ce nombre de tours. */
  bladeDance?: { bonus: number; turns: number };
  /** Sang-froid : la prochaine Attaque inflige double dégâts. */
  coldBlood?: boolean;
  /** Riposte : la riposte donne aussi des points de combo. */
  riposteCombo?: number;
  /** Plan parfait : tes Ouvertures coûtent 0 ce tour-ci. */
  openersFree?: boolean;
  /** Ténèbres a été joué : le Camouflage durera 2 tours aux combats suivants (gardé par la run). */
  tenebres?: boolean;
  /** Sillon d'orage : Attaques jouées pendant le combat. */
  stormCount?: number;
  /** Paladin — les Sceaux actifs (un seul, deux avec Double sceau) ; leur présence marque un combat de Paladin. */
  seals?: SealId[];
  /** Le dernier Sceau consommé par un Jugement (Inquisition). */
  lastJudged?: SealId;
  /** L'Aura active et sa valeur (Robustesse donnée par l'Aura de dévotion, dégâts de l'Aura d'épines). */
  aura?: { id: AuraId; value: number } | null;
  /** Consécration : dégâts à tous les ennemis à la fin de tes tours. */
  consecration?: { dmg: number; turns: number };
  /** Pavois sacré : chaque attaque bloquée jusqu'à ton prochain tour blesse l'attaquant. */
  pavois?: number;
  /** Bouclier du croisé : chaque attaque bloquée jusqu'à ton prochain tour blesse l'attaquant et te soigne. */
  crusaderShield?: { dmg: number; heal: number };
  /** Faveur divine : ta prochaine carte de soin ou ton prochain Sort a son effet doublé. */
  favor?: boolean;
  /** Dégâts bloqués depuis ton dernier tour (Juste châtiment). */
  blockedSince?: number;
  /** Illumination déjà déclenchée ce tour-ci ; Fervent : +1 énergie au prochain tour. */
  illumUsed?: boolean;
  ferventNext?: boolean;
  ferventUsed?: boolean;
  /** Dernier serment : déjà utilisé. */
  oathUsed?: boolean;
  /** Science du combat : ta prochaine carte de soin coûte 0 ce tour-ci. */
  healFree?: boolean;
  /** Vengeance divine : bonus de la prochaine Attaque après un Jugement. */
  judgeBonus?: number;
  /** Zèle : Puissance déjà gagnée. */
  zealGained?: number;
  /** Ailes de justice : tours restants (+2 Puissance). */
  wings?: number;
  /** La carte jouée a soigné (Faveur divine, Science du combat). */
  palHealed?: boolean;
  /** Œil de l'abîme : tu vois les intentions suivantes. */
  seeAll?: boolean;
  /** Le familier est en train d'agir (Éclat partagé). */
  petActing?: boolean;
  /** Pacte de sang gratuit ce tour-ci (Bâton du Veilleur du Démoniste) déjà utilisé. */
  freePactUsed?: boolean;
  bleedDoneThisTurn?: boolean;
  /** La classe jouée (guerrier par défaut). */
  classId?: string;
  /** Inspiration : la prochaine carte coûte 0. Présence d'esprit : le prochain Sort coûte 0. */
  freeNext?: boolean;
  freeNextSpell?: boolean;
  /** Toucher glacial : la prochaine carte avec Fracasser agit comme si la cible avait 3 Gel. */
  shatterReady?: boolean;
  /** Sorts (cartes) joués ce tour-ci, pour Concentration arcanique. */
  mageSpellsThisTurn?: number;
  nextUid: number;
  rng: number;
}

export type Screen = 'act' | 'blessing' | 'map' | 'combat' | 'reward' | 'campfire' | 'event' | 'shop' | 'wipe' | 'victory' | 'gameover';

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
  version: 23;
  /** La classe jouée pendant cette run. */
  classId: string;
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
  /** L'acte en cours (1 ou 2). */
  act: number;
  /** Étages franchis dans les actes précédents (pour le score). */
  floorsDone: number;
  /** Le boss de fin d'acte vient d'être vaincu : 'loot' (sa table), 'epic' (le butin de boss), puis l'écran de l'acte suivant. */
  bossStage: 'loot' | 'epic' | null;
  /** Bonus valables jusqu'à la fin de l'acte (Autel chromatique, sérum du marchand de cobayes). */
  actBuffs: ItemEffects;
  /** Les œufs de dragon ont été laissés (Vhaeryx aura un add de plus par vague). */
  eggsLeft: boolean;
  /** Observatoire : tu vois les intentions suivantes pendant ce nombre de combats. */
  stargazing: number;
  /** Quête légendaire du Mage : le Bâton du Veilleur. */
  veilleur: 'fragment' | 'tete' | 'forged' | null;
  /** Démoniste : les éclats d'âme, conservés d'un combat à l'autre. */
  shards: number;
  /** Démoniste : le familier choisi au dernier combat. */
  pet: PetId;
  /** Quête légendaire du Prêtre : Équinoxe. */
  equinoxe: 'baton' | 'larme' | 'forged' | null;
  /** Quête légendaire du Voleur : Sillon d'orage (les deux Fermoirs de l'orage, puis Ventor). */
  sillon: 'gauche' | 'droit' | 'deux' | 'forged' | null;
  /** Voleur : Ténèbres a été joué, le Camouflage de début de combat dure 2 tours jusqu'à la fin de la run. */
  tenebres: boolean;
  /** Quête légendaire du Paladin : l'Aurore ardente (la Lame ternie, purifiée par la mort d'Ossyrax, puis forgée). */
  aurore: 'lame' | 'purifiee' | 'benie' | 'forged' | null;
  /** Acte 3 : bonus pour toute la run (bénédiction des Veilleurs de l'Aurore). */
  runBuffs: ItemEffects;
  /** Le Gong des Sables a été frappé : le prochain combat est un pack difficile avec un ennemi de plus. */
  gong: boolean;
  /** Le Rêve d'Yzhar : Folie au début du prochain combat. */
  nextFolie: number;
  /** Les monstres vaincus pendant la run (pour les archives de la guilde). */
  kills: Record<string, number>;
  /** Niveau de difficulté (0 à 20) et nombre de wipes autorisés au départ. */
  difficulty: number;
  maxWipes: number;
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
