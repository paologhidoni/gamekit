import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import type { VercelRequest, VercelResponse } from "@vercel/node";
config({ path: ".env.backend" });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Validate environment variables at startup.
if (!SUPABASE_URL) throw new Error("Missing SUPABASE_URL environment variable");
if (!SUPABASE_SERVICE_ROLE_KEY)
  throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY environment variable");

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

export async function requireAuth(req: VercelRequest, res: VercelResponse) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.replace("Bearer ", "");

  if (!token) {
    res.status(401).json({ error: "Authorization token not provided" });
    return null;
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user) {
    res.status(401).json({ error: "Invalid or expired token" });
    return null;
  }

  return user;
}
