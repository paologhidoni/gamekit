interface CacheData {
  platforms: Map<string, number>;
  genres: Map<string, number>;
  lastUpdated: number;
}

// The `cache.platforms` Map stores normalized platform names and their synonyms
// as keys, all pointing to the same RAWG API platform ID.
const cache: CacheData = {
  platforms: new Map(),
  genres: new Map(),
  lastUpdated: 0,
};

const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

const PLATFORM_SYNONYMS: Record<string, string[]> = {
  "pc engine": ["turbografx-16", "tg16", "turbografx"],
  genesis: ["mega drive", "sega genesis", "sega mega drive"],
  snes: [
    "super nintendo",
    "super famicom",
    "super nintendo entertainment system",
  ],
  nes: ["nintendo entertainment system", "famicom"],
  playstation: ["ps1", "psx", "playstation 1"],
  "playstation 2": ["ps2"],
  "playstation 3": ["ps3"],
  "playstation 4": ["ps4"],
  "playstation 5": ["ps5"],
  "nintendo 64": ["n64"],
  "game boy advance": ["gba", "gameboy advance"],
  "game boy": ["gameboy", "gb"],
  "xbox 360": ["x360"],
  "xbox one": ["xone"],
  "xbox series x/s": ["xbox series x", "series x"],
};

function normalize(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, "");
}

export async function initializeCache(): Promise<void> {
  const now = Date.now();
  if (cache.lastUpdated && now - cache.lastUpdated < CACHE_TTL) {
    return; // Cache still valid
  }

  const apiKey = process.env.RAWG_API_KEY;
  if (!apiKey) throw new Error("RAWG_API_KEY not found");

  try {
    // Fetch platforms
    const platformsRes = await fetch(
      `https://api.rawg.io/api/platforms?key=${apiKey}`,
    );
    const platformsData: {
      results?: Array<{ name?: unknown; id?: unknown }>;
    } = await platformsRes.json();

    cache.platforms.clear();
    platformsData.results?.forEach((p) => {
      if (typeof p.name !== "string" || typeof p.id !== "number") return;
      const normalized = normalize(p.name);
      const platformId: number = p.id;
      cache.platforms.set(normalized, platformId);

      // Add synonyms
      PLATFORM_SYNONYMS[normalized]?.forEach((syn) => {
        cache.platforms.set(normalize(syn), platformId);
      });
    });

    // Fetch genres
    const genresRes = await fetch(
      `https://api.rawg.io/api/genres?key=${apiKey}`,
    );
    const genresData: {
      results?: Array<{ name?: unknown; id?: unknown }>;
    } = await genresRes.json();

    cache.genres.clear();
    genresData.results?.forEach((g) => {
      if (typeof g.name !== "string" || typeof g.id !== "number") return;
      cache.genres.set(normalize(g.name), g.id);
    });

    cache.lastUpdated = now;
  } catch (err) {
    console.error("Failed to initialize RAWG cache:", err);
    throw err;
  }
}

export function getPlatformId(name: string): number | null {
  return cache.platforms.get(normalize(name)) || null;
}

export function getGenreId(name: string): number | null {
  return cache.genres.get(normalize(name)) || null;
}

