import type { ReactNode } from "react";
import type { Game } from "../schemas";
import GameCard from "./GameCard";
import LoadingSpinner from "./LoadingSpinner";
import ErrorElement from "./ErrorElement";

interface GameDetailLinkState {
  backTo: string;
  backLabel: string;
}

interface GameGridProps {
  games: Game[] | undefined;
  isLoading: boolean;
  error: string | null;
  emptyImage: string;
  emptyMessage: ReactNode;
  detailLinkState?: GameDetailLinkState;
}

export default function GameGrid({
  games,
  isLoading,
  error,
  emptyImage,
  emptyMessage,
  detailLinkState,
}: GameGridProps) {
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorElement errorMessage={error} />;

  if (games && games.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4">
        <h2 className="text-center text-2xl font-bold">{emptyMessage}</h2>
        <img src={emptyImage} alt="" className="w-50" />
      </div>
    );
  }

  if (!games) return null;

  return (
    <ul className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4">
      {games.map((game, index) => (
        <li key={game.id}>
          <GameCard
            game={game}
            priority={index < 4}
            detailLinkState={detailLinkState}
          />
        </li>
      ))}
    </ul>
  );
}
