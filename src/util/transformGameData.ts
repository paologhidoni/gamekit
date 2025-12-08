import type { Game } from "../../types";

/**
 * Transforms a single game object from the RAWG API into our desired format.
 * @param {Game} game - The game object from the API.
 * @returns {Game} - The transformed game object.
 */
export function transformGameData(game: Game): Game {
  return {
    id: game.id,
    name: game.name,
    released: game.released || null,
    background_image: game.background_image,
    genres: game.genres,
    rating: game.rating,
    platforms: game.platforms,
    description: game.description?.includes("Español")
      ? game.description.split("Español")[0].trim()
      : game.description,
    metacritic: game.metacritic || null,
    developers: game.developers || [],
    tags: game.tags || [],
    multiplayer: game.tags
      ? game.tags.filter((tag) =>
          [
            "Singleplayer",
            "Co-op",
            "Local Co-Op",
            "Online Co-Op",
            "Co-operative",
            "Coop",
          ].includes(tag.name)
        )
      : [],
  };
}
