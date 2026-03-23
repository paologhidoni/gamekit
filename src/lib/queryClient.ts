import { QueryClient } from "@tanstack/react-query";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";

/*
 * SESSION_QUERY_MAX_AGE is used in two places:
 * (1) queries.gcTime — how long inactive query data stays in memory after the last component unsubscribes.
 *     Plainly: once no page uses a query (you navigated away), TanStack may delete that cached result after this long to free RAM—e.g. you opened search results then went to Settings and stayed away for a day.
 * (2) PersistQueryClientProvider maxAge (App.tsx) — reject rehydrating a persisted cache blob from sessionStorage if it is older than this (stale snapshot).
 *     Plainly: on refresh or reopen, if the saved cache on disk is older than this, we throw it away and start empty—e.g. you come back after two days and we do not silently reuse ancient AI results.
 * Same duration keeps “in-memory retention” and “trust persisted session cache” aligned; split the constant if those policies should differ.
 */

// Keep query data for the browser session so refreshes can reuse cached AI results.
export const SESSION_QUERY_MAX_AGE = 1000 * 60 * 60 * 24;
export const QUERY_CACHE_PERSIST_KEY = "gamekit_query_cache";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: SESSION_QUERY_MAX_AGE,
    },
  },
});

// Persist the React Query cache separately from our own UI session state.
export const sessionStoragePersister = createAsyncStoragePersister({
  key: QUERY_CACHE_PERSIST_KEY,
  storage: window.sessionStorage,
});
