import React from "react";
import type { Game } from "../types";

interface PlatformBadgesProps {
  game: Game;
}

function Badge({ platform }: { platform: Record<string, any> }) {
  return <span>{platform.platform.name}</span>;
}

function PlatformBadges({ game }: PlatformBadgesProps) {
  return (
    <ul className="flex text-xs gap-1 items-center flex-wrap font-bold">
      {game.platforms?.length > 0 &&
        game.platforms.map((platform, i) =>
          i !== 0 ? (
            <li key={platform.platform.name} className="flex gap-1">
              <span className="text-(--color-accent-primary)">&bull;</span>
              <Badge platform={platform} />
            </li>
          ) : (
            <li key={platform.platform.name}>
              <Badge platform={platform} />
            </li>
          )
        )}
    </ul>
  );
}

export default React.memo(PlatformBadges);
