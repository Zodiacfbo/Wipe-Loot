// Les cartes du Guerrier, les cartes-statut, et (dans cards_mage.ts) les cartes du Mage.
// Référence : docs/classes/GUERRIER.md et docs/classes/MAGE.md
import {
  addPower,
  addStatusToHand,
  fx,
  onHpLost,
  applySaignement,
  applyFracture,
  drawCards,
  gainBlock,
  damageEnemy,
  damagePlayer,
  gainRage,
  healPlayer,
  livingEnemies,
  log,
  playerAttack,
  power,
} from './actions';
import { ENEMIES, isInterruptible } from './enemies';
import { random } from './rng';
import { basicAttack } from './spells';
import type { ItemEffects } from './items';
import type { CardInstance, CardType, CombatState, EnemyState, FormId, Rarity, School, SealId } from './types';
import { druidCostDelta } from './druide';
import { shamanCostDelta } from './chaman';
import { MAGE_CARDS } from './cards_mage';
import { DEMONISTE_CARDS } from './cards_demoniste';
import { PRETRE_CARDS } from './cards_pretre';
import { VOLEUR_CARDS } from './cards_voleur';
import { PALADIN_CARDS } from './cards_paladin';
import { CHASSEUR_CARDS } from './cards_chasseur';
import { DRUIDE_CARDS } from './cards_druide';
import { CHAMAN_CARDS } from './cards_chaman';

export interface PlayContext {
  c: CombatState;
  target: EnemyState | null;
  up: boolean;
  rageSpent: number;
  dealt: boolean; // la carte a infligé des dégâts (pour la rage)
  /** Démoniste : les éclats d'âme dépensés pour jouer la carte. */
  shardsSpent?: number;
  /** Prêtre : la Foi dépensée pour jouer la carte. */
  faithSpent?: number;
  /** Voleur : les points de combo dépensés par un coup final (avec Impitoyable). */
  comboSpent?: number;
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
  /** Une fois améliorée, la carte n'est plus Éphémère (Flux arcanique+). */
  etherealUp?: boolean;
  /** La classe de la carte (guerrier par défaut ; les cartes-statut sont communes à tous). */
  classId?: string;
  /** L'école de magie (Mage). */
  school?: School;
  /** Démoniste : coût en éclats d'âme ('all' : tous), et coût une fois améliorée. */
  shardCost?: number | 'all';
  shardCostUp?: number;
  /** Prêtre : coût en Foi ('all' : toute la Foi). */
  faithCost?: number | 'all';
  /** Voleur : Ouverture (jouable seulement en Camouflage) et finisher (consomme tous les points de combo). */
  opener?: boolean;
  finisher?: boolean;
  /** Paladin : une carte Sceau, une carte de soin (Science du combat). */
  seal?: boolean;
  /** Le Sceau qu'active la carte (une carte Sceau rejouée alors qu'il est actif le juge). */
  sealId?: SealId;
  healCard?: boolean;
  /** Chasseur : une carte Ordre (Dressage), une carte Piège. */
  order?: boolean;
  trap?: boolean;
  /** Druide : la forme de la carte ([Ours], [Félin], [Astrale]) ; hors de sa forme, elle coûte 1 de plus. */
  form?: FormId;
  unplayableText?: string;
  /** Carte injouable (Fardeau). */
  unplayable?: boolean;
  /** Commence le combat dans la main (une fois améliorée, pour Furie croissante). */
  innateUp?: boolean;
  icon: 'epee' | 'bouclier' | 'pouvoir' | 'feu' | 'sang';
  /** `g` : les effets de l'équipement et des talents, quand le texte en dépend (Exécution, Pourfendre). */
  text: (up: boolean, g?: ItemEffects) => string;
  play: (ctx: PlayContext) => void;
}

function hit(ctx: PlayContext, base: number, opts: { rageCard?: boolean; ignoreBlock?: boolean } = {}): void {
  if (!ctx.target) return;
  const dmg = playerAttack(ctx.c, ctx.target, base, opts);
  if (dmg > 0) ctx.dealt = true;
  // Balayage : l'Attaque touche aussi un deuxième ennemi.
  if (ctx.c.cleaving) {
    const other = livingEnemies(ctx.c).find((e) => e !== ctx.target && !e.submerged);
    if (other) playerAttack(ctx.c, other, base, opts);
  }
}

/** Un boss ou un gardien (résiste à la Peur et au Désarmement). */
function isBoss(e: EnemyState): boolean {
  const def = ENEMIES[e.defId];
  return !!(def.boss || def.elite);
}

function powerCard(ctx: PlayContext, id: string, value: number, label: string): void {
  addPower(ctx.c, id, value);
  fx(ctx.c, { kind: 'buff', who: 'player', label });
}

function otherEnemy(ctx: PlayContext): EnemyState | null {
  return livingEnemies(ctx.c).find((e) => e !== ctx.target) ?? null;
}

const WARRIOR_CARDS: Record<string, CardDef> = {
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
    text: (up, g) => `Armure fracassée ${(up ? 3 : 2) + (g?.fractureDuration ?? 0)} tours. Gagne 2 rage.`,
    play: (ctx) => {
      if (ctx.target) applyFracture(ctx.c, ctx.target, ctx.up ? 3 : 2);
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
        if (ctx.c.gear?.interruptDraw) drawCards(ctx.c, ctx.c.gear.interruptDraw);
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
    text: (up, g) => g?.executeAlways
      ? `Toute ta rage : ${up ? 10 : 8} dégâts par point.`
      : `Toute ta rage : ${up ? 5 : 4} dégâts par point (${up ? 10 : 8} sous ${g?.executeThreshold ?? 30} % PV).`,
    play: (ctx) => {
      if (!ctx.target) return;
      const low = ctx.target.hp <= ctx.target.maxHp * (ctx.c.gear?.executeThreshold ?? 30) / 100 || !!ctx.c.gear?.executeAlways;
      const perPoint = low ? (ctx.up ? 10 : 8) : ctx.up ? 5 : 4;
      if (ctx.rageSpent > 0) hit(ctx, perPoint * ctx.rageSpent, { rageCard: true });
    },
  },

  // --- Arbre Armes ---
  taillade: {
    id: 'taillade', name: 'Taillade', type: 'Attaque', rarity: 'commune', cost: 0, needsTarget: true, icon: 'sang',
    text: (up) => `Inflige ${up ? 5 : 3} dégâts. Saignement ${up ? 3 : 2}.`,
    play: (ctx) => {
      hit(ctx, ctx.up ? 5 : 3);
      if (ctx.target && !ctx.target.dead) applySaignement(ctx.target, ctx.up ? 3 : 2, ctx.c);
    },
  },
  pourfendre: {
    id: 'pourfendre', name: 'Pourfendre', type: 'Attaque', rarity: 'commune', cost: 1, needsTarget: true,
    icon: 'sang',
    text: (up, g) => `Saignement ${up ? 7 : 5} pendant\u00a0${3 + (g?.bleedDuration ?? 0)}\u00a0tours.`,
    play: (ctx) => {
      if (ctx.target) applySaignement(ctx.target, ctx.up ? 7 : 5, ctx.c);
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
      onHpLost(ctx.c);
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


  // --- Arbre Armes (suite) ---
  parade_ripostee: {
    id: 'parade_ripostee', name: 'Parade ripostée', type: 'Compétence', rarity: 'commune', cost: 1, needsTarget: false,
    icon: 'bouclier',
    text: (up) => `${up ? 9 : 6} blocage. Prochaine attaque reçue : ${up ? 9 : 6} dégâts en retour.`,
    play: (ctx) => {
      gainBlock(ctx.c, ctx.up ? 9 : 6);
      ctx.c.player.riposte = (ctx.c.player.riposte ?? 0) + (ctx.up ? 9 : 6);
    },
  },
  coup_de_grace: {
    id: 'coup_de_grace', name: 'Coup de grâce', type: 'Attaque', rarity: 'peu_commune', cost: 1, needsTarget: true,
    icon: 'epee',
    text: (up) => `${up ? 10 : 7} dégâts. S'il meurt : +1 énergie et 3 rage.`,
    play: (ctx) => {
      hit(ctx, ctx.up ? 10 : 7);
      if (ctx.target?.dead) {
        ctx.c.player.energy += 1;
        gainRage(ctx.c, 3);
        log(ctx.c, 'Coup de grâce : +1 énergie et 3 rage.');
      }
    },
  },
  balayage: {
    id: 'balayage', name: 'Balayage', type: 'Compétence', rarity: 'peu_commune', cost: 1, needsTarget: false,
    icon: 'epee',
    text: (up) => `Tes ${up ? 3 : 2} prochaines Attaques du tour touchent un 2e ennemi.`,
    play: (ctx) => {
      ctx.c.cleave = (ctx.c.cleave ?? 0) + (ctx.up ? 3 : 2);
    },
  },
  entaille_profonde: {
    id: 'entaille_profonde', name: 'Entaille profonde', type: 'Pouvoir', rarity: 'peu_commune', cost: 1,
    needsTarget: false, icon: 'sang',
    text: (up) => `Tes Attaques à rage appliquent Saignement ${up ? 3 : 2}.`,
    play: (ctx) => powerCard(ctx, 'entaille_profonde', ctx.up ? 3 : 2, 'Entaille profonde'),
  },
  cri_intimidation: {
    id: 'cri_intimidation', name: 'Cri d\'intimidation', type: 'Compétence', rarity: 'peu_commune', cost: 1,
    needsTarget: true, exhaust: true, icon: 'pouvoir',
    text: (up) => `Cible (sauf boss) : Peur. Autres : Démoralisé ${up ? 2 : 1}. +1 rage. Épuisé.`,
    play: (ctx) => {
      const t = ctx.target;
      if (t && !isBoss(t)) {
        t.buffs.peur = 1;
        fx(ctx.c, { kind: 'buff', who: t.uid, label: 'Apeuré' });
      }
      for (const e of livingEnemies(ctx.c)) if (e !== t) e.buffs.demoralise = Math.max(e.buffs.demoralise, ctx.up ? 2 : 1);
      gainRage(ctx.c, 1);
    },
  },
  concentration_martiale: {
    id: 'concentration_martiale', name: 'Concentration martiale', type: 'Pouvoir', rarity: 'rare', cost: 1, costUp: 0,
    needsTarget: false, icon: 'pouvoir',
    text: () => `Début de ton tour : si tu as 5 rage ou plus, +1 énergie.`,
    play: (ctx) => powerCard(ctx, 'concentration', 1, 'Concentration martiale'),
  },
  frappe_du_colosse: {
    id: 'frappe_du_colosse', name: 'Frappe du colosse', type: 'Attaque', rarity: 'rare', cost: 2, needsTarget: true,
    icon: 'epee',
    text: (up, g) => `Retire tout son blocage. ${up ? 14 : 10} dégâts. Armure fracassée ${2 + (g?.fractureDuration ?? 0)}.`,
    play: (ctx) => {
      if (!ctx.target) return;
      ctx.target.block = 0;
      hit(ctx, ctx.up ? 14 : 10);
      applyFracture(ctx.c, ctx.target, 2);
    },
  },
  tempete_acier: {
    id: 'tempete_acier', name: 'Tempête d\'acier', type: 'Attaque', rarity: 'rare', cost: 3, needsTarget: false,
    icon: 'epee',
    text: (up) => `${up ? 5 : 4} dégâts à tous les ennemis, 4 fois.`,
    play: (ctx) => {
      for (let i = 0; i < 4; i++) {
        for (const e of livingEnemies(ctx.c)) if (playerAttack(ctx.c, e, ctx.up ? 5 : 4) > 0) ctx.dealt = true;
      }
    },
  },
  maitre_armes: {
    id: 'maitre_armes', name: 'Maître d\'armes', type: 'Pouvoir', rarity: 'rare', cost: 2, costUp: 1,
    needsTarget: false, icon: 'pouvoir',
    text: () => `Tes Attaques qui coûtent de la rage infligent +4 dégâts.`,
    play: (ctx) => powerCard(ctx, 'maitre_armes', 4, 'Maître d\'armes'),
  },
  frappe_mortelle: {
    id: 'frappe_mortelle', name: 'Frappe mortelle', type: 'Attaque', rarity: 'epique', cost: 1, rageCost: 4,
    needsTarget: true, icon: 'epee',
    text: (up, g) => `${up ? 24 : 18} dégâts. Ne peut plus être soigné. Armure fracassée ${1 + (g?.fractureDuration ?? 0)}.`,
    play: (ctx) => {
      if (!ctx.target) return;
      hit(ctx, ctx.up ? 24 : 18, { rageCard: true });
      if (!ctx.target.dead) {
        ctx.target.noHeal = true;
        applyFracture(ctx.c, ctx.target, 1);
      }
    },
  },
  frappe_brutale: {
    id: 'frappe_brutale', name: 'Frappe brutale', type: 'Attaque', rarity: 'commune', cost: 1, rageCost: 2,
    needsTarget: true, icon: 'epee',
    text: (up) => `Inflige ${up ? 16 : 12} dégâts.`,
    play: (ctx) => hit(ctx, ctx.up ? 16 : 12, { rageCard: true }),
  },
  brise_guerre: {
    id: 'brise_guerre', name: 'Brise-guerre', type: 'Attaque', rarity: 'rare', cost: 2, rageCost: 3,
    needsTarget: false, icon: 'epee',
    text: (up, g) => `${up ? 16 : 12} dégâts à tous les ennemis. Armure fracassée ${2 + (g?.fractureDuration ?? 0)}.`,
    play: (ctx) => {
      for (const e of livingEnemies(ctx.c)) {
        if (e.submerged) continue;
        if (playerAttack(ctx.c, e, ctx.up ? 16 : 12, { rageCard: true }) > 0) ctx.dealt = true;
        applyFracture(ctx.c, e, 2);
      }
    },
  },

  // --- Arbre Fureur (suite) ---
  frappe_frenetique: {
    id: 'frappe_frenetique', name: 'Frappe frénétique', type: 'Attaque', rarity: 'commune', cost: 1, needsTarget: true,
    icon: 'epee',
    text: (up) => `${up ? 7 : 5} dégâts, +${up ? 3 : 2} par Attaque déjà jouée ce tour.`,
    play: (ctx) => hit(ctx, (ctx.up ? 7 : 5) + (ctx.up ? 3 : 2) * (ctx.c.attacksThisTurn ?? 0)),
  },
  hurlement_furieux: {
    id: 'hurlement_furieux', name: 'Hurlement furieux', type: 'Compétence', rarity: 'commune', cost: 1,
    needsTarget: false, icon: 'pouvoir',
    text: (up) => `Gagne 3 rage. Pioche ${up ? 2 : 1} carte${up ? 's' : ''}.`,
    play: (ctx) => {
      gainRage(ctx.c, 3);
      drawCards(ctx.c, ctx.up ? 2 : 1);
    },
  },
  soif_de_bataille: {
    id: 'soif_de_bataille', name: 'Soif de bataille', type: 'Compétence', rarity: 'commune', cost: 1, costUp: 0,
    needsTarget: false, icon: 'pouvoir',
    text: () => `Pioche 2 Attaques depuis ta pioche.`,
    play: (ctx) => {
      const c = ctx.c;
      for (let n = 0; n < 2 && c.hand.length < 10; n++) {
        const i = c.draw.findIndex((card) => CARDS[card.id].type === 'Attaque');
        if (i < 0) break;
        c.hand.push(...c.draw.splice(i, 1));
      }
    },
  },
  ruee_sanguinaire: {
    id: 'ruee_sanguinaire', name: 'Ruée sanguinaire', type: 'Attaque', rarity: 'peu_commune', cost: 2,
    needsTarget: false, icon: 'epee',
    text: (up) => `3 dégâts ${up ? 7 : 5} fois, sur des ennemis au hasard.`,
    play: (ctx) => {
      for (let i = 0; i < (ctx.up ? 7 : 5); i++) {
        const alive = livingEnemies(ctx.c).filter((e) => !e.submerged);
        if (alive.length === 0) break;
        const e = alive[Math.floor(random(ctx.c) * alive.length)];
        if (playerAttack(ctx.c, e, 3) > 0) ctx.dealt = true;
      }
    },
  },
  enrage: {
    id: 'enrage', name: 'Enragé', type: 'Pouvoir', rarity: 'peu_commune', cost: 1, needsTarget: false,
    icon: 'pouvoir',
    text: (up) => `Quand tu perds des PV : ta prochaine Attaque +${up ? 5 : 3} dégâts.`,
    play: (ctx) => powerCard(ctx, 'enrage', ctx.up ? 5 : 3, 'Enragé'),
  },
  rafale: {
    id: 'rafale', name: 'Rafale', type: 'Pouvoir', rarity: 'peu_commune', cost: 1, costUp: 0, needsTarget: false,
    icon: 'pouvoir',
    text: () => `Quand tu joues ta 3e Attaque d'un tour, pioche 1 carte.`,
    play: (ctx) => powerCard(ctx, 'rafale', 1, 'Rafale'),
  },
  ambidextrie: {
    id: 'ambidextrie', name: 'Ambidextrie', type: 'Pouvoir', rarity: 'rare', cost: 2, costUp: 1, needsTarget: false,
    icon: 'pouvoir',
    text: () => `Début de ton tour : une Frappe de la main gauche en main.`,
    play: (ctx) => powerCard(ctx, 'ambidextrie', 1, 'Ambidextrie'),
  },
  main_gauche: {
    id: 'main_gauche', name: 'Frappe de la main gauche', type: 'Attaque', rarity: 'statut', cost: 0,
    needsTarget: true, ethereal: true, exhaust: true, icon: 'epee',
    text: () => `Inflige 4 dégâts. Éphémère.`,
    play: (ctx) => hit(ctx, 4),
  },
  furie_croissante: {
    id: 'furie_croissante', name: 'Furie croissante', type: 'Pouvoir', rarity: 'rare', cost: 1, needsTarget: false,
    innateUp: true, icon: 'pouvoir',
    text: (up) => `Quand ta rage atteint son maximum, +1 Puissance.${up ? ' Inné.' : ''}`,
    play: (ctx) => powerCard(ctx, 'furie_croissante', 1, 'Furie croissante'),
  },
  fureur_suicidaire: {
    id: 'fureur_suicidaire', name: 'Fureur suicidaire', type: 'Compétence', rarity: 'rare', cost: 1,
    needsTarget: false, exhaust: true, icon: 'pouvoir',
    text: (up) => `${up ? 4 : 3} tours : Attaques +50 %, tu subis +25 %. Épuisé.`,
    play: (ctx) => {
      ctx.c.player.fureur = Math.max(ctx.c.player.fureur ?? 0, ctx.up ? 4 : 3);
      fx(ctx.c, { kind: 'buff', who: 'player', label: 'Fureur suicidaire' });
    },
  },
  furie_inextinguible: {
    id: 'furie_inextinguible', name: 'Furie inextinguible', type: 'Pouvoir', rarity: 'rare', cost: 2,
    needsTarget: false, icon: 'pouvoir',
    text: (up) => `Rage max 15. Gagne ${up ? 2 : 1} rage au début de chaque tour.`,
    play: (ctx) => {
      ctx.c.player.maxRage = Math.max(ctx.c.player.maxRage, 15);
      powerCard(ctx, 'furie_inextinguible', ctx.up ? 2 : 1, 'Rage max 15');
    },
  },
  sanguinaire: {
    id: 'sanguinaire', name: 'Sanguinaire', type: 'Attaque', rarity: 'epique', cost: 1, rageCost: 3, needsTarget: true,
    icon: 'epee',
    text: (up) => `${up ? 16 : 12} dégâts. Te soigne de ${up ? 7 : 5} PV.`,
    play: (ctx) => {
      hit(ctx, ctx.up ? 16 : 12, { rageCard: true });
      healPlayer(ctx.c, ctx.up ? 7 : 5);
    },
  },

  // --- Arbre Protection (suite) ---
  coup_de_semonce: {
    id: 'coup_de_semonce', name: 'Coup de semonce', type: 'Attaque', rarity: 'commune', cost: 1, needsTarget: true,
    icon: 'epee',
    text: (up) => `${up ? 9 : 6} dégâts. Démoralisé 1 tour.`,
    play: (ctx) => {
      hit(ctx, ctx.up ? 9 : 6);
      if (ctx.target && !ctx.target.dead) ctx.target.buffs.demoralise = Math.max(ctx.target.buffs.demoralise, 1);
    },
  },
  resolution: {
    id: 'resolution', name: 'Résolution', type: 'Compétence', rarity: 'commune', cost: 0, needsTarget: false,
    icon: 'bouclier',
    text: (up) => `Dépense la moitié de ta rage : ${up ? 4 : 3} blocage par point.`,
    play: (ctx) => {
      const p = ctx.c.player;
      const spent = Math.floor(p.rage / 2);
      p.rage -= spent;
      if (spent > 0) gainBlock(ctx.c, spent * (ctx.up ? 4 : 3));
    },
  },
  provocation: {
    id: 'provocation', name: 'Provocation', type: 'Compétence', rarity: 'peu_commune', cost: 1, needsTarget: true,
    exhaust: true, exhaustUp: false, icon: 'pouvoir',
    text: (up) => `Son intention devient une Attaque (incantation annulée).${up ? '' : ' Épuisé.'}`,
    play: (ctx) => {
      const t = ctx.target;
      if (!t) return;
      t.intent = { kind: 'attack', dmg: basicAttack(t) };
      t.interrupted = false;
      t.delayed = false;
      fx(ctx.c, { kind: 'buff', who: t.uid, label: 'Provoqué' });
      log(ctx.c, `${t.name} est provoqué : il va t'attaquer.`);
    },
  },
  desarmement: {
    id: 'desarmement', name: 'Désarmement', type: 'Compétence', rarity: 'peu_commune', cost: 1, costUp: 0,
    needsTarget: true, icon: 'bouclier',
    text: () => `N'attaque pas au prochain tour (boss : −30 % de dégâts).`,
    play: (ctx) => {
      if (!ctx.target) return;
      ctx.target.disarmed = true;
      fx(ctx.c, { kind: 'buff', who: ctx.target.uid, label: 'Désarmé' });
    },
  },
  charge_du_bouclier: {
    id: 'charge_du_bouclier', name: 'Charge du bouclier', type: 'Attaque', rarity: 'peu_commune', cost: 2,
    needsTarget: true, icon: 'bouclier',
    text: (up) => `${up ? 13 : 10} dégâts. Gagne ${up ? 13 : 10} blocage.`,
    play: (ctx) => {
      hit(ctx, ctx.up ? 13 : 10);
      gainBlock(ctx.c, ctx.up ? 13 : 10);
    },
  },
  tenacite: {
    id: 'tenacite', name: 'Ténacité', type: 'Pouvoir', rarity: 'peu_commune', cost: 1, needsTarget: false,
    icon: 'pouvoir',
    text: (up) => `Début de ton tour : gagne ${up ? 5 : 3} blocage.`,
    play: (ctx) => powerCard(ctx, 'tenacite', ctx.up ? 5 : 3, 'Ténacité'),
  },
  peau_de_fer: {
    id: 'peau_de_fer', name: 'Peau de fer', type: 'Pouvoir', rarity: 'peu_commune', cost: 1, needsTarget: false,
    icon: 'pouvoir',
    text: (up) => `Gagne ${up ? 3 : 2} Robustesse.`,
    play: (ctx) => {
      ctx.c.player.robustesse += ctx.up ? 3 : 2;
      fx(ctx.c, { kind: 'buff', who: 'player', label: `Robustesse +${ctx.up ? 3 : 2}` });
    },
  },
  cri_de_ralliement: {
    id: 'cri_de_ralliement', name: 'Cri de ralliement', type: 'Compétence', rarity: 'peu_commune', cost: 1,
    needsTarget: false, exhaust: true, icon: 'bouclier',
    text: (up) => `${up ? 9 : 6} blocage et 1 Robustesse. +1 rage. Épuisé.`,
    play: (ctx) => {
      ctx.c.player.robustesse += 1;
      gainRage(ctx.c, 1);
      gainBlock(ctx.c, ctx.up ? 9 : 6);
    },
  },
  riposte_bouclier: {
    id: 'riposte_bouclier', name: 'Riposte au bouclier', type: 'Pouvoir', rarity: 'rare', cost: 1, needsTarget: false,
    icon: 'pouvoir',
    text: (up) => `Attaque entièrement bloquée : ${up ? 8 : 5} dégâts en retour.`,
    play: (ctx) => powerCard(ctx, 'riposte_bouclier', ctx.up ? 8 : 5, 'Riposte au bouclier'),
  },
  garde_de_fer: {
    id: 'garde_de_fer', name: 'Garde de fer', type: 'Pouvoir', rarity: 'rare', cost: 2, costUp: 1, needsTarget: false,
    icon: 'pouvoir',
    text: () => `Début de ton tour : tu gardes la moitié de ton blocage.`,
    play: (ctx) => powerCard(ctx, 'garde_de_fer', 1, 'Garde de fer'),
  },
  bastion: {
    id: 'bastion', name: 'Bastion', type: 'Pouvoir', rarity: 'rare', cost: 2, needsTarget: false, icon: 'pouvoir',
    text: (up) => `Quand tu joues une carte de blocage : ${up ? 5 : 3} dégâts à tous.`,
    play: (ctx) => powerCard(ctx, 'bastion', ctx.up ? 5 : 3, 'Bastion'),
  },
  heurt_de_bouclier: {
    id: 'heurt_de_bouclier', name: 'Heurt de bouclier', type: 'Attaque', rarity: 'epique', cost: 1, rageCost: 2,
    needsTarget: true, icon: 'bouclier',
    text: (up) => `Dégâts : blocage gagné ce tour-ci + ${up ? 12 : 6}.`,
    play: (ctx) => hit(ctx, (ctx.c.player.blockGained ?? 0) + (ctx.up ? 12 : 6), { rageCard: true }),
  },

  // --- Carte-statut ---
  zone_de_feu: {
    id: 'zone_de_feu', name: 'Zone de feu', type: 'Statut', rarity: 'statut', cost: 1, needsTarget: false,
    ethereal: true, exhaust: true, icon: 'feu',
    text: (_up, g) => `Bouger. Sinon : ${Math.round(6 * (1 - Math.min(100, g?.zoneReduce ?? 0) / 100))} dégâts en fin de tour.`,
    play: () => {},
  },
  bombe_vivante: {
    id: 'bombe_vivante', name: 'Bombe vivante', type: 'Statut', rarity: 'statut', cost: 1, needsTarget: false,
    ethereal: true, exhaust: true, icon: 'feu',
    text: () => `S'éloigner. Sinon : 15 dégâts en fin de tour (et 5 à chaque ennemi).`,
    play: () => {},
  },
  malediction: {
    id: 'malediction', name: 'Malédiction', type: 'Statut', rarity: 'statut', cost: 0, needsTarget: false,
    unplayable: true, icon: 'pouvoir',
    text: () => `Malédiction permanente. Injouable.`,
    play: () => {},
  },
  // --- Cartes-statut du chapitre II ---
  sceptre_domination: {
    id: 'sceptre_domination', name: 'Sceptre de domination', type: 'Statut', rarity: 'statut', cost: 1, needsTarget: true,
    ethereal: true, exhaust: true, icon: 'pouvoir',
    text: () => `Un Dragonnet t'obéit : il détruit un Œuf, ou inflige 8 dégâts.`,
    play: (ctx) => {
      const c = ctx.c;
      const t = ctx.target;
      if (!t) return;
      // Un Dragonnet ennemi change de camp (il quitte le combat).
      const pet = livingEnemies(c).find((e) => e.defId === 'dragonnet');
      if (pet) {
        pet.dead = true;
        pet.gone = true;
        fx(c, { kind: 'death', who: pet.uid });
      }
      if (t.defId.startsWith('oeuf')) {
        fx(c, { kind: 'tick', who: t.uid, amount: t.hp, label: 'Dragonnet' });
        damageEnemy(c, t, t.hp + t.block);
      } else {
        fx(c, { kind: 'tick', who: t.uid, amount: 8, label: 'Dragonnet' });
        damageEnemy(c, t, 8);
      }
      ctx.dealt = true;
    },
  },
  fiole_instable: {
    id: 'fiole_instable', name: 'Fiole instable', type: 'Statut', rarity: 'statut', cost: 0, needsTarget: false,
    ethereal: true, exhaust: true, icon: 'pouvoir',
    text: () => `Boire : au hasard +1 énergie, soigne 5 PV ou perds 5 PV.`,
    play: (ctx) => {
      const c = ctx.c;
      const roll = c.gear?.luck && random(c) < 0.5 ? 0 : Math.floor(random(c) * 3);
      if (roll === 0) {
        c.player.energy += 1;
        fx(c, { kind: 'buff', who: 'player', label: '+1 énergie' });
      } else if (roll === 1) {
        const healed = healPlayer(c, 5);
        fx(c, { kind: 'heal', from: 'player', to: 'player', amount: healed });
      } else {
        fx(c, { kind: 'tick', who: 'player', amount: 5, label: 'Fiole' });
        damagePlayer(c, 5, false);
      }
    },
  },
  cendres: {
    id: 'cendres', name: 'Cendres', type: 'Statut', rarity: 'statut', cost: 0, needsTarget: false,
    unplayable: true, ethereal: true, icon: 'feu',
    text: () => `Injouable. Disparaît à la fin du tour.`,
    play: () => {},
  },
  // Acte 3 : le Sable des momies et des vers, les Hallucinations de la Folie.
  sable: {
    id: 'sable', name: 'Sable', type: 'Statut', rarity: 'statut', cost: 0, needsTarget: false,
    unplayable: true, ethereal: true, icon: 'pouvoir',
    text: () => `Injouable. Disparaît à la fin du tour.`,
    play: () => {},
  },
  cristal_obsidienne: {
    // Sartaq, le Colosse d'obsidienne (acte 3) : le moment de frapper fort.
    id: 'cristal_obsidienne', name: 'Cristal d\'obsidienne', type: 'Statut', rarity: 'statut', cost: 1, needsTarget: false,
    exhaust: true, icon: 'pouvoir',
    text: () => `Sartaq perd blocage et Suprématie ; +50 % de dégâts 2 tours. Épuisé.`,
    play: (ctx) => {
      const c = ctx.c;
      for (const e of livingEnemies(c)) {
        if (e.defId !== 'sartaq') continue;
        e.block = 0;
        // Suprématie suspendue à son prochain tour : pas de blocage pendant ce tour et le suivant.
        e.suspended = 1;
        e.buffs.armureFracassee = Math.max(e.buffs.armureFracassee, 2);
        fx(c, { kind: 'buff', who: e.uid, label: 'Suprématie brisée !' });
        log(c, 'Le Cristal se brise : Sartaq perd son blocage, et sa Suprématie vacille.');
      }
    },
  },
  a_couvert: {
    // Yzhar (acte 3) : le Regard sombre ne trouve pas qui se cache.
    id: 'a_couvert', name: 'Se mettre à couvert', type: 'Statut', rarity: 'statut', cost: 1, needsTarget: false,
    ethereal: true, exhaust: true, icon: 'bouclier',
    text: () => `Le Regard sombre ne te touche pas ce tour-ci. Éphémère.`,
    play: (ctx) => {
      ctx.c.covered = true;
      fx(ctx.c, { kind: 'buff', who: 'player', label: 'À couvert' });
      log(ctx.c, 'Tu te mets à couvert derrière une colonne.');
    },
  },
  hallucination: {
    // Elle prend l'apparence d'une vraie carte du deck (CardInstance.mimic, voir folie.ts).
    id: 'hallucination', name: 'Hallucination', type: 'Statut', rarity: 'statut', cost: 0, needsTarget: false,
    ethereal: true, exhaust: true, icon: 'pouvoir',
    text: () => `Une fausse carte : la jouer ne fait rien et coûte 2 PV. Éphémère.`,
    play: (ctx) => {
      const c = ctx.c;
      log(c, 'La carte se dissipe entre tes doigts : c\'était une Hallucination !');
      fx(c, { kind: 'tick', who: 'player', amount: 2, label: 'Hallucination' });
      damagePlayer(c, 2, false);
    },
  },
  fardeau: {
    id: 'fardeau', name: 'Fardeau', type: 'Statut', rarity: 'statut', cost: 0, needsTarget: false,
    unplayable: true, icon: 'pouvoir',
    text: () => `Malédiction. Injouable. Disparaît à la fin du combat.`,
    play: () => {},
  },
};

export const CARDS: Record<string, CardDef> = { ...WARRIOR_CARDS, ...MAGE_CARDS, ...DEMONISTE_CARDS, ...PRETRE_CARDS, ...VOLEUR_CARDS, ...PALADIN_CARDS, ...CHASSEUR_CARDS, ...DRUIDE_CARDS, ...CHAMAN_CARDS };

/** La classe d'une carte. */
export function cardClass(id: string): string {
  return CARDS[id]?.classId ?? 'guerrier';
}

/** Le coût en éclats d'âme d'une carte (Invocation rapide : les Invocations sont gratuites). */
export function shardCost(c: CombatState | null, id: string, up: boolean): number | 'all' {
  const def = CARDS[id];
  if (def.shardCost === undefined) return 0;
  if (def.shardCost === 'all') return 'all';
  if (c?.gear?.quickSummon && (id === 'invocation_succube' || id === 'invocation_molosse')) return 0;
  return up && def.shardCostUp !== undefined ? def.shardCostUp : def.shardCost;
}

/** La carte telle que le joueur la voit : une Hallucination prend l'apparence de la carte qu'elle imite. */
export function seenId(card: CardInstance): string {
  return card.id === 'hallucination' && card.mimic && CARDS[card.mimic] ? card.mimic : card.id;
}

/**
 * Le combat tel que le joueur le voit pour la carte `index` : une Hallucination y est remplacée par la carte imitée.
 * Elle se comporte donc comme elle (coût, cible, chiffres, lueur) et rien ne la trahit. Copie superficielle : lecture seule.
 */
export function seenCombat(c: CombatState, index: number): CombatState {
  const card = c.hand[index];
  if (!card || seenId(card) === card.id) return c;
  return { ...c, hand: c.hand.map((h, j) => (j === index ? { ...h, id: seenId(h) } : h)) };
}

/** La carte est-elle Éphémère (en tenant compte de l'amélioration) ? */
export function isEthereal(card: CardInstance): boolean {
  const def = CARDS[card.id];
  return card.upgraded && def.etherealUp !== undefined ? def.etherealUp : !!def.ethereal;
}

/** Coût en énergie d'une carte, en tenant compte de l'amélioration et des réductions. */
export function energyCost(c: CombatState, id: string, up: boolean): number {
  const def = CARDS[id];
  if (id === 'vengeance' && c.player.blockedFullAttack) return 0;
  // Inspiration, Présence d'esprit
  if (!def.unplayable && (c.freeNext || (c.freeNextSpell && def.type === 'Sort'))) return 0;
  // Démoniste : Contrecoup (Trait de l'ombre gratuit), Ruine améliorée (Feu de l'âme gratuit).
  if (id === 'trait_ombre' && c.shadowFree) return 0;
  if (id === 'feu_ame' && c.gear?.soulFireFree) return 0;
  // Bague du tisseur : la première carte du combat est gratuite.
  if (c.gear?.firstCardFree && !c.firstCardDone && !def.unplayable) return 0;
  // Plan parfait : les Ouvertures coûtent 0 ce tour-ci.
  if (def.opener && c.openersFree) return 0;
  // Paladin : Sceaux bénis, Science du combat, Purification rapide, Rétribution.
  const g = c.gear ?? {};
  if ((def.seal && g.sealsFree) || (def.healCard && c.healFree) || (id === 'lumiere_purificatrice' && g.purifyFree) || (id === 'juste_chatiment' && g.retributionFree)) return 0;
  // Chasseur : Maître de meute, Sang-froid, Riposte sauvage.
  if (id === 'esprit_meute' && g.packFree) return 0;
  if (def.type === 'Attaque' && g.hunterFirstFree && !c.firstAttackDone && c.companion) return 0;
  if (id === 'riposte_sauvage' && c.hunterBlocked) return 0;
  let cost = up && def.costUp !== undefined ? def.costUp : def.cost;
  // Dressage (Ordres), Calme absolu (Tir ajusté, Tir de précision), Tir rapide (Attaques).
  if (def.order) cost = Math.max(0, cost - power(c, 'dressage'));
  if ((id === 'tir_ajuste' || id === 'tir_precision') && power(c, 'calme_absolu') && !c.calmUsed) cost = Math.max(0, cost - 1);
  if (def.type === 'Attaque' && c.rapidFire) cost = Math.max(0, cost - 1);
  // Druide : +1 hors de sa forme ; Éclipse et Lumière stellaire réduisent le Feu stellaire.
  cost = Math.max(0, cost + druidCostDelta(c, id, def.form) + shamanCostDelta(c, def.type));
  const d = c.player.debuffs;
  if (d && (d.impie > 0 || d.afflictions?.includes('bleue')) && (c.cardsThisTurn ?? 0) === 0) cost += 1; // Malédiction de l'impie, Affliction bleue
  if (def.type === 'Compétence') cost += c.gear?.skillCost ?? 0; // Marteau des profondeurs
  if (c.costDown) cost = Math.max(0, cost - 1); // Transfusion de puissance
  // Bâton du Veilleur : le premier Sort de chaque tour coûte 0.
  if (def.type === 'Sort' && c.gear?.firstSpellFree && (c.mageSpellsThisTurn ?? 0) === 0) return 0;
  if (d && d.arcane > 0 && def.type === 'Sort') cost += 1; // Malédiction arcanique
  return cost;
}

const REWARDABLE = new Set<Rarity>(['commune', 'peu_commune', 'rare', 'epique']);

/** Les cartes d'une classe qui peuvent apparaître en récompense. */
export function rewardPool(classId = 'guerrier'): string[] {
  return Object.values(CARDS).filter((d) => REWARDABLE.has(d.rarity) && (d.classId ?? 'guerrier') === classId).map((d) => d.id);
}

/** Les cartes de départ d'une classe (pour les archives). */
export function starterCards(classId = 'guerrier'): string[] {
  return Object.values(CARDS).filter((d) => d.rarity === 'depart' && (d.classId ?? 'guerrier') === classId).map((d) => d.id);
}

/** Les récompenses du Guerrier (compatibilité). */
export const REWARD_POOL: string[] = rewardPool('guerrier');

export function addStatus(c: CombatState, id: string, count: number): void {
  addStatusToHand(c, id, count);
}
