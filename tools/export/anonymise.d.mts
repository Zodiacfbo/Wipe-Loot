// Les types de anonymise.mjs (utilisé par la page admin et par la tâche GitHub d'export).
export interface ExportInput {
  site: string;
  days: number;
  now: number;
  runs: ({ uid: string; pseudo: string; finMs: number } & object)[];
  players: { uid: string; pseudo?: string; profil?: string | null; majMs?: number; version?: string }[];
}
export interface ExportFile {
  site: string;
  jours: number;
  exporteMs: number;
  runs: ({ joueur: string } & Record<string, unknown>)[];
  joueurs: { joueur: string; majMs: number | null; version: string | null; classes: Record<string, unknown>; stats: unknown; difficulte: Record<string, number>; coffre: string[] }[];
}
export function buildExport<R extends ExportInput['runs'][number]>(input: Omit<ExportInput, 'runs'> & { runs: R[] }): ExportFile;
