import { describe, expect, it } from 'vitest';
import { placeHit } from '../src/cardtext';
import { CARDS } from '../src/engine/cards';

const show = (text: string, hit: number | null) => {
  const p = placeHit(text, hit);
  return p ? `${p.before}[${hit}]${p.after}` : text;
};

describe('le chiffre de dégâts corrigé sur la carte', () => {
  it('une base et une part par combo : le total, puis la formule entre parenthèses', () => {
    expect(show('Finisher : inflige 4 dégâts + 6 par combo.', 22)).toBe('Finisher : inflige [22] dégâts (4 + 6 par combo).');
  });

  it('tout par combo : le total n\'est jamais présenté comme un montant « par combo »', () => {
    expect(show('Finisher : inflige 6 dégâts par combo. Double sous 30 % de PV.', 18)).toBe('Finisher : inflige [18] dégâts (6 par combo). Double sous 30 % de PV.');
    expect(show('Finisher : inflige 6 dégâts par combo, 3 par combo aux autres.', 18)).toBe('Finisher : inflige [18] dégâts (6 par combo), 3 par combo aux autres.');
    expect(show('Dépense toute ta Foi : 4 dégâts par point.', 20)).toBe('Dépense toute ta Foi : [20] dégâts (4 par point).');
  });

  it('un chiffre simple est remplacé seulement s\'il change', () => {
    expect(show('Inflige 6 dégâts. +1 combo.', 9)).toBe('Inflige [9] dégâts. +1 combo.');
    expect(placeHit('Inflige 6 dégâts. +1 combo.', 6)).toBeNull();
  });

  it('sans total connu, ou avec une variante déjà entre parenthèses, le texte reste tel quel', () => {
    expect(placeHit('Finisher : inflige 4 dégâts + 6 par combo.', null)).toBeNull();
    expect(placeHit('Toute ta rage : 4 dégâts par point (8 sous 30 % PV).', 20)).toBeNull();
  });

  it('les finishers du Voleur ne disent plus « par point de combo » (texte court pour le téléphone)', () => {
    const rogue = Object.values(CARDS).filter((d) => d.classId === 'voleur' && d.finisher);
    for (const d of rogue) for (const up of [false, true]) expect(d.text(up, {}), d.id).not.toContain('par point de combo');
  });
});
