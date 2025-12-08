import type { VercelRequest, VercelResponse } from "@vercel/node";
import { config } from "dotenv";
import { transformGameData } from "./utils/transformGameData.js";

config({ path: ".env.backend" });

const RAWG_API_KEY = process.env.RAWG_API_KEY;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (!RAWG_API_KEY)
      throw new Error("Missing RAWG_API_KEY environment variable");

    const { id } = req.query;
    if (!id) return res.status(400).json({ error: "Game ID not provided" });

    const url = `https://api.rawg.io/api/games/${encodeURIComponent(
      String(id)
    )}?key=${RAWG_API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      const errorMessage = data?.detail || "RAWG API error";
      return res.status(response.status).json({ error: errorMessage });
    }

    const transformedData = transformGameData(data);

    res.status(200).json({ game: transformedData });
  } catch (err) {
    console.error(err);
    const message =
      err instanceof Error ? err.message : "Unexpected server error";
    res.status(500).json({ error: message });
  }
}
