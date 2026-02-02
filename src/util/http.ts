import getCroppedImageUrl from "./image-url";

interface QueryType {
  id?: string;
  searchTerm?: string;
  genre?: string;
  platform?: string;
}

export async function fetchGames({
  signal,
  query,
}: {
  signal: AbortSignal;
  query?: QueryType;
}) {
  const params = new URLSearchParams();
  let url = "/api/";

  // This either fetches an individual game by ID or an array of games by filter values
  if (query?.id) {
    url += "game?";
    params.set("id", query.id);
  } else {
    url += "games?";
    if (query?.searchTerm) params.set("searchTerm", query.searchTerm);
    if (query?.genre) params.set("genre", query.genre);
    if (query?.platform) params.set("platform", query.platform);
  }

  url += params.toString();

  try {
    const response = await fetch(url, { signal });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to fetch games.");
    }

    if (query?.id) {
      return data.game;
    } else {
      return data.games.map((game: any) => ({
        ...game,
        // Optimize for List View (Cards)
        background_image: getCroppedImageUrl(game.background_image, 600, 400),
      }));
    }
  } catch (error) {
    throw error;
  }
}
