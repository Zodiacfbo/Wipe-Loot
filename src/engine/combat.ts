// Le déroulement d'un combat : tours, cartes, sorts de barre, postures, tour des ennemis.
import {
  addStatusToDraw,
  addStatusToHand,
  applyBrulure,
  applyGel,
  applySaignement,
  gainCharges,
  isBossEnemy,
  emptyDebuffs,
  makeEnemy,
  damageEnemy,
  damagePlayer,
  drawCards,
  emerge,
  fx,
  gainBlock,
  gainRage,
  healPlayer,
  livingEnemies,
  log,
  power,
} from './actions';
import { AFFLICTIONS, GRIZZIK_POTIONS, PRISMAGOR_BREATHS } from './enemies_acte2';
import { CARDS, energyCost, isEthereal, shardCost, type PlayContext } from './cards';
import { decayCurses, felhunterLock, felhunterStart, petAct, triggerDots } from './demoniste';
import { BASE_AEGIS, BASE_FAITH, gainAegis, gainFaith } from './pretre';
import { breakStealth, decayPoison, enterStealth, gainCombo, stealthed, stormStrike } from './voleur';
import { addHallucination, folieStartTurn, gainFolie } from './folie';
import { checkDebuffs, dominatedAttack, dreamEnergy, iremEnemyEnd, iremEnemyStart, iremPlayerTurn } from './irem';
import { stunPet, swallow, yzharEndTurn, yzharEnemyStart, yzharPlayerTurn } from './yzhar';
import { afterPaladinCard, censureTick, hasSeal, isPaladin, paladinEndTurn, paladinOnAttacked, paladinStartTurn, SEAL_JUDGE_TARGET } from './paladin';
import { afterHunterCard, flecheStartTurn, hunterDamageTaken, hunterEndTurn, hunterOnAttacked, hunterStartCombat, hunterStartTurn, isHunter, springTraps } from './chasseur';
import { afterDruidCard, druidDamageTaken, druidEndTurn, druidOnAttacked, druidStartCombat, druidStartTurn, enterForm, isDruid, setForm } from './druide';
import { afterShamanCard, clearTotems, isShaman, shamanOnAttacked, shamanStartCombat, shamanStartTurn, totemsAct, windfuryExtra } from './chaman';
import { SPELLS, spellCooldown } from './spells';
import { ENEMIES, TUNING, hasTag, intentAt, type Encounter } from './enemies';
import { random, shuffle } from './rng';
import type { ItemEffects } from './items';
import type { CardInstance, CombatMods, CombatState, CompanionId, EnemyState, FormId, Intent, PetId, PlayerCurse, Posture } from './types';

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
  mods?: CombatMods,
  classId = 'guerrier',
  /** Démoniste : les éclats d'âme de la run et le familier choisi. */
  demon?: { shards: number; pet: PetId },
  /** Chasseur : le compagnon choisi au départ de l'expédition. */
  companion?: CompanionId,
  /** Chaman : la Réincarnation est encore disponible pour cette run. */
  ankh = true,
): CombatState {
  const c: CombatState = {
    turn: 0,
    phase: 'player',
    player: {
      hp, maxHp, block: 0, energy: 3, maxEnergy: 3, rage: 0, maxRage: Math.max(10, gear.maxRage ?? 0), posture: 'combat',
      postureChanged: false, puissance: 0, ignorerDouleur: false, blockedFullAttack: false, drawPenalty: 0, robustesse: 0,
      debuffs: emptyDebuffs(),
      ...(classId === 'mage' ? { charges: 0, maxCharges: 4 } : {}),
    },
    classId,
    ...(classId === 'demoniste' ? { shards: demon?.shards ?? 0, pet: demon?.pet ?? 'diablotin', soulSiphon: {} } : {}),
    ...(classId === 'pretre' ? { aegis: 0, maxAegis: gear.maxAegis ?? BASE_AEGIS, faith: 0, maxFaith: gear.maxFaith ?? BASE_FAITH } : {}),
    // Le Voleur commence chaque combat Camouflé (2 tours avec Ombres profondes ou Ténèbres).
    ...(classId === 'voleur' ? { combo: Math.min(5, gear.startCombo ?? 0), stealth: true, stealthTurns: gear.longStealth ? 2 : 1, stormCount: 0 } : {}),
    // Le Paladin commence sans Sceau ni Aura.
    ...(classId === 'paladin' ? { seals: [], aura: null, blockedSince: 0, zealGained: 0 } : {}),
    // Le Chasseur : son compagnon, sans Esprit ni Piège au départ.
    ...(classId === 'chasseur' ? { companion: companion ?? 'loup', aspect: null, traps: [], mark: null, frenzyStacks: 0 } : {}),
    // Le Druide commence en forme normale ; son premier changement de forme est gratuit.
    ...(classId === 'druide' ? { form: 'normale' as FormId, bearRage: 0, catCombo: 0, formRobustesse: 0 } : {}),
    // Le Chaman : 4 emplacements de totem vides, et sa Réincarnation si elle n'a pas encore servi.
    ...(classId === 'chaman' ? { totems: { terre: null, feu: null, eau: null, air: null }, imbues: [], ankh, orbs: [], maelstrom: 0, earthShield: 0 } : {}),
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
  // Gardien céleste : Ange gardien est Inné.
  const innate = c.draw.filter((card) => (card.upgraded && CARDS[card.id].innateUp) || (card.id === 'ange_gardien' && gear.guardianInnate) || (card.id === 'eclipse' && gear.eclipseInnate));
  c.draw = [...innate, ...c.draw.filter((card) => !innate.includes(card))];
  c.enemies = encounter.enemies.map((id) => makeEnemy(c, id));
  // Difficulté : PV, Puissance de départ et enrage des ennemis.
  if (mods) {
    c.mods = mods;
    for (const e of c.enemies) {
      const def = ENEMIES[e.defId];
      const [hp, pu] = def.boss ? [mods.bossHp, mods.bossPuissance] : def.elite ? [mods.eliteHp, mods.elitePuissance] : [mods.normalHp, mods.normalPuissance];
      e.maxHp = e.hp = Math.round(e.maxHp * hp);
      e.buffs.puissance += pu;
    }
    // Niveau 17 : les sbires présents dès le début du combat d'un seigneur.
    if (c.enemies.some((e) => ENEMIES[e.defId].boss)) for (const e of c.enemies) if (!ENEMIES[e.defId].boss) e.maxHp = e.hp = Math.round(e.maxHp * (mods.lordAddHp ?? 1));
    if (c.enrageTurn !== null) {
      const boss = c.enemies.some((e) => ENEMIES[e.defId].boss);
      c.enrageTurn = Math.max(3, c.enrageTurn - mods.enrageEarlier - (boss ? mods.bossEnrageEarlier : 0));
    }
  }
  for (const e of c.enemies) if (e.defId === 'saldris') e.shield = 'coups';
  // Acte 2 : Ysolde blessée, les Mutations et les Souffles tirés au hasard (affichés dès le début).
  for (const e of c.enemies) {
    const def = ENEMIES[e.defId];
    if (def.startHpRatio) e.hp = Math.round(e.maxHp * def.startHpRatio);
    if (def.immune) e.immune = def.immune;
    if (def.mutation) {
      const all = ['carapace', 'frenesie', 'regeneration'];
      const first = all[Math.floor(random(c) * all.length)];
      e.mutations = [first];
      if (encounter.doubleMutation) {
        const rest = all.filter((m) => m !== first);
        e.mutations.push(rest[Math.floor(random(c) * rest.length)]);
      }
    }
    if (e.defId === 'prismagor') {
      const keys = Object.keys(PRISMAGOR_BREATHS);
      const a = keys.splice(Math.floor(random(c) * keys.length), 1)[0];
      const b = keys[Math.floor(random(c) * keys.length)];
      e.breaths = [a, b];
    }
    fixIntent(c, e);
  }
  if (c.enemies.some((e) => e.defId === 'ysolde')) c.adrenaline = 3;
  c.extraAdds = encounter.extraAdds ?? 0;
  // Sablier brisé : l'enrage arrive plus tard.
  if (c.enrageTurn !== null && gear.enrageDelay) c.enrageTurn += gear.enrageDelay;
  if (gear.startFardeau) addStatusToDraw(c, 'fardeau', gear.startFardeau);
  log(c, `Combat : ${encounter.name}.`);
  // Le Gong des Sables : un ennemi de plus.
  if (encounter.extraEnemy && c.enemies.length > 0) {
    const model = c.enemies[Math.floor(random(c) * c.enemies.length)];
    const extra = makeEnemy(c, model.defId);
    extra.maxHp = extra.hp = model.maxHp;
    extra.buffs.puissance = model.buffs.puissance;
    c.enemies.push(extra);
    fixIntent(c, extra);
  }
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
  if (gear.startCharges) gainCharges(c, gear.startCharges); // Subtilité arcanique
  if (gear.startBurn) for (const e of livingEnemies(c)) applyBrulure(c, e, gear.startBurn); // Souffle du dragon
  if (gear.firstTurnDraw) drawCards(c, gear.firstTurnDraw);
  if (gear.startDemoralise) for (const e of c.enemies) e.buffs.demoralise = Math.max(e.buffs.demoralise, gear.startDemoralise);
  if (gear.startAoe) {
    for (const e of livingEnemies(c)) damageEnemy(c, e, gear.startAoe, false);
  }
  // Butin du chapitre II
  if (gear.startBlockPerEnemy) p.block += gear.startBlockPerEnemy * livingEnemies(c).length;
  if (gear.startDragonFracture) for (const e of livingEnemies(c)) if (hasTag(e.defId, 'dragon')) e.buffs.armureFracassee = Math.max(e.buffs.armureFracassee, gear.startDragonFracture);
  if (gear.startZone) addStatusToHand(c, 'zone_de_feu', gear.startZone);
  if (gear.startToxine) p.debuffs!.toxine = gear.startToxine;
  // Butin d'Irem : Couronne jumelle.
  if (gear.multiPuissance && livingEnemies(c).length >= 2) p.puissance += gear.multiPuissance;
  // Lumière intérieure : de l'Égide dès le début du combat.
  if (gear.startAegis) gainAegis(c, gear.startAegis, false);
  // Maître invocateur : le familier agit dès le début du combat.
  if (gear.petOpening) petAct(c, gear.petOpening);
  // Chasseur : Esprit animal, Piégeur né.
  hunterStartCombat(c);
  druidStartCombat(c);
  shamanStartCombat(c);
  if (gear.startFiole) addStatusToHand(c, 'fiole_instable', gear.startFiole);
  // Butin d'Yzhar : Bague du dieu dormant, Lame de l'oubli.
  for (let i = 0; i < (gear.startCopyUp ?? 0); i++) {
    const pool = deck.filter((card) => CARDS[card.id].type !== 'Statut' && CARDS[card.id].type !== 'Malédiction');
    if (pool.length === 0) break;
    const model = pool[Math.floor(random(c) * pool.length)];
    const copy = { uid: c.nextUid++, id: model.id, upgraded: true };
    if (c.hand.length < 10) c.hand.push(copy);
    else c.discard.push(copy);
    log(c, `Bague du dieu dormant : une copie améliorée de ${CARDS[model.id].name} arrive dans ta main.`);
  }
  for (let i = 0; i < (gear.startExhaust ?? 0) && c.draw.length > 0; i++) {
    const [card] = c.draw.splice(Math.floor(random(c) * c.draw.length), 1);
    c.exhaust.push(card);
    log(c, `Lame de l'oubli : ${CARDS[card.id].name} est oubliée pour ce combat.`);
  }
  if (gear.startRandomBonus) {
    for (let i = 0; i < gear.startRandomBonus; i++) {
      const roll = gear.luck && random(c) < 0.5 ? 2 : Math.floor(random(c) * 4);
      if (roll === 0) p.puissance += 1;
      else if (roll === 1) p.robustesse += 1;
      else if (roll === 2) p.energy += 1;
      else p.block += 10;
      log(c, `Bonus chromatique : ${['+1 Puissance', '+1 Robustesse', '+1 énergie', '10 blocage'][roll]}.`);
    }
  }
  checkDebuffs(c);
  c.fx = [];
  if (encounter.rune) c.fx.push({ kind: 'banner', text: 'Ce boss porte la rune des Sources !' });
  if (encounter.weakened) c.fx.push({ kind: 'banner', text: 'L\'Eau des profondeurs affaiblit Vulkhar !' });
  // Acte 3 : la Folie de départ (le Cauchemar, la Statue qui murmure, le Rêve d'Yzhar).
  if ((encounter.startFolie ?? 0) + (gear.startFolie ?? 0) > 0) gainFolie(c, (encounter.startFolie ?? 0) + (gear.startFolie ?? 0));
  // Couronne d'Irem : le premier tour est sauté (la main retourne sur la pioche).
  if (gear.skipFirstTurn && !encounter.ambush) {
    c.draw.unshift(...c.hand.filter((card) => !isEthereal(card)));
    c.hand = [];
    c.player.energy = 0;
    c.skipTurn = true;
    c.fx.push({ kind: 'banner', text: 'Couronne d\'Irem : ton premier tour est sauté' });
    log(c, 'La Couronne d\'Irem pèse sur ta tête : tu perds ton premier tour.');
  }
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
  // Bouclier de mana : s'il reste du blocage, on pioche une carte de plus.
  const manaDraw = p.manaShield && p.block > 0 ? 1 : 0;
  p.manaShield = false;
  // Distorsion temporelle
  const distortion = p.distortion ? 2 : 0;
  // Garde de fer : on garde la moitié du blocage.
  // Éclat de suprématie : le blocage n'est pas retiré à la fin du premier tour.
  if (!(c.turn === 2 && c.gear?.keepFirstBlock)) p.block = power(c, 'garde_de_fer') > 0 ? Math.floor(p.block / 2) : 0;
  p.riposte = 0;
  p.fureur = Math.max(0, (p.fureur ?? 0) - 1);
  c.attacksThisTurn = 0;
  c.cleave = 0;
  p.energy = p.maxEnergy + (c.gear?.turnEnergy ?? 0);
  // Adrénaline ardente (Ysolde) : +3 énergie à chaque tour.
  if (c.adrenaline) p.energy += 3;
  c.killEnergyUsed = false;
  // Démoniste : Sacrifice démoniaque, Armure démoniaque, Siphon d'âme, Molosse infernal.
  if (c.petSacrificed) p.energy += 1;
  c.soulSiphon = c.shards !== undefined ? {} : undefined;
  c.freePactUsed = false;
  if (power(c, 'armure_demoniaque')) healPlayer(c, 1);
  // Prêtre : Grâce, Égide des anciens, Transfusion, et ses Pouvoirs de début de tour.
  c.costDown = false;
  if (c.renew && c.renew.turns > 0) {
    const healed = healPlayer(c, c.renew.amount);
    if (healed > 0) fx(c, { kind: 'heal', from: 'player', to: 'player', amount: healed });
    c.renew.turns -= 1;
  }
  if (power(c, 'meditation_sacree') && (c.aegis ?? 0) > 0) gainFaith(c, power(c, 'meditation_sacree'));
  if (power(c, 'lumiere_persistante')) gainAegis(c, power(c, 'lumiere_persistante'), false);
  if (power(c, 'ame_inebranlable')) gainAegis(c, 2, false);
  if (power(c, 'ascension')) gainFaith(c, 1);
  if (power(c, 'sol_sacre')) {
    for (const e of livingEnemies(c)) {
      if (e.submerged) continue;
      fx(c, { kind: 'tick', who: e.uid, amount: power(c, 'sol_sacre'), label: 'Sol sacré' });
      damageEnemy(c, e, power(c, 'sol_sacre'));
    }
    healPlayer(c, power(c, 'sol_sacre') - 1);
  }
  // Voleur : le Camouflage revient (Fumigène, Coup fourré, Seigneur des ombres), Danse des lames s'use.
  if (c.combo !== undefined) {
    if (c.turn > 1 && c.bladeDance && c.bladeDance.turns > 0) c.bladeDance.turns -= 1;
    if (c.stealthNext || power(c, 'seigneur_ombres')) enterStealth(c, 1);
    c.stealthNext = false;
    c.shadowStep = false;
    c.numbUsed = false;
    c.riposteCombo = 0;
    c.openersFree = false;
    p.evasion = false;
  }
  // Paladin : Fervent, Ailes de justice, Grâce du croisé ; le Sceau de sagesse fait piocher.
  const wisdomDraw = isPaladin(c) ? paladinStartTurn(c) : 0;
  // Chasseur : Feindre la mort et Tir rapide s'arrêtent, l'Esprit du guépard fait piocher.
  const aspectDraw = hunterStartTurn(c);
  // Druide : Rôder, Fureur du tigre et Écorce s'arrêtent ; Tranquillité soigne et protège.
  const tranquil = druidStartTurn(c);
  if (tranquil > 0) healPlayer(c, tranquil);
  // Chaman : Orbes de foudre, Cri des ancêtres (les totems agissent après la pioche).
  const ancestorsDraw = shamanStartTurn(c);
  felhunterStart(c, () => purifyOne(c));
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
  p.arcanePower = false;
  p.iceBlock = false;
  p.spellReflect = false;
  p.fireShield = 0;
  c.freeNext = false;
  c.freeNextSpell = false;
  c.mageSpellsThisTurn = 0;
  if (p.distortion) {
    p.energy += 1;
    p.distortion = false;
  }
  drawCards(c, Math.max(0, 5 + manaDraw + distortion + wisdomDraw + aspectDraw + ancestorsDraw + power(c, 'erudition') + (c.gear?.turnDraw ?? 0) - (p.drawPenalty ?? 0)));
  p.drawPenalty = 0;
  // Chaman : les totems agissent au début du tour.
  totemsAct(c);
  const d = (p.debuffs ??= emptyDebuffs());
  startTurnAct2(c);
  if (c.player.energy > 0 || c.hand.length > 0) {
    iremPlayerTurn(c);
    yzharPlayerTurn(c);
  }
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
  flecheStartTurn(c); // Corde-des-anciens
  // Pouvoirs du Mage
  if (power(c, 'esprit_vif')) gainCharges(c, power(c, 'esprit_vif'));
  if (power(c, 'coeur_de_glace')) for (const e of livingEnemies(c)) applyGel(c, e, power(c, 'coeur_de_glace'));
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
  const keys = (['demoralise', 'impie', 'arcane', 'toxine', 'peste', 'fracasse', 'lignee'] as const).filter((k) => (d[k] ?? 0) > 0);
  if (keys.length === 0) {
    // Sinon, une Affliction de sang (la bronze ne se dissipe pas).
    const i = d.afflictions?.findIndex((a) => a !== 'bronze') ?? -1;
    if (i >= 0) {
      d.afflictions!.splice(i, 1);
      log(c, 'Une Affliction de sang est dissipée.');
    }
    return;
  }
  const k = keys.reduce((a, b) => ((d[a] ?? 0) >= (d[b] ?? 0) ? a : b));
  d[k] = 0;
  log(c, 'Une malédiction est dissipée.');
}

/** Applique une malédiction ennemie au joueur. */
function applyCurse(c: CombatState, e: EnemyState, curse: PlayerCurse & { label: string }): void {
  const d = (c.player.debuffs ??= emptyDebuffs());
  const less = c.gear?.debuffReduce ?? 0;
  const turns = (n?: number) => Math.max(0, (n ?? 0) - less);
  // Écaille de Prismagor : les maléfices magiques glissent sur toi.
  if (c.gear?.magicImmune) {
    curse = { ...curse, demoralise: 0, impie: 0, arcane: 0, manaBurn: 0, energyLoss: 0, affliction: false, lignee: false };
  }
  if (curse.demoralise) d.demoralise = Math.max(d.demoralise, turns(curse.demoralise));
  if (curse.impie) d.impie = Math.max(d.impie, turns(curse.impie));
  if (curse.arcane) d.arcane = Math.max(d.arcane, turns(curse.arcane));
  if (curse.manaBurn) d.manaBurn += curse.manaBurn;
  if (curse.panic) d.panic += curse.panic;
  if (curse.fardeau) addStatusToDraw(c, 'fardeau', curse.fardeau);
  if (curse.bomb) addStatusToHand(c, 'bombe_vivante', curse.bomb);
  // Acte 2
  if (curse.toxine) d.toxine = Math.max(d.toxine ?? 0, turns(curse.toxine));
  if (curse.peste && !c.gear?.pesteImmune) d.peste = Math.max(d.peste ?? 0, turns(curse.peste));
  if (curse.ralenti) d.ralenti = Math.max(d.ralenti ?? 0, turns(curse.ralenti) + 1);
  if (curse.fracasse) d.fracasse = Math.max(d.fracasse ?? 0, turns(curse.fracasse) + 1);
  if (curse.ombre) d.ombre = Math.min(c.gear?.stackCap ?? 99, (d.ombre ?? 0) + curse.ombre);
  if (curse.discard) d.discard = (d.discard ?? 0) + curse.discard;
  if (curse.cendres) addStatusToHand(c, 'cendres', curse.cendres);
  if (curse.energyLoss) d.manaBurn += curse.energyLoss;
  if (curse.affliction && !c.gear?.afflictionImmune) {
    const have = (d.afflictions ??= []);
    const free = Object.keys(AFFLICTIONS).filter((a) => !have.includes(a));
    if (free.length > 0) {
      const a = free[Math.floor(random(c) * free.length)];
      have.push(a);
      fx(c, { kind: 'buff', who: 'player', label: `Affliction ${a}` });
      log(c, `Affliction de sang : ${AFFLICTIONS[a]}.`);
    }
    if (have.length >= 5) {
      d.transformed = true;
      fx(c, { kind: 'banner', text: 'Tu es Transformé !' });
      log(c, 'Les cinq sangs se mêlent en toi : tu es Transformé, tu perds ton prochain tour.');
    }
  }
  if (curse.lignee && !c.gear?.lineageImmune) lineageCurse(c);
  // Acte 3 : la Folie, le Sable
  if (curse.sable) addStatusToDraw(c, 'sable', curse.sable);
  if (curse.sableHand) addStatusToHand(c, 'sable', curse.sableHand);
  for (let i = 0; i < (curse.hallucinations ?? 0); i++) addHallucination(c);
  if (curse.domination) c.dominated = true;
  // Yzhar
  if (curse.petStun) stunPet(c, curse.petStun);
  if (curse.regard) {
    c.regard = curse.regard;
    fx(c, { kind: 'banner', text: 'Regard sombre : mets-toi à couvert !' });
  }
  if (curse.swallow) swallow(c);
  fx(c, { kind: 'buff', who: 'player', label: curse.label });
  if (curse.folie) gainFolie(c, curse.folie);
  log(c, `${e.name} : ${curse.label}.`);
}

// --- Actions du joueur ---

export function resolveTarget(c: CombatState, needsTarget: boolean, targetUid?: number, attack = false): EnemyState | null | 'invalid' {
  if (!needsTarget) return null;
  // Envol : les Attaques à cible unique ne peuvent pas viser un ennemi en vol (les Sorts, si).
  const alive = livingEnemies(c).filter((e) => !e.submerged && !e.untargetable && !(attack && e.flying));
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
  const shards = shardCost(c, card.id, card.upgraded);
  if (shards === 'all' ? (c.shards ?? 0) === 0 : shards > (c.shards ?? 0)) return false;
  // Prêtre : le coût en Foi.
  if (def.faithCost === 'all' ? (c.faith ?? 0) === 0 : (def.faithCost ?? 0) > (c.faith ?? 0)) return false;
  // Voleur : une Ouverture ne se joue qu'en Camouflage.
  if (def.opener && !stealthed(c, def.type === 'Attaque')) return false;
  return true;
}

/** Pourquoi une carte de la main ne peut pas être jouée (null : elle peut l'être). Les mêmes règles que canPlayCard. */
export function cardBlockReason(c: CombatState, handIndex: number): string | null {
  const card = c.hand[handIndex];
  if (!card || canPlayCard(c, handIndex)) return null;
  if (c.phase !== 'player') return 'Ce n\'est pas ton tour.';
  const def = CARDS[card.id];
  if (def.unplayable) return 'Cette carte ne se joue pas.';
  if (c.panicked?.includes(card.uid)) return 'Paniquée : elle ne se joue pas ce tour-ci.';
  const cost = energyCost(c, card.id, card.upgraded);
  if (cost > c.player.energy) return `Pas assez d'énergie : il en faut ${cost}, tu en as ${c.player.energy}.`;
  if (typeof def.rageCost === 'number' && def.rageCost > c.player.rage) return `Pas assez de rage : il en faut ${def.rageCost}, tu en as ${c.player.rage}.`;
  if (def.rageCost === 'all' && c.player.rage === 0) return 'Il te faut de la rage.';
  const shards = shardCost(c, card.id, card.upgraded);
  if (shards === 'all' ? (c.shards ?? 0) === 0 : shards > (c.shards ?? 0)) return shards === 'all' ? 'Il te faut au moins 1 éclat d\'âme.' : `Pas assez d'éclats d'âme : il en faut ${shards}.`;
  if (def.faithCost === 'all' ? (c.faith ?? 0) === 0 : (def.faithCost ?? 0) > (c.faith ?? 0)) return def.faithCost === 'all' ? 'Il te faut de la Foi.' : `Pas assez de Foi : il en faut ${def.faithCost}.`;
  if (def.opener) return 'Une Ouverture ne se joue que Camouflé.';
  return 'Cette carte ne peut pas être jouée maintenant.';
}

/**
 * La carte demande-t-elle une cible ? Une carte Sceau rejouée alors que son Sceau est actif le juge :
 * elle vise alors un ennemi si ce Jugement en a besoin (Droiture, Croisé, Vengeance).
 */
export function cardNeedsTarget(c: CombatState, cardId: string): boolean {
  const def = CARDS[cardId];
  if (def.needsTarget) return true;
  return !!def.sealId && hasSeal(c, def.sealId) && SEAL_JUDGE_TARGET.includes(def.sealId);
}

export function playCard(c: CombatState, handIndex: number, targetUid?: number): boolean {
  if (!canPlayCard(c, handIndex)) return false;
  const card = c.hand[handIndex];
  const def = CARDS[card.id];
  const target = resolveTarget(c, cardNeedsTarget(c, card.id), targetUid, def.type === 'Attaque');
  if (target === 'invalid') return false;

  const p = c.player;
  const cost = energyCost(c, card.id, card.upgraded);
  p.energy -= cost;
  // Les éclats d'âme ; la cible retenue par le familier ; Contrecoup.
  const shards = shardCost(c, card.id, card.upgraded);
  const shardsSpent = shards === 'all' ? c.shards ?? 0 : shards;
  if (c.shards !== undefined) c.shards -= shardsSpent;
  if (target) c.lastTarget = target.uid;
  if (card.id === 'trait_ombre' && c.shadowFree) c.shadowFree = false;
  // Prêtre : la Foi dépensée.
  const faithSpent = def.faithCost === 'all' ? c.faith ?? 0 : def.faithCost ?? 0;
  if (c.faith !== undefined) c.faith -= faithSpent;
  c.healedFlag = false;
  // Inspiration et Présence d'esprit ne servent qu'une fois.
  if (c.freeNext) c.freeNext = false;
  else if (c.freeNextSpell && def.type === 'Sort') c.freeNextSpell = false;
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

  // Voleur : un coup final consomme tous les points de combo (Impitoyable : un de plus).
  const comboHeld = c.combo ?? 0;
  const comboSpent = def.finisher && c.combo !== undefined ? comboHeld + (c.gear?.ruthless ?? 0) : undefined;
  if (def.finisher && c.combo !== undefined) c.combo = 0;
  // Domination mentale (Méhkar) : cette Attaque te frappe toi-même.
  if (c.dominated && def.type === 'Attaque') {
    c.dominated = false;
    const ctx0: PlayContext = { c, target, up: card.upgraded, rageSpent, dealt: false, shardsSpent, faithSpent, comboSpent };
    const exhaust0 = card.upgraded && def.exhaustUp !== undefined ? def.exhaustUp : def.exhaust;
    dominatedAttack(c, card, () => {
      c.playing = { cost, type: def.type, id: card.id, school: def.school, aoe: !def.needsTarget, opener: def.opener };
      def.play(ctx0);
      c.playing = undefined;
    }, !!exhaust0);
    return true;
  }
  if (card.id === 'hallucination') dreamEnergy(c);
  const ctx: PlayContext = { c, target, up: card.upgraded, rageSpent, dealt: false, shardsSpent, faithSpent, comboSpent };
  const attack = def.type === 'Attaque';
  c.cleaving = attack && (c.cleave ?? 0) > 0;
  const blockBefore = p.block;
  // Ambidextrie experte : la première Attaque du tour est jouée deux fois.
  let twice = attack && c.combo !== undefined && power(c, 'ambidextrie_experte') > 0 && (c.attacksThisTurn ?? 0) === 0;
  // Arme des vents (Chaman) : la première Attaque du tour frappe une fois de plus (deux avec Rafale).
  const windfury = isShaman(c) ? windfuryExtra(c, attack) : 0;
  // Bague des reflets : une fois par combat, la première carte de Sort est jouée deux fois.
  if (def.type === 'Sort' && c.gear?.firstSpellTwice && !c.spellTwiceUsed) {
    c.spellTwiceUsed = true;
    twice = true;
  }
  c.playing = { cost, type: def.type, id: card.id, school: def.school, aoe: !def.needsTarget && (def.type === 'Attaque' || def.type === 'Sort'), opener: def.opener, form: def.form };
  def.play(ctx);
  if (twice && c.phase === 'player' && (!target || !target.dead)) def.play(ctx);
  for (let i = 0; i < windfury && c.phase === 'player' && (!target || !target.dead); i++) def.play(ctx);
  c.playing = undefined;
  if (c.combo !== undefined) afterRogueCard(c, def, comboHeld, attack);
  // Butin : Masse des flammes, Croc des trois souffles, Croc de Prismagor.
  if (ctx.dealt && target && !target.dead && !target.submerged) onHitItems(c, target, def.type);
  if (def.type === 'Sort' && ctx.dealt) p.enrageReady = 0;
  // Prêtre : une carte qui soigne ou donne de l'Égide rapporte 1 Foi ; Expiation, Étreinte vampirique.
  if (c.faith !== undefined) {
    if (c.healedFlag) gainFaith(c, 1);
    c.healedFlag = false;
    if (def.type === 'Sort' && ctx.dealt && power(c, 'expiation')) healPlayer(c, power(c, 'expiation'));
    if (def.school === 'ombre' && ctx.dealt && power(c, 'etreinte_vampirique')) healPlayer(c, power(c, 'etreinte_vampirique') + (c.gear?.vampHunger ?? 0));
  }
  // Pacte de destruction : seul le prochain Sort qui fait des dégâts est doublé.
  if (def.type === 'Sort' && ctx.dealt && card.id !== 'pacte_destruction') c.doubleNext = false;
  if (c.cleaving) c.cleave = (c.cleave ?? 1) - 1;
  // Concentration arcanique : le 3e Sort du tour rend de l'énergie.
  if (def.type === 'Sort') {
    c.mageSpellsThisTurn = (c.mageSpellsThisTurn ?? 0) + 1;
    if (c.mageSpellsThisTurn === 3 && power(c, 'concentration_arcanique')) {
      p.energy += power(c, 'concentration_arcanique');
      fx(c, { kind: 'buff', who: 'player', label: 'Concentration arcanique : +1 énergie' });
    }
  }
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
  // Paladin : Sceau de lumière et du rempart, Faveur divine, Science du combat.
  if (isPaladin(c)) afterPaladinCard(c, def, attack);
  // Chasseur : Concentration et Respiration lente ne servent qu'à une Attaque.
  if (isHunter(c)) afterHunterCard(c, attack);
  // Druide : rage des Attaques d'Ours, Rôder, Éclipse, Grâce de la nature, Convergence céleste.
  if (isDruid(c)) afterDruidCard(c, def, cost, ctx.dealt);
  // Chaman : Arme de givre, Esprit combatif, Arme tourbillonnante, Concentration élémentaire, Avatar de la tempête.
  if (isShaman(c)) afterShamanCard(c, def, cost, target, ctx.dealt);
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
    if (g.healOnAttack) healPlayer(c, g.healOnAttack);
  }
  // Sceptre de Brannoc : la version incantation soigne quand un Sort touche.
  if (def.type === 'Sort' && ctx.dealt && c.gear?.healOnAttack) healPlayer(c, c.gear.healOnAttack);
  if (def.type === 'Attaque' || def.type === 'Sort') c.firstAttackDone = true;
  // Bague du lien royal : une Attaque et un Sort dans le même tour, pioche 1 (1 fois par tour).
  if (c.gear?.mixDraw && !c.mixDrawUsed && (c.attacksThisTurn ?? 0) > 0 && (c.mageSpellsThisTurn ?? 0) > 0) {
    c.mixDrawUsed = true;
    drawCards(c, c.gear.mixDraw);
  }
  if (card.id === 'zone_de_feu' && c.gear?.zoneBlock) gainBlock(c, c.gear.zoneBlock, false);
  const exhaust = card.upgraded && def.exhaustUp !== undefined ? def.exhaustUp : def.exhaust;
  if (def.type === 'Pouvoir' || exhaust) {
    c.exhaust.push(card);
  } else {
    c.discard.push(card);
  }
  checkDebuffs(c);
  return true;
}

export function canUseSpell(c: CombatState, index: number): boolean {
  const s = c.spells[index];
  if (!s || c.phase !== 'player') return false;
  const def = SPELLS[s.id];
  // Dans les entrailles d'Yzhar, pas de barre de sorts.
  if (c.swallowed) return false;
  if (def.usable && !def.usable(c)) return false;
  return s.cooldown === 0 && def.cost <= c.player.energy && (def.shardCost ?? 0) <= (c.shards ?? 0);
}

export function useSpell(c: CombatState, index: number, targetUid?: number): boolean {
  if (!canUseSpell(c, index)) return false;
  const s = c.spells[index];
  const def = SPELLS[s.id];
  const target = resolveTarget(c, def.needsTarget, targetUid, ['guerrier', 'voleur', 'chasseur'].includes(def.classId ?? 'guerrier'));
  if (target === 'invalid') return false;
  c.player.energy -= def.cost;
  if (def.shardCost && c.shards !== undefined) c.shards -= def.shardCost;
  if (target) c.lastTarget = target.uid;
  // Les sorts de barre du Mage et du Démoniste sont des Sorts (bonus aux Sorts, Malédiction des éléments).
  const spellClass = def.classId ?? 'guerrier';
  if (!['guerrier', 'voleur', 'paladin', 'chasseur'].includes(spellClass) && !SPELLS[s.id].noSpell) c.playing = { cost: def.cost, type: 'Sort', id: def.id, aoe: !def.needsTarget };
  def.cast(c, target);
  c.playing = undefined;
  s.cooldown = def.once ? 999 : spellCooldown(def, c.gear);
  log(c, `Tu lances ${def.name}.`);
  checkDebuffs(c);
  if (def.endsTurn && c.phase === 'player') endTurn(c);
  return true;
}

export function changePosture(c: CombatState, posture: Posture): boolean {
  const p = c.player;
  if (c.phase !== 'player' || p.postureChanged || p.posture === posture) return false;
  if ((p.debuffs?.lignee ?? 0) > 0) return false; // Malédiction de lignée : forcé en Berserker
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
  // Yzhar : le Regard sombre, la Carapace qui se reforme, la sortie des entrailles.
  yzharEndTurn(c);
  if (c.phase !== 'player') return;

  // Les Zones de feu encore en main brûlent le joueur.
  const zones = c.hand.filter((card) => card.id === 'zone_de_feu');
  // Aura de résistance (Paladin) : les Zones de feu font moitié moins mal.
  const zoneCut = (c.gear?.zoneReduce ?? 0) + (c.aura?.id === 'resistance' ? 50 : 0);
  const zoneDmg = c.fireProof ? 0 : Math.round(6 * (1 - Math.min(100, zoneCut) / 100));
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
  // La Flèche des anciens (Corde-des-anciens) reste en main : l'arc se tend.
  const kept = c.hand.filter((card) => card.id === 'fleche_anciens');
  const rest = c.hand.filter((card) => card.id !== 'fleche_anciens');
  const gone = rest.filter((card) => isEthereal(card));
  c.exhaust.push(...gone);
  c.discard.push(...rest.filter((card) => !isEthereal(card)));
  c.hand = kept;
  c.panicked = [];
  // La Domination mentale ne dure que le tour qui la suit.
  c.dominated = false;
  const d = p.debuffs;
  if (d) {
    d.demoralise = Math.max(0, d.demoralise - 1);
    d.impie = Math.max(0, d.impie - 1);
    d.arcane = Math.max(0, d.arcane - 1);
    d.peste = Math.max(0, (d.peste ?? 0) - 1);
    d.ralenti = Math.max(0, (d.ralenti ?? 0) - 1);
    d.fracasse = Math.max(0, (d.fracasse ?? 0) - 1);
    d.lignee = Math.max(0, (d.lignee ?? 0) - 1);
  }
  // Dragonnet de compagnie
  if (c.gear?.petDamage && c.phase === 'player') {
    const pool = livingEnemies(c).filter((e) => !e.submerged);
    if (pool.length > 0) {
      const t = pool[Math.floor(random(c) * pool.length)];
      fx(c, { kind: 'tick', who: t.uid, amount: c.gear.petDamage, label: 'Dragonnet' });
      damageEnemy(c, t, c.gear.petDamage);
    }
  }
  // Adrénaline ardente : 3, puis 5, puis 7… PV perdus.
  if (c.adrenaline && c.phase === 'player' && c.enemies.some((e) => e.defId === 'ysolde' && !e.dead)) {
    const loss = c.adrenaline;
    p.hp = Math.max(0, p.hp - loss);
    fx(c, { kind: 'tick', who: 'player', amount: loss, label: 'Adrénaline' });
    log(c, `L'Adrénaline ardente te consume : ${loss} PV.`);
    c.adrenaline += 2;
    if (p.hp <= 0) c.phase = 'defeat';
  }
  // Fiole de démesure : des PV perdus à la fin de chaque tour.
  if (c.gear?.endTurnLoss && c.phase === 'player') {
    fx(c, { kind: 'tick', who: 'player', amount: c.gear.endTurnLoss, label: 'Démesure' });
    log(c, `La Fiole de démesure te consume : ${c.gear.endTurnLoss} PV.`);
    damagePlayer(c, c.gear.endTurnLoss, false);
  }
  // Surcharge : à 4 charges arcaniques ou plus, le Mage perd 2 PV.
  if ((p.charges ?? 0) >= 4 && !c.gear?.noOverload && c.phase === 'player') {
    p.hp = Math.max(0, p.hp - 2);
    fx(c, { kind: 'tick', who: 'player', amount: 2, label: 'Surcharge' });
    log(c, 'Surcharge : la magie arcanique te brûle (2 PV).');
    if (p.hp <= 0) c.phase = 'defeat';
  }
  if (c.phase !== 'player') return;

  p.blockedFullAttack = false;
  // Voleur : le Camouflage s'use à la fin du tour.
  if (c.stealth) {
    c.stealthTurns = (c.stealthTurns ?? 1) - 1;
    if (c.stealthTurns <= 0) breakStealth(c);
  }
  c.shadowStep = false;
  // Paladin : la Consécration brûle le sol.
  if (isPaladin(c)) paladinEndTurn(c);
  if (c.phase !== 'player') return;
  // Le familier agit, puis le Seigneur infernal ; le Molosse guette les incantations.
  petAct(c);
  if (c.infernal && c.phase === 'player') {
    for (const e of livingEnemies(c)) {
      if (e.submerged || c.phase !== 'player') continue;
      fx(c, { kind: 'tick', who: e.uid, amount: c.infernal, label: 'Seigneur infernal' });
      damageEnemy(c, e, c.infernal);
    }
  }
  if (c.phase !== 'player') return;
  // Chasseur : le compagnon et le Loup spectral. Druide : les Sylvains.
  hunterEndTurn(c);
  druidEndTurn(c);
  if (c.phase !== 'player') return;
  felhunterLock(c);
  checkDebuffs(c);
  enemyTurn(c);
  checkDebuffs(c);
  if (c.phase === 'player') startPlayerTurn(c);
  checkDebuffs(c);
}

function enemyDamage(c: CombatState, e: EnemyState, base: number, intent: Intent = e.intent): number {
  const d = c.player.debuffs;
  // Sanctuaire (Paladin) : chaque attaque ennemie inflige moins de dégâts.
  // Regard du dieu (Nebet) : plus fort si tu as 5 Folie ou plus.
  if (intent.kind === 'attack' && intent.madBonus && (c.folie ?? 0) >= 5) base += intent.madBonus;
  let dmg = base + e.buffs.puissance + (e.giant ? 5 : 0) + 2 * (d?.ombre ?? 0) + (c.gear?.extraHurt ?? 0) - (e.fatigue ?? 0) - power(c, 'sanctuaire');
  if ((d?.fracasse ?? 0) > 0) dmg *= 1.5;
  if (d?.afflictions?.includes('noire')) dmg *= 1.2;
  if (intent.kind === 'attack' && intent.breath && c.gear?.breathReduce) dmg *= 1 - c.gear.breathReduce / 100;
  if (e.buffs.demoralise > 0) dmg *= 0.75;
  if (c.player.posture === 'berserker') dmg *= 1.2;
  if (c.player.temerite) dmg *= 1.25;
  if ((c.player.fureur ?? 0) > 0) dmg *= 1.25;
  if (c.player.evasion) dmg *= 0.5; // Évasion du Voleur
  if (e.disarmed) dmg *= 0.7; // un boss désarmé frappe moins fort
  if (e.gele === 'half') dmg *= 0.5; // un boss Gelé
  if (e.vengeance) dmg *= 1.5; // Vengeance royale (Triade de la Ruche)
  // Difficulté : les ennemis normaux et les gardiens frappent plus fort.
  const def = ENEMIES[e.defId];
  if (c.mods) dmg *= def.boss ? c.mods.bossDmg ?? 1 : def.elite ? c.mods.eliteDmg : c.mods.normalDmg;
  if (isEnraged(c) && (ENEMIES[e.defId].elite || ENEMIES[e.defId].boss)) dmg *= 2;
  // Amulette gélatineuse : les grosses attaques sont amorties.
  if (intent.kind === 'attack' && c.gear?.bigHitReduce && dmg >= 10) dmg -= c.gear.bigHitReduce;
  // Écaille de Prismagor, Carapace divine : un pourcentage de dégâts en plus ou en moins.
  if (c.gear?.hurtPct) dmg *= 1 + c.gear.hurtPct / 100;
  // Chasseur : Esprit du guépard, Feindre la mort.
  if (intent.kind === 'attack') dmg = druidDamageTaken(c, hunterDamageTaken(c, dmg));
  return Math.max(0, Math.floor(dmg));
}

export function isEnraged(c: CombatState): boolean {
  // Flèche apaisante : le Berserk est suspendu pendant ce tour.
  if (c.soothedTurn === c.turn) return false;
  return c.enrageTurn !== null && c.turn >= c.enrageTurn;
}

function resolveIntent(c: CombatState, e: EnemyState, intent: Intent): void {
  switch (intent.kind) {
    case 'attack': {
      // Asservissement : il frappe ses alliés à ta place.
      if ((e.enslaved ?? 0) > 0) {
        const victim = livingEnemies(c).find((o) => o !== e && !o.submerged);
        if (victim) {
          const dmg = Math.max(0, intent.dmg + e.buffs.puissance) * (intent.times ?? 1);
          fx(c, { kind: 'tick', who: victim.uid, amount: dmg, label: 'Asservi' });
          damageEnemy(c, victim, dmg);
          log(c, `${e.name}, asservi, frappe ${victim.name} (${dmg} dégâts).`);
        } else {
          log(c, `${e.name}, asservi, n'a personne à frapper.`);
        }
        break;
      }
      // Désarmement : un ennemi normal n'attaque pas ce tour-ci.
      if (e.disarmed && !ENEMIES[e.defId].elite && !ENEMIES[e.defId].boss) {
        log(c, `${e.name} est désarmé : il n'attaque pas.`);
        break;
      }
      // Mutation Frénésie : attaque deux fois.
      const times = (intent.times ?? 1) * (e.mutated && e.mutations?.includes('frenesie') ? 2 : 1);
      const base = intent.dmg + (intent.grow ?? 0) * (e.counter ?? 0);
      if (intent.grow) e.counter = (e.counter ?? 0) + 1;
      for (let i = 0; i < times && c.phase === 'player'; i++) {
        const dmg = enemyDamage(c, e, base, intent);
        // Frappe perçante (acte 3) : le blocage est ignoré (il reste en place pour les coups suivants).
        const blockBefore = intent.pierce ? 0 : c.player.block;
        const kept = intent.pierce ? c.player.block : 0;
        if (intent.pierce) c.player.block = 0;
        fx(c, { kind: 'hit', from: e.uid, to: 'player', amount: dmg, blocked: Math.min(blockBefore, dmg), ranged: !!intent.cast });
        const aegisBefore = c.aegis ?? 0;
        const lost = damagePlayer(c, dmg, true);
        if (intent.pierce) c.player.block += kept;
        // Paladin : épines sacrées, Pavois, Bouclier du croisé, Fervent, Juste châtiment.
        paladinOnAttacked(c, e, dmg, blockBefore - c.player.block, lost);
        // Chasseur : Contre-attaque, Riposte sauvage.
        hunterOnAttacked(c, e, dmg, Math.min(blockBefore, dmg));
        druidOnAttacked(c, e, dmg);
        shamanOnAttacked(c, e, dmg);
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
          if (c.riposteCombo) gainCombo(c, c.riposteCombo); // Riposte du Voleur
          c.riposteCombo = 0;
        }
        const reflect = (c.gear?.blockReflect ?? 0) + (lost === 0 ? power(c, 'riposte_bouclier') : 0);
        if (reflect > 0 && dmg > 0 && lost === 0 && c.phase === 'player' && !e.dead) {
          fx(c, { kind: 'tick', who: e.uid, amount: reflect, label: 'Renvoi' });
          damageEnemy(c, e, reflect);
        }
        // Égide des anciens : un coup absorbé (même en partie) par l'Égide est renvoyé.
        if (c.aegisThorns && (c.aegis ?? 0) < aegisBefore && c.phase === 'player' && !e.dead) {
          fx(c, { kind: 'tick', who: e.uid, amount: c.aegisThorns, label: 'Égide' });
          damageEnemy(c, e, c.aegisThorns);
        }
        if (e.dead) break;
      }
      // Gelé (boss) : seule la prochaine attaque est réduite.
      if (e.gele === 'half') e.gele = undefined;
      // L'effet de l'attaque : Toxine, Peste, Ralenti, Ombre rongeuse, Affliction…
      if (intent.effect && c.phase === 'player') applyCurse(c, e, intent.effect);
      // Réflexion des sorts : une incantation renvoie la moitié de ses dégâts.
      if (c.player.spellReflect && intent.cast && !e.dead && c.phase === 'player') {
        const back = Math.floor(enemyDamage(c, e, base, intent) * times / 2);
        if (back > 0) {
          fx(c, { kind: 'tick', who: e.uid, amount: back, label: 'Réflexion' });
          damageEnemy(c, e, back);
        }
      }
      // Armure de lave, Armure de givre, Bouclier de feu ancestral : l'attaquant en paie le prix.
      if (!e.dead && c.phase === 'player') {
        const burn = power(c, 'armure_de_lave') + (c.player.fireShield ?? 0);
        if (burn > 0) applyBrulure(c, e, burn);
        if (power(c, 'armure_de_givre')) applyGel(c, e, power(c, 'armure_de_givre'));
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
        const n = Math.min(intent.count ?? 1, intent.max - alive);
        let add = null;
        for (let i = 0; i < n; i++) {
          add = makeEnemy(c, intent.id);
          // Le nouvel add se place à côté de son maître.
          c.enemies.splice(c.enemies.indexOf(e), 0, add);
        }
        fx(c, { kind: 'buff', who: e.uid, label: intent.label });
        log(c, `${e.name} : ${intent.label}. ${n > 1 ? `${n} ${add!.name}s arrivent` : `Un ${add!.name} arrive`}.`);
      } else {
        log(c, `${e.name} tente un ${intent.label}, mais tous ses éclats sont là.`);
      }
      break;
    }
    case 'blink':
      if (intent.flight) {
        e.flying = true;
        fx(c, { kind: 'buff', who: e.uid, label: 'Envol' });
        log(c, `${e.name} s'envole : tes Attaques ne peuvent plus le viser jusqu'à son prochain tour.`);
        break;
      }
      e.untargetable = true;
      fx(c, { kind: 'buff', who: e.uid, label: 'Clignement' });
      log(c, `${e.name} se dérobe : il ne peut pas être ciblé jusqu'à son prochain tour.`);
      break;
    case 'idle':
      log(c, `${e.name} : ${intent.label.toLowerCase()}.`);
      break;
    case 'hatch':
      hatch(c, e, intent);
      break;
    case 'potion':
      drinkGrizzik(c, e, intent.potion);
      break;
    case 'burrow':
      // Ensevelissement : il ne peut plus être ciblé (les DoT et les zones le touchent) jusqu'à ce qu'il resurgisse.
      e.buried = intent.turns;
      e.untargetable = true;
      fx(c, { kind: 'buff', who: e.uid, label: 'S\'enfouit' });
      log(c, `${e.name} s'enfouit dans le sable : tu ne peux plus le cibler.`);
      break;
    case 'heal': {
      // Soins royaux : tous les alliés.
      if (intent.all) {
        const others = livingEnemies(c).filter((o) => o !== e && !o.noHeal);
        for (const o of others) {
          const healed = Math.min(intent.amount, o.maxHp - o.hp);
          o.hp += healed;
          if (healed > 0) fx(c, { kind: 'heal', from: e.uid, to: o.uid, amount: healed });
        }
        log(c, `${e.name} lance ${intent.cast ?? 'un soin'} : ses alliés récupèrent jusqu'à ${intent.amount} PV.`);
        break;
      }
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
  // Chasseur : les Pièges se déclenchent sur le premier ennemi qui agit.
  springTraps(c);
  for (const e of [...c.enemies]) {
    c.dotTicking = false;
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
    e.flying = false;
    enemyPassivesAct2(c, e);
    if (e.dead) continue;
    const frozen = iremEnemyStart(c, e);
    yzharEnemyStart(c, e);
    if (c.phase !== 'player') break;
    // Passifs de début de tour
    if (e.defId === 'gardien') {
      e.block += TUNING.gardienBlock;
      fx(c, { kind: 'block', who: e.uid, amount: TUNING.gardienBlock });
    }
    if (e.defId === 'gorlok') {
      const shards = livingEnemies(c).filter((o) => o.defId === 'eclat').length;
      if (shards > 0) {
        const b = TUNING.gorlokBlockPerShard * shards;
        e.block += b;
        fx(c, { kind: 'block', who: e.uid, amount: b });
        log(c, `Ses ${shards} éclat${shards > 1 ? 's' : ''} protègent Gorlok (+${b} blocage).`);
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

    // Les dégâts dans le temps (Saignement, Censure, DoT, Brûlure) passent sous la Carapace divine d'Yzhar.
    c.dotTicking = true;
    // Saignement
    if (e.buffs.saignementTours > 0 && e.buffs.saignement > 0) {
      const bleed = e.buffs.saignement + hiddenDotBonus(c, e);
      log(c, `${e.name} saigne : ${bleed} dégâts.`);
      fx(c, { kind: 'tick', who: e.uid, amount: bleed, label: 'Saignement' });
      damageEnemy(c, e, bleed, true);
      e.buffs.saignementTours -= 1;
      if (e.buffs.saignementTours === 0) e.buffs.saignement = 0;
      if (e.dead) continue;
    }
    // La Censure du Paladin
    if ((e.buffs.censure ?? 0) > 0) {
      censureTick(c, e);
      if (e.dead || c.phase !== 'player') continue;
    }
    // Les DoT du Démoniste
    if (e.dots?.length) {
      triggerDots(c, e, true);
      if (e.dead || c.phase !== 'player') continue;
    }
    // Brûlure (Chaleur intense l'attise d'abord)
    if ((e.buffs.brulure ?? 0) > 0) {
      e.buffs.brulure! += power(c, 'chaleur_intense');
      const burn = e.buffs.brulure!;
      const burnDmg = burn + hiddenDotBonus(c, e);
      log(c, `${e.name} brûle : ${burnDmg} dégâts.`);
      fx(c, { kind: 'tick', who: e.uid, amount: burnDmg, label: 'Brûlure' });
      damageEnemy(c, e, burnDmg, true);
      if (!(c.gear?.bossBurnKeep && isBossEnemy(e))) e.buffs.brulure = Math.max(0, burn - 1);
      if (e.dead || c.phase !== 'player') continue;
    }

    c.dotTicking = false;

    // Ensevelissement (acte 3) : il reste sous le sable, puis resurgit et frappe.
    if ((e.buried ?? 0) > 0) {
      e.buried! -= 1;
      if (e.buried! > 0) {
        e.untargetable = true;
        log(c, `${e.name} se déplace sous le sable.`);
        decayBuffs(e);
        decayPoison(c, e);
        continue;
      }
      fx(c, { kind: 'buff', who: e.uid, label: 'Surgit !' });
      log(c, `${e.name} surgit du sable !`);
      e.surfaced = true;
    }

    // Malédiction des langages : l'Incantation prend un tour de plus.
    if (e.intent.cast && (e.tongues ?? 0) > 0 && !e.delayed && !e.interrupted) {
      e.tongues! -= 1;
      e.delayed = true;
      log(c, `${e.name} bafouille : son incantation prend un tour de plus.`);
    }
    if (frozen) {
      // Le Limon Figé ne fait rien (voir irem.ts).
    } else if ((e.stun ?? 0) > 0) {
      e.stun! -= 1;
      log(c, `${e.name} est Contrôlé et ne fait rien.`);
    } else if ((e.sap ?? 0) > 0) {
      e.sap! -= 1;
      log(c, `${e.name} est assommé et ne fait rien.`);
    } else if ((e.buffs.peur ?? 0) > 0) {
      e.buffs.peur! -= 1;
      log(c, `${e.name} est apeuré et ne fait rien.`);
    } else if ((e.mouton ?? 0) > 0) {
      e.mouton! -= 1;
      log(c, `${e.name} broute, transformé en mouton.`);
    } else if (e.gele === 'skip') {
      e.gele = undefined;
      log(c, `${e.name} est Gelé : il ne peut pas agir.`);
    } else if (e.interrupted) {
      log(c, `${e.name} ne peut pas agir : son incantation a été interrompue.`);
      e.interrupted = false;
    } else if (e.delayed) {
      log(c, `${e.name} reprend son incantation.`);
      e.delayed = false;
      decayBuffs(e);
      decayPoison(c, e);
      continue; // garde la même intention pour le tour suivant
    } else if (e.intent.cast && c.gear?.castCancel && !c.orbUsed) {
      // Orbe de distorsion : la première incantation du combat est annulée.
      c.orbUsed = true;
      fx(c, { kind: 'interrupt', who: e.uid });
      log(c, `L'Orbe de distorsion annule ${e.intent.cast} !`);
    } else {
      resolveIntent(c, e, e.intent);
      // Potion de vitesse : Grizzik agit une deuxième fois.
      if (e.haste && !e.dead && c.phase === 'player') {
        e.haste = false;
        log(c, `${e.name}, survolté, agit encore !`);
        resolveIntent(c, e, { kind: 'attack', dmg: 9 });
      }
    }

    decayBuffs(e);
    decayPoison(c, e);
    if ((e.buffs.gel ?? 0) > 0 && !c.gear?.gelKeep) e.buffs.gel! -= 1;
    decayCurses(e);
    if ((e.enslaved ?? 0) > 0) e.enslaved! -= 1;
    e.disarmed = false;
    e.step += 1;
    e.intent = intentAt(ENEMIES[e.defId], e.step, e.phase ?? 1, e.hp < e.maxHp / 2);
    fixIntent(c, e);
    // Vulkhar affaibli : son premier Marteau des flammes arrive un tour plus tard.
    if (e.delayHammer && e.intent.cast === 'Marteau des flammes') {
      e.delayHammer = false;
      e.step -= 1;
      e.intent = { kind: 'attack', dmg: 12 };
      log(c, 'Affaibli par l\'eau, Vulkhar met plus de temps à lever son marteau.');
    }
  }
  // Le Grand Intendant renforce un garde et change de bouclier (annoncé un tour à l'avance).
  const saldris = c.enemies.find((e) => e.defId === 'saldris' && !e.dead);
  if (saldris && c.phase === 'player') {
    const guards = livingEnemies(c).filter((e) => e.defId === 'pretre' || e.defId === 'gardien');
    if (guards.length > 0) {
      const g = guards[Math.floor(random(c) * guards.length)];
      g.block += TUNING.saldrisGuardBlock;
      fx(c, { kind: 'block', who: g.uid, amount: TUNING.saldrisGuardBlock });
      log(c, `Saldris protège ${g.name} (+${TUNING.saldrisGuardBlock} blocage).`);
    }
    saldris.shield = saldris.shield === 'coups' ? 'sorts' : 'coups';
  }
  if (c.phase === 'player') iremEnemyEnd(c);
}

/** Tambour sismique : tes DoT frappent plus fort un ennemi qui ne peut pas être ciblé (enseveli). */
export function hiddenDotBonus(c: CombatState, e: EnemyState): number {
  return (e.buried ?? 0) > 0 || e.untargetable ? c.gear?.dotUntargetable ?? 0 : 0;
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

// --- Acte 2 ---

/** Les intentions qui dépendent du combat : les Souffles de Prismagor, les potions de Grizzik. */
function fixIntent(c: CombatState, e: EnemyState): void {
  const i = e.intent;
  if (e.defId === 'prismagor') {
    if (i.kind === 'attack' && i.breath && e.breaths) {
      const b = PRISMAGOR_BREATHS[e.breaths[Math.floor(e.step / 3) % 2]];
      e.intent = { kind: 'attack', dmg: b.dmg, cast: b.name, uninterruptible: true, breath: true, addZone: b.addZone, effect: b.effect as never };
    } else if (i.kind === 'attack' && e.hp < e.maxHp * 0.2) {
      e.intent = { ...i, times: 2 };
    }
  }
  if (e.defId === 'grizzik' && i.kind === 'potion') {
    const keys = Object.keys(GRIZZIK_POTIONS);
    const potion = keys[Math.floor(random(c) * keys.length)];
    const label = GRIZZIK_POTIONS[potion].split(' :')[0];
    e.intent = potion === 'explosive'
      ? { kind: 'potion', potion, label, cast: 'Potion explosive' }
      : { kind: 'potion', potion, label };
  }
}

/** Ce que font certains ennemis du chapitre II au début de leur tour. */
function enemyPassivesAct2(c: CombatState, e: EnemyState): void {
  if (e.giant) e.giant -= 1;
  // Mutations actives
  if (e.mutated && e.mutations?.includes('carapace')) {
    e.block += 10;
    fx(c, { kind: 'block', who: e.uid, amount: 10 });
  }
  if (e.mutated && e.mutations?.includes('regeneration') && !e.noHeal) {
    const healed = Math.min(6, e.maxHp - e.hp);
    e.hp += healed;
    if (healed > 0) fx(c, { kind: 'heal', from: e.uid, to: e.uid, amount: healed });
  }
  // Vashka protège ses Œufs, et en fait éclore deux tous les deux tours.
  if (e.defId === 'vashka') {
    const eggs = livingEnemies(c).filter((o) => o.defId === 'oeuf_vashka');
    for (const egg of eggs.slice(0, 2)) {
      egg.block += 6;
      fx(c, { kind: 'block', who: egg.uid, amount: 6 });
    }
    if (c.turn % 2 === 0) hatch(c, e, { kind: 'hatch', label: 'Éclosion', count: 2 });
  }
  // Vhaeryx (phase 1) : des Drakônides chromatiques tous les 3 tours.
  if (e.defId === 'vhaeryx' && (e.phase ?? 1) === 1 && c.turn % 3 === 0) {
    const n = 2 + (c.extraAdds ?? 0);
    for (let i = 0; i < n; i++) c.enemies.push(makeEnemy(c, 'drakonide_chroma'));
    fx(c, { kind: 'buff', who: e.uid, label: `${n} Drakônides chromatiques !` });
    log(c, `Vhaeryx appelle ${n} Drakônides chromatiques.`);
  }
}

/** Des Œufs éclosent en Dragonnets noirs. */
function hatch(c: CombatState, e: EnemyState, intent: Extract<Intent, { kind: 'hatch' }>): void {
  const eggs = intent.self ? [e] : livingEnemies(c).filter((o) => o.defId.startsWith('oeuf'));
  const n = intent.self ? 1 : intent.count === 'all' ? eggs.length : Math.min(intent.count ?? 1, eggs.length);
  for (const egg of eggs.slice(0, n)) {
    egg.dead = true;
    egg.gone = true;
    fx(c, { kind: 'death', who: egg.uid });
    const d = makeEnemy(c, 'dragonnet');
    c.enemies.splice(c.enemies.indexOf(egg) + 1, 0, d);
  }
  if (n > 0) log(c, `${intent.label} : ${n} Dragonnet${n > 1 ? 's noirs éclosent' : ' noir éclôt'}.`);
}

/** Grizzik boit (ou lance) sa potion. */
function drinkGrizzik(c: CombatState, e: EnemyState, potion: string): void {
  log(c, `${e.name} : ${GRIZZIK_POTIONS[potion]}.`);
  fx(c, { kind: 'buff', who: e.uid, label: GRIZZIK_POTIONS[potion].split(' :')[0] });
  switch (potion) {
    case 'croissance':
      e.maxHp += 20;
      e.hp += 20;
      e.giant = 3;
      break;
    case 'explosive': {
      const dmg = enemyDamage(c, e, 16);
      fx(c, { kind: 'hit', from: e.uid, to: 'player', amount: dmg, blocked: Math.min(c.player.block, dmg), ranged: true });
      damagePlayer(c, dmg, true);
      damageEnemy(c, e, 8, true);
      break;
    }
    case 'transmutation':
      (c.player.debuffs ??= emptyDebuffs()).transmute = 2;
      break;
    case 'soins':
      e.hp = Math.min(e.maxHp, e.hp + 20);
      break;
    case 'vitesse':
      e.haste = true;
      break;
  }
}

/** La Malédiction de lignée de Vhaeryx vise la classe du joueur. */
function lineageCurse(c: CombatState): void {
  const d = (c.player.debuffs ??= emptyDebuffs());
  d.lignee = 2;
  if ((c.classId ?? 'guerrier') === 'mage') {
    c.player.drawPenalty += 2;
    log(c, 'Malédiction de lignée : tu es métamorphosé, ta prochaine main n\'aura que 3 cartes.');
  } else if (c.classId === 'voleur') {
    c.combo = 0;
    log(c, 'Malédiction de lignée : tes points de combo s\'envolent, et tu n\'en gagnes plus pendant 2 tours.');
  } else if (c.classId === 'pretre') {
    log(c, 'Malédiction de lignée : pendant 2 tours, tes soins te blessent au lieu de te soigner.');
  } else if (c.classId === 'paladin') {
    c.seals = [];
    log(c, 'Malédiction de lignée : ton Sceau se brise, et tu ne peux plus en activer pendant 2 tours.');
  } else if (c.classId === 'chaman') {
    clearTotems(c);
    log(c, 'Malédiction de lignée : tes totems s\'effondrent.');
  } else if (c.classId === 'druide') {
    setForm(c, 'normale');
    log(c, 'Malédiction de lignée : tu reprends ta forme normale, et tu ne peux plus en changer pendant 2 tours.');
  } else if (c.classId === 'chasseur') {
    log(c, 'Malédiction de lignée : ton compagnon s\'enfuit, il ne fait rien pendant 2 tours.');
  } else if (c.classId === 'demoniste') {
    log(c, 'Malédiction de lignée : pendant 2 tours, ton familier se retourne contre toi.');
  } else {
    c.player.posture = 'berserker';
    log(c, 'Malédiction de lignée : tu es forcé en posture Berserker pendant 2 tours.');
  }
}

/** Le début du tour du joueur, côté acte 2 : poisons, Afflictions, Transformation, Sceptre de domination. */
function startTurnAct2(c: CombatState): void {
  const p = c.player;
  const d = p.debuffs!;
  if (c.gear?.turnSelfDamage) {
    fx(c, { kind: 'tick', who: 'player', amount: c.gear.turnSelfDamage, label: 'Magma' });
    damagePlayer(c, c.gear.turnSelfDamage, false);
  }
  // Cœur d'Yzhar : un peu de Folie à chaque tour.
  if (c.gear?.turnFolie) gainFolie(c, c.gear.turnFolie);
  // Aura de résistance (Paladin) : les DoT ennemis font moitié moins mal.
  const dot = c.aura?.id === 'resistance' ? 1 : 2;
  if ((d.toxine ?? 0) > 0) {
    d.toxine! -= 1;
    fx(c, { kind: 'tick', who: 'player', amount: dot, label: 'Toxine' });
    log(c, `La Toxine te ronge : ${dot} dégât${dot > 1 ? 's' : ''}.`);
    damagePlayer(c, dot, false);
  }
  if (d.afflictions?.includes('rouge')) {
    fx(c, { kind: 'tick', who: 'player', amount: dot, label: 'Sang rouge' });
    damagePlayer(c, dot, false);
  }
  // Malédiction de lignée du Guerrier : forcé en Berserker.
  if ((d.lignee ?? 0) > 0 && (c.classId ?? 'guerrier') === 'guerrier') p.posture = 'berserker';
  // Amulette de sang pur : un maléfice dissipé tous les 2 tours.
  if (c.gear?.purifyEvery2 && c.turn % 2 === 0) purifyOne(c);
  // Transformé : tu perds ce tour, puis les Afflictions disparaissent.
  if (d.transformed) {
    d.transformed = false;
    d.afflictions = [];
    p.energy = 0;
    c.discard.push(...c.hand);
    c.hand = [];
    fx(c, { kind: 'banner', text: 'Transformé : tu perds ce tour' });
    log(c, 'Tu es Transformé : tu perds ce tour. Les Afflictions de sang se dissipent.');
    return;
  }
  // Acte 3 : la Crise de folie fait perdre le tour ; à 5 Folie, une Hallucination arrive.
  if (folieStartTurn(c)) return;
  // Coup de queue, Projection : des cartes défaussées au hasard.
  if ((d.discard ?? 0) > 0) {
    for (let i = 0; i < d.discard! && c.hand.length > 0; i++) {
      const [card] = c.hand.splice(Math.floor(random(c) * c.hand.length), 1);
      c.discard.push(card);
      log(c, `Tu lâches ${CARDS[card.id].name}.`);
    }
    d.discard = 0;
  }
  // Potion de transmutation : 2 cartes deviennent des Fioles instables (pour ce combat).
  if ((d.transmute ?? 0) > 0) {
    const pool = c.hand.filter((card) => CARDS[card.id].type !== 'Statut');
    for (let i = 0; i < d.transmute! && pool.length > 0; i++) {
      const [card] = pool.splice(Math.floor(random(c) * pool.length), 1);
      card.id = 'fiole_instable';
      card.upgraded = false;
    }
    d.transmute = 0;
    log(c, 'La potion de Grizzik transforme tes cartes en Fioles instables.');
  }
  // Skarn : un Sceptre de domination à chaque tour, tant qu'il reste des Œufs.
  if (c.enemies.some((e) => e.defId === 'oeuf_skarn' && !e.dead)) addStatusToHand(c, 'sceptre_domination', 1);
}

/** Le butin qui agit quand une Attaque ou un Sort touche. */
function onHitItems(c: CombatState, target: EnemyState, type: string): void {
  const g = c.gear ?? {};
  if (type !== 'Attaque' && type !== 'Sort') return;
  if (g.attackBurn) {
    target.buffs.brulure = (target.buffs.brulure ?? 0) + g.attackBurn;
  }
  if (g.attackCycle) {
    const step = (c.fangStep ?? 0) % 3;
    if (step === 0) target.buffs.brulure = (target.buffs.brulure ?? 0) + 2;
    else if (step === 1) target.buffs.ralenti = Math.max(target.buffs.ralenti, 1);
    else target.buffs.demoralise = Math.max(target.buffs.demoralise, 1);
    c.fangStep = step + 1;
  }
  // Butin d'Irem : Masse visqueuse (Ralenti), Dard de Tazz (Toxine, un DoT de 2 tours).
  if (g.attackSlow) target.buffs.ralenti = Math.max(target.buffs.ralenti, g.attackSlow);
  if (g.attackToxine) {
    const dots = (target.dots ??= []);
    const tox = dots.find((d) => d.id === 'toxine');
    if (tox) tox.turns = Math.max(tox.turns, 2);
    else dots.push({ id: 'toxine', dmg: g.attackToxine, turns: 2 });
  }
  if (g.attackDebuff) {
    const roll = Math.floor(random(c) * 3);
    if (roll === 0) target.buffs.ralenti = Math.max(target.buffs.ralenti, 1);
    else if (roll === 1) target.buffs.demoralise = Math.max(target.buffs.demoralise, 1);
    else target.buffs.armureFracassee = Math.max(target.buffs.armureFracassee, 1);
  }
}

// --- Démoniste ---

/** Au début du combat (avant de jouer la moindre carte), on choisit son familier de base. */
export function choosePet(c: CombatState, pet: PetId): boolean {
  if (c.pet === undefined || (pet !== 'diablotin' && pet !== 'rodeur')) return false;
  if (c.turn !== 1 || (c.cardsThisTurn ?? 0) > 0 || c.pet === pet) return false;
  c.pet = pet;
  return true;
}

// --- Druide ---

/** Le bouton de forme du Druide (1 énergie ; gratuit au premier tour avant la première carte). */
export function changeForm(c: CombatState, form: FormId): boolean {
  return enterForm(c, form, false);
}

// --- Voleur ---

/** Après une carte du Voleur : le Camouflage, les Ouvertures, les coups finaux, Sang-froid, Sillon d'orage. */
function afterRogueCard(c: CombatState, def: (typeof CARDS)[string], comboHeld: number, attack: boolean): void {
  const g = c.gear ?? {};
  if (def.opener) gainCombo(c, power(c, 'initiative') + (g.openerCombo ?? 0)); // Initiative, Préparé
  if (attack) {
    if (!def.opener) breakStealth(c);
    c.shadowStep = false;
    c.coldBlood = false;
    stormStrike(c);
  }
  if (def.finisher) {
    if (power(c, 'second_souffle')) gainBlock(c, power(c, 'second_souffle'), false);
    // Opportunité : un coup final à 5 points rend de l'énergie et du combo.
    if (comboHeld >= 5 && power(c, 'opportunite')) {
      c.player.energy += 1;
      gainCombo(c, power(c, 'opportunite'));
      fx(c, { kind: 'buff', who: 'player', label: 'Opportunité : +1 énergie' });
    }
  }
}
