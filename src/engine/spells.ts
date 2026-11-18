// La barre de sorts du Guerrier : des sorts toujours disponibles, sans pioche, mais avec un temps de recharge.
// Référence : docs/classes/GUERRIER.md (§4.2 et §6)
import { drawCards, fx, gainRage, livingEnemies, log, playerAttack } from './actions';
import { ENEMIES, isInterruptible } from './enemies';
import { TALENT_SPELLS } from './talents';
import type { CombatState, EnemyState } from './types';

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
  icon: 'charge' | 'epee' | 'bouclier' | 'hausse' | 'coeur' | 'crane';
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
    id: 'rempart', name: 'Rempart', cost: 0, cooldown: 5, needsTarget: false, icon: 'bouclier',
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
    text: 'Soigne 25 % de tes PV max. Une fois par combat.',
    cast: (c) => {
      const p = c.player;
      const healed = Math.min(p.maxHp - p.hp, Math.floor(p.maxHp * 0.25));
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

/** Les sorts que le Guerrier peut trouver dans les tables de loot (les sorts de talent s'obtiennent par les talents). */
export const WARRIOR_LOOT_SPELLS = Object.keys(SPELLS).filter((id) => id !== 'charge' && !TALENT_SPELLS.has(id));
