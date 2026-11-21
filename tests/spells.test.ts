import { describe, expect, it } from 'vitest';
import { createCombat, endTurn, playCard, useSpell } from '../src/engine/combat';
import type { Encounter } from '../src/engine/enemies';
import { afterCombatAction, chooseNode, learnSpell, newRun } from '../src/engine/run';
import { BAR_SLOTS, SPELLS, WARRIOR_LOOT_SPELLS, spellClass } from '../src/engine/spells';
import { ELITE_ENCOUNTERS } from '../src/engine/enemies';
import { LOOT_TABLES } from '../src/engine/items';
import { migrate } from '../src/engine/save';
import type { CardInstance, CombatState } from '../src/engine/types';

const deck = (ids: string[]): CardInstance[] => ids.map((id, i) => ({ uid: 1000 + i, id, upgraded: false }));
const FRAPPES = Array(10).fill('frappe');

function fight(enemies: string[], spells: string[], cards = FRAPPES): CombatState {
  const enc: Encounter = { kind: 'combat', name: 'Test', enemies };
  return createCombat(enc, deck(cards), 60, 80, 42, 1, {}, spells);
}
const idx = (c: CombatState, id: string) => c.spells.findIndex((s) => s.id === id);

describe('la barre de sorts du Guerrier', () => {
  it('9 sorts, et le combat reçoit la barre de la run', () => {
    expect(Object.keys(SPELLS).filter((id) => spellClass(id) === 'guerrier')).toHaveLength(9);
    const c = fight(['lieutenant'], ['charge', 'rempart']);
    expect(c.spells.map((s) => s.id)).toEqual(['charge', 'rempart']);
  });

  it('Coup de pommeau interrompt une incantation', () => {
    const c = fight(['seigneur'], ['coup_de_pommeau']);
    const e = c.enemies[0];
    expect(e.intent.cast).toBe('Boule de lave');
    expect(useSpell(c, 0, e.uid)).toBe(true);
    expect(e.interrupted).toBe(true);
    expect(c.spells[0].cooldown).toBe(4);
    const hp = c.player.hp;
    endTurn(c);
    expect(c.player.hp).toBe(hp);
  });

  it('Rempart divise par deux les dégâts subis jusqu\'au prochain tour', () => {
    const c = fight(['lieutenant'], ['rempart']);
    useSpell(c, 0);
    const hp = c.player.hp;
    endTurn(c); // Taille 7
    expect(c.player.hp).toBe(hp - 3);
    expect(c.player.rempart).toBe(false);
  });

  it('Témérité : +50 % aux Attaques ce tour-ci, +25 % de dégâts subis', () => {
    const c = fight(['lieutenant'], ['temerite']);
    useSpell(c, 0);
    const e = c.enemies[0];
    const hp = e.hp;
    playCard(c, 0);
    expect(hp - e.hp).toBe(9);
    const mine = c.player.hp;
    endTurn(c);
    expect(mine - c.player.hp).toBe(8); // 7 × 1,25
  });

  it('Rage du berserker protège des cartes Paniquées', () => {
    const c = fight(['croc'], ['rage_berserker']);
    c.player.debuffs!.panic = 2;
    useSpell(c, 0);
    expect(c.player.rage).toBe(5);
    c.player.block = 999;
    endTurn(c);
    expect(c.panicked).toHaveLength(0);
  });

  it('Cri de défi : les incantations deviennent de simples attaques', () => {
    const c = fight(['seigneur'], ['cri_de_defi']);
    useSpell(c, 0);
    expect(c.enemies[0].intent).toEqual({ kind: 'attack', dmg: 7 });
  });

  it('Dernier rempart : une seule fois par combat', () => {
    const c = fight(['lieutenant'], ['dernier_rempart']);
    useSpell(c, 0);
    expect(c.player.hp).toBe(60 + 12); // 15 % de 80
    c.player.hp = 30;
    for (let i = 0; i < 6; i++) { c.player.block = 999; endTurn(c); }
    expect(useSpell(c, 0)).toBe(false);
  });

  it('Vague de choc et Cri de commandement touchent tous les ennemis', () => {
    const c = fight(['lieutenant', 'lieutenant'], ['vague_de_choc', 'cri_commandement']);
    useSpell(c, idx(c, 'vague_de_choc'));
    expect(c.enemies.every((e) => e.hp === 24 && e.buffs.ralenti === 1)).toBe(true);
    useSpell(c, idx(c, 'cri_commandement'));
    expect(c.enemies.every((e) => e.buffs.demoralise === 2)).toBe(true);
    expect(c.player.robustesse).toBe(1);
  });
});

describe('trouver des sorts', () => {
  it('un boss secondaire peut laisser un sort de barre (1 chance sur 5)', () => {
    let spells = 0;
    let items = 0;
    for (let seed = 1; seed <= 60; seed++) {
      const run = newRun(seed);
      const node = run.map.nodes.find((n) => n.type === 'elite');
      if (!node) continue;
      run.position = run.map.nodes.find((n) => n.next.includes(node.id))!.id;
      chooseNode(run, node.id);
      run.combat!.phase = 'victory';
      afterCombatAction(run);
      if (run.pendingSpell) {
        spells++;
        expect(WARRIOR_LOOT_SPELLS).toContain(run.pendingSpell);
      } else {
        items++;
        expect(LOOT_TABLES[ELITE_ENCOUNTERS[node.elite!].loot!]).toContain(run.pendingItem);
      }
    }
    expect(spells).toBeGreaterThan(3);
    expect(items).toBeGreaterThan(spells);
  });

  it('3 emplacements : on ajoute, puis on remplace', () => {
    const run = newRun(1);
    run.pendingSpell = 'rempart';
    expect(learnSpell(run)).toBe(true);
    run.pendingSpell = 'temerite';
    learnSpell(run);
    expect(run.spells).toHaveLength(BAR_SLOTS);
    run.pendingSpell = 'cri_de_defi';
    expect(learnSpell(run)).toBe(false);
    expect(learnSpell(run, 0)).toBe(true);
    expect(run.spells).toEqual(['cri_de_defi', 'rempart', 'temerite']);
  });

  it('une sauvegarde v8 reçoit la barre de départ', () => {
    const old = { ...newRun(5), version: 8 } as Record<string, unknown>;
    delete old.spells;
    const run = migrate(old)!;
    expect(run.version).toBe(23);
    expect(run.spells).toEqual(['charge']);
  });
});
