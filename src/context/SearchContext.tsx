import {
  createContext,
  useContext,
  useState,
  type ReactNode,
  useCallback,
} from "react";
import getCroppedImageUrl from "../util/image-url";

interface QueryType {
  id?: string;
  searchTerm?: string;
  genre?: string;
  platform?: string;
}

interface SearchContextType {
  isAiSearch: boolean;
  setIsAiSearch: (value: boolean) => void;
  fetchGames: (args: {
    signal: AbortSignal;
    query?: QueryType;
  }) => Promise<any>;
  fetchAiGames: (args: {
    signal: AbortSignal;
    query?: QueryType;
  }) => Promise<any>;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export function SearchContextProvider({ children }: { children: ReactNode }) {
  const [isAiSearch, setIsAiSearch] = useState(false);

  const fetchGames = useCallback(
    async ({ signal, query }: { signal: AbortSignal; query?: QueryType }) => {
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
        return data.games.map((game: any) => ({
          ...game,
          // Optimize for List View (Cards)
          background_image: getCroppedImageUrl(game.background_image, 600, 400),
        }));
      }
    },
    [],
  );

  const fetchAiGames = useCallback(
    async ({ signal, query }: { signal: AbortSignal; query?: QueryType }) => {
      const params = new URLSearchParams();
      let url = "/api/games?";

      if (query?.searchTerm) {
        params.set("searchTerm", query.searchTerm);
        params.set("isAiSearch", "true");
      }

      url += params.toString();

      const response = await fetch(url, { signal });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch games.");
      }

      return data.games.map((game: any) => ({
        ...game,
        background_image: getCroppedImageUrl(game.background_image, 600, 400),
      }));
    },
    [],
  );

  return (
    <SearchContext.Provider
      value={{ isAiSearch, setIsAiSearch, fetchGames, fetchAiGames }}
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
