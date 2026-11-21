// Les cartes du Mage : le deck de départ, le tronc commun et les trois écoles (Arcane, Feu, Givre).
// Référence : docs/classes/MAGE.md (§4 et §5)
import {
  addPower,
  addStatusToHand,
  applyBrulure,
  applyGel,
  drawCards,
  freeze,
  fx,
  gainBlock,
  gainCharges,
  isBossEnemy,
  livingEnemies,
  log,
  playerAttack,
  shatterDamage,
  spendCharges,
} from './actions';
import { random } from './rng';
import type { CardDef, PlayContext } from './cards';
import type { EnemyState } from './types';

/** Un Sort sur la cible. Renvoie les dégâts infligés. */
function zap(ctx: PlayContext, base: number, target: EnemyState | null = ctx.target): number {
  if (!target || target.dead) return 0;
  const dmg = playerAttack(ctx.c, target, base);
  if (dmg > 0) ctx.dealt = true;
  return dmg;
}

/** Un Sort qui touche tous les ennemis. */
function nova(ctx: PlayContext, base: number, after?: (e: EnemyState) => void): void {
  for (const e of livingEnemies(ctx.c)) {
    if (e.submerged) continue;
    if (base > 0) zap(ctx, base, e);
    if (after && !e.dead) after(e);
  }
}

/** Fracasser : double dégâts si la cible a 3 Gel ou plus, ou si elle est Gelée. Consomme Toucher glacial. */
function shatter(ctx: PlayContext, base: number): number {
  if (!ctx.target) return 0;
  const dmg = zap(ctx, shatterDamage(ctx.c, ctx.target, base));
  ctx.c.shatterReady = false;
  return dmg;
}

function powerCard(ctx: PlayContext, id: string, value: number, label: string): void {
  addPower(ctx.c, id, value);
  fx(ctx.c, { kind: 'buff', who: 'player', label });
}

type MageCard = Omit<CardDef, 'classId'>;

const MAGE_LIST: MageCard[] = [
  // --- Deck de départ ---
  {
    id: 'trait_de_magie', name: 'Trait de magie', type: 'Sort', school: 'arcane', rarity: 'depart', cost: 1, needsTarget: true, icon: 'pouvoir',
    text: (up) => `Inflige ${up ? 10 : 7} dégâts.`,
    play: (ctx) => zap(ctx, ctx.up ? 10 : 7),
  },
  {
    id: 'barriere', name: 'Barrière', type: 'Compétence', rarity: 'depart', cost: 1, needsTarget: false, icon: 'bouclier',
    text: (up) => `Gagne ${up ? 9 : 6} blocage.`,
    play: (ctx) => gainBlock(ctx.c, ctx.up ? 9 : 6),
  },

  // --- Tronc commun ---
  {
    id: 'explosion_des_arcanes', name: 'Explosion des arcanes', type: 'Sort', school: 'arcane', rarity: 'commune', cost: 1, needsTarget: false, icon: 'pouvoir',
    text: (up) => `Inflige ${up ? 8 : 5} dégâts à tous les ennemis.`,
    play: (ctx) => nova(ctx, ctx.up ? 8 : 5),
  },
  {
    id: 'nova_de_givre', name: 'Nova de givre', type: 'Sort', school: 'givre', rarity: 'commune', cost: 1, needsTarget: false, icon: 'bouclier',
    text: (up) => `Gel ${up ? 3 : 2} à tous les ennemis. Gagne ${up ? 5 : 3} blocage.`,
    play: (ctx) => {
      nova(ctx, 0, (e) => applyGel(ctx.c, e, ctx.up ? 3 : 2));
      gainBlock(ctx.c, ctx.up ? 5 : 3);
    },
  },
  {
    id: 'lenteur', name: 'Lenteur', type: 'Compétence', rarity: 'commune', cost: 1, costUp: 0, needsTarget: true, icon: 'pouvoir',
    text: () => `Ralenti 2 tours et Démoralisé 1 tour à la cible.`,
    play: (ctx) => {
      if (!ctx.target) return;
      ctx.target.buffs.ralenti = Math.max(ctx.target.buffs.ralenti, 2);
      ctx.target.buffs.demoralise = Math.max(ctx.target.buffs.demoralise, 1);
    },
  },
  {
    id: 'siphon_de_mana', name: 'Siphon de mana', type: 'Sort', school: 'arcane', rarity: 'commune', cost: 1, needsTarget: true, icon: 'pouvoir',
    text: (up) => `Inflige ${up ? 9 : 6} dégâts. Cible en Incantation : +1 énergie.`,
    play: (ctx) => {
      const casting = !!ctx.target && !!ctx.target.intent.cast && !ctx.target.interrupted;
      zap(ctx, ctx.up ? 9 : 6);
      if (casting) ctx.c.player.energy += 1;
    },
  },
  {
    id: 'delivrance', name: 'Délivrance', type: 'Compétence', rarity: 'commune', cost: 0, needsTarget: false, icon: 'pouvoir',
    text: (up) => `Dissipe une Malédiction. Pioche ${up ? 2 : 1} carte${up ? 's' : ''}.`,
    play: (ctx) => {
      dispelCurse(ctx);
      drawCards(ctx.c, ctx.up ? 2 : 1);
    },
  },
  {
    id: 'bouclier_de_mana', name: 'Bouclier de mana', type: 'Compétence', rarity: 'peu_commune', cost: 1, needsTarget: false, icon: 'bouclier',
    text: (up) => `Gagne ${up ? 10 : 7} blocage. S'il en reste à ton tour : pioche 1 carte.`,
    play: (ctx) => {
      gainBlock(ctx.c, ctx.up ? 10 : 7);
      ctx.c.player.manaShield = true;
    },
  },
  {
    id: 'metamorphose', name: 'Métamorphose', type: 'Compétence', rarity: 'peu_commune', cost: 1, needsTarget: true, icon: 'pouvoir',
    text: (up) => `La cible (sauf boss) devient un mouton ${up ? 3 : 2} tours.`,
    play: (ctx) => {
      const t = ctx.target;
      if (!t) return;
      if (isBossEnemy(t)) {
        log(ctx.c, `${t.name} résiste à la Métamorphose.`);
        return;
      }
      t.mouton = ctx.up ? 3 : 2;
      fx(ctx.c, { kind: 'buff', who: t.uid, label: 'Mouton !' });
    },
  },
  {
    id: 'inspiration', name: 'Inspiration', type: 'Compétence', rarity: 'peu_commune', cost: 0, needsTarget: false, exhaust: true, exhaustUp: false, icon: 'pouvoir',
    text: (up) => `Ta prochaine carte ce tour-ci coûte 0.${up ? '' : ' Épuisé.'}`,
    play: (ctx) => {
      ctx.c.freeNext = true;
    },
  },
  {
    id: 'image_miroir', name: 'Image miroir', type: 'Compétence', rarity: 'peu_commune', cost: 1, needsTarget: false, icon: 'bouclier',
    text: (up) => `Gagne 4 blocage. Ajoute ${up ? 3 : 2} Reflets à ta main.`,
    play: (ctx) => {
      gainBlock(ctx.c, 4);
      addStatusToHand(ctx.c, 'reflet', ctx.up ? 3 : 2);
    },
  },
  {
    id: 'erudition', name: 'Érudition', type: 'Pouvoir', rarity: 'rare', cost: 2, costUp: 1, needsTarget: false, icon: 'pouvoir',
    text: () => `Pioche 1 carte de plus au début de chaque tour.`,
    play: (ctx) => powerCard(ctx, 'erudition', 1, 'Érudition'),
  },

  // --- Arcane ---
  {
    id: 'projectiles_arcaniques', name: 'Projectiles arcaniques', type: 'Sort', school: 'arcane', rarity: 'commune', cost: 1, needsTarget: true, icon: 'pouvoir',
    text: (up) => `Inflige ${up ? 4 : 3} dégâts 3 fois. Gagne 1 charge.`,
    play: (ctx) => {
      for (let i = 0; i < 3; i++) zap(ctx, ctx.up ? 4 : 3);
      gainCharges(ctx.c, 1);
    },
  },
  {
    id: 'deflagration_arcanique', name: 'Déflagration arcanique', type: 'Sort', school: 'arcane', rarity: 'commune', cost: 1, needsTarget: true, icon: 'pouvoir',
    text: (up) => `Inflige ${up ? 9 : 6} dégâts. Gagne 1 charge.`,
    play: (ctx) => {
      zap(ctx, ctx.up ? 9 : 6);
      gainCharges(ctx.c, 1);
    },
  },
  {
    id: 'focalisation', name: 'Focalisation', type: 'Compétence', rarity: 'commune', cost: 1, costUp: 0, needsTarget: false, icon: 'pouvoir',
    text: () => `Pioche 3 cartes. Gagne 1 charge.`,
    play: (ctx) => {
      drawCards(ctx.c, 3);
      gainCharges(ctx.c, 1);
    },
  },
  {
    id: 'flux_arcanique', name: 'Flux arcanique', type: 'Compétence', rarity: 'commune', cost: 0, needsTarget: false, ethereal: true, etherealUp: false, icon: 'pouvoir',
    text: (up) => `Gagne 1 énergie et 1 charge.${up ? '' : ' Éphémère.'}`,
    play: (ctx) => {
      ctx.c.player.energy += 1;
      gainCharges(ctx.c, 1);
    },
  },
  {
    id: 'bouclier_arcanique', name: 'Bouclier arcanique', type: 'Compétence', rarity: 'commune', cost: 1, needsTarget: false, icon: 'bouclier',
    text: (up) => `Gagne ${up ? 7 : 5} blocage, +${up ? 4 : 3} par charge.`,
    play: (ctx) => gainBlock(ctx.c, (ctx.up ? 7 : 5) + (ctx.up ? 4 : 3) * (ctx.c.player.charges ?? 0)),
  },
  {
    id: 'rayon_arcanique', name: 'Rayon arcanique', type: 'Sort', school: 'arcane', rarity: 'peu_commune', cost: 2, needsTarget: true, icon: 'pouvoir',
    text: (up) => `Inflige ${up ? 19 : 14} dégâts. Gagne 2 charges.`,
    play: (ctx) => {
      zap(ctx, ctx.up ? 19 : 14);
      gainCharges(ctx.c, 2);
    },
  },
  {
    id: 'barrage_arcanique', name: 'Barrage arcanique', type: 'Sort', rarity: 'peu_commune', cost: 1, needsTarget: true, icon: 'pouvoir',
    text: (up, g) => `Consomme tes charges : ${up ? 7 : 5} dégâts et pioche 1 par charge${g?.barrageDraw ? ` (+${g.barrageDraw})` : ''}.`,
    play: (ctx) => {
      const n = spendCharges(ctx.c);
      if (n > 0) zap(ctx, (ctx.up ? 7 : 5) * n);
      drawCards(ctx.c, n + (n > 0 ? ctx.c.gear?.barrageDraw ?? 0 : 0));
    },
  },
  {
    id: 'presence_esprit', name: 'Présence d\'esprit', type: 'Compétence', rarity: 'peu_commune', cost: 0, needsTarget: false, exhaust: true, exhaustUp: false, icon: 'pouvoir',
    text: (up) => `Ton prochain Sort du tour coûte 0. +1 charge.${up ? '' : ' Épuisé.'}`,
    play: (ctx) => {
      ctx.c.freeNextSpell = true;
      gainCharges(ctx.c, 1);
    },
  },
  {
    id: 'resonance', name: 'Résonance', type: 'Pouvoir', rarity: 'peu_commune', cost: 1, costUp: 0, needsTarget: false, icon: 'pouvoir',
    text: () => `Tes charges arcaniques maximales passent à 6.`,
    play: (ctx) => {
      ctx.c.player.maxCharges = 6;
      powerCard(ctx, 'resonance', 1, 'Résonance : 6 charges');
    },
  },
  {
    id: 'reflexion_sorts', name: 'Réflexion des sorts', type: 'Compétence', rarity: 'peu_commune', cost: 1, needsTarget: false, icon: 'bouclier',
    text: (up) => `Gagne ${up ? 9 : 6} blocage. Une Incantation reçue renvoie la moitié de ses dégâts.`,
    play: (ctx) => {
      gainBlock(ctx.c, ctx.up ? 9 : 6);
      ctx.c.player.spellReflect = true;
    },
  },
  {
    id: 'distorsion_temporelle', name: 'Distorsion temporelle', type: 'Compétence', rarity: 'rare', cost: 2, costUp: 1, needsTarget: false, exhaust: true, icon: 'pouvoir',
    text: () => `Prochain tour : +1 énergie et pioche 2 cartes de plus. Épuisé.`,
    play: (ctx) => {
      ctx.c.player.distortion = true;
    },
  },
  {
    id: 'concentration_arcanique', name: 'Concentration arcanique', type: 'Pouvoir', rarity: 'rare', cost: 1, needsTarget: false, innateUp: true, icon: 'pouvoir',
    text: (up) => `Ton 3e Sort de chaque tour te rend 1 énergie.${up ? ' Inné.' : ''}`,
    play: (ctx) => powerCard(ctx, 'concentration_arcanique', 1, 'Concentration arcanique'),
  },
  {
    id: 'esprit_vif', name: 'Esprit vif', type: 'Pouvoir', rarity: 'rare', cost: 1, costUp: 0, needsTarget: false, icon: 'pouvoir',
    text: () => `Au début de ton tour, gagne 1 charge.`,
    play: (ctx) => powerCard(ctx, 'esprit_vif', 1, 'Esprit vif'),
  },
  {
    id: 'tempete_arcanique', name: 'Tempête arcanique', type: 'Sort', rarity: 'epique', cost: 2, needsTarget: false, icon: 'pouvoir',
    text: (up) => `${up ? 8 : 6} dégâts à tous les ennemis par charge (sans les dépenser).`,
    play: (ctx) => {
      const n = ctx.c.player.charges ?? 0;
      if (n > 0) nova(ctx, (ctx.up ? 8 : 6) * n);
    },
  },

  // --- Feu ---
  {
    id: 'roussir', name: 'Roussir', type: 'Sort', school: 'feu', rarity: 'commune', cost: 0, needsTarget: true, icon: 'feu',
    text: (up) => `Inflige ${up ? 4 : 3} dégâts. Brûlure ${up ? 3 : 2}.`,
    play: (ctx) => {
      zap(ctx, ctx.up ? 4 : 3);
      if (ctx.target) applyBrulure(ctx.c, ctx.target, ctx.up ? 3 : 2);
    },
  },
  {
    id: 'etincelle', name: 'Étincelle', type: 'Sort', school: 'feu', rarity: 'commune', cost: 0, needsTarget: true, ethereal: true, icon: 'feu',
    text: (up) => `Brûlure ${up ? 5 : 3}. Éphémère.`,
    play: (ctx) => {
      if (ctx.target) applyBrulure(ctx.c, ctx.target, ctx.up ? 5 : 3);
    },
  },
  {
    id: 'boule_de_feu', name: 'Boule de feu', type: 'Sort', school: 'feu', rarity: 'commune', cost: 2, needsTarget: true, icon: 'feu',
    text: (up, g) => `Inflige ${(up ? 18 : 14) + (g?.fireballBonus ?? 0)} dégâts. Brûlure ${up ? 5 : 4}.`,
    play: (ctx) => {
      zap(ctx, ctx.up ? 18 : 14);
      if (ctx.target) applyBrulure(ctx.c, ctx.target, ctx.up ? 5 : 4);
    },
  },
  {
    id: 'cone_de_flammes', name: 'Cône de flammes', type: 'Sort', school: 'feu', rarity: 'commune', cost: 1, needsTarget: false, icon: 'feu',
    text: (up) => `Inflige ${up ? 7 : 5} dégâts et Brûlure ${up ? 2 : 1} à tous les ennemis.`,
    play: (ctx) => nova(ctx, ctx.up ? 7 : 5, (e) => applyBrulure(ctx.c, e, ctx.up ? 2 : 1)),
  },
  {
    id: 'bouclier_de_flammes', name: 'Bouclier de flammes', type: 'Compétence', rarity: 'commune', cost: 1, needsTarget: false, icon: 'bouclier',
    text: (up) => `Gagne ${up ? 9 : 6} blocage. Brûlure ${up ? 3 : 2} à un ennemi au hasard.`,
    play: (ctx) => {
      gainBlock(ctx.c, ctx.up ? 9 : 6);
      const pool = livingEnemies(ctx.c).filter((e) => !e.submerged);
      if (pool.length > 0) applyBrulure(ctx.c, pool[Math.floor(random(ctx.c) * pool.length)], ctx.up ? 3 : 2);
    },
  },
  {
    id: 'eruption', name: 'Éruption', type: 'Sort', school: 'feu', rarity: 'peu_commune', cost: 1, needsTarget: true, icon: 'feu',
    text: (up) => `Inflige ${up ? 3 : 2} fois la Brûlure de la cible en dégâts.`,
    play: (ctx) => {
      const burn = ctx.target?.buffs.brulure ?? 0;
      if (burn > 0) zap(ctx, burn * (ctx.up ? 3 : 2));
    },
  },
  {
    id: 'incendie', name: 'Incendie', type: 'Compétence', rarity: 'peu_commune', cost: 1, costUp: 0, needsTarget: true, icon: 'feu',
    text: () => `Les autres ennemis reçoivent la même Brûlure que la cible.`,
    play: (ctx) => {
      const burn = ctx.target?.buffs.brulure ?? 0;
      if (burn <= 0) return;
      for (const e of livingEnemies(ctx.c)) if (e !== ctx.target && !e.submerged) e.buffs.brulure = (e.buffs.brulure ?? 0) + burn;
    },
  },
  {
    id: 'embrasement', name: 'Embrasement', type: 'Pouvoir', rarity: 'peu_commune', cost: 1, needsTarget: false, icon: 'pouvoir',
    text: (up) => `Un Sort qui inflige 10 dégâts ou plus : Brûlure ${up ? 4 : 3}.`,
    play: (ctx) => powerCard(ctx, 'embrasement', ctx.up ? 4 : 3, 'Embrasement'),
  },
  {
    id: 'armure_de_lave', name: 'Armure de lave', type: 'Pouvoir', rarity: 'peu_commune', cost: 1, needsTarget: false, icon: 'pouvoir',
    text: (up) => `Quand un ennemi t'attaque : Brûlure ${up ? 3 : 2}.`,
    play: (ctx) => powerCard(ctx, 'armure_de_lave', ctx.up ? 3 : 2, 'Armure de lave'),
  },
  {
    id: 'explosion_de_flammes', name: 'Explosion de flammes', type: 'Sort', school: 'feu', rarity: 'rare', cost: 2, needsTarget: false, icon: 'feu',
    text: (up) => `Inflige ${up ? 11 : 8} dégâts et Brûlure ${up ? 4 : 3} à tous les ennemis.`,
    play: (ctx) => nova(ctx, ctx.up ? 11 : 8, (e) => applyBrulure(ctx.c, e, ctx.up ? 4 : 3)),
  },
  {
    id: 'meteore', name: 'Météore', type: 'Sort', school: 'feu', rarity: 'rare', cost: 3, needsTarget: true, icon: 'feu',
    text: (up) => `Inflige ${up ? 26 : 20} dégâts à la cible, ${up ? 10 : 8} aux autres. Brûlure 4.`,
    play: (ctx) => {
      const others = livingEnemies(ctx.c).filter((e) => e !== ctx.target && !e.submerged);
      zap(ctx, ctx.up ? 26 : 20);
      if (ctx.target) applyBrulure(ctx.c, ctx.target, 4);
      for (const e of others) zap(ctx, ctx.up ? 10 : 8, e);
    },
  },
  {
    id: 'chaleur_intense', name: 'Chaleur intense', type: 'Pouvoir', rarity: 'rare', cost: 2, costUp: 1, needsTarget: false, icon: 'pouvoir',
    text: () => `À chaque tour ennemi, leur Brûlure monte de 1 avant de brûler.`,
    play: (ctx) => powerCard(ctx, 'chaleur_intense', 1, 'Chaleur intense'),
  },
  {
    id: 'pyromanie', name: 'Pyromanie', type: 'Pouvoir', rarity: 'rare', cost: 1, needsTarget: false, icon: 'pouvoir',
    text: (up) => `Tes Sorts de Feu à 2 énergie ou plus : +${up ? 8 : 5} dégâts.`,
    play: (ctx) => powerCard(ctx, 'pyromanie', ctx.up ? 8 : 5, 'Pyromanie'),
  },
  {
    id: 'pyrolance', name: 'Pyrolance', type: 'Sort', school: 'feu', rarity: 'epique', cost: 2, needsTarget: true, icon: 'feu',
    text: (up) => `Inflige ${up ? 30 : 24} dégâts. Brûlure ${up ? 8 : 6}.`,
    play: (ctx) => {
      zap(ctx, ctx.up ? 30 : 24);
      if (ctx.target) applyBrulure(ctx.c, ctx.target, ctx.up ? 8 : 6);
    },
  },

  // --- Givre ---
  {
    id: 'eclair_de_givre', name: 'Éclair de givre', type: 'Sort', school: 'givre', rarity: 'commune', cost: 1, needsTarget: true, icon: 'bouclier',
    text: (up) => `Inflige ${up ? 9 : 7} dégâts. Gel ${up ? 3 : 2}.`,
    play: (ctx) => {
      zap(ctx, ctx.up ? 9 : 7);
      if (ctx.target) applyGel(ctx.c, ctx.target, ctx.up ? 3 : 2);
    },
  },
  {
    id: 'lance_de_glace', name: 'Lance de glace', type: 'Sort', school: 'givre', rarity: 'commune', cost: 0, needsTarget: true, icon: 'bouclier',
    text: (up, g) => `Inflige ${(up ? 5 : 3) + (g?.shatterBonus ?? 0)} dégâts. Fracasser.`,
    play: (ctx) => shatter(ctx, ctx.up ? 5 : 3),
  },
  {
    id: 'gelure', name: 'Gelure', type: 'Sort', school: 'givre', rarity: 'commune', cost: 1, needsTarget: true, icon: 'bouclier',
    text: (up) => `Gel ${up ? 5 : 4}.`,
    play: (ctx) => {
      if (ctx.target) applyGel(ctx.c, ctx.target, ctx.up ? 5 : 4);
    },
  },
  {
    id: 'cone_de_froid', name: 'Cône de froid', type: 'Sort', school: 'givre', rarity: 'commune', cost: 2, needsTarget: false, icon: 'bouclier',
    text: (up) => `Inflige ${up ? 10 : 7} dégâts et Gel ${up ? 3 : 2} à tous les ennemis.`,
    play: (ctx) => nova(ctx, ctx.up ? 10 : 7, (e) => applyGel(ctx.c, e, ctx.up ? 3 : 2)),
  },
  {
    id: 'barriere_de_glace', name: 'Barrière de glace', type: 'Compétence', rarity: 'commune', cost: 1, needsTarget: false, icon: 'bouclier',
    text: (up) => `Gagne ${up ? 12 : 9} blocage. Gel 1 à tous les ennemis.`,
    play: (ctx) => {
      gainBlock(ctx.c, ctx.up ? 12 : 9);
      nova(ctx, 0, (e) => applyGel(ctx.c, e, 1));
    },
  },
  {
    id: 'armure_de_givre', name: 'Armure de givre', type: 'Pouvoir', rarity: 'peu_commune', cost: 1, needsTarget: false, icon: 'pouvoir',
    text: (up) => `Quand un ennemi t'attaque : Gel ${up ? 2 : 1}.`,
    play: (ctx) => powerCard(ctx, 'armure_de_givre', ctx.up ? 2 : 1, 'Armure de givre'),
  },
  {
    id: 'morsure_du_froid', name: 'Morsure du froid', type: 'Pouvoir', rarity: 'peu_commune', cost: 1, needsTarget: false, icon: 'pouvoir',
    text: (up) => `Quand un ennemi devient Gelé, il subit ${up ? 15 : 10} dégâts.`,
    play: (ctx) => powerCard(ctx, 'morsure_du_froid', ctx.up ? 15 : 10, 'Morsure du froid'),
  },
  {
    id: 'toucher_glacial', name: 'Toucher glacial', type: 'Compétence', rarity: 'peu_commune', cost: 0, needsTarget: false, icon: 'pouvoir',
    text: (up) => `Ton prochain Fracasser compte comme si la cible avait 3 Gel.${up ? ' Pioche 1.' : ''}`,
    play: (ctx) => {
      ctx.c.shatterReady = true;
      if (ctx.up) drawCards(ctx.c, 1);
    },
  },
  {
    id: 'souffle_polaire', name: 'Souffle polaire', type: 'Sort', school: 'givre', rarity: 'peu_commune', cost: 1, needsTarget: true, icon: 'bouclier',
    text: (up, g) => `Inflige ${(up ? 8 : 5) + (g?.shatterBonus ?? 0)} dégâts. Fracasser. Cible Gelée : +1 énergie.`,
    play: (ctx) => {
      const frozen = !!ctx.target?.gele;
      shatter(ctx, ctx.up ? 8 : 5);
      if (frozen) ctx.c.player.energy += 1;
    },
  },
  {
    id: 'tempete_de_neige', name: 'Tempête de neige', type: 'Sort', school: 'givre', rarity: 'rare', cost: 2, needsTarget: false, icon: 'bouclier',
    text: (up) => `3 fois : ${up ? 5 : 4} dégâts et Gel 1 à tous les ennemis.`,
    play: (ctx) => {
      for (let i = 0; i < 3; i++) nova(ctx, ctx.up ? 5 : 4, (e) => applyGel(ctx.c, e, 1));
    },
  },
  {
    id: 'prison_de_glace', name: 'Prison de glace', type: 'Compétence', rarity: 'rare', cost: 1, needsTarget: true, exhaust: true, icon: 'bouclier',
    text: (up) => `La cible devient Gelée${up ? ' (boss : prochaine attaque ÷ 2)' : ' (sauf boss)'}. Épuisé.`,
    play: (ctx) => {
      const t = ctx.target;
      if (!t) return;
      if (isBossEnemy(t) && !ctx.up) {
        log(ctx.c, `${t.name} brise la Prison de glace.`);
        return;
      }
      t.buffs.gel = 0;
      freeze(ctx.c, t);
    },
  },
  {
    id: 'fragmentation', name: 'Fragmentation', type: 'Pouvoir', rarity: 'rare', cost: 2, costUp: 1, needsTarget: false, icon: 'pouvoir',
    text: () => `Fracasser inflige triple dégâts au lieu de double.`,
    play: (ctx) => powerCard(ctx, 'fragmentation', 1, 'Fragmentation'),
  },
  {
    id: 'coeur_de_glace', name: 'Cœur de glace', type: 'Pouvoir', rarity: 'rare', cost: 1, needsTarget: false, innateUp: true, icon: 'pouvoir',
    text: (up) => `Au début de ton tour : Gel 1 à tous les ennemis.${up ? ' Inné.' : ''}`,
    play: (ctx) => powerCard(ctx, 'coeur_de_glace', 1, 'Cœur de glace'),
  },
  {
    id: 'fracas_glaciaire', name: 'Fracas glaciaire', type: 'Sort', school: 'givre', rarity: 'epique', cost: 2, needsTarget: true, icon: 'bouclier',
    text: (up, g) => `Gel 3 à la cible, puis ${(up ? 11 : 8) + (g?.shatterBonus ?? 0)} dégâts à tous. Fracasser.`,
    play: (ctx) => {
      const t = ctx.target;
      if (!t) return;
      const others = livingEnemies(ctx.c).filter((e) => e !== t && !e.submerged);
      const base = ctx.up ? 11 : 8;
      // Les autres d'abord : la cible garde son Gel jusqu'à son propre Fracasser.
      for (const e of others) zap(ctx, shatterDamage(ctx.c, e, base), e);
      applyGel(ctx.c, t, 3);
      shatter(ctx, base);
    },
  },

  // --- Jeton ---
  {
    id: 'reflet', name: 'Reflet', type: 'Sort', rarity: 'statut', cost: 0, needsTarget: true, ethereal: true, exhaust: true, icon: 'pouvoir',
    text: () => `Inflige 3 dégâts. Éphémère.`,
    play: (ctx) => zap(ctx, 3),
  },
];

/** Dissipe une malédiction : un Fardeau en main, sinon la malédiction active la plus longue. */
function dispelCurse(ctx: PlayContext): void {
  const c = ctx.c;
  const i = c.hand.findIndex((card) => card.id === 'fardeau');
  if (i >= 0) {
    c.exhaust.push(...c.hand.splice(i, 1));
    log(c, 'Délivrance dissipe un Fardeau.');
    return;
  }
  const d = c.player.debuffs;
  if (!d) return;
  // Délivrance dissipe les Malédictions (dont la Malédiction de lignée), pas les poisons.
  const keys = (['demoralise', 'impie', 'arcane', 'lignee'] as const).filter((k) => (d[k] ?? 0) > 0);
  if (keys.length > 0) {
    const k = keys.reduce((a, b) => ((d[a] ?? 0) >= (d[b] ?? 0) ? a : b));
    d[k] = 0;
    log(c, 'Délivrance dissipe une malédiction.');
  } else if (d.panic > 0 || d.manaBurn > 0) {
    d.panic = 0;
    d.manaBurn = 0;
    log(c, 'Délivrance dissipe une malédiction.');
  }
}

export const MAGE_CARDS: Record<string, CardDef> = Object.fromEntries(MAGE_LIST.map((d) => [d.id, { ...d, classId: 'mage' }]));
