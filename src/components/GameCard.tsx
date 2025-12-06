import { Link } from "react-router";
import type { Game } from "../types";
import GameBadges from "./GenreBadges";
import { Star } from "lucide-react";
import PlatformBadges from "./PlatformBadges";

interface GameCardProps {
  game: Game;
}

export default function GameCard({ game }: GameCardProps) {
  return (
    <Link
      to={`/games/${game.id}`}
      className="flex flex-col gap-4 p-4 bg-(--color-bg-secondary) rounded-2xl group hover:border-y-2 border-y-(--color-accent-secondary) transition-all transition-100 hover:scale-105"
    >
      <div className="flex flex-col justify-between">
        <div className="flex justify-between items-center gap-2">
          <h2 className="text-xl text-(--color-text-tertiary) font-bold mb-1 wrap-break-words">
            {game.name}
          </h2>

          <span className="flex flex-col items-center">
            <span className="text-amber-500">
              <Star size={20} />
            </span>

            <span className="font-bold text-sm text-(--color-text-tertiary) italic">
              {game.rating}
            </span>
          </span>
        </div>

        <PlatformBadges game={game} />
      </div>

      <div className="relative w-full h-64">
        <img
          src={game.background_image}
          alt={game.name}
          className="absolute inset-0 h-full w-full object-cover rounded-2xl group-hover:scale-105 transition-all transition-100"
        />

        <GameBadges game={game} />
      </div>
    </Link>
  );
}
