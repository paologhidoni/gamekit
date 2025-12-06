import type { Game } from "../types";
import SectionLabel from "./SectionLabel";

interface GameDetailSidebarProps {
  game: Game;
}

export default function GameDetailSidebar({ game }: GameDetailSidebarProps) {
  return (
    <div className="flex flex-col gap-4 pb-6">
      {/* RELEASE DATE */}
      {game.released && (
        <section>
          <SectionLabel text="RELEASED" />
          <p className="p-4">
            {new Date(game.released).toLocaleDateString("en-UK", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </section>
      )}

      {/* GENRES */}
      {game.genres.length > 0 && (
        <section>
          <SectionLabel text="GENRES" />
          <p className="p-4">{game.genres.map((tag) => tag.name).join(", ")}</p>
        </section>
      )}

      {/* PLATFORMS */}
      {game.platforms.length > 0 && (
        <section>
          <SectionLabel text="PLATFORMS" />
          <p className="p-4">
            {game.platforms
              .map((platform) => platform.platform.name)
              .join(", ")}
          </p>
        </section>
      )}

      {/* MULTIPLAYER */}
      {game.multiplayer.length > 0 && (
        <section>
          <SectionLabel text="MULTIPLAYER" />
          <p className="p-4">
            {game.multiplayer.map((tag) => tag.name).join(", ")}
          </p>
        </section>
      )}

      {/* DEVELOPERS */}
      {game.developers.length > 0 && (
        <section>
          <SectionLabel text="DEVELOPED BY" />
          <p className="p-4">
            {game.developers?.map((dev) => dev.name).join(", ")}
          </p>
        </section>
      )}
    </div>
  );
}
