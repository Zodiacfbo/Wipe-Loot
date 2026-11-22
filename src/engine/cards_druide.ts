// Les cartes du Druide : le deck de départ, le tronc commun, et les arbres Équilibre, Combat farouche et Restauration.
// Référence : docs/classes/DRUIDE.md (§4 et §5)
import { addPower, applySaignement, drawCards, fx, gainBlock, healPlayer, isBossEnemy, livingEnemies, log, playerAttack, power } from './actions';
import { isInterruptible } from './enemies';
import { applyDot } from './demoniste';
import { dispelMagic, dispelPoison } from './pretre';
import { stun } from './voleur';
import { enterForm, gainBearRage, gainCatCombo, refreshFormRobustesse, spendCatCombo } from './druide';
import { random } from './rng';
import type { CardDef, PlayContext } from './cards';
import type { EnemyState, FormId } from './types';

/** Une Attaque ou un Sort de dégâts sur la cible (ou sur un autre ennemi). */
function hit(ctx: PlayContext, base: number, target: EnemyState | null = ctx.target): number {
  if (!target || target.dead || target.submerged) return 0;
  const dmg = playerAttack(ctx.c, target, base);
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

function interrupt(ctx: PlayContext, t: EnemyState | null): void {
  if (!t || t.dead || !isInterruptible(t.intent) || t.interrupted) return;
  t.interrupted = true;
  fx(ctx.c, { kind: 'interrupt', who: t.uid });
  log(ctx.c, `${t.name} est interrompu !`);
}

const hasMoonfire = (t: EnemyState | null) => !!t?.dots?.some((d) => d.id === 'feu_de_lune');

/** Un soin sur la durée : Renouveau et Rétablissement (Renouveau amélioré, Germination). */
function renew(ctx: PlayContext, amount: number, turns: number): void {
  const c = ctx.c;
  const a = amount + (c.gear?.renewBonus ?? 0) + power(c, 'germination');
  const t = turns + (power(c, 'germination') ? 1 : 0);
  c.renew = { amount: Math.max(c.renew?.turns ? c.renew.amount : 0, a), turns: Math.max(c.renew?.turns ?? 0, t) };
  fx(c, { kind: 'buff', who: 'player', label: 'Renouveau' });
}

type DruidCard = Omit<CardDef, 'classId'>;

/** Une carte qui fait prendre une forme (0 énergie). */
function formCard(id: string, form: FormId, name: string, text: (up: boolean) => string, extra: (ctx: PlayContext) => void): DruidCard {
  return {
    id, name, type: 'Compétence', rarity: 'commune', cost: 0, needsTarget: false, icon: 'pouvoir',
    text,
    play: (ctx) => {
      enterForm(ctx.c, form);
      extra(ctx);
    },
  };
}

const LIST: DruidCard[] = [
  // --- Deck de départ ---
  {
    id: 'garde_sylvestre', name: 'Garde sylvestre', type: 'Compétence', rarity: 'depart', cost: 1, needsTarget: false, icon: 'bouclier',
    text: (up) => `Gagne ${up ? 9 : 6} blocage.`,
    play: (ctx) => gainBlock(ctx.c, ctx.up ? 9 : 6),
  },

  // --- Tronc commun ---
  {
    id: 'colere', name: 'Colère', type: 'Sort', rarity: 'commune', cost: 1, needsTarget: true, icon: 'feu',
    text: (up) => `Inflige ${up ? 10 : 7} dégâts.`,
    play: (ctx) => hit(ctx, ctx.up ? 10 : 7),
  },
  {
    id: 'feu_de_lune', name: 'Feu de lune', type: 'Sort', rarity: 'commune', cost: 1, needsTarget: true, icon: 'feu',
    text: (up) => `Inflige ${up ? 6 : 4} dégâts. DoT ${up ? 3 : 2} pendant 4 tours.`,
    play: (ctx) => {
      hit(ctx, ctx.up ? 6 : 4);
      if (ctx.target && !ctx.target.dead) applyDot(ctx.c, ctx.target, 'feu_de_lune', (ctx.up ? 3 : 2) + (ctx.c.gear?.moonfireBonus ?? 0), 4);
    },
  },
  {
    id: 'renouveau', name: 'Renouveau', type: 'Compétence', healCard: true, rarity: 'commune', cost: 1, needsTarget: false, icon: 'sang',
    text: (up) => `Soigne ${up ? 4 : 3} PV au début de tes 3 prochains tours.`,
    play: (ctx) => renew(ctx, ctx.up ? 4 : 3, 3),
  },
  {
    id: 'racines', name: 'Racines', type: 'Compétence', rarity: 'commune', cost: 1, costUp: 0, needsTarget: true, icon: 'pouvoir',
    text: () => 'La cible est Contrôlée 1 tour. Un boss est Ralenti 2 tours.',
    play: (ctx) => {
      const t = ctx.target;
      if (!t) return;
      if (isBossEnemy(t)) t.buffs.ralenti = Math.max(t.buffs.ralenti, 2);
      else stun(ctx.c, t, 1);
    },
  },
  {
    id: 'epines_druide', name: 'Épines', type: 'Pouvoir', rarity: 'commune', cost: 1, needsTarget: false, icon: 'pouvoir',
    text: (up) => `Chaque fois qu'un ennemi t'attaque, il subit ${up ? 5 : 3} dégâts.`,
    play: (ctx) => powerCard(ctx, 'epines_druide', ctx.up ? 5 : 3, 'Épines'),
  },
  {
    id: 'instinct_sauvage', name: 'Instinct sauvage', type: 'Compétence', rarity: 'commune', cost: 0, needsTarget: false, icon: 'pouvoir',
    text: (up) => `Prends la forme suivante (Ours, Félin, Astrale). Pioche ${up ? 2 : 1} carte${up ? 's' : ''}.`,
    play: (ctx) => {
      const order: FormId[] = ['ours', 'felin', 'astrale'];
      const next = order[(order.indexOf(ctx.c.form ?? 'normale') + 1) % order.length];
      enterForm(ctx.c, next);
      drawCards(ctx.c, ctx.up ? 2 : 1);
    },
  },
  {
    id: 'purge_naturelle', name: 'Purge naturelle', type: 'Compétence', rarity: 'peu_commune', cost: 0, needsTarget: false, icon: 'sang',
    text: (up) => `Dissipation (Magie et Poison).${up ? ' Soigne 3 PV.' : ''}`,
    play: (ctx) => {
      dispelMagic(ctx.c);
      dispelPoison(ctx.c);
      if (ctx.up) healPlayer(ctx.c, 3);
    },
  },
  {
    id: 'poussiere_feerique', name: 'Poussière féerique', type: 'Compétence', rarity: 'peu_commune', cost: 0, needsTarget: true, icon: 'pouvoir',
    text: (up) => `La cible reçoit Armure fracassée ${up ? 3 : 2} tours.`,
    play: (ctx) => {
      if (ctx.target) ctx.target.buffs.armureFracassee = Math.max(ctx.target.buffs.armureFracassee, ctx.up ? 3 : 2);
    },
  },
  {
    id: 'don_des_bois', name: 'Don des bois', type: 'Pouvoir', rarity: 'peu_commune', cost: 1, needsTarget: false, icon: 'pouvoir',
    text: (up) => `Gagne ${up ? 2 : 1} Puissance et ${up ? 2 : 1} Robustesse.`,
    play: (ctx) => {
      ctx.c.player.puissance += ctx.up ? 2 : 1;
      ctx.c.player.robustesse += ctx.up ? 2 : 1;
      fx(ctx.c, { kind: 'buff', who: 'player', label: 'Don des bois' });
    },
  },

  // --- Arbre Équilibre ---
  formCard('forme_astrale', 'astrale', 'Forme astrale', (up) => `Prends la forme astrale. Pioche ${up ? 2 : 1} carte${up ? 's' : ''}.`, (ctx) => drawCards(ctx.c, ctx.up ? 2 : 1)),
  {
    id: 'feu_stellaire', name: 'Feu stellaire', type: 'Sort', form: 'astrale', rarity: 'commune', cost: 2, needsTarget: true, icon: 'feu',
    text: (up) => `Astrale : inflige ${up ? 19 : 14} dégâts.`,
    play: (ctx) => {
      if (ctx.c.gear?.starfireDiscount) ctx.c.starfireUsed = true;
      hit(ctx, ctx.up ? 19 : 14);
    },
  },
  {
    id: 'eclat_lunaire', name: 'Éclat lunaire', type: 'Sort', form: 'astrale', rarity: 'commune', cost: 0, needsTarget: true, icon: 'feu',
    text: (up) => `Astrale : inflige ${up ? 6 : 4} dégâts, +${up ? 4 : 3} sous ton Feu de lune.`,
    play: (ctx) => hit(ctx, (ctx.up ? 6 : 4) + (hasMoonfire(ctx.target) ? (ctx.up ? 4 : 3) : 0)),
  },
  {
    id: 'nuee_insectes', name: 'Nuée d\'insectes', type: 'Sort', form: 'astrale', rarity: 'commune', cost: 1, needsTarget: true, icon: 'sang',
    text: (up) => `Astrale : DoT ${up ? 4 : 3} pendant 4 tours. Ses attaques −2 dégâts.`,
    play: (ctx) => {
      const t = ctx.target;
      if (!t) return;
      applyDot(ctx.c, t, 'nuee_insectes', ctx.up ? 4 : 3, 4);
      t.fatigue = Math.max(t.fatigue ?? 0, 2);
      t.fatigueTurns = Math.max(t.fatigueTurns ?? 0, 4);
      ctx.dealt = true;
    },
  },
  {
    id: 'lueur_lunaire', name: 'Lueur lunaire', type: 'Compétence', rarity: 'commune', cost: 0, needsTarget: true, icon: 'pouvoir',
    text: (up) => `Ton Feu de lune sur la cible dure 2 tours de plus.${up ? ' Pioche 1 carte.' : ''}`,
    play: (ctx) => {
      const d = ctx.target?.dots?.find((x) => x.id === 'feu_de_lune');
      if (d) d.turns += 2;
      if (ctx.up) drawCards(ctx.c, 1);
    },
  },
  {
    id: 'etoiles_filantes', name: 'Étoiles filantes', type: 'Sort', form: 'astrale', rarity: 'peu_commune', cost: 1, needsTarget: false, icon: 'feu',
    text: (up) => `Astrale : inflige ${up ? 4 : 3} dégâts 3 fois, à des ennemis au hasard.`,
    play: (ctx) => {
      for (let i = 0; i < 3; i++) {
        const pool = livingEnemies(ctx.c).filter((e) => !e.submerged);
        if (pool.length === 0) break;
        hit(ctx, ctx.up ? 4 : 3, pool[Math.floor(random(ctx.c) * pool.length)]);
      }
    },
  },
  {
    id: 'rayon_lunaire', name: 'Rayon lunaire', type: 'Sort', form: 'astrale', rarity: 'peu_commune', cost: 1, needsTarget: true, icon: 'feu',
    text: (up) => `Astrale : inflige ${up ? 11 : 8} dégâts, ${up ? 16 : 12} si la cible subit un de tes DoT.`,
    play: (ctx) => hit(ctx, ctx.target?.dots?.length ? (ctx.up ? 16 : 12) : (ctx.up ? 11 : 8)),
  },
  {
    id: 'typhon', name: 'Typhon', type: 'Sort', form: 'astrale', rarity: 'peu_commune', cost: 1, needsTarget: false, icon: 'feu',
    text: (up) => `Astrale : inflige ${up ? 9 : 6} dégâts à tous. Ils sont Démoralisés 1 tour.`,
    play: (ctx) => {
      hitAll(ctx, ctx.up ? 9 : 6);
      for (const e of livingEnemies(ctx.c)) e.buffs.demoralise = Math.max(e.buffs.demoralise, 1);
    },
  },
  {
    id: 'grace_nature', name: 'Grâce de la nature', type: 'Pouvoir', rarity: 'peu_commune', cost: 1, needsTarget: false, icon: 'pouvoir',
    text: (up) => `Chaque fois que tu joues un Sort à 2 énergie ou plus, gagne ${up ? 6 : 4} blocage.`,
    play: (ctx) => powerCard(ctx, 'grace_nature', ctx.up ? 6 : 4, 'Grâce de la nature'),
  },
  {
    id: 'puissance_astrale', name: 'Puissance astrale', type: 'Pouvoir', rarity: 'peu_commune', cost: 1, needsTarget: false, icon: 'pouvoir',
    text: (up) => `En forme astrale, tes Sorts infligent +${up ? 3 : 2} dégâts de plus.`,
    play: (ctx) => powerCard(ctx, 'puissance_astrale', ctx.up ? 3 : 2, 'Puissance astrale'),
  },
  {
    id: 'ouragan', name: 'Ouragan', type: 'Sort', form: 'astrale', rarity: 'rare', cost: 3, needsTarget: false, icon: 'feu',
    text: (up) => `Astrale : inflige ${up ? 7 : 5} dégâts à tous, 3 fois. Ils sont Ralentis 1 tour.`,
    play: (ctx) => {
      for (let i = 0; i < 3; i++) hitAll(ctx, ctx.up ? 7 : 5);
      for (const e of livingEnemies(ctx.c)) e.buffs.ralenti = Math.max(e.buffs.ralenti, 1);
    },
  },
  {
    id: 'eclipse', name: 'Éclipse', type: 'Pouvoir', rarity: 'rare', cost: 1, needsTarget: false, innateUp: true, icon: 'pouvoir',
    text: (up) => `Feu stellaire → Sort lunaire ×2 ; Sort lunaire → Feu stellaire −1.${up ? ' Inné.' : ''}`,
    play: (ctx) => powerCard(ctx, 'eclipse', 1, 'Éclipse'),
  },
  {
    id: 'sylvains', name: 'Sylvains', type: 'Compétence', rarity: 'rare', cost: 2, needsTarget: false, icon: 'pouvoir',
    text: (up) => `3 Sylvains, ${up ? 4 : 3} tours : 3 dégâts chacun à ta cible en fin de tour.`,
    play: (ctx) => {
      ctx.c.treants = { dmg: 3, count: 3, turns: ctx.up ? 4 : 3 };
      fx(ctx.c, { kind: 'buff', who: 'player', label: 'Sylvains' });
    },
  },
  {
    id: 'convergence', name: 'Convergence céleste', type: 'Pouvoir', rarity: 'epique', cost: 1, costUp: 0, needsTarget: false, icon: 'pouvoir',
    text: () => 'Chaque fois que tu joues un Sort, inflige 4 dégâts à tous les ennemis.',
    play: (ctx) => powerCard(ctx, 'convergence', 4, 'Convergence céleste'),
  },

  // --- Arbre Combat farouche : l'Ours ---
  formCard('forme_ours', 'ours', 'Forme d\'ours', (up) => `Prends la forme d'ours. Gagne ${up ? 8 : 5} blocage.`, (ctx) => gainBlock(ctx.c, ctx.up ? 8 : 5)),
  {
    id: 'coup_de_griffe', name: 'Coup de griffe', type: 'Attaque', form: 'ours', rarity: 'commune', cost: 1, needsTarget: true, icon: 'epee',
    text: (up) => `Ours : inflige ${up ? 8 : 6} dégâts. Gagne ${up ? 7 : 5} blocage.`,
    play: (ctx) => {
      hit(ctx, ctx.up ? 8 : 6);
      gainBlock(ctx.c, ctx.up ? 7 : 5);
    },
  },
  {
    id: 'rugissement', name: 'Rugissement', type: 'Compétence', form: 'ours', rarity: 'commune', cost: 1, costUp: 0, needsTarget: false, icon: 'pouvoir',
    text: () => 'Ours : tous les ennemis sont Démoralisés 2 tours. Gagne 1 rage.',
    play: (ctx) => {
      for (const e of livingEnemies(ctx.c)) e.buffs.demoralise = Math.max(e.buffs.demoralise, 2);
      gainBearRage(ctx.c, 1);
    },
  },
  {
    id: 'revers_patte', name: 'Revers de patte', type: 'Attaque', form: 'ours', rarity: 'commune', cost: 2, needsTarget: false, icon: 'epee',
    text: (up) => `Ours : inflige ${up ? 9 : 6} dégâts à tous les ennemis. Gagne 2 rage.`,
    play: (ctx) => {
      hitAll(ctx, ctx.up ? 9 : 6);
      gainBearRage(ctx.c, 2);
    },
  },
  {
    id: 'rage_frenetique', name: 'Rage frénétique', type: 'Compétence', form: 'ours', rarity: 'commune', cost: 0, needsTarget: false, icon: 'pouvoir',
    text: (up) => `Ours : gagne ${up ? 6 : 4} rage.`,
    play: (ctx) => gainBearRage(ctx.c, ctx.up ? 6 : 4),
  },
  {
    id: 'charge_farouche', name: 'Charge farouche', type: 'Attaque', form: 'ours', rarity: 'peu_commune', cost: 1, needsTarget: true, icon: 'epee',
    text: (up) => `Ours : inflige ${up ? 9 : 6} dégâts. Interruption. Gagne 2 rage.`,
    play: (ctx) => {
      interrupt(ctx, ctx.target);
      hit(ctx, ctx.up ? 9 : 6);
      gainBearRage(ctx.c, 2);
    },
  },
  {
    id: 'cuir_epais', name: 'Cuir épais', type: 'Pouvoir', form: 'ours', rarity: 'peu_commune', cost: 1, needsTarget: false, icon: 'bouclier',
    text: (up) => `Ours : en forme d'ours, gagne ${up ? 3 : 2} Robustesse de plus.`,
    play: (ctx) => {
      powerCard(ctx, 'cuir_epais', ctx.up ? 3 : 2, 'Cuir épais');
      refreshFormRobustesse(ctx.c);
    },
  },
  {
    id: 'instinct_protecteur', name: 'Instinct protecteur', type: 'Pouvoir', form: 'ours', rarity: 'rare', cost: 2, costUp: 1, needsTarget: false, icon: 'bouclier',
    text: () => 'Ours : chaque fois que tu gagnes de la rage, gagne autant de blocage.',
    play: (ctx) => powerCard(ctx, 'instinct_protecteur', 1, 'Instinct protecteur'),
  },

  // --- Arbre Combat farouche : le Félin ---
  formCard('forme_felin', 'felin', 'Forme de félin', (up) => `Prends la forme de félin. +${up ? 2 : 1} combo.`, (ctx) => gainCatCombo(ctx.c, ctx.up ? 2 : 1)),
  {
    id: 'griffure', name: 'Griffure', type: 'Attaque', form: 'felin', rarity: 'commune', cost: 0, needsTarget: true, icon: 'epee',
    text: (up) => `Félin : inflige ${up ? 6 : 4} dégâts. +1 combo.`,
    play: (ctx) => {
      hit(ctx, ctx.up ? 6 : 4);
      gainCatCombo(ctx.c, 1);
    },
  },
  {
    id: 'laceration', name: 'Lacération', type: 'Attaque', form: 'felin', rarity: 'commune', cost: 1, needsTarget: true, icon: 'sang',
    text: (up) => `Félin : inflige ${up ? 7 : 5} dégâts. Saignement ${up ? 3 : 2}. +1 combo.`,
    play: (ctx) => {
      hit(ctx, ctx.up ? 7 : 5);
      if (ctx.target && !ctx.target.dead) applySaignement(ctx.target, ctx.up ? 3 : 2, ctx.c);
      gainCatCombo(ctx.c, 1);
    },
  },
  {
    id: 'morsure_feroce', name: 'Morsure féroce', type: 'Attaque', form: 'felin', rarity: 'peu_commune', cost: 1, needsTarget: true, icon: 'epee',
    text: (up) => `Félin : finisher. Inflige 5 dégâts + ${up ? 8 : 6} par combo.`,
    play: (ctx) => hit(ctx, 5 + (ctx.up ? 8 : 6) * spendCatCombo(ctx.c)),
  },
  {
    id: 'dechirure', name: 'Déchirure', type: 'Attaque', form: 'felin', rarity: 'peu_commune', cost: 1, needsTarget: true, icon: 'sang',
    text: (up) => `Félin : finisher. Saignement ${up ? 5 : 4} par combo.`,
    play: (ctx) => {
      const n = spendCatCombo(ctx.c);
      if (ctx.target && n > 0) applySaignement(ctx.target, (ctx.up ? 5 : 4) * n, ctx.c);
    },
  },
  {
    id: 'roder', name: 'Rôder', type: 'Compétence', form: 'felin', rarity: 'peu_commune', cost: 0, needsTarget: false, exhaust: true, exhaustUp: false, icon: 'pouvoir',
    text: (up) => `Félin : ta prochaine Attaque ce tour-ci inflige double dégâts.${up ? '' : ' Épuisé.'}`,
    play: (ctx) => {
      ctx.c.prowl = true;
      fx(ctx.c, { kind: 'buff', who: 'player', label: 'Rôder' });
    },
  },
  {
    id: 'fureur_tigre', name: 'Fureur du tigre', type: 'Compétence', form: 'felin', rarity: 'rare', cost: 0, needsTarget: false, icon: 'pouvoir',
    text: (up) => `Félin : gagne 1 énergie. Tes Attaques +${up ? 5 : 3} dégâts ce tour-ci.`,
    play: (ctx) => {
      ctx.c.player.energy += 1;
      ctx.c.tigerFury = (ctx.c.tigerFury ?? 0) + (ctx.up ? 5 : 3);
    },
  },
  {
    id: 'coeur_sauvage', name: 'Cœur sauvage', type: 'Pouvoir', rarity: 'epique', cost: 1, costUp: 0, needsTarget: false, icon: 'pouvoir',
    text: () => 'Rage et combo gardés. Ours : Attaques +3. Félin : blocage +3.',
    play: (ctx) => powerCard(ctx, 'coeur_sauvage', 1, 'Cœur sauvage'),
  },

  // --- Arbre Restauration ---
  {
    id: 'toucher_guerisseur', name: 'Toucher guérisseur', type: 'Compétence', healCard: true, rarity: 'commune', cost: 2, needsTarget: false, icon: 'sang',
    text: (up) => `Soigne ${up ? 19 : 14} PV.`,
    play: (ctx) => {
      healPlayer(ctx.c, ctx.up ? 19 : 14);
    },
  },
  {
    id: 'retablissement', name: 'Rétablissement', type: 'Compétence', healCard: true, rarity: 'commune', cost: 1, needsTarget: false, icon: 'sang',
    text: (up) => `Soigne ${up ? 7 : 5} PV, puis ${up ? 3 : 2} PV au début de tes 3 prochains tours.`,
    play: (ctx) => {
      healPlayer(ctx.c, ctx.up ? 7 : 5);
      renew(ctx, ctx.up ? 3 : 2, 3);
    },
  },
  {
    id: 'ecorce_vive', name: 'Écorce vive', type: 'Compétence', healCard: true, rarity: 'commune', cost: 1, needsTarget: false, icon: 'bouclier',
    text: (up) => `Gagne ${up ? 11 : 8} blocage. Soigne ${up ? 3 : 2} PV.`,
    play: (ctx) => {
      gainBlock(ctx.c, ctx.up ? 11 : 8);
      healPlayer(ctx.c, ctx.up ? 3 : 2);
    },
  },
  {
    id: 'bourgeon', name: 'Bourgeon', type: 'Compétence', healCard: true, rarity: 'commune', cost: 0, needsTarget: false, icon: 'sang',
    text: (up) => `Soigne ${up ? 5 : 3} PV. Pioche 1 carte.`,
    play: (ctx) => {
      healPlayer(ctx.c, ctx.up ? 5 : 3);
      drawCards(ctx.c, 1);
    },
  },
  {
    id: 'fleurs_sauvages', name: 'Fleurs sauvages', type: 'Compétence', healCard: true, rarity: 'commune', cost: 2, needsTarget: false, icon: 'sang',
    text: (up) => `Soigne ${up ? 11 : 8} PV. Dissipation (Magie et Poison).`,
    play: (ctx) => {
      healPlayer(ctx.c, ctx.up ? 11 : 8);
      dispelMagic(ctx.c);
      dispelPoison(ctx.c);
    },
  },
  {
    id: 'enracinement', name: 'Enracinement', type: 'Compétence', rarity: 'commune', cost: 1, needsTarget: false, icon: 'bouclier',
    text: (up) => `Gagne ${up ? 16 : 12} blocage. Tu ne peux plus changer de forme ce tour-ci.`,
    play: (ctx) => {
      gainBlock(ctx.c, ctx.up ? 16 : 12);
      ctx.c.rooted = true;
    },
  },
  {
    id: 'pollen_apaisant', name: 'Pollen apaisant', type: 'Compétence', healCard: true, rarity: 'commune', cost: 1, needsTarget: false, icon: 'sang',
    text: (up) => `Ennemis Démoralisés ${up ? 2 : 1} tour${up ? 's' : ''}. Soigne 3 PV.`,
    play: (ctx) => {
      for (const e of livingEnemies(ctx.c)) e.buffs.demoralise = Math.max(e.buffs.demoralise, ctx.up ? 2 : 1);
      healPlayer(ctx.c, 3);
    },
  },
  {
    id: 'eclosion', name: 'Éclosion', type: 'Compétence', healCard: true, rarity: 'peu_commune', cost: 1, needsTarget: false, icon: 'sang',
    text: (up) => `Consomme ton Renouveau : soigne tout ce qu'il reste, +${up ? 7 : 4} PV.`,
    play: (ctx) => {
      const r = ctx.c.renew;
      const rest = r && r.turns > 0 ? r.amount * r.turns : 0;
      ctx.c.renew = undefined;
      healPlayer(ctx.c, rest + (ctx.up ? 7 : 4));
    },
  },
  {
    id: 'germination', name: 'Germination', type: 'Pouvoir', rarity: 'peu_commune', cost: 1, costUp: 0, needsTarget: false, icon: 'pouvoir',
    text: () => 'Renouveau et Rétablissement : 1 tour et 1 PV par tour de plus.',
    play: (ctx) => powerCard(ctx, 'germination', 1, 'Germination'),
  },
  {
    id: 'elan_nature', name: 'Élan de la nature', type: 'Compétence', rarity: 'peu_commune', cost: 0, needsTarget: false, exhaust: true, exhaustUp: false, icon: 'pouvoir',
    text: (up) => `Ta prochaine carte ce tour-ci coûte 0.${up ? '' : ' Épuisé.'}`,
    play: (ctx) => {
      ctx.c.freeNext = true;
    },
  },
  {
    id: 'esprit_foret', name: 'Esprit de la forêt', type: 'Pouvoir', rarity: 'peu_commune', cost: 1, needsTarget: false, icon: 'sang',
    text: (up) => `Au début de ton tour, soigne ${up ? 3 : 2} PV.`,
    play: (ctx) => powerCard(ctx, 'esprit_foret', ctx.up ? 3 : 2, 'Esprit de la forêt'),
  },
  {
    id: 'tranquillite', name: 'Tranquillité', type: 'Compétence', rarity: 'rare', cost: 3, costUp: 2, needsTarget: false, exhaust: true, icon: 'sang',
    text: () => 'Début de tes 3 prochains tours : soigne 6 PV, gagne 6 blocage. Épuisé.',
    play: (ctx) => {
      ctx.c.tranquility = 3;
      fx(ctx.c, { kind: 'buff', who: 'player', label: 'Tranquillité' });
    },
  },
  {
    id: 'symbiose', name: 'Symbiose', type: 'Pouvoir', rarity: 'rare', cost: 1, needsTarget: false, icon: 'pouvoir',
    text: (up) => `Chaque fois que tu te soignes, ${up ? 5 : 3} dégâts à un ennemi au hasard.`,
    play: (ctx) => powerCard(ctx, 'symbiose', ctx.up ? 5 : 3, 'Symbiose'),
  },
  {
    id: 'arbre_vie', name: 'Arbre de vie', type: 'Pouvoir', rarity: 'epique', cost: 2, costUp: 1, needsTarget: false, icon: 'sang',
    text: () => 'Tes soins sont augmentés de 50 %. Chaque soin te donne aussi 2 blocage.',
    play: (ctx) => powerCard(ctx, 'arbre_vie', 1, 'Arbre de vie'),
  },
];

export const DRUIDE_CARDS: Record<string, CardDef> = Object.fromEntries(LIST.map((d) => [d.id, { ...d, classId: 'druide' }]));
