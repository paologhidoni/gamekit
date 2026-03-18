import { getPlatformId, getGenreId } from "./rawgCache.js";
import { calculateNameScore } from "./nameNormalizer.js";

/**
 * This is the critical quality control step in my AI search feature.
 * It acts as a bridge between the AI's creative suggestions and the factual, authoritative data from the RAWG database.
 * This system trusts the AI for its natural language understanding but verifies its suggestions against a factual database,
 * using a smart scoring system to find the best possible matches for the user.
 */

/**
 * A single game suggestion from OpenAI, containing just the name and the AI's confidence score.
 */
interface Candidate {
  name: string;
  confidence: number;
}

/**
 * The AI's structured understanding of the user's query (e.g., genre: "RPG", platform: "Game Boy").
 */
interface Intent {
  genre: string | null;
  platform: string | null;
  mood: string | null;
  year_from?: number | null;
  year_to?: number | null;
}

/**
 * The final, enriched game object after it has been successfully matched with a real entry in the RAWG database.
 * It includes all the RAWG data plus our own validationScore.
 */
interface ValidatedGame {
  id: number;
  name: string;
  slug: string;
  background_image: string;
  metacritic: number | null;
  released: string;
  rating: number;
  genres: any[];
  platforms: any[];
  description: string | null;
  developers: any[];
  tags: any[];
  multiplayer: any[];
  validationScore: number;
}

export async function validateCandidates(
  candidates: Candidate[],
  intent: Intent,
): Promise<ValidatedGame[]> {
  // It takes the intent from OpenAI and uses my rawgCache.ts utility to look up the numeric IDs for the platform and genre
  // (e.g., "Game Boy" → 26). This is essential for making precise API calls later.
  const platformId = intent.platform ? getPlatformId(intent.platform) : null;
  const genreId = intent.genre ? getGenreId(intent.genre) : null;

  // If platform was specified but doesn't exist in RAWG, return empty array to trigger fallback
  if (intent.platform && !platformId) {
    console.log(`Platform "${intent.platform}" not found in RAWG database`);
    return [];
  }

  // Smart batching: validate a larger first batch first.
  // This saves time when the AI's top suggestions are already high quality, but still allows us to
  // return up to the new (expanded) candidate cap.
  const batch1 = candidates.slice(0, 10);

  // If we already have enough validated games, early-stop to save time and API quota.
  const validated1 = await validateBatch(batch1, platformId, genreId);

  // With expanded candidate max (up to 15), only early-stop once we have at least 5 good results.
  if (validated1.length >= 5) {
    return validated1.slice(0, 15);
  }

  // Otherwise, validate remaining candidates
  const batch2 = candidates.slice(10);
  const validated2 = await validateBatch(batch2, platformId, genreId);

  return [...validated1, ...validated2].slice(0, 15);
}

/**
 * This is where the core validation logic happens.
 * It takes a batch of candidates and validates them against RAWG in parallel for maximum speed.
 */
async function validateBatch(
  candidates: Candidate[],
  platformId: number | null,
  genreId: number | null,
): Promise<ValidatedGame[]> {
  const promises = candidates.map(async (candidate) => {
    const params = new URLSearchParams({
      key: process.env.RAWG_API_KEY!,
      search: candidate.name,
      page_size: "3",
    });

    if (platformId) {
      params.set("platforms", String(platformId));
    }

    const res = await fetch(`https://api.rawg.io/api/games?${params}`);
    const data = await res.json();

    if (!data.results || data.results.length === 0) {
      return null;
    }

    // Find best match from top 3 RAWG results
    for (const game of data.results) {
      const nameScore = calculateNameScore(candidate.name, game.name);

      // Genre validation using RAWG IDs (not strings)
      const genreMatch = genreId
        ? game.genres?.some((g: any) => g.id === genreId)
          ? 1
          : 0
        : 0.5; // Neutral if no genre specified

      // Hybrid scoring: AI confidence (40%) + name similarity (40%) + genre match (20%)
      const score =
        candidate.confidence * 0.4 + nameScore * 0.4 + genreMatch * 0.2;

      // Accept if score meets threshold
      if (score >= 0.6) {
        return {
          ...game,
          validationScore: score,
        } as ValidatedGame;
      }
    }

    return null;
  });

  const results = await Promise.all(promises);

  // Filter nulls and sort by validation score (highest first)
  return results
    .filter((game): game is ValidatedGame => game !== null)
    .sort((a, b) => b.validationScore - a.validationScore);
}
