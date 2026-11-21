// Les « bons coups » : une carte de la main dont la condition est remplie brille (finisher à 5 combo,
// Ouverture quand tu es Camouflé, Exécution sur une cible affaiblie, Fracasser sur une cible gelée…).
// Pur et sans DOM : l'interface ne fait qu'afficher la lueur.
import { CARDS, energyCost } from './cards';
import { isInterruptible } from './enemies';
import type { CombatState, EnemyState } from './types';

const living = (c: CombatState): EnemyState[] => c.enemies.filter((e) => !e.dead && !e.submerged);
const below = (c: CombatState, pct: number) => living(c).some((e) => e.hp > 0 && e.hp <= e.maxHp * pct / 100);

/** La carte `index` de la main a-t-elle sa condition remplie ? (Seulement si elle se joue.) */
export function cardReady(c: CombatState, index: number): boolean {
  const card = c.hand[index];
  if (!card || c.phase !== 'player') return false;
  const def = CARDS[card.id];
  if (def.unplayable || energyCost(c, card.id, card.upgraded) > c.player.energy) return false;
  const text = def.text(card.upgraded, c.gear ?? {});
  // Voleur
  if (def.finisher) return (c.combo ?? 0) >= 5;
  if (def.opener) return !!c.stealth || !!c.shadowStep;
  // Les cartes qui achèvent : Exécution, Coup au cœur, Marteau du châtiment.
  if (card.id === 'execution') return c.player.rage > 0 && (!!c.gear?.executeAlways || below(c, c.gear?.executeThreshold ?? 30));
  if (card.id === 'coup_au_coeur') return below(c, 30);
  if (card.id === 'marteau_chatiment') return below(c, 20);
  // Mage : Fracasser sur une cible qui a 3 Gel ou plus, ou qui est Gelée.
  if (/Fracasser/.test(text)) return living(c).some((e) => (e.buffs.gel ?? 0) >= 3 || !!e.gele);
  // Une incantation à couper : les cartes qui interrompent, et Siphon de mana.
  if (/Interruption|Incantation/.test(text) && !/ta prochaine|tes Attaques/i.test(text)) {
    return living(c).some((e) => isInterruptible(e.intent) && !e.interrupted);
  }
  return false;
}
