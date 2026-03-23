/* eslint-disable react-refresh/only-export-components -- useSearch is intentionally coupled to SearchContextProvider */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import getCroppedImageUrl from "../util/image-url";
import * as z from "zod";
import { useAuth } from "../hooks/useAuth";
import type { Game } from "../schemas";
import {
  askAiErrorResponseSchema,
  askAiSuccessResponseSchema,
  type AskAiAboutGameResult,
  type AskAiRequest,
} from "../schemas";
import {
  clearSessionState,
  readSessionState,
  updateSessionState,
} from "../util/sessionDB";

interface QueryType {
  id?: string;
  searchTerm?: string;
  genre?: string;
  platform?: string;
}

interface SearchContextType {
  lastClassicQuery: string;
  setLastClassicQuery: (value: string) => void;
  lastAiQuery: string;
  setLastAiQuery: (value: string) => void;
  remainingAiRequests: number;
  setRemainingAiRequests: (value: number) => void;
  resetRateLimit: () => Promise<void>;
  fetchGames: (args: {
    signal: AbortSignal;
    query?: QueryType;
  }) => Promise<Game | Game[]>;
  fetchAiGames: (args: {
    signal: AbortSignal;
    query?: QueryType;
  }) => Promise<AiSearchGamesResult>;
  askAiAboutGame: (args: AskAiRequest) => Promise<AskAiAboutGameResult>;
}

type AiSearchGamesResult = {
  explanation: string;
  games: Game[];
  remaining: number;
  metadata?: unknown;
};

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export function SearchContextProvider({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const previousUserIdRef = useRef<string | null>(null);
  const [hydratedIdentity, setHydratedIdentity] = useState<string | null>(null);
  // Why: classic search restores its own committed ?q when switching back from AI.
  const [lastClassicQuery, setLastClassicQuery] = useState("");
  // Why: TanStack Query caches by search term but cannot infer which term to show if the URL lost ?q (e.g. logo → home).
  const [lastAiQuery, setLastAiQuery] = useState("");
  const [remainingAiRequests, setRemainingAiRequests] = useState(6);
  const identity = user?.id ?? "guest";

  useEffect(() => {
    if (loading) return;

    // Why: switch the in-memory workspace when auth identity changes, and drop the logged-out user's stored session.
    const previousUserId = previousUserIdRef.current;
    if (previousUserId && !user?.id) {
      clearSessionState(previousUserId);
    }

    const persisted = readSessionState(identity);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrating context state from sessionStorage on identity changes is intentional.
    setLastClassicQuery(persisted.search.lastClassicQuery);
    setLastAiQuery(persisted.search.lastAiQuery);
    setHydratedIdentity(identity);
    previousUserIdRef.current = user?.id ?? null;
  }, [identity, loading, user?.id]);

  useEffect(() => {
    if (loading || hydratedIdentity !== identity) return;

    // Why: search bars mutate context first, so persist both workspaces after the current identity has hydrated.
    updateSessionState(identity, (current) => ({
      ...current,
      search: {
        lastClassicQuery,
        lastAiQuery,
      },
    }));
  }, [hydratedIdentity, identity, lastAiQuery, lastClassicQuery, loading]);

  // Fetch initial rate limit status on mount
  useEffect(() => {
    const getRateLimitStatus = async () => {
      try {
        const res = await fetch("/api/rate-limit");
        if (res.ok) {
          const data = await res.json();
          setRemainingAiRequests(data.remaining);
        }
      } catch {
        // Silently fail, keep default of 6
      }
    };

    getRateLimitStatus();
  }, []);

  const fetchGames = useCallback(
    async ({
      signal,
      query,
    }: {
      signal: AbortSignal;
      query?: QueryType;
    }): Promise<Game | Game[]> => {
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

      const response = await fetch(url, { signal });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch games.");
      }

      if (query?.id) {
        return data.game;
      } else {
        return data.games.map((game: Game) => ({
          ...game,
          // Optimize for List View (Cards)
          background_image: getCroppedImageUrl(game.background_image, 600, 400),
        }));
      }
    },
    [],
  );

  /**
   * take a user's search term, send it to the /api/ai-search endpoint
   * and then format the response to display data on the UI.
   */
  const fetchAiGames = useCallback(
    async ({
      signal,
      query,
    }: {
      signal: AbortSignal;
      query?: QueryType;
    }): Promise<AiSearchGamesResult> => {
      if (!query?.searchTerm) {
        throw new Error("Search term required for AI search");
      }

      const params = new URLSearchParams({ query: query.searchTerm });
      const response = await fetch(`/api/ai-search?${params}`, { signal });
      const data = await response.json();

      // Update remaining requests from response (works for both success and error)
      if (data.remaining !== undefined) {
        setRemainingAiRequests(data.remaining);
      }

      if (!response.ok) {
        throw new Error(data.error || "AI search failed");
      }

      return {
        explanation: data.explanation,
        games: data.games.map((game: Game) => ({
          ...game,
          background_image: getCroppedImageUrl(
            game.background_image,
            600,
            400,
          ),
        })),
        remaining: data.remaining,
        metadata: data.metadata,
      };
    },
    [setRemainingAiRequests],
  );

  const askAiAboutGame = useCallback(
    async ({
      gameName,
      question,
      prevResId,
    }: AskAiRequest): Promise<AskAiAboutGameResult> => {
      const fallback = {
        answer:
          "Something went wrong while asking the AI. Please try again later.",
      };

      try {
        const response = await fetch("/api/ask-ai", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            gameName,
            question,
            prevResId: prevResId ?? undefined,
          }),
        });

        const raw: unknown = await response.json();

        if (response.ok) {
          const parsed = askAiSuccessResponseSchema.safeParse(raw);
          if (!parsed.success) {
            console.error(
              "Ask AI: invalid success JSON",
              z.flattenError(parsed.error),
            );
            return fallback;
          }
          const body = parsed.data;
          if (body.remaining !== undefined) {
            setRemainingAiRequests(body.remaining);
          }
          return {
            answer: body.answer,
            ...(body.id ? { id: body.id } : {}),
          };
        }

        const errParsed = askAiErrorResponseSchema.safeParse(raw);
        if (!errParsed.success) {
          console.error(
            "Ask AI API error:",
            response.statusText,
            z.flattenError(errParsed.error),
          );
          return fallback;
        }
        const errBody = errParsed.data;
        if (errBody.remaining !== undefined) {
          setRemainingAiRequests(errBody.remaining);
        }
        console.error("Ask AI API error:", errBody.error);
        return fallback;
      } catch (err) {
        // Network/parsing errors
        console.error("Ask AI request failed:", err);
        return fallback;
      }
    },
    [setRemainingAiRequests],
  );

  /**
   * Only used in development, reset
   */
  const resetRateLimit = useCallback(async () => {
    const secret = import.meta.env.VITE_ADMIN_SECRET;
    if (!secret) return;

    try {
      const res = await fetch(
        `/api/rate-limit?secret=${encodeURIComponent(secret)}`,
        { method: "POST" },
      );
      if (res.ok) {
        alert("Rate limit reset! Refresh the page.");
        window.location.reload();
      } else {
        alert("Invalid secret");
      }
    } catch {
      alert("Reset failed");
    }
  }, []);

  return (
    <SearchContext.Provider
      value={{
        lastClassicQuery,
        setLastClassicQuery,
        lastAiQuery,
        setLastAiQuery,
        remainingAiRequests,
        setRemainingAiRequests,
        resetRateLimit,
        fetchGames,
        fetchAiGames,
        askAiAboutGame,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error("useSearch must be used within a SearchContextProvider");
  }
  return context;
}
