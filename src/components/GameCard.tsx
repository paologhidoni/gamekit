import { Link } from "react-router";
import type { Game } from "../../types";
import GameBadges from "./GenreBadges";
import PlatformBadges from "./PlatformBadges";
import GameRating from "./GameRating";
import BgImage from "./BgImage";

interface GameCardProps {
  game: Game;
}

export default function GameCard({ game }: GameCardProps) {
  return (
    <Link
      to={`/games/${game.id}`}
      className="flex flex-col gap-4 p-4 bg-(--color-bg-secondary) rounded-2xl group border-y-2 border-y-(--color-accent-primary) hover:border-y-(--color-accent-secondary) transition-all transition-100 hover:scale-105"
    >
      <div className="flex flex-col justify-between">
        <div className="flex justify-between items-center gap-2">
          <h2 className="text-xl text-(--color-text-tertiary) font-bold mb-1 wrap-break-words">
            {game.name}
          </h2>

          <GameRating rating={game.rating} />
        </div>

        <PlatformBadges game={game} />
      </div>

      <div className="relative w-full h-64">
        <BgImage gameName={game.name} gameBgImage={game.background_image} />

        <GameBadges game={game} />
      </div>
    </Link>
  );
}
