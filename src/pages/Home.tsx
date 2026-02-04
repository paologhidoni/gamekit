import { QueryClient, useQuery } from "@tanstack/react-query";
import { fetchGames } from "../util/http";
import type { Game } from "../../types";
import GameCard from "../components/GameCard";
import { useState } from "react";
import SearchBar from "../components/SearchBar";
import LoadingSpinner from "../components/LoadingSpinner";
import noGames from "../assets/no-games.webp";
import ErrorElement from "../components/ErrorElement";
import { type LoaderFunctionArgs, useLoaderData } from "react-router";
import getCroppedImageUrl from "../util/image-url";

export const homeQuery = (searchTerm: string = "") => ({
  queryKey: ["games", { searchTerm }],
  queryFn: ({ signal }: { signal: AbortSignal }) =>
    fetchGames({ signal, query: { searchTerm } }),
  staleTime: 5000,
});

export const loader =
  (queryClient: QueryClient) =>
  async ({ request }: LoaderFunctionArgs) => {
    const url = new URL(request.url);
    const searchTerm = url.searchParams.get("search") || "";

    const data = await queryClient.ensureQueryData(homeQuery(searchTerm));

    // LCP Optimization: Preload the first game image (cropped 600x400)
    if (data && data.length > 0 && data[0].background_image) {
      const firstGameImage = getCroppedImageUrl(
        data[0].background_image,
        600,
        400
      );
      const link = document.createElement("link");
      link.rel = "preload";
      link.as = "image";
      link.href = firstGameImage;
      link.fetchPriority = "high";
      document.head.appendChild(link);
    }

    return { searchTerm };
  };

export default function Home() {
  const { searchTerm: initialSearchTerm } = useLoaderData() as {
    searchTerm: string;
  };
  const [query, setQuery] = useState(initialSearchTerm);

  const { data, isPending, isError, error } = useQuery(homeQuery(query));

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
