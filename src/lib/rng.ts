/** PRNG deterministe (mulberry32) pour que tous les joueurs du Defi quotidien voient le meme deck. */
export function mulberry32(seed: number): () => number {
  let state = seed
  return () => {
    state |= 0
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Hash simple (FNV-1a) d'une chaine (ex: date 'YYYY-MM-DD') vers un entier 32 bits utilisable comme seed. */
export function hashSeed(input: string): number {
  let hash = 0x811c9dc5
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  return hash >>> 0
}

export function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}
