# LangGraph Chat Persistence Implementation Plan

Goal: build an authenticated chat endpoint where each user has one active LangGraph thread, with 7-day inactivity expiration, Redis checkpoints, server-side `user_chat_state`, and **optional live web search via Tavily only** (no Wikipedia step in this lesson).

## Architecture You Are Building

- LangGraph checkpointer in Upstash Redis stores conversation checkpoints.
- Supabase stores only thread ownership/state (`user_id -> active_thread_id`).
- API resolves thread server-side from authenticated user.
- Expiration policy is inactivity-based (7 days).
- Redis TTL is a guardrail, set slightly above inactivity window (8 days).
- The agent may call **Tavily** as its only tool so answers can use **current** web facts when the model chooses to search; you skip a separate “merge node” until you need stricter answer formatting.

## Step 1 — Prerequisites and Accounts

This step ensures all external dependencies are ready before writing code. You are validating that auth, hosting, model access, and data stores exist so you do not block implementation midway.

### 1.1 Create/verify services

- [ ] Supabase project exists and auth is enabled.
- [ ] Upstash Redis database exists.
- [ ] Vercel project is connected to this repo.
- [ ] OpenAI API key (or your model provider key) is available.
- [ ] Tavily account exists and you have a **Tavily API key** (for web search tool only).

### 1.2 Install dependencies

```bash
npm install @langchain/core @langchain/langgraph @langchain/langgraph-checkpoint-redis @upstash/redis @langchain/openai @langchain/community
```

(`@langchain/community` provides `TavilySearchResults` used as the bound search tool.)

## Step 2 — Dashboard Setup (Supabase, Upstash, Vercel)

This step configures the infrastructure your endpoint depends on. You are preparing database state ownership, Redis checkpoint storage, and deployment/runtime settings so local and deployed behavior match.

### 2.1 Supabase dashboard: create chat state table

- [ ] In SQL Editor, create table:
  - `user_id` (uuid, PK, references auth user id)
  - `active_thread_id` (text, nullable initially)
  - `thread_started_at` (timestamptz)
  - `last_activity_at` (timestamptz)
  - `updated_at` (timestamptz default `now()`)
- [ ] Add unique/PK on `user_id`.
- [ ] Add index on `last_activity_at` (future cleanup/reporting).
- [ ] Enable RLS and add policy so server role can read/write safely.

### 2.2 Upstash dashboard: configure Redis

- [ ] Copy `UPSTASH_REDIS_REST_URL`.
- [ ] Copy `UPSTASH_REDIS_REST_TOKEN`.
- [ ] Confirm max memory/eviction settings are acceptable for learning.
- [ ] Decide TTL strategy: `7d inactivity policy` + `8d Redis TTL`.

### 2.3 Vercel dashboard: environment variables

- [ ] Add:
  - `UPSTASH_REDIS_REST_URL`
  - `UPSTASH_REDIS_REST_TOKEN`
  - `OPENAI_API_KEY`
  - `TAVILY_API_KEY`
  - Supabase server envs you already use
- [ ] Add function timeout in `vercel.json` if needed (e.g. `maxDuration: 60`).

### 2.4 Tavily dashboard: API key

- [ ] Sign in at Tavily and create/copy an API key for server-side use only.
- [ ] Store it as `TAVILY_API_KEY` in Vercel (and local `.env`); never expose it to the client.

## Step 3 — Project Files You Will Implement

This step scopes the code surface area before implementation. You are explicitly separating contracts, persistence helpers, and route logic to keep responsibilities clear and easier to debug.

- [ ] `lib/checkpointer.ts` for Redis checkpointer creation.
- [ ] `lib/chatState.ts` for `user_chat_state` DB helpers.
- [ ] `api/ai-chat.ts` (or your chosen route) for endpoint logic.
- [ ] `src/schemas/aiChat.ts` for request/response contract.

## Step 4 — Define Zod Contracts First (Schemas + Types)

This step defines the API boundary before business logic. You are locking request/response contracts early so endpoint code and client integrations remain type-safe and predictable.

### 4.1 Create request schema

- [ ] Define `aiChatRequestSchema` with trimmed non-empty `question`.
- [ ] Export request types from schema:
  - [ ] input type (request wire shape)
  - [ ] output type (parsed/normalized shape)

### 4.2 Create response schemas

- [ ] Define `aiChatSuccessResponseSchema` with:
  - [ ] `answer`
  - [ ] `messages`
  - [ ] optional rate-limit metadata (`remaining`)
- [ ] Define `aiChatErrorResponseSchema` with:
  - [ ] `error`
  - [ ] optional rate-limit metadata (`remaining`, `reset`)
- [ ] Export inferred TS types for success/error responses.

### 4.3 Why this step comes early

- [ ] Endpoint logic and UI hooks should code against typed contracts from day one.
- [ ] Parsing at API boundary avoids leaking invalid payloads into graph/tool logic.

## Step 5 — Implement the Checkpointer Layer

This step wires LangGraph persistence into Redis. You are creating the memory backbone so each request can resume prior state through `thread_id` without manual history reconstruction.

### 5.1 Create `lib/checkpointer.ts`

- [ ] Initialize Upstash Redis client from env.
- [ ] Export LangGraph checkpointer (`RedisSaver` or shallow variant).
- [ ] Keep this module side-effect free and reusable.

### 5.2 Compile graph at module scope

- [ ] Build and compile LangGraph once at file scope (not inside handler).
- [ ] Keep tool/model setup at module scope for warm-instance reuse.

### 5.3 Wire Tavily as the only web search tool (sensible default)

This step adds **one** external knowledge path: live web search. You are not adding Wikipedia loaders or a custom “merge” node yet—the model calls Tavily when it needs fresh facts, then answers in the same ReAct-style loop (`agent` → tools → `agent` → end). That keeps the graph teachable and avoids extra latency until you need a dedicated synthesis step.

- [ ] Create a Tavily tool instance (e.g. `TavilySearchResults` from `@langchain/community`) with `apiKey: process.env.TAVILY_API_KEY`.
- [ ] Bind tools on your chat model (e.g. `model.bindTools([tavilyTool])`).
- [ ] Add a `ToolNode` (or equivalent) for Tavily and **conditional edges**: if the last assistant message has tool calls, route to tools, then back to agent; else end.
- [ ] Handle tool failures gracefully (log, return a user-visible error or “search unavailable” without crashing the thread).
- [ ] Defer Wikipedia, RAG, or a final “merge all sources” node to a later iteration if answers need stricter structure or citations.

## Step 6 — Implement Supabase Chat State Helpers

This step implements server-side ownership of active threads. You are making the database the authority for which thread a user continues, independent from client storage.

### 6.1 Create helper APIs in `lib/chatState.ts`

- [ ] `getUserChatState(userId)`
- [ ] `createUserChatState(userId, threadId, now)`
- [ ] `updateActiveThread(userId, threadId, now)` (resets both timestamps)
- [ ] `touchLastActivity(userId, now)`

### 6.2 Add expiration utility

- [ ] `isInactive(lastActivityAt, now, inactivityMs)` -> boolean.
- [ ] Set `INACTIVITY_MS = 7 * 24 * 60 * 60 * 1000`.

## Step 7 — Implement Endpoint Flow (Core Lesson)

This step assembles the full runtime flow from auth to model response. You are combining validation, thread resolution, graph invocation, and activity updates into one deterministic request lifecycle.

### 7.1 Request flow

- [ ] Authenticate request and resolve `userId`.
- [ ] Parse input (`question`) with Zod.
- [ ] Load `user_chat_state` for `userId`.

### 7.2 Resolve active thread

- [ ] If no state row or no `active_thread_id`:
  - generate new `threadId`
  - create state row with current timestamps
- [ ] Else if inactive > 7 days:
  - generate new `threadId`
  - rotate active thread in DB (reset timestamps)
- [ ] Else keep existing `active_thread_id`.

### 7.3 Invoke LangGraph

- [ ] Pass `configurable.thread_id = activeThreadId`.
- [ ] Send user question as new user message.
- [ ] Return normalized response (`answer`, `messages`, optional metadata).

### 7.4 Post-success updates

- [ ] Update `last_activity_at = now`.
- [ ] Refresh Redis checkpoint TTL to `8 days` for sliding behavior.

## Step 8 — Handle TTL Drift Robustly

Problem: DB may point to a thread whose Redis checkpoint already expired.

This step adds resilience for real-world state drift. You are ensuring users do not hit dead conversations by rotating stale threads and retrying in a controlled way.

### 8.1 Fallback behavior

- [ ] If invoke indicates missing/empty checkpoint unexpectedly:
  - generate new `threadId`
  - update DB active thread
  - retry invoke exactly once
- [ ] If retry fails, return controlled error response.

### 8.2 Why this works

- DB remains source of policy (inactivity).
- Redis remains source of checkpoint storage.
- One retry prevents user-facing dead threads.

## Step 9 — Define Final API Contracts

This step verifies that implemented behavior matches exported schemas. You are preventing contract drift between actual endpoint responses and shared TypeScript/Zod definitions.

### 9.1 Request schema (`src/schemas/aiChat.ts`)

- [ ] `question` (trimmed non-empty).
- [ ] No client `threadId` needed in this server-side mapping model.

### 9.2 Success response schema

- [ ] `answer: string`
- [ ] `messages: { role, content }[]`
- [ ] `remaining?: number` (if rate limit applied)

### 9.3 Error response schema

- [ ] `error: string`
- [ ] `remaining?: number`
- [ ] `reset?: string`

## Step 10 — Manual Test Plan (Do This in Order)

This step validates correctness through scenario testing. You are checking not only happy paths but also expiration, mismatch recovery, and user isolation before calling the feature done.

### 10.1 Happy path

- [ ] First message by user -> DB row created, new thread created.
- [ ] Second message quickly -> same thread reused, memory preserved.

### 10.2 Inactivity rotation

- [ ] Set `last_activity_at` to old value manually in Supabase.
- [ ] Send message -> thread rotates and new conversation starts.

### 10.3 Redis expiry mismatch

- [ ] Expire/delete checkpoint keys in Upstash while DB still has old thread.
- [ ] Send message -> fallback rotation + single retry succeeds.

### 10.4 Auth + isolation

- [ ] Two users chat independently -> no state leakage between users.

### 10.5 Tavily tool path

- [ ] Ask a question that clearly needs **recent** web facts; confirm the graph performs a tool call and the final answer reflects retrieved snippets (or a graceful fallback if search fails).

## Step 11 — Production Hardening (After MVP)

This step prepares the feature for sustained usage. You are adding observability, limits, and operational safeguards once core behavior is already stable.

- [ ] Add rate limiting and include metadata in response schemas.
- [ ] Add structured logging (`userId`, `threadId`, rotation reason).
- [ ] Add background cleanup/report for stale rows if desired.
- [ ] Consider per-game threads later (`user_id + game_id`) if product scope narrows.

## Step 12 — Completion Checklist

This step gives you a final acceptance gate. You are confirming every architectural and behavioral requirement is implemented before moving to the next feature.

- [ ] Supabase table + policies configured.
- [ ] Upstash checkpointer wired.
- [ ] Endpoint resolves thread from DB server-side.
- [ ] 7-day inactivity policy implemented.
- [ ] Redis TTL refresh + drift fallback implemented.
- [ ] Tavily tool wired (`bindTools` + `ToolNode` + conditional edges); `TAVILY_API_KEY` set in env.
- [ ] Schemas aligned with real endpoint responses.
- [ ] Manual tests executed and validated.

