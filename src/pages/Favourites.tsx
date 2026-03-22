import { useQuery } from "@tanstack/react-query";
import type { Game } from "../schemas";
import GameCard from "../components/GameCard";
import LoadingSpinner from "../components/LoadingSpinner";
import noGames from "../assets/no-games.webp";
import ErrorElement from "../components/ErrorElement";
import { useSearch } from "../context/SearchContext";
import { useAuth } from "../hooks/useAuth";
import { useFavouriteGamesQuery } from "../hooks/useGameFavourites";
import { mapWithConcurrency } from "../util/mapWithConcurrency";

// Caps parallel /api/game calls; see mapWithConcurrency.ts.
const RAWG_CONCURRENCY = 5;

export default function Favourites() {
  const { user } = useAuth();
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

  const games = hydratedQuery.data;
  // Spinner while loading ids, or ids are loaded and games are still fetching.
  const loading =
    favouriteQuery.isPending || (rows.length > 0 && hydratedQuery.isPending);

  return (
    <>
      <h1 className="mb-8 text-3xl font-bold text-(--color-text-primary) text-center">
        Favourites
      </h1>

      {loading && <LoadingSpinner />}

      {favouriteQuery.isError && (
        <ErrorElement errorMessage={favouriteQuery.error.message} />
      )}

      {hydratedQuery.isError && (
        <ErrorElement errorMessage={hydratedQuery.error.message} />
      )}

      {/* Empty only after favourites query settled with zero rows and no errors. */}
      {!loading &&
        !favouriteQuery.isError &&
        !hydratedQuery.isError &&
        rows.length === 0 && (
          <div className="flex flex-col items-center gap-4">
            <h2 className="text-center text-2xl font-bold">
              No favourites yet <br />
              Add games from search or a game page
            </h2>
            <img src={noGames} alt="" className="w-50" />
          </div>
        )}

      {/* Grid mirrors Home: same card component and priority for above-the-fold images. */}
      {!loading && games && games.length > 0 && !hydratedQuery.isError && (
        <ul className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4">
          {games.map((game: Game, index: number) => (
            <li key={game.id}>
              <GameCard game={game} priority={index < 4} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
