import type { Game } from "../types";

/**
 * Transforms a single game object from the RAWG API into our desired format.
 * @param {Game} game - The game object from the API.
 * @returns {Game} - The transformed game object.
 */
export function transformGameData(game: Game): Game {
  return {
    id: game.id,
    name: game.name,
    released: game.released,
    background_image: game.background_image,
    genres: game.genres,
    rating: game.rating,
    platforms: game.platforms,
    description: game.description?.includes("Español")
      ? game.description.split("Español")[0].trim()
      : game.description,
  };
}
