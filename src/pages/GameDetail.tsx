import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router";
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
        <div className="grid gap-4 md:grid-cols-[2fr_1fr] md:auto-rows-fr">
          {/* HERO */}
          <section className="rounded-xl p-4 order-1 min-h-[30vh] relative md:order-0">
            <div className="bg-black opacity-65 absolute z-50 rounded-r-xl p-4 bottom-4 left-0">
              <h1 className="text-3xl md:text-6xl font-bold text-white">
                {data[0].name}
              </h1>
            </div>

            <img
              src={data[0].background_image}
              alt=""
              className="rounded-xl absolute w-full h-full object-cover inset-0"
            />
          </section>

          {/* SIDEBAR */}
          <section className="bg-(--color-bg-secondary) rounded-xl p-6 order-2 md:order-0 md:row-span-2">
            Section 3
          </section>

          {/* DESCRIPTION */}
          <section className="bg-(--color-bg-secondary) rounded-xl p-6 order-3 md:order-0">
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
