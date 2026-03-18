/**
 * A list of "noise words" that often describe the version of a game but not its core identity.
 * These are stripped out during normalization to allow for more accurate fuzzy matching.
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

function getBigrams(str: string): Set<string> {
  const bigrams = new Set<string>();
  for (let i = 0; i < str.length - 1; i++) {
    bigrams.add(str.slice(i, i + 2));
  }
  return bigrams;
}

/**
 * Calculates the Sørensen–Dice coefficient between two strings.
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
  if (normRawg.includes(normAi) || normAi.includes(normRawg)) {
    score += 0.2;
  }

  // Boost score by +0.1 if the release years match.
  if (aiYear && rawgYear && aiYear === rawgYear) {
    score += 0.1;
  }

  return Math.min(score, 1.0);
}

