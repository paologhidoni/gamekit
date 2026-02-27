import type { VercelRequest, VercelResponse } from "@vercel/node";
import { config } from "dotenv";
import { getRemainingRequests } from "./utils/rateLimiter.js";

config({ path: ".env.backend" });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const ip = (req.headers["x-forwarded-for"] as string) || "unknown";
    const remaining = await getRemainingRequests(ip);

    return res.status(200).json({ remaining });
  } catch (err) {
    console.error("Rate limit check error:", err);
    res.status(200).json({ remaining: 6 });
  }
}
