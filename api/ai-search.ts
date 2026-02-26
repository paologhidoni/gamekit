import type { VercelRequest, VercelResponse } from "@vercel/node";
import { config } from "dotenv";
import { interpretQuery } from "./utils/openaiClient";
import { validateCandidates } from "./utils/gameValidator";
import { initializeCache, getPlatformId, getGenreId } from "./utils/rawgCache";
import { transformGameData } from "./utils/transformGameData";

config({ path: ".env.backend" });

let cacheInitialized = false;

/**
 * Handles the /api/ai-search endpoint.
 * This Vercel Serverless Function orchestrates the entire AI search feature, tying together utility modules to:
 * 1. Interpret a user's natural language query via OpenAI.
 * 2. Validate the AI's suggestions against the RAWG database.
 * 3. Perform a fallback search if validation yields too few results.
 * 4. Format and return a high-quality, structured response to the client.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Ensure RAWG cache is initialized
    if (!cacheInitialized) {
      await initializeCache();
      cacheInitialized = true;
    }

    const { query } = req.query;
    if (!query || typeof query !== "string") {
      return res.status(400).json({ error: "Query parameter required" });
    }

    // Step 1: LLM interprets user query
    // Send the user's raw text query to the openaiClient, which uses the OpenAI API to convert it into a structured object
    // containing the intent (what the user wants) and a list of candidates (the AI's game suggestions).
    const { intent, candidates } = await interpretQuery(query);

    // Step 2: Validate candidates against RAWG
    // The AI's candidates are passed to your gameValidator, which uses the hybrid scoring system to check them against the real
    // RAWG database. The result is a list of games that are confirmed to exist and are highly relevant.
    let validatedGames = await validateCandidates(candidates, intent);

    // Step 3: Fallback to structured RAWG search if validation failed
    // If the AI's suggestions were poor and very few (less than 3) passed validation, the system doesn't fail. Instead, it calls the
    // fallbackSearch function, which performs a traditional, structured search on the RAWG API using the intent data.
    // This ensures the user almost always gets a useful result.
    if (validatedGames.length < 3) {
      validatedGames = await fallbackSearch(intent);
    }

    // Step 4: Transform data for frontend
    const games = validatedGames.map(transformGameData);

    // Step 5: Generate explanation
    const explanation = generateExplanation(intent, games);

    res.status(200).json({
      explanation,
      games,
      metadata: {
        intent,
        validatedCount: validatedGames.length,
        usedFallback: validatedGames.length < 3,
      },
    });
  } catch (err) {
    console.error("AI search error:", err);
    res.status(500).json({
      error: err instanceof Error ? err.message : "AI search failed",
    });
  }
}

/**
 * Fallback, simplified version of /api/games.ts endpoint. It takes the structured intent from the AI
 * (e.g., { platform: "Game Boy", genre: "RPG" }), looks up the correct IDs from the rawgCache,
 * and builds a standard API request to RAWG.
 */
async function fallbackSearch(intent: any): Promise<any[]> {
  const params = new URLSearchParams({
    key: process.env.RAWG_API_KEY!,
    page_size: "8",
    ordering: "-rating",
  });

  if (intent.platform) {
    const platformId = getPlatformId(intent.platform);
    if (platformId) params.set("platforms", String(platformId));
  }

  if (intent.genre) {
    const genreId = getGenreId(intent.genre);
    if (genreId) params.set("genres", String(genreId));
  }

  const res = await fetch(`https://api.rawg.io/api/games?${params}`);
  const data = await res.json();

  return data.results || [];
}

/**
 * simple utility that constructs a user-friendly sentence based on the search criteria,
 * like "Found 5 cozy RPG games on Game Boy that match your search."
 */
function generateExplanation(intent: any, games: any[]): string {
  const parts = [];

  if (intent.mood) parts.push(intent.mood);
  if (intent.genre) parts.push(intent.genre);
  if (intent.platform) parts.push(`on ${intent.platform}`);

  const criteria = parts.join(" ");

  return `Found ${games.length} ${criteria} games that match your search.${
    intent.mood
      ? ` These games capture the ${intent.mood} atmosphere you're looking for.`
      : ""
  }`;
}
