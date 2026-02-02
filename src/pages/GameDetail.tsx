import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router";
import { fetchGames } from "../util/http";
import GameDetailSidebar from "../components/GameDetailSidebar";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorElement from "../components/ErrorElement";
import GameRating from "../components/GameRating";
import BgImage from "../components/BgImage";
import DOMPurify from "dompurify";

export default function GameDetail() {
  const { id } = useParams();

  const { data, isPending, isError, error } = useQuery({
    queryKey: ["singleGame", { id }],
    queryFn: ({ signal }) => fetchGames({ signal, query: { id } }),
    staleTime: 5000,
  });

  const description = data?.description
    ? DOMPurify.sanitize(data.description)
    : "";

  return (
    <>
      {isPending && <LoadingSpinner />}

      {isError && <ErrorElement errorMessage={error.message} />}

      {data && (
        <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
          {/* HERO */}
          <section className="rounded-2xl p-4 border-y-2 border-y-black min-h-[30vh] max-h-[50vh] relative order-1 lg:order-0">
            <div className="absolute z-50 top-0 right-0 py-2 px-4 bg-black opacity-70 rounded-bl-2xl rounded-tr-2xl">
              <GameRating rating={data.rating} />
            </div>

            <div className="absolute z-50 bottom-4 left-0 bg-black opacity-80 rounded-r-2xl p-4 md:pl-6">
              <h1 className="font-gonadaltes tracking-wider uppercase text-xl lg:text-2xl font-bold text-white wrap-break-words">
                {data.name}
              </h1>
            </div>

            <BgImage
              gameName={data.name}
              gameBgImage={data.background_image}
              extraClasses="object-top"
              priority={true}
            />
          </section>

          {/* SIDEBAR */}
          <section className="bg-(--color-bg-secondary) rounded-2xl order-3 lg:order-0 lg:row-span-2 border-b-2 border-b-(--color-accent-secondary)">
            <GameDetailSidebar game={data} />
          </section>

          {/* DESCRIPTION */}
          <section className="bg-(--color-bg-secondary) rounded-2xl py-6 px-4 md:px-6 border-y-2 border-y-(--color-accent-secondary) order-2 lg:order-0">
            <p
              dangerouslySetInnerHTML={{
                __html: description,
              }}
              className="leading-6.5"
            />
          </section>
        </div>
      )}
    </>
  );
}
