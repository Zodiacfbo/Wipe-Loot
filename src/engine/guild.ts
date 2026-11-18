// Le coffre de la guilde : la seule chose qui reste d'une run à l'autre (avec les objets découverts).
// Après une victoire, on y dépose 1 objet. Au début d'une run, on peut en emporter 1 :
// il revient au coffre si la run est gagnée, il est perdu sinon.
// Référence : docs/CONCEPT.md (§12.8)
import { SLOT_KEYS, type SlotKey } from './items';
import type { RunState } from './types';

export const CHEST_SIZE = 6;

export interface GuildChest {
  guildChest: string[];
}

/** Retire un objet du coffre pour l'emporter dans une nouvelle run. */
export function takeHeirloom(profile: GuildChest, index: number): string | null {
  const id = profile.guildChest[index];
  if (!id) return null;
  profile.guildChest.splice(index, 1);
  return id;
}

/** L'emplacement où se trouve encore l'objet emporté du coffre (null s'il a été remplacé). */
export function heirloomSlot(run: RunState): SlotKey | null {
  if (!run.heirloom) return null;
  return SLOT_KEYS.find((k) => run.equipment[k] === run.heirloom) ?? null;
}

/** Les objets que l'on peut déposer après une victoire (tout l'équipement, sauf l'objet emporté qui revient de lui-même). */
export function depositableSlots(run: RunState): SlotKey[] {
  const back = heirloomSlot(run);
  return SLOT_KEYS.filter((k) => run.equipment[k] && k !== back);
}

/** Place restante dans le coffre une fois l'objet emporté revenu. */
export function chestRoomAfterReturn(profile: GuildChest, run: RunState): number {
  return CHEST_SIZE - profile.guildChest.length - (heirloomSlot(run) ? 1 : 0);
}

/**
 * Fin d'une run gagnée : l'objet emporté revient au coffre, et on dépose (ou non) un objet.
 * `replaceIndex` : si le coffre est plein, l'objet du coffre à remplacer.
 */
export function settleChest(profile: GuildChest, run: RunState, depositSlot: SlotKey | null, replaceIndex?: number): boolean {
  if (run.screen !== 'victory' || run.chestDone) return false;
  const deposit = depositSlot ? run.equipment[depositSlot] : null;
  if (depositSlot && (!deposit || !depositableSlots(run).includes(depositSlot))) return false;
  const full = chestRoomAfterReturn(profile, run) <= 0;
  if (deposit && full && (replaceIndex === undefined || !profile.guildChest[replaceIndex])) return false;

  if (heirloomSlot(run)) profile.guildChest.push(run.heirloom!);
  if (deposit) {
    if (full) profile.guildChest[replaceIndex!] = deposit;
    else profile.guildChest.push(deposit);
  }
  run.chestDone = true;
  run.chestDeposit = deposit;
  return true;
}
