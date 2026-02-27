import { useQuery } from "@tanstack/react-query";
import type { Game } from "../../types";
import GameCard from "../components/GameCard";
import { useState } from "react";
import SearchBar from "../components/SearchBar";
import LoadingSpinner from "../components/LoadingSpinner";
import noGames from "../assets/no-games.webp";
import ErrorElement from "../components/ErrorElement";
import { useSearch } from "../context/SearchContext";
import AiExplanation from "../components/AiExplanation";

export default function Home() {
  const [query, setQuery] = useState("");
  const { isAiSearch, fetchGames, fetchAiGames } = useSearch();

  const { data, isPending, isError, error } = useQuery({
    queryKey: ["games", { searchTerm: query, isAiSearch }],
    queryFn: ({ signal }) =>
      isAiSearch
        ? fetchAiGames({ signal, query: { searchTerm: query } })
        : fetchGames({ signal, query: { searchTerm: query } }),
    staleTime: 5000,
    enabled: isAiSearch ? query.trim().length > 0 : true, // AI search requires query, regular search works without
  });

  // Handle AI search response structure
  const games = isAiSearch ? data?.games : data;
  const explanation = isAiSearch ? data?.explanation : null;

  return (
    <>
      <div className="m-auto md:max-w-2/3 lg:max-w-1/2 mb-8">
        <SearchBar onSearch={setQuery} />
      </div>

      {isPending && query.trim().length > 0 && <LoadingSpinner />}

      {isError && <ErrorElement errorMessage={error.message} />}

      {/* AI Explanation */}
      {isAiSearch && explanation && games && games.length > 0 && (
        <AiExplanation explanation={explanation} gameCount={games.length} />
      )}

      {/* No Results */}
      {!isPending && games && games.length === 0 && (
        <div className="flex flex-col gap-4 items-center">
          <h1 className="text-2xl font-bold text-center">
            No games found <br />
            Search again
          </h1>
          <img src={noGames} alt="No games found" className="w-50" />
        </div>
      )}

      {/* Game Grid */}
      <ul className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4">
        {games &&
          games.map((game: Game, index: number) => (
            <li key={game.id}>
              <GameCard game={game} priority={index < 4} />
            </li>
          ))}
      </ul>
    </>
  );
}
