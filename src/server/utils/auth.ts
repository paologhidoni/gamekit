import { config } from "dotenv";
import { createRemoteJWKSet, jwtVerify } from "jose";
import type { VercelRequest, VercelResponse } from "@vercel/node";

config({ path: ".env.backend" });

const NEON_AUTH_URL = process.env.NEON_AUTH_URL;

if (!NEON_AUTH_URL) {
  throw new Error("Missing NEON_AUTH_URL environment variable");
}

const jwksUrl = new URL("/jwks", NEON_AUTH_URL);
const jwks = createRemoteJWKSet(jwksUrl);

export type AuthenticatedUser = {
  id: string;
  email?: string;
};

export async function requireAuth(
  req: VercelRequest,
  res: VercelResponse,
): Promise<AuthenticatedUser | null> {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.replace("Bearer ", "");

  if (!token) {
    res.status(401).json({ error: "Authorization token not provided" });
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, jwks);
    const userId = payload.sub;

    if (!userId || typeof userId !== "string") {
      res.status(401).json({ error: "Invalid or expired token" });
      return null;
    }

    return {
      id: userId,
      email: typeof payload.email === "string" ? payload.email : undefined,
    };
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
    return null;
  }
}
