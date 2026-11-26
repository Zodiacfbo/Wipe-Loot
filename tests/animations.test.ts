import { describe, expect, it } from 'vitest';
import { ENEMIES } from '../src/engine/enemies';
import { CLASSES } from '../src/engine/classes';

// Les sprites animés sont des planches anim_<fichier> (tools/pixel/animations.py).
// Le jeu anime tous les ennemis : sans planche, l'ennemi s'afficherait en image cassée.
describe('les sprites animés', () => {
  const files = new Set(Object.keys(import.meta.glob('../public/assets/*.png')).map((f) => f.replace('../public/assets/', '')));

  it('chaque ennemi a sa planche animée (lancer python3 animations.py depuis tools/pixel/)', () => {
    const ids = [...Object.keys(ENEMIES), 'vhaeryx_dragon', 'yzhar_corps'];
    expect(ids.filter((id) => !files.has(`anim_ennemi_${id}.png`))).toEqual([]);
  });

  it('chaque classe jouable a son sprite animé', () => {
    const sprites = CLASSES.filter((c) => c.playable).map((c) => c.sprite ?? '');
    expect(sprites.filter((s) => !files.has(`anim_${s}`))).toEqual([]);
  });
});
