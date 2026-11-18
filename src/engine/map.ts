// La carte d'un acte : 10 étages, des chemins qui se croisent, un boss au bout.
// Référence : docs/actes/ACTE1_PROFONDEURS_ARDENTES.md (§2)
import { ELITE_ENCOUNTERS } from './enemies';
import { random } from './rng';
import type { HasRng } from './rng';

export type NodeType = 'combat' | 'elite' | 'event' | 'shop' | 'campfire' | 'chest' | 'boss';

export interface MapNode {
  id: number;
  floor: number; // 0 à 9 (étage 1 à 10)
  lane: number; // 0 à 3 (position verticale à l'écran)
  type: NodeType;
  next: number[]; // ids des nœuds de l'étage suivant
  /** Boss secondaire de ce nœud (index dans ELITE_ENCOUNTERS), choisi dès la création de la carte. */
  elite?: number;
}

export interface ActMap {
  floors: number;
  lanes: number;
  nodes: MapNode[];
}

export const FLOORS = 10;
export const LANES = 4;

function pick<T>(s: HasRng, list: T[]): T {
  return list[Math.floor(random(s) * list.length)];
}

function weighted<T extends string>(s: HasRng, table: [T, number][]): T {
  const total = table.reduce((a, [, w]) => a + w, 0);
  let r = random(s) * total;
  for (const [v, w] of table) {
    r -= w;
    if (r <= 0) return v;
  }
  return table[table.length - 1][0];
}

function typeForFloor(s: HasRng, floor: number, eliteWeight = 22): NodeType {
  if (floor === 0) return 'combat';
  if (floor === 4) return 'chest';
  if (floor === 8) return 'campfire';
  if (floor === 9) return 'boss';
  if (floor <= 3) return weighted(s, [['combat', 52], ['event', 34], ['shop', 14]]);
  return weighted(s, [['combat', 36], ['elite', eliteWeight], ['event', 22], ['shop', 10], ['campfire', 10]]);
}

/** Deux arêtes entre les mêmes étages se croisent-elles ? */
function crosses(a1: number, a2: number, b1: number, b2: number): boolean {
  return (a1 < b1 && a2 > b2) || (a1 > b1 && a2 < b2);
}

/** `eliteWeight` : la fréquence des boss secondaires (plus haut en difficulté 1 et plus). */
export function generateMap(s: HasRng, eliteWeight = 22): ActMap {
  // edges[f] : liste des arêtes [laneDépart, laneArrivée] entre l'étage f et f+1 (f de 0 à 7)
  const edges: [number, number][][] = Array.from({ length: FLOORS - 2 }, () => []);
  const used: Set<number>[] = Array.from({ length: FLOORS - 1 }, () => new Set());

  const pathCount = 4;
  const starts: number[] = [];
  for (let p = 0; p < pathCount; p++) {
    // Les deux premiers chemins partent de lanes différentes, pour garantir au moins 2 départs.
    let lane = Math.floor(random(s) * LANES);
    if (p === 1) while (lane === starts[0]) lane = Math.floor(random(s) * LANES);
    starts.push(lane);
    used[0].add(lane);
    for (let f = 0; f < FLOORS - 2; f++) {
      const options = [lane - 1, lane, lane + 1].filter((l) => l >= 0 && l < LANES);
      const ok = options.filter((l) => !edges[f].some(([b1, b2]) => crosses(lane, l, b1, b2)));
      const nextLane = ok.length > 0 ? pick(s, ok) : lane;
      if (!edges[f].some(([a, b]) => a === lane && b === nextLane)) edges[f].push([lane, nextLane]);
      used[f + 1].add(nextLane);
      lane = nextLane;
    }
  }

  // Création des nœuds
  const nodes: MapNode[] = [];
  const idAt = new Map<string, number>();
  for (let f = 0; f < FLOORS - 1; f++) {
    for (const lane of [...used[f]].sort()) {
      const id = nodes.length;
      nodes.push({ id, floor: f, lane, type: typeForFloor(s, f, eliteWeight), next: [] });
      idAt.set(`${f}:${lane}`, id);
    }
  }
  const boss: MapNode = { id: nodes.length, floor: FLOORS - 1, lane: 1.5, type: 'boss', next: [] };
  nodes.push(boss);

  for (let f = 0; f < FLOORS - 2; f++) {
    for (const [a, b] of edges[f]) {
      const from = nodes[idAt.get(`${f}:${a}`)!];
      const to = idAt.get(`${f + 1}:${b}`)!;
      if (!from.next.includes(to)) from.next.push(to);
    }
  }
  for (const n of nodes) if (n.floor === FLOORS - 2) n.next.push(boss.id);

  // Pas de boss secondaire juste avant le feu de camp obligatoire et le boss : on garde l'étage 8 libre de doublons d'élites.
  for (const n of nodes) {
    if (n.type === 'elite' && n.floor === 7 && nodes.filter((m) => m.next.includes(n.id)).every((m) => m.type === 'elite')) {
      n.type = 'combat';
    }
  }
  for (const n of nodes) if (n.type === 'elite') n.elite = Math.floor(random(s) * ELITE_ENCOUNTERS.length);

  // Au moins un vendeur par run : si le hasard n'en a pas mis, un « ? » ou un combat en devient un.
  if (!nodes.some((n) => n.type === 'shop')) {
    const candidates = nodes.filter((n) => n.floor >= 1 && n.floor <= 7 && n.floor !== 4 && (n.type === 'event' || n.type === 'combat'));
    if (candidates.length > 0) pick(s, candidates).type = 'shop';
  }
  return { floors: FLOORS, lanes: LANES, nodes };
}

/** Les nœuds où le joueur peut aller depuis sa position (null = avant l'étage 1). */
export function reachable(map: ActMap, position: number | null): MapNode[] {
  if (position === null) return map.nodes.filter((n) => n.floor === 0);
  return map.nodes[position].next.map((id) => map.nodes[id]);
}
