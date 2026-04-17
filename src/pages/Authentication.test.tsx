import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Authentication from "./Authentication";
import { useAuth } from "../hooks/useAuth";

vi.mock("../hooks/useAuth", () => ({
  useAuth: vi.fn(),
}));

const signInMock = vi.fn();
const signUpMock = vi.fn();
const signOutMock = vi.fn();
const changePasswordMock = vi.fn();
const requestPasswordResetMock = vi.fn();
const resetPasswordMock = vi.fn();
const mockedUseAuth = vi.mocked(useAuth);

function renderAuthentication(entry: string) {
  return render(
    <MemoryRouter initialEntries={[entry]}>
      <Routes>
        <Route path="/" element={<p>Home page</p>} />
        <Route path="/auth" element={<Authentication />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("Authentication", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    signInMock.mockResolvedValue({ error: null });
    signUpMock.mockResolvedValue({
      error: null,
      data: { user: { identities: [{}] } },
    });
    mockedUseAuth.mockReturnValue({
      loading: false,
      user: null,
      signIn: signInMock,
      signUp: signUpMock,
      signOut: signOutMock,
      changePassword: changePasswordMock,
      requestPasswordReset: requestPasswordResetMock,
      resetPassword: resetPasswordMock,
    });
  });

  it("submits signup data and shows the confirmation message", async () => {
    const user = userEvent.setup();
    renderAuthentication("/auth?mode=signup");

    await user.type(screen.getByLabelText("Email"), "samus@gamekit.dev");
    await user.type(screen.getByLabelText("Password"), "Chozo123!");
    await user.click(screen.getByRole("button", { name: "Create user" }));

    await waitFor(() => {
      expect(signUpMock).toHaveBeenCalledWith({
        email: "samus@gamekit.dev",
        password: "Chozo123!",
        options: {
          emailRedirectTo: window.location.origin,
        },
      });
    });

    expect(
      await screen.findByText(
        "Success! Please check your email to confirm your account.",
      ),
    ).toBeVisible();
  });

  it("submits login data and redirects back home", async () => {
    const user = userEvent.setup();
    renderAuthentication("/auth?mode=login");

    await user.type(screen.getByLabelText("Email"), "samus@gamekit.dev");
    await user.type(screen.getByLabelText("Password"), "Chozo123!");
    await user.click(screen.getByRole("button", { name: "Login" }));

    await waitFor(() => {
      expect(signInMock).toHaveBeenCalledWith({
        email: "samus@gamekit.dev",
        password: "Chozo123!",
      });
    });

    expect(await screen.findByText("Home page")).toBeVisible();
  });
});
