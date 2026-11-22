// Les cartes du Chaman : le deck de départ, le tronc commun, et les arbres Élémentaire, Amélioration et Restauration.
// Référence : docs/classes/CHAMAN.md (§4 et §5)
import { addPower, drawCards, fx, gainBlock, healPlayer, isBossEnemy, livingEnemies, playerAttack } from './actions';
import { applyDot } from './demoniste';
import { dispelMagic, dispelPoison } from './pretre';
import { stun } from './voleur';
import { placeTotem, resonance, setImbue, totemCount } from './chaman';
import type { CardDef, PlayContext } from './cards';
import type { EnemyState } from './types';

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

/** D'autres ennemis que la cible, au plus `n`. */
function others(ctx: PlayContext, n: number): EnemyState[] {
  return livingEnemies(ctx.c).filter((e) => e !== ctx.target && !e.submerged && !e.untargetable).slice(0, n);
}

/** Un soin sur la durée (Remous). */
function renew(ctx: PlayContext, amount: number, turns: number): void {
  const c = ctx.c;
  c.renew = { amount: Math.max(c.renew?.turns ? c.renew.amount : 0, amount), turns: Math.max(c.renew?.turns ?? 0, turns) };
}

type ShamanCard = Omit<CardDef, 'classId'>;

/** Une carte Totem : pose le totem de son élément. */
function totemCard(id: string, totem: string, name: string, rarity: ShamanCard['rarity'], text: (up: boolean) => string, value: (up: boolean) => number, value2?: (up: boolean) => number, cost = 1, costUp?: number): ShamanCard {
  return {
    id, name, type: 'Compétence', rarity, cost, costUp, needsTarget: false, icon: 'pouvoir',
    text: (up) => `Totem : ${text(up)}`,
    play: (ctx) => placeTotem(ctx.c, totem, value(ctx.up), value2?.(ctx.up)),
  };
}

/** Une Arme élémentaire (Pouvoir) : une seule active à la fois. */
function imbueCard(id: string, weapon: string, name: string, rarity: ShamanCard['rarity'], text: (up: boolean) => string, value: (up: boolean) => number, costUp?: number): ShamanCard {
  return {
    id, name, type: 'Pouvoir', rarity, cost: 1, costUp, needsTarget: false, icon: 'epee',
    text: (up) => `Arme : ${text(up)}`,
    play: (ctx) => setImbue(ctx.c, weapon, value(ctx.up), ctx.up),
  };
}

const LIST: ShamanCard[] = [
  // --- Deck de départ ---
  {
    id: 'garde_de_pierre', name: 'Garde de pierre', type: 'Compétence', rarity: 'depart', cost: 1, needsTarget: false, icon: 'bouclier',
    text: (up) => `Gagne ${up ? 9 : 6} blocage.`,
    play: (ctx) => gainBlock(ctx.c, ctx.up ? 9 : 6),
  },

  // --- Tronc commun ---
  totemCard('totem_pierre', 'pierre', 'Totem de pierre', 'commune', (up) => `début de ton tour, gagne ${up ? 6 : 4} blocage.`, (up) => (up ? 6 : 4)),
  totemCard('totem_braise', 'braise', 'Totem de braise', 'commune', (up) => `début de ton tour, ${up ? 7 : 5} dégâts à un ennemi au hasard.`, (up) => (up ? 7 : 5)),
  totemCard('totem_guerisseur', 'guerisseur', 'Totem guérisseur', 'commune', (up) => `début de ton tour, soigne ${up ? 4 : 3} PV.`, (up) => (up ? 4 : 3)),
  {
    id: 'choc_flammes', name: 'Choc de flammes', type: 'Sort', rarity: 'commune', cost: 1, needsTarget: true, icon: 'feu',
    text: (up) => `Inflige ${up ? 6 : 4} dégâts. DoT ${up ? 3 : 2} pendant 3 tours.`,
    play: (ctx) => {
      hit(ctx, ctx.up ? 6 : 4);
      if (ctx.target && !ctx.target.dead) applyDot(ctx.c, ctx.target, 'choc_flammes', (ctx.up ? 3 : 2) + (ctx.c.gear?.flameShockBonus ?? 0), 3);
    },
  },
  {
    id: 'choc_givre', name: 'Choc de givre', type: 'Sort', rarity: 'commune', cost: 1, needsTarget: true, icon: 'feu',
    text: (up) => `Inflige ${up ? 8 : 5} dégâts. Ralenti 2 tours.`,
    play: (ctx) => {
      hit(ctx, ctx.up ? 8 : 5);
      if (ctx.target && !ctx.target.dead) ctx.target.buffs.ralenti = Math.max(ctx.target.buffs.ralenti, 2);
    },
  },
  {
    id: 'pas_loup_spectral', name: 'Pas du loup spectral', type: 'Compétence', rarity: 'commune', cost: 0, needsTarget: false, icon: 'bouclier',
    text: (up) => `Retire tes Zones de feu de ta main, sans dégâts. Gagne ${up ? 5 : 3} blocage.`,
    play: (ctx) => {
      const zones = ctx.c.hand.filter((k) => k.id === 'zone_de_feu');
      ctx.c.hand = ctx.c.hand.filter((k) => k.id !== 'zone_de_feu');
      ctx.c.exhaust.push(...zones);
      gainBlock(ctx.c, ctx.up ? 5 : 3);
    },
  },
  totemCard('totem_vents', 'vents', 'Totem des vents', 'peu_commune', (up) => `tes Attaques infligent +${up ? 3 : 2} dégâts.`, (up) => (up ? 3 : 2)),
  totemCard('totem_purification', 'purification', 'Totem de purification', 'peu_commune', () => 'début de ton tour, Dissipation (Poison).', () => 0, undefined, 1, 0),
  {
    id: 'bouclier_foudre', name: 'Bouclier de foudre', type: 'Pouvoir', rarity: 'peu_commune', cost: 1, needsTarget: false, icon: 'bouclier',
    text: (up) => `Les 3 premiers ennemis qui t'attaquent chaque tour subissent ${up ? 5 : 3} dégâts.`,
    play: (ctx) => powerCard(ctx, 'bouclier_foudre', ctx.up ? 5 : 3, 'Bouclier de foudre'),
  },

  // --- Arbre Élémentaire ---
  {
    id: 'eclair', name: 'Éclair', type: 'Sort', rarity: 'commune', cost: 1, needsTarget: true, icon: 'feu',
    text: (up) => `Inflige ${up ? 10 : 7} dégâts. Résonance (Air) : +${up ? 3 : 2} dégâts.`,
    play: (ctx) => hit(ctx, (ctx.up ? 10 : 7) + (resonance(ctx.c, 'air') ? (ctx.up ? 3 : 2) : 0)),
  },
  {
    id: 'grondement_tonnerre', name: 'Grondement de tonnerre', type: 'Sort', rarity: 'commune', cost: 1, needsTarget: false, icon: 'feu',
    text: (up) => `Inflige ${up ? 7 : 5} dégâts à tous les ennemis. Ils sont Démoralisés 1 tour.`,
    play: (ctx) => {
      hitAll(ctx, ctx.up ? 7 : 5);
      for (const e of livingEnemies(ctx.c)) e.buffs.demoralise = Math.max(e.buffs.demoralise, 1);
    },
  },
  {
    id: 'orbe_foudre', name: 'Orbe de foudre', type: 'Sort', rarity: 'commune', cost: 1, needsTarget: true, icon: 'feu',
    text: (up) => `Inflige ${up ? 6 : 4} dégâts maintenant, et ${up ? 6 : 4} au début de ton prochain tour.`,
    play: (ctx) => {
      hit(ctx, ctx.up ? 6 : 4);
      if (ctx.target && !ctx.target.dead) (ctx.c.orbs ??= []).push({ uid: ctx.target.uid, dmg: ctx.up ? 6 : 4 });
    },
  },
  {
    id: 'courant_ascendant', name: 'Courant ascendant', type: 'Compétence', rarity: 'commune', cost: 0, needsTarget: false, ethereal: true, icon: 'pouvoir',
    text: (up) => `Résonance (Air) : gagne 1 énergie.${up ? ' Pioche 1 carte.' : ''} Éphémère.`,
    play: (ctx) => {
      if (resonance(ctx.c, 'air')) ctx.c.player.energy += 1;
      if (ctx.up) drawCards(ctx.c, 1);
    },
  },
  {
    id: 'rage_elements', name: 'Rage des éléments', type: 'Sort', rarity: 'commune', cost: 1, needsTarget: true, icon: 'feu',
    text: (up) => `Inflige ${up ? 5 : 3} dégâts par totem en jeu, +3.`,
    play: (ctx) => hit(ctx, 3 + (ctx.up ? 5 : 3) * totemCount(ctx.c)),
  },
  {
    id: 'chaine_eclairs', name: 'Chaîne d\'éclairs', type: 'Sort', rarity: 'peu_commune', cost: 2, needsTarget: true, icon: 'feu',
    text: (up) => `Inflige ${up ? '11, 8, 5' : '8, 6, 4'} dégâts à 3 ennemis. Résonance (Air) : un de plus.`,
    play: (ctx) => {
      const dmg = ctx.up ? [11, 8, 5, 5, 5] : [8, 6, 4, 4, 4];
      const n = 2 + (resonance(ctx.c, 'air') ? 1 : 0) + (ctx.c.gear?.chainExtra ?? 0);
      hit(ctx, dmg[0]);
      others(ctx, n).forEach((e, i) => hit(ctx, dmg[i + 1], e));
    },
  },
  {
    id: 'jet_lave', name: 'Jet de lave', type: 'Sort', rarity: 'peu_commune', cost: 2, needsTarget: true, icon: 'feu',
    text: (up) => `Inflige ${up ? 16 : 12} dégâts, doublés si la cible subit un de tes DoT.`,
    play: (ctx) => {
      const n = ctx.up ? 16 : 12;
      hit(ctx, ctx.target?.dots?.length ? n * 2 : n);
    },
  },
  totemCard('totem_lave', 'lave', 'Totem de lave', 'peu_commune', (up) => `début de ton tour, ${up ? 3 : 2} dégâts à tous les ennemis.`, (up) => (up ? 3 : 2)),
  {
    id: 'concentration_elementaire', name: 'Concentration élémentaire', type: 'Pouvoir', rarity: 'peu_commune', cost: 1, needsTarget: false, innateUp: true, icon: 'pouvoir',
    text: (up) => `Sort à 2 énergie ou plus : le Sort suivant coûte 1 de moins.${up ? ' Inné.' : ''}`,
    play: (ctx) => powerCard(ctx, 'concentration_elementaire', 1, 'Concentration élémentaire'),
  },
  {
    id: 'appel_foudre', name: 'Appel de la foudre', type: 'Pouvoir', rarity: 'peu_commune', cost: 1, costUp: 0, needsTarget: false, icon: 'pouvoir',
    text: () => 'Tes Résonances (Air) se déclenchent toujours, même sans Totem d\'Air.',
    play: (ctx) => powerCard(ctx, 'appel_foudre', 1, 'Appel de la foudre'),
  },
  {
    id: 'seisme', name: 'Séisme', type: 'Sort', rarity: 'rare', cost: 3, needsTarget: false, icon: 'feu',
    text: (up) => `Inflige ${up ? 8 : 6} dégâts à tous, 2 fois. Ennemis normaux Contrôlés 1 tour.`,
    play: (ctx) => {
      for (let i = 0; i < 2; i++) hitAll(ctx, ctx.up ? 8 : 6);
      for (const e of livingEnemies(ctx.c)) if (!isBossEnemy(e)) stun(ctx.c, e, 1);
    },
  },
  {
    id: 'fureur_elementaire', name: 'Fureur élémentaire', type: 'Pouvoir', rarity: 'rare', cost: 1, needsTarget: false, icon: 'pouvoir',
    text: (up) => `Avec 3 totems ou plus en jeu, tes Sorts infligent +${up ? 5 : 3} dégâts.`,
    play: (ctx) => powerCard(ctx, 'fureur_elementaire', ctx.up ? 5 : 3, 'Fureur élémentaire'),
  },
  totemCard('totem_orage', 'orage', 'Totem de l\'orage', 'rare', (up) => `début de ton tour, ${up ? 5 : 3} dégâts au hasard. Sorts +${up ? 2 : 1}.`, (up) => (up ? 5 : 3), (up) => (up ? 2 : 1), 2),
  {
    id: 'avatar_tempete', name: 'Avatar de la tempête', type: 'Pouvoir', rarity: 'epique', cost: 1, costUp: 0, needsTarget: false, icon: 'pouvoir',
    text: (up) => `Chaque fois que tu joues un Sort, un éclair inflige ${up ? 7 : 5} dégâts au hasard.`,
    play: (ctx) => powerCard(ctx, 'avatar_tempete', ctx.up ? 7 : 5, 'Avatar de la tempête'),
  },

  // --- Arbre Amélioration ---
  {
    id: 'frappe_primitive', name: 'Frappe primitive', type: 'Attaque', rarity: 'commune', cost: 1, needsTarget: true, icon: 'epee',
    text: (up) => `Inflige ${up ? 10 : 7} dégâts.`,
    play: (ctx) => hit(ctx, ctx.up ? 10 : 7),
  },
  {
    id: 'coup_lave', name: 'Coup de lave', type: 'Attaque', rarity: 'commune', cost: 1, needsTarget: true, icon: 'feu',
    text: (up) => `Inflige ${up ? 11 : 8} dégâts, +${up ? 5 : 4} si l'Arme de flammes est active.`,
    play: (ctx) => hit(ctx, (ctx.up ? 11 : 8) + (ctx.c.imbues?.some((w) => w.id === 'flammes') ? (ctx.up ? 5 : 4) : 0)),
  },
  {
    id: 'double_impact', name: 'Double impact', type: 'Attaque', rarity: 'commune', cost: 1, needsTarget: true, icon: 'epee',
    text: (up) => `Inflige ${up ? 6 : 4} dégâts, puis ${up ? 6 : 4} dégâts de Sort.`,
    play: (ctx) => {
      hit(ctx, ctx.up ? 6 : 4);
      const p = ctx.c.playing;
      if (p) ctx.c.playing = { ...p, type: 'Sort' };
      hit(ctx, ctx.up ? 6 : 4);
      ctx.c.playing = p;
    },
  },
  {
    id: 'tourbillon_vents', name: 'Tourbillon des vents', type: 'Attaque', rarity: 'commune', cost: 2, needsTarget: false, icon: 'epee',
    text: (up) => `Inflige ${up ? 9 : 6} dégâts à tous les ennemis.`,
    play: (ctx) => hitAll(ctx, ctx.up ? 9 : 6),
  },
  imbueCard('arme_flammes', 'flammes', 'Arme de flammes', 'commune', (up) => `tes Attaques infligent +${up ? 3 : 2} dégâts.`, (up) => (up ? 3 : 2)),
  imbueCard('arme_givre', 'givre', 'Arme de givre', 'commune', (up) => `tes Attaques appliquent Ralenti 1 tour${up ? ' et Démoralisé 1 tour' : ''}.`, () => 0),
  imbueCard('arme_vents', 'vents', 'Arme des vents', 'peu_commune', () => 'ta première Attaque de chaque tour frappe une fois de plus.', () => 0, 0),
  {
    id: 'lame_foudroyante', name: 'Lame foudroyante', type: 'Attaque', rarity: 'peu_commune', cost: 1, needsTarget: true, icon: 'epee',
    text: (up) => `Inflige ${up ? 9 : 6} dégâts. Un éclair inflige ${up ? 5 : 3} dégâts à un autre ennemi.`,
    play: (ctx) => {
      hit(ctx, ctx.up ? 9 : 6);
      const [o] = others(ctx, 1);
      if (o) hit(ctx, ctx.up ? 5 : 3, o);
    },
  },
  {
    id: 'transe_guerriere', name: 'Transe guerrière', type: 'Compétence', rarity: 'peu_commune', cost: 0, needsTarget: false, exhaust: true, exhaustUp: false, icon: 'pouvoir',
    text: (up) => `Gagne 1 énergie et 3 blocage.${up ? '' : ' Épuisé.'}`,
    play: (ctx) => {
      ctx.c.player.energy += 1;
      gainBlock(ctx.c, 3);
    },
  },
  {
    id: 'esprit_combatif', name: 'Esprit combatif', type: 'Pouvoir', rarity: 'peu_commune', cost: 1, needsTarget: false, icon: 'pouvoir',
    text: (up) => `Quand tu poses un totem, ta prochaine Attaque inflige +${up ? 6 : 4} dégâts.`,
    play: (ctx) => powerCard(ctx, 'esprit_combatif', ctx.up ? 6 : 4, 'Esprit combatif'),
  },
  totemCard('totem_force', 'force', 'Totem de force', 'peu_commune', (up) => `+${up ? 2 : 1} Puissance tant qu'il est en jeu.`, (up) => (up ? 2 : 1)),
  {
    id: 'esprits_loups', name: 'Esprits des loups', type: 'Compétence', rarity: 'rare', cost: 2, needsTarget: false, icon: 'pouvoir',
    text: (up) => `2 loups spectraux, ${up ? 4 : 3} tours : 3 dégâts chacun à ta cible en fin de tour.`,
    play: (ctx) => {
      ctx.c.treants = { dmg: 3, count: 2, turns: ctx.up ? 4 : 3, label: 'Loup spectral' };
      fx(ctx.c, { kind: 'buff', who: 'player', label: 'Esprits des loups' });
    },
  },
  {
    id: 'arme_tourbillonnante', name: 'Arme tourbillonnante', type: 'Pouvoir', rarity: 'rare', cost: 1, needsTarget: false, innateUp: true, icon: 'pouvoir',
    text: (up) => `Chaque Attaque : 1 charge. À 5 charges, ton prochain Sort coûte 0.${up ? ' Inné.' : ''}`,
    play: (ctx) => powerCard(ctx, 'arme_tourbillonnante', 1, 'Arme tourbillonnante'),
  },
  {
    id: 'frappe_orage', name: 'Frappe d\'orage', type: 'Attaque', rarity: 'epique', cost: 2, needsTarget: true, icon: 'epee',
    text: (up) => `Inflige ${up ? 11 : 8} dégâts 2 fois. Ce tour et le suivant, tes Sorts +4.`,
    play: (ctx) => {
      hit(ctx, ctx.up ? 11 : 8);
      hit(ctx, ctx.up ? 11 : 8);
      ctx.c.stormstrike = 2;
    },
  },

  // --- Arbre Restauration ---
  {
    id: 'petite_vague', name: 'Petite vague', type: 'Compétence', healCard: true, rarity: 'commune', cost: 1, needsTarget: false, icon: 'sang',
    text: (up) => `Soigne ${up ? 7 : 5} PV. Gagne ${up ? 3 : 2} blocage.`,
    play: (ctx) => {
      healPlayer(ctx.c, ctx.up ? 7 : 5);
      gainBlock(ctx.c, ctx.up ? 3 : 2);
    },
  },
  {
    id: 'vague_soins', name: 'Vague de soins', type: 'Compétence', healCard: true, rarity: 'commune', cost: 2, needsTarget: false, icon: 'sang',
    text: (up) => `Soigne ${up ? 16 : 12} PV.`,
    play: (ctx) => {
      healPlayer(ctx.c, ctx.up ? 16 : 12);
    },
  },
  {
    id: 'remous', name: 'Remous', type: 'Compétence', healCard: true, rarity: 'commune', cost: 1, needsTarget: false, icon: 'sang',
    text: (up) => `Soigne ${up ? 4 : 3} PV maintenant et au début de tes 2 prochains tours.`,
    play: (ctx) => {
      healPlayer(ctx.c, ctx.up ? 4 : 3);
      renew(ctx, ctx.up ? 4 : 3, 2);
    },
  },
  {
    id: 'esprit_purifie', name: 'Esprit purifié', type: 'Compétence', healCard: true, rarity: 'commune', cost: 0, needsTarget: false, icon: 'sang',
    text: (up) => `Dissipation (Poison). Soigne ${up ? 5 : 3} PV.`,
    play: (ctx) => {
      dispelPoison(ctx.c);
      if (ctx.c.gear?.purity) dispelMagic(ctx.c);
      healPlayer(ctx.c, ctx.up ? 5 : 3);
    },
  },
  {
    id: 'pluie_guerisseuse', name: 'Pluie guérisseuse', type: 'Compétence', healCard: true, rarity: 'commune', cost: 2, needsTarget: false, icon: 'sang',
    text: (up) => `Soigne ${up ? 11 : 8} PV. Gagne ${up ? 8 : 6} blocage.`,
    play: (ctx) => {
      healPlayer(ctx.c, ctx.up ? 11 : 8);
      gainBlock(ctx.c, ctx.up ? 8 : 6);
    },
  },
  {
    id: 'equilibre_chaman', name: 'Équilibre', type: 'Compétence', healCard: true, rarity: 'commune', cost: 0, needsTarget: false, icon: 'sang',
    text: (up) => `Soigne ${up ? 4 : 3} PV par totem en jeu.`,
    play: (ctx) => {
      const n = totemCount(ctx.c);
      if (n > 0) healPlayer(ctx.c, (ctx.up ? 4 : 3) * n);
    },
  },
  {
    id: 'flots_apaisants', name: 'Flots apaisants', type: 'Compétence', healCard: true, rarity: 'commune', cost: 1, needsTarget: false, icon: 'bouclier',
    text: (up) => `Gagne ${up ? 9 : 6} blocage. Soigne ${up ? 3 : 2} PV.`,
    play: (ctx) => {
      gainBlock(ctx.c, ctx.up ? 9 : 6);
      healPlayer(ctx.c, ctx.up ? 3 : 2);
    },
  },
  {
    id: 'bouclier_eau', name: 'Bouclier d\'eau', type: 'Pouvoir', rarity: 'peu_commune', cost: 1, needsTarget: false, icon: 'sang',
    text: (up) => `Les 2 premières fois que tu es attaqué chaque tour, soigne ${up ? 3 : 2} PV.`,
    play: (ctx) => powerCard(ctx, 'bouclier_eau', ctx.up ? 3 : 2, 'Bouclier d\'eau'),
  },
  totemCard('totem_source', 'source', 'Totem de source', 'peu_commune', (up) => `début de ton tour, soigne ${up ? 4 : 3} PV et ${up ? 2 : 1} blocage.`, (up) => (up ? 4 : 3), (up) => (up ? 2 : 1)),
  {
    id: 'rapidite_nature', name: 'Rapidité de la nature', type: 'Compétence', rarity: 'peu_commune', cost: 0, needsTarget: false, exhaust: true, exhaustUp: false, icon: 'pouvoir',
    text: (up) => `Ta prochaine carte ce tour-ci coûte 0.${up ? '' : ' Épuisé.'}`,
    play: (ctx) => {
      ctx.c.freeNext = true;
    },
  },
  {
    id: 'bouclier_terre', name: 'Bouclier de terre', type: 'Compétence', rarity: 'peu_commune', cost: 1, needsTarget: false, icon: 'bouclier',
    text: (up) => `Tes ${up ? 4 : 3} prochaines attaques reçues : soigne 3 PV et gagne 2 blocage.`,
    play: (ctx) => {
      ctx.c.earthShield = (ctx.c.earthShield ?? 0) + (ctx.up ? 4 : 3);
      fx(ctx.c, { kind: 'buff', who: 'player', label: 'Bouclier de terre' });
    },
  },
  {
    id: 'maree_montante', name: 'Marée montante', type: 'Pouvoir', rarity: 'rare', cost: 1, needsTarget: false, icon: 'sang',
    text: (up) => `Tes soins rendent +${up ? 5 : 3} PV.`,
    play: (ctx) => powerCard(ctx, 'maree_montante', ctx.up ? 5 : 3, 'Marée montante'),
  },
  {
    id: 'vigueur_ancestrale', name: 'Vigueur ancestrale', type: 'Pouvoir', rarity: 'rare', cost: 2, costUp: 1, needsTarget: false, icon: 'bouclier',
    text: () => 'Chaque fois que tu te soignes, gagne autant de blocage.',
    play: (ctx) => powerCard(ctx, 'vigueur_ancestrale', 1, 'Vigueur ancestrale'),
  },
  totemCard('totem_marees', 'marees', 'Totem des marées', 'epique', () => 'début de ton tour, +1 énergie. Tes soins +2 PV.', () => 2, undefined, 1, 0),
];

export const CHAMAN_CARDS: Record<string, CardDef> = Object.fromEntries(LIST.map((d) => [d.id, { ...d, classId: 'chaman' }]));
