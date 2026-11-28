// Acte 3 : la Folie et les Hallucinations.
// Référence : docs/actes/ACTE3_IREM.md (§3)
// - Certains ennemis donnent de la Folie (Murmures, Regard, Vision du dieu…).
// - À 5 ou plus : au début de chacun de tes tours, 1 Hallucination arrive dans ta main.
// - À 10 : Crise de folie, tu perds ton prochain tour, puis la Folie retombe à 0.
// - Une Dissipation (Magie) retire 3 Folie. La Folie retombe à 0 à la fin de chaque combat (elle vit dans le combat).
import { CARDS } from './cards';
import { fx, log } from './actions';
import { random } from './rng';
import type { CombatState } from './types';

export const FOLIE_MAX = 10;
export const FOLIE_HALLUCINATION = 5;
export const FOLIE_DISPEL = 3;

/** Le joueur gagne de la Folie. */
export function gainFolie(c: CombatState, amount: number): void {
  if (amount <= 0) return;
  if (c.gear?.folieImmune) {
    log(c, 'Ton esprit reste clair : la Folie n\'a pas de prise sur toi.');
    return;
  }
  const n = Math.max(0, amount - (c.gear?.folieLess ?? 0));
  if (n === 0) return;
  c.folie = Math.min(FOLIE_MAX, (c.folie ?? 0) + n);
  fx(c, { kind: 'buff', who: 'player', label: `Folie +${n}` });
  if (c.folie >= FOLIE_MAX && !c.crisis) {
    c.crisis = true;
    fx(c, { kind: 'banner', text: 'Crise de folie !' });
    log(c, 'Ta Folie atteint 10 : Crise de folie, tu perdras ton prochain tour.');
  }
}

/** Une Dissipation (Magie) retire de la Folie. */
export function dispelFolie(c: CombatState): boolean {
  if (!c.folie) return false;
  c.folie = Math.max(0, c.folie - FOLIE_DISPEL);
  if (c.folie < FOLIE_MAX) c.crisis = false;
  log(c, `Tu chasses les murmures : −${FOLIE_DISPEL} Folie.`);
  return true;
}

/**
 * Une Hallucination arrive dans la main : elle a l'apparence d'une vraie carte du deck, et se glisse à une place
 * au hasard (pas toujours à droite), pour que rien ne la trahisse.
 */
export function addHallucination(c: CombatState): void {
  const pool = [...c.draw, ...c.discard, ...c.hand].filter((card) => CARDS[card.id].type !== 'Statut');
  if (pool.length === 0) return;
  const model = pool[Math.floor(random(c) * pool.length)];
  const card = { uid: c.nextUid++, id: 'hallucination', upgraded: model.upgraded, mimic: model.id };
  if (c.hand.length >= 10) c.discard.push(card);
  else c.hand.splice(Math.floor(random(c) * (c.hand.length + 1)), 0, card);
}

/**
 * Au début du tour du joueur (après la pioche). Renvoie true si le tour est perdu (Crise de folie).
 */
export function folieStartTurn(c: CombatState): boolean {
  if (c.crisis) {
    c.crisis = false;
    c.folie = 0;
    c.player.energy = 0;
    c.discard.push(...c.hand.filter((card) => card.id !== 'hallucination'));
    c.exhaust.push(...c.hand.filter((card) => card.id === 'hallucination'));
    c.hand = [];
    fx(c, { kind: 'banner', text: 'Crise de folie : tu perds ce tour' });
    log(c, 'Crise de folie : tu perds ce tour. Ta Folie retombe à 0.');
    return true;
  }
  if ((c.folie ?? 0) >= FOLIE_HALLUCINATION) {
    addHallucination(c);
    log(c, 'Les murmures d\'Yzhar brouillent ta vue : une Hallucination se glisse dans ta main.');
  }
  return false;
}
