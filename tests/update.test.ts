import { describe, expect, it } from 'vitest';
import { isNewer } from '../src/update';

describe('nouvelle version', () => {
  it('propose de recharger seulement quand le commit en ligne a changé', () => {
    expect(isNewer('04e06fb', 'ad8aa9d')).toBe(true);
    expect(isNewer('ad8aa9d', 'ad8aa9d')).toBe(false);
    expect(isNewer('04e06fb', 'local')).toBe(false); // jeu en local ou tests
    expect(isNewer(undefined, 'ad8aa9d')).toBe(false);
    expect(isNewer('', 'ad8aa9d')).toBe(false);
  });
});
