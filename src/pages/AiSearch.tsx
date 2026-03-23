import {
  useIsRestoring,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { useLocation, useSearchParams } from "react-router";
import SearchBar from "../components/SearchBar";
import GameGrid from "../components/GameGrid";
import AiExplanation from "../components/AiExplanation";
import aiSearchIllustration from "../assets/ai-search.webp";
import noGames from "../assets/no-games.webp";
import { useSearch } from "../context/SearchContext";

export default function AiSearch() {
  const location = useLocation();
  const queryClient = useQueryClient();
  const isRestoring = useIsRestoring();
  const [searchParams, setSearchParams] = useSearchParams();
  const { fetchAiGames, setLastAiQuery } = useSearch();
  const [submittedQuery, setSubmittedQuery] = useState("");

  const query = searchParams.get("q") ?? "";
  // Why: restored prompt text should only auto-run when we already have cached data for the same AI query key.
  const aiQueryKey = ["games-ai", { searchTerm: query }] as const;
  const hasCachedAiResult = queryClient.getQueryData(aiQueryKey) !== undefined;
  const shouldRunAiSearch =
    !isRestoring &&
    query.length > 0 &&
    (hasCachedAiResult || submittedQuery === query);

  // Why: sync URL-backed q into context so toggling back to AI can restore the same query key and cached results.
  useEffect(() => {
    if (query) {
      setLastAiQuery(query);
    }
  }, [query, setLastAiQuery]);

  const commitQuery = useCallback(
    (value: string) => {
      const trimmed = value.trim();
      setSubmittedQuery(trimmed);
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (trimmed) next.set("q", trimmed);
          else next.delete("q");
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const { data, isPending, isFetching, isError, error } = useQuery({
    queryKey: aiQueryKey,
    queryFn: ({ signal }) =>
      fetchAiGames({ signal, query: { searchTerm: query } }),
    enabled: shouldRunAiSearch,
    retry: false,
    staleTime: Infinity,
  });

  const games = data?.games;
  const explanation = data?.explanation;
  const hasQuery = query.length > 0;
  // Why: after cache expiry we still restore the prompt text, but we force an explicit resend to protect rate limits.
  const needsSubmit = hasQuery && !hasCachedAiResult && submittedQuery !== query;

  return (
    <>
      <div className="m-auto md:max-w-2/3 lg:max-w-1/2 mb-8">
        <SearchBar
          committedQuery={query}
          onSubmit={commitQuery}
          showSubmitButton
          showRateLimit
          icon="sparkles"
          placeholder="'Cozy RPG on Game Boy'"
        />
      </div>

      {needsSubmit && (
        <p className="mb-6 text-center text-sm text-(--color-text-tertiary)">
          Press send to run this AI search.
        </p>
      )}

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
