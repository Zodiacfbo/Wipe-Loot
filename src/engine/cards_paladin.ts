// Les cartes du Paladin : le paquet de départ, le tronc commun, et les arbres Sacré, Protection et Vindicte.
// Référence : docs/classes/PALADIN.md (§4 et §5)
import { addPower, drawCards, fx, gainBlock, isBossEnemy, livingEnemies, log, playerAttack } from './actions';
import { isInterruptible } from './enemies';
import { dispelMagic } from './pretre';
import { stun } from './voleur';
import { activateSeal, dispelAll, isUnholy, judge, palHeal, SEAL_TEXT, setAura } from './paladin';
import type { CardDef, PlayContext } from './cards';
import type { EnemyState, SealId } from './types';

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

/** Une carte Sceau : coûte 1 (0 une fois améliorée). */
function sealCard(id: string, seal: SealId, name: string, rarity: PaladinCard['rarity']): PaladinCard {
  return {
    id, name, type: 'Compétence', seal: true, rarity, cost: 1, costUp: 0, needsTarget: false, icon: 'pouvoir',
    text: () => `Sceau : ${SEAL_TEXT[seal].bonus}. Jugement : ${SEAL_TEXT[seal].judge}.`,
    play: (ctx) => activateSeal(ctx.c, seal),
  };
}

/** Interrompt l'incantation en cours de la cible. */
function interrupt(ctx: PlayContext, t: EnemyState | null): void {
  if (!t || t.dead || !isInterruptible(t.intent) || t.interrupted) return;
  t.interrupted = true;
  fx(ctx.c, { kind: 'interrupt', who: t.uid });
  log(ctx.c, `${t.name} est interrompu !`);
}

type PaladinCard = Omit<CardDef, 'classId'>;

const LIST: PaladinCard[] = [
  // --- Deck de départ ---
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
  sealCard('sceau_droiture', 'droiture', 'Sceau de droiture', 'commune'),
  sealCard('sceau_croise', 'croise', 'Sceau du croisé', 'commune'),
  {
    id: 'frappe_croise', name: 'Frappe du croisé', type: 'Attaque', rarity: 'commune', cost: 1, needsTarget: true, icon: 'epee',
    text: (up) => `Inflige ${up ? 11 : 8} dégâts.`,
    play: (ctx) => hit(ctx, ctx.up ? 11 : 8),
  },
  {
    id: 'exorcisme', name: 'Exorcisme', type: 'Sort', school: 'sacre', rarity: 'commune', cost: 1, needsTarget: true, icon: 'feu',
    text: (up) => `Inflige ${up ? 12 : 9} dégâts (${up ? 24 : 18} aux Morts-vivants et aux Démons).`,
    play: (ctx) => {
      const n = ctx.up ? 12 : 9;
      if (ctx.target) hit(ctx, isUnholy(ctx.target) ? n * 2 : n);
    },
  },
  {
    id: 'lumiere_bienfaisante', name: 'Lumière bienfaisante', type: 'Compétence', healCard: true, rarity: 'commune', cost: 1, needsTarget: false, icon: 'sang',
    text: (up) => `Soigne ${up ? 8 : 5} PV.`,
    play: (ctx) => palHeal(ctx.c, ctx.up ? 8 : 5),
  },
  {
    id: 'aura_devotion', name: 'Aura de dévotion', type: 'Pouvoir', rarity: 'commune', cost: 1, needsTarget: false, icon: 'bouclier',
    text: (up, g) => `Aura : gagne ${(up ? 3 : 2) + (g?.devotionBonus ?? 0)} Robustesse. Une seule Aura à la fois.`,
    play: (ctx) => setAura(ctx.c, 'devotion', (ctx.up ? 3 : 2) + (ctx.c.gear?.devotionBonus ?? 0)),
  },
  sealCard('sceau_lumiere', 'lumiere', 'Sceau de lumière', 'peu_commune'),
  {
    id: 'aura_resistance', name: 'Aura de résistance', type: 'Pouvoir', rarity: 'peu_commune', cost: 1, costUp: 0, needsTarget: false, icon: 'feu',
    text: () => 'Aura : Zones de feu et poisons ennemis : −50 % de dégâts.',
    play: (ctx) => setAura(ctx.c, 'resistance', 50),
  },
  {
    id: 'colere_sacree', name: 'Colère sacrée', type: 'Sort', school: 'sacre', rarity: 'peu_commune', cost: 2, needsTarget: false, icon: 'feu',
    text: (up) => `${up ? 9 : 6} dégâts à tous, doublés contre Morts-vivants et Démons.`,
    play: (ctx) => {
      const n = ctx.up ? 9 : 6;
      hitAll(ctx, (e) => (isUnholy(e) ? n * 2 : n));
    },
  },

  // --- Arbre Sacré : soins et lumière ---
  {
    id: 'lumiere_sacree', name: 'Lumière sacrée', type: 'Compétence', healCard: true, rarity: 'commune', cost: 2, needsTarget: false, icon: 'sang',
    text: (up) => `Soigne ${up ? 19 : 14} PV.`,
    play: (ctx) => palHeal(ctx.c, ctx.up ? 19 : 14),
  },
  {
    id: 'onde_sacree', name: 'Onde sacrée', type: 'Sort', school: 'sacre', healCard: true, rarity: 'commune', cost: 1, needsTarget: true, icon: 'pouvoir',
    text: (up) => `Inflige ${up ? 11 : 8} dégâts, ou soigne ${up ? 11 : 8} PV si tu es sous 50 % de PV.`,
    play: (ctx) => {
      const n = ctx.up ? 11 : 8;
      const p = ctx.c.player;
      if (p.hp < p.maxHp / 2) palHeal(ctx.c, n);
      else hit(ctx, n);
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
    text: (up) => `Gagne ${up ? 6 : 4} blocage. Pioche 1 carte.`,
    play: (ctx) => {
      gainBlock(ctx.c, ctx.up ? 6 : 4);
      drawCards(ctx.c, 1);
    },
  },
  {
    id: 'eclair_foi', name: 'Éclair de foi', type: 'Sort', school: 'sacre', healCard: true, rarity: 'commune', cost: 1, needsTarget: true, icon: 'pouvoir',
    text: (up) => `Inflige ${up ? 10 : 7} dégâts. Soigne ${up ? 4 : 3} PV.`,
    play: (ctx) => {
      hit(ctx, ctx.up ? 10 : 7);
      palHeal(ctx.c, ctx.up ? 4 : 3);
    },
  },
  sealCard('sceau_sagesse', 'sagesse', 'Sceau de sagesse', 'peu_commune'),
  {
    id: 'faveur_divine', name: 'Faveur divine', type: 'Compétence', rarity: 'peu_commune', cost: 0, needsTarget: false, exhaust: true, exhaustUp: false, icon: 'pouvoir',
    text: (up) => `Ton prochain soin ou Sort de ce tour est doublé.${up ? '' : ' Épuisé.'}`,
    play: (ctx) => {
      ctx.c.favor = true;
      fx(ctx.c, { kind: 'buff', who: 'player', label: 'Faveur divine' });
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
    text: (up) => `Ton premier soin de chaque tour : +1 énergie.${up ? ' Inné.' : ''}`,
    play: (ctx) => powerCard(ctx, 'illumination', 1, 'Illumination'),
  },
  {
    id: 'benediction_royale', name: 'Bénédiction royale', type: 'Pouvoir', rarity: 'rare', cost: 1, needsTarget: false, icon: 'pouvoir',
    text: (up) => `+${up ? 2 : 1} Puissance, +${up ? 2 : 1} Robustesse et +${up ? 5 : 3} PV max (ce combat).`,
    play: (ctx) => {
      const p = ctx.c.player;
      p.puissance += ctx.up ? 2 : 1;
      p.robustesse += ctx.up ? 2 : 1;
      p.maxHp += ctx.up ? 5 : 3;
      p.hp += ctx.up ? 5 : 3;
      fx(ctx.c, { kind: 'buff', who: 'player', label: 'Bénédiction royale' });
    },
  },
  {
    id: 'aube_purificatrice', name: 'Aube purificatrice', type: 'Sort', school: 'sacre', healCard: true, rarity: 'rare', cost: 2, needsTarget: false, icon: 'sang',
    text: (up) => `Soigne ${up ? 14 : 10} PV. ${up ? 14 : 10} dégâts aux Morts-vivants et aux Démons.`,
    play: (ctx) => {
      palHeal(ctx.c, ctx.up ? 14 : 10);
      for (const e of livingEnemies(ctx.c)) if (isUnholy(e) && !e.submerged) hit(ctx, ctx.up ? 14 : 10, e);
    },
  },
  {
    id: 'avatar_lumiere', name: 'Avatar de lumière', type: 'Pouvoir', rarity: 'epique', cost: 3, costUp: 2, needsTarget: false, icon: 'pouvoir',
    text: () => 'Soins +25 %. Chaque soin : la moitié en dégâts à un ennemi au hasard.',
    play: (ctx) => powerCard(ctx, 'avatar_lumiere', 1, 'Avatar de lumière'),
  },

  // --- Arbre Protection : le bouclier ---
  {
    id: 'bouclier_beni', name: 'Bouclier béni', type: 'Compétence', rarity: 'commune', cost: 2, needsTarget: false, icon: 'bouclier',
    text: (up) => `Gagne ${up ? 20 : 15} blocage.`,
    play: (ctx) => gainBlock(ctx.c, ctx.up ? 20 : 15),
  },
  {
    id: 'pavois_sacre', name: 'Pavois sacré', type: 'Compétence', rarity: 'commune', cost: 1, needsTarget: false, icon: 'bouclier',
    text: (up) => `Gagne ${up ? 11 : 8} blocage. D'ici ton tour, attaque bloquée : ${up ? 4 : 3} dégâts en retour.`,
    play: (ctx) => {
      gainBlock(ctx.c, ctx.up ? 11 : 8);
      ctx.c.pavois = Math.max(ctx.c.pavois ?? 0, ctx.up ? 4 : 3);
    },
  },
  {
    id: 'marteau_piete', name: 'Marteau de piété', type: 'Attaque', rarity: 'commune', cost: 1, needsTarget: false, icon: 'epee',
    text: (up) => `Inflige ${up ? 8 : 6} dégâts à tous les ennemis. Gagne ${up ? 6 : 4} blocage.`,
    play: (ctx) => {
      hitAll(ctx, ctx.up ? 8 : 6);
      gainBlock(ctx.c, ctx.up ? 6 : 4);
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
    text: (up) => `Gagne ${up ? 7 : 5} blocage. Éphémère.`,
    play: (ctx) => gainBlock(ctx.c, ctx.up ? 7 : 5),
  },
  {
    id: 'consecration', name: 'Consécration', type: 'Sort', school: 'sacre', rarity: 'peu_commune', cost: 2, needsTarget: false, icon: 'feu',
    text: (up, g) => `Fin de ce tour${g?.consecrationLong ? ' et des 2 suivants' : ' et du suivant'} : ${up ? 7 : 5} dégâts à tous.`,
    play: (ctx) => {
      ctx.c.consecration = { dmg: ctx.up ? 7 : 5, turns: 2 + (ctx.c.gear?.consecrationLong ?? 0) };
      fx(ctx.c, { kind: 'buff', who: 'player', label: 'Consécration' });
    },
  },
  {
    id: 'bouclier_lance', name: 'Bouclier lancé', type: 'Attaque', rarity: 'peu_commune', cost: 1, needsTarget: true, icon: 'bouclier',
    text: (up) => `Interruption. ${up ? 10 : 7} dégâts à la cible, puis à 2 autres ennemis.`,
    play: (ctx) => {
      const n = ctx.up ? 10 : 7;
      interrupt(ctx, ctx.target);
      hit(ctx, n);
      for (const e of livingEnemies(ctx.c).filter((x) => x !== ctx.target && !x.submerged).slice(0, 2)) hit(ctx, n, e);
    },
  },
  sealCard('sceau_rempart', 'rempart', 'Sceau du rempart', 'peu_commune'),
  {
    id: 'sanctuaire', name: 'Sanctuaire', type: 'Pouvoir', rarity: 'peu_commune', cost: 1, needsTarget: false, icon: 'bouclier',
    text: (up) => `Chaque attaque ennemie t'inflige ${up ? 2 : 1} dégât${up ? 's' : ''} de moins.`,
    play: (ctx) => powerCard(ctx, 'sanctuaire', ctx.up ? 2 : 1, 'Sanctuaire'),
  },
  {
    id: 'fervent', name: 'Fervent', type: 'Pouvoir', rarity: 'peu_commune', cost: 1, innateUp: true, needsTarget: false, icon: 'pouvoir',
    text: (up) => `Attaque entièrement bloquée : +1 énergie au tour suivant (1 fois).${up ? ' Inné.' : ''}`,
    play: (ctx) => powerCard(ctx, 'fervent', 1, 'Fervent'),
  },
  {
    id: 'aura_epines', name: 'Aura d\'épines sacrées', type: 'Pouvoir', rarity: 'peu_commune', cost: 1, needsTarget: false, icon: 'pouvoir',
    text: (up) => `Aura : un ennemi qui t'attaque subit ${up ? 5 : 3} dégâts.`,
    play: (ctx) => setAura(ctx.c, 'epines', ctx.up ? 5 : 3),
  },
  {
    id: 'dernier_serment', name: 'Dernier serment', type: 'Pouvoir', rarity: 'rare', cost: 1, costUp: 0, needsTarget: false, icon: 'sang',
    text: () => 'La 1re fois de ce combat sous 20 % de tes PV : soigne 15 PV.',
    play: (ctx) => powerCard(ctx, 'dernier_serment', 1, 'Dernier serment'),
  },
  {
    id: 'juste_chatiment', name: 'Juste châtiment', type: 'Attaque', rarity: 'rare', cost: 1, costUp: 0, needsTarget: true, icon: 'bouclier',
    text: () => 'Inflige les dégâts que tu as bloqués depuis ton dernier tour.',
    play: (ctx) => hit(ctx, ctx.c.blockedSince ?? 0),
  },
  {
    id: 'bouclier_croise', name: 'Bouclier du croisé', type: 'Compétence', rarity: 'epique', cost: 2, needsTarget: false, icon: 'bouclier',
    text: (up) => `${up ? 16 : 12} blocage. Tout le combat : attaque bloquée, renvoi 4 et +2 PV.`,
    play: (ctx) => {
      gainBlock(ctx.c, ctx.up ? 16 : 12);
      // Jusqu'à la fin du combat (avant : jusqu'au prochain tour seulement).
      ctx.c.crusaderShield = { dmg: 4, heal: 2 };
    },
  },

  // --- Arbre Vindicte : la croisade ---
  {
    id: 'lame_justice', name: 'Lame de justice', type: 'Attaque', rarity: 'commune', cost: 1, needsTarget: true, icon: 'epee',
    text: (up) => `Inflige ${up ? 12 : 9} dégâts, +${up ? 4 : 3} si un Sceau est actif.`,
    play: (ctx) => hit(ctx, (ctx.up ? 12 : 9) + ((ctx.c.seals?.length ?? 0) > 0 ? (ctx.up ? 4 : 3) : 0)),
  },
  {
    id: 'ferveur', name: 'Ferveur', type: 'Attaque', rarity: 'commune', cost: 1, needsTarget: true, icon: 'epee',
    text: (up) => `Inflige ${up ? 7 : 5} dégâts 2 fois.`,
    play: (ctx) => {
      hit(ctx, ctx.up ? 7 : 5);
      hit(ctx, ctx.up ? 7 : 5);
    },
  },
  {
    id: 'frappe_divine', name: 'Frappe divine', type: 'Attaque', rarity: 'commune', cost: 2, needsTarget: true, icon: 'epee',
    text: (up) => `Inflige ${up ? 21 : 16} dégâts.`,
    play: (ctx) => hit(ctx, ctx.up ? 21 : 16),
  },
  {
    id: 'inquisition', name: 'Inquisition', type: 'Compétence', rarity: 'commune', cost: 0, needsTarget: false, icon: 'pouvoir',
    text: (up) => `Réactive le dernier Sceau jugé (Droiture sinon). Pioche ${up ? 2 : 1}.`,
    play: (ctx) => {
      activateSeal(ctx.c, ctx.c.lastJudged ?? 'droiture');
      drawCards(ctx.c, ctx.up ? 2 : 1);
    },
  },
  {
    id: 'tourbillon_sacre', name: 'Tourbillon sacré', type: 'Attaque', rarity: 'commune', cost: 2, needsTarget: false, icon: 'epee',
    text: (up) => `Inflige ${up ? 10 : 7} dégâts à tous les ennemis.`,
    play: (ctx) => hitAll(ctx, ctx.up ? 10 : 7),
  },
  sealCard('sceau_vengeance', 'vengeance', 'Sceau de vengeance', 'peu_commune'),
  {
    id: 'marteau_chatiment', name: 'Marteau du châtiment', type: 'Attaque', rarity: 'peu_commune', cost: 1, needsTarget: true, icon: 'epee',
    text: (up) => `Inflige ${up ? 13 : 10} dégâts, triplés si la cible est sous 20 % de PV.`,
    play: (ctx) => {
      const t = ctx.target;
      if (!t) return;
      const n = ctx.up ? 13 : 10;
      hit(ctx, t.hp <= t.maxHp * 0.2 ? n * 3 : n);
    },
  },
  {
    id: 'zele', name: 'Zèle', type: 'Pouvoir', rarity: 'peu_commune', cost: 1, innateUp: true, needsTarget: false, icon: 'pouvoir',
    text: (up) => `Chaque Sceau activé : +1 Puissance (5 au plus).${up ? ' Inné.' : ''}`,
    play: (ctx) => powerCard(ctx, 'zele', 1, 'Zèle'),
  },
  {
    id: 'science_combat', name: 'Science du combat', type: 'Pouvoir', rarity: 'peu_commune', cost: 1, costUp: 0, needsTarget: false, icon: 'pouvoir',
    text: () => 'Après ta 2e Attaque du tour, ton prochain soin coûte 0.',
    play: (ctx) => powerCard(ctx, 'science_combat', 1, 'Science du combat'),
  },
  {
    id: 'exaltation', name: 'Exaltation', type: 'Compétence', rarity: 'peu_commune', cost: 0, needsTarget: false, icon: 'pouvoir',
    text: (up) => `Gagne ${up ? 3 : 2} énergie. Perds ton Sceau actif, sans Jugement.`,
    play: (ctx) => {
      ctx.c.player.energy += ctx.up ? 3 : 2;
      if (ctx.c.seals) ctx.c.seals = [];
      fx(ctx.c, { kind: 'buff', who: 'player', label: `+${ctx.up ? 3 : 2} énergie` });
    },
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
    id: 'vengeance_pal', name: 'Vengeance', type: 'Pouvoir', rarity: 'rare', cost: 1, costUp: 0, needsTarget: false, icon: 'pouvoir',
    text: () => 'Chaque fois que tu tues un ennemi, gagne 1 Puissance.',
    play: (ctx) => powerCard(ctx, 'vengeance_pal', 1, 'Vengeance'),
  },
  {
    id: 'croisade', name: 'Croisade', type: 'Pouvoir', rarity: 'rare', cost: 2, costUp: 1, needsTarget: false, icon: 'pouvoir',
    text: () => 'Tes Attaques +2 dégâts (+4 aux Morts-vivants et aux Démons).',
    play: (ctx) => powerCard(ctx, 'croisade', 2, 'Croisade'),
  },
  {
    id: 'verdict_cieux', name: 'Verdict des cieux', type: 'Attaque', rarity: 'epique', cost: 3, costUp: 2, needsTarget: true, icon: 'epee',
    text: () => `Inflige 8 dégâts 2 fois. Jugement de ton Sceau, sans le perdre.`,
    play: (ctx) => {
      hit(ctx, 8);
      hit(ctx, 8);
      if (ctx.target && !ctx.target.dead) judgeKeep(ctx);
    },
  },
];

/** Verdict des cieux : le Jugement sans consommer le Sceau. Le Jugement n'est pas une Attaque : les bonus des Sceaux ne s'y ajoutent pas. */
function judgeKeep(ctx: PlayContext): void {
  const playing = ctx.c.playing;
  ctx.c.playing = undefined;
  judge(ctx.c, ctx.target, false);
  ctx.c.playing = playing;
}

export const PALADIN_CARDS: Record<string, CardDef> = Object.fromEntries(LIST.map((d) => [d.id, { ...d, classId: 'paladin' }]));
