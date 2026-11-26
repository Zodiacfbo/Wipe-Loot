// Les mécaniques du Voleur : les points de combo, le Camouflage, les Poisons et le contrôle.
// Référence : docs/classes/VOLEUR.md (§2 et §3)
import { damageEnemy, fx, isBossEnemy, livingEnemies, log, power } from './actions';
import { isInterruptible } from './enemies';
import type { CombatState, EnemyState } from './types';

export const MAX_COMBO = 5;

/** Le combat est-il celui d'un Voleur ? */
export function isRogue(c: CombatState): boolean {
  return c.combo !== undefined;
}

/** Gagne des points de combo (0 à 5 ; le surplus est perdu). La Malédiction de lignée les bloque. */
export function gainCombo(c: CombatState, n: number): void {
  if (c.combo === undefined || n <= 0) return;
  if ((c.player.debuffs?.lignee ?? 0) > 0) return;
  c.combo = Math.min(MAX_COMBO, c.combo + n);
}

/** Le Voleur est-il Camouflé (ou sa prochaine Attaque profite-t-elle de Bond de l'ombre) ? */
export function stealthed(c: CombatState, attack = true): boolean {
  return !!c.stealth || (attack && !!c.shadowStep);
}

/** Le Voleur redevient Camouflé pendant `turns` tours (celui-ci compris). */
export function enterStealth(c: CombatState, turns = 1): void {
  if (c.combo === undefined) return;
  if (!c.stealth) fx(c, { kind: 'buff', who: 'player', label: 'Camouflé' });
  c.stealth = true;
  c.stealthTurns = Math.max(c.stealthTurns ?? 0, turns);
}

export function breakStealth(c: CombatState): void {
  if (c.stealth) log(c, 'Tu sors de l\'ombre.');
  c.stealth = false;
  c.stealthTurns = 0;
}

/** Applique du Poison à un ennemi (Poison renforcé : +1 à chaque application). */
export function applyPoison(c: CombatState, e: EnemyState, n: number): void {
  if (e.dead || e.submerged || n <= 0) return;
  e.buffs.poison = (e.buffs.poison ?? 0) + n + (c.gear?.poisonBonus ?? 0);
}

/** Une Attaque du Voleur touche : le Poison de la cible fait des dégâts, puis le Poison d'arme s'applique. */
export function onRogueHit(c: CombatState, t: EnemyState): void {
  if (t.dead || t.submerged) return;
  const poison = t.buffs.poison ?? 0;
  if (poison > 0) {
    fx(c, { kind: 'tick', who: t.uid, amount: poison, label: 'Poison' });
    damageEnemy(c, t, poison, true);
    if (t.dead) return;
  }
  const w = c.weaponPoison;
  const add = (w?.amount ?? 0) + (t.vendetta ? 2 : 0);
  if (add > 0) applyPoison(c, t, add);
  // Poison affaiblissant : la cible est Démoralisée.
  if (w?.id === 'affaiblissant') t.buffs.demoralise = Math.max(t.buffs.demoralise, 1);
  // Poison engourdissant : l'Incantation en cours est retardée (une fois par tour).
  if (w?.id === 'engourdissant' && !c.numbUsed && delayCast(c, t)) c.numbUsed = true;
}

/** Retarde d'un tour l'Incantation en cours (sauf les Incantations impossibles à interrompre). */
export function delayCast(c: CombatState, t: EnemyState): boolean {
  if (t.dead || !t.intent.cast || t.delayed || t.interrupted || !isInterruptible(t.intent)) return false;
  t.delayed = true;
  fx(c, { kind: 'buff', who: t.uid, label: 'Incantation retardée' });
  log(c, `${t.name} perd le fil : son incantation est retardée d'un tour.`);
  return true;
}

/** Contrôlé : un ennemi normal ne fait rien pendant ce nombre de tours (sans effet sur un boss). */
export function stun(c: CombatState, t: EnemyState, turns: number): boolean {
  if (t.dead || isBossEnemy(t) || turns <= 0) return false;
  t.stun = Math.max(t.stun ?? 0, turns);
  fx(c, { kind: 'buff', who: t.uid, label: 'Contrôlé' });
  return true;
}

/** Le Poison diminue à la fin du tour de l'ennemi (sauf avec Lames empoisonnées). */
export function decayPoison(c: CombatState, e: EnemyState): void {
  if ((e.buffs.poison ?? 0) > 0 && !power(c, 'lames_empoisonnees')) e.buffs.poison! -= 1;
}

/** Toxines virulentes : le Poison d'un ennemi mort passe à un autre. */
export function rogueOnDeath(c: CombatState, dead: EnemyState): void {
  const poison = dead.buffs.poison ?? 0;
  if (poison <= 0 || !power(c, 'toxines_virulentes')) return;
  const next = livingEnemies(c).find((e) => e !== dead && !e.submerged);
  if (!next) return;
  next.buffs.poison = (next.buffs.poison ?? 0) + poison;
  fx(c, { kind: 'buff', who: next.uid, label: `Poison ${poison}` });
}

/** Sillon d'orage : toutes les 3 Attaques, un éclair frappe tous les ennemis. */
export function stormStrike(c: CombatState): void {
  if (!c.gear?.stormblade) return;
  c.stormCount = (c.stormCount ?? 0) + 1;
  if (c.stormCount % 3 !== 0) return;
  for (const e of livingEnemies(c)) {
    if (e.submerged || c.phase !== 'player') continue;
    fx(c, { kind: 'tick', who: e.uid, amount: 6, label: 'Sillon d\'orage' });
    damageEnemy(c, e, 6);
  }
}
