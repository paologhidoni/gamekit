import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";
import { useLocation, useSearchParams } from "react-router";
import SearchBar from "../components/SearchBar";
import GameGrid from "../components/GameGrid";
import AiExplanation from "../components/AiExplanation";
import aiSearchIllustration from "../assets/ai-search.webp";
import noGames from "../assets/no-games.webp";
import { useSearch } from "../context/SearchContext";

export default function AiSearch() {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { fetchAiGames, setLastAiQuery } = useSearch();

  const query = searchParams.get("q") ?? "";

  // Keep the last committed AI query available across route changes.
  useEffect(() => {
    if (query) {
      setLastAiQuery(query);
    }
  }, [query, setLastAiQuery]);

  const commitQuery = useCallback(
    (value: string) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (value) next.set("q", value);
          else next.delete("q");
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const { data, isPending, isFetching, isError, error } = useQuery({
    queryKey: ["games-ai", { searchTerm: query }],
    queryFn: ({ signal }) =>
      fetchAiGames({ signal, query: { searchTerm: query } }),
    enabled: query.length > 0,
    retry: false,
    staleTime: Infinity,
  });

  const games = data?.games;
  const explanation = data?.explanation;
  const hasQuery = query.length > 0;

  return (
    <>
      <div className="m-auto md:max-w-2/3 lg:max-w-1/2 mb-8">
        <SearchBar
          committedQuery={query}
          onSubmit={commitQuery}
          showSubmitButton
          showRateLimit
          icon="sparkles"
          placeholder="'cozy RPG on Game Boy'"
        />
      </div>

      {explanation && games && games.length > 0 && (
        <AiExplanation explanation={explanation} gameCount={games.length} />
      )}

      {!hasQuery && (
        <div className="flex flex-col items-center gap-4">
          <h1 className="text-2xl font-bold text-center">
            Use ✨ AI to search for games
            <br />
            Your results will appear here!
          </h1>
          <img
            src={aiSearchIllustration}
            alt="Illustration: AI game search"
            className="w-110"
          />
        </div>
      )}

      {hasQuery && (
        <GameGrid
          games={games}
          isLoading={isPending && isFetching}
          error={isError ? error.message : null}
          emptyImage={noGames}
          detailLinkState={{
            backTo: `${location.pathname}${location.search}`,
            backLabel: "Back to AI results",
          }}
          emptyMessage={
            <>
              No games found <br />
              Try a different prompt
            </>
          }
        />
      )}
    </>
  );
}
