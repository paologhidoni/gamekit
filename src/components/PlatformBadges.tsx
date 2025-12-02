import React from "react";
import type { Game } from "../types";
import {
  SeparatorHorizontal,
  SeparatorVertical,
  LucideSeparatorVertical,
} from "lucide-react";

interface PlatformBadgesProps {
  game: Game;
}

function Badge({
  game,
  platform,
}: {
  game: Game;
  platform: Record<string, any>;
}) {
  return (
    <li key={`${game.name}-platform-${platform.platform.name}`}>
      <span>{platform.platform.name}</span>
    </li>
  );
}

function PlatformBadges({ game }: PlatformBadgesProps) {
  return (
    <ul className="flex text-xs gap-1 items-center flex-wrap font-bold">
      {game.platforms?.length > 0 &&
        game.platforms.map((platform, i) =>
          i !== 0 ? (
            <span className="flex gap-1">
              <span className="text-(--color-accent-primary)">&bull;</span>
              <Badge game={game} platform={platform} />
            </span>
          ) : (
            <Badge game={game} platform={platform} />
          )
        )}
    </ul>
  );
}

export default React.memo(PlatformBadges);
