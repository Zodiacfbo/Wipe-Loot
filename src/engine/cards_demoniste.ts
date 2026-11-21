// Les cartes du Démoniste : le deck de départ, le tronc commun, et les arbres Affliction, Démonologie et Destruction.
// Référence : docs/classes/DEMONISTE.md (§4 et §5)
import { drawCards, fx, gainBlock, healPlayer, isBossEnemy, livingEnemies, log, playerAttack, power, addPower } from './actions';
import {
  afflictionCount, applyDot, loseHp, petAct, placeCurse, summonPet, triggerDots,
} from './demoniste';
import { random } from './rng';
import type { CardDef, PlayContext } from './cards';
import type { CombatState, EnemyState } from './types';

/** Un Sort sur la cible. Renvoie les dégâts infligés. */
function zap(ctx: PlayContext, base: number, target: EnemyState | null = ctx.target, ignoreBlock = false): number {
  if (!target || target.dead) return 0;
  const dmg = playerAttack(ctx.c, target, base, { ignoreBlock });
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

function powerCard(ctx: PlayContext, id: string, value: number, label: string): void {
  addPower(ctx.c, id, value);
  fx(ctx.c, { kind: 'buff', who: 'player', label });
}

/** Le prix d'un pacte, avec Maître des pactes. */
export function pactCost(c: CombatState, base: number): number {
  return Math.max(0, base - power(c, 'maitre_pactes'));
}

/** La durée d'une Malédiction (Malédictions durables). */
function curseTurns(ctx: PlayContext, base: number): number {
  return base + (ctx.c.gear?.curseDuration ?? 0);
}

/** Pyroclasme : les sorts de zone démoralisent. */
function pyroclasm(ctx: PlayContext, e: EnemyState): void {
  if (ctx.c.gear?.pyroclasm) e.buffs.demoralise = Math.max(e.buffs.demoralise, 1);
}

/** Effraie un ennemi normal ; un boss est seulement Démoralisé. */
function fear(e: EnemyState, bossTurns = 2): void {
  if (isBossEnemy(e)) e.buffs.demoralise = Math.max(e.buffs.demoralise, bossTurns);
  else e.buffs.peur = Math.max(e.buffs.peur ?? 0, 1);
}

type DemoCard = Omit<CardDef, 'classId'>;

const LIST: DemoCard[] = [
  // --- Deck de départ ---
  {
    id: 'garde_sombre', name: 'Garde sombre', type: 'Compétence', rarity: 'depart', cost: 1, needsTarget: false, icon: 'bouclier',
    text: (up) => `Gagne ${up ? 9 : 6} blocage.`,
    play: (ctx) => gainBlock(ctx.c, ctx.up ? 9 : 6),
  },

  // --- Tronc commun ---
  {
    id: 'siphon_ame', name: 'Siphon d\'âme', type: 'Sort', rarity: 'commune', cost: 1, needsTarget: true, icon: 'pouvoir',
    text: (up) => `Inflige ${up ? 10 : 7} dégâts. Si la cible meurt ce tour-ci : +2 éclats d'âme.`,
    play: (ctx) => {
      if (ctx.target && ctx.c.soulSiphon) ctx.c.soulSiphon[ctx.target.uid] = Math.max(ctx.c.soulSiphon[ctx.target.uid] ?? 0, 2);
      zap(ctx, ctx.up ? 10 : 7);
    },
  },
  {
    id: 'siphon_vie', name: 'Siphon de vie', type: 'Sort', rarity: 'commune', cost: 1, needsTarget: true, icon: 'sang',
    text: (up) => `Inflige ${up ? 7 : 5} dégâts. Te soigne de ${up ? 7 : 5} PV.`,
    play: (ctx) => {
      zap(ctx, ctx.up ? 7 : 5);
      const healed = healPlayer(ctx.c, ctx.up ? 7 : 5);
      if (healed > 0) fx(ctx.c, { kind: 'heal', from: 'player', to: 'player', amount: healed });
    },
  },
  {
    id: 'peur', name: 'Peur', type: 'Compétence', rarity: 'commune', cost: 1, costUp: 0, needsTarget: true, icon: 'pouvoir',
    text: () => `La cible (sauf boss) est Apeurée 1 tour. Un boss est Démoralisé 2 tours.`,
    play: (ctx) => {
      if (ctx.target) fear(ctx.target);
    },
  },
  {
    id: 'pacte_noir', name: 'Pacte noir', type: 'Compétence', rarity: 'commune', cost: 0, needsTarget: false, icon: 'sang',
    text: (up) => `Perds 3 PV. Pioche ${up ? 3 : 2} cartes.`,
    play: (ctx) => {
      loseHp(ctx.c, pactCost(ctx.c, 3));
      drawCards(ctx.c, ctx.up ? 3 : 2);
    },
  },
  {
    id: 'malediction_langages', name: 'Malédiction des langages', type: 'Malédiction', rarity: 'peu_commune', cost: 0, needsTarget: true, icon: 'pouvoir',
    text: (up) => `${up ? 'Les 2 prochaines Incantations' : 'La prochaine Incantation'} de la cible ${up ? 'mettent' : 'met'} 1 tour de plus à se terminer.`,
    play: (ctx) => {
      if (!ctx.target) return;
      const m = placeCurse(ctx.c, ctx.target, 'langages');
      ctx.target.tongues = (ctx.up ? 2 : 1) * m;
    },
  },
  {
    id: 'pluie_de_feu', name: 'Pluie de feu', type: 'Sort', rarity: 'peu_commune', cost: 2, needsTarget: false, icon: 'feu',
    text: (up) => `${up ? 7 : 5} dégâts à tous les ennemis, 2 fois.`,
    play: (ctx) => {
      for (let i = 0; i < 2; i++) nova(ctx, ctx.up ? 7 : 5, (e) => pyroclasm(ctx, e));
    },
  },
  {
    id: 'armure_demoniaque', name: 'Armure démoniaque', type: 'Pouvoir', rarity: 'peu_commune', cost: 1, needsTarget: false, icon: 'pouvoir',
    text: (up) => `Gagne ${up ? 2 : 1} Robustesse. Au début de ton tour, soigne 1 PV.`,
    play: (ctx) => {
      ctx.c.player.robustesse += ctx.up ? 2 : 1;
      powerCard(ctx, 'armure_demoniaque', 1, 'Armure démoniaque');
    },
  },
  {
    id: 'hurlement_terreur', name: 'Hurlement de terreur', type: 'Compétence', rarity: 'rare', cost: 2, costUp: 1, needsTarget: false, exhaust: true, icon: 'pouvoir',
    text: () => `Tous les ennemis (sauf boss) sont Apeurés 1 tour. Épuisé.`,
    play: (ctx) => {
      for (const e of livingEnemies(ctx.c)) if (!isBossEnemy(e) && !e.submerged) e.buffs.peur = Math.max(e.buffs.peur ?? 0, 1);
    },
  },
  {
    id: 'pierre_de_vie_carte', name: 'Création de pierre de vie', type: 'Compétence', rarity: 'rare', cost: 1, costUp: 0, needsTarget: false, exhaust: true, icon: 'sang',
    text: () => `Une Pierre de vie (soigne 15 PV) dans un emplacement de potion libre. Épuisé.`,
    play: (ctx) => {
      (ctx.c.newPotions ??= []).push('pierre_de_vie');
      fx(ctx.c, { kind: 'buff', who: 'player', label: 'Pierre de vie' });
    },
  },

  // --- Affliction ---
  {
    id: 'corruption', name: 'Corruption', type: 'Sort', rarity: 'commune', cost: 1, needsTarget: true, icon: 'sang',
    text: (up, g) => `DoT ${(up ? 5 : 4) + (g?.corruptionBonus ?? 0)} pendant 4 tours.`,
    play: (ctx) => {
      if (ctx.target) applyDot(ctx.c, ctx.target, 'corruption', (ctx.up ? 5 : 4) + (ctx.c.gear?.corruptionBonus ?? 0), 4);
    },
  },
  {
    id: 'malediction_souffrance', name: 'Malédiction de souffrance', type: 'Malédiction', rarity: 'commune', cost: 1, needsTarget: true, icon: 'sang',
    text: (up) => `Pendant 6 tours, la cible subit des dégâts croissants : ${up ? '2 à 7' : '1 à 6'}.`,
    play: (ctx) => {
      if (!ctx.target) return;
      const m = placeCurse(ctx.c, ctx.target, 'souffrance');
      applyDot(ctx.c, ctx.target, 'souffrance', (ctx.up ? 2 : 1) * m, curseTurns(ctx, 6), m);
    },
  },
  {
    id: 'malediction_faiblesse', name: 'Malédiction de faiblesse', type: 'Malédiction', rarity: 'commune', cost: 1, costUp: 0, needsTarget: true, icon: 'pouvoir',
    text: () => `La cible est Démoralisée pendant 5 tours.`,
    play: (ctx) => {
      if (!ctx.target) return;
      const m = placeCurse(ctx.c, ctx.target, 'faiblesse');
      ctx.target.buffs.demoralise = Math.max(ctx.target.buffs.demoralise, curseTurns(ctx, 5) * m);
    },
  },
  {
    id: 'malediction_fatigue', name: 'Malédiction de fatigue', type: 'Malédiction', rarity: 'commune', cost: 1, needsTarget: true, icon: 'pouvoir',
    text: (up) => `5 tours : la cible est Ralentie, et ses attaques infligent ${up ? 3 : 2} dégâts de moins.`,
    play: (ctx) => {
      const t = ctx.target;
      if (!t) return;
      const m = placeCurse(ctx.c, t, 'fatigue');
      t.fatigue = (ctx.up ? 3 : 2) * m;
      t.fatigueTurns = curseTurns(ctx, 5);
      t.buffs.ralenti = Math.max(t.buffs.ralenti, t.fatigueTurns);
    },
  },
  {
    id: 'pacte_souffrance', name: 'Pacte de souffrance', type: 'Sort', rarity: 'commune', cost: 0, needsTarget: true, icon: 'sang',
    text: (up) => `Perds 4 PV. DoT ${up ? 6 : 4} pendant 4 tours.`,
    play: (ctx) => {
      loseHp(ctx.c, pactCost(ctx.c, 4));
      if (ctx.target) applyDot(ctx.c, ctx.target, 'pacte', ctx.up ? 6 : 4, 4);
    },
  },
  {
    id: 'ombre_persistante', name: 'Ombre persistante', type: 'Compétence', rarity: 'commune', cost: 0, needsTarget: true, icon: 'pouvoir',
    text: (up) => `Tes DoT sur la cible durent ${up ? 3 : 2} tours de plus.`,
    play: (ctx) => {
      for (const d of ctx.target?.dots ?? []) d.turns += ctx.up ? 3 : 2;
    },
  },
  {
    id: 'malediction_elements', name: 'Malédiction des éléments', type: 'Malédiction', rarity: 'peu_commune', cost: 1, needsTarget: true, icon: 'pouvoir',
    text: (up) => `Pendant 5 tours, la cible subit ${up ? 50 : 30} % de dégâts en plus de tes Sorts.`,
    play: (ctx) => {
      const t = ctx.target;
      if (!t) return;
      const m = placeCurse(ctx.c, t, 'elements');
      t.elements = (ctx.up ? 50 : 30) * m;
      t.elementsTurns = curseTurns(ctx, 5);
    },
  },
  {
    id: 'fleau_rampant', name: 'Fléau rampant', type: 'Sort', rarity: 'peu_commune', cost: 2, needsTarget: false, icon: 'sang',
    text: (up) => `DoT ${up ? 3 : 2} à tous les ennemis pendant 4 tours.`,
    play: (ctx) => {
      for (const e of livingEnemies(ctx.c)) applyDot(ctx.c, e, 'fleau', ctx.up ? 3 : 2, 4);
    },
  },
  {
    id: 'hantise', name: 'Hantise', type: 'Sort', rarity: 'peu_commune', cost: 1, needsTarget: true, icon: 'pouvoir',
    text: (up) => `Inflige ${up ? 11 : 8} dégâts. Pendant 2 tours, tes DoT sur la cible infligent 50 % de plus.`,
    play: (ctx) => {
      zap(ctx, ctx.up ? 11 : 8);
      if (ctx.target && !ctx.target.dead) ctx.target.haunted = 2;
    },
  },
  {
    id: 'etreinte_ombre', name: 'Étreinte de l\'ombre', type: 'Pouvoir', rarity: 'peu_commune', cost: 1, needsTarget: false, icon: 'pouvoir',
    text: (up) => `Tes DoT infligent +${up ? 2 : 1} dégât${up ? 's' : ''}.`,
    play: (ctx) => powerCard(ctx, 'etreinte', ctx.up ? 2 : 1, 'Étreinte de l\'ombre'),
  },
  {
    id: 'contagion', name: 'Contagion', type: 'Compétence', rarity: 'rare', cost: 1, needsTarget: true, icon: 'sang',
    text: (up) => `Copie tes DoT et tes Malédictions de la cible sur ${up ? 'tous les autres ennemis' : 'un autre ennemi'}.`,
    play: (ctx) => {
      const t = ctx.target;
      if (!t) return;
      const others = livingEnemies(ctx.c).filter((e) => e !== t && !e.submerged);
      for (const o of ctx.up ? others : others.slice(0, 1)) {
        for (const d of t.dots ?? []) applyDot(ctx.c, o, d.id, d.dmg, d.turns, d.grow);
        for (const id of t.curses ?? []) {
          if (!(o.curses ??= []).includes(id)) o.curses.push(id);
          if (id === 'fatigue') [o.fatigue, o.fatigueTurns, o.buffs.ralenti] = [t.fatigue, t.fatigueTurns, Math.max(o.buffs.ralenti, t.buffs.ralenti)];
          if (id === 'elements') [o.elements, o.elementsTurns] = [t.elements, t.elementsTurns];
          if (id === 'faiblesse') o.buffs.demoralise = Math.max(o.buffs.demoralise, t.buffs.demoralise);
          if (id === 'langages') o.tongues = t.tongues;
        }
      }
    },
  },
  {
    id: 'moisson_sombre', name: 'Moisson sombre', type: 'Sort', rarity: 'rare', cost: 2, needsTarget: false, icon: 'sang',
    text: (up) => `À chaque ennemi : ${up ? 6 : 4} dégâts par DoT et Malédiction actifs sur lui.`,
    play: (ctx) => {
      for (const e of livingEnemies(ctx.c)) {
        const n = afflictionCount(e);
        if (n > 0 && !e.submerged) zap(ctx, (ctx.up ? 6 : 4) * n, e);
      }
    },
  },
  {
    id: 'tourment', name: 'Tourment', type: 'Pouvoir', rarity: 'rare', cost: 1, costUp: 0, needsTarget: false, icon: 'pouvoir',
    text: () => `Chaque fois qu'un de tes DoT inflige des dégâts, soigne 1 PV.`,
    play: (ctx) => powerCard(ctx, 'tourment', 1, 'Tourment'),
  },
  {
    id: 'tempete_afflictions', name: 'Tempête d\'afflictions', type: 'Sort', rarity: 'epique', cost: 1, needsTarget: false, icon: 'sang',
    text: (up) => `Déclenche ${up ? 'trois' : 'deux'} fois tous tes DoT sur tous les ennemis (sans réduire leur durée), puis prolonge-les de 1 tour.`,
    play: (ctx) => {
      for (let i = 0; i < (ctx.up ? 3 : 2); i++) for (const e of livingEnemies(ctx.c)) triggerDots(ctx.c, e, false);
      for (const e of livingEnemies(ctx.c)) for (const d of e.dots ?? []) d.turns += 1;
      ctx.dealt = true;
    },
  },

  // --- Démonologie ---
  {
    id: 'ordre_assaut', name: 'Ordre : Assaut', type: 'Compétence', rarity: 'commune', cost: 0, needsTarget: false, icon: 'pouvoir',
    text: (up) => `Ton familier agit immédiatement une fois de plus.${up ? ' Pioche 1 carte.' : ''}`,
    play: (ctx) => {
      petAct(ctx.c);
      if (ctx.up) drawCards(ctx.c, 1);
    },
  },
  {
    id: 'pacte_ombres', name: 'Pacte des ombres', type: 'Compétence', rarity: 'commune', cost: 1, needsTarget: false, icon: 'bouclier',
    text: (up) => `Gagne ${up ? 10 : 7} blocage. Ton familier inflige +2 dégâts pour ce combat.`,
    play: (ctx) => {
      gainBlock(ctx.c, ctx.up ? 10 : 7);
      ctx.c.petBonus = (ctx.c.petBonus ?? 0) + 2;
    },
  },
  {
    id: 'rituel_invocateur', name: 'Rituel de l\'invocateur', type: 'Compétence', rarity: 'commune', cost: 1, needsTarget: false, icon: 'pouvoir',
    text: (up) => `Pioche ${up ? 3 : 2} cartes. Si tu as 3 éclats ou plus : +1 énergie.`,
    play: (ctx) => {
      drawCards(ctx.c, ctx.up ? 3 : 2);
      if ((ctx.c.shards ?? 0) >= 3) ctx.c.player.energy += 1;
    },
  },
  {
    id: 'festin_demoniaque', name: 'Festin démoniaque', type: 'Compétence', rarity: 'commune', cost: 1, needsTarget: false, icon: 'sang',
    text: (up) => `Soigne ${up ? 9 : 6} PV. La prochaine action de ton familier est doublée.`,
    play: (ctx) => {
      const healed = healPlayer(ctx.c, ctx.up ? 9 : 6);
      if (healed > 0) fx(ctx.c, { kind: 'heal', from: 'player', to: 'player', amount: healed });
      ctx.c.petDouble = true;
    },
  },
  {
    id: 'lien_vital', name: 'Lien vital', type: 'Compétence', rarity: 'commune', cost: 0, needsTarget: false, icon: 'sang',
    text: (up) => `Ton familier te soigne de ${up ? 5 : 3} PV.`,
    play: (ctx) => {
      if (!ctx.c.pet || ctx.c.petSacrificed) return;
      const healed = healPlayer(ctx.c, ctx.up ? 5 : 3);
      if (healed > 0) fx(ctx.c, { kind: 'heal', from: 'player', to: 'player', amount: healed });
    },
  },
  {
    id: 'invocation_succube', name: 'Invocation : Succube', type: 'Compétence', rarity: 'peu_commune', cost: 1, shardCost: 1, shardCostUp: 0, needsTarget: false, icon: 'pouvoir',
    text: () => `Ton familier devient la Succube : 2 dégâts à ta cible, et Séduction tous les 3 tours. Elle agit immédiatement.`,
    play: (ctx) => summonPet(ctx.c, 'succube'),
  },
  {
    id: 'invocation_molosse', name: 'Invocation : Molosse infernal', type: 'Compétence', rarity: 'peu_commune', cost: 1, shardCost: 1, shardCostUp: 0, needsTarget: false, icon: 'pouvoir',
    text: () => `Ton familier devient le Molosse infernal : 2 dégâts, dévore une malédiction, Verrou magique. Il agit immédiatement.`,
    play: (ctx) => summonPet(ctx.c, 'molosse'),
  },
  {
    id: 'liens_demoniaques', name: 'Liens démoniaques', type: 'Pouvoir', rarity: 'peu_commune', cost: 1, costUp: 0, needsTarget: false, icon: 'pouvoir',
    text: () => `Les effets de ton familier sont augmentés de 50 %.`,
    play: (ctx) => powerCard(ctx, 'liens_demoniaques', 1, 'Liens démoniaques'),
  },
  {
    id: 'eclat_partage', name: 'Éclat partagé', type: 'Pouvoir', rarity: 'peu_commune', cost: 1, needsTarget: false, innateUp: true, icon: 'pouvoir',
    text: (up) => `Quand ton familier tue un ennemi : +1 éclat d'âme.${up ? ' Inné.' : ''}`,
    play: (ctx) => powerCard(ctx, 'eclat_partage', 1, 'Éclat partagé'),
  },
  {
    id: 'lien_ame', name: 'Lien de l\'âme', type: 'Pouvoir', rarity: 'rare', cost: 2, costUp: 1, needsTarget: false, icon: 'pouvoir',
    text: () => `Chaque fois que ton familier inflige des dégâts, gagne autant de blocage.`,
    play: (ctx) => powerCard(ctx, 'lien_ame', 1, 'Lien de l\'âme'),
  },
  {
    id: 'sacrifice_demoniaque', name: 'Sacrifice démoniaque', type: 'Compétence', rarity: 'rare', cost: 0, needsTarget: false, exhaust: true, icon: 'sang',
    text: (up) => `Sacrifie ton familier pour le combat : +${up ? 3 : 2} Puissance, et +1 énergie à chaque tour. Épuisé.`,
    play: (ctx) => {
      if (!ctx.c.pet || ctx.c.petSacrificed) return;
      ctx.c.petSacrificed = true;
      ctx.c.player.puissance += ctx.up ? 3 : 2;
      fx(ctx.c, { kind: 'buff', who: 'player', label: `Sacrifice : Puissance +${ctx.up ? 3 : 2}` });
    },
  },
  {
    id: 'asservissement', name: 'Asservissement', type: 'Compétence', rarity: 'rare', cost: 1, needsTarget: true, exhaust: true, icon: 'pouvoir',
    text: (up) => `Un ennemi (sauf boss) combat pour toi pendant ${up ? 3 : 2} tours : il attaque les autres ennemis. Épuisé.`,
    play: (ctx) => {
      const t = ctx.target;
      if (!t) return;
      if (isBossEnemy(t)) {
        log(ctx.c, `${t.name} résiste à l'Asservissement.`);
        return;
      }
      t.enslaved = ctx.up ? 3 : 2;
      fx(ctx.c, { kind: 'buff', who: t.uid, label: 'Asservi' });
    },
  },
  {
    id: 'maitre_pactes', name: 'Maître des pactes', type: 'Pouvoir', rarity: 'rare', cost: 1, needsTarget: false, icon: 'pouvoir',
    text: (up) => `Pacte de sang, Pacte noir et Pacte de souffrance coûtent ${up ? 4 : 2} PV de moins.`,
    play: (ctx) => powerCard(ctx, 'maitre_pactes', ctx.up ? 4 : 2, 'Maître des pactes'),
  },
  {
    id: 'seigneur_infernal', name: 'Invocation : Seigneur infernal', type: 'Compétence', rarity: 'epique', cost: 2, shardCost: 2, needsTarget: false, exhaust: true, icon: 'feu',
    text: (up) => `Un Seigneur infernal combat avec toi : à la fin de chacun de tes tours, ${up ? 16 : 12} dégâts à tous les ennemis. Épuisé.`,
    play: (ctx) => {
      ctx.c.infernal = ctx.up ? 16 : 12;
      fx(ctx.c, { kind: 'banner', text: 'Le Seigneur infernal s\'écrase sur le champ de bataille !' });
    },
  },

  // --- Destruction ---
  {
    id: 'trait_ombre', name: 'Trait de l\'ombre', type: 'Sort', rarity: 'commune', cost: 1, needsTarget: true, icon: 'pouvoir',
    text: (up, g) => `Inflige ${(up ? 10 : 7) + (g?.shadowBoltBonus ?? 0)} dégâts.`,
    play: (ctx) => zap(ctx, ctx.up ? 10 : 7),
  },
  {
    id: 'incinerer', name: 'Incinérer', type: 'Sort', rarity: 'commune', cost: 1, needsTarget: true, icon: 'feu',
    text: (up) => `Inflige ${up ? 10 : 7} dégâts, +${up ? 5 : 4} si la cible est sous Immolation.`,
    play: (ctx) => {
      const immo = !!ctx.target?.dots?.some((d) => d.id === 'immolation');
      zap(ctx, (ctx.up ? 10 : 7) + (immo ? (ctx.up ? 5 : 4) : 0));
    },
  },
  {
    id: 'immolation', name: 'Immolation', type: 'Sort', rarity: 'commune', cost: 2, needsTarget: true, icon: 'feu',
    text: (up, g) => `Inflige ${up ? 11 : 8} dégâts. Immolation : DoT ${(up ? 5 : 4) + (g?.immolationBonus ?? 0)} pendant 3 tours.`,
    play: (ctx) => {
      zap(ctx, ctx.up ? 11 : 8);
      if (ctx.target && !ctx.target.dead) applyDot(ctx.c, ctx.target, 'immolation', (ctx.up ? 5 : 4) + (ctx.c.gear?.immolationBonus ?? 0), 3);
    },
  },
  {
    id: 'deflagration_ombre', name: 'Déflagration d\'ombre', type: 'Sort', rarity: 'commune', cost: 1, needsTarget: false, icon: 'pouvoir',
    text: (up) => `Inflige ${up ? 8 : 5} dégâts à tous les ennemis.`,
    play: (ctx) => nova(ctx, ctx.up ? 8 : 5, (e) => pyroclasm(ctx, e)),
  },
  {
    id: 'chaos_instable', name: 'Chaos instable', type: 'Sort', rarity: 'commune', cost: 1, needsTarget: true, icon: 'feu',
    text: (up) => `Inflige entre ${up ? 8 : 4} et ${up ? 20 : 16} dégâts (au hasard).`,
    play: (ctx) => {
      const [min, max] = ctx.up ? [8, 20] : [4, 16];
      const roll = ctx.c.gear?.luck && random(ctx.c) < 0.5 ? max : min + Math.floor(random(ctx.c) * (max - min + 1));
      zap(ctx, roll);
    },
  },
  {
    id: 'conflagration', name: 'Conflagration', type: 'Sort', rarity: 'peu_commune', cost: 1, needsTarget: true, icon: 'feu',
    text: (up, g) => `${g?.keepImmolation ? 'Sans la consommer' : 'Consomme l\'Immolation de la cible'} : ${up ? 4 : 3} fois les dégâts qu'il lui restait à infliger.`,
    play: (ctx) => {
      const t = ctx.target;
      const immo = t?.dots?.find((d) => d.id === 'immolation');
      if (!t || !immo) return;
      const left = immo.dmg * immo.turns;
      if (!ctx.c.gear?.keepImmolation) t.dots = t.dots!.filter((d) => d !== immo);
      zap(ctx, left * (ctx.up ? 4 : 3));
    },
  },
  {
    id: 'embrasement_ame', name: 'Embrasement de l\'âme', type: 'Compétence', rarity: 'peu_commune', cost: 0, shardCost: 1, needsTarget: false, icon: 'feu',
    text: (up) => `Gagne 2 énergie.${up ? ' Pioche 1 carte.' : ''}`,
    play: (ctx) => {
      ctx.c.player.energy += 2;
      if (ctx.up) drawCards(ctx.c, 1);
    },
  },
  {
    id: 'ombre_et_flammes', name: 'Ombre et flammes', type: 'Pouvoir', rarity: 'peu_commune', cost: 1, needsTarget: false, icon: 'pouvoir',
    text: (up) => `Trait de l'ombre, Incinérer et Immolation infligent +${up ? 5 : 3} dégâts.`,
    play: (ctx) => powerCard(ctx, 'ombre_et_flammes', ctx.up ? 5 : 3, 'Ombre et flammes'),
  },
  {
    id: 'contrecoup', name: 'Contrecoup', type: 'Pouvoir', rarity: 'peu_commune', cost: 1, needsTarget: false, innateUp: true, icon: 'pouvoir',
    text: (up) => `Chaque fois que tu perds des PV, ton prochain Trait de l'ombre coûte 0.${up ? ' Inné.' : ''}`,
    play: (ctx) => powerCard(ctx, 'contrecoup', 1, 'Contrecoup'),
  },
  {
    id: 'feu_ame', name: 'Feu de l\'âme', type: 'Sort', rarity: 'rare', cost: 1, shardCost: 1, needsTarget: true, icon: 'feu',
    text: (up) => `Inflige ${up ? 30 : 22} dégâts.`,
    play: (ctx) => zap(ctx, ctx.up ? 30 : 22),
  },
  {
    id: 'trait_chaos', name: 'Trait du chaos', type: 'Sort', rarity: 'rare', cost: 2, needsTarget: true, icon: 'feu',
    text: (up) => `Inflige ${up ? 24 : 18} dégâts. Ignore le blocage.`,
    play: (ctx) => zap(ctx, ctx.up ? 24 : 18, ctx.target, true),
  },
  {
    id: 'pacte_destruction', name: 'Pacte de destruction', type: 'Compétence', rarity: 'rare', cost: 1, needsTarget: false, icon: 'sang',
    text: (up) => `Perds ${up ? 3 : 6} PV. Ton prochain Sort inflige double dégâts.`,
    play: (ctx) => {
      loseHp(ctx.c, ctx.up ? 3 : 6);
      ctx.c.doubleNext = true;
      fx(ctx.c, { kind: 'buff', who: 'player', label: 'Prochain Sort ×2' });
    },
  },
  {
    id: 'ruine', name: 'Ruine', type: 'Pouvoir', rarity: 'rare', cost: 1, needsTarget: false, icon: 'pouvoir',
    text: (up) => `Tes Sorts qui coûtent 2 énergie ou plus infligent +${up ? 9 : 6} dégâts.`,
    play: (ctx) => powerCard(ctx, 'ruine', ctx.up ? 9 : 6, 'Ruine'),
  },
  {
    id: 'cataclysme', name: 'Cataclysme de l\'âme', type: 'Sort', rarity: 'epique', cost: 2, needsTarget: false, icon: 'feu',
    text: (up) => `Inflige ${up ? 7 : 5} dégâts à tous les ennemis par éclat d'âme que tu possèdes (sans les dépenser).`,
    play: (ctx) => {
      const n = ctx.c.shards ?? 0;
      if (n > 0) nova(ctx, (ctx.up ? 7 : 5) * n);
    },
  },
];

export const DEMONISTE_CARDS: Record<string, CardDef> = Object.fromEntries(LIST.map((d) => [d.id, { ...d, classId: 'demoniste' }]));
