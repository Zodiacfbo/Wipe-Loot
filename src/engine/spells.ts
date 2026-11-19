// La barre de sorts : des sorts toujours disponibles, sans pioche, mais avec un temps de recharge.
// Référence : docs/classes/GUERRIER.md (§4.2 et §6) et docs/classes/MAGE.md (§4.2 et §6)
import { applyBrulure, applyGel, drawCards, fx, gainBlock, gainRage, livingEnemies, log, playerAttack } from './actions';
import { ENEMIES, isInterruptible } from './enemies';
import { TALENT_SPELLS } from './talents';
import type { ItemEffects } from './items';
import type { CombatState, EnemyState } from './types';
import { CARDS } from './cards';

/** Nombre d'emplacements de la barre (un 4e viendra avec un talent). */
export const BAR_SLOTS = 3;

export interface SpellDef {
  id: string;
  name: string;
  cost: number;
  /** Tours de recharge après utilisation. */
  cooldown: number;
  /** Une seule fois par combat. */
  once?: boolean;
  needsTarget: boolean;
  icon: 'charge' | 'epee' | 'bouclier' | 'hausse' | 'coeur' | 'crane' | 'flamme' | 'flocon' | 'etoile';
  /** Utiliser le sort termine ton tour (Carapace de glace). */
  endsTurn?: boolean;
  /** La classe du sort (guerrier par défaut). */
  classId?: string;
  text: string;
  cast: (c: CombatState, target: EnemyState | null) => void;
}

/** L'attaque de base d'un ennemi (pour Cri de défi). */
export function basicAttack(e: EnemyState): number {
  const def = ENEMIES[e.defId];
  const all = [...(def.firstIntents ?? []), ...def.cycle];
  const hit = all.find((i) => i.kind === 'attack' && !i.cast);
  return hit && hit.kind === 'attack' ? hit.dmg : 6;
}

export const SPELLS: Record<string, SpellDef> = {
  charge: {
    id: 'charge', name: 'Charge', cost: 0, cooldown: 3, needsTarget: true, icon: 'charge',
    text: 'Inflige 3 dégâts et gagne 3 rage.',
    cast: (c, target) => {
      if (target) playerAttack(c, target, 3);
      gainRage(c, 3);
    },
  },
  coup_de_pommeau: {
    id: 'coup_de_pommeau', name: 'Coup de pommeau', cost: 0, cooldown: 4, needsTarget: true, icon: 'epee',
    text: 'Interruption. Inflige 2 dégâts.',
    cast: (c, target) => {
      if (!target) return;
      if (isInterruptible(target.intent) && !target.interrupted) {
        target.interrupted = true;
        fx(c, { kind: 'interrupt', who: target.uid });
        if (c.gear?.interruptDraw) drawCards(c, c.gear.interruptDraw);
        log(c, `${target.name} est interrompu !`);
      }
      playerAttack(c, target, 2);
    },
  },
  rage_berserker: {
    id: 'rage_berserker', name: 'Rage du berserker', cost: 0, cooldown: 3, needsTarget: false, icon: 'hausse',
    text: 'Gagne 5 rage. Immunisé à la Peur et aux cartes Paniquées jusqu\'à ton prochain tour.',
    cast: (c) => {
      gainRage(c, 5);
      c.player.fearless = true;
      fx(c, { kind: 'buff', who: 'player', label: 'Rage du berserker' });
    },
  },
  temerite: {
    id: 'temerite', name: 'Témérité', cost: 1, cooldown: 5, needsTarget: false, icon: 'epee',
    text: 'Ce tour-ci, tes Attaques infligent 50 % de dégâts en plus. Tu subis 25 % de dégâts en plus jusqu\'à ton prochain tour.',
    cast: (c) => {
      c.player.temerite = true;
      fx(c, { kind: 'buff', who: 'player', label: 'Témérité : +50 % de dégâts' });
    },
  },
  rempart: {
    id: 'rempart', name: 'Rempart', cost: 1, cooldown: 5, needsTarget: false, icon: 'bouclier',
    text: 'Jusqu\'à ton prochain tour, les dégâts que tu subis sont réduits de moitié.',
    cast: (c) => {
      c.player.rempart = true;
      fx(c, { kind: 'buff', who: 'player', label: 'Rempart : dégâts réduits de moitié' });
    },
  },
  cri_de_defi: {
    id: 'cri_de_defi', name: 'Cri de défi', cost: 1, cooldown: 4, needsTarget: false, icon: 'crane',
    text: 'Tous les ennemis t\'attaquent au lieu de faire leur action : leurs incantations sont annulées.',
    cast: (c) => {
      for (const e of livingEnemies(c)) {
        if (e.submerged) continue;
        e.intent = { kind: 'attack', dmg: basicAttack(e) };
        e.interrupted = false;
        e.delayed = false;
      }
      fx(c, { kind: 'buff', who: 'player', label: 'Cri de défi !' });
      log(c, 'Tu provoques tous les ennemis : ils ne pensent plus qu\'à t\'attaquer.');
    },
  },
  dernier_rempart: {
    id: 'dernier_rempart', name: 'Dernier rempart', cost: 0, cooldown: 0, once: true, needsTarget: false, icon: 'coeur',
    text: 'Soigne 15 % de tes PV max. Une fois par combat.',
    cast: (c) => {
      const p = c.player;
      const healed = Math.min(p.maxHp - p.hp, Math.floor(p.maxHp * 0.15));
      p.hp += healed;
      fx(c, { kind: 'heal', from: 'player', to: 'player', amount: healed });
      log(c, `Dernier rempart : tu récupères ${healed} PV.`);
    },
  },
  cri_commandement: {
    id: 'cri_commandement', name: 'Cri de commandement', cost: 1, cooldown: 4, needsTarget: false, icon: 'hausse',
    text: 'Tous les ennemis sont Démoralisés 2 tours. Gagne 1 Robustesse.',
    cast: (c) => {
      for (const e of livingEnemies(c)) e.buffs.demoralise = Math.max(e.buffs.demoralise, 2);
      c.player.robustesse += 1;
      fx(c, { kind: 'buff', who: 'player', label: 'Robustesse +1' });
    },
  },
  vague_de_choc: {
    id: 'vague_de_choc', name: 'Vague de choc', cost: 1, cooldown: 3, needsTarget: false, icon: 'epee',
    text: 'Inflige 6 dégâts à tous les ennemis. Ralenti 1.',
    cast: (c) => {
      for (const e of livingEnemies(c)) {
        playerAttack(c, e, 6);
        if (!e.dead && !e.submerged) e.buffs.ralenti = Math.max(e.buffs.ralenti, 1);
      }
    },
  },
};

/** Les sorts de barre du Mage. */
const MAGE_SPELLS: SpellDef[] = [
  {
    id: 'contresort', name: 'Contresort', cost: 0, cooldown: 3, needsTarget: true, icon: 'etoile',
    text: 'Interruption : la cible ne peut pas finir son Incantation. Inflige 4 dégâts.',
    cast: (c, target) => {
      if (!target) return;
      if (isInterruptible(target.intent) && !target.interrupted) {
        target.interrupted = true;
        fx(c, { kind: 'interrupt', who: target.uid });
        if (c.gear?.interruptDraw) drawCards(c, c.gear.interruptDraw);
        log(c, `${target.name} est contré !`);
      }
      playerAttack(c, target, 4);
    },
  },
  {
    id: 'evocation', name: 'Évocation', cost: 0, cooldown: 5, needsTarget: false, icon: 'hausse',
    text: 'Gagne 2 énergie et pioche 1 carte.',
    cast: (c) => {
      c.player.energy += 2;
      drawCards(c, 1);
      fx(c, { kind: 'buff', who: 'player', label: 'Évocation : +2 énergie' });
    },
  },
  {
    id: 'pouvoir_arcanes', name: 'Pouvoir des arcanes', cost: 0, cooldown: 5, needsTarget: false, icon: 'etoile',
    text: 'Ce tour-ci, tes Sorts infligent 50 % de dégâts en plus.',
    cast: (c) => {
      c.player.arcanePower = true;
      fx(c, { kind: 'buff', who: 'player', label: 'Pouvoir des arcanes : +50 %' });
    },
  },
  {
    id: 'clignement', name: 'Clignement', cost: 0, cooldown: 4, needsTarget: false, icon: 'charge',
    text: 'Retire de ta main les cartes-statut (Zone de feu, Bombe vivante, Fardeau) sans subir leur effet. Gagne 4 blocage.',
    cast: (c) => {
      const gone = c.hand.filter((card) => CARDS[card.id].type === 'Statut' && card.id !== 'malediction');
      c.hand = c.hand.filter((card) => !gone.includes(card));
      c.exhaust.push(...gone);
      gainBlock(c, 4, false);
      log(c, gone.length > 0 ? `Tu te téléportes : ${gone.length} carte${gone.length > 1 ? 's' : ''}-statut retirée${gone.length > 1 ? 's' : ''}.` : 'Tu te téléportes.');
    },
  },
  {
    id: 'combustion', name: 'Combustion', cost: 1, cooldown: 4, needsTarget: false, icon: 'flamme',
    text: 'Double la Brûlure de tous les ennemis.',
    cast: (c) => {
      for (const e of livingEnemies(c)) {
        if (e.submerged || !e.buffs.brulure) continue;
        e.buffs.brulure *= 2;
        fx(c, { kind: 'buff', who: e.uid, label: `Brûlure ${e.buffs.brulure}` });
      }
    },
  },
  {
    id: 'souffle_ardent', name: 'Souffle ardent', cost: 1, cooldown: 3, needsTarget: false, icon: 'flamme',
    text: 'Inflige 4 dégâts et Brûlure 2 à tous les ennemis.',
    cast: (c) => {
      for (const e of livingEnemies(c)) {
        if (e.submerged) continue;
        playerAttack(c, e, 4);
        if (!e.dead) applyBrulure(c, e, 2);
      }
    },
  },
  {
    id: 'carapace_de_glace', name: 'Carapace de glace', cost: 1, cooldown: 6, needsTarget: false, endsTurn: true, icon: 'flocon',
    text: 'Tu es immunisé à tous les dégâts jusqu\'à ton prochain tour. Ton tour se termine.',
    cast: (c) => {
      c.player.iceBlock = true;
      fx(c, { kind: 'buff', who: 'player', label: 'Carapace de glace : immunisé' });
    },
  },
  {
    id: 'orbe_glaciale', name: 'Orbe glaciale', cost: 1, cooldown: 3, needsTarget: false, icon: 'flocon',
    text: 'Inflige 4 dégâts et Gel 2 à tous les ennemis.',
    cast: (c) => {
      for (const e of livingEnemies(c)) {
        if (e.submerged) continue;
        playerAttack(c, e, 4);
        if (!e.dead) applyGel(c, e, 2);
      }
    },
  },
  {
    id: 'bouclier_feu_ancestral', name: 'Bouclier de feu ancestral', cost: 1, cooldown: 3, needsTarget: false, icon: 'flamme',
    text: 'Gagne 8 blocage. Jusqu\'à ton prochain tour, chaque ennemi qui t\'attaque reçoit Brûlure 3.',
    cast: (c) => {
      gainBlock(c, 8, false);
      c.player.fireShield = 3;
    },
  },
  {
    id: 'vortex_temporel', name: 'Vortex temporel', cost: 0, cooldown: 0, once: true, needsTarget: false, icon: 'hausse',
    text: 'Les temps de recharge de tes autres sorts diminuent de 2. Une fois par combat.',
    cast: (c) => {
      for (const s of c.spells) if (s.id !== 'vortex_temporel' && s.cooldown < 999) s.cooldown = Math.max(0, s.cooldown - 2);
      fx(c, { kind: 'buff', who: 'player', label: 'Vortex temporel' });
    },
  },
];
for (const d of MAGE_SPELLS) SPELLS[d.id] = { ...d, classId: 'mage' };

/** La classe d'un sort de barre. */
export function spellClass(id: string): string {
  return SPELLS[id]?.classId ?? 'guerrier';
}

/** Le temps de recharge d'un sort, avec les talents (Pyromane, Hiver sans fin). */
export function spellCooldown(def: SpellDef, g: ItemEffects | undefined): number {
  let cd = def.cooldown;
  if (def.id === 'combustion' || def.id === 'souffle_ardent') cd -= g?.fireSpellCd ?? 0;
  if (def.id === 'carapace_de_glace') cd -= g?.iceBlockCd ?? 0;
  return Math.max(1, cd);
}

/** Les sorts qu'une classe peut trouver dans les tables de loot (les sorts de talent s'obtiennent par les talents). */
export function lootSpells(classId = 'guerrier'): string[] {
  const start = new Set(['charge', 'contresort']);
  return Object.keys(SPELLS).filter((id) => spellClass(id) === classId && !start.has(id) && !TALENT_SPELLS.has(id));
}

export const WARRIOR_LOOT_SPELLS = lootSpells('guerrier');
