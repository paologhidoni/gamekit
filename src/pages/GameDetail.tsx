import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router";
import { fetchGames } from "../util/http";
import GameDetailSidebar from "../components/GameDetailSidebar";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorElement from "../components/ErrorElement";

export default function GameDetail() {
  const { id } = useParams();

  const { data, isPending, isError, error } = useQuery({
    queryKey: ["singleGame", { id }],
    queryFn: ({ signal }) => fetchGames({ signal, query: { id } }),
    staleTime: 5000,
  });

  return (
    <>
      {isPending && <LoadingSpinner />}

      {isError && <ErrorElement errorMessage={error.message} />}

      {data && (
        <div className="grid gap-4 lg:grid-cols-[2fr_1fr] lg:auto-rows-fr">
          {/* HERO */}
          <section className="rounded-xl p-4 border-y-2 border-y-black min-h-[30vh] relative order-1lg:order-0">
            <div className="bg-black opacity-70 absolute z-50 rounded-r-xl p-4 bottom-4 left-0">
              <h1 className="text-3xl lg:text-6xl font-bold text-white wrap-break-words">
                {data[0].name}
              </h1>
            </div>

            <img
              src={data[0].background_image}
              alt={data[0].name}
              className="rounded-xl absolute w-full h-full object-cover object-top inset-0"
            />
          </section>

          {/* SIDEBAR */}
          <section className="bg-(--color-bg-secondary) rounded-xl order-3 lg:order-0 lg:row-span-2 border-b-2 border-b-(--color-accent-secondary)">
            <GameDetailSidebar game={data[0]} />
          </section>

          {/* DESCRIPTION */}
          <section className="bg-(--color-bg-secondary) rounded-xl p-6 border-y-2 border-y-(--color-accent-secondary) order-2 lg:order-0">
            <p
              dangerouslySetInnerHTML={{
                __html: data[0].description,
              }}
              className="leading-6.5"
            />
          </section>
        </div>
      )}
    </>
  );
}
