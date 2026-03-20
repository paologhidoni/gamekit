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
 * /api/ask-ai endpoint request
 */
export interface AskAiRequest {
  gameName: string;
  question: string;
  prevResId?: string | null;
}

/**
 * /api/ask-ai endpoint response
 */
export interface AskAiResponse {
  answer?: string;
  error?: string;
  remaining?: number;
  id?: string;
}

/** Return value of askAiAboutGame: always a string answer; optional response id for follow-ups. */
export type AskAiAboutGameResult = Required<Pick<AskAiResponse, "answer">> &
  Pick<AskAiResponse, "id">;
