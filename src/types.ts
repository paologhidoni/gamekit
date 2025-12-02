export interface Game {
  id: string;
  name: string;
  description?: string;
  released?: string;
  background_image: string;
  genres: Record<string, any>[];
  rating: number;
  platforms: Record<string, any>[];
}

export interface Theme {
  name: "light" | "dark";
}
