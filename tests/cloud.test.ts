import { describe, expect, it } from 'vitest';
import { authErrorText, cloudSite, passwordError, pseudoError, pseudoToEmail, runStepKey, seasonReset, syncChoice, type CloudDoc } from '../src/cloud_logic';

const doc = (majMs: number): CloudDoc => ({ pseudo: 'Aldric', profil: '{}', run: null, saison: 1, majMs, version: 'abc' });

describe('sauvegarde en ligne', () => {
  it('range chaque site dans son dossier', () => {
    expect(cloudSite('dev')).toBe('dev');
    expect(cloudSite('local')).toBe('dev');
    expect(cloudSite('playtest')).toBe('playtest');
    expect(cloudSite('officiel')).toBe('main');
  });

  it('vérifie le pseudo et le mot de passe', () => {
    expect(pseudoError('Aldric')).toBeNull();
    expect(pseudoError('Élodie_2')).toBeNull();
    expect(pseudoError('ab')).toMatch(/au moins/);
    expect(pseudoError('a'.repeat(17))).toMatch(/au plus/);
    expect(pseudoError('le roi')).toMatch(/lettres/);
    expect(pseudoError('<b>x</b>')).toMatch(/lettres/);
    expect(passwordError('12345')).toMatch(/6/);
    expect(passwordError('123456')).toBeNull();
  });

  it('transforme le pseudo en adresse factice, sans accents ni majuscules', () => {
    expect(pseudoToEmail(' Élodie ')).toBe('elodie@joueurs.wipe-loot.invalid');
    expect(pseudoToEmail('ELODIE')).toBe(pseudoToEmail('élodie'));
  });

  it('traduit les erreurs de Firebase', () => {
    expect(authErrorText('auth/email-already-in-use')).toMatch(/déjà pris/);
    expect(authErrorText('auth/invalid-credential')).toMatch(/incorrect/);
    expect(authErrorText('inconnue')).toMatch(/Réessaie/);
  });

  it('choisit la sauvegarde à garder à la connexion', () => {
    // Nouveau compte : la partie de l'appareil part en ligne si elle n'est à personne ou à lui.
    expect(syncChoice('u1', { uid: null, maj: 5 }, null)).toBe('envoyer');
    expect(syncChoice('u1', { uid: 'u1', maj: 5 }, null)).toBe('envoyer');
    // … mais pas celle d'un autre joueur.
    expect(syncChoice('u1', { uid: 'u2', maj: 5 }, null)).toBe('vider');
    // Compte existant : la sauvegarde en ligne gagne, sauf partie plus récente jouée ici sans réseau.
    expect(syncChoice('u1', { uid: 'u2', maj: 99 }, doc(10))).toBe('recevoir');
    expect(syncChoice('u1', { uid: null, maj: 99 }, doc(10))).toBe('recevoir');
    expect(syncChoice('u1', { uid: 'u1', maj: 5 }, doc(10))).toBe('recevoir');
    expect(syncChoice('u1', { uid: 'u1', maj: 20 }, doc(10))).toBe('envoyer');
  });

  it('remet à zéro quand la saison change', () => {
    expect(seasonReset(1, 2)).toBe(true);
    expect(seasonReset(2, 2)).toBe(false);
  });

  it('n\'envoie la run qu\'au changement d\'étape', () => {
    const a = { act: 1, position: 3, screen: 'combat' };
    expect(runStepKey(a)).toBe(runStepKey({ ...a }));
    expect(runStepKey(a)).not.toBe(runStepKey({ ...a, screen: 'reward' }));
    expect(runStepKey(a)).not.toBe(runStepKey({ ...a, position: 4 }));
    expect(runStepKey(null)).toBe('aucune');
  });
});
