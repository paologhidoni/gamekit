import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { config } from "dotenv";

config({ path: ".env.backend" });

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// 6 requests per 24 hours per IP
const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.fixedWindow(6, "1 d"),
  analytics: true,
  prefix: "gamekit:ratelimit",
});

export async function checkRateLimit(identifier: string) {
  const { success, limit, reset, remaining } = await ratelimit.limit(
    identifier,
  );

  return {
    success,
    limit,
    remaining,
    reset: new Date(reset),
  };
}
