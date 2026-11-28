// Les cartes du Paladin (refonte « Puissance sacrée », 27 novembre 2026) : le paquet de départ, le tronc commun,
// et les arbres Vindicte, Protection et Sacré. ✦n : la carte donne n Puissance sacrée. Dépense : 3 PS, 0 énergie.
// Référence : docs/classes/PALADIN.md (§4 et §5)
import { addPower, drawCards, fx, gainBlock, isBossEnemy, livingEnemies, log, playerAttack } from './actions';
import { isInterruptible } from './enemies';
import { dispelMagic } from './pretre';
import { stun } from './voleur';
import { auraOf, dispelAll, gainHoly, isUnholy, palHeal, paladinHealAmount } from './paladin';
import type { CardDef, PlayContext } from './cards';
import type { EnemyState } from './types';

/** Une Attaque (ou un Sort qui fait des dégâts) sur la cible. */
function hit(ctx: PlayContext, base: number, target: EnemyState | null = ctx.target): number {
  if (!target || target.dead || target.submerged) return 0;
  const dmg = playerAttack(ctx.c, target, base);
  if (dmg > 0) ctx.dealt = true;
  return dmg;
}

function hitAll(ctx: PlayContext, base: number | ((e: EnemyState) => number)): void {
  for (const e of livingEnemies(ctx.c)) {
    if (e.submerged) continue;
    hit(ctx, typeof base === 'number' ? base : base(e), e);
  }
}

function powerCard(ctx: PlayContext, id: string, value: number, label: string): void {
  addPower(ctx.c, id, value);
  fx(ctx.c, { kind: 'buff', who: 'player', label });
}

/** Interrompt l'incantation en cours de la cible. */
function interrupt(ctx: PlayContext, t: EnemyState | null): void {
  if (!t || t.dead || !isInterruptible(t.intent) || t.interrupted) return;
  t.interrupted = true;
  fx(ctx.c, { kind: 'interrupt', who: t.uid });
  log(ctx.c, `${t.name} est interrompu !`);
}

type PaladinCard = Omit<CardDef, 'classId'>;

/** Une Dépense : 3 Puissance sacrée, 0 énergie. */
const SPEND = { cost: 0, holyCost: 3 } as const;

const LIST: PaladinCard[] = [
  // --- Paquet de départ ---
  {
    id: 'frappe_pal', name: 'Frappe', type: 'Attaque', rarity: 'depart', cost: 1, needsTarget: true, icon: 'epee',
    text: (up) => `Inflige ${up ? 9 : 6} dégâts.`,
    play: (ctx) => hit(ctx, ctx.up ? 9 : 6),
  },
  {
    id: 'parade_pal', name: 'Parade', type: 'Compétence', rarity: 'depart', cost: 1, needsTarget: false, icon: 'bouclier',
    text: (up) => `Gagne ${up ? 9 : 6} blocage.`,
    play: (ctx) => gainBlock(ctx.c, ctx.up ? 9 : 6),
  },

  // --- Tronc commun ---
  {
    id: 'frappe_croise', name: 'Frappe du croisé', type: 'Attaque', rarity: 'commune', cost: 1, holyGain: 1, needsTarget: true, icon: 'epee',
    text: (up) => `Inflige ${up ? 7 : 4} dégâts. ✦1`,
    play: (ctx) => hit(ctx, ctx.up ? 7 : 4),
  },
  {
    id: 'parole_lumiere', name: 'Parole de lumière', type: 'Compétence', rarity: 'commune', ...SPEND, needsTarget: false, icon: 'pouvoir',
    text: (up) => `Dépense : selon ton Aura, ${up ? 12 : 9} blocage, ${up ? 10 : 7} dégâts ou ${up ? 9 : 6} PV.`,
    play: (ctx) => {
      const aura = auraOf(ctx.c);
      if (aura === 'devotion') gainBlock(ctx.c, ctx.up ? 12 : 9);
      else if (aura === 'vindicte') hit(ctx, ctx.up ? 10 : 7);
      else palHeal(ctx.c, ctx.up ? 9 : 6);
    },
  },
  {
    id: 'bouclier_foi', name: 'Bouclier de la foi', type: 'Compétence', rarity: 'commune', cost: 1, holyGain: 1, needsTarget: false, icon: 'bouclier',
    text: (up) => `Gagne ${up ? 7 : 4} blocage. ✦1`,
    play: (ctx) => gainBlock(ctx.c, ctx.up ? 7 : 4),
  },
  {
    id: 'lumiere_bienfaisante', name: 'Lumière bienfaisante', type: 'Compétence', healCard: true, rarity: 'commune', cost: 1, holyGain: 1, needsTarget: false, icon: 'sang',
    text: (up) => `Soigne ${up ? 6 : 4} PV. ✦1`,
    play: (ctx) => palHeal(ctx.c, ctx.up ? 6 : 4),
  },
  {
    id: 'exorcisme', name: 'Exorcisme', type: 'Sort', school: 'sacre', rarity: 'commune', cost: 1, needsTarget: true, icon: 'feu',
    text: (up) => `Inflige ${up ? 11 : 8} dégâts (${up ? 22 : 16} aux Morts-vivants et aux Démons).`,
    play: (ctx) => {
      const n = ctx.up ? 11 : 8;
      if (ctx.target) hit(ctx, isUnholy(ctx.target) ? n * 2 : n);
    },
  },
  {
    id: 'priere_croise', name: 'Prière du croisé', type: 'Compétence', rarity: 'peu_commune', cost: 0, holyGain: 1, ethereal: true, needsTarget: false, icon: 'pouvoir',
    text: (up) => `✦1.${up ? ' Pioche 1 carte.' : ''} Éphémère.`,
    play: (ctx) => {
      if (ctx.up) drawCards(ctx.c, 1);
    },
  },
  {
    id: 'colere_sacree', name: 'Colère sacrée', type: 'Sort', school: 'sacre', rarity: 'peu_commune', cost: 2, needsTarget: false, icon: 'feu',
    text: (up) => `${up ? 9 : 6} dégâts à tous, doublés contre Morts-vivants et Démons.`,
    play: (ctx) => {
      const n = ctx.up ? 9 : 6;
      hitAll(ctx, (e) => (isUnholy(e) ? n * 2 : n));
    },
  },
  {
    id: 'resistance_sacree', name: 'Résistance sacrée', type: 'Compétence', rarity: 'peu_commune', cost: 1, costUp: 0, needsTarget: false, icon: 'feu',
    text: () => '2 tours : Zones de feu et DoT ennemis te font 50 % de dégâts en moins.',
    play: (ctx) => {
      ctx.c.holyResist = 2;
      fx(ctx.c, { kind: 'buff', who: 'player', label: 'Résistance sacrée' });
    },
  },
  {
    id: 'benediction_puissance', name: 'Bénédiction de puissance', type: 'Pouvoir', rarity: 'rare', cost: 1, innateUp: true, needsTarget: false, icon: 'pouvoir',
    text: (up) => `Ta 1re Dépense de chaque tour : +3 au bonus de ton Aura.${up ? ' Inné.' : ''}`,
    play: (ctx) => powerCard(ctx, 'benediction_puissance', 1, 'Bénédiction de puissance'),
  },

  // --- Arbre Vindicte : la croisade ---
  {
    id: 'verdict_templier', name: 'Verdict du templier', type: 'Attaque', rarity: 'commune', ...SPEND, needsTarget: true, icon: 'epee',
    text: (up) => `Dépense : inflige ${up ? 18 : 13} dégâts.`,
    play: (ctx) => hit(ctx, ctx.up ? 18 : 13),
  },
  {
    id: 'tempete_divine', name: 'Tempête divine', type: 'Attaque', rarity: 'peu_commune', ...SPEND, aoeSpend: true, needsTarget: false, icon: 'epee',
    text: (up) => `Dépense : inflige ${up ? 9 : 7} dégâts à tous les ennemis.`,
    play: (ctx) => hitAll(ctx, ctx.up ? 9 : 7),
  },
  {
    id: 'sentence', name: 'Sentence', type: 'Attaque', rarity: 'rare', ...SPEND, needsTarget: true, icon: 'epee',
    text: (up) => `Dépense : ${up ? 12 : 9} dégâts, triplés si la cible a 20 % de PV ou moins.`,
    play: (ctx) => {
      const t = ctx.target;
      if (!t) return;
      const n = ctx.up ? 12 : 9;
      hit(ctx, t.hp <= t.maxHp * 0.2 ? n * 3 : n);
    },
  },
  {
    id: 'lame_justice', name: 'Lame de justice', type: 'Attaque', rarity: 'commune', cost: 2, holyGain: 2, needsTarget: true, icon: 'epee',
    text: (up) => `Inflige ${up ? 12 : 9} dégâts. ✦2`,
    play: (ctx) => hit(ctx, ctx.up ? 12 : 9),
  },
  {
    id: 'ferveur', name: 'Ferveur', type: 'Attaque', rarity: 'commune', cost: 1, holyGain: 1, needsTarget: true, icon: 'epee',
    text: (up) => `Inflige ${up ? 5 : 3} dégâts 2 fois. ✦1`,
    play: (ctx) => {
      hit(ctx, ctx.up ? 5 : 3);
      hit(ctx, ctx.up ? 5 : 3);
    },
  },
  {
    id: 'frappe_divine', name: 'Frappe divine', type: 'Attaque', rarity: 'commune', cost: 2, needsTarget: true, icon: 'epee',
    text: (up) => `Inflige ${up ? 21 : 16} dégâts.`,
    play: (ctx) => hit(ctx, ctx.up ? 21 : 16),
  },
  {
    id: 'tourbillon_sacre', name: 'Tourbillon sacré', type: 'Attaque', rarity: 'commune', cost: 2, holyGain: 1, needsTarget: false, icon: 'epee',
    text: (up) => `Inflige ${up ? 7 : 5} dégâts à tous les ennemis. ✦1`,
    play: (ctx) => hitAll(ctx, ctx.up ? 7 : 5),
  },
  {
    id: 'marteau_courroux', name: 'Marteau de courroux', type: 'Attaque', rarity: 'peu_commune', cost: 1, needsTarget: true, icon: 'epee',
    text: (up) => `Inflige ${up ? 11 : 8} dégâts. ✦2 si la cible a 20 % de PV ou moins.`,
    play: (ctx) => {
      const t = ctx.target;
      if (!t) return;
      hit(ctx, ctx.up ? 11 : 8);
      if (t.dead || t.hp <= t.maxHp * 0.2) gainHoly(ctx.c, 2 + ((ctx.c.courroux ?? 0) > 0 ? 1 : 0), 'Marteau de courroux');
    },
  },
  {
    id: 'zele', name: 'Zèle', type: 'Pouvoir', rarity: 'peu_commune', cost: 1, innateUp: true, needsTarget: false, icon: 'pouvoir',
    text: (up) => `Chaque Dépense : +1 Puissance (5 au plus).${up ? ' Inné.' : ''}`,
    play: (ctx) => powerCard(ctx, 'zele', 1, 'Zèle'),
  },
  {
    id: 'art_guerre', name: 'Art de la guerre', type: 'Pouvoir', rarity: 'peu_commune', cost: 1, costUp: 0, needsTarget: false, icon: 'pouvoir',
    text: () => 'Après ta 2e Attaque de chaque tour : ✦1.',
    play: (ctx) => powerCard(ctx, 'art_guerre', 1, 'Art de la guerre'),
  },
  {
    id: 'repentance', name: 'Repentance', type: 'Compétence', rarity: 'rare', cost: 1, needsTarget: true, exhaust: true, icon: 'pouvoir',
    text: (up) => `La cible (sauf boss) est Contrôlée ${up ? 3 : 2} tours. Épuisé.`,
    play: (ctx) => {
      const t = ctx.target;
      if (!t) return;
      if (isBossEnemy(t)) log(ctx.c, `${t.name} ne se repent pas.`);
      else stun(ctx.c, t, ctx.up ? 3 : 2);
    },
  },
  {
    id: 'croisade', name: 'Croisade', type: 'Pouvoir', rarity: 'rare', cost: 2, costUp: 1, needsTarget: false, icon: 'pouvoir',
    text: () => 'Tes Attaques +2 dégâts (+4 aux Morts-vivants et aux Démons).',
    play: (ctx) => powerCard(ctx, 'croisade', 2, 'Croisade'),
  },
  {
    id: 'vengeance_pal', name: 'Vengeance', type: 'Pouvoir', rarity: 'rare', cost: 1, costUp: 0, needsTarget: false, icon: 'pouvoir',
    text: () => 'Chaque fois que tu tues un ennemi : +1 Puissance et ✦1.',
    play: (ctx) => powerCard(ctx, 'vengeance_pal', 1, 'Vengeance'),
  },
  {
    id: 'courroux_vengeur', name: 'Courroux vengeur', type: 'Compétence', rarity: 'epique', cost: 2, costUp: 1, exhaust: true, needsTarget: false, icon: 'pouvoir',
    text: () => '3 tours : tes cartes ✦ donnent 1 de plus, Dépenses +4 dégâts. Épuisé.',
    play: (ctx) => {
      ctx.c.courroux = 3;
      fx(ctx.c, { kind: 'buff', who: 'player', label: 'Courroux vengeur' });
    },
  },

  // --- Arbre Protection : le rempart ---
  {
    id: 'bouclier_vertueux', name: 'Bouclier du vertueux', type: 'Compétence', rarity: 'commune', ...SPEND, aoeSpend: true, needsTarget: false, icon: 'bouclier',
    text: (up) => `Dépense : gagne ${up ? 18 : 14} blocage. ${up ? 6 : 4} dégâts à tous les ennemis.`,
    play: (ctx) => {
      gainBlock(ctx.c, ctx.up ? 18 : 14);
      hitAll(ctx, ctx.up ? 6 : 4);
    },
  },
  {
    id: 'rempart_lumiere', name: 'Rempart de lumière', type: 'Compétence', rarity: 'peu_commune', ...SPEND, needsTarget: false, icon: 'bouclier',
    text: (up) => `Dépense : gagne ${up ? 9 : 6} blocage et ${up ? 3 : 2} Robustesse (ce combat).`,
    play: (ctx) => {
      ctx.c.player.robustesse += ctx.up ? 3 : 2;
      gainBlock(ctx.c, ctx.up ? 9 : 6);
      fx(ctx.c, { kind: 'buff', who: 'player', label: `+${ctx.up ? 3 : 2} Robustesse` });
    },
  },
  {
    id: 'juste_chatiment', name: 'Juste châtiment', type: 'Attaque', rarity: 'rare', ...SPEND, needsTarget: true, icon: 'bouclier',
    text: (up) => `Dépense : inflige les dégâts bloqués depuis ton dernier tour${up ? ', +5' : ''}.`,
    play: (ctx) => hit(ctx, (ctx.c.blockedSince ?? 0) + (ctx.up ? 5 : 0)),
  },
  {
    id: 'pavois_sacre', name: 'Pavois sacré', type: 'Compétence', rarity: 'commune', cost: 1, holyGain: 1, needsTarget: false, icon: 'bouclier',
    text: (up) => `Gagne ${up ? 8 : 5} blocage. ✦1`,
    play: (ctx) => gainBlock(ctx.c, ctx.up ? 8 : 5),
  },
  {
    id: 'bouclier_beni', name: 'Bouclier béni', type: 'Compétence', rarity: 'commune', cost: 2, needsTarget: false, icon: 'bouclier',
    text: (up) => `Gagne ${up ? 20 : 15} blocage.`,
    play: (ctx) => gainBlock(ctx.c, ctx.up ? 20 : 15),
  },
  {
    id: 'marteau_piete', name: 'Marteau de piété', type: 'Attaque', rarity: 'commune', cost: 1, holyGain: 1, needsTarget: false, icon: 'epee',
    text: (up) => `Inflige ${up ? 6 : 4} dégâts à tous les ennemis. Gagne ${up ? 4 : 3} blocage. ✦1`,
    play: (ctx) => {
      hitAll(ctx, ctx.up ? 6 : 4);
      gainBlock(ctx.c, ctx.up ? 4 : 3);
    },
  },
  {
    id: 'resolution_sacree', name: 'Résolution sacrée', type: 'Compétence', rarity: 'commune', cost: 1, needsTarget: false, icon: 'bouclier',
    text: (up) => `Gagne ${up ? 9 : 6} blocage. Dissipation (Magie).`,
    play: (ctx) => {
      gainBlock(ctx.c, ctx.up ? 9 : 6);
      dispelMagic(ctx.c);
    },
  },
  {
    id: 'garde_vigilante', name: 'Garde vigilante', type: 'Compétence', rarity: 'commune', cost: 0, ethereal: true, needsTarget: false, icon: 'bouclier',
    text: (up) => `Gagne ${up ? 6 : 4} blocage. Éphémère.`,
    play: (ctx) => gainBlock(ctx.c, ctx.up ? 6 : 4),
  },
  {
    id: 'consecration', name: 'Consécration', type: 'Sort', school: 'sacre', rarity: 'peu_commune', cost: 2, needsTarget: false, icon: 'feu',
    text: (up) => `Fin de ce tour et du suivant : ${up ? 7 : 5} dégâts à tous les ennemis.`,
    play: (ctx) => {
      ctx.c.consecration = { dmg: ctx.up ? 7 : 5, turns: 2 };
      fx(ctx.c, { kind: 'buff', who: 'player', label: 'Consécration' });
    },
  },
  {
    id: 'bouclier_lance', name: 'Bouclier lancé', type: 'Attaque', rarity: 'peu_commune', cost: 1, holyGain: 1, needsTarget: true, icon: 'bouclier',
    text: (up) => `Interruption. ${up ? 9 : 6} dégâts à la cible, puis à 2 autres ennemis. ✦1`,
    play: (ctx) => {
      const n = ctx.up ? 9 : 6;
      interrupt(ctx, ctx.target);
      hit(ctx, n);
      for (const e of livingEnemies(ctx.c).filter((x) => x !== ctx.target && !x.submerged).slice(0, 2)) hit(ctx, n, e);
    },
  },
  {
    id: 'sanctuaire', name: 'Sanctuaire', type: 'Pouvoir', rarity: 'peu_commune', cost: 1, needsTarget: false, icon: 'bouclier',
    text: (up) => `Chaque attaque ennemie t'inflige ${up ? 2 : 1} dégât${up ? 's' : ''} de moins.`,
    play: (ctx) => powerCard(ctx, 'sanctuaire', ctx.up ? 2 : 1, 'Sanctuaire'),
  },
  {
    id: 'ferveur_gardien', name: 'Ferveur du gardien', type: 'Pouvoir', rarity: 'peu_commune', cost: 1, innateUp: true, needsTarget: false, icon: 'pouvoir',
    text: (up) => `1re attaque entièrement bloquée de chaque tour : ✦1.${up ? ' Inné.' : ''}`,
    play: (ctx) => powerCard(ctx, 'ferveur_gardien', 1, 'Ferveur du gardien'),
  },
  {
    id: 'dernier_serment', name: 'Dernier serment', type: 'Pouvoir', rarity: 'rare', cost: 1, costUp: 0, needsTarget: false, icon: 'sang',
    text: () => 'La 1re fois de ce combat sous 20 % de tes PV : soigne 15 PV.',
    play: (ctx) => powerCard(ctx, 'dernier_serment', 1, 'Dernier serment'),
  },
  {
    id: 'gardien_rois', name: 'Gardien des rois', type: 'Pouvoir', rarity: 'epique', cost: 2, costUp: 1, needsTarget: false, icon: 'bouclier',
    text: () => 'Tes Dépenses donnent +6 blocage. Attaque bloquée : 3 dégâts en retour.',
    play: (ctx) => powerCard(ctx, 'gardien_rois', 1, 'Gardien des rois'),
  },

  // --- Arbre Sacré : la lumière ---
  {
    id: 'mot_gloire', name: 'Mot de gloire', type: 'Compétence', healCard: true, rarity: 'commune', ...SPEND, needsTarget: false, icon: 'sang',
    text: (up) => `Dépense : soigne ${up ? 14 : 11} PV.`,
    play: (ctx) => palHeal(ctx.c, ctx.up ? 14 : 11),
  },
  {
    id: 'aurore_sacree', name: 'Aurore sacrée', type: 'Compétence', healCard: true, rarity: 'peu_commune', ...SPEND, aoeSpend: true, needsTarget: false, icon: 'sang',
    text: (up) => `Dépense : soigne ${up ? 8 : 6} PV, ${up ? 7 : 5} dégâts à tous (×2 Morts-vivants, Démons).`,
    play: (ctx) => {
      palHeal(ctx.c, ctx.up ? 8 : 6);
      const n = ctx.up ? 7 : 5;
      hitAll(ctx, (e) => (isUnholy(e) ? n * 2 : n));
    },
  },
  {
    id: 'egide_lumiere', name: 'Égide de lumière', type: 'Compétence', healCard: true, rarity: 'rare', ...SPEND, needsTarget: false, icon: 'bouclier',
    text: (up) => `Dépense : soigne ${up ? 9 : 7} PV et gagne autant de blocage.`,
    play: (ctx) => {
      const n = ctx.up ? 9 : 7;
      // Le blocage suit le soin prévu, même à PV pleins.
      const amount = paladinHealAmount(ctx.c, n);
      palHeal(ctx.c, n);
      gainBlock(ctx.c, amount, false);
    },
  },
  {
    id: 'horion_sacre', name: 'Horion sacré', type: 'Sort', school: 'sacre', healCard: true, rarity: 'commune', cost: 1, holyGain: 1, needsTarget: true, icon: 'pouvoir',
    text: (up) => `Sous la moitié de tes PV : soigne ${up ? 8 : 5} PV. Sinon : ${up ? 8 : 5} dégâts. ✦1`,
    play: (ctx) => {
      const n = ctx.up ? 8 : 5;
      const p = ctx.c.player;
      if (p.hp < p.maxHp / 2) palHeal(ctx.c, n);
      else hit(ctx, n);
    },
  },
  {
    id: 'lumiere_sacree', name: 'Lumière sacrée', type: 'Compétence', healCard: true, rarity: 'commune', cost: 2, holyGain: 1, needsTarget: false, icon: 'sang',
    text: (up) => `Soigne ${up ? 16 : 12} PV. ✦1`,
    play: (ctx) => palHeal(ctx.c, ctx.up ? 16 : 12),
  },
  {
    id: 'eclair_foi', name: 'Éclair de foi', type: 'Sort', school: 'sacre', healCard: true, rarity: 'commune', cost: 1, holyGain: 1, needsTarget: true, icon: 'pouvoir',
    text: (up) => `Inflige ${up ? 7 : 5} dégâts. Soigne ${up ? 3 : 2} PV. ✦1`,
    play: (ctx) => {
      hit(ctx, ctx.up ? 7 : 5);
      palHeal(ctx.c, ctx.up ? 3 : 2);
    },
  },
  {
    id: 'main_sacree', name: 'Main sacrée', type: 'Compétence', healCard: true, rarity: 'commune', cost: 1, needsTarget: false, icon: 'bouclier',
    text: (up) => `Gagne ${up ? 8 : 6} blocage. Soigne ${up ? 6 : 4} PV.`,
    play: (ctx) => {
      gainBlock(ctx.c, ctx.up ? 8 : 6);
      palHeal(ctx.c, ctx.up ? 6 : 4);
    },
  },
  {
    id: 'lueur_protectrice', name: 'Lueur protectrice', type: 'Compétence', rarity: 'commune', cost: 0, needsTarget: false, icon: 'bouclier',
    text: (up) => `Gagne ${up ? 5 : 3} blocage. Pioche 1 carte.`,
    play: (ctx) => {
      gainBlock(ctx.c, ctx.up ? 5 : 3);
      drawCards(ctx.c, 1);
    },
  },
  {
    id: 'lumiere_purificatrice', name: 'Lumière purificatrice', type: 'Compétence', healCard: true, rarity: 'peu_commune', cost: 1, costUp: 0, needsTarget: false, icon: 'sang',
    text: () => 'Dissipation de tous les types. Soigne 3 PV.',
    play: (ctx) => {
      dispelAll(ctx.c);
      palHeal(ctx.c, 3);
    },
  },
  {
    id: 'faveur_divine', name: 'Faveur divine', type: 'Compétence', rarity: 'peu_commune', cost: 0, exhaust: true, needsTarget: false, icon: 'pouvoir',
    text: (up) => `Ta prochaine Dépense de ce tour a son effet doublé.${up ? ' ✦1.' : ''} Épuisé.`,
    play: (ctx) => {
      ctx.c.favor = true;
      fx(ctx.c, { kind: 'buff', who: 'player', label: 'Faveur divine' });
      if (ctx.up) gainHoly(ctx.c, 1 + ((ctx.c.courroux ?? 0) > 0 ? 1 : 0));
    },
  },
  {
    id: 'rayonnement', name: 'Rayonnement', type: 'Pouvoir', rarity: 'peu_commune', cost: 1, needsTarget: false, icon: 'pouvoir',
    text: (up) => `Chaque fois que tu te soignes : ${up ? 3 : 2} dégâts à tous.`,
    play: (ctx) => powerCard(ctx, 'rayonnement', ctx.up ? 3 : 2, 'Rayonnement'),
  },
  {
    id: 'grace_croise', name: 'Grâce du croisé', type: 'Pouvoir', rarity: 'peu_commune', cost: 1, needsTarget: false, icon: 'sang',
    text: (up) => `Au début de ton tour, soigne ${up ? 3 : 2} PV.`,
    play: (ctx) => powerCard(ctx, 'grace_croise', ctx.up ? 3 : 2, 'Grâce du croisé'),
  },
  {
    id: 'illumination', name: 'Illumination', type: 'Pouvoir', rarity: 'rare', cost: 1, innateUp: true, needsTarget: false, icon: 'pouvoir',
    text: (up) => `Ta 1re Dépense de chaque tour : +1 énergie.${up ? ' Inné.' : ''}`,
    play: (ctx) => powerCard(ctx, 'illumination', 1, 'Illumination'),
  },
  {
    id: 'avatar_lumiere', name: 'Avatar de lumière', type: 'Pouvoir', rarity: 'epique', cost: 3, costUp: 2, needsTarget: false, icon: 'pouvoir',
    text: () => 'Soins +25 %. Chaque soin : la moitié en dégâts à un ennemi au hasard.',
    play: (ctx) => powerCard(ctx, 'avatar_lumiere', 1, 'Avatar de lumière'),
  },
];

export const PALADIN_CARDS: Record<string, CardDef> = Object.fromEntries(LIST.map((d) => [d.id, { ...d, classId: 'paladin' }]));

/**
 * Les cartes de l'ancien Paladin (Sceaux, avant le 27 novembre 2026) et celles qui les remplacent :
 * une expédition en cours est convertie au chargement (`migrate()` dans save.ts).
 */
export const OLD_PALADIN_CARDS: Record<string, string> = {
  sceau_droiture: 'parole_lumiere', sceau_croise: 'parole_lumiere', sceau_rempart: 'bouclier_vertueux', sceau_vengeance: 'verdict_templier',
  sceau_lumiere: 'mot_gloire', sceau_sagesse: 'mot_gloire', aura_devotion: 'rempart_lumiere', aura_epines: 'rempart_lumiere',
  aura_resistance: 'resistance_sacree', inquisition: 'priere_croise', exaltation: 'priere_croise', science_combat: 'art_guerre',
  benediction_royale: 'benediction_puissance', aube_purificatrice: 'aurore_sacree', bouclier_croise: 'gardien_rois', verdict_cieux: 'courroux_vengeur',
  onde_sacree: 'horion_sacre', marteau_chatiment: 'marteau_courroux', fervent: 'ferveur_gardien',
};
