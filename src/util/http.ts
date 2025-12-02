import type { Game } from "../types";

const RAWG_API_KEY = import.meta.env.VITE_RAWG_API_KEY;

/**
 * The API function to fetch games from RAWG.
 * @returns {Promise<Game[]>}
 */
export async function fetchGames() {
  if (!RAWG_API_KEY) {
    throw new Error("RAWG API Key is missing. Please replace the placeholder.");
  }

  const API_URL = `https://api.rawg.io/api/games?key=${RAWG_API_KEY}&page_size=60&ordering=-rating`;

  try {
    const response = await fetch(API_URL);
    const parsedResponse = await response.json();

    if (!response.ok) {
      throw new Error(
        `Failed to fetch games: Status ${parsedResponse.message}`
      );
    }

    console.log(parsedResponse, "PARSED");

    // RAWG API wraps the list of games in a 'results' array
    return parsedResponse.results.map((game: Game) => ({
      id: game.id,
      name: game.name,
      released: game.released,
      background_image: game.background_image,
      genres: game.genres,
      rating: game.rating,
      platforms: game.platforms,
    }));
  } catch (error) {
    // Last attempt, rethrow the error
    throw error;
  }
}
