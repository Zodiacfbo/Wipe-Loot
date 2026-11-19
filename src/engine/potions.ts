// Les potions : des consommables à boire pendant son tour, sans dépenser d'énergie.
// Référence : docs/CONCEPT.md (§12.5)
import { drawCards, fx, gainBlock, healPlayer, livingEnemies, log, damageEnemy } from './actions';
import type { CombatState } from './types';

export const POTION_SLOTS = 3;

export interface PotionDef {
  id: string;
  name: string;
  rarity: 'commun' | 'rare';
  text: string;
  /** Couleur du liquide (icône). */
  color: string;
  /** Soin : ces potions se boivent aussi hors combat. */
  heal?: number;
  /** Effet en combat (en plus du soin éventuel). */
  use?: (c: CombatState, m: number) => void;
}

export const POTIONS: Record<string, PotionDef> = {
  potion_soins: {
    id: 'potion_soins', name: 'Potion de soins', rarity: 'commun', color: '#e0503c', heal: 20,
    text: 'Soigne 20 PV. Se boit aussi hors combat.',
  },
  potion_soins_majeure: {
    id: 'potion_soins_majeure', name: 'Potion de soins majeure', rarity: 'rare', color: '#ff7a8a', heal: 35,
    text: 'Soigne 35 PV. Se boit aussi hors combat.',
  },
  flacon_colosse: {
    id: 'flacon_colosse', name: 'Flacon du colosse', rarity: 'commun', color: '#9aa8b8',
    text: 'Gagne 14 blocage.',
    use: (c, m) => gainBlock(c, Math.round(14 * m)),
  },
  elixir_felin: {
    id: 'elixir_felin', name: 'Élixir du félin', rarity: 'commun', color: '#6fcf6a',
    text: 'Pioche 3 cartes.',
    use: (c, m) => drawCards(c, Math.round(3 * m)),
  },
  potion_rage: {
    id: 'potion_rage', name: 'Potion de force', rarity: 'commun', color: '#f08a2a',
    text: 'Gagne 2 Puissance pour ce combat.',
    use: (c, m) => {
      const n = Math.round(2 * m);
      c.player.puissance += n;
      fx(c, { kind: 'buff', who: 'player', label: `+${n} Puissance` });
    },
  },
  potion_explosive: {
    id: 'potion_explosive', name: 'Potion explosive', rarity: 'commun', color: '#f2d24a',
    text: '10 dégâts à tous les ennemis.',
    use: (c, m) => {
      const dmg = Math.round(10 * m);
      for (const e of livingEnemies(c)) {
        if (e.submerged) continue;
        fx(c, { kind: 'tick', who: e.uid, amount: dmg, label: 'Explosion' });
        damageEnemy(c, e, dmg);
      }
    },
  },
  potion_protection_feu: {
    id: 'potion_protection_feu', name: 'Potion de protection contre le feu', rarity: 'commun', color: '#b07ae8',
    text: 'Les Zones de feu ne t\'infligent plus de dégâts pendant ce combat.',
    use: (c) => {
      c.fireProof = true;
      fx(c, { kind: 'buff', who: 'player', label: 'Protégé du feu' });
    },
  },
  potion_purification: {
    id: 'potion_purification', name: 'Potion de purification', rarity: 'commun', color: '#E0F0FF',
    text: 'Dissipe toutes tes malédictions (Démoralisé, Impie, cartes Paniquées…) et retire les Fardeaux de ta main.',
    use: (c) => {
      const d = c.player.debuffs;
      // Toutes les malédictions et les poisons ; l'Affliction bronze ne se dissipe pas.
      if (d) Object.assign(d, { demoralise: 0, impie: 0, arcane: 0, manaBurn: 0, panic: 0, toxine: 0, peste: 0, fracasse: 0, lignee: 0, afflictions: d.afflictions?.filter((a) => a === 'bronze') ?? [] });
      c.panicked = [];
      const curses = c.hand.filter((card) => card.id === 'fardeau' || card.id === 'malediction');
      c.hand = c.hand.filter((card) => !curses.includes(card));
      c.exhaust.push(...curses);
      fx(c, { kind: 'buff', who: 'player', label: 'Purifié' });
    },
  },
  potion_energie: {
    id: 'potion_energie', name: 'Potion d\'énergie', rarity: 'rare', color: '#4cc3e0',
    text: 'Gagne 2 énergie.',
    use: (c, m) => {
      c.player.energy += Math.round(2 * m);
      fx(c, { kind: 'buff', who: 'player', label: '+2 énergie' });
    },
  },
};

export const POTION_IDS = Object.keys(POTIONS);

/** Applique une potion en combat. */
export function drinkInCombat(c: CombatState, id: string): void {
  const def = POTIONS[id];
  log(c, `Tu bois : ${def.name}.`);
  // Lunettes de l'alchimiste : les potions sont plus fortes.
  const m = 1 + (c.gear?.potionBoost ?? 0) / 100;
  if (def.heal) {
    const healed = healPlayer(c, Math.round(def.heal * m));
    fx(c, { kind: 'heal', from: 'player', to: 'player', amount: healed });
  }
  def.use?.(c, m);
}
