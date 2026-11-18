// Les potions : des consommables à boire pendant son tour, sans dépenser d'énergie.
// Référence : docs/CONCEPT.md (§12.5)
import { drawCards, fx, gainBlock, livingEnemies, log, damageEnemy } from './actions';
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
  use?: (c: CombatState) => void;
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
    use: (c) => gainBlock(c, 14),
  },
  elixir_felin: {
    id: 'elixir_felin', name: 'Élixir du félin', rarity: 'commun', color: '#6fcf6a',
    text: 'Pioche 3 cartes.',
    use: (c) => drawCards(c, 3),
  },
  potion_rage: {
    id: 'potion_rage', name: 'Potion de rage', rarity: 'commun', color: '#f08a2a',
    text: 'Gagne 2 Puissance pour ce combat.',
    use: (c) => {
      c.player.puissance += 2;
      fx(c, { kind: 'buff', who: 'player', label: '+2 Puissance' });
    },
  },
  potion_explosive: {
    id: 'potion_explosive', name: 'Potion explosive', rarity: 'commun', color: '#f2d24a',
    text: '10 dégâts à tous les ennemis.',
    use: (c) => {
      for (const e of livingEnemies(c)) {
        if (e.submerged) continue;
        fx(c, { kind: 'tick', who: e.uid, amount: 10, label: 'Explosion' });
        damageEnemy(c, e, 10);
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
  potion_energie: {
    id: 'potion_energie', name: 'Potion d\'énergie', rarity: 'rare', color: '#4cc3e0',
    text: 'Gagne 2 énergie.',
    use: (c) => {
      c.player.energy += 2;
      fx(c, { kind: 'buff', who: 'player', label: '+2 énergie' });
    },
  },
};

export const POTION_IDS = Object.keys(POTIONS);

/** Applique une potion en combat. */
export function drinkInCombat(c: CombatState, id: string): void {
  const def = POTIONS[id];
  log(c, `Tu bois : ${def.name}.`);
  if (def.heal) {
    const healed = Math.min(def.heal, c.player.maxHp - c.player.hp);
    c.player.hp += healed;
    fx(c, { kind: 'heal', from: 'player', to: 'player', amount: healed });
  }
  def.use?.(c);
}
