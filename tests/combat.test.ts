import { describe, expect, it } from 'vitest';
import { changePosture, createCombat, endTurn, playCard, useSpell } from '../src/engine/combat';
import type { Encounter } from '../src/engine/enemies';
import { afterCombatAction, chooseReward, newRun, retryAfterWipe } from '../src/engine/run';
import type { CardInstance, CombatState } from '../src/engine/types';

function deckOf(ids: string[]): CardInstance[] {
  return ids.map((id, i) => ({ uid: 1000 + i, id, upgraded: false }));
}

function combat(enemies: string[], cards: string[], enrageTurn?: number): CombatState {
  const enc: Encounter = { kind: 'combat', name: 'Test', enemies, enrageTurn };
  return createCombat(enc, deckOf(cards), 80, 80, 42, 1);
}

function handIndex(c: CombatState, id: string): number {
  return c.hand.findIndex((card) => card.id === id);
}

describe('rage et postures', () => {
  it('une Attaque qui touche donne 1 rage, 2 en Berserker', () => {
    const c = combat(['lieutenant'], ['frappe', 'frappe', 'frappe', 'frappe', 'frappe']);
    playCard(c, handIndex(c, 'frappe'));
    expect(c.player.rage).toBe(1);
    changePosture(c, 'berserker');
    playCard(c, handIndex(c, 'frappe'));
    expect(c.player.rage).toBe(3);
  });

  it('changer de posture plafonne la rage à 3, une seule fois par tour', () => {
    const c = combat(['lieutenant'], ['parade', 'parade', 'parade', 'parade', 'parade']);
    c.player.rage = 8;
    expect(changePosture(c, 'defensive')).toBe(true);
    expect(c.player.rage).toBe(3);
    expect(changePosture(c, 'combat')).toBe(false);
  });

  it('Charge donne 3 rage et passe en recharge 3 tours', () => {
    const c = combat(['lieutenant'], ['parade', 'parade', 'parade', 'parade', 'parade']);
    expect(useSpell(c, 0)).toBe(true);
    expect(c.player.rage).toBe(3);
    expect(c.spells[0].cooldown).toBe(3);
    expect(useSpell(c, 0)).toBe(false);
  });

  it('Frappe héroïque coûte 3 rage et profite du bonus de la posture de Combat', () => {
    const c = combat(['lieutenant'], ['frappe_heroique', 'parade', 'parade', 'parade', 'parade']);
    const i = handIndex(c, 'frappe_heroique');
    expect(playCard(c, i)).toBe(false); // pas assez de rage
    c.player.rage = 3;
    const hp = c.enemies[0].hp;
    expect(playCard(c, handIndex(c, 'frappe_heroique'))).toBe(true);
    expect(hp - c.enemies[0].hp).toBe(17);
    expect(c.player.rage).toBe(1); // 3 - 3 + 1 (l'attaque a touché)
  });

  it('Exécution dépense toute la rage', () => {
    const c = combat(['lieutenant'], ['execution', 'parade', 'parade', 'parade', 'parade']);
    c.player.rage = 5;
    const hp = c.enemies[0].hp;
    playCard(c, handIndex(c, 'execution'));
    expect(hp - c.enemies[0].hp).toBe(5 * 4 + 3); // 4 par point + bonus de la posture de Combat
  });
});

describe('incantations', () => {
  it('Coup de bouclier interrompt une incantation : l\'ennemi ne fait rien ce tour-là', () => {
    const c = combat(['seigneur'], ['coup_de_bouclier', 'parade', 'parade', 'parade', 'parade']);
    expect(c.enemies[0].intent.cast).toBe('Boule de lave');
    playCard(c, handIndex(c, 'coup_de_bouclier'));
    expect(c.enemies[0].interrupted).toBe(true);
    endTurn(c);
    expect(c.player.hp).toBe(80);
    expect(c.enemies[0].intent.cast).toBeUndefined();
  });

  it('sans interruption, la Boule de lave frappe', () => {
    const c = combat(['seigneur'], ['parade', 'parade', 'parade', 'parade', 'parade']);
    endTurn(c);
    expect(c.player.hp).toBe(80 - 18);
  });
});

describe('statuts et effets', () => {
  it('une Zone de feu gardée en main inflige 6 dégâts à la fin du tour', () => {
    const c = combat(['lieutenant'], ['parade', 'parade', 'parade', 'parade', 'parade']);
    c.hand.push({ uid: 999, id: 'zone_de_feu', upgraded: false });
    c.player.block = 0;
    endTurn(c);
    // 6 (zone de feu) + 7 (attaque du lieutenant)
    expect(c.player.hp).toBe(80 - 6 - 7);
  });

  it('le Saignement blesse l\'ennemi au début de son tour', () => {
    const c = combat(['lieutenant'], ['pourfendre', 'parade', 'parade', 'parade', 'parade']);
    playCard(c, handIndex(c, 'pourfendre'));
    const hp = c.enemies[0].hp;
    endTurn(c);
    expect(hp - c.enemies[0].hp).toBe(5);
  });

  it('l\'Étincelle vivante explose à sa mort', () => {
    const c = combat(['etincelle', 'lieutenant'], ['frappe', 'frappe', 'frappe', 'frappe', 'frappe']);
    playCard(c, handIndex(c, 'frappe'), c.enemies[0].uid);
    playCard(c, handIndex(c, 'frappe'), c.enemies[0].uid);
    expect(c.enemies[0].dead).toBe(true);
    expect(c.player.hp).toBe(76);
  });

  it('un boss secondaire en enrage inflige double dégâts', () => {
    const c = combat(['brannoc'], ['parade', 'parade', 'parade', 'parade', 'parade'], 1);
    c.enemies[0].intent = { kind: 'attack', dmg: 9 };
    endTurn(c);
    expect(c.player.hp).toBe(80 - 18);
  });
});

describe('run', () => {
  it('est déterministe pour une même graine', () => {
    const a = newRun(1234);
    const b = newRun(1234);
    expect(a.combat?.hand.map((c) => c.id)).toEqual(b.combat?.hand.map((c) => c.id));
    expect(a.combat?.enemies.map((e) => e.hp)).toEqual(b.combat?.enemies.map((e) => e.hp));
  });

  it('une victoire mène aux récompenses, puis au combat suivant', () => {
    const run = newRun(7);
    for (const e of run.combat!.enemies) e.dead = true;
    run.combat!.phase = 'victory';
    afterCombatAction(run);
    expect(run.screen).toBe('reward');
    expect(run.rewardChoices.length).toBe(3);
    const size = run.deck.length;
    chooseReward(run, run.rewardChoices[0]);
    expect(run.deck.length).toBe(size + 1);
    expect(run.step).toBe(1);
    expect(run.screen).toBe('combat');
  });

  it('un wipe permet de retenter le combat avec au moins 50 % des PV', () => {
    const run = newRun(7);
    run.combat!.player.hp = 0;
    run.combat!.phase = 'defeat';
    afterCombatAction(run);
    expect(run.screen).toBe('wipe');
    retryAfterWipe(run);
    expect(run.wipesLeft).toBe(2);
    expect(run.screen).toBe('combat');
    expect(run.combat!.player.hp).toBe(80);
  });
});
