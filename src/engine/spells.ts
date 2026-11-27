// La barre de sorts : des sorts toujours disponibles, sans pioche, mais avec un temps de recharge.
// Référence : docs/classes/GUERRIER.md (§4.2 et §6) et docs/classes/MAGE.md (§4.2 et §6)
import { applyBrulure, applyGel, drawCards, fx, gainBlock, gainRage, healPlayer, isBossEnemy, livingEnemies, log, playerAttack, power } from './actions';
import { loseHp, petAct } from './demoniste';
import { dispelMagic, dispelPoison, gainAegis } from './pretre';
import { applyPoison, enterStealth, stun } from './voleur';
import { activateSeal, dispelAll, judge, palHeal } from './paladin';
import { companionAct, companionGuard } from './chasseur';
import { gainCatCombo } from './druide';
import { clearTotems, placeTotem } from './chaman';
import { ENEMIES, isInterruptible } from './enemies';
import { TALENT_SPELLS } from './talents';
import type { ItemEffects } from './items';
import type { CombatState, EnemyState } from './types';
import { CARDS } from './cards';

/** Les cartes-statut qui aident le joueur : les sorts qui « nettoient » la main les laissent (bug du Cercle et du Regard sombre). */
const HELPFUL_STATUS = new Set(['a_couvert', 'sceptre_domination', 'fiole_instable', 'cristal_obsidienne']);

/** Retire de la main les cartes-statut gênantes (la Malédiction reste si `keepCurse`) et les renvoie. */
function removeStatusCards(c: CombatState, keepCurse: boolean): CombatState['hand'] {
  const gone = c.hand.filter((card) => CARDS[card.id].type === 'Statut' && !HELPFUL_STATUS.has(card.id) && !(keepCurse && card.id === 'malediction'));
  c.hand = c.hand.filter((card) => !gone.includes(card));
  c.exhaust.push(...gone);
  return gone;
}

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
  /** Coût en éclats d'âme (Pierre d'âme). */
  shardCost?: number;
  /** La classe du sort (guerrier par défaut). */
  classId?: string;
  /** Le sort ne compte pas comme un Sort (Choc tellurique du Chaman : pas de bonus aux Sorts). */
  noSpell?: boolean;
  /** Une condition en plus pour pouvoir lancer le sort (Imposition des mains). */
  usable?: (c: CombatState) => boolean;
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
      const healed = healPlayer(c, Math.floor(p.maxHp * 0.15));
      fx(c, { kind: 'heal', from: 'player', to: 'player', amount: healed });
      log(c, `Dernier rempart : tu récupères ${healed} PV.`);
    },
  },
  regeneration_enragee: {
    id: 'regeneration_enragee', name: 'Régénération enragée', cost: 0, cooldown: 0, once: true, needsTarget: false, icon: 'coeur',
    text: 'Dépense toute ta rage : soigne 2 PV par point. Une fois par combat.',
    usable: (c) => c.player.rage > 0,
    cast: (c) => {
      const p = c.player;
      const spent = p.rage;
      p.rage = 0;
      const healed = healPlayer(c, spent * 2);
      fx(c, { kind: 'heal', from: 'player', to: 'player', amount: healed });
      log(c, `Régénération enragée : ${spent} rage, ${healed} PV.`);
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
      const gone = removeStatusCards(c, true);
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

/** Le prix de Pacte de sang : 5 PV, moins Intensité et Maître des pactes ; gratuit une fois par tour avec le Bâton du Veilleur. */
export function bloodPactCost(c: CombatState): number {
  if (c.gear?.freePact && !c.freePactUsed) return 0;
  return Math.max(0, 5 - (c.gear?.bloodPactCost ?? 0) - power(c, 'maitre_pactes'));
}

/** Les sorts de barre du Démoniste. */
const DEMONISTE_SPELLS: SpellDef[] = [
  {
    id: 'pacte_de_sang', name: 'Pacte de sang', cost: 0, cooldown: 2, needsTarget: false, icon: 'coeur',
    text: 'Perds 5 PV. Gagne 1 énergie et pioche 1 carte.',
    cast: (c) => {
      const cost = bloodPactCost(c);
      if (c.gear?.freePact && !c.freePactUsed) c.freePactUsed = true;
      loseHp(c, cost);
      c.player.energy += 1;
      drawCards(c, 1);
    },
  },
  {
    id: 'amplifier', name: 'Amplifier la malédiction', cost: 0, cooldown: 4, needsTarget: false, icon: 'crane',
    text: 'L\'effet de ta prochaine Malédiction est doublé.',
    cast: (c) => {
      c.amplify = true;
      fx(c, { kind: 'buff', who: 'player', label: 'Malédiction amplifiée' });
    },
  },
  {
    id: 'spirale_mortelle', name: 'Spirale mortelle', cost: 1, cooldown: 4, needsTarget: true, icon: 'crane',
    text: 'Inflige 8 dégâts et te soigne de 8 PV. La cible (sauf boss) est Apeurée 1 tour.',
    cast: (c, target) => {
      if (!target) return;
      playerAttack(c, target, 8);
      const healed = healPlayer(c, 8);
      if (healed > 0) fx(c, { kind: 'heal', from: 'player', to: 'player', amount: healed });
      if (!target.dead && !isBossEnemy(target)) target.buffs.peur = Math.max(target.buffs.peur ?? 0, 1);
    },
  },
  {
    id: 'pacte_demoniaque', name: 'Pacte démoniaque', cost: 0, cooldown: 4, needsTarget: false, icon: 'hausse',
    text: 'Ton familier agit deux fois de plus, immédiatement.',
    cast: (c) => petAct(c, 2),
  },
  {
    id: 'pierre_ame', name: 'Pierre d\'âme', cost: 0, cooldown: 0, once: true, shardCost: 1, needsTarget: false, icon: 'coeur',
    text: 'Coûte 1 éclat d\'âme. Si tu tombes à 0 PV pendant ce combat, tu reviens à 30 % de tes PV max.',
    cast: (c) => {
      c.soulstone = true;
      fx(c, { kind: 'buff', who: 'player', label: 'Pierre d\'âme' });
    },
  },
  {
    id: 'brulure_ombre', name: 'Brûlure de l\'ombre', cost: 1, cooldown: 3, needsTarget: true, icon: 'flamme',
    text: 'Inflige 10 dégâts. Si la cible meurt ce tour-ci : +1 éclat d\'âme.',
    cast: (c, target) => {
      if (!target) return;
      if (c.soulSiphon) c.soulSiphon[target.uid] = Math.max(c.soulSiphon[target.uid] ?? 0, 1);
      playerAttack(c, target, 10);
    },
  },
  {
    id: 'rempart_ombre', name: 'Rempart d\'ombre', cost: 0, cooldown: 3, needsTarget: false, icon: 'bouclier',
    text: 'Gagne 10 blocage.',
    cast: (c) => gainBlock(c, 10, false),
  },
  {
    id: 'cercle_teleportation', name: 'Cercle de téléportation', cost: 0, cooldown: 4, needsTarget: false, icon: 'charge',
    text: 'Retire de ta main les cartes-statut (Zone de feu, Bombe vivante, Fardeau, Cendres) sans subir leur effet.',
    cast: (c) => {
      const gone = removeStatusCards(c, true);
      log(c, `Tu traverses le cercle : ${gone.length} carte${gone.length > 1 ? 's' : ''}-statut retirée${gone.length > 1 ? 's' : ''}.`);
    },
  },
  {
    id: 'oeil_abime', name: 'Œil de l\'abîme', cost: 0, cooldown: 3, needsTarget: false, icon: 'etoile',
    text: 'Pour le reste du combat, tu vois les deux prochaines intentions des ennemis.',
    cast: (c) => {
      c.seeAll = true;
      fx(c, { kind: 'buff', who: 'player', label: 'Œil de l\'abîme' });
    },
  },
];
for (const d of DEMONISTE_SPELLS) SPELLS[d.id] = { ...d, classId: 'demoniste' };

/** Les sorts de barre du Prêtre. */
const PRETRE_SPELLS: SpellDef[] = [
  {
    id: 'egide_sacree', name: 'Égide sacrée', cost: 0, cooldown: 2, needsTarget: false, icon: 'bouclier',
    text: 'Gagne 5 Égide.',
    cast: (c) => gainAegis(c, 5, false),
  },
  {
    id: 'transfusion', name: 'Transfusion de puissance', cost: 0, cooldown: 5, needsTarget: false, icon: 'hausse',
    text: 'Ce tour-ci, tes cartes coûtent 1 de moins (minimum 0).',
    cast: (c) => {
      c.costDown = true;
      fx(c, { kind: 'buff', who: 'player', label: 'Transfusion de puissance' });
    },
  },
  {
    id: 'focalisation_interieure', name: 'Focalisation intérieure', cost: 0, cooldown: 4, needsTarget: false, icon: 'etoile',
    text: 'Ta prochaine carte coûte 0.',
    cast: (c) => {
      c.freeNext = true;
    },
  },
  {
    id: 'priere_desesperee', name: 'Prière désespérée', cost: 0, cooldown: 0, once: true, needsTarget: false, icon: 'coeur',
    text: 'Soigne 20 PV. Une fois par combat.',
    cast: (c) => {
      const healed = healPlayer(c, 20);
      fx(c, { kind: 'heal', from: 'player', to: 'player', amount: healed });
    },
  },
  {
    id: 'nova_lumiere', name: 'Nova de lumière', cost: 1, cooldown: 3, needsTarget: false, icon: 'etoile',
    text: 'Inflige 6 dégâts à tous les ennemis et soigne 6 PV.',
    cast: (c) => {
      for (const e of livingEnemies(c)) if (!e.submerged) playerAttack(c, e, 6);
      const healed = healPlayer(c, 6);
      if (healed > 0) fx(c, { kind: 'heal', from: 'player', to: 'player', amount: healed });
    },
  },
  {
    id: 'silence', name: 'Silence', cost: 0, cooldown: 4, needsTarget: true, icon: 'crane',
    text: 'Interruption : la cible ne peut pas finir son Incantation.',
    cast: (c, target) => {
      if (!target || !isInterruptible(target.intent) || target.interrupted) return;
      target.interrupted = true;
      fx(c, { kind: 'interrupt', who: target.uid });
      log(c, `${target.name} est réduit au silence !`);
    },
  },
  {
    id: 'cri_psychique', name: 'Cri psychique', cost: 1, cooldown: 5, needsTarget: false, icon: 'crane',
    text: 'Tous les ennemis (sauf boss) sont Apeurés 1 tour. Les boss sont Démoralisés 2 tours.',
    cast: (c) => {
      for (const e of livingEnemies(c)) {
        if (isBossEnemy(e)) e.buffs.demoralise = Math.max(e.buffs.demoralise, 2);
        else e.buffs.peur = Math.max(e.buffs.peur ?? 0, 1);
      }
    },
  },
  {
    id: 'lien_lumiere', name: 'Lien de lumière', cost: 1, cooldown: 4, needsTarget: false, icon: 'coeur',
    text: 'Soigne 8 PV et gagne 8 Égide.',
    cast: (c) => {
      const healed = healPlayer(c, 8);
      if (healed > 0) fx(c, { kind: 'heal', from: 'player', to: 'player', amount: healed });
      gainAegis(c, 8, false);
    },
  },
  {
    id: 'pacte_ombre', name: 'Pacte de l\'ombre', cost: 0, cooldown: 3, needsTarget: false, icon: 'crane',
    text: 'Pioche 3 cartes. Perds 5 PV.',
    cast: (c) => {
      drawCards(c, 3);
      loseHp(c, 5, 'Pacte de l\'ombre');
    },
  },
];
for (const d of PRETRE_SPELLS) SPELLS[d.id] = { ...d, classId: 'pretre' };

/** Les sorts de barre du Voleur. */
const VOLEUR_SPELLS: SpellDef[] = [
  {
    id: 'sprint', name: 'Sprint', cost: 0, cooldown: 3, needsTarget: false, icon: 'charge',
    text: 'Pioche 2 cartes.',
    cast: (c) => drawCards(c, 2),
  },
  {
    id: 'coup_de_pied', name: 'Coup de pied', cost: 0, cooldown: 3, needsTarget: true, icon: 'epee',
    text: 'Interruption. Inflige 3 dégâts.',
    cast: (c, target) => {
      if (!target) return;
      if (isInterruptible(target.intent) && !target.interrupted) {
        target.interrupted = true;
        fx(c, { kind: 'interrupt', who: target.uid });
        log(c, `${target.name} est interrompu !`);
      }
      playerAttack(c, target, 3);
    },
  },
  {
    id: 'voile_obscur', name: 'Voile de l\'ombre', cost: 0, cooldown: 0, once: true, needsTarget: false, icon: 'etoile',
    text: 'Retire tous tes maléfices. Une fois par combat.',
    cast: (c) => {
      dispelMagic(c);
      dispelPoison(c);
      const d = c.player.debuffs;
      if (d) Object.assign(d, { ralenti: 0, ombre: 0, discard: 0, transmute: 0, afflictions: [] });
      fx(c, { kind: 'buff', who: 'player', label: 'Voile de l\'ombre' });
    },
  },
  {
    id: 'poussee_adrenaline', name: 'Poussée d\'adrénaline', cost: 0, cooldown: 5, needsTarget: false, icon: 'hausse',
    text: 'Gagne 2 énergie.',
    cast: (c) => {
      c.player.energy += 2;
      fx(c, { kind: 'buff', who: 'player', label: '+2 énergie' });
    },
  },
  {
    id: 'evasion', name: 'Évasion', cost: 0, cooldown: 4, needsTarget: false, icon: 'bouclier',
    text: 'Jusqu\'à ton prochain tour, les Attaques ennemies t\'infligent 50 % de dégâts en moins.',
    cast: (c) => {
      c.player.evasion = true;
      fx(c, { kind: 'buff', who: 'player', label: 'Évasion' });
    },
  },
  {
    id: 'disparition', name: 'Disparition', cost: 1, cooldown: 5, needsTarget: false, icon: 'etoile',
    text: 'Gagne 10 blocage. Tu redeviens Camouflé.',
    cast: (c) => {
      gainBlock(c, 10, false);
      enterStealth(c, 1);
    },
  },
  {
    id: 'preparation', name: 'Préparation', cost: 0, cooldown: 0, once: true, needsTarget: false, icon: 'hausse',
    text: 'Les temps de recharge de tes autres sorts sont remis à zéro. Une fois par combat.',
    cast: (c) => {
      for (const s of c.spells) if (s.id !== 'preparation' && !SPELLS[s.id].once) s.cooldown = 0;
    },
  },
  {
    id: 'lancer_poison', name: 'Lancer de poison', cost: 1, cooldown: 4, needsTarget: false, icon: 'crane',
    text: 'Applique Poison 4 à tous les ennemis.',
    cast: (c) => {
      for (const e of livingEnemies(c)) applyPoison(c, e, 4);
    },
  },
  {
    id: 'pas_de_cote', name: 'Pas de côté', cost: 0, cooldown: 3, needsTarget: false, icon: 'charge',
    text: 'Retire les cartes-statut gênantes de ta main.',
    cast: (c) => {
      const statuses = removeStatusCards(c, false);
      if (statuses.length) log(c, `Tu esquives ${statuses.length} carte${statuses.length > 1 ? 's' : ''}-statut.`);
    },
  },
];
for (const d of VOLEUR_SPELLS) SPELLS[d.id] = { ...d, classId: 'voleur' };

/** Les sorts de barre du Paladin. Référence : docs/classes/PALADIN.md (§6) */
const PALADIN_SPELLS: Omit<SpellDef, 'classId'>[] = [
  {
    id: 'jugement', name: 'Jugement', cost: 0, cooldown: 3, needsTarget: true, icon: 'etoile',
    text: 'Consomme ton Sceau actif et déclenche son effet de Jugement. Sans Sceau actif, inflige 6 dégâts.',
    cast: (c, target) => judge(c, target),
  },
  {
    id: 'imposition_mains', name: 'Imposition des mains', cost: 0, cooldown: 0, once: true, needsTarget: false, icon: 'coeur',
    text: 'Seulement sous 30 % de tes PV : soigne 30 % de tes PV max. Une fois par combat.',
    usable: (c) => c.player.hp < c.player.maxHp * 0.3,
    cast: (c) => {
      palHeal(c, Math.floor(c.player.maxHp * 0.3));
    },
  },
  {
    id: 'purification_pal', name: 'Purification', cost: 0, cooldown: 3, needsTarget: false, icon: 'etoile',
    text: 'Dissipation (Magie, Poison, Maladie).',
    cast: (c) => {
      dispelMagic(c);
      dispelPoison(c);
      fx(c, { kind: 'buff', who: 'player', label: 'Purification' });
    },
  },
  {
    id: 'bouclier_divin', name: 'Bouclier divin', cost: 1, cooldown: 7, needsTarget: false, icon: 'bouclier',
    text: 'Tu es immunisé à tous les dégâts jusqu\'à ton prochain tour. Tes Attaques infligent 50 % de dégâts en moins ce tour-ci.',
    cast: (c) => {
      c.player.iceBlock = true;
      c.player.divineShield = true;
      fx(c, { kind: 'buff', who: 'player', label: 'Bouclier divin' });
    },
  },
  {
    id: 'marteau_jugement', name: 'Marteau du jugement', cost: 1, cooldown: 4, needsTarget: true, icon: 'epee',
    text: 'Interruption. Inflige 6 dégâts. La cible (sauf boss) est Contrôlée 1 tour.',
    cast: (c, target) => {
      if (!target) return;
      if (isInterruptible(target.intent) && !target.interrupted) {
        target.interrupted = true;
        fx(c, { kind: 'interrupt', who: target.uid });
        log(c, `${target.name} est interrompu !`);
      }
      playerAttack(c, target, 6);
      if (!target.dead) stun(c, target, 1);
    },
  },
  {
    id: 'ailes_justice', name: 'Ailes de justice', cost: 0, cooldown: 6, needsTarget: false, icon: 'hausse',
    text: 'Gagne 2 Puissance pendant 3 tours.',
    cast: (c) => {
      if ((c.wings ?? 0) === 0) c.player.puissance += 2;
      c.wings = 3;
      fx(c, { kind: 'buff', who: 'player', label: 'Ailes de justice' });
    },
  },
  // Sorts de loot
  {
    id: 'benediction_sauvegarde', name: 'Bénédiction de sauvegarde', cost: 0, cooldown: 4, needsTarget: false, icon: 'bouclier',
    text: 'Gagne 12 blocage. Dissipation (Poison).',
    cast: (c) => {
      gainBlock(c, 12, false);
      dispelPoison(c);
    },
  },
  {
    id: 'charge_sacree', name: 'Charge sacrée', cost: 0, cooldown: 3, needsTarget: true, icon: 'charge',
    text: 'Inflige 8 dégâts et active le Sceau du croisé.',
    cast: (c, target) => {
      if (target) playerAttack(c, target, 8);
      activateSeal(c, 'croise');
    },
  },
  {
    id: 'lumiere_aube', name: 'Lumière de l\'aube', cost: 0, cooldown: 0, once: true, needsTarget: false, icon: 'etoile',
    text: 'Dissipation de tous les types. Soigne 6 PV. Une fois par combat.',
    cast: (c) => {
      dispelAll(c);
      palHeal(c, 6);
    },
  },
];
for (const d of PALADIN_SPELLS) SPELLS[d.id] = { ...d, classId: 'paladin' };

/** Les sorts de barre du Chasseur. Référence : docs/classes/CHASSEUR.md (§6) */
const CHASSEUR_SPELLS: Omit<SpellDef, 'classId'>[] = [
  {
    id: 'tir_arcanique', name: 'Tir arcanique', cost: 0, cooldown: 2, needsTarget: true, icon: 'etoile',
    text: 'Inflige 5 dégâts. Ignore le blocage.',
    cast: (c, target) => {
      if (target) playerAttack(c, target, 5, { ignoreBlock: true });
    },
  },
  {
    id: 'fureur_bestiale', name: 'Fureur bestiale', cost: 0, cooldown: 5, needsTarget: false, icon: 'hausse',
    text: 'Ton compagnon agit 3 fois tout de suite.',
    cast: (c) => {
      companionAct(c, 3);
    },
  },
  {
    id: 'feindre_mort', name: 'Feindre la mort', cost: 0, cooldown: 5, needsTarget: false, icon: 'bouclier',
    text: 'Jusqu\'à ton prochain tour, les ennemis visent ton compagnon : leurs attaques t\'infligent 50 % de dégâts en moins.',
    cast: (c) => {
      c.feign = true;
      fx(c, { kind: 'buff', who: 'player', label: 'Feindre la mort' });
    },
  },
  {
    id: 'tir_rapide', name: 'Tir rapide', cost: 0, cooldown: 4, needsTarget: false, icon: 'charge',
    text: 'Ce tour-ci, tes Attaques coûtent 1 de moins.',
    cast: (c) => {
      c.rapidFire = true;
      fx(c, { kind: 'buff', who: 'player', label: 'Tir rapide' });
    },
  },
  {
    id: 'fleche_museliere', name: 'Flèche muselière', cost: 0, cooldown: 4, needsTarget: true, icon: 'epee',
    text: 'Interruption. Inflige 3 dégâts.',
    cast: (c, target) => {
      if (!target) return;
      if (isInterruptible(target.intent) && !target.interrupted) {
        target.interrupted = true;
        fx(c, { kind: 'interrupt', who: target.uid });
        if (c.gear?.interruptDraw) drawCards(c, c.gear.interruptDraw);
        log(c, `${target.name} est interrompu !`);
      }
      playerAttack(c, target, 3);
    },
  },
  {
    id: 'fleche_apaisante', name: 'Flèche apaisante', cost: 0, cooldown: 5, needsTarget: true, icon: 'etoile',
    text: 'Retire les bienfaits de la cible (Puissance, blocage). Un boss en Berserk ne l\'est plus ce tour-ci.',
    cast: (c, target) => {
      if (!target) return;
      target.buffs.puissance = Math.min(0, target.buffs.puissance);
      target.block = 0;
      target.vengeance = false;
      target.giant = 0;
      target.haste = false;
      c.soothedTurn = c.turn;
      fx(c, { kind: 'buff', who: target.uid, label: 'Apaisé' });
      log(c, `${target.name} est apaisé.`);
    },
  },
  // Sorts de loot
  {
    id: 'fusee_eclairante', name: 'Fusée éclairante', cost: 0, cooldown: 3, needsTarget: false, icon: 'etoile',
    text: 'Tu vois les deux prochaines intentions de tous les ennemis, jusqu\'à la fin du combat.',
    cast: (c) => {
      c.seeAll = true;
      fx(c, { kind: 'buff', who: 'player', label: 'Fusée éclairante' });
    },
  },
  {
    id: 'appel_compagnon', name: 'Appel du compagnon', cost: 0, cooldown: 3, needsTarget: false, icon: 'bouclier',
    text: 'Ton compagnon agit et te donne 6 blocage.',
    cast: (c) => {
      companionAct(c);
      companionGuard(c, 6);
    },
  },
  {
    id: 'tir_dispersion', name: 'Tir de dispersion', cost: 0, cooldown: 4, needsTarget: false, icon: 'epee',
    text: 'Inflige 3 dégâts à tous les ennemis. Ils sont Démoralisés 1 tour.',
    cast: (c) => {
      for (const e of livingEnemies(c)) {
        if (e.submerged) continue;
        playerAttack(c, e, 3);
        if (!e.dead) e.buffs.demoralise = Math.max(e.buffs.demoralise, 1);
      }
    },
  },
];
for (const d of CHASSEUR_SPELLS) SPELLS[d.id] = { ...d, classId: 'chasseur' };

/** Les sorts de barre du Druide. Référence : docs/classes/DRUIDE.md (§6) */
const DRUIDE_SPELLS: Omit<SpellDef, 'classId'>[] = [
  {
    id: 'seve_vitale', name: 'Sève vitale', cost: 0, cooldown: 3, needsTarget: false, icon: 'hausse',
    text: 'Gagne 2 énergie.',
    cast: (c) => {
      c.player.energy += 2;
      fx(c, { kind: 'buff', who: 'player', label: 'Sève vitale' });
    },
  },
  {
    id: 'cyclone', name: 'Cyclone', cost: 1, cooldown: 4, needsTarget: true, icon: 'etoile',
    text: 'La cible est Contrôlée 2 tours. Contre un boss : Interruption.',
    cast: (c, target) => {
      if (!target) return;
      if (stun(c, target, 2)) return;
      if (isInterruptible(target.intent) && !target.interrupted) {
        target.interrupted = true;
        fx(c, { kind: 'interrupt', who: target.uid });
        log(c, `${target.name} est interrompu !`);
      }
    },
  },
  {
    id: 'ecorce', name: 'Écorce', cost: 0, cooldown: 4, needsTarget: false, icon: 'bouclier',
    text: 'Jusqu\'à ton prochain tour, les dégâts que tu subis sont réduits de 30 %.',
    cast: (c) => {
      c.barkskin = true;
      fx(c, { kind: 'buff', who: 'player', label: 'Écorce' });
    },
  },
  {
    id: 'regeneration_sauvage', name: 'Régénération sauvage', cost: 0, cooldown: 4, needsTarget: false, icon: 'coeur',
    text: 'En forme d\'ours seulement : dépense toute ta rage, soigne 2 PV par point.',
    usable: (c) => c.form === 'ours' && (c.bearRage ?? 0) > 0,
    cast: (c) => {
      const n = c.bearRage ?? 0;
      c.bearRage = 0;
      healPlayer(c, n * 2);
    },
  },
  {
    id: 'instinct_survie_druide', name: 'Instinct de survie', cost: 0, cooldown: 5, needsTarget: false, icon: 'bouclier',
    text: 'Gagne 15 blocage.',
    cast: (c) => gainBlock(c, 15, false),
  },
  {
    id: 'renaissance', name: 'Renaissance', cost: 0, cooldown: 0, once: true, needsTarget: false, icon: 'coeur',
    text: 'Si tu tombes à 0 PV pendant ce combat, tu reviens à 40 % de tes PV max. Une fois par combat.',
    cast: (c) => {
      c.rebirth = true;
      fx(c, { kind: 'buff', who: 'player', label: 'Renaissance' });
    },
  },
  {
    id: 'benediction_sylvestre', name: 'Bénédiction sylvestre', cost: 1, cooldown: 4, needsTarget: false, icon: 'coeur',
    text: 'Soigne 8 PV et gagne 8 blocage.',
    cast: (c) => {
      healPlayer(c, 8);
      gainBlock(c, 8, false);
    },
  },
  // Sorts de loot
  {
    id: 'fureur_meute', name: 'Fureur de la meute', cost: 0, cooldown: 4, needsTarget: false, icon: 'hausse',
    text: 'En forme de félin seulement : +2 combo et 1 énergie.',
    usable: (c) => c.form === 'felin',
    cast: (c) => {
      gainCatCombo(c, 2);
      c.player.energy += 1;
    },
  },
  {
    id: 'rugissement_defi', name: 'Rugissement de défi', cost: 0, cooldown: 4, needsTarget: false, icon: 'bouclier',
    text: 'Tous les ennemis sont Démoralisés 1 tour. Gagne 6 blocage.',
    cast: (c) => {
      for (const e of livingEnemies(c)) e.buffs.demoralise = Math.max(e.buffs.demoralise, 1);
      gainBlock(c, 6, false);
    },
  },
  {
    id: 'faveur_lune', name: 'Faveur de la lune', cost: 0, cooldown: 3, needsTarget: true, icon: 'etoile',
    text: 'Inflige 7 dégâts.',
    cast: (c, target) => {
      if (target) playerAttack(c, target, 7);
    },
  },
];
for (const d of DRUIDE_SPELLS) SPELLS[d.id] = { ...d, classId: 'druide' };

/** Les sorts de barre du Chaman. Référence : docs/classes/CHAMAN.md (§6) */
const CHAMAN_SPELLS: Omit<SpellDef, 'classId'>[] = [
  {
    id: 'choc_tellurique', name: 'Choc tellurique', cost: 0, cooldown: 3, needsTarget: true, icon: 'epee', noSpell: true,
    text: 'Interruption. Inflige 4 dégâts.',
    cast: (c, target) => {
      if (!target) return;
      if (isInterruptible(target.intent) && !target.interrupted) {
        target.interrupted = true;
        fx(c, { kind: 'interrupt', who: target.uid });
        if (c.gear?.interruptDraw) drawCards(c, c.gear.interruptDraw);
        log(c, `${target.name} est interrompu !`);
      }
      playerAttack(c, target, 4);
    },
  },
  {
    id: 'maitrise_elementaire', name: 'Maîtrise élémentaire', cost: 0, cooldown: 5, needsTarget: false, icon: 'etoile',
    text: 'Ton prochain Sort coûte 0 et inflige double dégâts.',
    cast: (c) => {
      c.freeNextSpell = true;
      c.doubleNext = true;
      fx(c, { kind: 'buff', who: 'player', label: 'Maîtrise élémentaire' });
    },
  },
  {
    id: 'purge', name: 'Purge', cost: 0, cooldown: 4, needsTarget: true, icon: 'etoile', noSpell: true,
    text: 'Retire les bienfaits de la cible (Puissance, blocage).',
    cast: (c, target) => {
      if (!target) return;
      target.buffs.puissance = Math.min(0, target.buffs.puissance);
      target.block = 0;
      target.vengeance = false;
      target.giant = 0;
      target.haste = false;
      fx(c, { kind: 'buff', who: target.uid, label: 'Purgé' });
    },
  },
  {
    id: 'cri_ancetres', name: 'Cri des ancêtres', cost: 1, cooldown: 0, once: true, needsTarget: false, icon: 'hausse', noSpell: true,
    text: 'Ce tour-ci et le suivant : +1 énergie et 1 carte de plus. Une fois par combat.',
    cast: (c) => {
      c.player.energy += 2;
      drawCards(c, 1);
      c.ancestorsNext = true;
    },
  },
  {
    id: 'rappel_totemique', name: 'Rappel totémique', cost: 0, cooldown: 4, needsTarget: false, icon: 'hausse', noSpell: true,
    text: 'Retire tous tes totems. Pour chacun : +1 énergie, soigne 3 PV.',
    usable: (c) => Object.values(c.totems ?? {}).some((t) => t),
    cast: (c) => {
      const n = clearTotems(c);
      c.player.energy += n;
      healPlayer(c, 3 * n);
    },
  },
  {
    id: 'totem_mana', name: 'Totem de mana', cost: 0, cooldown: 6, needsTarget: false, icon: 'hausse', noSpell: true,
    text: 'Un petit totem de mana, à côté des autres : +1 énergie au début de tes 3 prochains tours.',
    cast: (c) => {
      c.manaTide = 3;
      fx(c, { kind: 'buff', who: 'player', label: 'Totem de mana' });
    },
  },
  {
    id: 'lien_spirituel', name: 'Lien spirituel', cost: 0, cooldown: 4, needsTarget: false, icon: 'coeur', noSpell: true,
    text: 'Soigne 10 PV.',
    cast: (c) => {
      healPlayer(c, 10);
    },
  },
  // Sorts de loot
  {
    id: 'totem_glebe', name: 'Totem de glèbe', cost: 0, cooldown: 5, needsTarget: false, icon: 'bouclier', noSpell: true,
    text: 'Pose un Totem de glèbe (Terre) : 6 blocage au début de tes 2 prochains tours.',
    cast: (c) => placeTotem(c, 'glebe', 6, undefined, 2),
  },
  {
    id: 'tempete_sable', name: 'Tempête de sable', cost: 0, cooldown: 4, needsTarget: false, icon: 'bouclier', noSpell: true,
    text: 'Tous les ennemis sont Démoralisés et Ralentis 1 tour.',
    cast: (c) => {
      for (const e of livingEnemies(c)) {
        e.buffs.demoralise = Math.max(e.buffs.demoralise, 1);
        e.buffs.ralenti = Math.max(e.buffs.ralenti, 1);
      }
    },
  },
  {
    id: 'fouet_lave', name: 'Fouet de lave', cost: 0, cooldown: 3, needsTarget: true, icon: 'flamme',
    text: 'Inflige 8 dégâts.',
    cast: (c, target) => {
      if (target) playerAttack(c, target, 8);
    },
  },
];
for (const d of CHAMAN_SPELLS) SPELLS[d.id] = { ...d, classId: 'chaman' };

/** La classe d'un sort de barre. */
export function spellClass(id: string): string {
  return SPELLS[id]?.classId ?? 'guerrier';
}

/** Le temps de recharge d'un sort, avec les talents (Pyromane, Hiver sans fin). */
export function spellCooldown(def: SpellDef, g: ItemEffects | undefined): number {
  let cd = def.cooldown;
  if (def.id === 'combustion' || def.id === 'souffle_ardent') cd -= g?.fireSpellCd ?? 0;
  if (def.id === 'carapace_de_glace') cd -= g?.iceBlockCd ?? 0;
  if (def.id === 'jugement') cd -= g?.judgeCd ?? 0; // Jugements rapides
  return Math.max(1, cd);
}

/** Les sorts qu'une classe peut trouver dans les tables de butin (les sorts de talent s'obtiennent par les talents). */
export function lootSpells(classId = 'guerrier'): string[] {
  const start = new Set(['charge', 'contresort', 'pacte_de_sang', 'egide_sacree', 'sprint', 'jugement', 'tir_arcanique', 'seve_vitale', 'choc_tellurique']);
  return Object.keys(SPELLS).filter((id) => spellClass(id) === classId && !start.has(id) && !TALENT_SPELLS.has(id));
}

export const WARRIOR_LOOT_SPELLS = lootSpells('guerrier');
