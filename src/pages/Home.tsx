import { useQuery } from "@tanstack/react-query";
import { fetchGames } from "../util/http";
import type { Game } from "../types";
import GameCard from "../components/GameCard";
import { useState } from "react";
import SearchBar from "../components/SearchBar";

export default function Home() {
  const [query, setQuery] = useState("");

  const { data, isPending, isError, error } = useQuery({
    // The queryKey now includes the query state.
    // This ensures React Query caches different searches separately.
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

      {isPending && <p>Loading ....</p>}

      {isError && <p>Error: {error.message}</p>}

      <ul className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4">
        {data &&
          data.map((game: Game) => (
            <li key={game.id}>
              <GameCard game={game} />
            </li>
          ))}
      </ul>
    </>
  );
}
