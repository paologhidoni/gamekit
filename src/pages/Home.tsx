import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";
import { useLocation, useSearchParams } from "react-router";
import SearchBar from "../components/SearchBar";
import GameGrid from "../components/GameGrid";
import noGames from "../assets/no-games.webp";
import { useSearch } from "../context/SearchContext";

export default function Home() {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { fetchGames, setLastClassicQuery } = useSearch();

  const query = searchParams.get("q") ?? "";

  // Why: sync URL-backed q into context so switching back from AI restores the last classic results.
  useEffect(() => {
    setLastClassicQuery(query);
  }, [query, setLastClassicQuery]);

  const commitQuery = useCallback(
    (value: string) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          const trimmed = value.trim();
          // Don't update the URL if the search value is effectively the same, so that we don't get the undesired space trimming while user is typing.
          if (trimmed === query) return next;
          if (trimmed) next.set("q", trimmed);
          else next.delete("q");
          return next;
        },
        { replace: true },
      );
    },
    [query, setSearchParams],
  );

  const {
    data: games,
    isPending,
    isFetching,
    isError,
    error,
  } = useQuery({
    queryKey: ["games", { searchTerm: query }],
    queryFn: async ({ signal }) => {
      const result = await fetchGames({
        signal,
        query: { searchTerm: query },
      });
      return Array.isArray(result) ? result : [];
    },
    staleTime: 5000,
  });

  return (
    <>
      <div className="m-auto md:max-w-2/3 lg:max-w-1/2 mb-8">
        <SearchBar
          committedQuery={query}
          onDebouncedChange={commitQuery}
          placeholder="Search games by title..."
        />
      </div>

      <GameGrid
        games={games}
        isLoading={isPending && isFetching}
        error={isError ? error.message : null}
        emptyImage={noGames}
        detailLinkState={{
          backTo: `${location.pathname}${location.search}`,
          backLabel: "Back to results",
        }}
        emptyMessage={
          <>
            No games found <br />
            Search again
          </>
        }
      />
    </>
  );
}
