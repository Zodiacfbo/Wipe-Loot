// Les mécaniques du Chaman : les totems (Terre, Feu, Eau, Air), les Armes élémentaires, la Résonance,
// les boucliers élémentaires et la Réincarnation.
// Référence : docs/classes/CHAMAN.md (§2 et §3)
import { damageEnemy, fx, gainBlock, healPlayer, livingEnemies, log, power } from './actions';
import { dispelPoison } from './pretre';
import { random } from './rng';
import type { CombatState, ElementId, EnemyState, Totem } from './types';

export const ELEMENTS: ElementId[] = ['terre', 'feu', 'eau', 'air'];
export const ELEMENT_NAME: Record<ElementId, string> = { terre: 'Terre', feu: 'Feu', eau: 'Eau', air: 'Air' };

export const TOTEMS: Record<string, { name: string; short: string; element: ElementId; text: (t: Totem) => string }> = {
  pierre: { name: 'Totem de pierre', short: 'Pierre', element: 'terre', text: (t) => `Début de ton tour : ${t.value} blocage.` },
  force: { name: 'Totem de force', short: 'Force', element: 'terre', text: (t) => `+${t.value} Puissance tant qu'il est en jeu.` },
  glebe: { name: 'Totem de glèbe', short: 'Glèbe', element: 'terre', text: (t) => `Début de ton tour : ${t.value} blocage (encore ${t.turns} tours).` },
  braise: { name: 'Totem de braise', short: 'Braise', element: 'feu', text: (t) => `Début de ton tour : ${t.value} dégâts à un ennemi au hasard.` },
  lave: { name: 'Totem de lave', short: 'Lave', element: 'feu', text: (t) => `Début de ton tour : ${t.value} dégâts à tous les ennemis.` },
  guerisseur: { name: 'Totem guérisseur', short: 'Soin', element: 'eau', text: (t) => `Début de ton tour : soigne ${t.value} PV.` },
  purification: { name: 'Totem de purification', short: 'Purif.', element: 'eau', text: (t) => (t.stacks ? `Début de ton tour : Dissipation de ${1 + t.stacks} Poisons ou Maladies.` : 'Début de ton tour : Dissipation d\'un Poison ou d\'une Maladie.') },
  source: { name: 'Totem de source', short: 'Source', element: 'eau', text: (t) => `Début de ton tour : soigne ${t.value} PV, ${t.value2} blocage.` },
  marees: { name: 'Totem des marées', short: 'Marées', element: 'eau', text: (t) => `Début de ton tour : +1 énergie. Tes soins +${t.value}.` },
  vents: { name: 'Totem des vents', short: 'Vents', element: 'air', text: (t) => `Tes Attaques +${t.value} dégâts.` },
  orage: { name: 'Totem de l\'orage', short: 'Orage', element: 'air', text: (t) => `Début de ton tour : ${t.value} dégâts au hasard. Tes Sorts +${t.value2}.` },
};

export const IMBUES: Record<string, { name: string; short: string; text: (w: { value: number; up: boolean }) => string }> = {
  flammes: { name: 'Arme de flammes', short: 'Flammes', text: (w) => `tes Attaques infligent +${w.value} dégâts.` },
  givre: { name: 'Arme de givre', short: 'Givre', text: (w) => `tes Attaques appliquent Ralenti 1 tour${w.up ? ' et Démoralisé 1 tour' : ''}.` },
  vents: { name: 'Arme des vents', short: 'Vents', text: () => 'ta première Attaque de chaque tour frappe une fois de plus.' },
};

/** Un combat de Chaman. */
export function isShaman(c: CombatState): boolean {
  return c.totems !== undefined;
}

export function totemAt(c: CombatState, el: ElementId): Totem | null {
  return c.totems?.[el] ?? null;
}

export function totemCount(c: CombatState): number {
  return ELEMENTS.filter((el) => totemAt(c, el)).length;
}

/** Résonance : l'effet bonus d'une carte quand un totem de cet élément est en jeu (Appel de la foudre : toujours pour l'Air). */
export function resonance(c: CombatState, el: ElementId): boolean {
  return !!totemAt(c, el) || (el === 'air' && power(c, 'appel_foudre') > 0);
}

/** Le bonus d'un totem selon son élément (talents). */
function totemBonus(c: CombatState, el: ElementId): number {
  const g = c.gear ?? {};
  return el === 'feu' ? g.fireTotemBonus ?? 0 : el === 'eau' ? g.waterTotemBonus ?? 0 : el === 'terre' ? g.earthTotemBonus ?? 0 : 0;
}

/** Retire un totem (et son effet permanent : le Totem de force). */
function removeTotem(c: CombatState, el: ElementId): void {
  const t = totemAt(c, el);
  if (!t || !c.totems) return;
  if (t.id === 'force') c.player.puissance -= t.value;
  c.totems[el] = null;
}

/** Renforts d'un même totem : 2 au plus, +50 % de ses valeurs chacun. */
export const TOTEM_MAX_STACKS = 2;
export const TOTEM_STACK_BONUS = 0.5;

/**
 * Pose un totem dans l'emplacement de son élément. Un autre totem est remplacé ;
 * le même totem est renforcé (+50 % de ses valeurs, 2 fois au plus) et sa durée repart.
 */
export function placeTotem(c: CombatState, id: string, value: number, value2?: number, turns?: number): void {
  const def = TOTEMS[id];
  const el = def.element;
  const old = totemAt(c, el);
  const stacks = old?.id === id ? Math.min(TOTEM_MAX_STACKS, (old.stacks ?? 0) + 1) : 0;
  const mult = 1 + TOTEM_STACK_BONUS * stacks;
  removeTotem(c, el);
  const t: Totem = {
    id,
    value: Math.round(value * mult) + (id === 'pierre' || id === 'glebe' ? totemBonus(c, el) : 0),
    value2: value2 === undefined ? undefined : Math.round(value2 * mult),
    turns,
  };
  if (stacks) t.stacks = stacks;
  (c.totems ??= {})[el] = t;
  if (id === 'force') c.player.puissance += t.value;
  fx(c, { kind: 'buff', who: 'player', label: stacks ? `${def.name} renforcé` : def.name });
  // Esprit combatif : poser un totem renforce la prochaine Attaque.
  if (power(c, 'esprit_combatif')) c.nextAttackBonus = (c.nextAttackBonus ?? 0) + power(c, 'esprit_combatif');
}

/** Retire tous les totems (Rappel totémique, Malédiction de lignée). Renvoie leur nombre. */
export function clearTotems(c: CombatState): number {
  let n = 0;
  for (const el of ELEMENTS) {
    if (totemAt(c, el)) {
      removeTotem(c, el);
      n++;
    }
  }
  return n;
}

function randomTarget(c: CombatState): EnemyState | null {
  const pool = livingEnemies(c).filter((e) => !e.submerged);
  return pool.length ? pool[Math.floor(random(c) * pool.length)] : null;
}

/**
 * Ce que fait un totem en jeu, avec les valeurs réelles (talents, objets, renforts) : la bulle de sa tuile.
 */
export function totemDescription(c: CombatState, el: ElementId): string | null {
  const t = totemAt(c, el);
  if (!t) return null;
  const bonus = totemBonus(c, el);
  const ally = c.gear?.allyBonus ?? 0;
  const shown: Totem = { ...t };
  if (t.id === 'braise' || t.id === 'lave') shown.value = t.value + bonus + ally;
  if (t.id === 'orage') shown.value = t.value + ally;
  if (t.id === 'guerisseur' || t.id === 'source') shown.value = t.value + bonus;
  if (t.id === 'source') shown.value2 = (t.value2 ?? 1) + bonus;
  const parts = [`${t.stacks ? `Renforcé ${t.stacks} fois. ` : ''}${TOTEMS[t.id].text(shown)}`];
  if ((c.gear?.marteauAncetres ?? 0) > 0 && !['force', 'vents'].includes(t.id)) parts.push('Il agit deux fois (Marteau des ancêtres).');
  parts.push(t.stacks === TOTEM_MAX_STACKS ? 'Renfort au maximum.' : 'Reposer le même totem le renforce (+50 %).');
  return parts.join(' ');
}

/** Un totem agit (au début de ton tour). */
function totemAct(c: CombatState, el: ElementId, t: Totem): void {
  const bonus = totemBonus(c, el);
  const ally = c.gear?.allyBonus ?? 0;
  switch (t.id) {
    case 'pierre':
    case 'glebe':
      gainBlock(c, t.value, false);
      break;
    case 'braise':
    case 'orage': {
      const target = randomTarget(c);
      if (!target) break;
      const dmg = t.value + (t.id === 'braise' ? bonus : 0) + ally;
      fx(c, { kind: 'tick', who: target.uid, amount: dmg, label: TOTEMS[t.id].name });
      damageEnemy(c, target, dmg);
      break;
    }
    case 'lave':
      for (const e of livingEnemies(c)) {
        if (e.submerged || c.phase !== 'player') continue;
        fx(c, { kind: 'tick', who: e.uid, amount: t.value + bonus + ally, label: 'Totem de lave' });
        damageEnemy(c, e, t.value + bonus + ally);
      }
      break;
    case 'guerisseur':
      healPlayer(c, t.value + bonus);
      break;
    case 'source':
      healPlayer(c, t.value + bonus);
      gainBlock(c, (t.value2 ?? 1) + bonus, false);
      break;
    case 'purification':
      for (let i = 0; i <= (t.stacks ?? 0); i++) dispelPoison(c);
      break;
    case 'marees':
      c.player.energy += 1;
      break;
  }
}

/** Au début de ton tour : les totems agissent (deux fois avec le Marteau des ancêtres), les totems temporaires s'usent. */
export function totemsAct(c: CombatState): void {
  if (!isShaman(c)) return;
  // Rayon oculaire d'Yzhar : les totems sont étourdis.
  if ((c.petStunned ?? 0) > 0) {
    c.petStunned! -= 1;
    log(c, 'Tes totems sont étourdis et ne font rien.');
    return;
  }
  const times = 1 + (c.gear?.marteauAncetres ?? 0);
  for (const el of ELEMENTS) {
    const t = totemAt(c, el);
    if (!t) continue;
    for (let i = 0; i < times && c.phase === 'player'; i++) totemAct(c, el, t);
    if (t.turns !== undefined) {
      t.turns -= 1;
      if (t.turns <= 0) removeTotem(c, el);
    }
  }
}

/** Avant la pioche : Cri des ancêtres, les boucliers se rechargent, Frappe d'orage s'use, les Orbes de foudre éclatent.
 *  Renvoie les cartes en plus à piocher. */
export function shamanStartTurn(c: CombatState): number {
  if (!isShaman(c)) return 0;
  c.shieldHits = 0;
  if (c.turn > 1 && (c.stormstrike ?? 0) > 0) c.stormstrike! -= 1;
  for (const o of c.orbs ?? []) {
    const t = livingEnemies(c).find((e) => e.uid === o.uid && !e.submerged) ?? randomTarget(c);
    if (!t || c.phase !== 'player') continue;
    fx(c, { kind: 'tick', who: t.uid, amount: o.dmg, label: 'Orbe de foudre' });
    damageEnemy(c, t, o.dmg);
  }
  c.orbs = [];
  if ((c.manaTide ?? 0) > 0 && c.turn > 1) {
    c.manaTide! -= 1;
    c.player.energy += 1;
  }
  if (c.ancestorsNext) {
    c.ancestorsNext = false;
    c.player.energy += 1;
    return 1;
  }
  return 0;
}

/** Au début du combat : Tempête naissante (un Totem des vents), Esprit des marées (géré par startBlock). */
export function shamanStartCombat(c: CombatState): void {
  if (!isShaman(c)) return;
  if (c.gear?.startWindTotem) placeTotem(c, 'vents', 2);
}

// --- Les Armes élémentaires ---

export function setImbue(c: CombatState, id: string, value: number, up: boolean): void {
  const list = (c.imbues ??= []).filter((w) => w.id !== id);
  const max = c.gear?.doubleImbue ? 2 : 1;
  while (list.length >= max) list.shift();
  list.push({ id, value: value + (c.gear?.imbueBonus ?? 0), up });
  c.imbues = list;
  fx(c, { kind: 'buff', who: 'player', label: IMBUES[id].name });
}

export function imbue(c: CombatState, id: string): { id: string; value: number; up: boolean } | undefined {
  return c.imbues?.find((w) => w.id === id);
}

/** Combien de fois en plus l'Attaque est jouée (Arme des vents : la première Attaque du tour). */
export function windfuryExtra(c: CombatState, attack: boolean): number {
  if (!attack || !imbue(c, 'vents') || (c.attacksThisTurn ?? 0) > 0) return 0;
  return 1 + (c.gear?.windfuryBonus ?? 0);
}

// --- Les bonus de dégâts ---

/** Les bonus du Chaman : Totem des vents et Arme de flammes (Attaques) ; Totem de l'orage, Fureur élémentaire, Frappe d'orage (Sorts). */
export function shamanDamageBonus(c: CombatState): number {
  if (!isShaman(c) || !c.playing) return 0;
  let n = 0;
  if (c.playing.type === 'Attaque') {
    const v = totemAt(c, 'air');
    if (v?.id === 'vents') n += v.value;
    n += imbue(c, 'flammes')?.value ?? 0;
    n += c.nextAttackBonus ?? 0;
  }
  if (c.playing.type === 'Sort') {
    const o = totemAt(c, 'air');
    if (o?.id === 'orage') n += o.value2 ?? 0;
    if (totemCount(c) >= 3) n += power(c, 'fureur_elementaire');
    if ((c.stormstrike ?? 0) > 0) n += 4;
    if (c.playing.id === 'eclair') n += c.gear?.lightningBonus ?? 0;
  }
  return n;
}

/** Après une carte du Chaman : Arme de givre, Esprit combatif, Arme tourbillonnante, Concentration élémentaire, Avatar de la tempête. */
export function afterShamanCard(c: CombatState, def: { type: string; id: string }, cost: number, target: EnemyState | null, dealt: boolean): void {
  if (!isShaman(c)) return;
  if (def.type === 'Attaque') {
    c.nextAttackBonus = 0;
    const frost = imbue(c, 'givre');
    if (frost && dealt && target && !target.dead) {
      const turns = 1 + (c.gear?.imbueBonus ? 1 : 0);
      target.buffs.ralenti = Math.max(target.buffs.ralenti, turns);
      if (frost.up) target.buffs.demoralise = Math.max(target.buffs.demoralise, 1);
    }
    if (power(c, 'arme_tourbillonnante')) {
      c.maelstrom = Math.min(5, (c.maelstrom ?? 0) + 1);
      if (c.maelstrom >= 5) {
        c.maelstrom = 0;
        c.freeNextSpell = true;
        fx(c, { kind: 'buff', who: 'player', label: 'Arme tourbillonnante' });
      }
    }
  }
  if (def.type === 'Sort') {
    c.clearcast = cost >= 2 && power(c, 'concentration_elementaire') > 0;
    const avatar = power(c, 'avatar_tempete');
    if (avatar && c.phase === 'player') {
      const t = randomTarget(c);
      if (t) {
        fx(c, { kind: 'tick', who: t.uid, amount: avatar, label: 'Éclair' });
        damageEnemy(c, t, avatar);
      }
    }
  }
}

/** Concentration élémentaire : le prochain Sort coûte 1 de moins. */
export function shamanCostDelta(c: CombatState, type: string): number {
  return isShaman(c) && type === 'Sort' && c.clearcast ? -1 : 0;
}

// --- Les soins ---

export function shamanHealAmount(c: CombatState, base: number): number {
  const m = totemAt(c, 'eau');
  return base + (c.gear?.healBonus ?? 0) + power(c, 'maree_montante') + (m?.id === 'marees' ? m.value : 0);
}

/** Vigueur ancestrale : chaque soin donne autant de blocage. */
export function shamanOnHeal(c: CombatState, healed: number): void {
  if (isShaman(c) && healed > 0 && power(c, 'vigueur_ancestrale')) gainBlock(c, healed, false);
}

// --- Quand un ennemi attaque ---

/** Bouclier de foudre (3 premiers coups), Bouclier d'eau (2 premiers coups), Bouclier de terre (charges). */
export function shamanOnAttacked(c: CombatState, e: EnemyState, dmg: number): void {
  if (!isShaman(c) || dmg <= 0) return;
  c.shieldHits = (c.shieldHits ?? 0) + 1;
  const lightning = power(c, 'bouclier_foudre');
  if (lightning && c.shieldHits <= 3 && !e.dead && c.phase === 'player') {
    fx(c, { kind: 'tick', who: e.uid, amount: lightning, label: 'Bouclier de foudre' });
    damageEnemy(c, e, lightning);
  }
  const water = power(c, 'bouclier_eau');
  if (water && c.shieldHits <= 2) healPlayer(c, water);
  if ((c.earthShield ?? 0) > 0) {
    c.earthShield! -= 1;
    healPlayer(c, 3);
    gainBlock(c, 2, false);
  }
}

/** La Réincarnation : une fois par run, à 0 PV, tu reviens à 40 % (60 % avec le talent) de tes PV max. */
export function reincarnate(c: CombatState): boolean {
  if (!c.ankh || c.player.hp > 0) return false;
  c.ankh = false;
  c.ankhUsed = true;
  c.player.hp = Math.max(1, Math.floor(c.player.maxHp * (c.gear?.ankhBetter ? 0.6 : 0.4)));
  fx(c, { kind: 'banner', text: 'Réincarnation !' });
  log(c, 'Les esprits des ancêtres te renvoient parmi les vivants.');
  return true;
}
