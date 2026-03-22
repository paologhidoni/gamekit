import { Heart } from "lucide-react";
import { useNavigate } from "react-router";
import { useAuth } from "../hooks/useAuth";
import {
  useFavouriteGamesQuery,
  useToggleFavouriteMutation,
} from "../hooks/useGameFavourites";
import { useToast } from "../context/ToastContext";

interface FavouriteButtonProps {
  gameId: number;
  gameName: string;
  className?: string;
}

export default function FavouriteButton({
  gameId,
  gameName,
  className = "",
}: FavouriteButtonProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const { data: rows = [] } = useFavouriteGamesQuery();
  const { mutate, isPending, variables } = useToggleFavouriteMutation();

  const isFavourite = rows.some((r) => r.game_id === gameId);
  const busy = Boolean(user && isPending && variables?.gameId === gameId);

  const label = isFavourite
    ? `Remove ${gameName} from favourites`
    : `Add ${gameName} to favourites`;

  return (
    <button
      type="button"
      disabled={busy}
      aria-pressed={isFavourite}
      aria-busy={busy}
      aria-label={label}
      title={label}
      onClick={() => {
        if (!user) {
          showToast("Sign in to save favourites");
          navigate("/auth?mode=login");
          return;
        }
        mutate({ gameId, nextFavourite: !isFavourite });
      }}
      className={`cursor-pointer rounded-full bg-black/55 p-2 text-white shadow-md backdrop-blur-sm transition-colors hover:bg-black/70 focus-visible:ring-2 focus-visible:ring-(--color-accent-secondary) focus-visible:outline-none disabled:cursor-wait disabled:opacity-70 ${className}`}
    >
      <Heart
        size={22}
        strokeWidth={isFavourite ? 0 : 2}
        className={
          isFavourite
            ? "fill-red-500 text-red-500"
            : "fill-transparent text-white drop-shadow-sm"
        }
      />
    </button>
  );
}
