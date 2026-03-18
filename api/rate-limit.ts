import type { VercelRequest, VercelResponse } from "@vercel/node";
import { config } from "dotenv";
import { Redis } from "@upstash/redis";
import { getRemainingRequests } from "../src/server/utils/rateLimiter.js";

config({ path: ".env.backend" });

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "GET") {
    try {
      const ip = (req.headers["x-forwarded-for"] as string) || "unknown";
      const remaining = await getRemainingRequests(ip);
      return res.status(200).json({ remaining });
    } catch (err) {
      console.error("Rate limit check error:", err);
      return res.status(200).json({ remaining: 6 });
    }
  }

  if (req.method === "POST") {
    try {
      // Disable reset in production (Vercel sets VERCEL_ENV automatically)
      if (process.env.VERCEL_ENV === "production") {
        return res.status(404).json({ error: "Not found" });
      }

      const { secret } = req.query;

      // Secret key protection (add to .env.backend: ADMIN_SECRET=your_secret_here)
      if (typeof secret !== "string" || secret !== process.env.ADMIN_SECRET) {
        return res.status(403).json({ error: "Forbidden" });
      }

      const ip = (req.headers["x-forwarded-for"] as string) || "unknown";
      const keys = await redis.keys(`gamekit:ratelimit:${ip}*`);

      if (keys.length > 0) {
        await redis.del(...keys);
      }

      const remaining = await getRemainingRequests(ip);
      return res.status(200).json({
        message: "Rate limit reset",
        ip,
        remaining,
      });
    } catch (err) {
      console.error("Reset limit error:", err);
      return res.status(500).json({ error: "Failed to reset limit" });
    }
  }

  return res.status(405).json({ error: "Method Not Allowed" });
}

