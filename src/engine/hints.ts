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

/** Les cartes qui donnent des charges arcaniques (liste vérifiée par tests/mage.test.ts, qui joue chaque carte du Mage). */
export const CHARGE_CARDS = new Set(['projectiles_arcaniques', 'deflagration_arcanique', 'focalisation', 'flux_arcanique', 'rayon_arcanique', 'presence_esprit', 'esprit_vif']);

/**
 * Mage : la jauge des charges arcaniques ne s'affiche que si elle sert dans ce combat (27 novembre 2026).
 * Un Mage Feu ou Givre sans carte Arcane n'en gagne jamais : la jauge vide et sa Surcharge ne faisaient que gêner.
 */
export function chargesUseful(c: CombatState): boolean {
  if ((c.player.charges ?? 0) > 0 || (c.gear?.startCharges ?? 0) > 0) return true;
  return [c.hand, c.draw, c.discard, c.exhaust].some((pile) => pile.some((k) => CHARGE_CARDS.has(k.id)));
}
