/** Adjectives pool for generating bun-themed anonymous commenter names. */
export const BUN_ADJS = [
  "sleepy",
  "cozy",
  "golden",
  "toasty",
  "fluffy",
  "crusty",
  "warm",
  "soft",
  "crispy",
  "doughy",
  "puffy",
  "sesame",
];

/** Nouns pool for generating bun-themed anonymous commenter names. */
export const BUN_NOUNS = [
  "loaf",
  "bun",
  "roll",
  "crumb",
  "muffin",
  "scone",
  "pretzel",
  "bagel",
  "biscuit",
  "brioche",
];

/**
 * Derives a deterministic bun-themed display name (e.g. "sleepy-loaf") from a numeric seed.
 * The same seed always produces the same name, making it stable across page reloads
 * when stored in localStorage.
 */
export function anonName(seed: number): string {
  const adj = BUN_ADJS[seed % BUN_ADJS.length];
  const noun = BUN_NOUNS[Math.floor(seed / BUN_ADJS.length) % BUN_NOUNS.length];
  return `${adj}-${noun}`;
}
