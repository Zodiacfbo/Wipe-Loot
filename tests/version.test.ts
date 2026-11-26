import { describe, expect, it } from 'vitest';
import { VERSION, siteOf, versionLabel } from '../src/version';

describe('numéro de version', () => {
  it('reconnaît le site d\'après l\'adresse', () => {
    expect(siteOf('/Wipe-Loot/', 'zodiacfbo.github.io')).toBe('officiel');
    expect(siteOf('/Wipe-Loot/dev/', 'zodiacfbo.github.io')).toBe('dev');
    expect(siteOf('/Wipe-Loot/playtest/', 'zodiacfbo.github.io')).toBe('playtest');
    expect(siteOf('/', 'localhost')).toBe('local');
  });

  it('écrit la version, la date, le commit et le site', () => {
    const v = { number: '0.1.0', commit: '1c9c433', date: '2026-11-23' };
    expect(versionLabel('playtest', v)).toBe('v0.1.0 · 23/11/2026 · 1c9c433 · playtest');
    expect(versionLabel('officiel', v)).toBe('v0.1.0 · 23/11/2026 · 1c9c433');
    expect(versionLabel('local', { ...v, commit: 'local', date: '' })).toBe('v0.1.0 · local · local');
  });

  it('est rempli à la construction', () => {
    expect(VERSION.number).toMatch(/^\d+\.\d+\.\d+$/);
    expect(VERSION.commit.length).toBeGreaterThan(0);
  });
});
