// Le banc d'équilibrage : fait jouer le bot sur des centaines de runs, à différents niveaux de talents,
// et affiche le taux de victoire, l'étage atteint, et le taux de wipe par combat.
// Lancer : npm run balance  (variables : RUNS=200)
import { it } from 'vitest';
import { emptyAlloc, talentIds, type TalentAlloc } from '../../src/engine/talents';
import { simulateRun, type FightLog } from './bot';

const RUNS = Number(process.env.RUNS ?? 150);

function alloc(a: Partial<TalentAlloc>): string[] {
  return talentIds({ ...emptyAlloc(), ...a });
}

const ONLY = process.env.PROFIL;
const PROFILES_ALL: { name: string; talents: string[] }[] = [
  { name: 'Niveau 1 (aucun talent)', talents: [] },
  { name: 'Niveau 5 (Protection 3, Fureur 2)', talents: alloc({ protection: ['A', 'A', 'A'], fureur: ['A', 'B'] }) },
  { name: 'Niveau 10 (Protection 5, Fureur 5)', talents: alloc({ protection: ['A', 'A', 'A', 'A', 'A'], fureur: ['A', 'B', 'A', 'B', 'A'] }) },
  { name: 'Niveau 10 (Armes 5, Fureur 5)', talents: alloc({ armes: ['A', 'B', 'B', 'B', 'A'], fureur: ['A', 'B', 'A', 'B', 'A'] }) },
];

const PROFILES = ONLY ? PROFILES_ALL.filter((p) => p.name.startsWith(ONLY)) : PROFILES_ALL;

const pct = (n: number, d: number) => (d ? `${Math.round((100 * n) / d)} %` : '–');

it('équilibrage', () => {
  const lines: string[] = [];
  for (const prof of PROFILES) {
    let wins = 0;
    let floors = 0;
    const fights = new Map<string, FightLog[]>();
    for (let seed = 1; seed <= RUNS; seed++) {
      const r = simulateRun(seed * 104729, prof.talents);
      if (r.victory) wins++;
      floors += r.floor;
      for (const f of r.fights) {
        const key = f.kind === 'combat' && f.floor <= 4 ? 'Combats étages 1-4' : f.kind === 'combat' ? `(5-9) ${f.name}` : f.name;
        fights.set(key, [...(fights.get(key) ?? []), f]);
      }
    }
    lines.push(`\n=== ${prof.name} : ${RUNS} runs ===`);
    lines.push(`Victoire : ${pct(wins, RUNS)} · étage moyen atteint : ${(floors / RUNS).toFixed(1)}`);
    lines.push('Combat                                    | joués | wipe au 1er essai | PV perdus (moy.)');
    const rows = [...fights.entries()].sort((a, b) => b[1].length - a[1].length);
    for (const [name, list] of rows) {
      const wiped = list.filter((f) => f.wipes > 0).length;
      const won = list.filter((f) => f.won);
      const hp = won.length ? won.reduce((a, f) => a + f.hpLost, 0) / won.length : 0;
      lines.push(`${name.padEnd(42)}| ${String(list.length).padStart(5)} | ${pct(wiped, list.length).padStart(17)} | ${hp.toFixed(0).padStart(5)}`);
    }
  }
  console.log(lines.join('\n'));
}, 600000);
