// L'aperçu des dégâts d'une carte : on la joue sur une copie du combat et on mesure le résultat.
// Le moteur étant pur et sérialisable, la copie suit exactement les mêmes règles que le vrai coup
// (Puissance, posture, Armure fracassée, objets, talents…), sans rien toucher au vrai combat.
import { CARDS } from './cards';
import { canPlayCard, playCard, resolveTarget } from './combat';
import type { CombatState } from './types';

export interface EnemyPreview {
  uid: number;
  /** PV perdus. */
  hp: number;
  /** Blocage perdu. */
  block: number;
  /** Le coup l'achève. */
  kill: boolean;
}

export interface CardPreview {
  enemies: EnemyPreview[];
  /** Les coups portés par la carte (dégâts avant blocage), dans l'ordre. */
  hits: number[];
}

function simulate(c: CombatState, index: number, targetUid: number | undefined, rngShift = 0): CardPreview | null {
  const copy: CombatState = JSON.parse(JSON.stringify(c));
  copy.fx = [];
  copy.log = [];
  if (rngShift) copy.rng = (copy.rng ^ rngShift) >>> 0;
  if (!playCard(copy, index, targetUid)) return null;
  const enemies: EnemyPreview[] = [];
  for (const e of c.enemies) {
    if (e.dead) continue;
    const after = copy.enemies.find((x) => x.uid === e.uid);
    const hp = Math.max(0, e.hp - Math.max(0, after?.hp ?? 0));
    const block = Math.max(0, e.block - (after?.block ?? 0));
    const kill = !!after?.dead;
    if (hp > 0 || block > 0 || kill) enemies.push({ uid: e.uid, hp, block, kill });
  }
  const hits = (copy.fx ?? []).flatMap((f) => (f.kind === 'hit' && f.from === 'player' && f.to !== 'player' ? [f.amount] : []));
  return { enemies, hits };
}

const same = (a: CardPreview | null, b: CardPreview | null) => JSON.stringify(a?.enemies) === JSON.stringify(b?.enemies);

/**
 * Ce que ferait la carte `index` de la main sur chaque ennemi, jouée maintenant.
 * Pour une carte à cible, `targetUid` est la cible (facultatif s'il n'y en a qu'une).
 * null : la carte ne peut pas être jouée (ou pas sur cette cible), ou son effet dépend du hasard
 * (cibles au hasard, pioche…) : on n'annonce pas le résultat d'un tirage.
 */
export function previewCard(c: CombatState, index: number, targetUid?: number): CardPreview | null {
  if (!canPlayCard(c, index)) return null;
  const first = simulate(c, index, targetUid);
  if (!first) return null;
  // Le hasard : deux tirages différents doivent donner le même résultat.
  if (!same(first, simulate(c, index, targetUid, 0x9e3779b9))) return null;
  return first;
}

/**
 * La valeur d'un coup de la carte, pour corriger le chiffre de son texte (« Inflige 6 dégâts » → 8).
 * Les bonus propres à une cible (Armure fracassée, Vendetta, PV bas…) ne comptent que si la carte
 * n'a qu'une cible possible. null : pas de coup, ou des coups de valeurs différentes.
 */
export function cardHitValue(c: CombatState, index: number): number | null {
  const card = c.hand[index];
  if (!card || !canPlayCard(c, index)) return null;
  const def = CARDS[card.id];
  let state = c;
  const single = resolveTarget(c, true, undefined, def.type === 'Attaque');
  const alone = single !== 'invalid' && single !== null;
  if (!alone) {
    // Plusieurs ennemis : on retire ce qui dépend de la cible, pour un chiffre « neutre ».
    state = JSON.parse(JSON.stringify(c));
    for (const e of state.enemies) {
      e.buffs.armureFracassee = 0;
      e.buffs.peur = 0;
      e.vendetta = false;
      e.stun = 0;
      e.sap = 0;
      e.mouton = 0;
      e.elements = 0;
      e.hp = e.maxHp;
    }
  }
  let target: number | undefined;
  if (def.needsTarget) {
    const t = resolveTarget(state, true, alone ? undefined : firstTarget(state, def.type === 'Attaque'), def.type === 'Attaque');
    if (t === 'invalid' || t === null) return null;
    target = t.uid;
  }
  const sim = simulate(state, index, target);
  if (!sim || sim.hits.length === 0) return null;
  // Des dégâts tirés au hasard (« entre 4 et 16 ») : le texte reste tel quel.
  if (JSON.stringify(sim.hits) !== JSON.stringify(simulate(state, index, target, 0x9e3779b9)?.hits)) return null;
  return sim.hits.every((h) => h === sim.hits[0]) ? sim.hits[0] : null;
}

function firstTarget(c: CombatState, attack: boolean): number | undefined {
  return c.enemies.find((e) => !e.dead && !e.submerged && !e.untargetable && !(attack && e.flying))?.uid;
}
