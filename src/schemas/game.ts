/* eslint-disable @typescript-eslint/no-explicit-any -- RAWG API nested objects */
export interface Game {
  id: number;
  name: string;
  genres: Record<string, any>[];
  rating: number;
  platforms: Record<string, any>[];
  description: string | null;
  released: string | null;
  background_image: string;
  metacritic: number | null;
  developers: Record<string, any>[];
  tags?: Record<string, any>[];
  multiplayer: Record<string, any>[];
}
