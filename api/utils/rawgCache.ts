interface CacheData {
  platforms: Map<string, number>;
  genres: Map<string, number>;
  lastUpdated: number;
}

// The `cache.platforms` Map stores normalized platform names and their synonyms
// as keys, all pointing to the same RAWG API platform ID. For example, after
// initialization, it will hold data conceptually like this:
//
// 'playstation'   => 7
// 'ps1'           => 7
// 'psx'           => 7
// 'playstation 1' => 7
// 'playstation 2'   => 18
// 'ps2'           => 18
// ...etc.

// The `cache.genres` Map is similar, but for genres instead of platforms.

// lastUpdated holds its value because it's part of a module-level
// object that Node.js keeps in memory for the duration of a single server
// process. This module caching behavior effectively creates a singleton pattern,
// resulting in a simple, fast and efficient in-memory cache.
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
    const platformsData = await platformsRes.json();

    cache.platforms.clear();
    platformsData.results?.forEach((p: any) => {
      const normalized = normalize(p.name);
      cache.platforms.set(normalized, p.id);

      // Add synonyms
      PLATFORM_SYNONYMS[normalized]?.forEach((syn) => {
        cache.platforms.set(normalize(syn), p.id);
      });
    });

    // Fetch genres
    const genresRes = await fetch(
      `https://api.rawg.io/api/genres?key=${apiKey}`,
    );
    const genresData = await genresRes.json();

    cache.genres.clear();
    genresData.results?.forEach((g: any) => {
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
