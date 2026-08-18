import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiFetch, getAccessToken } from "./apiFetch";

const getSessionMock = vi.fn();

vi.mock("./neonClient", () => ({
  neon: {
    auth: {
      getSession: (...args: unknown[]) => getSessionMock(...args),
    },
  },
}));

describe("apiFetch", () => {
  beforeEach(() => {
    getSessionMock.mockReset();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("{}")));
  });

  it("getAccessToken returns null when there is no session", async () => {
    getSessionMock.mockResolvedValue({ data: { session: null } });
    await expect(getAccessToken()).resolves.toBeNull();
  });

  it("getAccessToken returns the session access token", async () => {
    getSessionMock.mockResolvedValue({
      data: { session: { access_token: "jwt-123" } },
    });
    await expect(getAccessToken()).resolves.toBe("jwt-123");
  });

  it("apiFetch attaches Authorization when signed in", async () => {
    getSessionMock.mockResolvedValue({
      data: { session: { access_token: "jwt-123" } },
    });

    await apiFetch("/api/games");

    expect(fetch).toHaveBeenCalledWith(
      "/api/games",
      expect.objectContaining({
        headers: expect.any(Headers),
      }),
    );

    const [, init] = vi.mocked(fetch).mock.calls[0] as [string, RequestInit];
    expect((init.headers as Headers).get("Authorization")).toBe(
      "Bearer jwt-123",
    );
  });

  it("apiFetch omits Authorization when logged out", async () => {
    getSessionMock.mockResolvedValue({ data: { session: null } });

    await apiFetch("/api/games", {
      headers: { "Content-Type": "application/json" },
    });

    const [, init] = vi.mocked(fetch).mock.calls[0] as [string, RequestInit];
    const headers = init.headers as Headers;
    expect(headers.get("Authorization")).toBeNull();
    expect(headers.get("Content-Type")).toBe("application/json");
  });
});
