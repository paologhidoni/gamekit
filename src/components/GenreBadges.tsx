import React from "react";
import type { Game } from "../../types";

interface GameBadgesProps {
  game: Game;
}

function GenreBadges({ game }: GameBadgesProps) {
  return (
    <ul className="flex flex-wrap gap-1 mb-2 absolute bottom-2 left-2 z-50 rounded-2xl p-1">
      {game.genres?.length > 0 &&
        game.genres.map((genre, i) => (
          <li
            key={`${game.name}-genre-${i}`}
            className="text-sm py-1.5 px-3 bg-(--color-bg-primary) opacity-85 rounded-2xl border-2 border-(--color-text-tertiary)"
          >
            {genre.name}
          </li>
        ))}
    </ul>
  );
}

export default React.memo(GenreBadges);
