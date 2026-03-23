/*
 * sessionDB is a simple wrapper around window.sessionStorage that provides an interface
 * to store and retrieve session state. It is used to store the lastClassicQuery and lastAiQuery
 * in memory and sync them to sessionStorage via getItem, storeItem, and removeItem.
 */

export type StoredSessionState = {
  search: {
    lastClassicQuery: string;
    lastAiQuery: string;
  };
};

const STORAGE_PREFIX = "gamekit_session_state";

function getStorageKey(identity: string): string {
  return `${STORAGE_PREFIX}:${identity}`;
}

function createEmptyState(): StoredSessionState {
  return {
    search: {
      lastClassicQuery: "",
      lastAiQuery: "",
    },
  };
}

export const sessionDB = {
  getItem<T>(key: string, fallback: T): T {
    if (typeof window === "undefined") return fallback;

    try {
      const raw = window.sessionStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  },

  storeItem(key: string, value: unknown): void {
    if (typeof window === "undefined") return;

    try {
      window.sessionStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Ignore storage failures and keep in-memory state working.
    }
  },

  removeItem(key: string): void {
    if (typeof window === "undefined") return;

    try {
      window.sessionStorage.removeItem(key);
    } catch {
      // Ignore storage failures and keep in-memory state working.
    }
  },
};

export function readSessionState(identity: string): StoredSessionState {
  const raw = sessionDB.getItem(
    getStorageKey(identity),
    createEmptyState(),
  ) as StoredSessionState & { favourites?: unknown };
  return {
    search: {
      lastClassicQuery: raw.search?.lastClassicQuery ?? "",
      lastAiQuery: raw.search?.lastAiQuery ?? "",
    },
  };
}

export function updateSessionState(
  identity: string,
  updater: (current: StoredSessionState) => StoredSessionState,
): void {
  const current = readSessionState(identity);
  sessionDB.storeItem(getStorageKey(identity), updater(current));
}

export function clearSessionState(identity: string): void {
  sessionDB.removeItem(getStorageKey(identity));
}
