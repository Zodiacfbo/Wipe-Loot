import { afterEach, describe, expect, it } from 'vitest';
import { CARDS } from '../src/engine/cards';
import { CLASSES } from '../src/engine/classes';
import { emptyProfile } from '../src/engine/save';
import {
  CLASS_STEPS, COMBAT_END, COMBAT_STEPS, HALL_STEPS,
  closeMini, combatTutoDone, howToPlayHtml, miniHtml, startCombatTuto, startHallTuto, tutoActive, tutoFinish, tutoHtml, tutoMarkup, tutoMove, tutoStop,
} from '../src/tuto';

afterEach(() => tutoStop());

describe('le tutoriel', () => {
  it('la visite du hall a 6 bulles, la partie commune du combat 10', () => {
    expect(HALL_STEPS).toHaveLength(6);
    expect(COMBAT_STEPS).toHaveLength(10);
    for (const s of [...HALL_STEPS, ...COMBAT_STEPS, COMBAT_END]) expect(s.cible?.length).toBeGreaterThan(0);
  });

  it('chaque classe jouable a 3 ou 4 bulles, chacune avec une cible et une illustration de sa classe', () => {
    for (const c of CLASSES.filter((k) => k.playable)) {
      const steps = CLASS_STEPS[c.id];
      expect(steps, c.id).toBeDefined();
      expect(steps.length).toBeGreaterThanOrEqual(3);
      expect(steps.length).toBeLessThanOrEqual(4);
      for (const s of steps) {
        expect(s.cible?.length, s.texte).toBeGreaterThan(0);
        expect(CARDS[s.icone!], `${c.id} : ${s.icone}`).toBeDefined();
        expect(CARDS[s.icone!].classId ?? 'guerrier').toBe(c.id);
      }
    }
  });

  it('**mot** passe en or', () => {
    expect(tutoMarkup('Ta **rage** et ta **posture**')).toBe('Ta <b>rage</b> et ta <b>posture</b>');
  });

  it('premier tuto du combat : la partie commune, la classe, puis « Compris » ; le « ? » arrête de briller', () => {
    const p = emptyProfile();
    expect(combatTutoDone(p, 'guerrier')).toBe(false);
    startCombatTuto(p, 'guerrier');
    const t = tutoActive()!;
    expect(t.partial).toBe(false);
    expect(t.steps).toHaveLength(COMBAT_STEPS.length + CLASS_STEPS.guerrier.length + 1);
    expect(tutoHtml()).toContain('Le combat · 1 / 15');
    expect(tutoHtml()).toContain('Passer');
    for (let i = 0; i < t.steps.length - 1; i++) expect(tutoMove(1)).toBe(false);
    expect(tutoHtml()).toContain('Compris');
    expect(tutoMove(1)).toBe(true);
    tutoFinish(p, true);
    expect(tutoActive()).toBeNull();
    expect(combatTutoDone(p, 'guerrier')).toBe(true);
  });

  it('« Passer » ne vaut pas « Compris » : le « ? » continue de briller', () => {
    const p = emptyProfile();
    startCombatTuto(p, 'mage');
    tutoFinish(p, false);
    expect(combatTutoDone(p, 'mage')).toBe(false);
  });

  it('une nouvelle classe : seulement sa partie, avec « Tout revoir »', () => {
    const p = emptyProfile();
    p.tuto = { classes: ['guerrier'] };
    startCombatTuto(p, 'demoniste');
    expect(tutoActive()!.partial).toBe(true);
    expect(tutoActive()!.steps).toHaveLength(CLASS_STEPS.demoniste.length + 1);
    expect(tutoHtml()).toContain('Tout revoir');
    startCombatTuto(p, 'demoniste', true);
    expect(tutoActive()!.steps).toHaveLength(COMBAT_STEPS.length + CLASS_STEPS.demoniste.length + 1);
    // Une classe déjà comprise : le « ? » montre tout.
    startCombatTuto(p, 'guerrier');
    expect(tutoActive()!.partial).toBe(false);
  });

  it('la visite du hall, finie ou passée, ne se relance plus toute seule', () => {
    const p = emptyProfile();
    startHallTuto();
    expect(tutoHtml()).toContain('Visite du hall · 1 / 6');
    expect(tutoMove(-1)).toBe(false);
    expect(tutoActive()!.index).toBe(0);
    tutoFinish(p, false);
    expect(p.tuto?.hall).toBe(true);
  });

  it('la mini-bulle : une fois par classe, et plus après « Compris »', () => {
    const p = emptyProfile();
    expect(miniHtml(p, 'guerrier')).toContain('Besoin d\'aide');
    expect(closeMini(p, 'guerrier')).toBe(true);
    expect(miniHtml(p, 'guerrier')).toBe('');
    expect(closeMini(p, 'guerrier')).toBe(false);
    p.tuto!.classes = ['guerrier'];
    expect(miniHtml(p, 'mage')).toContain('Nouvelle classe');
    p.tuto!.classes.push('mage');
    expect(miniHtml(p, 'mage')).toBe('');
  });

  it('la fiche de classe reprend les textes des bulles de la classe', () => {
    const html = howToPlayHtml('guerrier', (f) => f);
    expect(html).toContain('Comment ça se joue');
    expect(html).toContain('carte_frappe_heroique.png');
    for (const s of CLASS_STEPS.guerrier) expect(html).toContain(tutoMarkup(s.texte));
  });
});
