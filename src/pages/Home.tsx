import { useQuery } from "@tanstack/react-query";
import { fetchGames } from "../util/http";
import type { Game } from "../types";
import GameCard from "../components/GameCard";

export default function Home() {
  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: ["games"],
    queryFn: fetchGames,
    staleTime: 5000,
    // gcTime: 1000,
  });

  if (isPending) {
    return <p>Loading ....</p>;
  }

  if (isError) {
    return <p>Error: {error.message}</p>;
  }

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
