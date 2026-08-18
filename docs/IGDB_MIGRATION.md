# Migrate GameKit from RAWG to IGDB

**Tracking:** Create a GitHub issue from this doc (e.g. “Migrate game data from RAWG to IGDB”) and link your PR to it.

**Why this exists:** RAWG (`api.rawg.io`) has been unreliable or fully down. GameKit’s browse, search, game detail, favourites hydration, and AI search validation all depend on a game metadata API. **IGDB** (Internet Game Database, owned by Twitch) is the closest drop-in replacement in terms of catalog size and feature coverage.

**What this guide is:** A lesson-style ticket split into two sections:

| Section | Owner | When |
|--------|--------|------|
| **Section 1** | **You (Paolo)** | Do first — credentials, legal check, env vars, backup |
| **Section 2** | **Agent** | After Section 1 is done — code migration, tests, deploy |

Do **not** start Section 2 until Section 1 is complete and you’ve confirmed IGDB returns data with your credentials.

---

## Official documentation (bookmark these)

Use these as the source of truth while migrating. Prefer IGDB docs over blog posts or outdated tutorials.

### IGDB API (`api-docs.igdb.com`)

| Topic | Link | When you need it |
|-------|------|------------------|
| **Getting started** | [Getting Started](https://api-docs.igdb.com/#getting-started) | Overview, account setup, first request |
| Account creation | [Account Creation](https://api-docs.igdb.com/#account-creation) | Twitch app + 2FA checklist (Section 1.2) |
| Authentication | [Authentication](https://api-docs.igdb.com/#authentication) | Client credentials token flow |
| Requests | [Requests](https://api-docs.igdb.com/#requests) | POST format, headers, base URL `https://api.igdb.com/v4` |
| Rate limits | [Rate Limits](https://api-docs.igdb.com/#rate-limits) | 4 req/s, 8 concurrent, 429 handling |
| Examples | [Examples](https://api-docs.igdb.com/#examples) | Copy-paste Apicalypse queries |
| Endpoints index | [Endpoints](https://api-docs.igdb.com/#endpoints) | Full list of `/v4/{endpoint}` resources |
| **Game** | [Game](https://api-docs.igdb.com/#game) | Search, filters, fields for browse/detail |
| **Platform** | [Platform](https://api-docs.igdb.com/#platform) | Platform ID cache (`igdbCache.ts`) |
| **Genre** | [Genre](https://api-docs.igdb.com/#genre) | Genre ID cache |
| **Cover** | [Cover](https://api-docs.igdb.com/#cover) | `cover.image_id` for artwork |
| **Search** (reference) | [Search](https://api-docs.igdb.com/#search) | `search "…";` syntax |
| **Images** (reference) | [Images](https://api-docs.igdb.com/#images) | Building `images.igdb.com` URLs |
| **Fields** (reference) | [Fields](https://api-docs.igdb.com/#fields) | Which fields to request in `fields …` |
| **Filters** (reference) | [Filters](https://api-docs.igdb.com/#filters) | `where` clauses |
| **Sorting** (reference) | [Sorting](https://api-docs.igdb.com/#sorting) | `sort popularity desc` etc. |
| **Pagination** (reference) | [Pagination](https://api-docs.igdb.com/#pagination) | `limit` / `offset` |
| **APICalypse** (reference) | [APICalypse](https://api-docs.igdb.com/#apic-alypse) | Query language grammar |
| CORS / browser | [CORS Proxy](https://api-docs.igdb.com/#cors-proxy) | Why IGDB must be called server-side only |
| Partnership / commercial | [Partnership](https://api-docs.igdb.com/#partnership) | Commercial licensing, data dumps |
| FAQ | [FAQ](https://api-docs.igdb.com/#faq) | Business + technical questions |
| Support | [Support](https://api-docs.igdb.com/#support) | When stuck after reading docs |

### Twitch (auth for IGDB)

| Topic | Link | When you need it |
|-------|------|------------------|
| Developer console | [Twitch Developer Console](https://dev.twitch.tv/console/apps) | Register app, Client ID/Secret |
| Authentication overview | [Twitch Authentication](https://dev.twitch.tv/docs/authentication/) | How Twitch OAuth fits IGDB |
| Client credentials flow | [Client Credentials Grant](https://dev.twitch.tv/docs/authentication/getting-tokens-oauth/#client-credentials-grant-flow) | `POST id.twitch.tv/oauth2/token` (Section 1.3) |
| Developer agreement | [Twitch Developer Services Agreement](https://dev.twitch.tv/docs/terms) | Non-commercial vs commercial terms |

### IGDB product pages

| Topic | Link |
|-------|------|
| IGDB API landing | [igdb.com/api](https://www.igdb.com/api) |
| IGDB website (attribution) | [igdb.com](https://www.igdb.com/) |
| Commercial / partnership email | [partner@igdb.com](mailto:partner@igdb.com) |

### Why server-side only

IGDB blocks direct browser calls (CORS). GameKit already proxies game data through Vercel `/api/*` routes — keep it that way. See [CORS Proxy](https://api-docs.igdb.com/#cors-proxy).

---

## How GameKit uses game data today (RAWG)

Understanding the current wiring helps you see what must change.

### Request flow (simplified)

```
Browser
  │
  ├─ GET /api/games?searchTerm=…     ──► RAWG /api/games
  ├─ GET /api/game?id=…              ──► RAWG /api/games/{id}
  ├─ GET /api/ai-search?query=…      ──► OpenAI → validate each candidate on RAWG → optional RAWG fallback
  │
  └─ Favourites page
        │
        ├─ Neon Data API: game_favourites (stores game_id integers)
        └─ For each id: GET /api/game?id=…  ──► RAWG (hydrate title, cover, etc.)
```

### Internal `Game` shape (app contract)

The frontend expects this shape (from `src/schemas/game.ts`), produced by `transformGameData()`:

| Field | Used for |
|-------|----------|
| `id` | Routes (`/game/:id`), favourites FK, React Query keys |
| `name` | Cards, detail hero, AI copy |
| `background_image` | Card + hero images |
| `rating` | Stars (RAWG uses 0–5) |
| `released` | Sidebar, sorting |
| `genres`, `platforms` | Sidebar, filters |
| `description` | Detail page (HTML from RAWG → sanitized) |
| `metacritic`, `developers`, `tags`, `multiplayer` | Sidebar / tags |

**Goal of migration:** Keep this `Game` interface stable so React components change as little as possible. Only the **server adapter** and **transform layer** swap from RAWG → IGDB.

### Files that talk to RAWG today

| File | Role |
|------|------|
| `api/games.ts` | List/search games (home browse + search) |
| `api/game.ts` | Single game by ID |
| `api/ai-search.ts` | AI search orchestration + RAWG fallback |
| `src/server/utils/rawgCache.ts` | Platform/genre name → RAWG ID maps |
| `src/server/utils/gameValidator.ts` | Validates AI candidates against RAWG search |
| `src/util/transformGameData.ts` | RAWG JSON → `Game` |
| `src/pages/Favourites.tsx` | Hydrates many IDs via `/api/game` |
| `index.html` | `preconnect` to `media.rawg.io` |
| `src/components/Footer.tsx` | RAWG attribution link |

### Environment variables (today)

| Variable | Where |
|----------|--------|
| `RAWG_API_KEY` | `.env.backend`, Vercel server env |

### The favourites ID problem (read this before migrating)

Neon table `game_favourites` stores:

```sql
(user_id uuid, game_id integer, ...)
```

Those integers are **RAWG game IDs**. IGDB uses **different numeric IDs** for the same titles.

Example: *The Legend of Zelda: Breath of the Wild* has one ID on RAWG and another on IGDB.

**Implication:** After switching APIs, existing favourite rows will point at the wrong games (or 404) unless we:

1. **Remap** RAWG id → IGDB id (one-off script, match by title + optional year), or
2. **Add a `provider` column** and only trust rows where `provider = 'igdb'`, or
3. **Accept data loss** and ask users to re-favourite (worst UX).

**Recommended approach (Section 2):** Add `provider text not null default 'igdb'`, run a one-time remap script while RAWG is still reachable *or* use IGDB search-by-title for each stored id’s hydrated name if you cached names. If RAWG is dead, remap uses IGDB search only (good enough for ~77 rows).

---

## IGDB vs RAWG (mental model)

| Topic | RAWG | IGDB |
|-------|------|------|
| Style | REST GET + query params | **POST** to `https://api.igdb.com/v4/{endpoint}` with **Apicalypse** body |
| Auth | `?key=` query param | Twitch OAuth2 **client credentials** → Bearer token |
| Token TTL | N/A (key never expires) | ~**60 days** (refresh server-side; cache in memory per serverless instance) |
| Rate limit | Generous (when up) | **4 requests/second**, max **8 concurrent** |
| Search | `?search=mario` | Body: `search "mario"; fields …; limit 40;` |
| Cover art | Full URL in response | `cover.image_id` → build URL: `https://images.igdb.com/igdb/image/upload/t_cover_big/{image_id}.jpg` |
| Rating | `rating` 0–5 | `aggregated_rating` 0–100 (or `rating`) — **must normalize** to 0–5 for UI |
| Description | HTML string | `summary` plain text — update `RichTextRenderer` usage or wrap in `<p>` |
| Release date | `released` ISO date | `first_release_date` Unix timestamp |
| Commercial use | API ToS | **Free for non-commercial** under [Twitch Developer Services Agreement](https://dev.twitch.tv/docs/terms); commercial → [Partnership](https://api-docs.igdb.com/#partnership) / [partner@igdb.com](mailto:partner@igdb.com) |

**Docs:** [Getting Started](https://api-docs.igdb.com/#getting-started) · [Authentication](https://api-docs.igdb.com/#authentication) · [Requests](https://api-docs.igdb.com/#requests) · [Rate Limits](https://api-docs.igdb.com/#rate-limits) · [Examples](https://api-docs.igdb.com/#examples)

---

# Section 1 — Your tasks (complete first)

Work through these in order. Check each box before handing off to the agent.

## 1.1 Confirm your use case is allowed (5 min)

1. Read [IGDB API overview](https://www.igdb.com/api) and [Getting Started](https://api-docs.igdb.com/#getting-started).
2. Skim [Partnership](https://api-docs.igdb.com/#partnership) and [FAQ → Business](https://api-docs.igdb.com/#faq) if your app might be commercial.
3. Decide:
   - **Portfolio / hobby / non-commercial demo** → free tier is appropriate ([Twitch Developer Services Agreement](https://dev.twitch.tv/docs/terms)).
   - **Monetized product, ads, or commercial SaaS** → email [partner@igdb.com](mailto:partner@igdb.com) before migrating.
4. If unsure, treat GameKit as **non-commercial** (personal portfolio) unless that changes.

**Done when:** You’re confident you can use IGDB under the applicable terms.

---

## 1.2 Create a Twitch developer application (15 min)

IGDB auth goes through Twitch. Follow [Account Creation](https://api-docs.igdb.com/#account-creation) and [Authentication](https://api-docs.igdb.com/#authentication).

1. Sign in at the [Twitch Developer Console](https://dev.twitch.tv/console/apps) (use your Twitch account).
2. Enable **two-factor authentication** on the account (required per [Getting Started](https://api-docs.igdb.com/#getting-started)).
3. Go to **Register Your Application** ([console](https://dev.twitch.tv/console/apps/create)).
4. Fill in:
   - **Name:** `GameKit` (or similar)
   - **OAuth Redirect URL:** `http://localhost` (IGDB uses client-credentials only; Twitch still requires a redirect URL — `localhost` is fine per [Authentication](https://api-docs.igdb.com/#authentication))
   - **Category:** choose what fits (e.g. “Website Integration”)
   - **Client type:** **Confidential** (so you get a **Client Secret**)
5. Create the app.
6. Open the app → **Manage** → **New Secret** → copy the secret immediately.
7. Copy **Client ID** from the same page.

**Store safely (password manager):**

```
TWITCH_CLIENT_ID=...
TWITCH_CLIENT_SECRET=...
```

**Done when:** You have Client ID + Client Secret and 2FA enabled.

---

## 1.3 Verify IGDB works from your machine (10 min)

Mirrors the [Authentication](https://api-docs.igdb.com/#authentication) and [Requests](https://api-docs.igdb.com/#requests) examples. Token flow is also documented in [Twitch Client Credentials](https://dev.twitch.tv/docs/authentication/getting-tokens-oauth/#client-credentials-grant-flow).

Use curl (replace placeholders):

```bash
# 1) Get access token
curl -s -X POST "https://id.twitch.tv/oauth2/token" \
  -d "client_id=YOUR_CLIENT_ID" \
  -d "client_secret=YOUR_CLIENT_SECRET" \
  -d "grant_type=client_credentials" \
  | jq .

# Copy access_token from response

# 2) Search games
curl -s -X POST "https://api.igdb.com/v4/games" \
  -H "Client-ID: YOUR_CLIENT_ID" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Accept: application/json" \
  -d 'search "super mario"; fields id,name,summary,first_release_date,cover.image_id,aggregated_rating; limit 3;' \
  | jq .
```

**Expected:** JSON array of games with `id`, `name`, etc.

**If you get 401:** Wrong client id/secret or expired token — see [Authentication](https://api-docs.igdb.com/#authentication).  
**If you get 429:** Rate limit — see [Rate Limits](https://api-docs.igdb.com/#rate-limits); wait 1 second and retry.

**Done when:** Search returns at least one Mario game.

---

## 1.4 Set local environment variables (5 min)

Add to **`.env.backend`** (server-only secrets):

```env
TWITCH_CLIENT_ID=your_client_id_here
TWITCH_CLIENT_SECRET=your_client_secret_here
```

Keep `RAWG_API_KEY` for now — useful for favourites remap until cutover.

Do **not** put Twitch secret in `.env` (frontend). Vite would expose it.

**Done when:** `.env.backend` has both Twitch vars.

---

## 1.5 Set Vercel environment variables (5 min)

In [Vercel Project → Settings → Environment Variables](https://vercel.com/), add for **Production** (and Preview if you use preview deploys):

| Name | Value | Notes |
|------|--------|--------|
| `TWITCH_CLIENT_ID` | (from Twitch console) | Server only |
| `TWITCH_CLIENT_SECRET` | (from Twitch console) | Server only, encrypted |

**After cutover** (not yet): remove `RAWG_API_KEY`.

**Done when:** Vercel shows both vars for Production.

---

## 1.6 Backup favourites (optional but recommended) (5 min)

While you still have data in Neon:

```bash
# From project root, with DATABASE_URL in .env.backend
psql "$DATABASE_URL" -c "copy (select user_id, game_id, created_at from public.game_favourites order by created_at) to stdout csv header" > favourites-backup-$(date +%F).csv
```

Or export from Neon SQL Editor.

**Done when:** You have a CSV of `(user_id, game_id, created_at)` — RAWG ids.

---

## 1.7 Attribution prep (2 min)

IGDB requires attribution. Plan to show in the footer (agent will implement):

- Link: [IGDB.com](https://www.igdb.com/)
- Text similar to: “Game data provided by IGDB”

Remove RAWG footer link after cutover.

**Done when:** You’ve noted this for the PR review.

---

## 1.8 Handoff checklist for the agent

Reply to the agent (or comment on the GitHub issue) with:

```
Section 1 complete.

- [ ] Twitch app created, 2FA on
- [ ] curl search test passed
- [ ] TWITCH_CLIENT_ID + TWITCH_CLIENT_SECRET in .env.backend
- [ ] Same vars added on Vercel (Production)
- [ ] Non-commercial use confirmed (or: commercial — waiting on IGDB)
- [ ] favourites backup saved (optional): yes/no
```

**Agent starts Section 2 only after this message.**

---

# Section 2 — Agent implementation (after Section 1)

This section is the engineering playbook. Follow in order; each step builds on the previous.

## 2.0 Architecture target

```
┌─────────────────────────────────────────────────────────────┐
│  React app (unchanged Game interface)                        │
│  fetchGames / fetchAiGames → /api/*                          │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│  Vercel API routes                                           │
│  api/games.ts  api/game.ts  api/ai-search.ts                 │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│  NEW: src/server/igdb/                                       │
│  ├─ igdbClient.ts      token + POST helper + rate limit      │
│  ├─ igdbQueries.ts     Apicalypse query builders             │
│  ├─ igdbTransform.ts   IGDB record → Game                    │
│  └─ igdbCache.ts       platform/genre maps (replaces rawg)   │
└───────────────────────────┬─────────────────────────────────┘
                            │
                    https://api.igdb.com/v4/*
                    https://id.twitch.tv/oauth2/token
```

**Design principle:** One IGDB client module. API routes stay thin. `transformGameData` becomes a thin wrapper or alias to `igdbTransform.toGame()`.

---

## 2.1 Add IGDB client (`src/server/igdb/igdbClient.ts`)

**Lesson — why a dedicated client:** IGDB is not “fetch with a key in the URL.” Every call needs a fresh Bearer token (cached until `expires_in`) and two headers. Centralizing this avoids duplicating auth in `games.ts`, `game.ts`, and `gameValidator.ts`.

**Read first:** [Authentication](https://api-docs.igdb.com/#authentication), [Requests](https://api-docs.igdb.com/#requests), [Rate Limits](https://api-docs.igdb.com/#rate-limits).

**Implement:**

1. Read `TWITCH_CLIENT_ID` and `TWITCH_CLIENT_SECRET` from env (throw at module load if missing, same pattern as `RAWG_API_KEY` today).
2. **Token cache** (module-level):
   ```ts
   let cachedToken: { value: string; expiresAt: number } | null = null;
   ```
3. `getAccessToken()`:
   - Return cached token if `Date.now() < expiresAt - 60_000` (1 min skew).
   - Else `POST https://id.twitch.tv/oauth2/token` with `client_credentials` ([Twitch docs](https://dev.twitch.tv/docs/authentication/getting-tokens-oauth/#client-credentials-grant-flow)).
   - Store `access_token` and `expires_in` ([Authentication](https://api-docs.igdb.com/#authentication)).
4. `igdbFetch(endpoint: string, body: string)`:
   - `POST https://api.igdb.com/v4/${endpoint}` ([Requests](https://api-docs.igdb.com/#requests))
   - Headers: `Client-ID`, `Authorization: Bearer …`, `Content-Type: text/plain`, `Accept: application/json`
   - Body: raw Apicalypse string
   - On **429**: wait 250ms, retry once ([Rate Limits](https://api-docs.igdb.com/#rate-limits)).
   - On non-JSON response: throw clear error (same idea as current RAWG HTML guard).

**Test manually:** Temporary script or vitest that calls `igdbFetch('games', 'fields name; limit 1;')`.

---

## 2.2 Query builders (`src/server/igdb/igdbQueries.ts`)

Map current RAWG behaviors to Apicalypse. **Reference:** [Examples](https://api-docs.igdb.com/#examples), [Game](https://api-docs.igdb.com/#game), [Search](https://api-docs.igdb.com/#search), [Filters](https://api-docs.igdb.com/#filters), [Sorting](https://api-docs.igdb.com/#sorting).

### Fields to request (reuse everywhere)

```
fields id,name,summary,first_release_date,cover.image_id,aggregated_rating,genres.name,platforms.platform.name,involved_companies.company.name,involved_companies.developer;
```

Adjust after inspecting IGDB responses — see [Game](https://api-docs.igdb.com/#game) and [Fields](https://api-docs.igdb.com/#fields) (e.g. add `total_rating` if needed).

### Home browse (no search term) — replaces `api/games.ts` default

RAWG today: last 30 days by `-added`.

IGDB equivalent (example):

```
fields …;
where first_release_date > ${thirtyDaysAgoUnix};
sort popularity desc;
limit 40;
```

If “popularity” is sparse, fallback: `sort first_release_date desc; limit 40;`

### Text search — `searchTerm` query param

```
search "${escapedTerm}";
fields …;
limit 40;
```

Escape double quotes in user input to avoid breaking Apicalypse.

### Filter by genre + platform

Use cache IDs from `igdbCache.ts`:

```
where genres = (${genreId}) & platforms = (${platformId});
fields …;
limit 40;
```

### Single game by ID — `api/game.ts`

```
fields …;
where id = ${id};
limit 1;
```

### Batch by IDs — favourites hydration optimization

Instead of 77 sequential `/api/game` calls, add optional batch route or extend `api/game` to accept `?ids=1,2,3`:

```
where id = (${id1},${id2},…);
fields …;
limit 500;
```

Cap batch size (e.g. 100) to respect payload limits.

---

## 2.3 Transform layer (`src/server/igdb/igdbTransform.ts`)

**Lesson — adapter pattern:** IGDB’s JSON shape ≠ RAWG’s. The UI must not care. Transform once.

**Reference:** [Cover](https://api-docs.igdb.com/#cover), [Images](https://api-docs.igdb.com/#images), [Game](https://api-docs.igdb.com/#game) (rating fields).

| IGDB | → `Game` field |
|------|----------------|
| `id` | `id` |
| `name` | `name` |
| `cover.image_id` | `background_image` via `https://images.igdb.com/igdb/image/upload/t_cover_big/${image_id}.jpg` |
| `aggregated_rating` or `total_rating` | `rating` as **value / 20** (100 → 5.0) or `/ 10` depending on field — **verify in spike** |
| `first_release_date` | `released` as `YYYY-MM-DD` from Unix |
| `summary` | `description` — plain text; wrap for renderer or treat as text |
| `genres[].name` | `genres: [{ name }]` |
| `platforms[].platform.name` | `platforms: [{ platform: { name } }]` (match RAWG nesting for sidebar) |
| `involved_companies` where `developer` | `developers: [{ name }]` |
| — | `metacritic: null` unless IGDB exposes it |
| — | `tags` / `multiplayer` — derive from IGDB `game_modes` / `themes` if available, else `[]` |

Update `src/util/transformGameData.ts` to call `igdbTransform.toGame` or replace its body.

Update `RichTextRenderer` comment: descriptions may be plain text now — sanitize still applies if you wrap in `<p>`.

---

## 2.4 Replace `rawgCache.ts` → `igdbCache.ts`

**Reference:** [Platform](https://api-docs.igdb.com/#platform), [Genre](https://api-docs.igdb.com/#genre).

1. Rename conceptually: `initializeCache()` fetches:
   - `POST /v4/platforms` with `fields id,name; limit 500;` ([Platform](https://api-docs.igdb.com/#platform))
   - `POST /v4/genres` with `fields id,name; limit 500;` ([Genre](https://api-docs.igdb.com/#genre))
2. Keep `PLATFORM_SYNONYMS` map — still valuable for “Game Boy” / “GB” / AI vocabulary.
3. Export `getPlatformId(name)` / `getGenreId(name)` with same signatures so `gameValidator.ts` changes minimally.

TTL: keep 24h in-memory cache per serverless instance.

---

## 2.5 Update API routes

### `api/games.ts`

- Remove `RAWG_API_KEY` and `api.rawg.io` fetch.
- Call `igdbQueries.searchGames({ searchTerm, genre, platform })` → `igdbTransform.toGame` on each row.
- Keep existing error JSON shape: `{ games: Game[] }` or `{ error: string }`.
- Keep non-JSON upstream guard (IGDB should always return JSON; still defensive).

### `api/game.ts`

- IGDB fetch by id.
- Response: `{ game: Game }`.

### `api/ai-search.ts`

- Replace `rawgCache` imports with `igdbCache`.
- `validateCandidates` / `validateBatch`: search IGDB instead of RAWG (`search "candidate.name"` + platform filter).
- Genre match: compare IGDB genre ids from cache.
- `fallbackSearch`: IGDB structured query (same as `api/games` filters).
- Update comments referencing RAWG.

### `src/server/utils/gameValidator.ts`

- Swap fetch URL for `igdbClient` + query builder.
- Rename log strings “RAWG” → “IGDB”.
- `ValidatedGame` type can stay RAWG-shaped internally until transform — or align with `Game`.

### `src/server/utils/nameNormalizer.ts`

- Rename params `rawgName` → `candidateName` (optional cleanup).

### `src/server/utils/openaiClient.ts`

- Update comments only (still game-related; platform vocabulary unchanged).

---

## 2.6 Favourites ID migration

### Schema change (`neon/game_favourites.sql` or new migration file)

```sql
alter table public.game_favourites
  add column if not exists provider text not null default 'igdb';

-- After remap, optional: drop rows that failed remap
-- delete from public.game_favourites where provider = 'rawg';
```

### Remap script (`scripts/remap-favourites-rawg-to-igdb.mjs`)

For each distinct `game_id` where `provider = 'rawg'` (or all rows if default was rawg before):

1. If RAWG still up: `GET rawg game by id` → get `name` + `released`.
2. Else: skip RAWG; use backup CSV + manual mapping or IGDB search by id if you stored names elsewhere.
3. IGDB: `search "${name}"; fields id,name,first_release_date; limit 5;`
4. Pick best match (name normalizer + year).
5. `UPDATE game_favourites SET game_id = $igdbId, provider = 'igdb' WHERE game_id = $rawgId AND provider = 'rawg';`

Run once after deploy. User runs with `DATABASE_URL` + Twitch creds in `.env.backend`.

### Favourites page optimization

`Favourites.tsx`: consider batch API `GET /api/games?ids=1,2,3` to reduce round-trips (1 IGDB call vs 77).

---

## 2.7 Frontend / static assets

| File | Change |
|------|--------|
| `index.html` | Remove `preconnect` to `media.rawg.io`; optional `preconnect` to `images.igdb.com` |
| `src/components/Footer.tsx` | IGDB attribution + link |
| `src/pages/Favourites.tsx` | Rename `RAWG_CONCURRENCY` → `HYDRATE_CONCURRENCY`; update comments |
| `README.md` | Replace RAWG with IGDB; env var docs |

---

## 2.8 Environment variables

**Remove:**

- `RAWG_API_KEY` from `.env.backend.example`, README, Vercel

**Add:**

```env
TWITCH_CLIENT_ID=...
TWITCH_CLIENT_SECRET=...
```

---

## 2.9 Tests

| Area | Action |
|------|--------|
| `tests/api/` | Mock `igdbClient` or MSW intercept `api.igdb.com` |
| `src/` unit tests | Unchanged if `useAuth` mocks stay as-is |
| Manual | Home load, search “zelda”, game detail, favourites, AI search |
| Rate limit | Confirm AI search still respects Upstash before OpenAI |

Add `tests/api/games.test.ts` if missing — at least 400/502 paths.

---

## 2.10 Deploy & cutover

1. Merge PR to `main`.
2. Confirm Vercel env: `TWITCH_*` set, `RAWG_API_KEY` removed when confident.
3. Run remap script against production DB (or ask user to run locally pointed at prod `DATABASE_URL` — **confirm before WRITE**).
4. Smoke test production URLs.
5. Monitor Vercel logs for 429 from IGDB — if hot, add short Redis cache for game-by-id.

---

## 2.11 Rollback plan

If IGDB causes issues:

1. Revert PR (restore RAWG code paths).
2. Re-add `RAWG_API_KEY` on Vercel.
3. Favourites: if `provider` column added, rows with `provider = 'igdb'` need reverse remap or restore from CSV backup.

Keep `RAWG_API_KEY` in Vercel **disabled but noted** for one release cycle if RAWG might return.

---

## Appendix A — IGDB image URL cheat sheet

Official reference: [Images](https://api-docs.igdb.com/#images) · [Cover](https://api-docs.igdb.com/#cover)

```
Cover big:  https://images.igdb.com/igdb/image/upload/t_cover_big/{image_id}.jpg
Screenshot: https://images.igdb.com/igdb/image/upload/t_screenshot_med/{image_id}.jpg
```

Thumb for cards if needed: `t_cover_small` (see [Images](https://api-docs.igdb.com/#images) for all size tokens)

---

## Appendix B — Apicalypse quick reference

Official reference: [APICalypse](https://api-docs.igdb.com/#apic-alypse) · [Examples](https://api-docs.igdb.com/#examples) · [Fields](https://api-docs.igdb.com/#fields) · [Filters](https://api-docs.igdb.com/#filters) · [Pagination](https://api-docs.igdb.com/#pagination)

```
search "phrase";           // full-text search — see Search reference
where id = 1942;           // filter
where id = (1,2,3);        // multiple ids
fields name,summary;       // projection
limit 40;
offset 0;
sort popularity desc;
```

More copy-paste queries: [Examples](https://api-docs.igdb.com/#examples) (search, platform filters, sorting, exclude editions).

---

## Appendix C — File change checklist (agent)

- [ ] `src/server/igdb/igdbClient.ts` (new)
- [ ] `src/server/igdb/igdbQueries.ts` (new)
- [ ] `src/server/igdb/igdbTransform.ts` (new)
- [ ] `src/server/igdb/igdbCache.ts` (new, replaces rawgCache)
- [ ] `api/games.ts`
- [ ] `api/game.ts`
- [ ] `api/ai-search.ts`
- [ ] `src/server/utils/gameValidator.ts`
- [ ] `src/util/transformGameData.ts`
- [ ] `src/server/utils/rawgCache.ts` (delete)
- [ ] `neon/game_favourites.sql` or migration for `provider`
- [ ] `scripts/remap-favourites-rawg-to-igdb.mjs` (new)
- [ ] `index.html`, `Footer.tsx`, `Favourites.tsx`, `README.md`
- [ ] `.env.backend.example`
- [ ] Tests updated

---

## Appendix D — Success criteria

Migration is **done** when:

1. Home page loads games without RAWG.
2. Search returns relevant results.
3. Game detail page renders cover, rating, description.
4. Favourites list hydrates correct titles (after remap).
5. AI search returns validated games + fallback works.
6. Footer credits IGDB.
7. No `RAWG` or `rawg.io` references remain in application code (package-lock transitive deps OK).

---

*Last updated: 2026-08-17 — GameKit on `main`, Neon auth live, RAWG outage ongoing.*
