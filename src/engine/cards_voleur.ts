// Les cartes du Voleur : le paquet de départ, le tronc commun, et les arbres Assassinat, Combat et Finesse.
// Référence : docs/classes/VOLEUR.md (§4 et §5)
import { addPower, applySaignement, drawCards, fx, gainBlock, isBossEnemy, livingEnemies, log, playerAttack } from './actions';
import { isInterruptible } from './enemies';
import { random } from './rng';
import { applyPoison, delayCast, enterStealth, gainCombo, stealthed, stun } from './voleur';
import type { CardDef, PlayContext } from './cards';
import type { EnemyState } from './types';
import type { ItemEffects } from './items';

/** Une Attaque sur la cible. Tourbillon de lames : un autre ennemi encaisse la moitié. */
function hit(ctx: PlayContext, base: number, target: EnemyState | null = ctx.target): number {
  if (!target || target.dead || target.submerged) return 0;
  const dmg = playerAttack(ctx.c, target, base);
  if (dmg > 0) ctx.dealt = true;
  if ((ctx.c.powers?.tourbillon_lames ?? 0) > 0 && target === ctx.target) {
    const other = livingEnemies(ctx.c).find((e) => e !== target && !e.submerged);
    if (other) playerAttack(ctx.c, other, Math.floor(base / 2));
  }
  return dmg;
}

function hitAll(ctx: PlayContext, base: number): void {
  for (const e of livingEnemies(ctx.c)) {
    if (e.submerged) continue;
    if (playerAttack(ctx.c, e, base) > 0) ctx.dealt = true;
  }
}

/** Les points de combo dépensés par un coup final. */
const pts = (ctx: PlayContext): number => ctx.comboSpent ?? 0;
/** Finesse meurtrière : les coups finaux qui frappent infligent +X dégâts par point de combo. */
const fb = (g?: ItemEffects): number => g?.finisherBonus ?? 0;

function powerCard(ctx: PlayContext, id: string, value: number, label: string): void {
  addPower(ctx.c, id, value);
  fx(ctx.c, { kind: 'buff', who: 'player', label });
}

function weaponPoison(ctx: PlayContext, id: 'mortel' | 'affaiblissant' | 'engourdissant', label: string): void {
  ctx.c.weaponPoison = { id, amount: ctx.up ? 2 : 1 };
  fx(ctx.c, { kind: 'buff', who: 'player', label });
}

type RogueCard = Omit<CardDef, 'classId'>;

const LIST: RogueCard[] = [
  // --- Deck de départ ---
  {
    id: 'esquive', name: 'Esquive', type: 'Compétence', rarity: 'depart', cost: 1, needsTarget: false, icon: 'bouclier',
    text: (up, g) => `Gagne ${(up ? 9 : 6) + (g?.evadeBonus ?? 0)} blocage.`,
    play: (ctx) => gainBlock(ctx.c, (ctx.up ? 9 : 6) + (ctx.c.gear?.evadeBonus ?? 0)),
  },

  // --- Tronc commun ---
  {
    id: 'attaque_sinistre', name: 'Attaque sinistre', type: 'Attaque', rarity: 'commune', cost: 1, needsTarget: true, icon: 'epee',
    text: (up, g) => `Inflige ${(up ? 9 : 6) + (g?.sinisterBonus ?? 0)} dégâts. +1 combo.`,
    play: (ctx) => {
      hit(ctx, (ctx.up ? 9 : 6) + (ctx.c.gear?.sinisterBonus ?? 0));
      gainCombo(ctx.c, 1);
    },
  },
  {
    id: 'evisceration', name: 'Éviscération', type: 'Attaque', finisher: true, rarity: 'commune', cost: 1, needsTarget: true, icon: 'epee',
    text: (up, g) => `Coup final : inflige 4 dégâts + ${(up ? 8 : 6) + fb(g)} par combo.`,
    play: (ctx) => hit(ctx, 4 + ((ctx.up ? 8 : 6) + fb(ctx.c.gear)) * pts(ctx)),
  },
  {
    id: 'embuscade', name: 'Embuscade', type: 'Attaque', opener: true, rarity: 'commune', cost: 0, needsTarget: true, icon: 'epee',
    text: (up) => `Ouverture : inflige ${up ? 14 : 10} dégâts. +2 combo.`,
    play: (ctx) => {
      hit(ctx, ctx.up ? 14 : 10);
      gainCombo(ctx.c, 2);
    },
  },
  {
    id: 'feinte', name: 'Feinte', type: 'Compétence', rarity: 'commune', cost: 1, needsTarget: true, icon: 'bouclier',
    text: (up) => `Gagne ${up ? 9 : 6} blocage. La cible est Démoralisée 1 tour.`,
    play: (ctx) => {
      gainBlock(ctx.c, ctx.up ? 9 : 6);
      if (ctx.target) ctx.target.buffs.demoralise = Math.max(ctx.target.buffs.demoralise, 1);
    },
  },
  {
    id: 'couteaux_lancer', name: 'Couteaux de lancer', type: 'Attaque', rarity: 'commune', cost: 1, needsTarget: false, icon: 'epee',
    text: (up) => `Inflige ${up ? 5 : 3} dégâts à tous les ennemis. +1 combo.`,
    play: (ctx) => {
      hitAll(ctx, ctx.up ? 5 : 3);
      gainCombo(ctx.c, 1);
    },
  },
  {
    id: 'poison_mortel', name: 'Poison mortel', type: 'Pouvoir', rarity: 'commune', cost: 1, needsTarget: false, icon: 'sang',
    text: (up) => `Poison d'arme : tes Attaques appliquent Poison ${up ? 2 : 1}.`,
    play: (ctx) => weaponPoison(ctx, 'mortel', 'Poison mortel'),
  },
  {
    id: 'coup_aux_reins', name: 'Coup aux reins', type: 'Compétence', finisher: true, rarity: 'peu_commune', cost: 1, needsTarget: true, icon: 'pouvoir',
    text: (up) => `Coup final : Contrôlée 1 tour${up ? ' (2 dès 4 combo)' : ''}. Boss : Démoralisé 1 tour par combo.`,
    play: (ctx) => {
      const t = ctx.target;
      if (!t || pts(ctx) === 0) return;
      if (isBossEnemy(t)) {
        t.buffs.demoralise = Math.max(t.buffs.demoralise, pts(ctx));
        if (ctx.c.gear?.kidneyDelay) delayCast(ctx.c, t); // Réflexes
      } else {
        stun(ctx.c, t, ctx.up && pts(ctx) >= 4 ? 2 : 1);
      }
    },
  },
  {
    id: 'danse_lames', name: 'Danse des lames', type: 'Compétence', finisher: true, rarity: 'peu_commune', cost: 1, needsTarget: false, icon: 'pouvoir',
    text: (up) => `Coup final : pendant 1 tour par combo, tes Attaques infligent +${up ? 4 : 3} dégâts.`,
    play: (ctx) => {
      if (pts(ctx) === 0) return;
      ctx.c.bladeDance = { bonus: ctx.up ? 4 : 3, turns: pts(ctx) };
      fx(ctx.c, { kind: 'buff', who: 'player', label: 'Danse des lames' });
    },
  },
  {
    id: 'assommer', name: 'Assommer', type: 'Compétence', opener: true, rarity: 'peu_commune', cost: 0, needsTarget: true, icon: 'pouvoir',
    text: (up) => `Ouverture : la cible (sauf boss) est Assommée ${up ? 3 : 2} tours.`,
    play: (ctx) => {
      const t = ctx.target;
      if (!t || isBossEnemy(t)) return;
      t.sap = Math.max(t.sap ?? 0, ctx.up ? 3 : 2);
      fx(ctx.c, { kind: 'buff', who: t.uid, label: 'Assommé' });
    },
  },

  // --- Assassinat ---
  {
    id: 'mutiler', name: 'Mutiler', type: 'Attaque', rarity: 'commune', cost: 1, needsTarget: true, icon: 'epee',
    text: (up) => `Inflige ${up ? 5 : 4} dégâts 2 fois. +2 combo.`,
    play: (ctx) => {
      hit(ctx, ctx.up ? 5 : 4);
      hit(ctx, ctx.up ? 5 : 4);
      gainCombo(ctx.c, 2);
    },
  },
  {
    id: 'frappe_gorge', name: 'Frappe à la gorge', type: 'Attaque', rarity: 'commune', cost: 1, needsTarget: true, icon: 'epee',
    text: (up) => `Inflige ${up ? 10 : 7} dégâts. +1 combo (+2 si la cible est empoisonnée).`,
    play: (ctx) => {
      const poisoned = (ctx.target?.buffs.poison ?? 0) > 0;
      hit(ctx, ctx.up ? 10 : 7);
      gainCombo(ctx.c, poisoned ? 2 : 1);
    },
  },
  {
    id: 'fiole_venin', name: 'Fiole de venin', type: 'Compétence', rarity: 'commune', cost: 0, needsTarget: true, icon: 'sang',
    text: (up) => `Applique Poison ${up ? 5 : 3} à la cible.`,
    play: (ctx) => {
      if (ctx.target) applyPoison(ctx.c, ctx.target, ctx.up ? 5 : 3);
    },
  },
  {
    id: 'rupture', name: 'Rupture', type: 'Attaque', finisher: true, rarity: 'commune', cost: 1, needsTarget: true, icon: 'sang',
    text: (up) => `Coup final : applique Saignement ${up ? 4 : 3} par combo.`,
    play: (ctx) => {
      if (ctx.target && pts(ctx) > 0) applySaignement(ctx.target, (ctx.up ? 4 : 3) * pts(ctx), ctx.c);
    },
  },
  {
    id: 'poison_affaiblissant', name: 'Poison affaiblissant', type: 'Pouvoir', rarity: 'peu_commune', cost: 1, needsTarget: false, icon: 'sang',
    text: (up) => `Poison d'arme : tes Attaques appliquent Poison ${up ? 2 : 1} et Démoralisé 1.`,
    play: (ctx) => weaponPoison(ctx, 'affaiblissant', 'Poison affaiblissant'),
  },
  {
    id: 'poison_engourdissant', name: 'Poison engourdissant', type: 'Pouvoir', rarity: 'peu_commune', cost: 1, needsTarget: false, icon: 'sang',
    text: (up) => `Poison d'arme : Poison ${up ? 2 : 1}, et retarde une Incantation touchée (1 par tour).`,
    play: (ctx) => weaponPoison(ctx, 'engourdissant', 'Poison engourdissant'),
  },
  {
    id: 'envenimer', name: 'Envenimer', type: 'Attaque', finisher: true, rarity: 'peu_commune', cost: 1, needsTarget: true, icon: 'sang',
    text: (up, g) => `Coup final : double le Poison. Inflige ${(up ? 5 : 3) + fb(g)} dégâts par combo.`,
    play: (ctx) => {
      const t = ctx.target;
      if (!t) return;
      t.buffs.poison = (t.buffs.poison ?? 0) * 2;
      if (pts(ctx) > 0) hit(ctx, ((ctx.up ? 5 : 3) + fb(ctx.c.gear)) * pts(ctx));
    },
  },
  {
    id: 'garrot', name: 'Garrot', type: 'Attaque', opener: true, rarity: 'peu_commune', cost: 1, needsTarget: true, icon: 'sang',
    text: (up) => `Ouverture : Saignement ${up ? 6 : 4}. La cible ne finit pas son Incantation. +1 combo.`,
    play: (ctx) => {
      const t = ctx.target;
      if (!t) return;
      applySaignement(t, ctx.up ? 6 : 4, ctx.c);
      if (t.intent.cast && isInterruptible(t.intent) && !t.interrupted) {
        t.interrupted = true;
        fx(ctx.c, { kind: 'interrupt', who: t.uid });
        log(ctx.c, `${t.name} est étranglé : son incantation échoue.`);
      }
      gainCombo(ctx.c, 1);
    },
  },
  {
    id: 'sang_froid', name: 'Sang-froid', type: 'Compétence', rarity: 'peu_commune', cost: 0, needsTarget: false, exhaust: true, exhaustUp: false, icon: 'pouvoir',
    text: (up) => `Ta prochaine Attaque inflige double dégâts.${up ? '' : ' Épuisé.'}`,
    play: (ctx) => {
      ctx.c.coldBlood = true;
      fx(ctx.c, { kind: 'buff', who: 'player', label: 'Sang-froid' });
    },
  },
  {
    id: 'toxines_virulentes', name: 'Toxines virulentes', type: 'Pouvoir', rarity: 'peu_commune', cost: 1, needsTarget: false, innateUp: true, icon: 'sang',
    text: (up) => `Un ennemi empoisonné meurt : son Poison passe à un autre.${up ? ' Inné.' : ''}`,
    play: (ctx) => powerCard(ctx, 'toxines_virulentes', 1, 'Toxines virulentes'),
  },
  {
    id: 'lames_empoisonnees', name: 'Lames empoisonnées', type: 'Pouvoir', rarity: 'rare', cost: 2, costUp: 1, needsTarget: false, icon: 'sang',
    text: () => 'Le Poison ne diminue plus à la fin des tours ennemis.',
    play: (ctx) => powerCard(ctx, 'lames_empoisonnees', 1, 'Lames empoisonnées'),
  },
  {
    id: 'opportunite', name: 'Opportunité', type: 'Pouvoir', rarity: 'rare', cost: 1, needsTarget: false, icon: 'pouvoir',
    text: (up) => `Coup final à 5 combo : +1 énergie et +${up ? 2 : 1} combo.`,
    play: (ctx) => powerCard(ctx, 'opportunite', ctx.up ? 2 : 1, 'Opportunité'),
  },
  {
    id: 'coup_au_coeur', name: 'Coup au cœur', type: 'Attaque', finisher: true, rarity: 'rare', cost: 2, needsTarget: true, icon: 'epee',
    text: (up, g) => `Coup final : inflige ${(up ? 8 : 6) + fb(g)} dégâts par combo. Double sous 30 % de PV.`,
    play: (ctx) => {
      const t = ctx.target;
      if (!t || pts(ctx) === 0) return;
      const base = ((ctx.up ? 8 : 6) + fb(ctx.c.gear)) * pts(ctx);
      hit(ctx, t.hp <= t.maxHp * 0.3 ? base * 2 : base);
    },
  },
  {
    id: 'vendetta', name: 'Vendetta', type: 'Compétence', rarity: 'epique', cost: 1, costUp: 0, needsTarget: true, exhaust: true, icon: 'pouvoir',
    text: () => 'Marque la cible : tes Attaques contre elle +50 % et +2 Poison. Épuisé.',
    play: (ctx) => {
      if (!ctx.target) return;
      ctx.target.vendetta = true;
      fx(ctx.c, { kind: 'buff', who: ctx.target.uid, label: 'Vendetta' });
    },
  },

  // --- Combat ---
  {
    id: 'double_frappe', name: 'Double frappe', type: 'Attaque', rarity: 'commune', cost: 1, needsTarget: true, icon: 'epee',
    text: (up, g) => `Inflige ${up ? 5 : 4} dégâts ${2 + (g?.weaponMaster ?? 0)} fois. +1 combo.`,
    play: (ctx) => {
      for (let i = 0; i < 2 + (ctx.c.gear?.weaponMaster ?? 0); i++) hit(ctx, ctx.up ? 5 : 4);
      gainCombo(ctx.c, 1);
    },
  },
  {
    id: 'tir_pistolet', name: 'Tir de pistolet', type: 'Attaque', rarity: 'commune', cost: 1, needsTarget: true, icon: 'epee',
    text: (up) => `Inflige ${up ? 11 : 8} dégâts. +1 combo.`,
    play: (ctx) => {
      hit(ctx, ctx.up ? 11 : 8);
      gainCombo(ctx.c, 1);
    },
  },
  {
    id: 'riposte_voleur', name: 'Riposte', type: 'Compétence', rarity: 'commune', cost: 1, needsTarget: false, icon: 'bouclier',
    text: (up) => `Gagne ${up ? 9 : 6} blocage. Prochaine attaque reçue : renvoi ${up ? 10 : 8}, +1 combo.`,
    play: (ctx) => {
      gainBlock(ctx.c, ctx.up ? 9 : 6);
      ctx.c.player.riposte = Math.max(ctx.c.player.riposte ?? 0, ctx.up ? 10 : 8);
      ctx.c.riposteCombo = 1;
    },
  },
  {
    id: 'esquive_agile', name: 'Esquive agile', type: 'Compétence', rarity: 'commune', cost: 1, needsTarget: false, icon: 'bouclier',
    text: (up, g) => `Gagne ${(up ? 11 : 8) + (g?.evadeBonus ?? 0)} blocage. +1 combo.`,
    play: (ctx) => {
      gainBlock(ctx.c, (ctx.up ? 11 : 8) + (ctx.c.gear?.evadeBonus ?? 0));
      gainCombo(ctx.c, 1);
    },
  },
  {
    id: 'remise_en_garde', name: 'Remise en garde', type: 'Compétence', rarity: 'commune', cost: 0, needsTarget: false, ethereal: true, icon: 'pouvoir',
    text: (up) => `+${up ? 3 : 2} combo. Éphémère.`,
    play: (ctx) => gainCombo(ctx.c, ctx.up ? 3 : 2),
  },
  {
    id: 'bagarreur', name: 'Bagarreur', type: 'Pouvoir', rarity: 'commune', cost: 1, needsTarget: false, icon: 'pouvoir',
    text: (up) => `Gagne ${up ? 2 : 1} Puissance.`,
    play: (ctx) => {
      ctx.c.player.puissance += ctx.up ? 2 : 1;
      powerCard(ctx, 'bagarreur', 1, 'Bagarreur');
    },
  },
  {
    id: 'frappe_elan', name: 'Frappe d\'élan', type: 'Attaque', rarity: 'peu_commune', cost: 1, needsTarget: true, icon: 'epee',
    text: (up) => `Inflige ${up ? 8 : 5} dégâts. Si c'est ta 3e Attaque du tour : +1 énergie.`,
    play: (ctx) => {
      hit(ctx, ctx.up ? 8 : 5);
      if ((ctx.c.attacksThisTurn ?? 0) === 2) ctx.c.player.energy += 1;
    },
  },
  {
    id: 'coup_bas', name: 'Coup bas', type: 'Compétence', rarity: 'peu_commune', cost: 0, needsTarget: true, icon: 'pouvoir',
    text: (up) => `Cible Contrôlée 1 tour (boss : Incantation retardée).${up ? ' Pioche 1.' : ''}`,
    play: (ctx) => {
      const t = ctx.target;
      if (t) {
        if (isBossEnemy(t)) delayCast(ctx.c, t);
        else stun(ctx.c, t, 1);
      }
      if (ctx.up) drawCards(ctx.c, 1);
    },
  },
  {
    id: 'tourbillon_lames', name: 'Tourbillon de lames', type: 'Pouvoir', rarity: 'peu_commune', cost: 1, costUp: 0, needsTarget: false, icon: 'pouvoir',
    text: () => 'Tes Attaques ciblées touchent aussi un 2e ennemi, pour moitié.',
    play: (ctx) => powerCard(ctx, 'tourbillon_lames', 1, 'Tourbillon de lames'),
  },
  {
    id: 'second_souffle', name: 'Second souffle', type: 'Pouvoir', rarity: 'peu_commune', cost: 1, needsTarget: false, icon: 'bouclier',
    text: (up) => `Chaque fois que tu joues un coup final, gagne ${up ? 6 : 4} blocage.`,
    play: (ctx) => powerCard(ctx, 'second_souffle', ctx.up ? 6 : 4, 'Second souffle'),
  },
  {
    id: 'valse_lames', name: 'Valse des lames', type: 'Attaque', rarity: 'rare', cost: 2, needsTarget: false, icon: 'epee',
    text: (up, g) => `Inflige ${up ? 4 : 3} dégâts à tous les ennemis, ${4 + (g?.weaponMaster ?? 0)} fois. +2 combo.`,
    play: (ctx) => {
      for (let i = 0; i < 4 + (ctx.c.gear?.weaponMaster ?? 0); i++) hitAll(ctx, ctx.up ? 4 : 3);
      gainCombo(ctx.c, 2);
    },
  },
  {
    id: 'embrocher', name: 'Embrocher', type: 'Attaque', finisher: true, rarity: 'rare', cost: 1, needsTarget: true, icon: 'epee',
    text: (up, g) => `Coup final : inflige ${(up ? 8 : 6) + fb(g)} dégâts par combo, ${up ? 4 : 3} par combo aux autres.`,
    play: (ctx) => {
      const n = pts(ctx);
      if (n === 0 || !ctx.target) return;
      const others = livingEnemies(ctx.c).filter((e) => e !== ctx.target && !e.submerged);
      hit(ctx, ((ctx.up ? 8 : 6) + fb(ctx.c.gear)) * n);
      for (const e of others) if (playerAttack(ctx.c, e, (ctx.up ? 4 : 3) * n) > 0) ctx.dealt = true;
    },
  },
  {
    id: 'ambidextrie_experte', name: 'Ambidextrie experte', type: 'Pouvoir', rarity: 'rare', cost: 2, costUp: 1, needsTarget: false, icon: 'pouvoir',
    text: () => 'Ta 1re Attaque de chaque tour est jouée deux fois.',
    play: (ctx) => powerCard(ctx, 'ambidextrie_experte', 1, 'Ambidextrie experte'),
  },
  {
    id: 'frenesie_meurtriere', name: 'Frénésie meurtrière', type: 'Attaque', rarity: 'epique', cost: 2, needsTarget: false, icon: 'epee',
    text: (up) => `6 coups de ${up ? 5 : 4} dégâts sur des ennemis au hasard. +1 combo par coup.`,
    play: (ctx) => {
      for (let i = 0; i < 6; i++) {
        const pool = livingEnemies(ctx.c).filter((e) => !e.submerged);
        if (pool.length === 0) break;
        const t = pool[Math.floor(random(ctx.c) * pool.length)];
        if (playerAttack(ctx.c, t, ctx.up ? 5 : 4) > 0) ctx.dealt = true;
        gainCombo(ctx.c, 1);
      }
    },
  },

  // --- Finesse ---
  {
    id: 'coup_dans_le_dos', name: 'Coup dans le dos', type: 'Attaque', rarity: 'commune', cost: 1, needsTarget: true, icon: 'epee',
    text: (up) => `Inflige ${up ? 12 : 9} dégâts, ou ${up ? 24 : 18} si tu es Camouflé. +1 combo.`,
    play: (ctx) => {
      const n = ctx.up ? 12 : 9;
      hit(ctx, stealthed(ctx.c) ? n * 2 : n);
      gainCombo(ctx.c, 1);
    },
  },
  {
    id: 'hemorragie', name: 'Hémorragie', type: 'Attaque', rarity: 'commune', cost: 1, needsTarget: true, icon: 'sang',
    text: (up) => `Inflige ${up ? 7 : 5} dégâts. Applique Saignement ${up ? 4 : 3}. +1 combo.`,
    play: (ctx) => {
      hit(ctx, ctx.up ? 7 : 5);
      if (ctx.target && !ctx.target.dead) applySaignement(ctx.target, ctx.up ? 4 : 3, ctx.c);
      gainCombo(ctx.c, 1);
    },
  },
  {
    id: 'premeditation', name: 'Préméditation', type: 'Compétence', opener: true, rarity: 'commune', cost: 0, needsTarget: false, icon: 'pouvoir',
    text: (up) => `Ouverture : +${up ? 4 : 3} combo.`,
    play: (ctx) => gainCombo(ctx.c, ctx.up ? 4 : 3),
  },
  {
    id: 'lame_ombre', name: 'Lame de l\'ombre', type: 'Attaque', rarity: 'commune', cost: 1, needsTarget: true, icon: 'epee',
    text: (up) => `Inflige ${up ? 10 : 7} dégâts. Pioche 1 carte.`,
    play: (ctx) => {
      hit(ctx, ctx.up ? 10 : 7);
      drawCards(ctx.c, 1);
    },
  },
  {
    id: 'plan_parfait', name: 'Plan parfait', type: 'Compétence', rarity: 'commune', cost: 1, needsTarget: false, icon: 'pouvoir',
    text: (up) => `Pioche ${up ? 3 : 2}. Une Ouverture piochée : tes Ouvertures coûtent 0 ce tour.`,
    play: (ctx) => {
      const before = ctx.c.hand.length;
      drawCards(ctx.c, ctx.up ? 3 : 2);
      if (ctx.c.hand.slice(before).some((k) => CARDS_OPENER.has(k.id))) ctx.c.openersFree = true;
    },
  },
  {
    id: 'bond_ombre', name: 'Bond de l\'ombre', type: 'Compétence', rarity: 'peu_commune', cost: 0, needsTarget: false, icon: 'pouvoir',
    text: (up) => `Ta prochaine Attaque du tour compte comme Camouflée.${up ? ' Pioche 1 carte.' : ''}`,
    play: (ctx) => {
      ctx.c.shadowStep = true;
      fx(ctx.c, { kind: 'buff', who: 'player', label: 'Bond de l\'ombre' });
      if (ctx.up) drawCards(ctx.c, 1);
    },
  },
  {
    id: 'fumigene', name: 'Fumigène', type: 'Compétence', rarity: 'peu_commune', cost: 1, needsTarget: false, icon: 'bouclier',
    text: (up) => `Gagne ${up ? 9 : 6} blocage. Ennemis Démoralisés 1 tour. Camouflé au prochain tour.`,
    play: (ctx) => {
      gainBlock(ctx.c, ctx.up ? 9 : 6);
      for (const e of livingEnemies(ctx.c)) e.buffs.demoralise = Math.max(e.buffs.demoralise, 1);
      ctx.c.stealthNext = true;
    },
  },
  {
    id: 'initiative', name: 'Initiative', type: 'Pouvoir', rarity: 'peu_commune', cost: 1, needsTarget: false, innateUp: true, icon: 'pouvoir',
    text: (up) => `Chaque fois que tu joues une Ouverture, +2 combo.${up ? ' Inné.' : ''}`,
    play: (ctx) => powerCard(ctx, 'initiative', 2, 'Initiative'),
  },
  {
    id: 'marque_mort', name: 'Marque de mort', type: 'Compétence', rarity: 'peu_commune', cost: 1, costUp: 0, needsTarget: false, exhaust: true, icon: 'pouvoir',
    text: () => '+5 combo. Épuisé.',
    play: (ctx) => gainCombo(ctx.c, 5),
  },
  {
    id: 'coup_fourre', name: 'Coup fourré', type: 'Compétence', finisher: true, rarity: 'peu_commune', cost: 1, needsTarget: false, icon: 'bouclier',
    text: (up) => `Coup final : gagne ${up ? 7 : 5} blocage par combo. Camouflé au prochain tour.`,
    play: (ctx) => {
      if (pts(ctx) > 0) gainBlock(ctx.c, (ctx.up ? 7 : 5) * pts(ctx));
      ctx.c.stealthNext = true;
    },
  },
  {
    id: 'egorgement', name: 'Égorgement', type: 'Attaque', opener: true, rarity: 'rare', cost: 2, needsTarget: true, icon: 'epee',
    text: (up) => `Ouverture : inflige ${up ? 32 : 24} dégâts. +2 combo.`,
    play: (ctx) => {
      hit(ctx, ctx.up ? 32 : 24);
      gainCombo(ctx.c, 2);
    },
  },
  {
    id: 'opportuniste', name: 'Opportuniste', type: 'Pouvoir', rarity: 'rare', cost: 1, needsTarget: false, icon: 'pouvoir',
    text: (up) => `Tes Attaques +${up ? 6 : 4} dégâts aux ennemis Contrôlés, Assommés ou Apeurés.`,
    play: (ctx) => powerCard(ctx, 'opportuniste', ctx.up ? 6 : 4, 'Opportuniste'),
  },
  {
    id: 'tenebres_voleur', name: 'Ténèbres', type: 'Pouvoir', rarity: 'rare', cost: 1, costUp: 0, needsTarget: false, icon: 'pouvoir',
    text: () => 'Pour l\'expédition : ton Camouflage initial dure 2 tours. Épuisé.',
    play: (ctx) => {
      ctx.c.tenebres = true;
      fx(ctx.c, { kind: 'buff', who: 'player', label: 'Ténèbres' });
      log(ctx.c, 'Les ténèbres te suivront : ton Camouflage durera 2 tours aux prochains combats.');
    },
  },
  {
    id: 'seigneur_ombres', name: 'Seigneur des ombres', type: 'Pouvoir', rarity: 'epique', cost: 2, costUp: 1, needsTarget: false, icon: 'pouvoir',
    text: () => 'Camouflé au début de chaque tour. Camouflé, tes Attaques font +50 %.',
    play: (ctx) => {
      powerCard(ctx, 'seigneur_ombres', 1, 'Seigneur des ombres');
      enterStealth(ctx.c, 1);
    },
  },
];

/** Les Ouvertures (pour Plan parfait). */
const CARDS_OPENER = new Set(LIST.filter((d) => d.opener).map((d) => d.id));

export const VOLEUR_CARDS: Record<string, CardDef> = Object.fromEntries(LIST.map((d) => [d.id, { ...d, classId: 'voleur' }]));
