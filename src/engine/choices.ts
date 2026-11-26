// Le journal des choix d'une expédition : chaque décision hors combat et un résumé de chaque combat.
// Envoyé avec le journal de fin d'expédition (src/journal.ts), lu par la page admin (statistiques, fiche d'un joueur).
// Clés courtes : le journal part en ligne, il doit rester léger.
import type { RunState } from './types';

export type Choice =
  /** Un nœud de la carte choisi. */
  | { t: 'noeud'; e: number; n: string }
  /** Des cartes proposées en récompense, et celle prise (null : aucune). */
  | { t: 'cartes'; e: number; o: string[]; p: string | null }
  /** Un objet trouvé (et les autres proposés), et celui équipé (null : laissé). */
  | { t: 'objet'; e: number; o: string[]; p: string | null }
  /** Un choix d'événement (numéro du choix). */
  | { t: 'evt'; e: number; id: string; c: number }
  /** Un achat chez le vendeur gobelin. */
  | { t: 'achat'; e: number; k: 'carte' | 'objet' | 'potion' | 'retrait' | 'amelio' | 'reparation'; id: string; prix: number }
  /** Le feu de camp. */
  | { t: 'feu'; e: number; k: 'repos' | 'amelio'; id?: string }
  /** La bénédiction de Brégan. */
  | { t: 'benediction'; id: string }
  /** Un combat fini : gagné ou chute ; tours joués et PV perdus. */
  | { t: 'combat'; e: number; n: string; k: string; tours: number; pv: number; fin: 'victoire' | 'chute' };

/** Au plus tant d'entrées (une expédition complète en fait environ 150). */
export const MAX_CHOICES = 400;

/** L'étape de l'expédition (1 à 30). */
export function stepOf(run: RunState): number {
  return (run.floorsDone ?? 0) + run.path.length;
}

/** Ajoute une entrée au journal des choix de la run. */
export function logChoice(run: RunState, entry: Choice): void {
  const list = (run.choix ??= []);
  if (list.length < MAX_CHOICES) list.push(entry);
}
