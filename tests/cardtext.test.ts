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

describe('les textes des cartes restent lisibles sur téléphone', async () => {
  const { splitRibbon, CARD_TEXT_MAX } = await import('../src/cardtext');
  it(`aucun texte de carte ne dépasse ${CARD_TEXT_MAX} caractères (sans le mot du bandeau)`, () => {
    const trop: string[] = [];
    for (const d of Object.values(CARDS)) {
      for (const up of [false, true]) {
        const t = splitRibbon(d.text(up, {})).text;
        if (t.length > CARD_TEXT_MAX) trop.push(`${d.id}${up ? '+' : ''} (${t.length}) : ${t}`);
      }
    }
    expect(trop).toEqual([]);
  });

  it('le mot du bandeau quitte le texte', () => {
    expect(splitRibbon('Coup final : inflige 6 dégâts par combo.')).toEqual({ ribbon: 'Coup final', text: 'Inflige 6 dégâts par combo.' });
    expect(splitRibbon('Dépense : inflige 18 dégâts.')).toEqual({ ribbon: 'Dépense', text: 'Inflige 18 dégâts.' });
    expect(splitRibbon('Inflige 6 dégâts.').ribbon).toBeNull();
  });
});

describe('les aides sur les cartes de la main', async () => {
  const { createCombat, cardBlockReason } = await import('../src/engine/combat');
  const { cardReady } = await import('../src/engine/hints');
  const deck = (ids: string[]) => ids.map((id, i) => ({ uid: 900 + i, id, upgraded: false }));
  const fight = (ids: string[], cls = 'guerrier') => {
    const c = createCombat({ kind: 'combat', name: 't', enemies: ['soldat_irem'] }, deck(ids), 80, 80, 1, 1, {}, [], undefined, cls);
    c.hand = deck(ids);
    return c;
  };

  it('une carte grisée dit pourquoi', () => {
    const c = fight(['frappe']);
    c.player.energy = 0;
    expect(cardBlockReason(c, 0)).toContain('énergie');
    c.player.energy = 3;
    expect(cardBlockReason(c, 0)).toBeNull();
    const v = fight(['embuscade'].filter((id) => CARDS[id]).concat(Object.values(CARDS).filter((d) => d.opener).slice(0, 1).map((d) => d.id)), 'voleur');
    v.stealth = false;
    v.player.energy = 5;
    expect(cardBlockReason(v, v.hand.length - 1)).toContain('Camouflé');
  });

  it('un finisher brille à 5 combo, une Ouverture quand tu es Camouflé', () => {
    const fin = Object.values(CARDS).find((d) => d.finisher)!.id;
    const ope = Object.values(CARDS).find((d) => d.opener)!.id;
    const c = fight([fin, ope], 'voleur');
    c.player.energy = 5;
    c.combo = 3;
    c.stealth = false;
    expect(cardReady(c, 0)).toBe(false);
    expect(cardReady(c, 1)).toBe(false);
    c.combo = 5;
    c.stealth = true;
    expect(cardReady(c, 0)).toBe(true);
    expect(cardReady(c, 1)).toBe(true);
  });
});

describe('ce que change une amélioration', async () => {
  const { markDiff, DIFF_OPEN: O, DIFF_CLOSE: C } = await import('../src/cardtext');
  it('les chiffres qui changent et les ajouts sont marqués', () => {
    expect(markDiff('Inflige 6 dégâts.', 'Inflige 9 dégâts.')).toBe(`Inflige ${O}9${C} dégâts.`);
    expect(markDiff('Ton familier agit une fois de plus.', 'Ton familier agit une fois de plus. Pioche 1 carte.')).toBe(`Ton familier agit une fois de plus. ${O}Pioche 1 carte.${C}`);
    expect(markDiff('Inflige 6 dégâts.', 'Inflige 6 dégâts.')).toBe('Inflige 6 dégâts.');
  });
});
