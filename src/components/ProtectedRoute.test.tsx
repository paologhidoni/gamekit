import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { describe, expect, it, vi } from "vitest";
import ProtectedRoute from "./ProtectedRoute";
import { useAuth } from "../hooks/useAuth";

vi.mock("../hooks/useAuth", () => ({
  useAuth: vi.fn(),
}));

const mockedUseAuth = vi.mocked(useAuth);

function renderProtectedRoute() {
  return render(
    <MemoryRouter initialEntries={["/settings"]}>
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/settings" element={<p>Settings page</p>} />
        </Route>
        <Route path="/auth" element={<p>Login page</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("ProtectedRoute", () => {
  it("shows a loading message while auth state is resolving", () => {
    mockedUseAuth.mockReturnValue({
      loading: true,
      user: null,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      changePassword: vi.fn(),
      requestPasswordReset: vi.fn(),
      resetPassword: vi.fn(),
    });

    renderProtectedRoute();

    expect(screen.getByText("Loading authentication...")).toBeVisible();
  });

  it("redirects guests to the login route", async () => {
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

    renderProtectedRoute();

    expect(await screen.findByText("Login page")).toBeVisible();
  });

  it("renders protected content for signed-in users", async () => {
    mockedUseAuth.mockReturnValue({
      loading: false,
      user: { id: "user-1" } as never,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      changePassword: vi.fn(),
      requestPasswordReset: vi.fn(),
      resetPassword: vi.fn(),
    });

    renderProtectedRoute();

    expect(await screen.findByText("Settings page")).toBeVisible();
  });
});
