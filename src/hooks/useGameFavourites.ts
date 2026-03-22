import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
} from "@tanstack/react-query";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "./useAuth";

export type GameFavouriteRow = {
  game_id: number;
  created_at: string;
};

// Shared key so the list query and toggle mutation stay in sync when invalidating.
export function favouriteGamesListQueryKey(userId: string) {
  return ["favouriteGames", "list", userId] as const;
}

// Reads public.game_favourites; RLS restricts rows to the signed-in user.
export function useFavouriteGamesQuery() {
  const { user } = useAuth();
  const userId = user?.id;

  return useQuery({
    // Stable key while logged out so we never fetch without a user id.
    queryKey: userId
      ? favouriteGamesListQueryKey(userId)
      : ["favouriteGames", "list", "none"],
    queryFn: async (): Promise<GameFavouriteRow[]> => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("game_favourites")
        .select("game_id, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw new Error(error.message);
      return (data as GameFavouriteRow[]) ?? [];
    },
    enabled: !!userId,
  });
}

type ToggleVars = { gameId: number; nextFavourite: boolean };

type ToggleContext = { previous?: GameFavouriteRow[] };

// Optimistic cache update for instant UI; onError restores previous; onSettled refetches for truth.
export function useToggleFavouriteMutation(): UseMutationResult<
  void,
  Error,
  ToggleVars,
  ToggleContext
> {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.id;

  return useMutation<void, Error, ToggleVars, ToggleContext>({
    mutationFn: async ({ gameId, nextFavourite }) => {
      if (!userId) throw new Error("Not signed in");
      if (nextFavourite) {
        const { error } = await supabase.from("game_favourites").insert({
          user_id: userId,
          game_id: gameId,
        });
        if (error) throw new Error(error.message);
      } else {
        const { error } = await supabase
          .from("game_favourites")
          .delete()
          .eq("user_id", userId)
          .eq("game_id", gameId);
        if (error) throw new Error(error.message);
      }
    },
    onMutate: async ({ gameId, nextFavourite }): Promise<ToggleContext> => {
      if (!userId) return {};
      // Avoid clobbering optimistic data if a stale request finishes late.
      await queryClient.cancelQueries({
        queryKey: favouriteGamesListQueryKey(userId),
      });
      const previous = queryClient.getQueryData<GameFavouriteRow[]>(
        favouriteGamesListQueryKey(userId),
      );

      queryClient.setQueryData<GameFavouriteRow[]>(
        favouriteGamesListQueryKey(userId),
        (old) => {
          const list = old ?? [];
          if (nextFavourite) {
            const row: GameFavouriteRow = {
              game_id: gameId,
              created_at: new Date().toISOString(),
            };
            return [row, ...list.filter((r) => r.game_id !== gameId)];
          }
          return list.filter((r) => r.game_id !== gameId);
        },
      );

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (!userId) return;
      if (context?.previous !== undefined) {
        queryClient.setQueryData(
          favouriteGamesListQueryKey(userId),
          context.previous,
        );
      }
    },
    onSettled: () => {
      if (!userId) return;
      queryClient.invalidateQueries({
        queryKey: favouriteGamesListQueryKey(userId),
      });
    },
  });
}
