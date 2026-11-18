// Les cartes du Guerrier disponibles dans le prototype, et la carte-statut Zone de feu.
// Référence : docs/classes/GUERRIER.md
import {
  addStatusToHand,
  fx,
  applySaignement,
  drawCards,
  gainBlock,
  gainRage,
  livingEnemies,
  log,
  playerAttack,
} from './actions';
import { isInterruptible } from './enemies';
import type { CardType, CombatState, EnemyState, Rarity } from './types';

export interface PlayContext {
  c: CombatState;
  target: EnemyState | null;
  up: boolean;
  rageSpent: number;
  dealt: boolean; // la carte a infligé des dégâts (pour la rage)
}

export interface CardDef {
  id: string;
  name: string;
  type: CardType;
  rarity: Rarity;
  cost: number;
  costUp?: number;
  rageCost?: number | 'all';
  needsTarget: boolean;
  exhaust?: boolean;
  exhaustUp?: boolean;
  ethereal?: boolean;
  unplayableText?: string;
  icon: 'epee' | 'bouclier' | 'pouvoir' | 'feu';
  text: (up: boolean) => string;
  play: (ctx: PlayContext) => void;
}

function hit(ctx: PlayContext, base: number, opts: { rageCard?: boolean; ignoreBlock?: boolean } = {}): void {
  if (!ctx.target) return;
  const dmg = playerAttack(ctx.c, ctx.target, base, opts);
  if (dmg > 0) ctx.dealt = true;
}

function otherEnemy(ctx: PlayContext): EnemyState | null {
  return livingEnemies(ctx.c).find((e) => e !== ctx.target) ?? null;
}

export const CARDS: Record<string, CardDef> = {
  // --- Deck de départ ---
  frappe: {
    id: 'frappe', name: 'Frappe', type: 'Attaque', rarity: 'depart', cost: 1, needsTarget: true, icon: 'epee',
    text: (up) => `Inflige ${up ? 9 : 6} dégâts.`,
    play: (ctx) => hit(ctx, ctx.up ? 9 : 6),
  },
  parade: {
    id: 'parade', name: 'Parade', type: 'Compétence', rarity: 'depart', cost: 1, needsTarget: false, icon: 'bouclier',
    text: (up) => `Gagne ${up ? 8 : 5} blocage.`,
    play: (ctx) => gainBlock(ctx.c, ctx.up ? 8 : 5),
  },
  frappe_heroique: {
    id: 'frappe_heroique', name: 'Frappe héroïque', type: 'Attaque', rarity: 'depart', cost: 1, rageCost: 3,
    needsTarget: true, icon: 'epee',
    text: (up) => `Inflige ${up ? 18 : 14} dégâts.`,
    play: (ctx) => hit(ctx, ctx.up ? 18 : 14, { rageCard: true }),
  },
  cri_de_guerre: {
    id: 'cri_de_guerre', name: 'Cri de guerre', type: 'Compétence', rarity: 'depart', cost: 0, needsTarget: false,
    icon: 'pouvoir',
    text: (up) => `Gagne ${up ? 3 : 2} rage. Pioche 1 carte.`,
    play: (ctx) => {
      gainRage(ctx.c, ctx.up ? 3 : 2);
      drawCards(ctx.c, 1);
    },
  },

  // --- Tronc commun ---
  enchainement: {
    id: 'enchainement', name: 'Enchaînement', type: 'Attaque', rarity: 'commune', cost: 1, needsTarget: true,
    icon: 'epee',
    text: (up) => `${up ? 11 : 8} dégâts, et ${up ? 6 : 4} à un autre ennemi.`,
    play: (ctx) => {
      const other = otherEnemy(ctx);
      hit(ctx, ctx.up ? 11 : 8);
      if (other && !other.dead) {
        const dmg = playerAttack(ctx.c, other, ctx.up ? 6 : 4);
        if (dmg > 0) ctx.dealt = true;
      }
    },
  },
  coup_de_tonnerre: {
    id: 'coup_de_tonnerre', name: 'Coup de tonnerre', type: 'Attaque', rarity: 'commune', cost: 1,
    needsTarget: false, icon: 'epee',
    text: (up) => `${up ? 7 : 4} dégâts à tous les ennemis. Ralenti 1.`,
    play: (ctx) => {
      for (const e of livingEnemies(ctx.c)) {
        if (playerAttack(ctx.c, e, ctx.up ? 7 : 4) > 0) ctx.dealt = true;
        if (!e.dead && !e.submerged) e.buffs.ralenti = Math.max(e.buffs.ralenti, 1);
      }
    },
  },
  fracasser_armure: {
    id: 'fracasser_armure', name: 'Fracasser armure', type: 'Compétence', rarity: 'commune', cost: 1,
    needsTarget: true, icon: 'epee',
    text: (up) => `Armure fracassée ${up ? 3 : 2} tours. Gagne 2 rage.`,
    play: (ctx) => {
      if (ctx.target) ctx.target.buffs.armureFracassee += ctx.up ? 3 : 2;
      gainRage(ctx.c, 2);
    },
  },
  cri_demoralisant: {
    id: 'cri_demoralisant', name: 'Cri démoralisant', type: 'Compétence', rarity: 'commune', cost: 1, costUp: 0,
    needsTarget: false, icon: 'pouvoir',
    text: () => `Tous les ennemis : Démoralisé 2 tours. +1 rage.`,
    play: (ctx) => {
      for (const e of livingEnemies(ctx.c)) if (!e.submerged) e.buffs.demoralise += 2;
      gainRage(ctx.c, 1);
    },
  },
  coup_de_bouclier: {
    id: 'coup_de_bouclier', name: 'Coup de bouclier', type: 'Compétence', rarity: 'peu_commune', cost: 1,
    needsTarget: true, icon: 'bouclier',
    text: (up) => `Interruption. Inflige ${up ? 8 : 4} dégâts.`,
    play: (ctx) => {
      if (!ctx.target) return;
      if (isInterruptible(ctx.target.intent) && !ctx.target.interrupted) {
        ctx.target.interrupted = true;
        fx(ctx.c, { kind: 'interrupt', who: ctx.target.uid });
        log(ctx.c, `${ctx.target.name} est interrompu !`);
      }
      playerAttack(ctx.c, ctx.target, ctx.up ? 8 : 4);
    },
  },
  interception: {
    id: 'interception', name: 'Interception', type: 'Attaque', rarity: 'peu_commune', cost: 1, needsTarget: true,
    icon: 'epee',
    text: (up) => `${up ? 9 : 6} dégâts. Retarde son incantation d'un tour.`,
    play: (ctx) => {
      if (ctx.target && isInterruptible(ctx.target.intent) && !ctx.target.interrupted) {
        ctx.target.delayed = true;
        log(ctx.c, `L'incantation de ${ctx.target.name} est retardée.`);
      }
      hit(ctx, ctx.up ? 9 : 6);
    },
  },
  cri_de_bataille: {
    id: 'cri_de_bataille', name: 'Cri de bataille', type: 'Pouvoir', rarity: 'peu_commune', cost: 1,
    needsTarget: false, icon: 'pouvoir',
    text: (up) => `Gagne ${up ? 3 : 2} Puissance.`,
    play: (ctx) => {
      ctx.c.player.puissance += ctx.up ? 3 : 2;
      fx(ctx.c, { kind: 'buff', who: 'player', label: `Puissance +${ctx.up ? 3 : 2}` });
    },
  },
  ignorer_la_douleur: {
    id: 'ignorer_la_douleur', name: 'Ignorer la douleur', type: 'Compétence', rarity: 'peu_commune', cost: 1,
    needsTarget: false, icon: 'bouclier',
    text: (up) => `${up ? 11 : 8} blocage. +1 rage par coup reçu, même bloqué.`,
    play: (ctx) => {
      gainBlock(ctx.c, ctx.up ? 11 : 8);
      ctx.c.player.ignorerDouleur = true;
    },
  },
  execution: {
    id: 'execution', name: 'Exécution', type: 'Attaque', rarity: 'rare', cost: 1, rageCost: 'all', needsTarget: true,
    icon: 'epee',
    text: (up) => `Toute ta rage : ${up ? 5 : 4} dégâts par point (${up ? 10 : 8} sous 30 % PV).`,
    play: (ctx) => {
      if (!ctx.target) return;
      const low = ctx.target.hp <= ctx.target.maxHp * 0.3;
      const perPoint = low ? (ctx.up ? 10 : 8) : ctx.up ? 5 : 4;
      if (ctx.rageSpent > 0) hit(ctx, perPoint * ctx.rageSpent, { rageCard: true });
    },
  },

  // --- Arbre Armes ---
  taillade: {
    id: 'taillade', name: 'Taillade', type: 'Attaque', rarity: 'commune', cost: 0, needsTarget: true, icon: 'epee',
    text: (up) => `Inflige ${up ? 5 : 3} dégâts. Saignement ${up ? 3 : 2}.`,
    play: (ctx) => {
      hit(ctx, ctx.up ? 5 : 3);
      if (ctx.target && !ctx.target.dead) applySaignement(ctx.target, ctx.up ? 3 : 2);
    },
  },
  pourfendre: {
    id: 'pourfendre', name: 'Pourfendre', type: 'Attaque', rarity: 'commune', cost: 1, needsTarget: true,
    icon: 'epee',
    text: (up) => `Saignement ${up ? 7 : 5} (3 tours).`,
    play: (ctx) => {
      if (ctx.target) applySaignement(ctx.target, ctx.up ? 7 : 5);
    },
  },
  fulgurance: {
    id: 'fulgurance', name: 'Fulgurance', type: 'Attaque', rarity: 'commune', cost: 0, rageCost: 1,
    needsTarget: true, icon: 'epee',
    text: (up) => `Inflige ${up ? 9 : 6} dégâts. Ignore le blocage.`,
    play: (ctx) => hit(ctx, ctx.up ? 9 : 6, { rageCard: true, ignoreBlock: true }),
  },
  frappe_ecrasante: {
    id: 'frappe_ecrasante', name: 'Frappe écrasante', type: 'Attaque', rarity: 'commune', cost: 2,
    needsTarget: true, icon: 'epee',
    text: (up) => `Inflige ${up ? 21 : 16} dégâts.`,
    play: (ctx) => hit(ctx, ctx.up ? 21 : 16),
  },

  // --- Arbre Fureur ---
  coup_de_folie: {
    id: 'coup_de_folie', name: 'Coup de folie', type: 'Attaque', rarity: 'commune', cost: 0, needsTarget: true,
    icon: 'epee',
    text: (up) => `${up ? 4 : 3} dégâts, 2 fois. +1 rage.`,
    play: (ctx) => {
      hit(ctx, ctx.up ? 4 : 3);
      hit(ctx, ctx.up ? 4 : 3);
      gainRage(ctx.c, 1);
    },
  },
  rage_sanglante: {
    id: 'rage_sanglante', name: 'Rage sanglante', type: 'Compétence', rarity: 'commune', cost: 0,
    needsTarget: false, icon: 'pouvoir',
    text: (up) => `Perds 3 PV. Gagne ${up ? 6 : 4} rage.`,
    play: (ctx) => {
      const p = ctx.c.player;
      p.hp = Math.max(1, p.hp - 3);
      gainRage(ctx.c, ctx.up ? 6 : 4);
    },
  },
  tourbillon: {
    id: 'tourbillon', name: 'Tourbillon', type: 'Attaque', rarity: 'peu_commune', cost: 2, needsTarget: false,
    icon: 'epee',
    text: (up) => `Inflige ${up ? 11 : 8} dégâts à tous les ennemis.`,
    play: (ctx) => {
      for (const e of livingEnemies(ctx.c)) {
        if (playerAttack(ctx.c, e, ctx.up ? 11 : 8) > 0) ctx.dealt = true;
      }
    },
  },

  // --- Arbre Protection ---
  levee_de_bouclier: {
    id: 'levee_de_bouclier', name: 'Levée de bouclier', type: 'Compétence', rarity: 'commune', cost: 1,
    needsTarget: false, icon: 'bouclier',
    text: (up) => `Gagne ${up ? 12 : 9} blocage. Gagne 1 rage.`,
    play: (ctx) => {
      gainBlock(ctx.c, ctx.up ? 12 : 9);
      gainRage(ctx.c, 1);
    },
  },
  vengeance: {
    id: 'vengeance', name: 'Vengeance', type: 'Attaque', rarity: 'commune', cost: 1, needsTarget: true,
    icon: 'epee',
    text: (up) => `${up ? 11 : 8} dégâts. Coûte 0 si tu as tout bloqué au tour ennemi.`,
    play: (ctx) => hit(ctx, ctx.up ? 11 : 8),
  },
  inebranlable: {
    id: 'inebranlable', name: 'Inébranlable', type: 'Compétence', rarity: 'commune', cost: 2, needsTarget: false,
    icon: 'bouclier',
    text: (up) => `Gagne ${up ? 18 : 14} blocage.`,
    play: (ctx) => gainBlock(ctx.c, ctx.up ? 18 : 14),
  },

  // --- Carte-statut ---
  zone_de_feu: {
    id: 'zone_de_feu', name: 'Zone de feu', type: 'Statut', rarity: 'statut', cost: 1, needsTarget: false,
    ethereal: true, exhaust: true, icon: 'feu',
    text: () => `Bouger. Sinon : 6 dégâts en fin de tour.`,
    play: () => {},
  },
};

/** Coût en énergie d'une carte, en tenant compte de l'amélioration et des réductions. */
export function energyCost(c: CombatState, id: string, up: boolean): number {
  const def = CARDS[id];
  if (id === 'vengeance' && c.player.blockedFullAttack) return 0;
  return up && def.costUp !== undefined ? def.costUp : def.cost;
}

/** Les cartes qui peuvent apparaître en récompense, avec leur rareté. */
export const REWARD_POOL: string[] = Object.values(CARDS)
  .filter((d) => d.rarity === 'commune' || d.rarity === 'peu_commune' || d.rarity === 'rare')
  .map((d) => d.id);

export const STARTER_DECK: string[] = [
  'frappe', 'frappe', 'frappe', 'frappe',
  'parade', 'parade', 'parade', 'parade',
  'frappe_heroique', 'cri_de_guerre',
];

export function addStatus(c: CombatState, id: string, count: number): void {
  addStatusToHand(c, id, count);
}
