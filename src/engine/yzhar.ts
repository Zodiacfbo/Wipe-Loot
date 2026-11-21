// Acte 3 : Yzhar, le Dieu dormant (le boss final d'Irem).
// Référence : docs/actes/ACTE3_IREM.md (§7)
// - Pendant tout le combat : 1 Folie au début de chacun de ses tours.
// - Phase 1, l'Œil (200 PV) : Rayon oculaire (il rebondit sur ton familier, étourdi 1 tour), Regard sombre
//   (3 tours : des dégâts à la fin de ton tour si tu ne joues pas « Se mettre à couvert »),
//   un Tentacule oculaire tous les 2 tours. Quand l'Œil se ferme, ses Tentacules aussi, et le Corps se réveille.
// - Phase 2, le Corps : Carapace divine (dégâts réduits), Tentacule géant tous les 2 tours,
//   et Avaler : 2 tours dans ses entrailles (3 cartes, pas de sorts de barre, Sucs digestifs, 2 Tentacules
//   intérieurs). Les tuer tous les deux fait tomber la Carapace 3 tours à la sortie : double dégâts.
import { addStatusToHand, damagePlayer, fx, livingEnemies, log, makeEnemy } from './actions';
import { ENEMIES, intentAt } from './enemies';
import { YZHAR } from './enemies_acte3';
import { gainFolie } from './folie';
import type { CombatState, EnemyState } from './types';

export const isYzhar = (e: EnemyState): boolean => e.defId === 'yzhar';

/** La Carapace divine du Corps : 25 % des dégâts, ou double dégâts quand elle est tombée. */
export function carapaceDamage(c: CombatState, target: EnemyState, amount: number): number {
  if (!isYzhar(target) || (target.phase ?? 1) < 2) return amount;
  if ((c.carapaceDown ?? 0) > 0) return amount * YZHAR.carapaceDownMult;
  // Ce qui ronge de l'intérieur (Brûlure, Saignement, DoT, Censure) passe sous la Carapace.
  if (c.dotTicking) return amount;
  return Math.max(amount > 0 ? 1 : 0, Math.floor(amount * YZHAR.carapace));
}

/** L'Œil tombe à 0 PV : il se referme, et le Corps se réveille (les Tentacules restent). Renvoie true si c'est le cas. */
export function yzharAwakens(c: CombatState, e: EnemyState): boolean {
  if (!isYzhar(e) || (e.phase ?? 1) !== 1 || e.hp > 0) return false;
  e.phase = 2;
  e.name = 'Le Corps d\'Yzhar';
  e.maxHp = e.hp = Math.round(YZHAR.bodyHp * (c.mods?.bossHp ?? 1));
  e.block = 0;
  e.step = 0;
  e.intent = intentAt(ENEMIES.yzhar, 0, 2);
  e.interrupted = false;
  e.delayed = false;
  e.buffs.brulure = 0;
  e.buffs.saignement = 0;
  e.buffs.saignementTours = 0;
  e.dots = [];
  c.regard = 0;
  // Les Tentacules oculaires sont les yeux de l'Œil : ils se ferment avec lui.
  for (const t of c.enemies.filter((o) => o.defId === 'tentacule' && !o.dead)) {
    t.dead = true;
    t.gone = true;
    fx(c, { kind: 'death', who: t.uid });
  }
  fx(c, { kind: 'banner', text: 'L\'Œil se ferme… le Corps d\'Yzhar se réveille !' });
  log(c, `« Tu… es… déjà… à moi. » L'Œil se referme, ses Tentacules avec lui, et le Corps d'Yzhar s'arrache au sable. Sa Carapace divine le protège : ${Math.round(100 * (1 - YZHAR.carapace))} % de dégâts en moins.`);
  return true;
}

/** Au début du tour d'Yzhar : la Folie, puis ses Tentacules (tous les 2 tours). */
export function yzharEnemyStart(c: CombatState, e: EnemyState): void {
  if (!isYzhar(e) || c.swallowed) return;
  gainFolie(c, YZHAR.folie);
  const phase = e.phase ?? 1;
  if (c.turn % (phase === 1 ? 2 : YZHAR.giantEvery) !== 0) return;
  const id = phase === 1 ? 'tentacule' : 'tentacule_geant';
  const max = phase === 1 ? YZHAR.maxTentacles : YZHAR.maxGiants;
  const alive = livingEnemies(c).filter((o) => o.defId === id).length;
  const n = Math.min(phase === 1 ? YZHAR.eyeTentacles : 1, max - alive);
  if (n <= 0) return;
  for (let i = 0; i < n; i++) {
    const t = makeEnemy(c, id);
    // Les Tentacules se placent de part et d'autre d'Yzhar.
    const at = c.enemies.indexOf(e);
    c.enemies.splice(i % 2 === 0 ? at : at + 1, 0, t);
  }
  fx(c, { kind: 'buff', who: e.uid, label: phase === 1 ? 'Des yeux s\'ouvrent dans le sable' : 'Un Tentacule géant surgit' });
  log(c, phase === 1 ? `${n} Tentacule${n > 1 ? 's' : ''} oculaire${n > 1 ? 's' : ''} sorte${n > 1 ? 'nt' : ''} du sable.` : 'Un Tentacule géant surgit du sable.');
}

/** Rayon oculaire : il rebondit sur ton familier, qui est étourdi. */
export function stunPet(c: CombatState, turns: number): void {
  if (!c.pet || c.petSacrificed) return;
  c.petStunned = Math.max(c.petStunned ?? 0, turns);
  fx(c, { kind: 'buff', who: 'player', label: 'Familier étourdi' });
  log(c, 'Le Rayon rebondit sur ton familier : il est étourdi.');
}

/** Avaler : tu passes 2 tours dans ses entrailles. Ce qui est dehors disparaît de ta vue. */
export function swallow(c: CombatState): void {
  if (c.swallowed) return;
  c.swallowed = YZHAR.swallowTurns;
  for (const e of livingEnemies(c)) {
    e.submerged = 99;
    e.outside = true;
  }
  for (let i = 0; i < YZHAR.innerTentacles; i++) c.enemies.push(makeEnemy(c, 'tentacule_interieur'));
  fx(c, { kind: 'banner', text: 'Yzhar t\'avale !' });
  log(c, `Yzhar t'avale : ${YZHAR.swallowTurns} tours dans ses entrailles. Tue les deux Tentacules intérieurs pour faire tomber sa Carapace.`);
}

/** Au début de ton tour : Sucs digestifs et main réduite (entrailles), carte « Se mettre à couvert » (Regard sombre). */
export function yzharPlayerTurn(c: CombatState): void {
  if (c.swallowed) {
    // La main est réduite à 3 cartes : le reste retourne sur la pioche.
    while (c.hand.length > YZHAR.swallowHand) c.draw.unshift(c.hand.pop()!);
    fx(c, { kind: 'tick', who: 'player', amount: YZHAR.sucs, label: 'Sucs digestifs' });
    log(c, `Les Sucs digestifs te rongent : ${YZHAR.sucs} dégâts.`);
    damagePlayer(c, YZHAR.sucs, false);
  }
  if ((c.regard ?? 0) > 0) {
    c.covered = false;
    addStatusToHand(c, 'a_couvert', 1);
    log(c, `Le Regard sombre te cherche : mets-toi à couvert, ou subis ${YZHAR.regardDmg} dégâts à la fin de ton tour.`);
  }
}

/** À la fin de ton tour : le Regard sombre frappe, la Carapace se reforme, tu sors des entrailles. */
export function yzharEndTurn(c: CombatState): void {
  if ((c.regard ?? 0) > 0) {
    c.regard! -= 1;
    if (c.covered) {
      log(c, 'Tu es à couvert : le Regard sombre ne te trouve pas.');
    } else {
      fx(c, { kind: 'tick', who: 'player', amount: YZHAR.regardDmg, label: 'Regard sombre' });
      log(c, `Le Regard sombre te brûle : ${YZHAR.regardDmg} dégâts.`);
      damagePlayer(c, YZHAR.regardDmg, false);
    }
    c.covered = false;
    if (c.phase !== 'player') return;
  }
  if ((c.carapaceDown ?? 0) > 0) {
    c.carapaceDown! -= 1;
    if (c.carapaceDown === 0) log(c, 'La Carapace divine se reforme.');
  }
  if (c.swallowed) {
    c.swallowed -= 1;
    if (c.swallowed === 0) spitOut(c);
  }
}

/** Tu es recraché : si les deux Tentacules intérieurs sont morts, la Carapace tombe. */
function spitOut(c: CombatState): void {
  const inner = c.enemies.filter((e) => e.defId === 'tentacule_interieur');
  const allDead = inner.every((e) => e.dead);
  for (const e of inner) {
    if (!e.dead) {
      e.dead = true;
      fx(c, { kind: 'death', who: e.uid });
    }
    e.gone = true;
  }
  for (const e of c.enemies) {
    if (!e.outside) continue;
    e.outside = false;
    e.submerged = 0;
  }
  if (allDead) {
    c.carapaceDown = YZHAR.carapaceDownTurns;
    fx(c, { kind: 'banner', text: 'Recraché ! La Carapace divine est tombée : double dégâts !' });
    log(c, `Tu es recraché. Les Tentacules intérieurs sont morts : la Carapace divine tombe pendant ${YZHAR.carapaceDownTurns} tours, Yzhar subit double dégâts.`);
  } else {
    fx(c, { kind: 'banner', text: 'Yzhar te recrache' });
    log(c, 'Tu es recraché. Les Tentacules intérieurs vivent encore : la Carapace divine tient bon.');
  }
}
