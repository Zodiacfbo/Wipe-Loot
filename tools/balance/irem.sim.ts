// Les boss secondaires d'Irem (acte 3, lot 2) : le bot les affronte avec la run qu'il a en arrivant devant Vhaeryx.
// Tant que l'acte 3 n'est pas jouable, c'est le meilleur aperçu d'un joueur « fin d'acte 2 ».
// RUNS=30 npm run balance -- irem
import { it } from 'vitest';
import { ELITE_ENCOUNTERS_3 } from '../../src/engine/enemies_acte3';
import { afterCombatAction, startEncounter } from '../../src/engine/run';
import { emptyAlloc, talentIds, type TalentAlloc } from '../../src/engine/talents';
import type { RunState } from '../../src/engine/types';
import { playTurn, simulateRun } from './bot';

const alloc = (a: Partial<TalentAlloc>, cls: string) => talentIds({ ...emptyAlloc(cls), ...a } as TalentAlloc, cls);

const PROFILES: { name: string; cls: string; talents: string[] }[] = [
  { name: 'Guerrier', cls: 'guerrier', talents: alloc({ protection: ['A', 'A', 'A', 'A', 'A'], fureur: ['A', 'B', 'A', 'B', 'A'] }, 'guerrier') },
  { name: 'Mage', cls: 'mage', talents: alloc({ givre: ['A', 'A', 'A', 'A', 'A'], feu: ['A', 'B', 'A', 'A', 'A'] }, 'mage') },
  { name: 'Démoniste', cls: 'demoniste', talents: alloc({ affliction: ['A', 'A', 'B', 'A', 'A'], destruction: ['A', 'B', 'A', 'A', 'A'] }, 'demoniste') },
  { name: 'Prêtre', cls: 'pretre', talents: alloc({ discipline: ['A', 'A', 'A', 'A', 'A'], sacre: ['A', 'B', 'A', 'B', 'A'] }, 'pretre') },
  { name: 'Voleur', cls: 'voleur', talents: alloc({ assassinat: ['A', 'A', 'A', 'A', 'A'], combat: ['A', 'A', 'A', 'B', 'A'] }, 'voleur') },
  { name: 'Paladin', cls: 'paladin', talents: alloc({ vindicte: ['A', 'A', 'A', 'A', 'A'], sacre_pal: ['A', 'B', 'A', 'A', 'A'] }, 'paladin') },
];

/** Joue un combat jusqu'au bout. Renvoie la victoire, le tour atteint et les PV perdus. */
function fight(base: RunState, index: number): { won: boolean; turn: number; lost: number } {
  const run: RunState = JSON.parse(JSON.stringify(base));
  run.position = null;
  run.hp = run.maxHp;
  startEncounter(run, ELITE_ENCOUNTERS_3[index]);
  let turn = 0;
  for (let step = 0; step < 400 && run.screen === 'combat'; step++) {
    turn = run.combat!.turn;
    playTurn(run);
    afterCombatAction(run);
  }
  return { won: run.screen !== 'combat' && run.screen !== 'wipe' && run.screen !== 'gameover', turn, lost: run.maxHp - run.hp };
}

it('boss secondaires d\'Irem', () => {
  const runs = Number(process.env.RUNS ?? 20);
  const header = ['Classe', ...ELITE_ENCOUNTERS_3.map((e) => e.loot!)];
  console.log(header.join(' | '));
  for (const p of PROFILES) {
    const stats = ELITE_ENCOUNTERS_3.map(() => ({ won: 0, n: 0, turns: 0, lost: 0 }));
    for (let seed = 1; seed <= runs; seed++) {
      let snap: RunState | null = null;
      simulateRun(seed * 104729, p.talents, 0, p.cls, (run) => {
        if (run.act === 2 && !snap) snap = JSON.parse(JSON.stringify(run));
      });
      if (!snap) continue;
      ELITE_ENCOUNTERS_3.forEach((_, i) => {
        const r = fight(snap!, i);
        const s = stats[i];
        s.n++;
        if (r.won) {
          s.won++;
          s.turns += r.turn;
          s.lost += r.lost;
        }
      });
    }
    console.log([p.name, ...stats.map((s) => `${Math.round((100 * s.won) / Math.max(1, s.n))} % (t${(s.turns / Math.max(1, s.won)).toFixed(1)}, −${Math.round(s.lost / Math.max(1, s.won))})`)].join(' | '));
  }
}, 3600000);
