// Les mécaniques du Druide : les quatre formes, la rage de l'Ours, le combo du Félin, les soins de la sève.
// Référence : docs/classes/DRUIDE.md (§2 et §3)
import { damageEnemy, fx, gainBlock, livingEnemies, log, power } from './actions';
import { random } from './rng';
import type { CombatState, EnemyState, FormId } from './types';

export const MAX_BEAR_RAGE = 10;
export const MAX_CAT_COMBO = 5;

export const FORMS: Record<FormId, { name: string; short: string; text: string }> = {
  normale: { name: 'Forme normale', short: 'Normale', text: 'Tes soins rendent +3 PV.' },
  ours: { name: 'Forme d\'ours', short: 'Ours', text: '+3 Robustesse. Rage : +1 quand tu es attaqué et à chaque Attaque d\'Ours.' },
  felin: { name: 'Forme de félin', short: 'Félin', text: 'Tes Attaques +2 dégâts. Points de combo (0 à 5).' },
  astrale: { name: 'Forme astrale', short: 'Astrale', text: 'Tes Sorts +3 dégâts. +1 Robustesse.' },
};
export const FORM_IDS = Object.keys(FORMS) as FormId[];

/** Un combat de Druide. */
export function isDruid(c: CombatState): boolean {
  return c.form !== undefined;
}

/** La Robustesse donnée par une forme (Cuir épais renforce l'Ours). */
function formRobustesse(c: CombatState, form: FormId): number {
  if (form === 'ours') return 3 + power(c, 'cuir_epais');
  if (form === 'astrale') return 1;
  return 0;
}

/** Ce que coûte le bouton de forme maintenant (0 : gratuit). */
export function shiftCost(c: CombatState): number {
  if (c.formStartFree && (c.cardsThisTurn ?? 0) === 0 && c.turn === 1) return 0;
  if (c.gear?.freeShiftAll) return 0; // Bâton du Veilleur (Druide)
  if (c.gear?.freeShift && !c.freeShiftUsed) return 0; // Métamorphose rapide
  return 1;
}

/** Peut-on changer de forme avec le bouton ? */
export function canShift(c: CombatState, form: FormId): boolean {
  if (!isDruid(c) || c.phase !== 'player' || c.form === form || c.rooted) return false;
  if ((c.player.debuffs?.lignee ?? 0) > 0) return false;
  return c.player.energy >= shiftCost(c);
}

/** Change de forme. `free` : une carte qui change de forme (Forme d'ours, Instinct sauvage…). */
export function enterForm(c: CombatState, form: FormId, free = true): boolean {
  if (!isDruid(c) || c.form === form) return false;
  if (!free) {
    if (!canShift(c, form)) return false;
    const startFree = c.formStartFree && (c.cardsThisTurn ?? 0) === 0 && c.turn === 1;
    const cost = shiftCost(c);
    if (cost === 0 && !startFree && !c.gear?.freeShiftAll) c.freeShiftUsed = true;
    c.player.energy -= cost;
  } else if (c.rooted || (c.player.debuffs?.lignee ?? 0) > 0) {
    return false;
  }
  setForm(c, form);
  return true;
}

/** Le changement de forme lui-même (sans condition) : la ressource perdue, la Robustesse de la forme, les talents. */
export function setForm(c: CombatState, form: FormId): void {
  c.formStartFree = false;
  // Quitter une forme fait perdre sa ressource (sauf avec Cœur sauvage).
  const keep = power(c, 'coeur_sauvage') > 0;
  if (!keep) {
    if (c.form === 'ours') c.bearRage = 0;
    if (c.form === 'felin') c.catCombo = 0;
  }
  c.player.robustesse -= c.formRobustesse ?? 0;
  c.form = form;
  c.formRobustesse = formRobustesse(c, form);
  c.player.robustesse += c.formRobustesse;
  if (form === 'ours' && c.gear?.bearEnterRage) gainBearRage(c, c.gear.bearEnterRage);
  if (form === 'felin' && c.gear?.catEnterCombo) gainCatCombo(c, c.gear.catEnterCombo);
  fx(c, { kind: 'buff', who: 'player', label: FORMS[form].name });
  log(c, `Tu prends la ${FORMS[form].name.toLowerCase()}.`);
}

/** Le premier changement de forme du combat est gratuit, avant de jouer une carte. */
export function druidStartCombat(c: CombatState): void {
  if (!isDruid(c)) return;
  c.formStartFree = true;
}

/** Cuir épais posé en forme d'Ours : la Robustesse suit tout de suite. */
export function refreshFormRobustesse(c: CombatState): void {
  if (!isDruid(c) || !c.form) return;
  const want = formRobustesse(c, c.form);
  c.player.robustesse += want - (c.formRobustesse ?? 0);
  c.formRobustesse = want;
}

// --- La rage de l'Ours et le combo du Félin ---

export function gainBearRage(c: CombatState, n: number): void {
  if (!isDruid(c) || n <= 0) return;
  const before = c.bearRage ?? 0;
  c.bearRage = Math.min(MAX_BEAR_RAGE, before + n);
  const gained = c.bearRage - before;
  // Instinct protecteur : chaque point de rage donne du blocage.
  if (gained > 0 && power(c, 'instinct_protecteur')) gainBlock(c, gained * power(c, 'instinct_protecteur'), false);
}

export function gainCatCombo(c: CombatState, n: number): void {
  if (!isDruid(c) || n <= 0) return;
  c.catCombo = Math.min(MAX_CAT_COMBO, (c.catCombo ?? 0) + n);
}

/** Un finisher [Félin] consomme tous les points de combo. */
export function spendCatCombo(c: CombatState): number {
  const n = c.catCombo ?? 0;
  c.catCombo = 0;
  return n;
}

// --- Les bonus de forme ---

/** Les bonus du Druide sur une Attaque ou un Sort de dégâts. */
export function druidDamageBonus(c: CombatState): number {
  if (!isDruid(c) || !c.playing) return 0;
  let n = 0;
  if (c.playing.type === 'Attaque') {
    if (c.form === 'felin') n += 2;
    n += c.tigerFury ?? 0;
    if (c.playing.form === 'ours' || c.playing.form === 'felin') n += c.gear?.feralBonus ?? 0;
    // Cœur sauvage : en Ours, les Attaques +3.
    if (c.form === 'ours' && power(c, 'coeur_sauvage')) n += 3;
  }
  if (c.playing.type === 'Sort') {
    if (c.form === 'astrale') n += 3 + power(c, 'puissance_astrale');
    if (c.playing.id === 'colere') n += c.gear?.wrathDruidBonus ?? 0;
  }
  return n;
}

/** Les multiplicateurs : Rôder (double l'Attaque), Éclipse (double le Sort lunaire). */
export function druidDamageMult(c: CombatState): number {
  if (!isDruid(c) || !c.playing) return 1;
  if (c.playing.type === 'Attaque' && c.prowl) return 2;
  if (c.playing.type === 'Sort' && c.eclipseLunar && LUNAR.has(c.playing.id)) return 2;
  return 1;
}

const LUNAR = new Set(['feu_de_lune', 'eclat_lunaire', 'rayon_lunaire']);

/** Après une carte du Druide : rage des Attaques d'Ours, Rôder, Éclipse, Grâce de la nature, Convergence céleste. */
export function afterDruidCard(c: CombatState, def: { type: string; id: string; form?: FormId }, cost: number, dealt: boolean): void {
  if (!isDruid(c)) return;
  if (def.type === 'Attaque') {
    if (c.form === 'ours' && def.form === 'ours') gainBearRage(c, 1);
    if (dealt) c.prowl = false;
  }
  if (def.type === 'Sort') {
    // Éclipse : l'alternance du soleil et de la lune.
    if (power(c, 'eclipse')) {
      if (def.id === 'feu_stellaire') {
        c.eclipseLunar = true;
        c.eclipseSolar = false;
      } else if (LUNAR.has(def.id)) {
        c.eclipseLunar = false;
        c.eclipseSolar = true;
      }
    }
    if (cost >= 2 && power(c, 'grace_nature')) gainBlock(c, power(c, 'grace_nature'), false);
    if (power(c, 'convergence') && c.phase === 'player') {
      for (const e of livingEnemies(c)) {
        if (e.submerged || c.phase !== 'player') continue;
        fx(c, { kind: 'tick', who: e.uid, amount: power(c, 'convergence'), label: 'Convergence' });
        damageEnemy(c, e, power(c, 'convergence'));
      }
    }
  }
}

/** Le surcoût d'une carte taguée jouée hors de sa forme, et les réductions du Druide. */
export function druidCostDelta(c: CombatState, id: string, form: FormId | undefined): number {
  if (!isDruid(c)) return 0;
  let d = form && c.form !== form ? 1 : 0;
  if (id === 'feu_stellaire') {
    if (c.eclipseSolar) d -= 1;
    if (c.gear?.starfireDiscount && !c.starfireUsed) d -= 1;
  }
  return d;
}

// --- Les soins ---

/** Le montant d'un soin du Druide : Forme normale (+3), Soins améliorés, Arbre de vie (+50 %). */
export function druidHealAmount(c: CombatState, base: number): number {
  let heal = base + (c.form === 'normale' ? 3 : 0) + (c.gear?.healBonus ?? 0);
  if (power(c, 'arbre_vie')) heal = Math.floor(heal * 1.5);
  return heal;
}

/** Après un soin : Arbre de vie (2 blocage), Harmonie (la moitié en blocage en forme normale), Symbiose (dégâts). */
export function druidOnHeal(c: CombatState, healed: number): void {
  if (!isDruid(c) || healed <= 0) return;
  if (power(c, 'arbre_vie')) gainBlock(c, 2, false);
  if (c.gear?.harmony && c.form === 'normale') gainBlock(c, Math.floor(healed / 2), false);
  const sym = power(c, 'symbiose');
  if (sym && c.phase === 'player') {
    const pool = livingEnemies(c).filter((e) => !e.submerged);
    if (pool.length > 0) {
      const t = pool[Math.floor(random(c) * pool.length)];
      fx(c, { kind: 'tick', who: t.uid, amount: sym, label: 'Symbiose' });
      damageEnemy(c, t, sym);
    }
  }
}

// --- Les tours ---

/** Au début de ton tour : la fin des effets d'un tour (Rôder, Fureur du tigre, Écorce…), puis Tranquillité.
 *  Renvoie les PV que Tranquillité soigne (le soin passe par healPlayer, dans combat.ts). */
export function druidStartTurn(c: CombatState): number {
  if (!isDruid(c)) return 0;
  c.freeShiftUsed = false;
  c.rooted = false;
  c.prowl = false;
  c.tigerFury = 0;
  c.barkskin = false;
  c.starfireUsed = false;
  let heal = power(c, 'esprit_foret'); // Esprit de la forêt
  if ((c.tranquility ?? 0) > 0) {
    c.tranquility! -= 1;
    gainBlock(c, 6, false);
    heal += 6;
  }
  return heal;
}

/** À la fin de ton tour : les Sylvains frappent ta cible. */
export function druidEndTurn(c: CombatState): void {
  // Les invocations temporaires (Sylvains du Druide, Esprits des loups du Chaman) frappent ta cible.
  summonsAct(c);
  if (!isDruid(c)) return;
  // Rage instinctive : en Ours, la rage protège pendant le tour ennemi.
  if (c.form === 'ours' && c.gear?.rageBlock && (c.bearRage ?? 0) > 0) gainBlock(c, c.bearRage! * c.gear.rageBlock, false);
}

function summonsAct(c: CombatState): void {
  if (!c.treants || c.treants.turns <= 0) return;
  const pool = livingEnemies(c).filter((e) => !e.submerged && !(e.buried ?? 0));
  const t = pool.find((e) => e.uid === c.lastTarget) ?? pool[0];
  for (let i = 0; i < c.treants.count && t && !t.dead && c.phase === 'player'; i++) {
    fx(c, { kind: 'tick', who: t.uid, amount: c.treants.dmg, label: c.treants.label ?? 'Sylvain' });
    damageEnemy(c, t, c.treants.dmg);
  }
  c.treants.turns -= 1;
}

/** Un ennemi t'attaque : la rage de l'Ours, les Épines. */
export function druidOnAttacked(c: CombatState, e: EnemyState, dmg: number): void {
  if (!isDruid(c) || dmg <= 0) return;
  if (c.form === 'ours') gainBearRage(c, 1);
  const thorns = power(c, 'epines_druide');
  if (thorns && !e.dead && c.phase === 'player') {
    fx(c, { kind: 'tick', who: e.uid, amount: thorns, label: 'Épines' });
    damageEnemy(c, e, thorns);
  }
}

/** Écorce : −30 % de dégâts subis jusqu'à ton prochain tour. */
export function druidDamageTaken(c: CombatState, dmg: number): number {
  return isDruid(c) && c.barkskin ? dmg * 0.7 : dmg;
}
