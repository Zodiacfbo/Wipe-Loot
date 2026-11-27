// Les cartes du Chasseur : le paquet de départ, le tronc commun, et les arbres Maîtrise des bêtes, Précision et Survie.
// Référence : docs/classes/CHASSEUR.md (§4 et §5)
import { addPower, applySaignement, drawCards, fx, gainBlock, livingEnemies, log, playerAttack, power } from './actions';
import { isInterruptible } from './enemies';
import { applyDot } from './demoniste';
import { delayCast, stun } from './voleur';
import { companionAct, companionGuard, fatalThreshold, flecheDamage, markTarget, placeTrap, setAspect, trapDotBonus } from './chasseur';
import type { CardDef, PlayContext } from './cards';
import type { EnemyState } from './types';

/** Une Attaque sur la cible (ou sur un autre ennemi). */
function hit(ctx: PlayContext, base: number, target: EnemyState | null = ctx.target, ignoreBlock = false): number {
  if (!target || target.dead || target.submerged) return 0;
  const dmg = playerAttack(ctx.c, target, base, { ignoreBlock });
  if (dmg > 0) ctx.dealt = true;
  return dmg;
}

function hitAll(ctx: PlayContext, base: number): void {
  for (const e of livingEnemies(ctx.c)) {
    if (e.submerged) continue;
    hit(ctx, base, e);
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

/** Calme absolu : le premier Tir ajusté ou Tir de précision du tour a coûté 1 de moins. */
function useCalm(ctx: PlayContext): void {
  if (power(ctx.c, 'calme_absolu')) ctx.c.calmUsed = true;
}

type HunterCard = Omit<CardDef, 'classId'>;

/** Une carte Esprit : 0 énergie ; améliorée, elle pioche aussi 1 carte. */
function aspectCard(id: string, aspect: 'aigle' | 'tortue' | 'guepard', name: string, rarity: HunterCard['rarity'], text: string): HunterCard {
  return {
    id, name, type: 'Compétence', rarity, cost: 0, needsTarget: false, icon: 'pouvoir',
    text: (up) => `Esprit : ${text}${up ? ' Pioche 1 carte.' : ''}`,
    play: (ctx) => {
      setAspect(ctx.c, aspect);
      if (ctx.up) drawCards(ctx.c, 1);
    },
  };
}

const LIST: HunterCard[] = [
  // --- Corde-des-anciens (légendaire) : la Flèche des anciens, ajoutée en main à chaque tour ---
  {
    id: 'fleche_anciens', name: 'Flèche des anciens', type: 'Attaque', rarity: 'statut', cost: 0, needsTarget: true, exhaust: true, icon: 'epee',
    text: () => 'Inflige 5 dégâts. Gardée en main : +5 par tour (15 au plus).',
    play: (ctx) => {
      hit(ctx, flecheDamage(ctx.c));
      ctx.c.flecheCharge = 0;
    },
  },
  // --- Deck de départ ---
  {
    id: 'tir', name: 'Tir', type: 'Attaque', rarity: 'depart', cost: 1, needsTarget: true, icon: 'epee',
    text: (up) => `Inflige ${up ? 9 : 6} dégâts.`,
    play: (ctx) => hit(ctx, ctx.up ? 9 : 6),
  },
  {
    id: 'repli', name: 'Repli', type: 'Compétence', rarity: 'depart', cost: 1, needsTarget: false, icon: 'bouclier',
    text: (up) => `Gagne ${up ? 9 : 6} blocage.`,
    play: (ctx) => gainBlock(ctx.c, ctx.up ? 9 : 6),
  },

  // --- Tronc commun ---
  {
    id: 'fleches_multiples', name: 'Flèches multiples', type: 'Attaque', rarity: 'commune', cost: 1, needsTarget: false, icon: 'epee',
    text: (up) => `Inflige ${up ? 8 : 5} dégâts à tous les ennemis.`,
    play: (ctx) => hitAll(ctx, ctx.up ? 8 : 5),
  },
  {
    id: 'fleche_venimeuse', name: 'Flèche venimeuse', type: 'Attaque', rarity: 'commune', cost: 1, needsTarget: true, icon: 'sang',
    text: (up) => `Inflige ${up ? 4 : 3} dégâts. DoT ${up ? 4 : 3} pendant 4 tours.`,
    play: (ctx) => {
      hit(ctx, ctx.up ? 4 : 3);
      if (ctx.target && !ctx.target.dead) applyDot(ctx.c, ctx.target, 'fleche_venimeuse', ctx.up ? 4 : 3, 4);
    },
  },
  {
    id: 'rappel', name: 'Rappel', type: 'Compétence', rarity: 'commune', cost: 0, needsTarget: false, icon: 'pouvoir',
    text: (up) => `Pioche 1 carte. Ton compagnon +${up ? 4 : 2} dégâts ce tour-ci.`,
    play: (ctx) => {
      drawCards(ctx.c, 1);
      ctx.c.compTurnBonus = (ctx.c.compTurnBonus ?? 0) + (ctx.up ? 4 : 2);
    },
  },
  aspectCard('esprit_aigle', 'aigle', 'Esprit de l\'aigle', 'commune', 'tes Attaques infligent +2 dégâts.'),
  aspectCard('esprit_tortue', 'tortue', 'Esprit de la tortue', 'commune', 'tes cartes de blocage donnent +3 blocage.'),
  aspectCard('esprit_guepard', 'guepard', 'Esprit du guépard', 'peu_commune', '+1 carte par tour, mais +10 % de dégâts subis.'),
  {
    id: 'marque_proie', name: 'Marque de la proie', type: 'Compétence', rarity: 'peu_commune', cost: 0, needsTarget: true, icon: 'pouvoir',
    text: (up) => `Marque la cible : +${up ? 4 : 3} dégâts de tes Attaques et de ton compagnon.`,
    play: (ctx) => markTarget(ctx.c, ctx.target, ctx.up ? 4 : 3),
  },
  {
    id: 'piege_givrant', name: 'Piège givrant', type: 'Compétence', trap: true, rarity: 'peu_commune', cost: 1, costUp: 0, needsTarget: false, icon: 'bouclier',
    text: () => 'Piège : Contrôlé 1 tour (un boss : sa prochaine attaque −50 %).',
    play: (ctx) => placeTrap(ctx.c, 'givrant', 0),
  },
  {
    id: 'tir_recul', name: 'Tir de recul', type: 'Attaque', rarity: 'peu_commune', cost: 1, needsTarget: true, exhaust: true, exhaustUp: false, icon: 'epee',
    text: (up) => `Inflige 4 dégâts. La cible est Contrôlée 1 tour.${up ? '' : ' Épuisé.'}`,
    play: (ctx) => {
      hit(ctx, 4);
      if (ctx.target && !ctx.target.dead) stun(ctx.c, ctx.target, 1);
    },
  },

  // --- Arbre Maîtrise des bêtes ---
  {
    id: 'ordre_attaque', name: 'Ordre : Attaque', type: 'Compétence', order: true, rarity: 'commune', cost: 0, needsTarget: false, icon: 'pouvoir',
    text: (up) => `Ton compagnon agit tout de suite.${up ? ' Pioche 1 carte.' : ''}`,
    play: (ctx) => {
      companionAct(ctx.c);
      if (ctx.up) drawCards(ctx.c, 1);
    },
  },
  {
    id: 'ordre_protege', name: 'Ordre : Protège-moi', type: 'Compétence', order: true, rarity: 'commune', cost: 1, needsTarget: false, icon: 'bouclier',
    text: (up) => `Ton compagnon te donne ${up ? 11 : 8} blocage.`,
    play: (ctx) => companionGuard(ctx.c, ctx.up ? 11 : 8),
  },
  {
    id: 'ordre_hurlement', name: 'Ordre : Hurlement', type: 'Compétence', order: true, rarity: 'commune', cost: 1, needsTarget: false, icon: 'pouvoir',
    text: (up) => `Ennemis Démoralisés ${up ? 2 : 1} tour${up ? 's' : ''}. Ton compagnon +2 dégâts ce tour-ci.`,
    play: (ctx) => {
      for (const e of livingEnemies(ctx.c)) e.buffs.demoralise = Math.max(e.buffs.demoralise, ctx.up ? 2 : 1);
      ctx.c.compTurnBonus = (ctx.c.compTurnBonus ?? 0) + 2;
    },
  },
  {
    id: 'ordre_egorge', name: 'Ordre : Égorge', type: 'Compétence', order: true, rarity: 'commune', cost: 2, needsTarget: true, icon: 'sang',
    text: (up) => `Ton compagnon inflige ${up ? 20 : 15} dégâts à la cible.`,
    play: (ctx) => {
      if (companionAct(ctx.c, 1, ctx.up ? 20 : 15)) ctx.dealt = true;
    },
  },
  {
    id: 'bete_interieure', name: 'Bête intérieure', type: 'Compétence', rarity: 'commune', cost: 1, needsTarget: false, icon: 'pouvoir',
    text: (up) => `Toi et ton compagnon : +${up ? 5 : 3} dégâts ce tour-ci.`,
    play: (ctx) => {
      const n = ctx.up ? 5 : 3;
      ctx.c.huntTurnBonus = (ctx.c.huntTurnBonus ?? 0) + n;
      ctx.c.compTurnBonus = (ctx.c.compTurnBonus ?? 0) + n;
      fx(ctx.c, { kind: 'buff', who: 'player', label: 'Bête intérieure' });
    },
  },
  {
    id: 'rage_compagnon', name: 'Rage du compagnon', type: 'Compétence', rarity: 'commune', cost: 0, needsTarget: false, icon: 'pouvoir',
    text: (up) => `La prochaine attaque de ton compagnon inflige +${up ? 6 : 4} dégâts.`,
    play: (ctx) => {
      ctx.c.compNextBonus = (ctx.c.compNextBonus ?? 0) + (ctx.up ? 6 : 4);
    },
  },
  {
    id: 'morsure_partagee', name: 'Morsure partagée', type: 'Attaque', rarity: 'commune', cost: 0, needsTarget: true, ethereal: true, icon: 'epee',
    text: (up) => `Inflige ${up ? 5 : 3} dégâts. Ton compagnon agit tout de suite. Éphémère.`,
    play: (ctx) => {
      hit(ctx, ctx.up ? 5 : 3);
      companionAct(ctx.c);
    },
  },
  {
    id: 'lien_sauvage', name: 'Lien sauvage', type: 'Pouvoir', rarity: 'peu_commune', cost: 1, needsTarget: false, icon: 'pouvoir',
    text: (up) => `Chaque fois que ton compagnon agit, gagne ${up ? 3 : 2} blocage.`,
    play: (ctx) => powerCard(ctx, 'lien_sauvage', ctx.up ? 3 : 2, 'Lien sauvage'),
  },
  {
    id: 'frenesie_chasseur', name: 'Frénésie', type: 'Pouvoir', rarity: 'peu_commune', cost: 1, needsTarget: false, innateUp: true, icon: 'pouvoir',
    text: (up) => `Chaque attaque du compagnon donne +1 dégât aux suivantes du tour.${up ? ' Inné.' : ''}`,
    play: (ctx) => powerCard(ctx, 'frenesie_chasseur', 1, 'Frénésie'),
  },
  {
    id: 'intimidation_bete', name: 'Intimidation', type: 'Compétence', order: true, rarity: 'peu_commune', cost: 1, costUp: 0, needsTarget: true, icon: 'pouvoir',
    text: () => 'La cible est Contrôlée 1 tour. Un boss : Interruption.',
    play: (ctx) => {
      if (!ctx.target || !stun(ctx.c, ctx.target, 1)) interrupt(ctx, ctx.target);
    },
  },
  {
    id: 'dressage', name: 'Dressage', type: 'Pouvoir', rarity: 'peu_commune', cost: 1, costUp: 0, needsTarget: false, icon: 'pouvoir',
    text: () => 'Tes cartes Ordre coûtent 1 de moins.',
    play: (ctx) => powerCard(ctx, 'dressage', 1, 'Dressage'),
  },
  {
    id: 'esprit_meute', name: 'Esprit de meute', type: 'Pouvoir', rarity: 'rare', cost: 2, needsTarget: false, icon: 'pouvoir',
    text: (up) => `Un Loup spectral t'aide : ${up ? 5 : 3} dégâts à ta cible à la fin de tes tours.`,
    play: (ctx) => {
      ctx.c.spectral = (ctx.c.spectral ?? 0) + (ctx.up ? 5 : 3);
      fx(ctx.c, { kind: 'buff', who: 'player', label: 'Loup spectral' });
    },
  },
  {
    id: 'instinct_tueur', name: 'Instinct de tueur', type: 'Pouvoir', rarity: 'rare', cost: 1, needsTarget: false, innateUp: true, icon: 'pouvoir',
    text: (up) => `Ton compagnon tue un ennemi : +1 énergie et pioche 1 carte.${up ? ' Inné.' : ''}`,
    play: (ctx) => powerCard(ctx, 'instinct_tueur', 1, 'Instinct de tueur'),
  },
  {
    id: 'fureur_primitive', name: 'Fureur primitive', type: 'Pouvoir', rarity: 'epique', cost: 1, costUp: 0, needsTarget: false, icon: 'pouvoir',
    text: () => 'Ton compagnon agit deux fois à la fin de chacun de tes tours.',
    play: (ctx) => powerCard(ctx, 'fureur_primitive', 1, 'Fureur primitive'),
  },

  // --- Arbre Précision ---
  {
    id: 'tir_ajuste', name: 'Tir ajusté', type: 'Attaque', rarity: 'commune', cost: 2, needsTarget: true, icon: 'epee',
    text: (up) => `Inflige ${up ? 18 : 13} dégâts.`,
    play: (ctx) => {
      useCalm(ctx);
      hit(ctx, ctx.up ? 18 : 13);
    },
  },
  {
    id: 'tir_percant', name: 'Tir perçant', type: 'Attaque', rarity: 'commune', cost: 1, needsTarget: true, icon: 'epee',
    text: (up) => `Inflige ${up ? 10 : 7} dégâts. Ignore le blocage.`,
    play: (ctx) => hit(ctx, ctx.up ? 10 : 7, ctx.target, true),
  },
  {
    id: 'tir_rafale', name: 'Tir en rafale', type: 'Attaque', rarity: 'commune', cost: 1, needsTarget: true, icon: 'epee',
    text: (up) => `Inflige ${up ? 4 : 3} dégâts 3 fois.`,
    play: (ctx) => {
      for (let i = 0; i < 3; i++) hit(ctx, ctx.up ? 4 : 3);
    },
  },
  {
    id: 'tir_double', name: 'Tir double', type: 'Attaque', rarity: 'commune', cost: 1, needsTarget: true, icon: 'epee',
    text: (up) => `Inflige ${up ? 7 : 5} dégâts à la cible et à un autre ennemi.`,
    play: (ctx) => {
      const n = ctx.up ? 7 : 5;
      hit(ctx, n);
      const other = livingEnemies(ctx.c).find((e) => e !== ctx.target && !e.submerged && !e.untargetable);
      if (other) hit(ctx, n, other);
    },
  },
  {
    id: 'fleche_ardente', name: 'Flèche ardente', type: 'Attaque', rarity: 'commune', cost: 1, needsTarget: true, icon: 'feu',
    text: (up) => `Inflige ${up ? 8 : 6} dégâts. DoT 2 pendant ${up ? 4 : 3} tours.`,
    play: (ctx) => {
      hit(ctx, ctx.up ? 8 : 6);
      if (ctx.target && !ctx.target.dead) applyDot(ctx.c, ctx.target, 'fleche_ardente', 2, ctx.up ? 4 : 3);
    },
  },
  {
    id: 'concentration_tir', name: 'Concentration', type: 'Compétence', rarity: 'commune', cost: 0, needsTarget: false, icon: 'pouvoir',
    text: (up) => `Ta prochaine Attaque ce tour-ci inflige +${up ? 9 : 6} dégâts.`,
    play: (ctx) => {
      ctx.c.focusNext = (ctx.c.focusNext ?? 0) + (ctx.up ? 9 : 6);
    },
  },
  {
    id: 'respiration_lente', name: 'Respiration lente', type: 'Compétence', rarity: 'commune', cost: 1, needsTarget: false, icon: 'bouclier',
    text: (up) => `Gagne ${up ? 9 : 6} blocage. 1re Attaque du prochain tour : +${up ? 6 : 4} dégâts.`,
    play: (ctx) => {
      gainBlock(ctx.c, ctx.up ? 9 : 6);
      ctx.c.breathNext = (ctx.c.breathNext ?? 0) + (ctx.up ? 6 : 4);
    },
  },
  {
    id: 'tir_fatal', name: 'Tir fatal', type: 'Attaque', rarity: 'peu_commune', cost: 1, needsTarget: true, icon: 'epee',
    text: (up, g) => `Inflige ${up ? 11 : 8} dégâts, triplés si la cible a ${20 + (g?.fatalBonus ?? 0)} % de PV ou moins.`,
    play: (ctx) => {
      const t = ctx.target;
      if (!t) return;
      const n = ctx.up ? 11 : 8;
      hit(ctx, t.hp <= t.maxHp * fatalThreshold(ctx.c) ? n * 3 : n);
    },
  },
  {
    id: 'visee_assuree', name: 'Visée assurée', type: 'Pouvoir', rarity: 'peu_commune', cost: 1, needsTarget: false, icon: 'pouvoir',
    text: (up) => `Tes Attaques à 2 énergie ou plus infligent +${up ? 8 : 5} dégâts.`,
    play: (ctx) => powerCard(ctx, 'visee_assuree', ctx.up ? 8 : 5, 'Visée assurée'),
  },
  {
    id: 'salve', name: 'Salve', type: 'Attaque', rarity: 'rare', cost: 2, needsTarget: false, icon: 'epee',
    text: (up) => `Inflige ${up ? 5 : 4} dégâts à tous les ennemis, 3 fois.`,
    play: (ctx) => {
      for (let i = 0; i < 3; i++) hitAll(ctx, ctx.up ? 5 : 4);
    },
  },
  {
    id: 'tir_precision', name: 'Tir de précision', type: 'Attaque', rarity: 'rare', cost: 3, needsTarget: true, icon: 'epee',
    text: (up) => `Inflige ${up ? 40 : 30} dégâts.`,
    play: (ctx) => {
      useCalm(ctx);
      hit(ctx, ctx.up ? 40 : 30);
    },
  },
  {
    id: 'calme_absolu', name: 'Calme absolu', type: 'Pouvoir', rarity: 'rare', cost: 1, needsTarget: false, innateUp: true, icon: 'pouvoir',
    text: (up) => `Le 1er Tir ajusté ou Tir de précision du tour coûte 1 de moins.${up ? ' Inné.' : ''}`,
    play: (ctx) => powerCard(ctx, 'calme_absolu', 1, 'Calme absolu'),
  },
  {
    id: 'maitre_tireur', name: 'Maître tireur', type: 'Pouvoir', rarity: 'rare', cost: 1, costUp: 0, needsTarget: false, icon: 'pouvoir',
    text: () => 'Marque de la proie donne 2 dégâts de plus.',
    play: (ctx) => powerCard(ctx, 'maitre_tireur', 1, 'Maître tireur'),
  },
  {
    id: 'tir_du_coeur', name: 'Tir du cœur', type: 'Attaque', rarity: 'epique', cost: 2, needsTarget: true, icon: 'epee',
    text: (up) => `Inflige ${up ? 26 : 20} dégâts (×2 si Marquée). Ignore le blocage. Marque la cible.`,
    play: (ctx) => {
      const t = ctx.target;
      if (!t) return;
      const n = ctx.up ? 26 : 20;
      hit(ctx, ctx.c.mark?.uid === t.uid ? n * 2 : n, t, true);
      if (!t.dead && ctx.c.mark?.uid !== t.uid) markTarget(ctx.c, t, 3);
    },
  },

  // --- Arbre Survie ---
  {
    id: 'piege_immolation', name: 'Piège immolation', type: 'Compétence', trap: true, rarity: 'commune', cost: 1, needsTarget: false, icon: 'feu',
    text: (up, g) => `Piège : DoT ${(up ? 6 : 4) + trapDotBonus(g)} pendant 3 tours à l'ennemi qui le déclenche.`,
    play: (ctx) => placeTrap(ctx.c, 'immolation', ctx.up ? 6 : 4),
  },
  {
    id: 'piege_venin', name: 'Piège à venin', type: 'Compétence', trap: true, rarity: 'commune', cost: 1, needsTarget: false, icon: 'sang',
    text: (up, g) => `Piège : DoT ${(up ? 3 : 2) + trapDotBonus(g)} pendant 3 tours à tous les ennemis.`,
    play: (ctx) => placeTrap(ctx.c, 'venin', ctx.up ? 3 : 2),
  },
  {
    id: 'riposte_sauvage', name: 'Riposte sauvage', type: 'Attaque', rarity: 'commune', cost: 1, needsTarget: true, icon: 'epee',
    text: (up) => `Inflige ${up ? 11 : 8} dégâts. Coûte 0 si tu as bloqué une attaque à ce tour ennemi.`,
    play: (ctx) => hit(ctx, ctx.up ? 11 : 8),
  },
  {
    id: 'coup_hachette', name: 'Coup de hachette', type: 'Attaque', rarity: 'commune', cost: 1, needsTarget: true, icon: 'sang',
    text: (up) => `Inflige ${up ? 9 : 7} dégâts. Saignement ${up ? 3 : 2}.`,
    play: (ctx) => {
      hit(ctx, ctx.up ? 9 : 7);
      if (ctx.target && !ctx.target.dead) applySaignement(ctx.target, ctx.up ? 3 : 2, ctx.c);
    },
  },
  {
    id: 'desengagement', name: 'Désengagement', type: 'Compétence', rarity: 'commune', cost: 0, needsTarget: false, icon: 'bouclier',
    text: (up, g) => `Gagne ${(up ? 6 : 4) + (g?.disengageBonus ?? 0)} blocage. Pioche 1 carte.`,
    play: (ctx) => {
      gainBlock(ctx.c, (ctx.up ? 6 : 4) + (ctx.c.gear?.disengageBonus ?? 0));
      drawCards(ctx.c, 1);
    },
  },
  {
    id: 'lancer_filet', name: 'Lancer de filet', type: 'Compétence', rarity: 'commune', cost: 1, costUp: 0, needsTarget: true, icon: 'pouvoir',
    text: () => 'La cible est Contrôlée 1 tour.',
    play: (ctx) => {
      if (ctx.target) stun(ctx.c, ctx.target, 1);
    },
  },
  {
    id: 'sens_aiguises', name: 'Sens aiguisés', type: 'Compétence', rarity: 'commune', cost: 1, needsTarget: false, icon: 'pouvoir',
    text: (up) => `Pioche ${up ? 3 : 2} cartes. Gagne 2 blocage.`,
    play: (ctx) => {
      drawCards(ctx.c, ctx.up ? 3 : 2);
      gainBlock(ctx.c, 2);
    },
  },
  {
    id: 'piege_explosif', name: 'Piège explosif', type: 'Compétence', trap: true, rarity: 'peu_commune', cost: 1, needsTarget: false, icon: 'feu',
    text: (up, g) => `Piège : inflige ${(up ? 12 : 8) + (g?.trapBonus ?? 0)} dégâts à tous les ennemis.`,
    play: (ctx) => placeTrap(ctx.c, 'explosif', ctx.up ? 12 : 8),
  },
  {
    id: 'contre_attaque', name: 'Contre-attaque', type: 'Compétence', rarity: 'peu_commune', cost: 1, needsTarget: false, icon: 'bouclier',
    text: (up) => `Gagne ${up ? 9 : 6} blocage. Le prochain ennemi qui t'attaque est Contrôlé 1 tour.`,
    play: (ctx) => {
      gainBlock(ctx.c, ctx.up ? 9 : 6);
      ctx.c.counterStun = true;
    },
  },
  {
    id: 'dard_paralysant', name: 'Dard paralysant', type: 'Attaque', rarity: 'peu_commune', cost: 1, needsTarget: true, icon: 'sang',
    text: (up) => `Inflige ${up ? 6 : 4} dégâts. Ralenti 3 tours. Son Incantation est retardée.`,
    play: (ctx) => {
      hit(ctx, ctx.up ? 6 : 4);
      const t = ctx.target;
      if (!t || t.dead) return;
      t.buffs.ralenti = Math.max(t.buffs.ralenti, 3);
      delayCast(ctx.c, t);
    },
  },
  {
    id: 'instinct_survie', name: 'Instinct de survie', type: 'Pouvoir', rarity: 'peu_commune', cost: 1, needsTarget: false, icon: 'bouclier',
    text: (up) => `Gagne ${up ? 3 : 2} Robustesse.`,
    play: (ctx) => {
      ctx.c.player.robustesse += ctx.up ? 3 : 2;
      fx(ctx.c, { kind: 'buff', who: 'player', label: 'Instinct de survie' });
    },
  },
  {
    id: 'maitre_pieges', name: 'Maître des pièges', type: 'Pouvoir', rarity: 'rare', cost: 2, costUp: 1, needsTarget: false, icon: 'pouvoir',
    text: () => 'Tes Pièges se déclenchent deux fois.',
    play: (ctx) => powerCard(ctx, 'maitre_pieges', 1, 'Maître des pièges'),
  },
  {
    id: 'pieges_serie', name: 'Pièges en série', type: 'Pouvoir', rarity: 'rare', cost: 1, needsTarget: false, icon: 'pouvoir',
    text: (up) => `Un de tes Pièges se déclenche : pioche 1 carte${up ? ' et gagne 2 blocage' : ''}.`,
    play: (ctx) => {
      powerCard(ctx, 'pieges_serie', 1, 'Pièges en série');
      if (ctx.up) addPower(ctx.c, 'pieges_serie_bloc', 2);
    },
  },
  {
    id: 'champ_pieges', name: 'Champ de pièges', type: 'Compétence', rarity: 'epique', cost: 1, costUp: 0, needsTarget: false, exhaust: true, icon: 'feu',
    text: (_up, g) => `Pose 3 Pièges explosifs (${12 + (g?.trapBonus ?? 0)} dégâts à tous les ennemis). Épuisé.`,
    play: (ctx) => {
      for (let i = 0; i < 3; i++) placeTrap(ctx.c, 'explosif', 12);
    },
  },
];

export const CHASSEUR_CARDS: Record<string, CardDef> = Object.fromEntries(LIST.map((d) => [d.id, { ...d, classId: 'chasseur' }]));
