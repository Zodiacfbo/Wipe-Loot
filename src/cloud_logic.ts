// Les règles de la sauvegarde en ligne qui ne dépendent pas de Firebase (testées dans tests/cloud.test.ts).
import type { Site } from './version';

/** Le dossier de la base pour chaque site. Le jeu lancé en local utilise le dossier de dev. */
export type CloudSite = 'dev' | 'playtest' | 'main';
export function cloudSite(site: Site): CloudSite {
  if (site === 'playtest') return 'playtest';
  if (site === 'officiel') return 'main';
  return 'dev';
}

export const PSEUDO_MIN = 3;
export const PSEUDO_MAX = 16;
export const PASSWORD_MIN = 6;

/** Pourquoi ce pseudo n'est pas accepté (null s'il est bon). */
export function pseudoError(pseudo: string): string | null {
  const p = pseudo.trim();
  if (p.length < PSEUDO_MIN) return `Ton pseudo doit faire au moins ${PSEUDO_MIN} caractères.`;
  if (p.length > PSEUDO_MAX) return `Ton pseudo doit faire au plus ${PSEUDO_MAX} caractères.`;
  if (!/^[a-z0-9_-]+$/.test(plain(p))) return 'Ton pseudo ne peut contenir que des lettres, des chiffres, - et _.';
  return null;
}

/** Le pseudo sans accents ni majuscules (« Élodie » → « elodie »). */
function plain(pseudo: string): string {
  return pseudo.trim().normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

/** Pourquoi ce mot de passe n'est pas accepté (null s'il est bon). */
export function passwordError(password: string): string | null {
  return password.length < PASSWORD_MIN ? `Ton mot de passe doit faire au moins ${PASSWORD_MIN} caractères.` : null;
}

/**
 * Firebase ne connaît que « e-mail + mot de passe » : le pseudo devient une adresse factice,
 * jamais montrée au joueur. Sans accents ni majuscules, pour que « Élodie » et « elodie » soient le même compte.
 * Le domaine `.invalid` est réservé : aucun e-mail n'y sera jamais envoyé.
 */
export function pseudoToEmail(pseudo: string): string {
  return `${plain(pseudo)}@joueurs.wipe-loot.invalid`;
}

/** Le message à montrer pour une erreur de Firebase (son code, ex. « auth/email-already-in-use »). */
export function authErrorText(code: string): string {
  switch (code) {
    case 'auth/email-already-in-use': return 'Ce pseudo est déjà pris. Choisis-en un autre, ou connecte-toi.';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
    case 'auth/invalid-email': return 'Pseudo ou mot de passe incorrect.';
    case 'auth/weak-password': return `Ton mot de passe doit faire au moins ${PASSWORD_MIN} caractères.`;
    case 'auth/too-many-requests': return 'Trop d\'essais. Attends quelques minutes avant de réessayer.';
    case 'auth/network-request-failed':
    case 'unavailable': return 'Pas de connexion internet. Réessaie quand le réseau revient.';
    case 'auth/user-disabled': return 'Ce compte est bloqué. Écris à l\'organisateur.';
    default: return 'La connexion n\'a pas marché. Réessaie dans un instant.';
  }
}

/** Ce qu'on sait de la sauvegarde de cet appareil : à qui elle est, et quand elle a changé. */
export interface LocalOwner {
  uid: string | null;
  /** Date (ms) de la dernière écriture locale. */
  maj: number;
}

/** Ce que contient la fiche du joueur en ligne. */
export interface CloudDoc {
  pseudo: string;
  profil: string | null;
  run: string | null;
  saison: number;
  /** Date (ms, horloge du joueur) de la dernière écriture. */
  majMs: number;
  version: string;
}

/**
 * À la connexion, quelle sauvegarde garder ?
 * - « envoyer » : la sauvegarde de cet appareil part en ligne ;
 * - « recevoir » : la sauvegarde en ligne remplace celle de cet appareil ;
 * - « vider » : cet appareil a la sauvegarde d'un autre joueur, on repart de zéro.
 */
export type SyncChoice = 'envoyer' | 'recevoir' | 'vider';
export function syncChoice(uid: string, local: LocalOwner, cloud: CloudDoc | null): SyncChoice {
  const mine = local.uid === uid;
  if (!cloud) {
    // Nouveau compte (ou premier passage sur ce site) : on garde la partie de cet appareil
    // si elle n'appartient à personne (le joueur jouait avant les comptes) ou à lui.
    return mine || local.uid === null ? 'envoyer' : 'vider';
  }
  // Ce joueur a joué ici sans réseau après sa dernière sauvegarde en ligne : on garde l'appareil.
  if (mine && local.maj > cloud.majMs) return 'envoyer';
  return 'recevoir';
}

/** Faut-il remettre la sauvegarde à zéro (nouvelle saison) ? */
export function seasonReset(playerSeason: number, currentSeason: number): boolean {
  return playerSeason < currentSeason;
}

/**
 * Le moment de la run, pour n'envoyer la sauvegarde en ligne qu'au changement d'étape
 * (et pas à chaque carte jouée). Deux runs au même endroit donnent la même clé.
 */
export function runStepKey(run: { act?: number; position?: number | null; screen?: string } | null): string {
  if (!run) return 'aucune';
  return `${run.act ?? 1}:${run.position ?? '-'}:${run.screen ?? ''}`;
}
