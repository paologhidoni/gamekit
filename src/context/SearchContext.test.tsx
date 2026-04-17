import { render, screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SearchContextProvider, useSearch } from "./SearchContext";
import { useAuth } from "../hooks/useAuth";
import { server } from "@tests/msw/server";

vi.mock("../hooks/useAuth", () => ({
  useAuth: vi.fn(),
}));

const mockedUseAuth = vi.mocked(useAuth);

function RemainingRequestsProbe() {
  const { remainingAiRequests } = useSearch();
  return <p>remaining: {remainingAiRequests}</p>;
}

describe("SearchContextProvider", () => {
  beforeEach(() => {
    mockedUseAuth.mockReturnValue({
      loading: false,
      user: null,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      changePassword: vi.fn(),
      requestPasswordReset: vi.fn(),
      resetPassword: vi.fn(),
    });
    window.sessionStorage.clear();
  });

  it("hydrates remaining AI requests from the mocked rate-limit endpoint", async () => {
    server.use(
      http.get("/api/rate-limit", () => HttpResponse.json({ remaining: 2 })),
    );

    render(
      <SearchContextProvider>
        <RemainingRequestsProbe />
      </SearchContextProvider>,
    );

    expect(await screen.findByText("remaining: 2")).toBeVisible();
  });
});
