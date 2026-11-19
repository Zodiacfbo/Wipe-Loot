import { describe, expect, it } from 'vitest';
import { CLASS_TREES } from '../src/engine/talents';
import { TALENT_ICONS, talentIcon } from '../src/engine/talent_icons';

describe('les icônes des talents', () => {
  const all = Object.values(CLASS_TREES).flat().flatMap((tree) => tree.tiers.flat());
  const files = Object.keys(import.meta.glob('../public/assets/*.png'));

  it('chaque talent qui n\'est pas une carte épique a son icône dans la table', () => {
    expect(all.filter((d) => !d.card && !TALENT_ICONS[d.id]).map((d) => d.id)).toEqual([]);
  });

  it('chaque icône existe dans public/assets', () => {
    expect(all.map(talentIcon).filter((f) => !files.includes(`../public/assets/${f}`))).toEqual([]);
  });

  it('la table ne garde pas de talent qui n\'existe plus', () => {
    const ids = new Set(all.map((d) => d.id));
    expect(Object.keys(TALENT_ICONS).filter((id) => !ids.has(id))).toEqual([]);
  });
});

describe('le rappel des cartes et des sorts dans la fiche d\'un talent', () => {
  it('chaque carte et chaque sort rappelés existent, pour un talent qui existe', async () => {
    const { CARDS } = await import('../src/engine/cards');
    const { SPELLS } = await import('../src/engine/spells');
    const { TALENT_REFS } = await import('../src/engine/talent_icons');
    const ids = new Set(Object.values(CLASS_TREES).flat().flatMap((tree) => tree.tiers.flat()).map((d) => d.id));
    for (const [id, refs] of Object.entries(TALENT_REFS)) {
      expect(ids.has(id), id).toBe(true);
      for (const c of refs.cards ?? []) expect(CARDS[c], `${id} → ${c}`).toBeDefined();
      for (const s of refs.spells ?? []) expect(SPELLS[s], `${id} → ${s}`).toBeDefined();
    }
  });
});
