import { useQuery } from "@tanstack/react-query";
import { useLocation } from "react-router";
import type { Game } from "../schemas";
import noGames from "../assets/no-games.webp";
import { useSearch } from "../context/SearchContext";
import { useAuth } from "../hooks/useAuth";
import { useFavouriteGamesQuery } from "../hooks/useGameFavourites";
import { mapWithConcurrency } from "../util/mapWithConcurrency";
import GameGrid from "../components/GameGrid";

// Caps parallel /api/game calls; see mapWithConcurrency.ts.
const RAWG_CONCURRENCY = 5;

export default function Favourites() {
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();
  const { fetchGames } = useSearch();

  // Phase 1: Supabase rows (game_id + created_at). Order is newest first from the hook.
  const favouriteQuery = useFavouriteGamesQuery();
  const rows = favouriteQuery.data ?? [];

  // Phase 2: hydrate each id via RAWG through fetchGames. Separate query so list and API cache stay independent.
  const hydratedQuery = useQuery({
    queryKey: [
      "favouriteGames",
      "hydrated",
      user?.id,
      // Bust cache when ids change without relying on object reference equality.
      rows.map((r) => r.game_id).join(","),
    ],
    queryFn: async ({ signal }) => {
      const orderedIds = rows.map((r) => r.game_id);
      return mapWithConcurrency(orderedIds, RAWG_CONCURRENCY, async (id) => {
        return fetchGames({
          signal,
          query: { id: String(id) },
        }) as Promise<Game>;
      });
    },
    // Skip until we have ids; avoids running with stale rows after sign-out edge cases.
    enabled: Boolean(user && rows.length > 0),
    staleTime: 5000,
  });

  const loading =
    authLoading ||
    favouriteQuery.isPending ||
    (rows.length > 0 && hydratedQuery.isPending);

  const games = hydratedQuery.data;
  const errorMessage = favouriteQuery.isError
    ? favouriteQuery.error.message
    : hydratedQuery.isError
      ? hydratedQuery.error.message
      : null;

  return (
    <>
      <h1 className="mb-8 text-3xl font-bold text-(--color-text-primary) text-center">
        Favourites
      </h1>

      <GameGrid
        games={games}
        isLoading={loading}
        error={errorMessage}
        emptyImage={noGames}
        detailLinkState={{
          backTo: `${location.pathname}${location.search}`,
          backLabel: "Back to favourites",
        }}
        emptyMessage={
          <>
            No favourites yet <br />
            Add games from search or a game page
          </>
        }
      />
    </>
  );
}
