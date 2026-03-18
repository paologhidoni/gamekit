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

export interface Theme {
  name: "light" | "dark";
}

/**
 * /api/ask-ai endpoint
 */
export interface AskAiRequest {
  gameName: string;
  question: string;
}

/**
 * /api/ask-ai endpoint response
 */
export interface AskAiResponse {
  answer?: string;
  error?: string;
  remaining?: number;
}
