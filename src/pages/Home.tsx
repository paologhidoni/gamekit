import { useQuery } from "@tanstack/react-query";
import { fetchGames } from "../util/http";
import type { Game } from "../../types";
import GameCard from "../components/GameCard";
import { useState } from "react";
import SearchBar from "../components/SearchBar";
import LoadingSpinner from "../components/LoadingSpinner";
import noGames from "../assets/no-games.webp";
import ErrorElement from "../components/ErrorElement";

export default function Home() {
  const [query, setQuery] = useState("");

  const { data, isPending, isError, error } = useQuery({
    // The queryKey now includes the query state.
    // This ensures React Query caches different searches separately.

    // TODO: Implement platform & genre queries
    queryKey: ["games", { searchTerm: query }],
    queryFn: ({ signal }) =>
      fetchGames({ signal, query: { searchTerm: query } }),
    staleTime: 5000,
  });

  return (
    <>
      <div className="m-auto md:max-w-2/3 lg:max-w-1/2 mb-8">
        <SearchBar onSearch={setQuery} />
      </div>

      {isPending && <LoadingSpinner />}

      {isError && <ErrorElement errorMessage={error.message} />}

      {!data ||
        (data.length === 0 && (
          <div className="flex flex-col gap-4 items-center">
            <h1 className="text-2xl font-bold text-center">
              No games found <br />
              Search again
            </h1>
            <img src={noGames} alt="No games found" className="w-50" />
          </div>
        ))}

      <ul className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4">
        {data &&
          data.map((game: Game, index: number) => (
            <li key={game.id}>
              <GameCard game={game} priority={index < 4} />
            </li>
          ))}
      </ul>
    </>
  );
}
