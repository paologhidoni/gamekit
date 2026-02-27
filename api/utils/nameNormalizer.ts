/**
 * This is the "brain" of my validation logic. Its job is to determine if the game name suggested by the AI
 * (e.g., "Zelda: Link's Awakening") matches the official name in the RAWG database (e.g., "The Legend of Zelda: Link's Awakening DX").
 */

/**
 * A list of "noise words" that often describe the version of a game but not its core identity.
 * These are stripped out during normalization to allow for more accurate fuzzy matching.
 * For example, "The Witcher 3: Wild Hunt - Game of the Year Edition" becomes "The Witcher 3: Wild Hunt".
 */
const EDITION_SUFFIXES = [
  "dx",
  "hd",
  "remastered",
  "definitive",
  "goty",
  "complete",
  "enhanced",
  "special",
  "ultimate",
  "deluxe",
  "gold",
  "platinum",
  "game of the year",
  "directors cut",
  "extended",
  "anniversary",
];

/**
 * Cleans and standardizes a game title string for reliable comparison.
 * This is a crucial step before performing any fuzzy matching.
 * @param name The raw game title.
 * @returns A normalized string.
 */
export function normalize(name: string): string {
  let normalized = name.toLowerCase().trim();

  // Remove punctuation (keep alphanumeric and spaces)
  normalized = normalized.replace(/[^\w\s]/g, " ");

  // Strip edition suffixes
  for (const suffix of EDITION_SUFFIXES) {
    const regex = new RegExp(`\\b${suffix}\\b`, "gi");
    normalized = normalized.replace(regex, "");
  }

  // Collapse multiple spaces and trim
  return normalized.replace(/\s+/g, " ").trim();
}

/**
 * Breaks a string into a set of "bigrams" (overlapping pairs of two characters).
 * This is the foundation for the Dice Coefficient similarity algorithm.
 * Example: "zelda" -> {"ze", "el", "ld", "da"}
 * @param str The string to process.
 * @returns A Set of bigrams.
 */
function getBigrams(str: string): Set<string> {
  const bigrams = new Set<string>();
  for (let i = 0; i < str.length - 1; i++) {
    bigrams.add(str.slice(i, i + 2));
  }
  return bigrams;
}

/**
 * Calculates the Sørensen–Dice coefficient between two strings. (fuzzy match)
 * This measures the similarity of two strings based on the bigrams they share.
 * @param a The first string.
 * @param b The second string.
 * @returns A similarity score between 0.0 (no similarity) and 1.0 (identical).
 */
export function diceCoefficient(a: string, b: string): number {
  if (a === b) return 1.0;
  if (a.length < 2 || b.length < 2) return 0.0;

  const bigramsA = getBigrams(a);
  const bigramsB = getBigrams(b);

  let intersection = 0;
  bigramsA.forEach((bigram) => {
    if (bigramsB.has(bigram)) intersection++;
  });

  return (2.0 * intersection) / (bigramsA.size + bigramsB.size);
}

/**
 * Calculates a final, boosted similarity score between two game names.
 * It uses the Dice coefficient as a base and adds bonuses for common matching patterns.
 * @param aiName The name suggested by the AI.
 * @param rawgName The official name from the RAWG database.
 * @param aiYear An optional release year from the AI.
 * @param rawgYear An optional release year from RAWG.
 * @returns A final score, capped at 1.0.
 */
export function calculateNameScore(
  aiName: string,
  rawgName: string,
  aiYear?: number,
  rawgYear?: number,
): number {
  const normAi = normalize(aiName);
  const normRawg = normalize(rawgName);

  // Start with the base fuzzy match score.
  let score = diceCoefficient(normAi, normRawg);

  // Boost score by +0.2 if one name is a substring of the other.
  // This helps match short names like "Skyrim" to "The Elder Scrolls V: Skyrim".
  if (normRawg.includes(normAi) || normAi.includes(normRawg)) {
    score += 0.2;
  }

  // Boost score by +0.1 if the release years match.
  // This helps distinguish between remakes, e.g., Resident Evil 4 (2005) vs (2023).
  if (aiYear && rawgYear && aiYear === rawgYear) {
    score += 0.1;
  }

  return Math.min(score, 1.0);
}
