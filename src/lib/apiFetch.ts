import { neon } from "./neonClient";

// Neon session JWT for server routes that use requireAuth.
export async function getAccessToken(): Promise<string | null> {
  const { data } = await neon.auth.getSession();
  return data.session?.access_token ?? null;
}

export async function getAuthHeaders(headers?: HeadersInit): Promise<Headers> {
  const merged = new Headers(headers);
  const token = await getAccessToken();
  if (token) {
    merged.set("Authorization", `Bearer ${token}`);
  }
  return merged;
}

export async function apiFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const headers = await getAuthHeaders(init?.headers);
  return fetch(input, { ...init, headers });
}
