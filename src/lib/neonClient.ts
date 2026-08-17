import { createClient, SupabaseAuthAdapter } from "@neondatabase/neon-js";
import { createAuthClient } from "@neondatabase/neon-js/auth";
import { BetterAuthVanillaAdapter } from "@neondatabase/neon-js/auth/vanilla/adapters";

export const neonAuthUrl = import.meta.env.VITE_NEON_AUTH_URL;
export const neonDataApiUrl = import.meta.env.VITE_NEON_DATA_API_URL;

// Supabase-compatible client for auth + Data API queries
export const neon = createClient({
  auth: {
    adapter: SupabaseAuthAdapter(),
    url: neonAuthUrl,
  },
  dataApi: {
    url: neonDataApiUrl,
  },
});

// Better Auth API for password flows not exposed on SupabaseAuthAdapter
export const neonAuthApi = createAuthClient(neonAuthUrl, {
  adapter: BetterAuthVanillaAdapter(),
});
