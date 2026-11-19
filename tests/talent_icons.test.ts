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
