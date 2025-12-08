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
  // Build query params to send to backend
  const params = new URLSearchParams();

  if (query?.searchTerm) params.set("search", query.searchTerm);
  if (query?.genre) params.set("genre", query.genre);
  if (query?.platform) params.set("platform", query.platform);
  if (query?.id) params.set("id", query.id);

  const url = `/api/games?${params.toString()}`;

  try {
    const response = await fetch(url, { signal });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to fetch games.");
    }

    return data.games;
  } catch (error) {
    throw error;
  }
}
