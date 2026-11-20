// Les mécaniques du Prêtre : l'Égide, la Foi, les dissipations et la Forme d'Ombre.
// Référence : docs/classes/PRETRE.md (§2 et §3)
import { damageEnemy, drawCards, fx, livingEnemies, log, power } from './actions';
import { random } from './rng';
import { dispelFolie } from './folie';
import type { CombatState } from './types';

export const BASE_AEGIS = 30;
export const BASE_FAITH = 10;

/** Le Prêtre gagne de l'Égide (plafonnée). `fromCard` : la carte compte pour la Foi, et Égide améliorée s'applique. */
export function gainAegis(c: CombatState, amount: number, fromCard = true): void {
  if (c.aegis === undefined || amount <= 0) return;
  const bonus = fromCard ? c.gear?.aegisBonus ?? 0 : 0;
  const before = c.aegis;
  c.aegis = Math.min(c.maxAegis ?? BASE_AEGIS, c.aegis + amount + bonus);
  if (c.aegis > before) fx(c, { kind: 'buff', who: 'player', label: `Égide +${c.aegis - before}` });
  if (fromCard) c.healedFlag = true;
}

/** Le Prêtre gagne de la Foi (pas en Forme d'Ombre). Chant de lumière : chaque gain frappe un ennemi. */
export function gainFaith(c: CombatState, n: number): void {
  if (c.faith === undefined || n <= 0 || c.shadowForm) return;
  const before = c.faith;
  c.faith = Math.min(c.maxFaith ?? BASE_FAITH, c.faith + n);
  const chant = power(c, 'chant_lumiere');
  if (chant && c.faith > before) {
    const pool = livingEnemies(c).filter((e) => !e.submerged);
    if (pool.length > 0) {
      const t = pool[Math.floor(random(c) * pool.length)];
      fx(c, { kind: 'tick', who: t.uid, amount: chant, label: 'Chant de lumière' });
      damageEnemy(c, t, chant);
    }
  }
}

/** Bague de l'esprit clair : une Dissipation pioche (une seule fois pour Lumière purificatrice). */
let dispelling = false;
export function dispelDraw(c: CombatState, fn: () => void): void {
  const outer = !dispelling;
  dispelling = true;
  try {
    fn();
  } finally {
    if (outer) dispelling = false;
  }
  if (outer && c.gear?.dispelDraw) drawCards(c, c.gear.dispelDraw);
}

/** Dissipation (Magie) : les malédictions des ennemis. */
export function dispelMagic(c: CombatState): boolean {
  let done = false;
  dispelDraw(c, () => (done = dispelMagicInner(c)));
  return done;
}

function dispelMagicInner(c: CombatState): boolean {
  const d = c.player.debuffs;
  if (!d) return false;
  const any = d.demoralise > 0 || d.impie > 0 || d.arcane > 0 || d.manaBurn > 0 || d.panic > 0 || (d.lignee ?? 0) > 0 || (d.fracasse ?? 0) > 0;
  Object.assign(d, { demoralise: 0, impie: 0, arcane: 0, manaBurn: 0, panic: 0, lignee: 0, fracasse: 0 });
  d.afflictions = (d.afflictions ?? []).filter((a) => a !== 'rouge' && a !== 'bleue');
  if (any) log(c, 'Tu dissipes la magie qui pèse sur toi.');
  // Acte 3 : la Dissipation (Magie) chasse aussi la Folie.
  return dispelFolie(c) || any;
}

/** Dissipation (Maladie et Poison) : Toxine, Peste, et les Afflictions verte et noire. */
export function dispelPoison(c: CombatState): boolean {
  let done = false;
  dispelDraw(c, () => (done = dispelPoisonInner(c)));
  return done;
}

function dispelPoisonInner(c: CombatState): boolean {
  const d = c.player.debuffs;
  if (!d) return false;
  const any = (d.toxine ?? 0) > 0 || (d.peste ?? 0) > 0;
  d.toxine = 0;
  d.peste = 0;
  d.afflictions = (d.afflictions ?? []).filter((a) => a !== 'verte' && a !== 'noire');
  if (any) log(c, 'Tu purifies ton sang.');
  return any;
}

/** L'Égide absorbe des dégâts (après le blocage). Renvoie ce qui reste. */
export function absorbAegis(c: CombatState, amount: number): number {
  if (!c.aegis || amount <= 0) return amount;
  const taken = Math.min(c.aegis, amount);
  c.aegis -= taken;
  // Esprit martyr : l'Égide entièrement détruite fait piocher.
  if (c.aegis === 0 && c.gear?.martyr) drawCards(c, c.gear.martyr);
  return amount - taken;
}
