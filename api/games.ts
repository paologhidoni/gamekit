import type { VercelRequest, VercelResponse } from "@vercel/node";
// import { requireAuth } from "./utils/auth.js";
import { transformGameData } from "./utils/transformGameData.js";
import { config } from "dotenv";

config({ path: ".env.backend" });

const RAWG_KEY = process.env.RAWG_API_KEY;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // const user = await requireAuth(req, res);

    // if (!user) return; // exit if unauthorized
    if (!RAWG_KEY) throw new Error("Missing RAWG_KEY environment variable");

    // Call RAWG API safely
    const { searchTerm, genre, platform } = req.query;

    // By default show the last 30 days most popular games
    const today = new Date();
    const lastMonth = new Date();
    lastMonth.setDate(today.getDate() - 30);

    // Format YYYY-MM-DD
    const todayStr = today.toISOString().split("T")[0];
    const lastMonthStr = lastMonth.toISOString().split("T")[0];

    const params = new URLSearchParams();
    params.set("key", RAWG_KEY);
    params.set("dates", `${lastMonthStr},${todayStr}`);
    params.set("ordering", "-added");
    params.set("page_size", "40");

    // Only add filters if they exist
    if (genre) params.set("genres", String(genre));
    if (platform) params.set("platforms", String(platform));
    // If user enters a search term, we want to see all games, not filtered by dates or popularity
    if (searchTerm) {
      params.delete("dates");
      params.delete("ordering");
      params.set("search", encodeURIComponent(String(searchTerm)));
    }

    // https://api.rawg.io/api/games?key=YOUR_KEY&genres=action
    const url = `https://api.rawg.io/api/games?${params.toString()}`;

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      const errorMessage = data?.detail || "RAWG API error";
      return res.status(response.status).json({ error: errorMessage });
    }

    // RAWG responses (success or error) come in JSON format, they use "detail" to describe errors.
    if (data.detail) {
      return res.status(400).json({ error: data.detail });
    }

    const processedData = data.results.map(transformGameData);

    res.status(200).json({ games: processedData });
  } catch (err) {
    console.error(err);
    const message =
      err instanceof Error ? err.message : "Unexpected server error";
    res.status(500).json({ error: message });
  }
}
