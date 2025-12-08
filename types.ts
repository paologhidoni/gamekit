export interface Game {
  id: string;
  name: string;
  genres: Record<string, any>[];
  rating: number;
  platforms: Record<string, any>[];
  description: string | null;
  released: string | null;
  background_image: string;
  metacritic: string | null;
  developers: Record<string, any>[];
  tags?: Record<string, any>[];
  multiplayer: Record<string, any>[];
}

export interface Theme {
  name: "light" | "dark";
}
