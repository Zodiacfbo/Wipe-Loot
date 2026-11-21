// Les combats contre Yzhar : à quel tour et dans quelle phase le bot meurt, et ce qu'il reste à Yzhar.
// On copie la run à l'entrée du boss de l'acte 3 (personnage de niveau 10), puis on rejoue le combat seul.
// Lancer : RUNS=40 npx vitest run --config tools/balance/vitest.config.ts --root . tools/balance/yzhar.sim.ts
import { it } from 'vitest';
import { afterCombatAction, startEncounter } from '../../src/engine/run';
import { BOSS_ENCOUNTER_3 } from '../../src/engine/enemies_acte3';
import { emptyAlloc, talentIds, type TalentAlloc } from '../../src/engine/talents';
import type { RunState } from '../../src/engine/types';
import { playTurn, simulateRun } from './bot';

const alloc = (a: Partial<TalentAlloc>, cls: string) => talentIds({ ...emptyAlloc(cls), ...a } as TalentAlloc, cls);
const PROFILES: [string, string[], string][] = [
  ['Guerrier', alloc({ protection: ['A', 'A', 'A', 'A', 'A'], fureur: ['A', 'B', 'A', 'B', 'A'] }, 'guerrier'), 'guerrier'],
  ['Mage', alloc({ arcane: ['A', 'A', 'A', 'A', 'A'], feu: ['A', 'B', 'A', 'A', 'A'] }, 'mage'), 'mage'],
  ['Voleur', alloc({ assassinat: ['A', 'A', 'A', 'A', 'A'], combat: ['A', 'A', 'A', 'B', 'A'] }, 'voleur'), 'voleur'],
  ['Paladin', alloc({ vindicte: ['A', 'A', 'A', 'A', 'A'], sacre_pal: ['A', 'B', 'A', 'A', 'A'] }, 'paladin'), 'paladin'],
  ['Démoniste', alloc({ demonologie: ['A', 'B', 'B', 'A', 'A'], destruction: ['A', 'B', 'A', 'A', 'A'] }, 'demoniste'), 'demoniste'],
  ['Affliction', alloc({ affliction: ['A', 'A', 'B', 'A', 'A'], destruction: ['A', 'B', 'A', 'A', 'A'] }, 'demoniste'), 'demoniste'],
  ['Prêtre', alloc({ discipline: ['A', 'A', 'A', 'A', 'A'], sacre: ['A', 'B', 'A', 'B', 'A'] }, 'pretre'), 'pretre'],
];
const ONLY = process.env.CLASSES?.split(',');

it('Yzhar', () => {
  for (const [name, talents, cls] of PROFILES.filter((p) => !ONLY || ONLY.includes(p[0]))) {
    const runs: RunState[] = [];
    for (let seed = 1; seed <= Number(process.env.RUNS ?? 30) && runs.length < 15; seed++) {
      simulateRun(seed * 104729, talents, 0, cls, (r) => { if (r.act === 3) runs.push(JSON.parse(JSON.stringify(r))); });
    }
    let wins = 0;
    const deaths: string[] = [];
    for (const r of runs) {
      r.hp = r.maxHp;
      startEncounter(r, BOSS_ENCOUNTER_3);
      for (let t = 0; t < 40 && r.screen === 'combat'; t++) {
        playTurn(r);
        afterCombatAction(r);
      }
      const c = r.combat;
      if (!c || c.phase === 'victory') {
        wins++;
        continue;
      }
      const y = c.enemies.find((e) => e.defId === 'yzhar')!;
      deaths.push(`t${c.turn} ph${y.phase ?? 1} ${Math.max(0, y.hp)}/${y.maxHp} adds${c.enemies.filter((e) => !e.dead && e !== y).length} folie${c.folie ?? 0}${c.swallowed ? " avalé" : ""} pvmax${c.player.maxHp}`);
    }
    console.log(`${name} : ${wins}/${runs.length} gagnés (PV pleins). Morts : ${deaths.join(' · ')}`);
  }
}, 1800000);
