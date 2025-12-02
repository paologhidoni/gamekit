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
      <h1>Home</h1>

      <ul>
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
