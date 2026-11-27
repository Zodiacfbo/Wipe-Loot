// Un bot qui joue des runs entières avec le moteur du jeu, pour mesurer l'équilibrage.
// En combat, il essaie chaque action possible sur une copie de l'état et garde la meilleure
// (une évaluation simple : dégâts infligés, dégâts qu'il va encaisser, ressources, ennemis vaincus).
import { CARDS, energyCost } from '../../src/engine/cards';
import { canPlayCard, canUseSpell, cardNeedsTarget, changeForm, choosePet, endTurn, playCard, useSpell } from '../../src/engine/combat';
import { trapTargetBlock } from '../../src/engine/chasseur';
import { FORM_IDS, canShift } from '../../src/engine/druide';
import type { FormId } from '../../src/engine/types';
import { ENEMIES } from '../../src/engine/enemies';
import { EVENTS } from '../../src/engine/events';
import { ITEMS, slotsFor } from '../../src/engine/items';
import { reachable } from '../../src/engine/map';
import { POTIONS } from '../../src/engine/potions';
import {
  afterCombatAction, barCapacity, buyCard, buyItem, servicePrice, startEncounter, buyPotion, buyRemoval, buyUpgrade, campfireReforge, campfireRest, campfireUpgrade,
  canDrink, chooseBlessing, chooseNode, chooseReward, drinkPotion, equipPending, eventChoiceLock, leaveEvent, leavePending,
  leaveShop, learnSpell, newRun, offerBlessing, resolveEvent, retryAfterWipe, takePotion,
  campfireBindStaff, canBindStaff, canRest, startNextAct, campfireEquinoxe, campfireAurore, campfireCorde, campfireBindStaffDruid, druidOfferings,
} from '../../src/engine/run';
import { previewIntentDamage } from '../../src/engine/combat';
import type { CardInstance, CombatState, EnemyState, RunState } from '../../src/engine/types';
import type { SlotKey } from '../../src/engine/items';
import { actDef } from '../../src/engine/acts';
import { classInfo } from '../../src/engine/classes';
import type { Encounter } from '../../src/engine/enemies';

// ---------- Évaluation d'un état de combat ----------

/** Les dégâts qu'un ennemi va infliger à son prochain tour. */
function incomingFrom(c: CombatState, e: EnemyState): number {
  if (e.dead || e.submerged || e.interrupted || (e.stun ?? 0) > 0 || (e.sap ?? 0) > 0 || (e.buffs.peur ?? 0) > 0 || (e.mouton ?? 0) > 0 || e.gele === 'skip' || (e.enslaved ?? 0) > 0) return 0;
  if (c.player.iceBlock) return 0;
  const def = ENEMIES[e.defId];
  if (e.disarmed && !def.elite && !def.boss) return 0;
  const i = e.intent;
  if (i.kind !== 'attack') return 0;
  return (previewIntentDamage(c, e) ?? 0) * (i.times ?? 1);
}

function evaluate(c: CombatState): number {
  if (c.phase === 'victory') return 100000 + c.player.hp * 10;
  if (c.phase === 'defeat') return -100000;
  const p = c.player;
  let incoming = 0;
  let enemyHp = 0;
  let threat = 0;
  for (const e of c.enemies) {
    if (e.dead) continue;
    incoming += incomingFrom(c, e);
    enemyHp += e.hp + e.block * 0.5;
    // Vulkhar en phase 1 : il reste toute la phase 2 à faire. Le pousser sous 50 % est un progrès.
    if (e.defId === 'vulkhar' && (e.phase ?? 1) === 1) enemyHp += e.submerged ? 40 : 260;
    // Chaque Rejeton encore en vie soignera Vulkhar de 15 PV quand il refera surface.
    if (e.defId === 'rejeton') enemyHp += 15;
    // Ossyrax a deux vies, et un Serviteur rapiécé se relève tant qu'un Alchimiste vit : la vie suivante compte déjà
    // (sinon le bot n'ose pas achever et le combat ne finit jamais).
    if (e.defId === 'ossyrax' && !e.revived) enemyHp += 45;
    // Vhaeryx : sous 20 % (phase 3), les cobayes tombés se relèvent (6 au plus) : ils comptent déjà.
    if (e.defId === 'vhaeryx' && (e.phase ?? 1) < 3) { const n = Math.min(6, c.fallen ?? 0); enemyHp += n * 10; threat += n * 6; }
    if (e.defId === 'serviteur' && !e.revived && c.enemies.some((o) => o.defId === 'alchimiste' && !o.dead)) enemyHp += 10;
    // Méhkar : les Copies qu'il créera encore (2 par palier restant) comptent déjà, pour que le bot ose passer les paliers.
    if (e.defId === 'mehkar') { const left = 3 - (e.splits ?? 0); enemyHp += left * 2 * 15; threat += left * 2 * 6; }
    // Yzhar : l'Œil ouvert, il reste tout le Corps ; dans les entrailles, les Tentacules intérieurs passent avant tout.
    if (e.defId === 'yzhar' && (e.phase ?? 1) === 1) enemyHp += 300;
    if (e.defId === 'tentacule_interieur') enemyHp += e.hp * 2;
    threat += 6 + (ENEMIES[e.defId].elite || ENEMIES[e.defId].boss ? 10 : 0);
    // Débuffs posés : ils valent quelque chose pour la suite.
    enemyHp -= e.buffs.saignement * Math.min(3, e.buffs.saignementTours) * 0.8;
    enemyHp -= e.buffs.armureFracassee * 3 + e.buffs.demoralise * 1.5 + e.buffs.ralenti;
    // Mage : la Brûlure à venir, le Gel accumulé.
    const burn = e.buffs.brulure ?? 0;
    enemyHp -= (burn * (burn + 1)) / 2 * 0.6;
    enemyHp -= (e.buffs.gel ?? 0) * 1.5;
    // Démoniste : les DoT à venir et les Malédictions.
    // Un DoT vaut moins sur un add quand un boss est là : c'est le boss qu'il faut ronger.
    const addWithBoss = !ENEMIES[e.defId].boss && c.enemies.some((o) => !o.dead && ENEMIES[o.defId].boss);
    for (const d of e.dots ?? []) enemyHp -= d.dmg * Math.min(4, d.turns) * (addWithBoss ? 0.3 : 0.7);
    enemyHp -= (e.curses?.length ?? 0) * 3;
    // Voleur : le Poison posé, la Vendetta.
    enemyHp -= (e.buffs.poison ?? 0) * 2 + (e.vendetta ? 12 : 0);
  }
  // Ce qui brûlera en fin de tour : Zones de feu et Bombes vivantes gardées en main.
  const burn = c.hand.filter((k) => k.id === 'zone_de_feu').length * (c.fireProof ? 0 : 6)
    + c.hand.filter((k) => k.id === 'bombe_vivante').length * 15
    // Le Regard sombre d'Yzhar, si l'on ne s'est pas mis à couvert.
    + ((c.regard ?? 0) > 0 && !c.covered ? 12 : 0);
  // Le Prêtre : l'Égide encaisse aussi, et elle reste pour les tours suivants.
  const unblocked = Math.max(0, incoming - p.block - (c.aegis ?? 0)) * (p.rempart ? 0.5 : 1) + burn;
  const powers = Object.values(c.powers ?? {}).length;
  const charges = (p.charges ?? 0) >= 4 && !c.gear?.noOverload ? 4 * 1.5 - 3 : (p.charges ?? 0) * 1.5;
  // La Pierre d'âme ne vaut le coup (1 éclat) que contre un boss.
  const big = c.enemies.some((e) => !e.dead && (ENEMIES[e.defId].elite || ENEMIES[e.defId].boss));
  const shards = (c.shards ?? 0) * 3 + (c.infernal ?? 0) * 2 + (c.soulstone && big ? 10 : 0)
    + (c.aegis ?? 0) * 0.6 + (c.faith ?? 0) * 1.5 + (c.renew ? c.renew.amount * c.renew.turns : 0)
    // Voleur : les points de combo, le Camouflage (s'il reste une Ouverture en main), le Poison d'arme, Danse des lames.
    + rogueValue(c) + paladinValue(c) + hunterValue(c) + druidValue(c) + shamanValue(c)
    // Prêtre : la Forme d'Ombre n'est pas dans c.powers, elle vaut un Pouvoir posé (sinon le bot ne la joue jamais).
    + (c.shadowForm ? 8 : 0)
    // Égide des anciens : le renvoi rapporte à chaque coup absorbé, tant qu'il reste de l'Égide.
    + (c.aegisThorns ? 4 + Math.min(4, Math.ceil((c.aegis ?? 0) / 6)) * c.aegisThorns : 0);
  return p.hp * 1.4 - unblocked * 1.5 - enemyHp - threat + charges + shards + p.rage * 0.5 + p.puissance * 5 + p.robustesse * 3 + powers * 8 + p.energy * 0.1;
}

function rogueValue(c: CombatState): number {
  if (c.combo === undefined) return 0;
  const openers = c.hand.filter((k) => CARDS[k.id].opener).length;
  return c.combo * 2.5 + (c.stealth && openers > 0 ? 6 * openers : 0) + (c.stealthNext ? 4 : 0)
    + (c.weaponPoison ? 6 + c.weaponPoison.amount * 3 : 0)
    + (c.bladeDance ? c.bladeDance.bonus * c.bladeDance.turns * 1.5 : 0) + (c.coldBlood ? 6 : 0) + (c.shadowStep ? 3 : 0)
    + (c.player.evasion ? 8 : 0);
}

function paladinValue(c: CombatState): number {
  if (c.seals === undefined) return 0;
  let v = c.seals.length * 5 + (c.aura ? 8 : 0) + (c.favor ? 4 : 0) + (c.judgeBonus ?? 0) + (c.pavois ?? 0) + (c.crusaderShield ? 8 : 0);
  const living = c.enemies.filter((e) => !e.dead).length;
  if (c.consecration) v += c.consecration.dmg * c.consecration.turns * living * 0.8;
  for (const e of c.enemies) if (!e.dead) v += (e.buffs.censure ?? 0) * 2.5;
  return v;
}

/** Chasseur : les Pièges posés, l'Esprit, la Marque, le Loup spectral et les bonus du compagnon. */
function hunterValue(c: CombatState): number {
  if (c.companion === undefined) return 0;
  const living = c.enemies.filter((e) => !e.dead).length;
  let v = 0;
  // Les Pièges posés sur les ennemis : l'Explosif vaut plus sur un ennemi solide, le Givrant sur celui qui frappe fort.
  for (const e of c.enemies) {
    if (e.dead) continue;
    for (const t of e.traps ?? []) {
      if (t.id === 'explosif') v += Math.min(t.value, e.hp) * 0.9 + t.value * 0.5 * (living - 1) * 0.8;
      else if (t.id === 'venin') v += t.value * 3 * living * 0.6;
      else if (t.id === 'immolation') v += Math.min(t.value * 3, e.hp) * 0.7;
      else v += 3 + (e.intent.kind === 'attack' ? e.intent.dmg * (e.intent.times ?? 1) * 0.8 : 2);
    }
  }
  if (c.aspect) v += c.aspect === 'aigle' ? 8 : c.aspect === 'tortue' ? 6 : 5;
  if (c.mark && c.enemies.some((e) => e.uid === c.mark!.uid && !e.dead)) v += 4 + c.mark.value * 2;
  v += (c.spectral ?? 0) * 3 + (c.compTurnBonus ?? 0) + (c.compNextBonus ?? 0) + (c.focusNext ?? 0) * 0.5
    + (c.breathNext ?? 0) * 0.8 + (c.counterStun ? 5 : 0);
  return v;
}

/** Chaman : les totems posés (leur effet sur les prochains tours), les Armes élémentaires, les Orbes, le Bouclier de terre. */
function shamanValue(c: CombatState): number {
  if (c.totems === undefined) return 0;
  const living = c.enemies.filter((e) => !e.dead).length;
  const hurt = c.player.hp < c.player.maxHp * 0.8;
  let v = 0;
  for (const t of Object.values(c.totems)) {
    if (!t) continue;
    switch (t.id) {
      case 'pierre': case 'glebe': v += t.value * 2.5; break;
      case 'braise': v += t.value * 2.5; break;
      case 'lave': v += t.value * living * 2.5; break;
      case 'orage': v += t.value * 2.5 + (t.value2 ?? 0) * 3; break;
      case 'guerisseur': case 'source': v += t.value * (hurt ? 3 : 1) + (t.value2 ?? 0) * 2; break;
      case 'marees': case 'mana': v += 8; break;
      case 'vents': v += t.value * 4; break;
      case 'force': v += 0; break; // déjà compté par la Puissance
      default: v += 4;
    }
  }
  for (const w of c.imbues ?? []) v += w.id === 'flammes' ? w.value * 4 : 8;
  v += (c.orbs ?? []).reduce((a, o) => a + o.dmg * 0.9, 0) + (c.earthShield ?? 0) * 4 + (c.stormstrike ?? 0) * 3
    + (c.nextAttackBonus ?? 0) * 0.5 + (c.ancestorsNext ? 5 : 0) + (c.manaTide ?? 0) * 3 + (c.clearcast ? 2 : 0) + (c.maelstrom ?? 0) * 0.8;
  return v;
}

/** Druide : la rage et le combo de la forme, les cartes en main qui vont avec la forme, Sylvains, Tranquillité. */
function druidValue(c: CombatState): number {
  if (c.form === undefined) return 0;
  const big = c.enemies.some((e) => !e.dead && (ENEMIES[e.defId].elite || ENEMIES[e.defId].boss));
  let v = (c.bearRage ?? 0) * 1 + (c.catCombo ?? 0) * 2.5 + (c.prowl ? 5 : 0) + (c.tigerFury ?? 0) * 1.5
    + (c.treants?.turns ? c.treants.dmg * c.treants.count * c.treants.turns * 0.8 : 0) + (c.tranquility ?? 0) * 10
    + (c.rebirth && big ? 12 : 0) + (c.eclipseLunar || c.eclipseSolar ? 3 : 0);
  // Les cartes en main qui se jouent au juste prix dans la forme actuelle.
  for (const k of c.hand) {
    const d = CARDS[k.id];
    if (d.form && d.form === c.form) v += 3;
    if (c.form === 'astrale' && d.type === 'Sort') v += 1;
    if (c.form === 'felin' && d.type === 'Attaque') v += 1;
  }
  return v;
}

const clone = (c: CombatState): CombatState => JSON.parse(JSON.stringify(c));

/** Les PV perdus par les ennemis déjà là entre deux états (sans compter ceux qui apparaissent ou se soignent). */
function damageDealt(before: CombatState, after: CombatState): number {
  let sum = 0;
  for (const e of before.enemies) {
    if (e.dead) continue;
    const now = after.enemies.find((x) => x.uid === e.uid);
    sum += now ? Math.max(0, e.hp - (now.dead ? 0 : now.hp)) : e.hp;
  }
  return sum;
}

interface Action { kind: 'card' | 'spell' | 'form'; index: number; target?: number; form?: FormId }

function candidates(c: CombatState): Action[] {
  const list: Action[] = [];
  const pool = c.enemies.filter((e) => !e.dead && !e.submerged && !e.untargetable);
  const targets = pool.map((e) => e.uid);
  c.hand.forEach((card, i) => {
    if (!canPlayCard(c, i)) return;
    // Chasseur : pas de cible qui porte déjà ce type de Piège.
    if (cardNeedsTarget(c, card.id)) pool.filter((e) => !trapTargetBlock(card.id, e)).forEach((e) => list.push({ kind: 'card', index: i, target: e.uid }));
    else list.push({ kind: 'card', index: i });
  });
  c.spells.forEach((s, i) => {
    if (!canUseSpell(c, i)) return;
    const needs = ['charge', 'coup_de_pommeau', 'coup_de_pied', 'jugement', 'marteau_jugement', 'charge_sacree', 'tir_arcanique', 'fleche_museliere', 'fleche_apaisante', 'cyclone', 'faveur_lune', 'choc_tellurique', 'purge', 'fouet_lave'].includes(s.id);
    if (needs) targets.forEach((t) => list.push({ kind: 'spell', index: i, target: t }));
    else list.push({ kind: 'spell', index: i });
  });
  // Druide : changer de forme.
  if (c.form !== undefined) for (const f of FORM_IDS) if (canShift(c, f)) list.push({ kind: 'form', index: -1, form: f });
  return list;
}

function apply(c: CombatState, a: Action): boolean {
  if (a.kind === 'form') return changeForm(c, a.form!);
  return a.kind === 'card' ? playCard(c, a.index, a.target) : useSpell(c, a.index, a.target);
}

/** Joue un tour complet du joueur, puis finit le tour. */
export function playTurn(run: RunState): void {
  const c = run.combat!;
  // Potions : soin quand on est bas, les autres d'emblée contre un boss.
  const big = c.enemies.some((e) => ENEMIES[e.defId].elite || ENEMIES[e.defId].boss);
  run.potions.forEach((id, slot) => {
    if (!id || c.phase !== 'player') return;
    const heal = POTIONS[id].heal;
    if ((heal && c.player.hp < c.player.maxHp * 0.4) || (!heal && big && c.turn <= 2)) drinkPotion(run, slot);
  });
  // Démoniste : le Rôdeur du néant contre les boss, le Diablotin ailleurs.
  if (c.turn === 1 && c.pet) choosePet(c, big ? 'rodeur' : 'diablotin');
  for (let guard = 0; guard < 25 && c.phase === 'player'; guard++) {
    const base = evaluate(c);
    let best: Action | null = null;
    let bestScore = 0.5;
    for (const a of candidates(c)) {
      const copy = clone(c);
      if (!apply(copy, a)) continue;
      // Un combat qui s'éternise : les dégâts infligés comptent aussi, même s'ils font passer un cap à l'ennemi
      // (nouvelle phase, Copies, division) que l'évaluation voit comme un recul, et de plus en plus avec les tours.
      // Sinon le combat ne finit jamais.
      const gain = evaluate(copy) - base + (c.turn > 15 ? damageDealt(c, copy) * Math.min(20, c.turn - 13) : 0);
      if (gain > bestScore) { bestScore = gain; best = a; }
    }
    if (!best) {
      // Pacte de sang (Démoniste) : le bot ne voit qu'une action à l'avance, il ne verrait jamais son intérêt.
      // On le lance comme un joueur le ferait : plus d'énergie, une carte jouable en main, et assez de PV.
      const pact = c.spells.findIndex((s) => s.id === 'pacte_de_sang');
      const playable = c.hand.some((k) => CARDS[k.id].type !== 'Statut' && CARDS[k.id].type !== 'Pouvoir' && CARDS[k.id].cost === 1);
      if (pact >= 0 && c.player.energy === 0 && playable && c.player.hp > c.player.maxHp * 0.45 && canUseSpell(c, pact)) {
        useSpell(c, pact);
        continue;
      }
      // Sève vitale (Druide), Cri des ancêtres et Totem de mana (Chaman) : de l'énergie, si une carte de la main devient jouable.
      const seve = c.spells.findIndex((sp) => ['seve_vitale', 'cri_ancetres', 'totem_mana'].includes(sp.id) && canUseSpell(c, c.spells.indexOf(sp)));
      const wanted = c.hand.some((k) => CARDS[k.id].type !== 'Statut' && !CARDS[k.id].unplayable && energyCost(c, k.id, k.upgraded) > c.player.energy && energyCost(c, k.id, k.upgraded) <= c.player.energy + 2);
      if (seve >= 0 && wanted && canUseSpell(c, seve)) {
        useSpell(c, seve);
        continue;
      }
      break;
    }
    apply(c, best);
  }
  c.fx = [];
  if (c.phase === 'player') endTurn(c);
  c.fx = [];
}

// ---------- Décisions hors combat ----------
// Deux modes (variable BOT) :
// - « essai » (par défaut) : avant chaque choix (carte, objet, amélioration, retrait, achat), le bot rejoue
//   quelques combats types de l'acte avec chaque option, sur les mêmes tirages, et garde la meilleure.
//   La même règle pour les 9 classes : aucune liste de cartes à tenir à jour.
// - « simple » : l'ancien bot (la carte la plus rare, l'objet le plus rare), gardé pour comparer.

// (process n'est pas typé dans le projet du jeu, qui compile aussi ce fichier à travers tests/bot.test.ts.)
const env = (globalThis as { process?: { env: Record<string, string | undefined> } }).process?.env ?? {};
let MODE = env.BOT ?? 'essai';
/** Le nombre de combats types rejoués pour chaque option. */
let ESSAIS = Number(env.ESSAIS ?? 3);
/** Pour les tests : changer de mode sans variable d'environnement. */
export function setBotMode(mode: 'essai' | 'simple', essais = 3): void { MODE = mode; ESSAIS = essais; }

const RARITY_RANK: Record<string, number> = { commun: 1, rare: 2, epique: 3, legendaire: 4 };
const CARD_RANK: Record<string, number> = { commune: 1, peu_commune: 2, rare: 3, epique: 4 };

/** Les cartes à retirer d'office : Malédictions et cartes injouables. */
const isJunk = (id: string) => id === 'malediction' || CARDS[id].type === 'Malédiction' || !!CARDS[id].unplayable;

/** Les combats types d'une décision : des packs difficiles et un boss secondaire de l'acte en cours. */
function trialEncounters(run: RunState): Encounter[] {
  const act = actDef(run.act);
  const k = run.path.length * 7 + run.act * 13;
  const list: Encounter[] = [];
  for (let i = 0; i < ESSAIS; i++) {
    const pool = i % 3 === 2 ? act.elites : act.hard;
    list.push(pool[(k + i) % pool.length]);
  }
  return list;
}

/** Joue un combat type sur une copie de la run. Score : les PV perdus (négatif), bien pire en cas de défaite. */
function trialFight(run: RunState, enc: Encounter, seed: number): number {
  const r: RunState = JSON.parse(JSON.stringify(run));
  r.hp = r.maxHp;
  r.potions = r.potions.map(() => null);
  r.rng = seed >>> 0;
  startEncounter(r, enc);
  const c = r.combat!;
  for (let t = 0; t < 40 && r.screen === 'combat'; t++) {
    playTurn(r);
    afterCombatAction(r);
  }
  if (c.phase === 'victory') return c.player.hp - r.maxHp;
  const left = c.enemies.filter((e) => !e.dead).reduce((a, e) => a + e.hp, 0);
  return -r.maxHp - 30 - left * 0.5;
}

/** La valeur moyenne d'une option : `change` modifie la copie de la run avant les combats types. */
function trialValue(run: RunState, change: (r: RunState) => void): number {
  const base: RunState = JSON.parse(JSON.stringify(run));
  change(base);
  const encs = trialEncounters(run);
  let total = 0;
  encs.forEach((enc, i) => { total += trialFight(base, enc, run.seed * 31 + run.path.length * 977 + i * 104729); });
  return total / encs.length;
}

/** La meilleure option (index), ou -1 si aucune ne vaut mieux que de ne rien faire. */
function bestOption(run: RunState, options: ((r: RunState) => void)[]): number {
  const none = trialValue(run, () => {});
  let best = -1;
  let bestV = none;
  options.forEach((o, i) => {
    const v = trialValue(run, o);
    if (v > bestV) { bestV = v; best = i; }
  });
  return best;
}

const addCard = (id: string) => (r: RunState) => { r.deck.push({ uid: r.nextUid++, id, upgraded: false }); };
const dropCard = (uid: number) => (r: RunState) => { r.deck = r.deck.filter((k) => k.uid !== uid); };
const upCard = (uid: number) => (r: RunState) => { const k = r.deck.find((x) => x.uid === uid); if (k) k.upgraded = true; };

/** Une carte par id (les copies se valent). */
function distinct(run: RunState, keep: (k: CardInstance) => boolean): CardInstance[] {
  const seen = new Set<string>();
  return run.deck.filter((k) => keep(k) && !seen.has(k.id + k.upgraded) && seen.add(k.id + k.upgraded));
}

/** La carte à retirer (une Malédiction d'office), ou null si retirer ne rapporte rien. */
function removalTarget(run: RunState): number | null {
  const junk = run.deck.find((k) => isJunk(k.id));
  if (junk) return junk.uid;
  if (MODE === 'simple') {
    const basic = run.deck.find((k) => ['frappe', 'trait_de_magie', 'attaque_sinistre', 'frappe_pal'].includes(k.id));
    return basic?.uid ?? null;
  }
  const pool = distinct(run, () => true);
  const i = bestOption(run, pool.map((k) => dropCard(k.uid)));
  return i >= 0 ? pool[i].uid : null;
}

function upgradeTarget(run: RunState): number | null {
  const pool = distinct(run, (k) => !k.upgraded && !isJunk(k.id) && CARDS[k.id].type !== 'Statut');
  if (MODE === 'simple') {
    pool.sort((a, b) => (CARD_RANK[CARDS[b.id].rarity] ?? 0) - (CARD_RANK[CARDS[a.id].rarity] ?? 0));
    return pool[0]?.uid ?? null;
  }
  if (!pool.length) return null;
  const i = bestOption(run, pool.map((k) => upCard(k.uid)));
  // Améliorer ne coûte rien au feu de camp face au repos : on prend la meilleure, même si l'écart est mince.
  return pool[Math.max(0, i)].uid;
}

function pickCard(run: RunState): string | null {
  if (MODE === 'simple') {
    const options = [...run.rewardChoices].sort((a, b) => CARD_RANK[CARDS[b].rarity] - CARD_RANK[CARDS[a].rarity]);
    const best = options[0];
    if (!best) return null;
    if (run.deck.length >= 22 && CARDS[best].rarity === 'commune') return null;
    return best;
  }
  if (!run.rewardChoices.length) return null;
  const i = bestOption(run, run.rewardChoices.map(addCard));
  return i >= 0 ? run.rewardChoices[i] : null;
}

function handleReward(run: RunState): void {
  if (run.pendingItem) {
    const options = [run.pendingItem, ...run.pendingAlts];
    if (MODE === 'simple') {
      let done = false;
      for (let alt = 0; alt < options.length && !done; alt++) {
        const id = options[alt];
        for (const slot of slotsFor(id)) {
          const current = run.equipment[slot];
          if (!current || RARITY_RANK[ITEMS[id].rarity] > RARITY_RANK[ITEMS[current].rarity]) {
            equipPending(run, slot, alt === 0 ? undefined : alt - 1);
            done = true;
            break;
          }
        }
      }
      if (!done) leavePending(run);
    } else {
      const moves: { alt?: number; slot: SlotKey }[] = [];
      options.forEach((id, a) => slotsFor(id).forEach((slot) => moves.push({ alt: a === 0 ? undefined : a - 1, slot })));
      const i = bestOption(run, moves.map((m) => (r) => { equipPending(r, m.slot, m.alt); }));
      if (i >= 0) equipPending(run, moves[i].slot, moves[i].alt);
      else leavePending(run);
    }
  }
  if (run.pendingPotion) {
    if (!takePotion(run)) run.pendingPotion = null;
  }
  if (run.pendingSpell) {
    if (run.spells.length < barCapacity(run)) learnSpell(run);
    else run.pendingSpell = null;
  }
  chooseReward(run, pickCard(run));
}

/** L'or gardé en réserve chez le vendeur (la facture de réparation d'un wipe). */
const RESERVE = 60;

function handleShop(run: RunState): void {
  const shop = run.shop!;
  if (MODE === 'simple') {
    const bad = run.deck.find((k) => k.id === 'malediction') ?? run.deck.find((k) => ['frappe', 'trait_de_magie', 'attaque_sinistre', 'frappe_pal'].includes(k.id));
    if (bad) buyRemoval(run, bad.uid);
    shop.cards.forEach((item, i) => {
      if (!item.sold && CARD_RANK[CARDS[item.id].rarity] >= 2 && run.gold - item.price >= 60) buyCard(run, i);
    });
    shop.potions.forEach((_, i) => { if (run.gold >= 120) buyPotion(run, i); });
    const up = upgradeTarget(run);
    if (up !== null) buyUpgrade(run, up);
    leaveShop(run);
    return;
  }
  // Retirer : la carte dont l'absence rend le deck meilleur (une Malédiction d'office).
  if (run.gold >= servicePrice(run.removals)) {
    const out = removalTarget(run);
    if (out !== null) buyRemoval(run, out);
  }
  // Acheter : à chaque fois la meilleure carte ou le meilleur objet abordable, tant que l'un d'eux améliore le deck.
  for (let guard = 0; guard < 4; guard++) {
    const buys: { apply: (r: RunState) => void; real: () => void }[] = [];
    shop.cards.forEach((it, i) => {
      if (!it.sold && run.gold - it.price >= RESERVE) buys.push({ apply: addCard(it.id), real: () => { buyCard(run, i); } });
    });
    shop.items.forEach((it, i) => {
      if (it.sold || run.gold - it.price < RESERVE) return;
      for (const slot of slotsFor(it.id)) {
        buys.push({ apply: (r) => { r.screen = 'shop'; buyItem(r, i, slot); }, real: () => { buyItem(run, i, slot); } });
      }
    });
    if (!buys.length) break;
    const i = bestOption(run, buys.map((b) => b.apply));
    if (i < 0) break;
    buys[i].real();
  }
  shop.potions.forEach((_, i) => { if (run.gold >= 120) buyPotion(run, i); });
  if (run.gold >= servicePrice(run.upgradesBought)) {
    const up = upgradeTarget(run);
    if (up !== null) buyUpgrade(run, up);
  }
  leaveShop(run);
}

const EVENT_CHOICE: Record<string, (run: RunState) => number> = {
  sources: () => 0,
  riviere: (r) => (r.hp > 30 ? 0 : 1),
  forge: () => 0,
  trappeur: (r) => (r.classId === 'chasseur' && !r.corde ? 2 : r.potions.some((x) => x) ? 0 : 1),
  cercle: (r) => (r.classId === 'chaman' && !r.marteau ? 2 : eventChoiceLock(r, 0) ? 1 : 0),
  chapelle: (r) => (r.classId === 'pretre' && !r.equinoxe ? 2 : 0),
  fantome: (r) => (r.equipment.arme && r.hp > 40 ? 0 : 2),
  gobelin: () => 0,
  fonceur: (r) => (r.hp > r.maxHp * 0.6 ? 0 : 1),
  source_chaude: () => 0,
  cadavre: (r) => (r.hp > 30 ? 0 : 1),
  // Acte 2
  oeufs: (r) => (r.hp > r.maxHp * 0.5 ? 0 : 1),
  observatoire: (r) => (eventChoiceLock(r, 0) ? 1 : 0),
  reliquaire: (r) => (r.classId === 'paladin' && !r.aurore ? 2 : eventChoiceLock(r, 0) ? 1 : 0),
  laboratoire: () => 1,
  dragonnet_cage: () => 0,
  cobayes: (r) => (r.gold >= 60 ? 1 : 2),
  autel: () => 0,
  fantome_raideur: (r) => (r.hp < r.maxHp * 0.6 ? 1 : 0),
  fonceur2: (r) => (r.hp > r.maxHp * 0.6 ? 0 : 1),
  ventor: () => 0,
  // Acte 3
  gong: (r) => (r.hp > r.maxHp * 0.7 ? 0 : 1),
  veilleurs: (r) => (r.classId === 'paladin' && r.aurore === 'lame' ? 0 : 1),
  oasis: (r) => (r.deck.some((k) => k.id === 'malediction') ? 2 : r.hp < r.maxHp * 0.7 ? 0 : 1),
  bibliotheque: (r) => (r.hp > 30 ? 0 : 1),
  statue: (r) => (r.hp > 30 ? 1 : 2),
  marchand_sables: (r) => (eventChoiceLock(r, 0) ? (r.gold >= 160 ? 1 : 2) : 0),
  tombeau: (r) => (r.hp > r.maxHp * 0.6 ? 0 : 1),
  reve: () => 0,
  fantome_raideur3: (r) => (r.hp < r.maxHp * 0.6 ? 1 : 0),
  fonceur3: (r) => (r.hp > r.maxHp * 0.6 ? 0 : 1),
};

const BLESSING_ORDER = ['pari', 'entrainement', 'provisions', 'potions', 'pret', 'bourse', 'allegement', 'marche'];

/** Un petit générateur aléatoire pour les choix de chemin (le jeu garde le sien). */
function chooser(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

function chooseNextNode(run: RunState, rnd: () => number): number {
  const options = reachable(run.map, run.position);
  const ratio = run.hp / run.maxHp;
  const score = (t: string) => {
    switch (t) {
      case 'campfire': return ratio < 0.5 ? 9 : 3;
      case 'elite': return ratio > 0.7 ? 6 : ratio > 0.5 ? 3 : 0;
      case 'shop': return run.gold >= 150 ? 6 : 2;
      case 'chest': return 7;
      case 'event': return 4;
      default: return ratio > 0.4 ? 5 : 2;
    }
  };
  return options.map((n) => ({ n, s: score(n.type) + rnd() * 2 })).sort((a, b) => b.s - a.s)[0].n.id;
}

export interface FightLog {
  name: string;
  kind: 'combat' | 'elite' | 'boss';
  floor: number;
  /** L'acte du combat (1 par défaut). */
  act?: number;
  /** PV à l'entrée du combat. */
  hpIn?: number;
  wipes: number;
  hpLost: number;
  won: boolean;
  /** À chaque wipe : PV restants des ennemis, tour atteint, et taille du deck. */
  deaths?: { enemyHp: number; turn: number; deck: number; maxHp: number; log?: string[] }[];
}

export interface RunResult {
  victory: boolean;
  /** Faux si la run s'est bloquée (le bot n'a pas su avancer) : un bug du bot ou du jeu. */
  ended: boolean;
  /** L'écran où la run s'est bloquée. */
  stuckOn?: string;
  floor: number;
  wipesUsed: number;
  fights: FightLog[];
}

/** Joue une run entière. */
/** `onBoss` : appelé à l'entrée de chaque boss de fin d'acte (pour copier la run à ce moment-là). */
export function simulateRun(seed: number, talents: string[], difficulty = 0, classId = 'guerrier', onBoss?: (run: RunState) => void): RunResult {
  const rnd = chooser(seed * 7919);
  const run = newRun(seed, null, talents, difficulty, classId);
  offerBlessing(run);
  const blessing = BLESSING_ORDER.find((b) => run.blessings.includes(b))!;
  if (blessing === 'allegement') chooseBlessing(run, blessing, removalTarget(run) ?? run.deck.find((k) => k.id === classInfo(classId).starterDeck![0])!.uid);
  else chooseBlessing(run, blessing);
  const fights: FightLog[] = [];
  let current: FightLog | null = null;
  for (let step = 0; step < 3000; step++) {
    switch (run.screen) {
      case 'map': {
        chooseNode(run, chooseNextNode(run, rnd));
        if ((run.screen as string) === 'combat') {
          const node = run.map.nodes[run.position!];
          current = { name: run.encounter!.name, kind: node.type === 'elite' ? 'elite' : node.type === 'boss' ? 'boss' : 'combat', floor: node.floor + 1, act: run.act, wipes: 0, hpLost: run.hp, hpIn: run.hp, won: false };
          fights.push(current);
          if (node.type === 'boss') onBoss?.(run);
        }
        break;
      }
      case 'combat':
        if (current && current.name !== run.encounter!.name) {
          current = { name: run.encounter!.name, kind: 'combat', floor: (run.position !== null ? run.map.nodes[run.position].floor : 0) + 1, wipes: 0, hpLost: run.hp, won: false };
          fights.push(current);
        }
        playTurn(run);
        afterCombatAction(run);
        if (current && run.screen !== 'combat' && run.screen !== 'wipe' && run.screen !== 'gameover') {
          current.won = true;
          current.hpLost = current.hpLost - run.hp;
        }
        break;
      case 'wipe':
        if (current) {
          current.wipes++;
          const c = run.combat!;
          (current.deaths ??= []).push({ enemyHp: c.enemies.filter((e) => !e.dead).reduce((a, e) => a + e.hp, 0), turn: c.turn, deck: run.deck.length, maxHp: run.maxHp, log: c.log.slice(-14) });
        }
        retryAfterWipe(run);
        break;
      case 'reward': handleReward(run); break;
      case 'shop': handleShop(run); break;
      case 'campfire': {
        if (campfireReforge(run) || campfireEquinoxe(run) || campfireAurore(run) || campfireCorde(run)) break;
        if (run.classId === 'druide' && druidOfferings(run).length && campfireBindStaffDruid(run, druidOfferings(run)[0])) break;
        if (canBindStaff(run)) {
          const rare = run.deck.find((k) => CARDS[k.id].rarity === 'rare');
          if (rare && campfireBindStaff(run, rare.uid)) break;
        }
        const up = upgradeTarget(run);
        if ((run.hp < run.maxHp * 0.7 || up === null) && canRest(run)) campfireRest(run);
        else if (up !== null) campfireUpgrade(run, up);
        else run.screen = 'map';
        break;
      }
      case 'act': startNextAct(run); break;
      case 'event': {
        if (run.eventOutcome) { leaveEvent(run); break; }
        const ev = EVENTS[run.eventId!];
        let choice = EVENT_CHOICE[ev.id]?.(run) ?? 0;
        if (eventChoiceLock(run, choice)) choice = ev.choices.findIndex((_, i) => !eventChoiceLock(run, i));
        resolveEvent(run, choice);
        if ((run.screen as string) === 'combat') {
          current = { name: run.encounter!.name, kind: 'combat', floor: run.map.nodes[run.position!].floor + 1, wipes: 0, hpLost: run.hp, won: false };
          fights.push(current);
        }
        break;
      }
      case 'blessing': chooseBlessing(run, run.blessings[0]); break;
      case 'victory':
      case 'gameover': {
        const floor = run.floorsDone + (run.position === null ? 0 : run.map.nodes[run.position].floor + 1);
        if (current && run.screen === 'gameover') current.wipes++;
        return { victory: run.screen === 'victory', ended: true, floor, wipesUsed: run.maxWipes - run.wipesLeft, fights };
      }
    }
    // Une potion de soin entre deux combats si besoin.
    if (run.screen === 'map') run.potions.forEach((id, slot) => { if (id && canDrink(run, slot) && run.hp < run.maxHp * 0.5) drinkPotion(run, slot); });
  }
  return { victory: false, ended: false, stuckOn: `${run.screen} (acte ${run.act}${run.screen === 'event' ? `, ${run.eventId}` : ''}${run.combat ? `, ${run.encounter?.name}, tour ${run.combat.turn}, phase ${run.combat.phase}, PV ${run.combat.player.hp}, ennemis ${run.combat.enemies.map((e) => `${e.defId}:${e.hp}${e.dead ? '†' : ''}`).join(' ')}\n    ${run.combat.log.slice(-12).join('\n    ')}` : ''})`, floor: 0, wipesUsed: 3 - run.wipesLeft, fights };
}
