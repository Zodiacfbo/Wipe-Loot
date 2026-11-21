// Les cartes du Prêtre : le deck de départ, le tronc commun, et les arbres Discipline, Sacré et Ombre.
// Référence : docs/classes/PRETRE.md (§4 et §5)
import { addPower, drawCards, fx, gainBlock, healPlayer, isBossEnemy, livingEnemies, playerAttack } from './actions';
import { applyDot, loseHp, triggerDots } from './demoniste';
import { dispelMagic, dispelPoison, gainAegis, gainFaith } from './pretre';
import type { CardDef, PlayContext } from './cards';
import type { EnemyState } from './types';

function zap(ctx: PlayContext, base: number, target: EnemyState | null = ctx.target): number {
  if (!target || target.dead) return 0;
  const dmg = playerAttack(ctx.c, target, base);
  if (dmg > 0) ctx.dealt = true;
  return dmg;
}

function nova(ctx: PlayContext, base: number): void {
  for (const e of livingEnemies(ctx.c)) if (!e.submerged) zap(ctx, base, e);
}

function heal(ctx: PlayContext, n: number): void {
  const healed = healPlayer(ctx.c, n);
  if (healed > 0) fx(ctx.c, { kind: 'heal', from: 'player', to: 'player', amount: healed });
}

function powerCard(ctx: PlayContext, id: string, value: number, label: string): void {
  addPower(ctx.c, id, value);
  fx(ctx.c, { kind: 'buff', who: 'player', label });
}

type PriestCard = Omit<CardDef, 'classId'>;

const LIST: PriestCard[] = [
  // --- Deck de départ ---
  {
    id: 'priere_garde', name: 'Prière de garde', type: 'Compétence', rarity: 'depart', cost: 1, needsTarget: false, icon: 'bouclier',
    text: (up) => `Gagne ${up ? 9 : 6} blocage.`,
    play: (ctx) => gainBlock(ctx.c, ctx.up ? 9 : 6),
  },

  // --- Tronc commun ---
  {
    id: 'chatiment', name: 'Châtiment', type: 'Sort', school: 'sacre', rarity: 'commune', cost: 1, needsTarget: true, icon: 'pouvoir',
    text: (up, g) => `Inflige ${(up ? 10 : 7) + (g?.smiteBonus ?? 0)} dégâts.`,
    play: (ctx) => zap(ctx, ctx.up ? 10 : 7),
  },
  {
    id: 'soins_rapides', name: 'Soins rapides', type: 'Compétence', rarity: 'commune', cost: 1, needsTarget: false, icon: 'sang',
    text: (up) => `Soigne ${up ? 9 : 6} PV.`,
    play: (ctx) => heal(ctx, ctx.up ? 9 : 6),
  },
  {
    id: 'grace', name: 'Grâce', type: 'Compétence', rarity: 'commune', cost: 1, needsTarget: false, icon: 'sang',
    text: (up) => `Soigne ${up ? 4 : 3} PV au début de tes 3 prochains tours.`,
    play: (ctx) => {
      ctx.c.renew = { amount: ctx.up ? 4 : 3, turns: 3 };
      ctx.c.healedFlag = true;
    },
  },
  {
    id: 'dissipation_magie', name: 'Dissipation de la magie', type: 'Compétence', rarity: 'commune', cost: 0, needsTarget: false, icon: 'pouvoir',
    text: (up) => `Dissipe la Magie (malédictions). Pioche ${up ? 2 : 1} carte${up ? 's' : ''}.`,
    play: (ctx) => {
      dispelMagic(ctx.c);
      drawCards(ctx.c, ctx.up ? 2 : 1);
    },
  },
  {
    id: 'purification', name: 'Purification', type: 'Compétence', rarity: 'commune', cost: 0, needsTarget: false, icon: 'pouvoir',
    text: (up) => `Dissipe les Maladies et les Poisons (Toxine, Peste).${up ? ' Soigne 3 PV.' : ''}`,
    play: (ctx) => {
      dispelPoison(ctx.c);
      if (ctx.up) heal(ctx, 3);
    },
  },
  {
    id: 'nova_sacree', name: 'Nova sacrée', type: 'Sort', school: 'sacre', rarity: 'peu_commune', cost: 1, needsTarget: false, icon: 'pouvoir',
    text: (up) => `Inflige ${up ? 6 : 4} dégâts à tous les ennemis. Soigne ${up ? 4 : 3} PV.`,
    play: (ctx) => {
      nova(ctx, ctx.up ? 6 : 4);
      heal(ctx, ctx.up ? 4 : 3);
    },
  },
  {
    id: 'effacement', name: 'Effacement', type: 'Compétence', rarity: 'peu_commune', cost: 0, needsTarget: false, icon: 'pouvoir',
    text: (up) => `Tous les ennemis sont Démoralisés ${up ? 2 : 1} tour${up ? 's' : ''}. Pioche 1 carte.`,
    play: (ctx) => {
      for (const e of livingEnemies(ctx.c)) e.buffs.demoralise = Math.max(e.buffs.demoralise, ctx.up ? 2 : 1);
      drawCards(ctx.c, 1);
    },
  },
  {
    id: 'feu_interieur', name: 'Feu intérieur', type: 'Pouvoir', rarity: 'peu_commune', cost: 1, needsTarget: false, icon: 'pouvoir',
    text: (up) => `Gagne ${up ? 2 : 1} Puissance et ${up ? 2 : 1} Robustesse.`,
    play: (ctx) => {
      ctx.c.player.puissance += ctx.up ? 2 : 1;
      ctx.c.player.robustesse += ctx.up ? 2 : 1;
      powerCard(ctx, 'feu_interieur', 1, 'Feu intérieur');
    },
  },
  {
    id: 'inspiration_divine', name: 'Inspiration divine', type: 'Pouvoir', rarity: 'rare', cost: 2, costUp: 1, needsTarget: false, icon: 'pouvoir',
    text: () => `Pioche 1 carte de plus au début de chaque tour.`,
    play: (ctx) => powerCard(ctx, 'erudition', 1, 'Inspiration divine'),
  },
  {
    id: 'benediction_vigueur', name: 'Bénédiction de vigueur', type: 'Compétence', rarity: 'rare', cost: 1, needsTarget: false, exhaust: true, icon: 'sang',
    text: (up) => `Gagne ${up ? 6 : 4} PV max pour toute la run. Épuisé.`,
    play: (ctx) => {
      const n = ctx.up ? 6 : 4;
      ctx.c.player.maxHp += n;
      ctx.c.player.hp += n;
      ctx.c.maxHpGain = (ctx.c.maxHpGain ?? 0) + n;
      fx(ctx.c, { kind: 'buff', who: 'player', label: `+${n} PV max` });
    },
  },

  // --- Discipline ---
  {
    id: 'egide_renforcee', name: 'Égide renforcée', type: 'Compétence', rarity: 'commune', cost: 1, needsTarget: false, icon: 'bouclier',
    text: (up, g) => `Gagne ${(up ? 10 : 7) + (g?.aegisBonus ?? 0)} Égide.`,
    play: (ctx) => gainAegis(ctx.c, ctx.up ? 10 : 7),
  },
  {
    id: 'penitence', name: 'Pénitence', type: 'Sort', school: 'sacre', rarity: 'commune', cost: 1, needsTarget: true, icon: 'pouvoir',
    text: (up) => `Inflige ${up ? 5 : 4} dégâts 2 fois. Gagne ${up ? 3 : 2} Égide.`,
    play: (ctx) => {
      zap(ctx, ctx.up ? 5 : 4);
      zap(ctx, ctx.up ? 5 : 4);
      gainAegis(ctx.c, ctx.up ? 3 : 2);
    },
  },
  {
    id: 'bastion_sacre', name: 'Bastion sacré', type: 'Compétence', rarity: 'commune', cost: 2, needsTarget: false, icon: 'bouclier',
    text: (up, g) => `Gagne ${(up ? 17 : 13) + (g?.aegisBonus ?? 0)} Égide.`,
    play: (ctx) => gainAegis(ctx.c, ctx.up ? 17 : 13),
  },
  {
    id: 'sacrifice_soi', name: 'Sacrifice de soi', type: 'Compétence', rarity: 'commune', cost: 0, needsTarget: false, icon: 'sang',
    text: (up) => `Perds 4 PV. Gagne ${up ? 11 : 8} Égide.`,
    play: (ctx) => {
      loseHp(ctx.c, 4, 'Sacrifice');
      gainAegis(ctx.c, ctx.up ? 11 : 8);
    },
  },
  {
    id: 'priere_protection', name: 'Prière de protection', type: 'Compétence', rarity: 'commune', cost: 1, needsTarget: false, icon: 'bouclier',
    text: (up) => `Gagne ${up ? 7 : 5} blocage et ${up ? 5 : 3} Égide.`,
    play: (ctx) => {
      gainBlock(ctx.c, ctx.up ? 7 : 5);
      gainAegis(ctx.c, ctx.up ? 5 : 3);
    },
  },
  {
    id: 'discernement', name: 'Discernement', type: 'Compétence', rarity: 'commune', cost: 1, costUp: 0, needsTarget: false, icon: 'pouvoir',
    text: () => `Pioche 2 cartes. Gagne 1 Foi.`,
    play: (ctx) => {
      drawCards(ctx.c, 2);
      gainFaith(ctx.c, 1);
    },
  },
  {
    id: 'eclat_foi', name: 'Éclat de foi', type: 'Sort', school: 'sacre', rarity: 'peu_commune', cost: 1, needsTarget: true, icon: 'pouvoir',
    text: (up) => `Inflige des dégâts égaux à ${up ? 'ton Égide' : 'la moitié de ton Égide'} (sans la consommer).`,
    play: (ctx) => {
      const a = ctx.c.aegis ?? 0;
      const dmg = ctx.up ? a : Math.floor(a / 2);
      if (dmg > 0) zap(ctx, dmg);
    },
  },
  {
    id: 'rayon_lumiere', name: 'Rayon de lumière', type: 'Sort', school: 'sacre', rarity: 'peu_commune', cost: 2, needsTarget: true, icon: 'pouvoir',
    text: (up) => `Inflige ${up ? 16 : 12} dégâts. Gagne ${up ? 6 : 4} Égide.`,
    play: (ctx) => {
      zap(ctx, ctx.up ? 16 : 12);
      gainAegis(ctx.c, ctx.up ? 6 : 4);
    },
  },
  {
    id: 'meditation_sacree', name: 'Méditation', type: 'Pouvoir', rarity: 'peu_commune', cost: 1, costUp: 0, needsTarget: false, icon: 'pouvoir',
    text: () => `Au début de ton tour, si tu as de l'Égide : +1 Foi.`,
    play: (ctx) => powerCard(ctx, 'meditation_sacree', 1, 'Méditation'),
  },
  {
    id: 'lumiere_persistante', name: 'Lumière persistante', type: 'Pouvoir', rarity: 'peu_commune', cost: 1, needsTarget: false, icon: 'pouvoir',
    text: (up) => `Au début de ton tour, gagne ${up ? 5 : 3} Égide.`,
    play: (ctx) => powerCard(ctx, 'lumiere_persistante', ctx.up ? 5 : 3, 'Lumière persistante'),
  },
  {
    id: 'clarte', name: 'Clarté', type: 'Compétence', rarity: 'peu_commune', cost: 0, needsTarget: false, icon: 'pouvoir',
    text: (up) => `Si tu as 10 Égide ou plus : +${up ? 2 : 1} énergie.`,
    play: (ctx) => {
      if ((ctx.c.aegis ?? 0) >= 10) ctx.c.player.energy += ctx.up ? 2 : 1;
    },
  },
  {
    id: 'expiation', name: 'Expiation', type: 'Pouvoir', rarity: 'rare', cost: 1, needsTarget: false, icon: 'pouvoir',
    text: (up) => `Chaque fois qu'un de tes Sorts inflige des dégâts : soigne ${up ? 3 : 2} PV.`,
    play: (ctx) => powerCard(ctx, 'expiation', ctx.up ? 3 : 2, 'Expiation'),
  },
  {
    id: 'ame_inebranlable', name: 'Âme inébranlable', type: 'Pouvoir', rarity: 'rare', cost: 2, costUp: 1, needsTarget: false, icon: 'pouvoir',
    text: () => `Ton Égide maximale passe à 50. Au début de ton tour, gagne 2 Égide.`,
    play: (ctx) => {
      ctx.c.maxAegis = Math.max(ctx.c.maxAegis ?? 30, 50);
      powerCard(ctx, 'ame_inebranlable', 1, 'Âme inébranlable');
    },
  },
  {
    id: 'egide_anciens', name: 'Égide des anciens', type: 'Compétence', rarity: 'epique', cost: 1, faithCost: 'all', needsTarget: false, icon: 'bouclier',
    text: (up) => `Dépense toute ta Foi : ${up ? 5 : 4} Égide par point. Ce tour-ci et le suivant, tes PV ne descendent pas sous 1.`,
    play: (ctx) => {
      gainAegis(ctx.c, (ctx.up ? 5 : 4) * (ctx.faithSpent ?? 0));
      ctx.c.undying = 2;
    },
  },

  // --- Sacré ---
  {
    id: 'chatiment_ardent', name: 'Châtiment ardent', type: 'Sort', school: 'sacre', rarity: 'commune', cost: 1, needsTarget: true, icon: 'feu',
    text: (up, g) => `Inflige ${(up ? 11 : 8) + (g?.smiteBonus ?? 0)} dégâts. Gagne 1 Foi.`,
    play: (ctx) => {
      zap(ctx, ctx.up ? 11 : 8);
      gainFaith(ctx.c, 1);
    },
  },
  {
    id: 'feu_sacre', name: 'Feu sacré', type: 'Sort', school: 'sacre', rarity: 'commune', cost: 2, needsTarget: true, icon: 'feu',
    text: (up) => `Inflige ${up ? 14 : 10} dégâts. DoT ${up ? 4 : 3} pendant 3 tours. Gagne 1 Foi.`,
    play: (ctx) => {
      zap(ctx, ctx.up ? 14 : 10);
      if (ctx.target && !ctx.target.dead) applyDot(ctx.c, ctx.target, 'feu_sacre', ctx.up ? 4 : 3, 3);
      gainFaith(ctx.c, 1);
    },
  },
  {
    id: 'soins_superieurs', name: 'Soins supérieurs', type: 'Compétence', rarity: 'commune', cost: 2, needsTarget: false, icon: 'sang',
    text: (up) => `Soigne ${up ? 16 : 12} PV. Gagne 1 Foi de plus.`,
    play: (ctx) => {
      heal(ctx, ctx.up ? 16 : 12);
      gainFaith(ctx.c, 1);
    },
  },
  {
    id: 'cercle_soins', name: 'Cercle de soins', type: 'Compétence', rarity: 'commune', cost: 1, needsTarget: false, icon: 'sang',
    text: (up) => `Soigne ${up ? 6 : 4} PV et gagne ${up ? 6 : 4} blocage.`,
    play: (ctx) => {
      heal(ctx, ctx.up ? 6 : 4);
      gainBlock(ctx.c, ctx.up ? 6 : 4);
    },
  },
  {
    id: 'grace_divine', name: 'Grâce divine', type: 'Compétence', rarity: 'commune', cost: 0, needsTarget: false, icon: 'pouvoir',
    text: (up) => `Gagne ${up ? 3 : 2} Foi. Pioche 1 carte.`,
    play: (ctx) => {
      gainFaith(ctx.c, ctx.up ? 3 : 2);
      drawCards(ctx.c, 1);
    },
  },
  {
    id: 'colere_divine', name: 'Colère divine', type: 'Sort', school: 'sacre', rarity: 'peu_commune', cost: 1, faithCost: 3, needsTarget: true, icon: 'feu',
    text: (up) => `Inflige ${up ? 20 : 15} dégâts.`,
    play: (ctx) => zap(ctx, ctx.up ? 20 : 15),
  },
  {
    id: 'lumiere_eclatante', name: 'Lumière éclatante', type: 'Sort', school: 'sacre', rarity: 'peu_commune', cost: 2, needsTarget: false, icon: 'pouvoir',
    text: (up) => `Inflige ${up ? 11 : 8} dégâts à tous les ennemis. Gagne 2 Foi.`,
    play: (ctx) => {
      nova(ctx, ctx.up ? 11 : 8);
      gainFaith(ctx.c, 2);
    },
  },
  {
    id: 'sol_sacre', name: 'Sol sacré', type: 'Pouvoir', rarity: 'peu_commune', cost: 1, needsTarget: false, icon: 'pouvoir',
    text: (up) => `Au début de ton tour : ${up ? 4 : 3} dégâts à tous les ennemis, et soigne ${up ? 3 : 2} PV.`,
    play: (ctx) => powerCard(ctx, 'sol_sacre', ctx.up ? 4 : 3, 'Sol sacré'),
  },
  {
    id: 'chant_lumiere', name: 'Chant de lumière', type: 'Pouvoir', rarity: 'peu_commune', cost: 1, needsTarget: false, icon: 'pouvoir',
    text: (up) => `Chaque fois que tu gagnes de la Foi : ${up ? 3 : 2} dégâts à un ennemi au hasard.`,
    play: (ctx) => powerCard(ctx, 'chant_lumiere', ctx.up ? 3 : 2, 'Chant de lumière'),
  },
  {
    id: 'cantique', name: 'Cantique', type: 'Compétence', rarity: 'rare', cost: 2, needsTarget: false, exhaust: true, exhaustUp: false, icon: 'sang',
    text: (up) => `Soigne 10 PV. Gagne 3 Foi.${up ? '' : ' Épuisé.'}`,
    play: (ctx) => {
      heal(ctx, 10);
      gainFaith(ctx.c, 3);
    },
  },
  {
    id: 'courroux_celeste', name: 'Courroux céleste', type: 'Sort', school: 'sacre', rarity: 'rare', cost: 1, faithCost: 'all', needsTarget: true, icon: 'feu',
    text: (up, g) => `Dépense toute ta Foi : ${(up ? 5 : 4) + (g?.wrathBonus ?? 0)} dégâts par point.`,
    play: (ctx) => {
      const n = ctx.faithSpent ?? 0;
      if (n > 0) zap(ctx, n * ((ctx.up ? 5 : 4) + (ctx.c.gear?.wrathBonus ?? 0)));
    },
  },
  {
    id: 'ange_gardien', name: 'Ange gardien', type: 'Pouvoir', rarity: 'rare', cost: 2, costUp: 1, needsTarget: false, icon: 'pouvoir',
    text: () => `La première fois de ce combat que tu tomberais à 0 PV : tu restes à 1 PV et tu es soigné de 15 PV.`,
    play: (ctx) => powerCard(ctx, 'ange_gardien', 1, 'Ange gardien'),
  },
  {
    id: 'esprit_guerison', name: 'Esprit de guérison', type: 'Pouvoir', rarity: 'rare', cost: 1, costUp: 0, needsTarget: false, icon: 'pouvoir',
    text: () => `Tout le soin en trop devient de l'Égide (au lieu de la moitié).`,
    play: (ctx) => powerCard(ctx, 'esprit_guerison', 1, 'Esprit de guérison'),
  },
  {
    id: 'ascension_lumineuse', name: 'Ascension lumineuse', type: 'Pouvoir', rarity: 'epique', cost: 3, costUp: 2, needsTarget: false, icon: 'pouvoir',
    text: () => `Chaque fois que tu te soignes, inflige autant de dégâts à un ennemi au hasard. +1 Foi au début de chaque tour.`,
    play: (ctx) => powerCard(ctx, 'ascension', 1, 'Ascension lumineuse'),
  },

  // --- Ombre ---
  {
    id: 'murmure_douleur', name: 'Murmure de douleur', type: 'Sort', school: 'ombre', rarity: 'commune', cost: 1, needsTarget: true, icon: 'sang',
    text: (up, g) => `DoT ${(up ? 5 : 4) + (g?.painBonus ?? 0)} pendant 4 tours.`,
    play: (ctx) => {
      if (ctx.target) applyDot(ctx.c, ctx.target, 'douleur', (ctx.up ? 5 : 4) + (ctx.c.gear?.painBonus ?? 0), 4);
    },
  },
  {
    id: 'attaque_mentale', name: 'Attaque mentale', type: 'Sort', school: 'ombre', rarity: 'commune', cost: 1, needsTarget: true, icon: 'pouvoir',
    text: (up, g) => `Inflige ${(up ? 12 : 9) + (g?.mindBlastBonus ?? 0)} dégâts.`,
    play: (ctx) => zap(ctx, ctx.up ? 12 : 9),
  },
  {
    id: 'fouet_psychique', name: 'Fouet psychique', type: 'Sort', school: 'ombre', rarity: 'commune', cost: 2, needsTarget: true, icon: 'pouvoir',
    text: (up, g) => `Inflige ${up ? 5 : 4} dégâts ${3 + (g?.flayExtra ?? 0)} fois. Ralenti 1 tour.`,
    play: (ctx) => {
      for (let i = 0; i < 3 + (ctx.c.gear?.flayExtra ?? 0); i++) zap(ctx, ctx.up ? 5 : 4);
      if (ctx.target && !ctx.target.dead) ctx.target.buffs.ralenti = Math.max(ctx.target.buffs.ralenti, 1);
    },
  },
  {
    id: 'eclat_ombre', name: 'Éclat d\'ombre', type: 'Sort', school: 'ombre', rarity: 'commune', cost: 1, needsTarget: false, icon: 'pouvoir',
    text: (up) => `Inflige ${up ? 8 : 5} dégâts à tous les ennemis.`,
    play: (ctx) => nova(ctx, ctx.up ? 8 : 5),
  },
  {
    id: 'voile_ombre', name: 'Voile d\'ombre', type: 'Compétence', rarity: 'commune', cost: 1, needsTarget: false, icon: 'bouclier',
    text: (up) => `Gagne ${up ? 11 : 8} blocage, +3 en Forme d'Ombre.`,
    play: (ctx) => gainBlock(ctx.c, (ctx.up ? 11 : 8) + (ctx.c.shadowForm ? 3 : 0)),
  },
  {
    id: 'murmures_neant', name: 'Murmures du néant', type: 'Compétence', rarity: 'commune', cost: 0, needsTarget: false, icon: 'sang',
    text: (up) => `Perds 2 PV. Pioche ${up ? 3 : 2} cartes.`,
    play: (ctx) => {
      loseHp(ctx.c, 2, 'Néant');
      drawCards(ctx.c, ctx.up ? 3 : 2);
    },
  },
  {
    id: 'toucher_vampirique', name: 'Toucher vampirique', type: 'Sort', school: 'ombre', rarity: 'peu_commune', cost: 1, needsTarget: true, icon: 'sang',
    text: (up) => `DoT ${up ? 4 : 3} pendant 3 tours. À chaque fois : soigne ${up ? 2 : 1} PV.`,
    play: (ctx) => {
      if (ctx.target) applyDot(ctx.c, ctx.target, 'vampirique', ctx.up ? 4 : 3, 3, 0, ctx.up ? 2 : 1);
    },
  },
  {
    id: 'murmure_mort', name: 'Murmure de mort', type: 'Sort', school: 'ombre', rarity: 'peu_commune', cost: 1, needsTarget: true, icon: 'sang',
    text: (up) => `Inflige ${up ? 19 : 14} dégâts. Perds 4 PV.`,
    play: (ctx) => {
      zap(ctx, ctx.up ? 19 : 14);
      loseHp(ctx.c, 4, 'Murmure de mort');
    },
  },
  {
    id: 'etreinte_vampirique', name: 'Étreinte vampirique', type: 'Pouvoir', rarity: 'peu_commune', cost: 1, needsTarget: false, icon: 'pouvoir',
    text: (up, g) => `Quand un de tes Sorts d'Ombre inflige des dégâts : soigne ${(up ? 3 : 2) + (g?.vampHunger ?? 0)} PV.`,
    play: (ctx) => powerCard(ctx, 'etreinte_vampirique', ctx.up ? 3 : 2, 'Étreinte vampirique'),
  },
  {
    id: 'esprit_tourmente', name: 'Esprit tourmenté', type: 'Pouvoir', rarity: 'peu_commune', cost: 1, needsTarget: false, icon: 'pouvoir',
    text: (up) => `Quand un de tes DoT tue un ennemi : pioche 2 cartes${up ? ' et gagne 1 énergie' : ''}.`,
    play: (ctx) => powerCard(ctx, 'esprit_tourmente', ctx.up ? 2 : 1, 'Esprit tourmenté'),
  },
  {
    id: 'peste_mentale', name: 'Peste mentale', type: 'Sort', school: 'ombre', rarity: 'rare', cost: 2, needsTarget: true, icon: 'sang',
    text: (up) => `DoT ${up ? 7 : 5} pendant 4 tours. À chaque fois : soigne 2 PV.`,
    play: (ctx) => {
      if (ctx.target) applyDot(ctx.c, ctx.target, 'peste_mentale', ctx.up ? 7 : 5, 4, 0, 2);
    },
  },
  {
    id: 'controle_mental', name: 'Contrôle mental', type: 'Compétence', rarity: 'rare', cost: 2, costUp: 1, needsTarget: true, exhaust: true, icon: 'pouvoir',
    text: () => `Un ennemi (sauf boss) attaque un autre ennemi à ta place à son prochain tour. Épuisé.`,
    play: (ctx) => {
      const t = ctx.target;
      if (t && !isBossEnemy(t)) {
        t.enslaved = 1;
        fx(ctx.c, { kind: 'buff', who: t.uid, label: 'Contrôle mental' });
      }
    },
  },
  {
    id: 'tenebres_interieures', name: 'Ténèbres intérieures', type: 'Pouvoir', rarity: 'rare', cost: 1, needsTarget: false, icon: 'pouvoir',
    text: (up) => `Tes DoT infligent +${up ? 2 : 1} dégât${up ? 's' : ''}.`,
    play: (ctx) => powerCard(ctx, 'tenebres', ctx.up ? 2 : 1, 'Ténèbres intérieures'),
  },
  {
    id: 'forme_ombre', name: 'Forme d\'Ombre', type: 'Pouvoir', rarity: 'epique', cost: 1, costUp: 0, needsTarget: false, icon: 'pouvoir',
    text: () => `Tes DoT se déclenchent tout de suite une fois. Forme d'Ombre jusqu'à la fin du combat : Sorts d'Ombre +30 %, DoT +1. Tes soins sont réduits de 25 %, et tu ne gagnes plus de Foi.`,
    play: (ctx) => {
      ctx.c.shadowForm = true;
      for (const e of livingEnemies(ctx.c)) triggerDots(ctx.c, e, false);
      ctx.dealt = true;
      fx(ctx.c, { kind: 'banner', text: 'Forme d\'Ombre !' });
    },
  },
];

export const PRETRE_CARDS: Record<string, CardDef> = Object.fromEntries(LIST.map((d) => [d.id, { ...d, classId: 'pretre' }]));
