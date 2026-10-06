/**
 * Distributes clips across editors.
 *
 * - "load":   give each clip to whoever currently carries the least open work
 *             (existing load + what this run already gave them).
 * - "even":   equal split of these clips, ignoring existing load.
 * - "random": equal split in a shuffled order ("สุ่มจับคู่"); seed makes it
 *             reproducible so the preview does not change on re-render.
 *
 * In every mode the difference between any two editors' new clip counts is at
 * most 1 (for "load", after accounting for their existing load).
 */

export type BalanceMethod = "load" | "even" | "random";

export type BalanceEditor = { id: string; baseLoad: number };

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(items: T[], random: () => number) {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function balanceAssignments<K>({
  clipKeys,
  editors,
  method,
  seed = 1,
}: {
  clipKeys: K[];
  editors: BalanceEditor[];
  method: BalanceMethod;
  seed?: number;
}): Map<K, string> {
  const result = new Map<K, string>();
  if (!editors.length) return result;

  const random = mulberry32(seed);
  // Tie-break order: stable for load/even, shuffled for random.
  const order = method === "random" ? shuffle(editors, random) : editors;
  const load = new Map(order.map((e) => [e.id, method === "load" ? e.baseLoad : 0]));
  const given = new Map(order.map((e) => [e.id, 0]));

  for (const key of clipKeys) {
    let best = order[0];
    for (const editor of order) {
      const l = load.get(editor.id)!;
      const bestLoad = load.get(best.id)!;
      if (l < bestLoad || (l === bestLoad && given.get(editor.id)! < given.get(best.id)!)) best = editor;
    }
    result.set(key, best.id);
    load.set(best.id, load.get(best.id)! + 1);
    given.set(best.id, given.get(best.id)! + 1);
  }
  return result;
}
