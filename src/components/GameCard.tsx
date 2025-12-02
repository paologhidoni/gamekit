import { Link } from "react-router";
import type { Game } from "../types";
import GameBadges from "./GameBadges";
import { Star } from "lucide-react";

interface GameCardProps {
  game: Game;
}

export default function GameCard({ game }: GameCardProps) {
  return (
    <Link
      to={`/games/${game.id}`}
      className="flex flex-col gap-2 p-4 bg-(--color-bg-secondary) rounded-2xl shadow-[0_0_0_1px_var(--color-text-tertiary)] hover:shadow-[0_0_0_6px_var(--color-text-tertiary)] transition-all transition-100 hover:scale-105"
    >
      <div className="flex justify-between items-center gap-2">
        <h2 className="text-xl text-(--color-text-tertiary) font-bold">
          {game.name}
        </h2>

        <span className="flex flex-col items-center pb-2">
          <span className="text-amber-500">
            <Star size={20} />
          </span>

          <span className="font-bold text-sm text-(--color-text-tertiary) italic">
            {game.rating}
          </span>
        </span>
      </div>

      <div className="relative w-full h-64">
        <GameBadges game={game} />

        <img
          src={game.background_image}
          alt={game.name}
          className="absolute inset-0 h-full w-full object-cover rounded-2xl"
        />
      </div>
    </Link>
  );
}
