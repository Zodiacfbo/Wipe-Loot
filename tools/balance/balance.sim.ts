// Le banc d'équilibrage : fait jouer le bot sur des centaines de runs, à différents niveaux de talents,
// et affiche le taux de victoire, l'étage atteint, et le taux de wipe par combat.
// Lancer : npm run balance  (variables : RUNS=200)
import { it } from 'vitest';
import { emptyAlloc, talentIds, type TalentAlloc } from '../../src/engine/talents';
import { simulateRun, type FightLog } from './bot';

const RUNS = Number(process.env.RUNS ?? 150);

function alloc(a: Partial<TalentAlloc>, cls = 'guerrier'): string[] {
  return talentIds({ ...emptyAlloc(cls), ...a } as TalentAlloc, cls);
}
const mage = (a: Partial<TalentAlloc>) => alloc(a, 'mage');

const ONLY = process.env.PROFIL;
const PROFILES_ALL: { name: string; talents: string[]; cls?: string }[] = [
  { name: 'Niveau 1 (aucun talent)', talents: [] },
  { name: 'Niveau 5 (Protection 3, Fureur 2)', talents: alloc({ protection: ['A', 'A', 'A'], fureur: ['A', 'B'] }) },
  { name: 'Niveau 10 (Protection 7, Fureur 3)', talents: alloc({ protection: ['A', 'A', 'A', 'A', 'A'], fureur: ['A', 'B', 'A'] }) },
  { name: 'Niveau 10 (Armes 7, Fureur 3)', talents: alloc({ armes: ['A', 'B', 'B', 'B', 'A'], fureur: ['A', 'B', 'A'] }) },
  { name: 'Mage niveau 1 (aucun talent)', talents: [], cls: 'mage' },
  { name: 'Mage niveau 5 (Givre 3, Feu 2)', talents: mage({ givre: ['A', 'A', 'A'], feu: ['A', 'B'] }), cls: 'mage' },
  { name: 'Mage niveau 10 (Givre 7, Feu 3)', talents: mage({ givre: ['A', 'A', 'A', 'A', 'A'], feu: ['A', 'B', 'A'] }), cls: 'mage' },
  { name: 'Démoniste niveau 1 (aucun talent)', talents: [], cls: 'demoniste' },
  { name: 'Démoniste niveau 5 (Affliction 3, Destruction 2)', talents: alloc({ affliction: ['A', 'A', 'B'], destruction: ['A', 'B'] }, 'demoniste'), cls: 'demoniste' },
  { name: 'Démoniste niveau 10 (Affliction 7, Destruction 3)', talents: alloc({ affliction: ['A', 'A', 'B', 'A', 'A'], destruction: ['A', 'B', 'A'] }, 'demoniste'), cls: 'demoniste' },
  { name: 'Démoniste niveau 10 (Démonologie 7, Destruction 3)', talents: alloc({ demonologie: ['A', 'B', 'B', 'A', 'A'], destruction: ['A', 'B', 'A'] }, 'demoniste'), cls: 'demoniste' },
  { name: 'Voleur niveau 1 (aucun talent)', talents: [], cls: 'voleur' },
  { name: 'Voleur niveau 5 (Assassinat 3, Combat 2)', talents: alloc({ assassinat: ['A', 'A', 'A'], combat: ['A', 'A'] }, 'voleur'), cls: 'voleur' },
  { name: 'Voleur niveau 10 (Assassinat 7, Combat 3)', talents: alloc({ assassinat: ['A', 'A', 'A', 'A', 'A'], combat: ['A', 'A', 'A'] }, 'voleur'), cls: 'voleur' },
  { name: 'Voleur niveau 10 (Finesse 7, Combat 3)', talents: alloc({ finesse: ['A', 'A', 'A', 'A', 'A'], combat: ['A', 'A', 'A'] }, 'voleur'), cls: 'voleur' },
  { name: 'Prêtre niveau 1 (aucun talent)', talents: [], cls: 'pretre' },
  { name: 'Prêtre niveau 5 (Discipline 3, Sacré 2)', talents: alloc({ discipline: ['A', 'A', 'A'], sacre: ['A', 'B'] }, 'pretre'), cls: 'pretre' },
  { name: 'Prêtre niveau 10 (Discipline 7, Sacré 3)', talents: alloc({ discipline: ['A', 'A', 'A', 'A', 'A'], sacre: ['A', 'B', 'A'] }, 'pretre'), cls: 'pretre' },
  { name: 'Prêtre niveau 10 (Ombre 7, Sacré 3)', talents: alloc({ ombre: ['A', 'A', 'B', 'A', 'A'], sacre: ['A', 'B', 'A'] }, 'pretre'), cls: 'pretre' },
  { name: 'Paladin niveau 1 (aucun talent)', talents: [], cls: 'paladin' },
  { name: 'Paladin niveau 5 (Vindicte 3, Sacré 2)', talents: alloc({ vindicte: ['A', 'A', 'A'], sacre_pal: ['A', 'B'] }, 'paladin'), cls: 'paladin' },
  { name: 'Paladin niveau 10 (Vindicte 7, Sacré 3)', talents: alloc({ vindicte: ['A', 'A', 'A', 'A', 'A'], sacre_pal: ['A', 'B', 'A'] }, 'paladin'), cls: 'paladin' },
  { name: 'Paladin niveau 10 (Protection 7, Sacré 3)', talents: alloc({ protection_pal: ['A', 'A', 'A', 'B', 'A'], sacre_pal: ['A', 'B', 'A'] }, 'paladin'), cls: 'paladin' },
  { name: 'Chasseur niveau 1 (aucun talent)', talents: [], cls: 'chasseur' },
  { name: 'Chasseur niveau 5 (Bêtes 3, Survie 2)', talents: alloc({ betes: ['A', 'B', 'A'], survie: ['A', 'B'] }, 'chasseur'), cls: 'chasseur' },
  { name: 'Chasseur niveau 10 (Bêtes 7, Survie 3)', talents: alloc({ betes: ['A', 'B', 'A', 'A', 'A'], survie: ['A', 'B', 'A'] }, 'chasseur'), cls: 'chasseur' },
  { name: 'Chasseur niveau 10 (Précision 7, Bêtes 3)', talents: alloc({ precision: ['A', 'B', 'A', 'A', 'A'], betes: ['A', 'B', 'A'] }, 'chasseur'), cls: 'chasseur' },
  { name: 'Chasseur niveau 10 (Survie 7, Bêtes 3)', talents: alloc({ survie: ['A', 'B', 'A', 'A', 'A'], betes: ['A', 'B', 'A'] }, 'chasseur'), cls: 'chasseur' },
  { name: 'Mage niveau 10 (Arcane 7, Feu 3)', talents: mage({ arcane: ['A', 'A', 'A', 'A', 'A'], feu: ['A', 'B', 'A'] }), cls: 'mage' },
];

const PROFILES = ONLY ? PROFILES_ALL.filter((p) => p.name.startsWith(ONLY)) : PROFILES_ALL;

const pct = (n: number, d: number) => (d ? `${Math.round((100 * n) / d)} %` : '–');

it('équilibrage', () => {
  const lines: string[] = [];
  for (const prof of PROFILES) {
    let wins = 0;
    let act2 = 0;
    let act3 = 0;
    let floors = 0;
    const fights = new Map<string, FightLog[]>();
    for (let seed = 1; seed <= RUNS; seed++) {
      const r = simulateRun(seed * 104729, prof.talents, 0, prof.cls);
      if (r.victory) wins++;
      if (r.floor > 10) act2++;
      if (r.floor > 20) act3++;
      floors += r.floor;
      for (const f of r.fights) {
        const pre = (f.act ?? 1) > 1 ? `A${f.act} ` : '';
        const key = pre + (f.kind === 'combat' && f.floor <= 4 ? 'Combats étages 1-4' : f.kind === 'combat' ? `(5-9) ${f.name}` : f.name);
        fights.set(key, [...(fights.get(key) ?? []), f]);
      }
    }
    lines.push(`\n=== ${prof.name} : ${RUNS} runs ===`);
    lines.push(`Victoire : ${pct(wins, RUNS)} · Vulkhar vaincu : ${pct(act2, RUNS)} · Vhaeryx vaincu : ${pct(act3, RUNS)} · étage moyen atteint : ${(floors / RUNS).toFixed(1)}`);
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
