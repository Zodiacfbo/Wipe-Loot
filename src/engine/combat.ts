// Le déroulement d'un combat : tours, cartes, sorts de barre, postures, tour des ennemis.
import {
  addStatusToHand,
  damageEnemy,
  damagePlayer,
  drawCards,
  emerge,
  fx,
  gainRage,
  livingEnemies,
  log,
  playerAttack,
} from './actions';
import { CARDS, energyCost, type PlayContext } from './cards';
import { ENEMIES, intentAt, type Encounter } from './enemies';
import { randInt, shuffle } from './rng';
import type { CardInstance, CombatState, EnemyState, Intent, Posture } from './types';

// --- Sorts de barre ---

export interface SpellDef {
  id: string;
  name: string;
  cost: number;
  cooldown: number;
  needsTarget: boolean;
  text: string;
  cast: (c: CombatState, target: EnemyState | null) => void;
}

export const SPELLS: Record<string, SpellDef> = {
  charge: {
    id: 'charge', name: 'Charge', cost: 0, cooldown: 3, needsTarget: true,
    text: 'Inflige 3 dégâts et gagne 3 rage.',
    cast: (c, target) => {
      if (target) playerAttack(c, target, 3);
      gainRage(c, 3);
    },
  },
};

// --- Création du combat ---

export function createCombat(
  encounter: Encounter,
  deck: CardInstance[],
  hp: number,
  maxHp: number,
  rng: number,
  nextUid: number,
): CombatState {
  const c: CombatState = {
    turn: 0,
    phase: 'player',
    player: {
      hp, maxHp, block: 0, energy: 3, maxEnergy: 3, rage: 0, maxRage: 10, posture: 'combat',
      postureChanged: false, puissance: 0, ignorerDouleur: false, blockedFullAttack: false, drawPenalty: 0,
    },
    enemies: [],
    draw: [],
    hand: [],
    discard: [],
    exhaust: [],
    spells: [{ id: 'charge', cooldown: 0 }],
    enrageTurn: encounter.enrageTurn ?? null,
    log: [],
    nextUid,
    rng,
  };
  c.draw = shuffle(c, deck.map((card) => ({ ...card })));
  c.enemies = encounter.enemies.map((id) => {
    const def = ENEMIES[id];
    const maxHpEnemy = randInt(c, def.hpMin, def.hpMax);
    return {
      uid: c.nextUid++, defId: id, name: def.name, hp: maxHpEnemy, maxHp: maxHpEnemy, block: 0,
      buffs: { puissance: 0, demoralise: 0, ralenti: 0, armureFracassee: 0, saignement: 0, saignementTours: 0 },
      step: 0, intent: intentAt(def, 0), interrupted: false, delayed: false, dead: false,
    };
  });
  log(c, `Combat : ${encounter.name}.`);
  startPlayerTurn(c);
  return c;
}

export function startPlayerTurn(c: CombatState): void {
  const p = c.player;
  c.turn += 1;
  p.block = 0;
  p.energy = p.maxEnergy;
  p.postureChanged = false;
  p.ignorerDouleur = false;
  if (c.turn > 1) {
    for (const s of c.spells) s.cooldown = Math.max(0, s.cooldown - 1);
  }
  drawCards(c, Math.max(0, 5 - (p.drawPenalty ?? 0)));
  p.drawPenalty = 0;
}

// --- Actions du joueur ---

export function resolveTarget(c: CombatState, needsTarget: boolean, targetUid?: number): EnemyState | null | 'invalid' {
  if (!needsTarget) return null;
  const alive = livingEnemies(c).filter((e) => !e.submerged);
  if (targetUid === undefined) return alive.length === 1 ? alive[0] : 'invalid';
  return alive.find((e) => e.uid === targetUid) ?? 'invalid';
}

export function canPlayCard(c: CombatState, handIndex: number): boolean {
  if (c.phase !== 'player') return false;
  const card = c.hand[handIndex];
  if (!card) return false;
  const def = CARDS[card.id];
  if (energyCost(c, card.id, card.upgraded) > c.player.energy) return false;
  if (typeof def.rageCost === 'number' && def.rageCost > c.player.rage) return false;
  if (def.rageCost === 'all' && c.player.rage === 0) return false;
  return true;
}

export function playCard(c: CombatState, handIndex: number, targetUid?: number): boolean {
  if (!canPlayCard(c, handIndex)) return false;
  const card = c.hand[handIndex];
  const def = CARDS[card.id];
  const target = resolveTarget(c, def.needsTarget, targetUid);
  if (target === 'invalid') return false;

  const p = c.player;
  p.energy -= energyCost(c, card.id, card.upgraded);
  let rageSpent = 0;
  if (def.rageCost === 'all') {
    rageSpent = p.rage;
    p.rage = 0;
  } else if (typeof def.rageCost === 'number') {
    rageSpent = def.rageCost;
    p.rage -= def.rageCost;
  }
  c.hand.splice(handIndex, 1);

  const ctx: PlayContext = { c, target, up: card.upgraded, rageSpent, dealt: false };
  def.play(ctx);
  log(c, `Tu joues ${def.name}${card.upgraded ? '+' : ''}.`);

  if (def.type === 'Attaque' && ctx.dealt) {
    gainRage(c, p.posture === 'berserker' ? 2 : 1);
  }
  if (def.type === 'Pouvoir' || def.exhaust) {
    c.exhaust.push(card);
  } else {
    c.discard.push(card);
  }
  return true;
}

export function canUseSpell(c: CombatState, index: number): boolean {
  const s = c.spells[index];
  if (!s || c.phase !== 'player') return false;
  return s.cooldown === 0 && SPELLS[s.id].cost <= c.player.energy;
}

export function useSpell(c: CombatState, index: number, targetUid?: number): boolean {
  if (!canUseSpell(c, index)) return false;
  const s = c.spells[index];
  const def = SPELLS[s.id];
  const target = resolveTarget(c, def.needsTarget, targetUid);
  if (target === 'invalid') return false;
  c.player.energy -= def.cost;
  def.cast(c, target);
  s.cooldown = def.cooldown;
  log(c, `Tu lances ${def.name}.`);
  return true;
}

export function changePosture(c: CombatState, posture: Posture): boolean {
  const p = c.player;
  if (c.phase !== 'player' || p.postureChanged || p.posture === posture) return false;
  p.posture = posture;
  p.postureChanged = true;
  p.rage = Math.min(p.rage, 3);
  log(c, `Posture : ${posture === 'combat' ? 'Combat' : posture === 'berserker' ? 'Berserker' : 'Défensive'}.`);
  return true;
}

// --- Fin du tour et tour des ennemis ---

export function endTurn(c: CombatState): void {
  if (c.phase !== 'player') return;
  const p = c.player;

  // Les Zones de feu encore en main brûlent le joueur.
  const zones = c.hand.filter((card) => card.id === 'zone_de_feu');
  for (let i = 0; i < zones.length; i++) {
    log(c, 'Tu restes dans le feu : 6 dégâts.');
    fx(c, { kind: 'tick', who: 'player', amount: 6, label: 'Feu' });
    damagePlayer(c, 6, false);
  }
  c.exhaust.push(...zones);
  c.discard.push(...c.hand.filter((card) => card.id !== 'zone_de_feu'));
  c.hand = [];
  if (c.phase !== 'player') return;

  p.blockedFullAttack = false;
  enemyTurn(c);
  if (c.phase === 'player') startPlayerTurn(c);
}

function enemyDamage(c: CombatState, e: EnemyState, base: number): number {
  let dmg = base + e.buffs.puissance;
  if (e.buffs.demoralise > 0) dmg *= 0.75;
  if (c.player.posture === 'berserker') dmg *= 1.2;
  if (isEnraged(c) && (ENEMIES[e.defId].elite || ENEMIES[e.defId].boss)) dmg *= 2;
  return Math.max(0, Math.floor(dmg));
}

export function isEnraged(c: CombatState): boolean {
  return c.enrageTurn !== null && c.turn >= c.enrageTurn;
}

function resolveIntent(c: CombatState, e: EnemyState, intent: Intent): void {
  switch (intent.kind) {
    case 'attack': {
      const times = intent.times ?? 1;
      const base = intent.dmg + (intent.grow ?? 0) * (e.counter ?? 0);
      if (intent.grow) e.counter = (e.counter ?? 0) + 1;
      for (let i = 0; i < times && c.phase === 'player'; i++) {
        const dmg = enemyDamage(c, e, base);
        const blockBefore = c.player.block;
        fx(c, { kind: 'hit', from: e.uid, to: 'player', amount: dmg, blocked: Math.min(blockBefore, dmg), ranged: !!intent.cast });
        const lost = damagePlayer(c, dmg, true);
        log(c, `${e.name}${intent.cast ? ` lance ${intent.cast}` : ' attaque'} : ${dmg} dégâts (${lost} PV perdus).`);
      }
      if (intent.drawPenalty && c.phase === 'player') {
        c.player.drawPenalty += intent.drawPenalty;
        fx(c, { kind: 'buff', who: 'player', label: `Assommé : ${intent.drawPenalty} cartes en moins` });
        log(c, `Tu es assommé : tu piocheras ${intent.drawPenalty} cartes de moins.`);
      }
      if (intent.addZone) {
        addStatusToHand(c, 'zone_de_feu', intent.addZone);
        log(c, `${e.name} crache des braises : Zone de feu.`);
      }
      break;
    }
    case 'block': {
      let amount = intent.amount;
      if (e.buffs.ralenti > 0) amount = Math.floor(amount * 0.75);
      e.block += amount;
      fx(c, { kind: 'block', who: e.uid, amount });
      log(c, `${e.name} se protège (+${amount} blocage).`);
      break;
    }
    case 'buff': {
      const others = livingEnemies(c).filter((o) => o !== e);
      const targets = intent.target === 'allies' && others.length > 0 ? others : [e];
      for (const t of targets) {
        t.buffs.puissance += intent.puissance;
        fx(c, { kind: 'buff', who: t.uid, label: `Puissance +${intent.puissance}` });
      }
      log(c, `${e.name} galvanise ${targets.length > 1 || targets[0] !== e ? 'ses alliés' : 'ses forces'} (+${intent.puissance} Puissance).`);
      break;
    }
    case 'heal': {
      const allies = livingEnemies(c).filter((o) => o !== e && o.hp < o.maxHp);
      const pool = allies.length > 0 ? allies : [e];
      const target = pool.reduce((a, b) => (a.hp / a.maxHp <= b.hp / b.maxHp ? a : b));
      const healed = Math.min(intent.amount, target.maxHp - target.hp);
      target.hp += healed;
      fx(c, { kind: 'heal', from: e.uid, to: target.uid, amount: healed });
      log(c, `${e.name} lance ${intent.cast ?? 'un soin'} : ${target.name} récupère ${healed} PV.`);
      break;
    }
  }
}

function enemyTurn(c: CombatState): void {
  for (const e of c.enemies) {
    if (e.dead || c.phase !== 'player') continue;
    e.block = 0;

    // Vulkhar sous la lave : il ne fait rien, puis refait surface.
    if (e.submerged) {
      e.submerged -= 1;
      if (e.submerged === 0) emerge(c, e);
      continue;
    }
    // Phase 2 de Vulkhar : la montagne brûle, une Zone de feu à chaque tour.
    if (e.defId === 'vulkhar' && e.phase === 2) {
      addStatusToHand(c, 'zone_de_feu', 1);
    }

    // Saignement
    if (e.buffs.saignementTours > 0 && e.buffs.saignement > 0) {
      log(c, `${e.name} saigne : ${e.buffs.saignement} dégâts.`);
      fx(c, { kind: 'tick', who: e.uid, amount: e.buffs.saignement, label: 'Saignement' });
      damageEnemy(c, e, e.buffs.saignement, true);
      e.buffs.saignementTours -= 1;
      if (e.buffs.saignementTours === 0) e.buffs.saignement = 0;
      if (e.dead) continue;
    }

    if (e.interrupted) {
      log(c, `${e.name} ne peut pas agir : son incantation a été interrompue.`);
      e.interrupted = false;
    } else if (e.delayed) {
      log(c, `${e.name} reprend son incantation.`);
      e.delayed = false;
      decayBuffs(e);
      continue; // garde la même intention pour le tour suivant
    } else {
      resolveIntent(c, e, e.intent);
    }

    decayBuffs(e);
    e.step += 1;
    e.intent = intentAt(ENEMIES[e.defId], e.step, e.phase ?? 1);
  }
}

function decayBuffs(e: EnemyState): void {
  const b = e.buffs;
  b.demoralise = Math.max(0, b.demoralise - 1);
  b.ralenti = Math.max(0, b.ralenti - 1);
  b.armureFracassee = Math.max(0, b.armureFracassee - 1);
}

/** Les dégâts qu'un ennemi infligera avec son intention actuelle (pour l'affichage). */
export function previewIntentDamage(c: CombatState, e: EnemyState): number | null {
  if (e.intent.kind !== 'attack') return null;
  return enemyDamage(c, e, e.intent.dmg + (e.intent.grow ?? 0) * (e.counter ?? 0));
}
