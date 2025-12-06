import type { Game } from "../types";
import SectionLabel from "./SectionLabel";

interface GameDetailSidebarProps {
  game: Game;
}

export default function GameDetailSidebar({ game }: GameDetailSidebarProps) {
  return (
    <div className="flex flex-col gap-4 pb-6">
      {/* RELEASE DATE */}
      <section>
        <SectionLabel text="RELEASED" />
        <p className="p-4">
          {game.released &&
            new Date(game.released).toLocaleDateString("en-UK", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
        </p>
      </section>

      {/* GENRES */}
      <section>
        <SectionLabel text="GENRES" />
        <p className="p-4">{game.genres.map((tag) => tag.name).join(", ")}</p>
      </section>

      {/* Multiplayer */}
      <section>
        <SectionLabel text="MULTIPLAYER" />
        <p className="p-4">
          {game.multiplayer.map((tag) => tag.name).join(", ")}
        </p>
      </section>

      {/* DEVELOPERS */}
      <section>
        <SectionLabel text="DEVELOPED BY" />
        <p className="p-4">
          {game.developers?.map((dev) => dev.name).join(", ")}
        </p>
      </section>
    </div>
  );
}
