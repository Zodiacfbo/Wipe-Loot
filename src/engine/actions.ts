// Actions élémentaires du combat : dégâts, blocage, rage, maléfices, pioche.
// Les cartes et les ennemis s'appuient sur ces fonctions.
import { ENEMIES, TUNING, hasTag, intentAt } from './enemies';
import { random, shuffle } from './rng';
import { demonOnDeath, soulstoneRise } from './demoniste';
import { absorbAegis, gainAegis, gainFaith } from './pretre';
import { onRogueHit, rogueOnDeath } from './voleur';
import { afterEnemyDamaged, immuneTo, onIremDeath, slimeDamage } from './irem';
import { carapaceDamage, yzharAwakens } from './yzhar';
import { isPaladin, lastOath, onPaladinHit, paladinAttackBonus, paladinHealAmount, paladinOnDeath, paladinOnHeal } from './paladin';
import { hunterAttackBonus, isHunter } from './chasseur';
import { druidDamageBonus, druidDamageMult, druidHealAmount, druidOnHeal, isDruid } from './druide';
import { isShaman, reincarnate, shamanDamageBonus, shamanHealAmount, shamanOnHeal } from './chaman';
import type { CombatState, EnemyState, FxEvent, PlayerDebuffs } from './types';

export function emptyDebuffs(): PlayerDebuffs {
  return { demoralise: 0, impie: 0, arcane: 0, manaBurn: 0, panic: 0 };
}

/** Crée un ennemi (au début du combat, ou quand un boss appelle des renforts). */
export function makeEnemy(c: CombatState, id: string, hp?: number): EnemyState {
  const def = ENEMIES[id];
  let max = hp ?? def.hpMin + Math.floor(random(c) * (def.hpMax - def.hpMin + 1));
  // Niveau 17 : un sbire appelé pendant le combat d'un seigneur a 25 % de PV en plus.
  if (c.mods && !def.boss && c.enemies.some((e) => !e.dead && ENEMIES[e.defId].boss)) max = Math.round(max * (c.mods.lordAddHp ?? 1));
  return {
    uid: c.nextUid++, defId: id, name: def.name, hp: max, maxHp: max, block: 0,
    buffs: { puissance: 0, demoralise: 0, ralenti: 0, armureFracassee: 0, saignement: 0, saignementTours: 0 },
    step: 0, intent: intentAt(def, 0), interrupted: false, delayed: false, dead: false,
  };
}

/** Le Gardien de lave et le Grand Intendant renvoient des dégâts. */
function reflectToPlayer(c: CombatState, from: EnemyState, amount: number): void {
  if (amount <= 0 || c.phase !== 'player') return;
  log(c, `${from.name} renvoie ${amount} dégâts.`);
  fx(c, { kind: 'tick', who: 'player', amount, label: 'Renvoi' });
  damagePlayer(c, amount, false);
}

export function log(c: CombatState, msg: string): void {
  c.log.push(msg);
  if (c.log.length > 40) c.log.splice(0, c.log.length - 40);
}

/** Enregistre un événement à animer par l'interface. */
export function fx(c: CombatState, ev: FxEvent): void {
  (c.fx ??= []).push(ev);
}

export function livingEnemies(c: CombatState): EnemyState[] {
  return c.enemies.filter((e) => !e.dead);
}

/** La valeur d'un Pouvoir actif (0 s'il n'a pas été joué). */
export function power(c: CombatState, id: string): number {
  return c.powers?.[id] ?? 0;
}

export function addPower(c: CombatState, id: string, value: number): void {
  (c.powers ??= {})[id] = power(c, id) + value;
}

export function gainRage(c: CombatState, amount: number): void {
  const p = c.player;
  const before = p.rage;
  p.rage = Math.max(0, Math.min(p.maxRage, p.rage + amount));
  // Furie croissante : atteindre la rage maximale donne de la Puissance.
  const furie = power(c, 'furie_croissante');
  if (furie > 0 && before < p.maxRage && p.rage === p.maxRage) {
    p.puissance += furie;
    fx(c, { kind: 'buff', who: 'player', label: `Furie croissante : Puissance +${furie}` });
  }
}

/** Le soin de l'Ange gardien n'est pas touché par la Malédiction de lignée. */
let angelHealing = false;

/** Soigne le joueur (la Peste et l'Affliction verte réduisent les soins de moitié). Renvoie les PV rendus. */
export function healPlayer(c: CombatState, amount: number): number {
  const p = c.player;
  const d = p.debuffs;
  const priest = c.aegis !== undefined;
  let heal = amount;
  const paladin = isPaladin(c) && heal > 0;
  if (paladin) heal = paladinHealAmount(c, heal);
  const druid = isDruid(c) && heal > 0;
  if (druid) heal = druidHealAmount(c, heal);
  const shaman = isShaman(c) && heal > 0;
  if (shaman) heal = shamanHealAmount(c, heal);
  if (priest && heal > 0) {
    heal += c.gear?.healBonus ?? 0; // Soins améliorés
    if (c.gear?.equinoxe && !c.shadowForm) heal += 3; // Équinoxe (Lumière)
    if (c.shadowForm) heal = Math.floor(heal * 0.75); // Forme d'Ombre
    // Malédiction de lignée du Prêtre : ses soins le blessent (sauf le soin de l'Ange gardien).
    // S'il en tombe, il a droit aux mêmes sauvetages que pour tout autre coup (Ange gardien, Phylactère…).
    if ((d?.lignee ?? 0) > 0 && !angelHealing) {
      p.hp = Math.max(0, p.hp - heal);
      fx(c, { kind: 'tick', who: 'player', amount: heal, label: 'Soin maudit' });
      if (heal > 0) onHpLost(c);
      deathSaves(c);
      return 0;
    }
  }
  if ((d?.peste ?? 0) > 0 || d?.afflictions?.includes('verte')) heal = Math.floor(heal / 2);
  // Sang de dragon : les soins sont réduits.
  if (c.gear?.healCut) heal = Math.floor(heal * Math.max(0, 1 - c.gear.healCut / 100));
  const healed = Math.max(0, Math.min(heal, p.maxHp - p.hp));
  p.hp += healed;
  if (paladin) paladinOnHeal(c, healed);
  if (druid) druidOnHeal(c, healed);
  if (shaman) shamanOnHeal(c, healed);
  if (priest && heal > 0) {
    c.healedFlag = true;
    // Rien n'est perdu : le soin en trop devient de l'Égide (la moitié, ou tout avec Esprit de guérison).
    const excess = heal - healed;
    if (excess > 0) {
      gainAegis(c, Math.floor(excess * (power(c, 'esprit_guerison') ? 1 : 0.5)), false);
      gainFaith(c, c.gear?.blessedLight ?? 0);
    }
    if (c.gear?.equinoxe && !c.shadowForm) gainFaith(c, 1);
    // Ascension lumineuse : chaque soin frappe un ennemi.
    if (power(c, 'ascension')) {
      const pool = livingEnemies(c).filter((e) => !e.submerged);
      if (pool.length > 0) {
        const t = pool[Math.floor(random(c) * pool.length)];
        fx(c, { kind: 'tick', who: t.uid, amount: heal, label: 'Ascension' });
        damageEnemy(c, t, heal);
      }
    }
  }
  return healed;
}

/** Le joueur vient de perdre des PV (Enragé). */
export function onHpLost(c: CombatState): void {
  const bonus = power(c, 'enrage');
  if (bonus > 0) c.player.enrageReady = (c.player.enrageReady ?? 0) + bonus;
  if (c.gear?.rageOnHpLoss) gainRage(c, c.gear.rageOnHpLoss); // Brisemonts
  if (c.gear?.hurtBonus) c.player.enrageReady = (c.player.enrageReady ?? 0) + c.gear.hurtBonus; // Bague de la rage
}

/** `fromCard` : le blocage vient d'une carte (Bâton de l'intendant : +2). */
export function gainBlock(c: CombatState, amount: number, fromCard = true): void {
  const p = c.player;
  // Cœur d'Ossyrax : pas de blocage des cartes au premier tour.
  if (fromCard && c.turn === 1 && c.gear?.noFirstTurnBlock) return;
  let total = amount + (p.robustesse ?? 0) + (fromCard ? c.gear?.blockBonus ?? 0 : 0);
  if (p.posture === 'defensive') total += 3;
  // Esprit de la tortue (Chasseur) : les cartes de blocage donnent +3 blocage.
  if (fromCard && c.aspect === 'tortue') total += 3;
  // Cœur sauvage (Druide) : en Félin, les cartes de blocage donnent +3 blocage.
  if (fromCard && c.form === 'felin' && power(c, 'coeur_sauvage')) total += 3;
  // Ralenti (Garde draconique, Souffle de foudre, Affliction bronze) : 25 % de blocage en moins.
  const d = p.debuffs;
  if ((d?.ralenti ?? 0) > 0 || d?.afflictions?.includes('bronze')) total = Math.floor(total * 0.75);
  p.block += Math.max(0, total);
  if (total > 0) fx(c, { kind: 'block', who: 'player', amount: total });
}

export interface AttackOptions {
  rageCard?: boolean; // carte qui coûte de la rage (bonus de la posture de Combat)
  ignoreBlock?: boolean;
}

/** Calcule les dégâts d'une Attaque du joueur avant le blocage de la cible. */
export function attackDamage(c: CombatState, target: EnemyState, base: number, opts: AttackOptions = {}): number {
  const p = c.player;
  const g = c.gear ?? {};
  const spell = c.playing?.type === 'Sort';
  // Les bonus « aux Attaques » ne s'appliquent pas aux Sorts, qui ont leurs propres bonus.
  let dmg = base + p.puissance + (spell ? g.spellBonus ?? 0 : g.attackBonus ?? 0);
  // Les effets secondaires des armes valent pour les Attaques et les Sorts (armes jumelles).
  const hit = !!c.playing && (c.playing.type === 'Attaque' || spell);
  if (!c.firstAttackDone && hit) dmg += g.firstAttackBonus ?? 0;
  if (c.playing && c.playing.cost >= 2 && hit) dmg += g.heavyAttackBonus ?? 0;
  // Mage : charges arcaniques, Pyromanie, Impact.
  if (c.playing?.school === 'arcane') dmg += (2 + (g.chargeBonus ?? 0)) * (p.charges ?? 0);
  if (c.playing?.school === 'feu' && c.playing.cost >= 2) dmg += power(c, 'pyromanie');
  if (c.playing?.id === 'boule_de_feu') dmg += g.fireballBonus ?? 0;
  // Acte 2 : Fouet du contremaître, armes contre les Dragons et les Morts-vivants, Bague de la mère.
  if (c.playing && (c.playing.type === 'Attaque' || spell)) dmg += (g.comboBonus ?? 0) * ((c.attacksThisTurn ?? 0) + (c.mageSpellsThisTurn ?? 0));
  if (hasTag(target.defId, 'mortvivant')) dmg += g.undeadBonus ?? 0;
  if (hasTag(target.defId, 'dragon')) dmg += g.dragonBonus ?? 0;
  if (target.block > 0) dmg += g.vsBlockBonus ?? 0; // Poing et Sceptre d'obsidienne
  if (c.playing?.aoe) dmg += g.aoeBonus ?? 0;
  // Démoniste : Ruine, Ombre et flammes, Trait de l'ombre amélioré.
  if (spell && c.playing && c.playing.cost >= 2) dmg += power(c, 'ruine');
  const id = c.playing?.id;
  if (id === 'trait_ombre' || id === 'incinerer' || id === 'immolation') dmg += power(c, 'ombre_et_flammes');
  if (id === 'trait_ombre') dmg += g.shadowBoltBonus ?? 0;
  if (id === 'chatiment' || id === 'chatiment_ardent') dmg += g.smiteBonus ?? 0;
  if (id === 'attaque_mentale') dmg += g.mindBlastBonus ?? 0;
  if (c.playing && (c.playing.id === 'frappe' || c.playing.id === 'frappe_heroique')) dmg += g.strikeBonus ?? 0;
  // Poing d'obsidienne : les Attaques qui ignorent le blocage.
  if (!spell && opts.ignoreBlock) dmg += g.pierceBonus ?? 0;
  if (c.playing?.type === 'Attaque' && c.playing.cost === 0) dmg += g.zeroCostBonus ?? 0;
  // Voleur : Danse des lames, Maître de la discrétion, Opportuniste, Vendetta, Sang-froid.
  const rogueAttack = c.combo !== undefined && c.playing?.type === 'Attaque';
  if (rogueAttack) {
    dmg += c.bladeDance && c.bladeDance.turns > 0 ? c.bladeDance.bonus : 0;
    if (c.playing!.opener || c.playing!.id === 'coup_dans_le_dos') dmg += g.openerBonus ?? 0; // Maître de la discrétion
    if ((target.stun ?? 0) > 0 || (target.sap ?? 0) > 0 || (target.buffs.peur ?? 0) > 0 || (target.mouton ?? 0) > 0) dmg += power(c, 'opportuniste');
  }
  // Paladin : les Sceaux, Croisade, Conviction, Vengeance divine.
  const paladinAttack = isPaladin(c) && c.playing?.type === 'Attaque';
  if (paladinAttack) dmg += paladinAttackBonus(c, target);
  // Chasseur : Esprit de l'aigle, Marque de la proie, Bête intérieure, Concentration…
  if (isHunter(c) && c.playing?.type === 'Attaque') dmg += hunterAttackBonus(c, target);
  // Druide : les bonus de forme (Félin, Astrale), Fureur du tigre, Férocité, Cœur sauvage.
  dmg += druidDamageBonus(c);
  // Chaman : Totem des vents, Arme de flammes, Totem de l'orage, Fureur élémentaire, Frappe d'orage.
  dmg += shamanDamageBonus(c);
  if ((p.debuffs?.demoralise ?? 0) > 0) dmg *= 0.75;
  if (target.hp < target.maxHp * 0.5) dmg += g.lowHpBonus ?? 0;
  if (opts.rageCard && p.posture === 'combat') dmg += 3;
  if (opts.rageCard) dmg += power(c, 'maitre_armes');
  dmg += p.enrageReady ?? 0;
  if (p.posture === 'defensive') dmg *= 0.8;
  if (p.temerite) dmg *= 1.5;
  if (p.arcanePower && spell) dmg *= 1.5;
  // Malédiction des éléments, Pacte de destruction.
  if (spell && (target.elements ?? 0) > 0) dmg *= 1 + target.elements! / 100;
  if (spell && c.doubleNext) dmg *= 2;
  // Forme d'Ombre : les Sorts d'Ombre +30 %. Châtiment amélioré, Esprit sombre.
  if (c.shadowForm && c.playing?.school === 'ombre') dmg *= 1.5;
  if ((p.fureur ?? 0) > 0) dmg *= 1.5;
  dmg *= druidDamageMult(c); // Rôder, Éclipse
  if (rogueAttack && target.vendetta) dmg *= 1.5;
  if (rogueAttack && c.coldBlood) dmg *= 2;
  if (rogueAttack && c.stealth && power(c, 'seigneur_ombres')) dmg *= 1.5; // Seigneur des ombres
  if (paladinAttack && p.divineShield) dmg *= 0.5; // Bouclier divin
  if (spell && c.favor && isPaladin(c)) dmg *= 2; // Faveur divine
  if (target.buffs.armureFracassee > 0) dmg *= 1.5;
  // Acte 3 : Résistance aux Attaques ou aux Sorts.
  const resist = ENEMIES[target.defId]?.resist;
  if ((resist === 'sorts' && spell) || (resist === 'attaques' && !spell)) dmg *= 0.5;
  // Dent de Gharul : la première Attaque contre un ennemi qui vient de resurgir inflige double dégâts.
  if (target.surfaced && g.surfaceDouble) dmg *= 2;
  // Rois-Jumeaux : immunisé aux Attaques ou aux Sorts (les effets de zone passent).
  if (immuneTo(target, spell, !!c.playing?.aoe)) return 0;
  // Carapace divine (objet) : tes coups sont un peu plus faibles.
  if (g.dealtCut) dmg *= 1 - g.dealtCut / 100;
  return Math.max(0, Math.floor(dmg));
}

/** Inflige une Attaque du joueur à un ennemi. Renvoie les dégâts infligés (avant blocage). */
export function playerAttack(c: CombatState, target: EnemyState, base: number, opts: AttackOptions = {}): number {
  if (target.dead || target.submerged) return 0;
  const dmg = attackDamage(c, target, base, opts);
  const blockBefore = target.block;
  fx(c, { kind: 'hit', from: 'player', to: target.uid, amount: dmg, blocked: 0, ranged: false });
  const ev = c.fx![c.fx!.length - 1] as { blocked: number };
  damageEnemy(c, target, dmg, opts.ignoreBlock ?? false);
  ev.blocked = opts.ignoreBlock ? 0 : Math.min(blockBefore, dmg);
  if (dmg > 0 && c.gear?.surfaceDouble) target.surfaced = false;
  if (target.defId === 'gardien' && blockBefore > 0) reflectToPlayer(c, target, 3);
  // Saldris : son bouclier renvoie la moitié des coups, ou la moitié des Sorts.
  const spell = c.playing?.type === 'Sort';
  if (target.defId === 'saldris' && target.shield === (spell ? 'sorts' : 'coups')) reflectToPlayer(c, target, Math.floor(dmg / 2));
  // Embrasement : un Sort qui inflige 10 dégâts ou plus enflamme la cible.
  if (spell && dmg >= 10 && power(c, 'embrasement') && !target.dead) applyBrulure(c, target, power(c, 'embrasement'));
  // Voleur : le Poison de la cible, puis le Poison d'arme.
  if (c.combo !== undefined && c.playing?.type === 'Attaque') onRogueHit(c, target);
  // Paladin : le Sceau de vengeance applique la Censure.
  if (isPaladin(c) && c.playing?.type === 'Attaque') onPaladinHit(c, target);
  return dmg;
}

export function damageEnemy(c: CombatState, target: EnemyState, amount: number, ignoreBlock = false): void {
  if (target.dead || target.submerged || amount <= 0) return;
  // Skarn est intouchable tant qu'il reste des Œufs de la couvée.
  if (target.defId === 'skarn' && (target.phase ?? 1) === 1 && c.enemies.some((e) => e.defId === 'oeuf_skarn' && !e.dead)) {
    log(c, 'Skarn est protégé par la magie de ses Œufs.');
    return;
  }
  // Corps visqueux (Limon) : moitié moins de dégâts, double s'il est Figé.
  let rest = slimeDamage(target, amount);
  // Carapace divine (le Corps d'Yzhar) : 25 % des dégâts, ou double quand elle est tombée.
  rest = carapaceDamage(c, target, rest);
  if (!ignoreBlock) {
    const absorbed = Math.min(target.block, rest);
    target.block -= absorbed;
    rest -= absorbed;
  }
  target.hp -= rest;
  // Méhkar se révèle quand il est touché, et se divise à 75, 50 et 25 % de PV.
  afterEnemyDamaged(c, target, rest);
  // Métamorphose : le mouton reprend forme dès qu'il est blessé.
  if (target.mouton && rest > 0) {
    target.mouton = 0;
    log(c, `${target.name} reprend sa forme.`);
  }
  // Assommer : l'ennemi se réveille dès qu'il est blessé.
  if (target.sap && rest > 0) {
    target.sap = 0;
    log(c, `${target.name} reprend ses esprits.`);
  }
  // Mutation : sous 50 % de PV, la Chimère mute.
  if (target.mutations?.length && !target.mutated && target.hp > 0 && target.hp < target.maxHp / 2) {
    target.mutated = true;
    fx(c, { kind: 'banner', text: `${target.name} mute : ${target.mutations.map((m) => MUTATION_LABEL[m]).join(' et ')} !` });
  }
  // Vhaeryx : l'élixir à 60 %, puis les cobayes se relèvent sous 20 %.
  if (target.defId === 'vhaeryx' && target.hp > 0) vhaeryxPhase(c, target);
  // Vulkhar plonge dans la lave à 50 % de ses PV.
  if (target.defId === 'vulkhar' && (target.phase ?? 1) === 1 && target.hp <= target.maxHp / 2) {
    target.hp = Math.ceil(target.maxHp / 2);
    submerge(c, target);
    return;
  }
  // Saldris se rend sous 10 % de PV (avant de mourir).
  if (target.defId === 'saldris' && target.hp < target.maxHp * 0.1) {
    target.hp = Math.max(1, target.hp);
    surrender(c, target);
    return;
  }
  // L'Œil d'Yzhar se ferme : le Corps se réveille.
  if (yzharAwakens(c, target)) return;
  if (target.hp <= 0) killEnemy(c, target);
}

/** Le Grand Intendant Saldris se rend : le combat est gagné. */
function surrender(c: CombatState, s: EnemyState): void {
  fx(c, { kind: 'banner', text: 'Saldris se rend !' });
  log(c, 'Le Grand Intendant Saldris se rend. Ses gardes déposent les armes.');
  for (const e of c.enemies) {
    if (e.dead) continue;
    e.dead = true;
    e.gone = true;
    e.block = 0;
    fx(c, { kind: 'death', who: e.uid });
  }
  s.gone = true;
  if (c.phase === 'player') c.phase = 'victory';
}

/** Saldris se rend aussi quand ses 4 gardes sont tombés. */
function checkSaldris(c: CombatState): void {
  const s = c.enemies.find((e) => e.defId === 'saldris' && !e.dead);
  if (!s) return;
  const guards = c.enemies.filter((e) => (e.defId === 'pretre' || e.defId === 'gardien') && !e.dead);
  if (guards.length === 0) surrender(c, s);
}

function submerge(c: CombatState, v: EnemyState): void {
  v.submerged = 2;
  v.block = 0;
  v.interrupted = false;
  v.delayed = false;
  // Tes effets sur lui (Brûlure, Saignement, Gel, DoT, Poison, Censure, Marque…) restent, figés pendant la plongée :
  // ils ne frappent pas et ne diminuent pas tant qu'il est sous la lave (même règle pour toutes les classes).
  fx(c, { kind: 'banner', text: 'Vulkhar plonge dans la lave !' });
  log(c, 'Vulkhar plonge dans la lave ! Des Rejetons de flamme surgissent.');
  for (let i = 0; i < 6; i++) c.enemies.push(makeEnemy(c, 'rejeton', ENEMIES.rejeton.hpMax));
}

/** Vulkhar refait surface : il absorbe les Rejetons encore en vie. */
export function emerge(c: CombatState, v: EnemyState): void {
  const living = c.enemies.filter((e) => e.defId === 'rejeton' && !e.dead);
  for (const r of living) {
    r.dead = true;
    r.hp = 0;
    fx(c, { kind: 'death', who: r.uid });
  }
  const healed = Math.min(v.maxHp - v.hp, living.length * TUNING.rejetonHeal);
  v.hp += healed;
  v.submerged = 0;
  v.phase = 2;
  v.step = 0;
  v.counter = 0;
  v.intent = intentAt(ENEMIES.vulkhar, 0, 2);
  fx(c, { kind: 'banner', text: healed > 0 ? `Vulkhar refait surface ! (+${healed} PV)` : 'Vulkhar refait surface !' });
  log(c, `Vulkhar refait surface${healed > 0 ? ` et absorbe ${living.length} Rejeton${living.length > 1 ? 's' : ''} (+${healed} PV)` : ''}.`);
}

export function killEnemy(c: CombatState, target: EnemyState): void {
  if (target.dead) return;
  // Ossyrax a deux vies ; un Serviteur rapiécé se relève si un Alchimiste vit encore.
  if (target.defId === 'ossyrax' && !target.revived) {
    target.revived = true;
    target.hp = 45;
    target.buffs.puissance += 3;
    target.buffs.saignement = 0;
    target.buffs.brulure = 0;
    fx(c, { kind: 'banner', text: 'Ossyrax se relève !' });
    log(c, 'Ossyrax refuse de rester mort : il se relève avec 45 PV, plus fort.');
    return;
  }
  if (target.defId === 'serviteur' && !target.revived && c.enemies.some((e) => e.defId === 'alchimiste' && !e.dead)) {
    target.revived = true;
    target.hp = 10;
    fx(c, { kind: 'buff', who: target.uid, label: 'Se relève !' });
    log(c, `L'alchimiste relève ${target.name} (10 PV).`);
    return;
  }
  target.hp = 0;
  target.dead = true;
  target.block = 0;
  fx(c, { kind: 'death', who: target.uid });
  log(c, `${target.name} est vaincu.`);
  onEnemyDeath(c, target);
  demonOnDeath(c, target, !!c.petActing);
  rogueOnDeath(c, target);
  paladinOnDeath(c);
  // Implacable : tuer un ennemi rend de la rage et pioche (pendant ton tour).
  if (!c.enemyActing && c.phase === 'player') {
    if (c.gear?.killRage) gainRage(c, c.gear.killRage);
    if (c.gear?.killDraw) drawCards(c, c.gear.killDraw);
  }
  if (c.gear?.healOnKill && c.player.hp > 0) healPlayer(c, c.gear.healOnKill);
  // Krâgg tombe : ses Molosses s'enfuient. Un Molosse tué pendant que Krâgg vit se relèvera.
  if (target.defId === 'kragg') {
    for (const m of c.enemies.filter((e) => e.defId === 'molosse_enrage')) {
      m.reviveIn = 0;
      if (!m.dead) {
        m.dead = true;
        m.gone = true;
        fx(c, { kind: 'death', who: m.uid });
      }
    }
    log(c, 'Les Molosses enragés s\'enfuient.');
  }
  if (target.defId === 'molosse_enrage' && c.enemies.some((e) => e.defId === 'kragg' && !e.dead)) {
    target.reviveIn = 2;
    log(c, `${target.name} se relèvera dans 2 tours, tant que Krâgg est en vie.`);
  }
  const onKill = c.gear?.onKillAoe ?? 0;
  if (onKill > 0) {
    for (const other of livingEnemies(c)) {
      if (other.submerged) continue;
      fx(c, { kind: 'tick', who: other.uid, amount: onKill, label: 'Explosion' });
      damageEnemy(c, other, onKill, false);
    }
  }
  if (target.defId === 'etincelle' || target.defId === 'eclat') {
    const boom = 4;
    log(c, `${target.name} explose !`);
    fx(c, { kind: 'tick', who: 'player', amount: boom, label: 'Explosion' });
    damagePlayer(c, boom, false);
  }
  checkSaldris(c);
  if (livingEnemies(c).length === 0 && c.phase === 'player') c.phase = 'victory';
}

/** Dégâts subis par le joueur. `isAttack` : une attaque ennemie (donne de la rage). */
/** Ange gardien : une fois par combat, on reste à 1 PV et on est soigné. */
function angelSave(c: CombatState): void {
  const p = c.player;
  if (p.hp > 0 || !power(c, 'ange_gardien') || c.angelUsed) return;
  c.angelUsed = true;
  p.hp = 1;
  angelHealing = true;
  try {
    healPlayer(c, 15);
  } finally {
    angelHealing = false;
  }
  fx(c, { kind: 'banner', text: 'L\'Ange gardien te protège !' });
}

/**
 * Le joueur tombe à 0 PV : les sauvetages, dans l'ordre (Ange gardien, Pierre d'âme, Réincarnation,
 * Renaissance, Phylactère brisé), sinon la défaite. Toute perte de PV doit passer par ici.
 */
export function deathSaves(c: CombatState): void {
  const p = c.player;
  if (p.hp > 0) return;
  angelSave(c);
  if (p.hp <= 0 && c.soulstone) soulstoneRise(c); // Pierre d'âme
  // Réincarnation (Chaman) : une fois par run.
  if (p.hp <= 0) reincarnate(c);
  // Renaissance (Druide) : une fois par combat, on revient à 40 % des PV.
  if (p.hp <= 0 && c.rebirth) {
    c.rebirth = false;
    p.hp = Math.max(1, Math.floor(p.maxHp * 0.4));
    fx(c, { kind: 'banner', text: 'Renaissance !' });
    log(c, 'La sève te relève : tu reviens à la vie.');
  }
  if (p.hp <= 0 && c.gear?.cheatDeath && !c.cheatedDeath) {
    // Phylactère brisé
    c.cheatedDeath = true;
    p.hp = 1;
    fx(c, { kind: 'banner', text: 'Le Phylactère brisé te retient !' });
  }
  if (p.hp <= 0) {
    p.hp = 0;
    c.phase = 'defeat';
  }
}

export function damagePlayer(c: CombatState, amount: number, isAttack: boolean): number {
  const p = c.player;
  if (p.iceBlock) return 0; // Carapace de glace
  if (!isAttack) amount -= c.gear?.nonAttackReduce ?? 0;
  if (p.rempart) amount = Math.floor(amount / 2);
  if (amount <= 0) return 0;
  const absorbed = Math.min(p.block, amount);
  p.block -= absorbed;
  // Le Prêtre : l'Égide encaisse après le blocage.
  const hpLoss = absorbAegis(c, amount - absorbed);
  p.hp -= hpLoss;
  // Dernier serment (Paladin) : sous 20 % des PV max, une fois par combat.
  if (hpLoss > 0) lastOath(c);
  // Ange gardien : une fois par combat, on reste à 1 PV et on est soigné.
  angelSave(c);
  if (hpLoss > 0) onHpLost(c);
  if (isAttack) {
    const blockedRage = p.posture === 'defensive' || p.ignorerDouleur;
    if (hpLoss > 0 || blockedRage) gainRage(c, 1);
    if (hpLoss === 0) p.blockedFullAttack = true;
  }
  deathSaves(c);
  // Cœur de la bombe : une grosse perte de PV fait exploser le joueur.
  const boom = c.gear?.bigHitAoe ?? 0;
  if (boom > 0 && hpLoss >= 10 && c.phase === 'player') {
    log(c, `Le Cœur de la bombe explose : ${boom} dégâts à tous les ennemis.`);
    for (const e of livingEnemies(c)) {
      if (e.submerged) continue;
      fx(c, { kind: 'tick', who: e.uid, amount: boom, label: 'Explosion' });
      damageEnemy(c, e, boom);
    }
  }
  return hpLoss;
}

export function applySaignement(target: EnemyState, amount: number, c?: CombatState): void {
  target.buffs.saignement += amount + (c?.gear?.bleedBonus ?? 0);
  target.buffs.saignementTours = 3 + (c?.gear?.bleedDuration ?? 0);
}

export function drawCards(c: CombatState, count: number): void {
  for (let i = 0; i < count; i++) {
    if (c.hand.length >= 10) return;
    if (c.draw.length === 0) {
      if (c.discard.length === 0) return;
      c.draw = shuffle(c, c.discard);
      c.discard = [];
    }
    const card = c.draw.shift();
    if (card) c.hand.push(card);
  }
}

/** Glisse des cartes-statut à des places au hasard dans la pioche (Fardeau). */
export function addStatusToDraw(c: CombatState, id: string, count: number): void {
  for (let i = 0; i < count; i++) {
    const at = Math.floor(random(c) * (c.draw.length + 1));
    c.draw.splice(at, 0, { uid: c.nextUid++, id, upgraded: false });
  }
}

export function addStatusToHand(c: CombatState, id: string, count: number): void {
  // Amulette de cendre : une carte-statut qui arrive en main fait piocher.
  if (c.gear?.statusDraw && count > 0) drawCards(c, c.gear.statusDraw * count);
  for (let i = 0; i < count; i++) {
    if (c.hand.length >= 10) {
      c.discard.push({ uid: c.nextUid++, id, upgraded: false });
    } else {
      c.hand.push({ uid: c.nextUid++, id, upgraded: false });
    }
  }
}

// --- Mage : Brûlure, Gel, charges arcaniques ---

/** Un boss ou un gardien (résiste à la Peur, au Désarmement, à la Métamorphose ; le Gel ne fait que réduire son attaque). */
export function isBossEnemy(e: EnemyState): boolean {
  const def = ENEMIES[e.defId];
  return !!(def.boss || def.elite);
}

/** Applique de la Brûlure (avec Feu intense et Brasier). */
export function applyBrulure(c: CombatState, target: EnemyState, amount: number): void {
  if (target.dead || target.submerged || amount <= 0) return;
  const g = c.gear ?? {};
  const before = target.buffs.brulure ?? 0;
  // Feu intense : seulement sur les applications de 2 Brûlure ou plus (sinon les petites applications répétées doublaient tout).
  let add = amount + (amount >= 2 ? g.burnBonus ?? 0 : 0);
  if (g.brasier && before >= 5) add += g.brasier;
  target.buffs.brulure = before + add;
}

/** Le seuil de Gel qui rend un ennemi Gelé. */
export function freezeThreshold(c: CombatState): number {
  return 5 - (c.gear?.freezeEarly ?? 0);
}

/** Applique du Gel (avec Hiver précoce). À 5 cumuls, la cible devient Gelée. */
export function applyGel(c: CombatState, target: EnemyState, amount: number): void {
  if (target.dead || target.submerged || amount <= 0) return;
  target.buffs.gel = (target.buffs.gel ?? 0) + amount + (c.gear?.gelBonus ?? 0);
  if (target.buffs.gel >= freezeThreshold(c)) {
    target.buffs.gel = 0;
    freeze(c, target);
  }
}

/** La cible devient Gelée : un ennemi normal perd son prochain tour, un boss voit sa prochaine attaque réduite de moitié. */
export function freeze(c: CombatState, target: EnemyState, forceSkip = false): void {
  if (target.dead || target.submerged) return;
  target.gele = isBossEnemy(target) && !forceSkip ? 'half' : 'skip';
  fx(c, { kind: 'buff', who: target.uid, label: 'Gelé !' });
  log(c, `${target.name} est Gelé${target.gele === 'half' ? ' : sa prochaine attaque est réduite de moitié' : ' : il perd son prochain tour'}.`);
  const bite = power(c, 'morsure_du_froid');
  if (bite > 0) {
    fx(c, { kind: 'tick', who: target.uid, amount: bite, label: 'Morsure du froid' });
    damageEnemy(c, target, bite);
  }
  if (c.gear?.freezeEnergy && !c.enemyActing && c.phase === 'player') c.player.energy += c.gear.freezeEnergy;
}

/** Fracasser : la cible a 3 Gel ou plus, ou elle est Gelée (ou Toucher glacial est prêt). */
export function canShatter(c: CombatState, target: EnemyState): boolean {
  return (target.buffs.gel ?? 0) >= 3 || !!target.gele || !!c.shatterReady;
}

/** Les dégâts d'une carte avec Fracasser (double, ou triple avec Fragmentation). */
export function shatterDamage(c: CombatState, target: EnemyState, base: number): number {
  const dmg = base + (c.gear?.shatterBonus ?? 0);
  if (!canShatter(c, target)) return dmg;
  return dmg * (power(c, 'fragmentation') ? 3 : 2);
}

/** Gagne des charges arcaniques (0 à 4, ou 6 avec Résonance). */
export function gainCharges(c: CombatState, amount: number): void {
  const p = c.player;
  p.charges = Math.max(0, Math.min(p.maxCharges ?? 4, (p.charges ?? 0) + amount));
}

/** Consomme toutes les charges arcaniques. Renvoie le nombre consommé. */
export function spendCharges(c: CombatState): number {
  const n = c.player.charges ?? 0;
  c.player.charges = 0;
  return n;
}

// --- Acte 2 ---

export const MUTATION_LABEL: Record<string, string> = {
  carapace: 'Carapace (+10 blocage par tour)',
  frenesie: 'Frénésie (attaque deux fois)',
  regeneration: 'Régénération (+6 PV par tour)',
};

/** Ce qui se passe quand un ennemi meurt (actes 2 et 3). */
function onEnemyDeath(c: CombatState, target: EnemyState): void {
  onIremDeath(c, target);
  // Nuée (acte 3) : les autres scarabées gagnent 1 Puissance.
  if (target.defId === 'scarabee') {
    for (const o of livingEnemies(c)) {
      if (o.defId !== 'scarabee') continue;
      o.buffs.puissance += 1;
      fx(c, { kind: 'buff', who: o.uid, label: 'Nuée : Puissance +1' });
    }
  }
  // Fureur de la meute : les autres drakes gagnent 3 Puissance.
  if (target.defId.startsWith('drake_') && target.defId !== 'drake_os') {
    for (const o of livingEnemies(c)) {
      if (o.defId.startsWith('drake_') && o.defId !== 'drake_os') {
        o.buffs.puissance += 3;
        fx(c, { kind: 'buff', who: o.uid, label: 'Fureur de la meute : Puissance +3' });
      }
    }
  }
  // Skarn : le dernier Œuf détruit, il n'est plus protégé, et ses dragonnets s'enfuient.
  if (target.defId === 'oeuf_skarn' && !c.enemies.some((e) => e.defId === 'oeuf_skarn' && !e.dead)) {
    const skarn = c.enemies.find((e) => e.defId === 'skarn' && !e.dead);
    if (skarn) {
      skarn.phase = 2;
      skarn.step = 0;
      skarn.intent = intentAt(ENEMIES.skarn, 0, 2);
      for (const d of c.enemies.filter((e) => e.defId === 'dragonnet' && !e.dead)) {
        d.dead = true;
        d.gone = true;
        fx(c, { kind: 'death', who: d.uid });
      }
      fx(c, { kind: 'banner', text: 'Les Œufs sont détruits : Skarn est vulnérable !' });
    }
  }
  // Vhaeryx : les adds tombés pourront se relever.
  if (target.defId !== 'vhaeryx' && c.enemies.some((e) => e.defId === 'vhaeryx' && !e.dead)) c.fallen = (c.fallen ?? 0) + 1;
  // Sceptre du gardien, Bague de la meute.
  if (!c.enemyActing && c.phase === 'player' && c.gear?.killEnergy && !c.killEnergyUsed) {
    c.player.energy += c.gear.killEnergy;
    c.killEnergyUsed = true;
  }
  if (c.gear?.killPuissance) c.player.puissance += c.gear.killPuissance;
}

/** Vhaeryx boit son élixir à 60 %, puis relève les cobayes sous 20 %. */
function vhaeryxPhase(c: CombatState, v: EnemyState): void {
  const phase = v.phase ?? 1;
  if (phase === 1 && v.hp <= v.maxHp * 0.6) {
    v.phase = 2;
    v.step = 0;
    v.intent = intentAt(ENEMIES.vhaeryx, 0, 2);
    v.interrupted = false;
    v.delayed = false;
    fx(c, { kind: 'banner', text: 'Vhaeryx boit son élixir et devient dragon !' });
    log(c, '« Assez joué ! » Vhaeryx avale son dernier élixir et se transforme en dragon chromatique.');
  }
  if ((v.phase ?? 1) === 2 && v.hp <= v.maxHp * 0.2) {
    v.phase = 3;
    const n = Math.min(6, c.fallen ?? 0);
    for (let i = 0; i < n; i++) c.enemies.push(makeEnemy(c, 'serviteur_os'));
    fx(c, { kind: 'banner', text: n > 0 ? `Les cobayes se relèvent ! (${n})` : 'Vhaeryx appelle ses cobayes… mais aucun ne se relève.' });
  }
}
