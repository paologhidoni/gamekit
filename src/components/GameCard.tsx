import { Link } from "react-router";
import type { Game } from "../schemas";
import GameBadges from "./GenreBadges";
import PlatformBadges from "./PlatformBadges";
import GameRating from "./GameRating";
import BgImage from "./BgImage";
import FavouriteButton from "./FavouriteButton";

interface GameDetailLinkState {
  backTo: string;
  backLabel: string;
}

interface GameCardProps {
  game: Game;
  priority?: boolean;
  detailLinkState?: GameDetailLinkState;
}

export default function GameCard({
  game,
  priority = false,
  detailLinkState,
}: GameCardProps) {
  return (
    <article className="flex flex-col gap-4 p-4 bg-(--color-bg-secondary) rounded-2xl group border-y-2 border-y-(--color-accent-primary) hover:border-y-(--color-accent-secondary) transition-all transition-100 hover:scale-105">
      <div className="flex flex-col justify-between">
        <div className="flex justify-between items-center gap-2">
          {/* Why: carry the results page location into GameDetail so the back link returns to the right list. */}
          <Link
            to={`/game/${game.id}`}
            state={detailLinkState}
            className="min-w-0 flex-1"
          >
            <h2 className="font-gonadaltes tracking-wider uppercase text-lg text-(--color-text-tertiary) font-bold mb-1 wrap-break-words">
              {game.name}
            </h2>
          </Link>

          <GameRating rating={game.rating} />
        </div>

        <PlatformBadges game={game} />
      </div>

      <div className="relative w-full h-64">
        <Link
          to={`/game/${game.id}`}
          state={detailLinkState}
          className="absolute inset-0 z-0 rounded-2xl"
          aria-label={`View ${game.name}`}
        />

        <BgImage
          gameName={game.name}
          gameBgImage={game.background_image}
          priority={priority}
        />

        <FavouriteButton
          gameId={game.id}
          gameName={game.name}
          className="absolute top-2 right-2 z-60"
        />

        <GameBadges game={game} />
      </div>
    </article>
  );
}
