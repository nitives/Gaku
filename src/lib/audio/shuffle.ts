// Deterministic seeded PRNG (Mulberry32) and Fisher-Yates shuffle

export type ShuffleOrder = number[];

export class SeededRNG {
  private state: number;
  constructor(seed: number) {
    // Normalize seed to 32-bit
    this.state = seed >>> 0;
    if (this.state === 0) this.state = 0x9e3779b9; // avoid zero seed
  }
  next() {
    // mulberry32
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
}

export function shuffleIndices(length: number, seed: number): ShuffleOrder {
  const arr: number[] = Array.from({ length }, (_, i) => i);
  const rng = new SeededRNG(seed);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng.next() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function reseedFromTime(): number {
  // Reduce to 32-bit integer
  return (Date.now() & 0xffffffff) >>> 0;
}
