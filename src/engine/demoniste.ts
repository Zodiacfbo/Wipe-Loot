// Les mécaniques du Démoniste : le familier, les DoT, les Malédictions, les éclats d'âme et le prix du sang.
// Référence : docs/classes/DEMONISTE.md (§2 et §3)
import { damageEnemy, damagePlayer, drawCards, fx, gainBlock, healPlayer, isBossEnemy, livingEnemies, log, onHpLost, power } from './actions';
import { isInterruptible } from './enemies';
import { random } from './rng';
import type { CombatState, EnemyState, PetId } from './types';

export const MAX_SHARDS = 5;

export const PETS: Record<PetId, { name: string; text: string }> = {
  diablotin: { name: 'Diablotin', text: 'À la fin de ton tour : 4 dégâts à un ennemi au hasard.' },
  rodeur: { name: 'Rôdeur du néant', text: 'À la fin de ton tour : 5 blocage.' },
  succube: { name: 'Succube', text: 'À la fin de ton tour : 2 dégâts à ta cible. Tous les 3 tours, Séduction : un ennemi (sauf boss) ne fait rien à son prochain tour.' },
  molosse: { name: 'Molosse infernal', text: 'À la fin de ton tour : 2 dégâts à ta cible. Au début de ton tour, dévore une malédiction. Tous les 3 tours, Verrou magique : interrompt une Incantation.' },
};

// --- Éclats d'âme ---

export function gainShards(c: CombatState, n: number): void {
  if (c.shards === undefined || n <= 0) return;
  const before = c.shards;
  c.shards = Math.min(MAX_SHARDS, c.shards + n);
  if (c.shards > before) fx(c, { kind: 'buff', who: 'player', label: `+${c.shards - before} éclat${c.shards - before > 1 ? 's' : ''} d'âme` });
}

// --- Le prix du sang ---

/** Le Démoniste perd des PV (pactes) : ce n'est pas un coup, le blocage ne protège pas. */
export function loseHp(c: CombatState, n: number, label = 'Pacte'): void {
  const p = c.player;
  if (n <= 0) return;
  p.hp -= n;
  fx(c, { kind: 'tick', who: 'player', amount: n, label });
  onHpLost(c);
  if (power(c, 'contrecoup')) c.shadowFree = true;
  if (p.hp <= 0) {
    if (c.soulstone) {
      soulstoneRise(c);
    } else {
      p.hp = 0;
      c.phase = 'defeat';
    }
  }
}

/** La Pierre d'âme relève le Démoniste à 30 % de ses PV. */
export function soulstoneRise(c: CombatState): void {
  c.soulstone = false;
  c.player.hp = Math.max(1, Math.floor(c.player.maxHp * 0.3));
  if (c.phase === 'defeat') c.phase = 'player';
  fx(c, { kind: 'banner', text: 'La Pierre d\'âme te relève !' });
  log(c, 'La Pierre d\'âme se brise : tu reviens à la vie.');
}

// --- Les DoT ---

/** Applique (ou renforce) un DoT : le même DoT ne se cumule pas, il garde les meilleures valeurs. */
export function applyDot(c: CombatState, e: EnemyState, id: string, dmg: number, turns: number, grow = 0, heal = 0): void {
  if (e.dead || e.submerged || dmg <= 0) return;
  const total = turns + (c.gear?.dotDuration ?? 0);
  const dots = (e.dots ??= []);
  const old = dots.find((d) => d.id === id);
  if (old) {
    old.dmg = Math.max(old.dmg, dmg);
    old.turns = Math.max(old.turns, total);
    old.grow = grow || old.grow;
    old.heal = Math.max(old.heal ?? 0, heal) || undefined;
  } else {
    dots.push({ id, dmg, turns: total, grow: grow || undefined, heal: heal || undefined });
  }
}

/** Les dégâts d'un tick de DoT (Étreinte de l'ombre, Hantise). */
export function dotTick(c: CombatState, e: EnemyState, base: number): number {
  // Étreinte de l'ombre, Ténèbres intérieures, Forme d'Ombre, Équinoxe (Ombre).
  let dmg = base + power(c, 'etreinte') + power(c, 'tenebres') + (c.gear?.dotBonus ?? 0) + (c.shadowForm ? 2 + (c.gear?.equinoxe ? 2 : 0) : 0);
  if ((e.haunted ?? 0) > 0) dmg = Math.floor(dmg * 1.5);
  // Tambour sismique : un ennemi enseveli.
  if ((e.buried ?? 0) > 0 || e.untargetable) dmg += c.gear?.dotUntargetable ?? 0;
  return dmg;
}

/** Déclenche les DoT d'un ennemi. `consume` : le DoT perd un tour (tick normal) ; sinon c'est un déclenchement en plus. */
export function triggerDots(c: CombatState, e: EnemyState, consume: boolean): void {
  if (!e.dots?.length || e.dead || e.submerged) return;
  for (const d of [...e.dots]) {
    if (e.dead) break;
    const dmg = dotTick(c, e, d.dmg);
    fx(c, { kind: 'tick', who: e.uid, amount: dmg, label: DOT_LABEL[d.id] ?? 'Ombre' });
    damageEnemy(c, e, dmg, true);
    // Tourment : chaque tick de DoT soigne. Toucher vampirique, Peste mentale, Équinoxe (Ombre).
    if (power(c, 'tourment')) healPlayer(c, power(c, 'tourment'));
    const heal = (d.heal ?? 0) + (c.shadowForm && c.gear?.equinoxe ? 1 : 0);
    if (heal > 0) healPlayer(c, heal);
    // Esprit tourmenté : un DoT qui tue fait piocher.
    if (e.dead && power(c, 'esprit_tourmente')) {
      drawCards(c, 2);
      c.player.energy += power(c, 'esprit_tourmente') - 1;
    }
    if (consume) {
      d.turns -= 1;
      if (d.grow) d.dmg += d.grow;
    }
  }
  if (consume && e.dots) e.dots = e.dots.filter((d) => d.turns > 0);
}

export const DOT_LABEL: Record<string, string> = {
  toxine: 'Toxine',
  corruption: 'Corruption',
  immolation: 'Immolation',
  souffrance: 'Souffrance',
  pacte: 'Pacte de souffrance',
  fleau: 'Fléau rampant',
  douleur: 'Murmure de douleur',
  feu_sacre: 'Feu sacré',
  vampirique: 'Toucher vampirique',
  peste_mentale: 'Peste mentale',
  // Chasseur
  fleche_venimeuse: 'Venin',
  fleche_ardente: 'Flèche ardente',
  piege_immolation: 'Immolation',
  piege_venin: 'Venin',
  // Druide et Chaman
  feu_de_lune: 'Feu de lune',
  nuee_insectes: 'Nuée d\'insectes',
  choc_flammes: 'Choc de flammes',
};

/** Le nombre de tes DoT et Malédictions sur un ennemi. */
export function afflictionCount(e: EnemyState): number {
  return (e.dots?.length ?? 0) + (e.curses?.length ?? 0);
}

// --- Les Malédictions (une par ennemi, deux avec Double malédiction) ---

/** Pose une Malédiction : remplace la plus ancienne si l'ennemi en porte déjà le maximum. Renvoie le multiplicateur (Amplifier). */
export function placeCurse(c: CombatState, e: EnemyState, id: string): number {
  const max = c.gear?.doubleCurse ? 2 : 1;
  if (!(e.curses ??= []).includes(id)) {
    // removeCurse remplace la liste : on la relit à chaque tour de boucle.
    while (e.curses.length >= max) removeCurse(e, e.curses[0]);
    e.curses.push(id);
  }
  const mult = c.amplify ? 2 : 1;
  c.amplify = false;
  return mult;
}

/** Retire une Malédiction et son effet. */
export function removeCurse(e: EnemyState, id: string): void {
  e.curses = (e.curses ?? []).filter((x) => x !== id);
  if (id === 'souffrance') e.dots = (e.dots ?? []).filter((d) => d.id !== 'souffrance');
  if (id === 'fatigue') {
    e.fatigue = 0;
    e.fatigueTurns = 0;
  }
  if (id === 'elements') {
    e.elements = 0;
    e.elementsTurns = 0;
  }
  if (id === 'faiblesse') e.buffs.demoralise = 0;
  if (id === 'langages') e.tongues = 0;
}

/** À la fin du tour d'un ennemi : ses Malédictions à durée s'usent. */
export function decayCurses(e: EnemyState): void {
  if ((e.fatigueTurns ?? 0) > 0 && --e.fatigueTurns! === 0) removeCurse(e, 'fatigue');
  if ((e.elementsTurns ?? 0) > 0 && --e.elementsTurns! === 0) removeCurse(e, 'elements');
  if (e.curses?.includes('faiblesse') && e.buffs.demoralise <= 1) e.curses = e.curses.filter((x) => x !== 'faiblesse');
  if (e.curses?.includes('souffrance') && !e.dots?.some((d) => d.id === 'souffrance')) e.curses = e.curses.filter((x) => x !== 'souffrance');
  if (e.curses?.includes('langages') && !e.tongues) e.curses = e.curses.filter((x) => x !== 'langages');
  if ((e.haunted ?? 0) > 0) e.haunted! -= 1;
}

// --- La mort d'un ennemi ---

/** Éclats d'âme, Contagion naturelle. */
export function demonOnDeath(c: CombatState, e: EnemyState, byPet: boolean): void {
  if (c.shards === undefined) return;
  const siphon = c.soulSiphon?.[e.uid];
  if (siphon) gainShards(c, siphon);
  else if (afflictionCount(e) > 0) gainShards(c, 1 + (e.dots?.length ? c.gear?.harvestShard ?? 0 : 0));
  if (byPet && power(c, 'eclat_partage')) gainShards(c, 1);
  // Contagion naturelle : les DoT passent à un autre ennemi.
  if (c.gear?.naturalContagion && e.dots?.length) {
    const next = livingEnemies(c).find((o) => o !== e && !o.submerged);
    if (next) for (const d of e.dots) applyDot(c, next, d.id, d.dmg, d.turns, d.grow);
  }
}

// --- Le familier ---

/** Les dégâts et le blocage du familier, avec ses bonus. */
function petValue(c: CombatState, base: number): number {
  const v = base + (c.petBonus ?? 0) + (c.gear?.petBonus ?? 0) + (c.gear?.allyBonus ?? 0);
  return Math.floor(v * (power(c, 'liens_demoniaques') ? 1.5 : 1));
}

/** La cible du familier : la dernière cible visée si elle vit encore, sinon un ennemi au hasard. */
function petTarget(c: CombatState, random_: boolean): EnemyState | null {
  const pool = livingEnemies(c).filter((e) => !e.submerged);
  if (pool.length === 0) return null;
  if (!random_) {
    const t = pool.find((e) => e.uid === c.lastTarget);
    if (t) return t;
  }
  return pool[Math.floor(random(c) * pool.length)];
}

/** Le familier agit (à la fin de ton tour, ou sur ordre). */
export function petAct(c: CombatState, times = 1): void {
  if (!c.pet || c.petSacrificed || c.phase !== 'player') return;
  // Rayon oculaire d'Yzhar : le familier est étourdi.
  if ((c.petStunned ?? 0) > 0) {
    c.petStunned! -= 1;
    log(c, `Ton ${PETS[c.pet].name} est étourdi et ne fait rien.`);
    return;
  }
  const n = times * (c.petDouble ? 2 : 1);
  c.petDouble = false;
  // Malédiction de lignée : le familier se retourne contre toi.
  const betrayed = (c.player.debuffs?.lignee ?? 0) > 0;
  for (let i = 0; i < n && c.phase === 'player'; i++) {
    const name = PETS[c.pet].name;
    if (c.pet === 'rodeur') {
      if (betrayed) {
        log(c, `Ton ${name}, retourné, refuse de te protéger.`);
        continue;
      }
      gainBlock(c, petValue(c, 5), false);
    } else {
      // Retourné, le familier t'attaque, mais sans les bonus que tu lui donnes.
      if (betrayed) {
        const hurt = c.pet === 'diablotin' ? 4 : 2;
        fx(c, { kind: 'tick', who: 'player', amount: hurt, label: name });
        damagePlayer(c, hurt, false);
        log(c, `Ton ${name}, retourné, t'attaque.`);
        continue;
      }
      const dmg = petValue(c, c.pet === 'diablotin' ? 4 : 2);
      const t = petTarget(c, c.pet === 'diablotin');
      if (t) {
        fx(c, { kind: 'tick', who: t.uid, amount: dmg, label: name });
        c.petActing = true;
        try {
          damageEnemy(c, t, dmg);
        } finally {
          c.petActing = false;
        }
        // Lien de l'âme : les dégâts du familier deviennent du blocage.
        if (power(c, 'lien_ame')) gainBlock(c, dmg, false);
      }
      // Succube : Séduction tous les 3 tours.
      if (c.pet === 'succube' && c.turn % 3 === 0) {
        const charmed = livingEnemies(c).find((e) => !isBossEnemy(e) && !e.submerged && !(e.buffs.peur ?? 0));
        if (charmed) {
          charmed.buffs.peur = 1;
          fx(c, { kind: 'buff', who: charmed.uid, label: 'Séduction' });
        }
      }
    }
    if (c.gear?.petBlock) gainBlock(c, c.gear.petBlock, false);
  }
}

/** Le Molosse infernal au début de ton tour : il dévore une malédiction, et son Verrou magique se recharge. */
export function felhunterStart(c: CombatState, purify: () => void): void {
  if (c.pet !== 'molosse' || c.petSacrificed) return;
  purify();
  c.felhunterLock = Math.max(0, (c.felhunterLock ?? 0) - 1);
}

/** Le Verrou magique du Molosse infernal : interrompt la première Incantation qui peut l'être (tous les 3 tours). */
export function felhunterLock(c: CombatState): void {
  if (c.pet !== 'molosse' || c.petSacrificed || (c.felhunterLock ?? 0) > 0) return;
  const caster = livingEnemies(c).find((e) => isInterruptible(e.intent) && !e.interrupted && !e.submerged);
  if (!caster) return;
  caster.interrupted = true;
  c.felhunterLock = 3;
  fx(c, { kind: 'interrupt', who: caster.uid });
  log(c, `Le Molosse infernal lance Verrou magique sur ${caster.name} !`);
}

/** Change de familier (Invocation). */
export function summonPet(c: CombatState, pet: PetId): void {
  c.pet = pet;
  c.petSacrificed = false;
  fx(c, { kind: 'buff', who: 'player', label: PETS[pet].name });
  petAct(c);
}
