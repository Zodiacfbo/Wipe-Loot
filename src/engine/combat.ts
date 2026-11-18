// Le déroulement d'un combat : tours, cartes, sorts de barre, postures, tour des ennemis.
import {
  addStatusToDraw,
  addStatusToHand,
  applySaignement,
  emptyDebuffs,
  makeEnemy,
  damageEnemy,
  damagePlayer,
  drawCards,
  emerge,
  fx,
  gainBlock,
  gainRage,
  livingEnemies,
  log,
  power,
} from './actions';
import { CARDS, energyCost, type PlayContext } from './cards';
import { SPELLS } from './spells';
import { ENEMIES, intentAt, type Encounter } from './enemies';
import { random, shuffle } from './rng';
import type { ItemEffects } from './items';
import type { CardInstance, CombatState, EnemyState, Intent, PlayerCurse, Posture } from './types';

// --- Sorts de barre : voir spells.ts ---
export { SPELLS, type SpellDef } from './spells';

// --- Création du combat ---

export function createCombat(
  encounter: Encounter,
  deck: CardInstance[],
  hp: number,
  maxHp: number,
  rng: number,
  nextUid: number,
  gear: ItemEffects = {},
  spells: string[] = ['charge'],
): CombatState {
  const c: CombatState = {
    turn: 0,
    phase: 'player',
    player: {
      hp, maxHp, block: 0, energy: 3, maxEnergy: 3, rage: 0, maxRage: Math.max(10, gear.maxRage ?? 0), posture: 'combat',
      postureChanged: false, puissance: 0, ignorerDouleur: false, blockedFullAttack: false, drawPenalty: 0, robustesse: 0,
      debuffs: emptyDebuffs(),
    },
    enemies: [],
    draw: [],
    hand: [],
    discard: [],
    exhaust: [],
    spells: spells.map((id) => ({ id, cooldown: 0 })),
    enrageTurn: encounter.enrageTurn ?? null,
    gear,
    firstAttackDone: false,
    bleedDoneThisTurn: false,
    log: [],
    nextUid,
    rng,
  };
  c.draw = shuffle(c, deck.map((card) => ({ ...card })));
  // Cartes innées (Furie croissante+) : en haut de la pioche.
  const innate = c.draw.filter((card) => card.upgraded && CARDS[card.id].innateUp);
  c.draw = [...innate, ...c.draw.filter((card) => !innate.includes(card))];
  c.enemies = encounter.enemies.map((id) => makeEnemy(c, id));
  for (const e of c.enemies) if (e.defId === 'saldris') e.shield = 'coups';
  if (gear.startFardeau) addStatusToDraw(c, 'fardeau', gear.startFardeau);
  log(c, `Combat : ${encounter.name}.`);
  // L'Eau des profondeurs affaiblit Vulkhar.
  if (encounter.weakened) {
    for (const e of c.enemies.filter((x) => x.defId === 'vulkhar')) {
      e.hp = Math.floor(e.maxHp * 0.85);
      e.delayHammer = true;
    }
  }
  startPlayerTurn(c);
  // Effets de l'équipement au début du combat.
  const p = c.player;
  p.puissance += gear.startPuissance ?? 0;
  p.robustesse += gear.startRobustesse ?? 0;
  p.block += gear.startBlock ?? 0;
  p.energy += gear.firstTurnEnergy ?? 0;
  gainRage(c, gear.startRage ?? 0);
  if (gear.firstTurnDraw) drawCards(c, gear.firstTurnDraw);
  if (gear.startDemoralise) for (const e of c.enemies) e.buffs.demoralise = Math.max(e.buffs.demoralise, gear.startDemoralise);
  if (gear.startAoe) {
    for (const e of livingEnemies(c)) damageEnemy(c, e, gear.startAoe, false);
  }
  c.fx = [];
  if (encounter.rune) c.fx.push({ kind: 'banner', text: 'Ce boss porte la rune des Sources !' });
  if (encounter.weakened) c.fx.push({ kind: 'banner', text: 'L\'Eau des profondeurs affaiblit Vulkhar !' });
  // Embuscade : les ennemis frappent avant ton premier tour.
  if (encounter.ambush) {
    c.fx.push({ kind: 'banner', text: 'Embuscade !' });
    log(c, 'Embuscade ! Les ennemis attaquent avant que tu ne réagisses.');
    enemyTurn(c);
  }
  return c;
}

export function startPlayerTurn(c: CombatState): void {
  const p = c.player;
  c.turn += 1;
  // Garde de fer : on garde la moitié du blocage.
  p.block = power(c, 'garde_de_fer') > 0 ? Math.floor(p.block / 2) : 0;
  p.riposte = 0;
  p.fureur = Math.max(0, (p.fureur ?? 0) - 1);
  c.attacksThisTurn = 0;
  c.cleave = 0;
  p.energy = p.maxEnergy;
  p.postureChanged = false;
  p.ignorerDouleur = false;
  c.bleedDoneThisTurn = false;
  if (c.turn > 1) {
    for (const s of c.spells) s.cooldown = Math.max(0, s.cooldown - 1);
  }
  c.cardsThisTurn = 0;
  c.spellsThisTurn = 0;
  c.panicked = [];
  p.temerite = false;
  p.rempart = false;
  drawCards(c, Math.max(0, 5 - (p.drawPenalty ?? 0)));
  p.drawPenalty = 0;
  const d = (p.debuffs ??= emptyDebuffs());
  // Embrasement de mana (Baron Vossk)
  if (d.manaBurn > 0) {
    p.energy = Math.max(0, p.energy - d.manaBurn);
    log(c, `Ton mana brûle : ${d.manaBurn} énergie de moins.`);
    d.manaBurn = 0;
  }
  // Amulette de purification : dissipe une malédiction.
  if (c.gear?.purify) purifyOne(c);
  // Hurlement de terreur (Croc-de-lave) : des cartes au hasard sont Paniquées.
  if (d.panic > 0) {
    if (c.gear?.panicImmune || p.fearless) {
      log(c, 'Ton collier te protège de la terreur.');
    } else {
      const pool = c.hand.filter((card) => !CARDS[card.id].unplayable);
      for (let i = 0; i < d.panic && pool.length > 0; i++) {
        const [card] = pool.splice(Math.floor(random(c) * pool.length), 1);
        c.panicked.push(card.uid);
      }
      log(c, `La terreur te saisit : ${c.panicked.length} carte${c.panicked.length > 1 ? 's sont Paniquées' : ' est Paniquée'}.`);
    }
    d.panic = 0;
  }
  p.fearless = false;
  if (c.gear?.turnRage) gainRage(c, c.gear.turnRage); // Colère intérieure
  // Pouvoirs de début de tour
  if (power(c, 'furie_inextinguible')) gainRage(c, power(c, 'furie_inextinguible'));
  if (power(c, 'concentration') && p.rage >= 5) {
    p.energy += power(c, 'concentration');
    fx(c, { kind: 'buff', who: 'player', label: 'Concentration : +1 énergie' });
  }
  if (power(c, 'tenacite')) gainBlock(c, power(c, 'tenacite'), false);
  if (power(c, 'ambidextrie')) addStatusToHand(c, 'main_gauche', power(c, 'ambidextrie'));
  // Pierre de magma : +1 Puissance tous les 2 tours.
  const magma = c.gear?.magmaPuissance ?? 0;
  if (magma > 0 && c.turn % 2 === 0 && (c.magmaGained ?? 0) < magma) {
    p.puissance += 1;
    c.magmaGained = (c.magmaGained ?? 0) + 1;
    fx(c, { kind: 'buff', who: 'player', label: 'Magma : +1 Puissance' });
  }
}

/** Dissipe une malédiction : un Fardeau en main, sinon la malédiction la plus longue. */
function purifyOne(c: CombatState): void {
  const i = c.hand.findIndex((card) => card.id === 'fardeau');
  if (i >= 0) {
    c.exhaust.push(...c.hand.splice(i, 1));
    log(c, 'L\'Amulette de purification dissipe un Fardeau.');
    return;
  }
  const d = c.player.debuffs!;
  const keys = (['demoralise', 'impie', 'arcane'] as const).filter((k) => d[k] > 0);
  if (keys.length === 0) return;
  const k = keys.reduce((a, b) => (d[a] >= d[b] ? a : b));
  d[k] = 0;
  log(c, 'L\'Amulette de purification dissipe une malédiction.');
}

/** Applique une malédiction ennemie au joueur. */
function applyCurse(c: CombatState, e: EnemyState, curse: PlayerCurse & { label: string }): void {
  const d = (c.player.debuffs ??= emptyDebuffs());
  const less = c.gear?.debuffReduce ?? 0;
  const turns = (n?: number) => Math.max(0, (n ?? 0) - less);
  if (curse.demoralise) d.demoralise = Math.max(d.demoralise, turns(curse.demoralise));
  if (curse.impie) d.impie = Math.max(d.impie, turns(curse.impie));
  if (curse.arcane) d.arcane = Math.max(d.arcane, turns(curse.arcane));
  if (curse.manaBurn) d.manaBurn += curse.manaBurn;
  if (curse.panic) d.panic += curse.panic;
  if (curse.fardeau) addStatusToDraw(c, 'fardeau', curse.fardeau);
  if (curse.bomb) addStatusToHand(c, 'bombe_vivante', curse.bomb);
  fx(c, { kind: 'buff', who: 'player', label: curse.label });
  log(c, `${e.name} : ${curse.label}.`);
}

// --- Actions du joueur ---

export function resolveTarget(c: CombatState, needsTarget: boolean, targetUid?: number): EnemyState | null | 'invalid' {
  if (!needsTarget) return null;
  const alive = livingEnemies(c).filter((e) => !e.submerged && !e.untargetable);
  if (targetUid === undefined) return alive.length === 1 ? alive[0] : 'invalid';
  return alive.find((e) => e.uid === targetUid) ?? 'invalid';
}

export function canPlayCard(c: CombatState, handIndex: number): boolean {
  if (c.phase !== 'player') return false;
  const card = c.hand[handIndex];
  if (!card) return false;
  const def = CARDS[card.id];
  if (def.unplayable || c.panicked?.includes(card.uid)) return false;
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
  const cost = energyCost(c, card.id, card.upgraded);
  p.energy -= cost;
  c.cardsThisTurn = (c.cardsThisTurn ?? 0) + 1;
  c.firstCardDone = true;
  let rageSpent = 0;
  if (def.rageCost === 'all') {
    rageSpent = p.rage;
    p.rage = 0;
  } else if (typeof def.rageCost === 'number') {
    rageSpent = def.rageCost;
    p.rage -= def.rageCost;
  }
  c.hand.splice(handIndex, 1);

  // Contresort de Zhaal : la 3e carte de Sort de chaque tour est annulée.
  if (def.type === 'Sort' && c.enemies.some((e) => e.defId === 'zhaal' && !e.dead)) {
    c.spellsThisTurn = (c.spellsThisTurn ?? 0) + 1;
    if (c.spellsThisTurn === 3) {
      log(c, `Zhaal contre ${def.name} !`);
      fx(c, { kind: 'buff', who: 'player', label: 'Contresort !' });
      c.discard.push(card);
      return true;
    }
  }

  const ctx: PlayContext = { c, target, up: card.upgraded, rageSpent, dealt: false };
  const attack = def.type === 'Attaque';
  c.cleaving = attack && (c.cleave ?? 0) > 0;
  const blockBefore = p.block;
  c.playing = { cost, type: def.type, id: card.id };
  def.play(ctx);
  c.playing = undefined;
  if (c.cleaving) c.cleave = (c.cleave ?? 1) - 1;
  c.cleaving = false;
  if (attack) {
    p.enrageReady = 0;
    c.attacksThisTurn = (c.attacksThisTurn ?? 0) + 1;
    if (c.attacksThisTurn === 3 && power(c, 'rafale')) drawCards(c, power(c, 'rafale'));
    // Frénésie : la 3e Attaque du tour rend de l'énergie.
    if (c.attacksThisTurn === 3 && c.gear?.frenzyEnergy) p.energy += c.gear.frenzyEnergy;
    // Entaille : les Attaques à 2 énergie ou plus font saigner.
    if (cost >= 2 && ctx.dealt && target && !target.dead && c.gear?.heavyBleed) applySaignement(target, c.gear.heavyBleed, c);
    // Entaille profonde : les Attaques à rage qui touchent font saigner.
    if (def.rageCost !== undefined && ctx.dealt && target && !target.dead && power(c, 'entaille_profonde')) {
      applySaignement(target, power(c, 'entaille_profonde'), c);
    }
  }
  // Voix de stentor : les Cris donnent plus de rage et démoralisent plus longtemps.
  if (c.gear?.shoutBonus && SHOUTS.has(card.id)) {
    gainRage(c, c.gear.shoutBonus);
    for (const e of livingEnemies(c)) if (e.buffs.demoralise > 0) e.buffs.demoralise += c.gear.shoutBonus;
  }
  // Bastion : une carte qui donne du blocage blesse tous les ennemis.
  if (power(c, 'bastion') && p.block > blockBefore && def.type !== 'Pouvoir') {
    for (const e of livingEnemies(c)) {
      if (e.submerged) continue;
      fx(c, { kind: 'tick', who: e.uid, amount: power(c, 'bastion'), label: 'Bastion' });
      damageEnemy(c, e, power(c, 'bastion'));
    }
  }
  log(c, `Tu joues ${def.name}${card.upgraded ? '+' : ''}.`);

  if (def.type === 'Attaque' && ctx.dealt) {
    gainRage(c, p.posture === 'berserker' ? 2 : 1);
    const g = c.gear ?? {};
    if (g.bleedFirstAttack && !c.bleedDoneThisTurn && target && !target.dead && !target.submerged) {
      applySaignement(target, g.bleedFirstAttack, c);
      c.bleedDoneThisTurn = true;
    }
    if (g.healOnAttack) p.hp = Math.min(p.maxHp, p.hp + g.healOnAttack);
  }
  if (def.type === 'Attaque') c.firstAttackDone = true;
  if (card.id === 'zone_de_feu' && c.gear?.zoneBlock) gainBlock(c, c.gear.zoneBlock, false);
  const exhaust = card.upgraded && def.exhaustUp !== undefined ? def.exhaustUp : def.exhaust;
  if (def.type === 'Pouvoir' || exhaust) {
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
  s.cooldown = def.once ? 999 : def.cooldown;
  log(c, `Tu lances ${def.name}.`);
  return true;
}

export function changePosture(c: CombatState, posture: Posture): boolean {
  const p = c.player;
  if (c.phase !== 'player' || p.postureChanged || p.posture === posture) return false;
  p.posture = posture;
  p.postureChanged = true;
  p.rage = Math.min(p.rage, c.gear?.postureRage ?? 3);
  log(c, `Posture : ${posture === 'combat' ? 'Combat' : posture === 'berserker' ? 'Berserker' : 'Défensive'}.`);
  return true;
}

// --- Fin du tour et tour des ennemis ---

export function endTurn(c: CombatState): void {
  if (c.phase !== 'player') return;
  const p = c.player;

  // Les Zones de feu encore en main brûlent le joueur.
  const zones = c.hand.filter((card) => card.id === 'zone_de_feu');
  const zoneDmg = c.fireProof ? 0 : Math.round(6 * (1 - Math.min(100, c.gear?.zoneReduce ?? 0) / 100));
  for (let i = 0; i < zones.length; i++) {
    log(c, `Tu restes dans le feu : ${zoneDmg} dégâts.`);
    if (zoneDmg > 0) {
      fx(c, { kind: 'tick', who: 'player', amount: zoneDmg, label: 'Feu' });
      damagePlayer(c, zoneDmg, false);
    }
  }
  // Les Bombes vivantes encore en main explosent.
  const bombs = c.hand.filter((card) => card.id === 'bombe_vivante');
  for (let i = 0; i < bombs.length && c.phase === 'player'; i++) {
    log(c, 'La Bombe vivante explose : 15 dégâts, et 5 à chaque ennemi.');
    fx(c, { kind: 'tick', who: 'player', amount: 15, label: 'Bombe' });
    damagePlayer(c, 15, false);
    for (const e of livingEnemies(c)) {
      if (e.submerged || c.phase !== 'player') continue;
      fx(c, { kind: 'tick', who: e.uid, amount: 5, label: 'Bombe' });
      damageEnemy(c, e, 5);
    }
  }
  // Les cartes Éphémères restées en main disparaissent.
  const gone = c.hand.filter((card) => CARDS[card.id].ethereal);
  c.exhaust.push(...gone);
  c.discard.push(...c.hand.filter((card) => !CARDS[card.id].ethereal));
  c.hand = [];
  c.panicked = [];
  const d = p.debuffs;
  if (d) {
    d.demoralise = Math.max(0, d.demoralise - 1);
    d.impie = Math.max(0, d.impie - 1);
    d.arcane = Math.max(0, d.arcane - 1);
  }
  if (c.phase !== 'player') return;

  p.blockedFullAttack = false;
  enemyTurn(c);
  if (c.phase === 'player') startPlayerTurn(c);
}

function enemyDamage(c: CombatState, e: EnemyState, base: number): number {
  let dmg = base + e.buffs.puissance;
  if (e.buffs.demoralise > 0) dmg *= 0.75;
  if (c.player.posture === 'berserker') dmg *= 1.2;
  if (c.player.temerite) dmg *= 1.25;
  if ((c.player.fureur ?? 0) > 0) dmg *= 1.25;
  if (e.disarmed) dmg *= 0.7; // un boss désarmé frappe moins fort
  if (isEnraged(c) && (ENEMIES[e.defId].elite || ENEMIES[e.defId].boss)) dmg *= 2;
  return Math.max(0, Math.floor(dmg));
}

export function isEnraged(c: CombatState): boolean {
  return c.enrageTurn !== null && c.turn >= c.enrageTurn;
}

function resolveIntent(c: CombatState, e: EnemyState, intent: Intent): void {
  switch (intent.kind) {
    case 'attack': {
      // Désarmement : un ennemi normal n'attaque pas ce tour-ci.
      if (e.disarmed && !ENEMIES[e.defId].elite && !ENEMIES[e.defId].boss) {
        log(c, `${e.name} est désarmé : il n'attaque pas.`);
        break;
      }
      const times = intent.times ?? 1;
      const base = intent.dmg + (intent.grow ?? 0) * (e.counter ?? 0);
      if (intent.grow) e.counter = (e.counter ?? 0) + 1;
      for (let i = 0; i < times && c.phase === 'player'; i++) {
        const dmg = enemyDamage(c, e, base);
        const blockBefore = c.player.block;
        fx(c, { kind: 'hit', from: e.uid, to: 'player', amount: dmg, blocked: Math.min(blockBefore, dmg), ranged: !!intent.cast });
        const lost = damagePlayer(c, dmg, true);
        if (intent.stealGold && lost > 0) {
          c.goldStolen = (c.goldStolen ?? 0) + intent.stealGold;
          fx(c, { kind: 'buff', who: e.uid, label: `Avale ${intent.stealGold} or !` });
          log(c, `${e.name} t'avale ${intent.stealGold} or !`);
        }
        log(c, `${e.name}${intent.cast ? ` lance ${intent.cast}` : ' attaque'} : ${dmg} dégâts (${lost} PV perdus).`);
        // Miroir de l'intendant, Charme d'épines : une attaque entièrement bloquée est renvoyée.
        // Parade ripostée : la première attaque reçue est renvoyée.
        if ((c.player.riposte ?? 0) > 0 && dmg > 0 && c.phase === 'player' && !e.dead) {
          fx(c, { kind: 'tick', who: e.uid, amount: c.player.riposte!, label: 'Riposte' });
          damageEnemy(c, e, c.player.riposte!);
          c.player.riposte = 0;
        }
        const reflect = (c.gear?.blockReflect ?? 0) + (lost === 0 ? power(c, 'riposte_bouclier') : 0);
        if (reflect > 0 && dmg > 0 && lost === 0 && c.phase === 'player' && !e.dead) {
          fx(c, { kind: 'tick', who: e.uid, amount: reflect, label: 'Renvoi' });
          damageEnemy(c, e, reflect);
        }
        if (e.dead) break;
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
    case 'curse':
      applyCurse(c, e, intent);
      break;
    case 'summon': {
      const alive = livingEnemies(c).filter((o) => o.defId === intent.id).length;
      if (alive < intent.max) {
        const add = makeEnemy(c, intent.id);
        // Le nouvel add se place à côté de son maître.
        c.enemies.splice(c.enemies.indexOf(e), 0, add);
        fx(c, { kind: 'buff', who: e.uid, label: intent.label });
        log(c, `${e.name} : ${intent.label}. Un ${add.name} revient.`);
      } else {
        log(c, `${e.name} tente un ${intent.label}, mais tous ses éclats sont là.`);
      }
      break;
    }
    case 'blink':
      e.untargetable = true;
      fx(c, { kind: 'buff', who: e.uid, label: 'Clignement' });
      log(c, `${e.name} se dérobe : il ne peut pas être ciblé jusqu'à son prochain tour.`);
      break;
    case 'heal': {
      const allies = intent.self ? [] : livingEnemies(c).filter((o) => o !== e && o.hp < o.maxHp && !o.noHeal);
      const pool = allies.length > 0 ? allies : [e];
      if (pool[0].noHeal) {
        log(c, `${e.name} tente de se soigner, mais ses blessures ne se referment pas.`);
        break;
      }
      const target = pool.reduce((a, b) => (a.hp / a.maxHp <= b.hp / b.maxHp ? a : b));
      const healed = Math.min(intent.amount, target.maxHp - target.hp);
      target.hp += healed;
      fx(c, { kind: 'heal', from: e.uid, to: target.uid, amount: healed });
      log(c, `${e.name} lance ${intent.cast ?? 'un soin'} : ${target.name} récupère ${healed} PV.`);
      break;
    }
  }
}

/** Les cartes de Cri (Voix de stentor). */
const SHOUTS = new Set(['cri_de_guerre', 'cri_demoralisant', 'cri_de_bataille', 'cri_intimidation', 'hurlement_furieux', 'cri_de_ralliement']);

function enemyTurn(c: CombatState): void {
  c.enemyActing = true;
  try {
    enemyTurnInner(c);
  } finally {
    c.enemyActing = false;
  }
}

function enemyTurnInner(c: CombatState): void {
  for (const e of [...c.enemies]) {
    if (c.phase !== 'player') break;
    // Molosse de Krâgg : se relève au bout de 2 tours, tant que Krâgg vit.
    if (e.dead && e.reviveIn) {
      e.reviveIn -= 1;
      if (e.reviveIn === 0 && c.enemies.some((k) => k.defId === 'kragg' && !k.dead)) {
        e.dead = false;
        e.hp = Math.ceil(e.maxHp / 2);
        e.step = 0;
        e.buffs = { puissance: 0, demoralise: 0, ralenti: 0, armureFracassee: 0, saignement: 0, saignementTours: 0 };
        e.intent = intentAt(ENEMIES[e.defId], 0);
        fx(c, { kind: 'buff', who: e.uid, label: 'Se relève !' });
        log(c, `${e.name} se relève (${e.hp} PV) !`);
      }
      continue;
    }
    if (e.dead) continue;
    e.block = 0;
    e.untargetable = false;
    // Passifs de début de tour
    if (e.defId === 'gardien') {
      e.block += 6;
      fx(c, { kind: 'block', who: e.uid, amount: 6 });
    }
    if (e.defId === 'gorlok') {
      const shards = livingEnemies(c).filter((o) => o.defId === 'eclat').length;
      if (shards > 0) {
        e.block += 4 * shards;
        fx(c, { kind: 'block', who: e.uid, amount: 4 * shards });
        log(c, `Ses ${shards} éclat${shards > 1 ? 's' : ''} protègent Gorlok (+${4 * shards} blocage).`);
      }
    }
    if (e.defId === 'kragg') {
      e.buffs.puissance += 1;
      fx(c, { kind: 'buff', who: e.uid, label: 'Magma : Puissance +1' });
    }

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

    if ((e.buffs.peur ?? 0) > 0) {
      e.buffs.peur! -= 1;
      log(c, `${e.name} est apeuré et ne fait rien.`);
    } else if (e.interrupted) {
      log(c, `${e.name} ne peut pas agir : son incantation a été interrompue.`);
      e.interrupted = false;
    } else if (e.delayed) {
      log(c, `${e.name} reprend son incantation.`);
      e.delayed = false;
      decayBuffs(e);
      continue; // garde la même intention pour le tour suivant
    } else if (e.intent.cast && c.gear?.castCancel && !c.orbUsed) {
      // Orbe de distorsion : la première incantation du combat est annulée.
      c.orbUsed = true;
      fx(c, { kind: 'interrupt', who: e.uid });
      log(c, `L'Orbe de distorsion annule ${e.intent.cast} !`);
    } else {
      resolveIntent(c, e, e.intent);
    }

    decayBuffs(e);
    e.disarmed = false;
    e.step += 1;
    e.intent = intentAt(ENEMIES[e.defId], e.step, e.phase ?? 1, e.hp < e.maxHp / 2);
    // Vulkhar affaibli : son premier Marteau des flammes arrive un tour plus tard.
    if (e.delayHammer && e.intent.cast === 'Marteau des flammes') {
      e.delayHammer = false;
      e.step -= 1;
      e.intent = { kind: 'attack', dmg: 14 };
      log(c, 'Affaibli par l\'eau, Vulkhar met plus de temps à lever son marteau.');
    }
  }
  // Le Grand Intendant renforce un garde et change de bouclier (annoncé un tour à l'avance).
  const saldris = c.enemies.find((e) => e.defId === 'saldris' && !e.dead);
  if (saldris && c.phase === 'player') {
    const guards = livingEnemies(c).filter((e) => e.defId === 'pretre' || e.defId === 'gardien');
    if (guards.length > 0) {
      const g = guards[Math.floor(random(c) * guards.length)];
      g.block += 8;
      fx(c, { kind: 'block', who: g.uid, amount: 8 });
      log(c, `Saldris protège ${g.name} (+8 blocage).`);
    }
    saldris.shield = saldris.shield === 'coups' ? 'sorts' : 'coups';
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
