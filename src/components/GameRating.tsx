import { Star } from "lucide-react";

interface GameRatingProps {
  rating: number;
}

export default function GameRating({ rating }: GameRatingProps) {
  return (
    <span className="flex flex-col items-center">
      <span className="text-amber-500">
        <Star size={20} />
      </span>

      <span className="font-bold text-sm text-(--color-text-tertiary) italic">
        {rating}
      </span>
    </span>
  );
}
