import { getPlatformId, getGenreId } from "./rawgCache.js";
import { calculateNameScore } from "./nameNormalizer.js";

/**
 * This is the critical quality control step in my AI search feature.
 * It acts as a bridge between the AI's creative suggestions and the factual, authoritative data from the RAWG database.
 */

interface Candidate {
  name: string;
  confidence: number;
}

interface Intent {
  genre: string | null;
  platform: string | null;
  mood: string | null;
  year_from?: number | null;
  year_to?: number | null;
}

interface ValidatedGame {
  id: number;
  name: string;
  slug: string;
  background_image: string;
  metacritic: number | null;
  released: string;
  rating: number;
  genres: Record<string, unknown>[];
  platforms: Record<string, unknown>[];
  description: string | null;
  developers: Record<string, unknown>[];
  tags: Record<string, unknown>[];
  multiplayer: Record<string, unknown>[];
  validationScore: number;
}

export async function validateCandidates(
  candidates: Candidate[],
  intent: Intent,
): Promise<ValidatedGame[]> {
  const platformId = intent.platform ? getPlatformId(intent.platform) : null;
  const genreId = intent.genre ? getGenreId(intent.genre) : null;

  // If platform was specified but doesn't exist in RAWG, return empty array to trigger fallback
  if (intent.platform && !platformId) {
    console.log(`Platform "${intent.platform}" not found in RAWG database`);
    return [];
  }

  // Smart batching: validate a larger first batch first.
  const batch1 = candidates.slice(0, 10);

  const validated1 = await validateBatch(batch1, platformId, genreId);

  // With expanded candidate max, early-stop once we have at least 5 good results.
  if (validated1.length >= 5) {
    return validated1.slice(0, 15);
  }

  // Otherwise, validate remaining candidates
  const batch2 = candidates.slice(10);
  const validated2 = await validateBatch(batch2, platformId, genreId);

  return [...validated1, ...validated2].slice(0, 15);
}

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
        ? Array.isArray(game.genres) &&
          game.genres.some((g: unknown) => {
            if (!g || typeof g !== "object") return false;
            const obj = g as Record<string, unknown>;
            return obj.id === genreId;
          })
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

  return results
    .filter((game): game is ValidatedGame => game !== null)
    .sort((a, b) => b.validationScore - a.validationScore);
}

