import type { Game } from "../types";
import { transformGameData } from "./transformGameData";

const RAWG_API_KEY = import.meta.env.VITE_RAWG_API_KEY;

interface QueryType {
  id?: string;
  searchTerm?: string;
}

/**
 * The API function to fetch games from RAWG.
 * @returns {Promise<Game[]>}
 */
export async function fetchGames({
  signal,
  query,
}: {
  signal: AbortSignal;
  query?: QueryType;
}) {
  if (!RAWG_API_KEY) {
    throw new Error("RAWG API Key is missing. Please replace the placeholder.");
  }

  let API_URL = `https://api.rawg.io/api/games?key=${RAWG_API_KEY}&page_size=40`;

  if (query?.id) {
    API_URL = `https://api.rawg.io/api/games/${query.id}?key=${RAWG_API_KEY}`;
  } else if (query?.searchTerm) {
    API_URL += `&search=${encodeURIComponent(query.searchTerm)}`;
  }

  try {
    const response = await fetch(API_URL, { signal });
    const parsedResponse = await response.json();

    if (!response.ok) {
      throw new Error(
        `Failed to fetch games: Status ${parsedResponse.message}`
      );
    }

    // If we fetched a single game by ID, the response is the game object itself.
    // We wrap it in an array to maintain a consistent return type.
    if (query?.id) {
      return [transformGameData(parsedResponse)];
    }

    // Otherwise, for searches or general lists, the API wraps the games in a 'results' array.
    // RAWG API wraps the list of games in a 'results' array
    return parsedResponse.results.map(transformGameData);
  } catch (error) {
    // Last attempt, rethrow the error
    throw error;
  }
}
