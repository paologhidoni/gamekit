import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router";
import type { Game } from "../types";
import { fetchGames } from "../util/http";

export default function GameDetail() {
  const { id } = useParams();

  const { data, isPending, isError, error } = useQuery({
    queryKey: ["singleGame", { id }],
    queryFn: ({ signal }) => fetchGames({ signal, query: { id } }),
    staleTime: 5000,
  });

  return (
    <>
      {isPending && <p>Loading ....</p>}

      {isError && <p>Error: {error.message}</p>}

      {data && (
        <>
          <h1>{(data[0] as Game).name}</h1>

          <img src={data[0].background_image} alt="" />
        </>
      )}
    </>
  );
}
