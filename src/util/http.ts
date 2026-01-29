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
    params.set("id", encodeURIComponent(query.id));
  } else {
    url += "games?";
    if (query?.searchTerm)
      params.set("searchTerm", encodeURIComponent(query.searchTerm));
    if (query?.genre) params.set("genre", encodeURIComponent(query.genre));
    if (query?.platform)
      params.set("platform", encodeURIComponent(query.platform));
  }

  url += params.toString();

  try {
    const response = await fetch(url, { signal });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to fetch games.");
    }

    return query?.id ? data.game : data.games;
  } catch (error) {
    throw error;
  }
}
