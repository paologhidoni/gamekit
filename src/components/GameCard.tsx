import type { Game } from "../types";

interface GameCardProps {
  game: Game;
}

export default function GameCard({ game }: GameCardProps) {
  return (
    <div>
      <h2>{game.name}</h2>
    </div>
  );
}
