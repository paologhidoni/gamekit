/* eslint-disable react-refresh/only-export-components -- useAuth is intentionally coupled to AuthProvider */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { AuthError } from "@neondatabase/neon-js/auth";
import { QUERY_CACHE_PERSIST_KEY, queryClient } from "../lib/queryClient";
import { neon, neonAuthApi } from "../lib/neonClient";

export type AuthUser = {
  id: string;
  email?: string;
};

type SignInWithPasswordCredentials = {
  email: string;
  password: string;
};

type SignUpWithPasswordCredentials = SignInWithPasswordCredentials & {
  options?: {
    emailRedirectTo?: string;
    data?: Record<string, unknown>;
  };
};

type AuthSession = {
  user: AuthUser | null;
};

function toAuthError(error: unknown): AuthError {
  if (error instanceof AuthError) return error;
  if (error && typeof error === "object" && "message" in error) {
    return new AuthError(String(error.message));
  }
  return new AuthError("An unexpected auth error occurred.");
}

type AuthContextValue = {
  loading: boolean;
  user: AuthUser | null;
  signUp: (
    credentials: SignUpWithPasswordCredentials,
  ) => ReturnType<typeof neon.auth.signUp>;
  signIn: (
    credentials: SignInWithPasswordCredentials,
  ) => ReturnType<typeof neon.auth.signInWithPassword>;
  signOut: () => ReturnType<typeof neon.auth.signOut>;
  changePassword: (args: {
    currentPassword: string;
    newPassword: string;
  }) => Promise<{ error: AuthError | null }>;
  requestPasswordReset: (email: string) => Promise<{ error: AuthError | null }>;
  resetPassword: (
    newPassword: string,
    token: string,
  ) => Promise<{ error: AuthError | null }>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Shared session sync for subscribe + password flows
  const syncUserFromSession = useCallback((session: AuthSession | null) => {
    setUser(session?.user ?? null);
    setLoading(false);
  }, []);

  useEffect(() => {
    // Cross-tab + initial session
    const { data: authListener } = neon.auth.onAuthStateChange(
      (_event, session) => {
        syncUserFromSession(session);
      },
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [syncUserFromSession]);

  useEffect(() => {
    // Why: Neon skips same-tab auth broadcasts; re-read session when the tab is active again.
    const refreshSession = async () => {
      const { data } = await neon.auth.getSession();
      syncUserFromSession(data.session);
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        void refreshSession();
      }
    };

    window.addEventListener("focus", refreshSession);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.removeEventListener("focus", refreshSession);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [syncUserFromSession]);

  const signIn = useCallback(
    async (credentials: SignInWithPasswordCredentials) => {
      const result = await neon.auth.signInWithPassword(credentials);
      // Why: Neon does not emit same-tab SIGNED_IN; apply session from the response.
      if (!result.error) {
        syncUserFromSession(result.data.session);
      }
      return result;
    },
    [syncUserFromSession],
  );

  const signUp = useCallback(
    async (credentials: SignUpWithPasswordCredentials) => {
      const result = await neon.auth.signUp(credentials);
      if (!result.error) {
        syncUserFromSession(result.data.session);
      }
      return result;
    },
    [syncUserFromSession],
  );

  const signOut = useCallback(async () => {
    const result = await neon.auth.signOut();
    if (!result.error) {
      syncUserFromSession(null);
      // Why: any sign-out must drop private query data from memory and persisted session cache.
      queryClient.clear();
      window.sessionStorage.removeItem(QUERY_CACHE_PERSIST_KEY);
    }
    return result;
  }, [syncUserFromSession]);

  const changePassword = useCallback(
    async ({
      currentPassword,
      newPassword,
    }: {
      currentPassword: string;
      newPassword: string;
    }): Promise<{ error: AuthError | null }> => {
      if (!user?.email) {
        return { error: new AuthError("Authenticated user email not found.") };
      }

      // Verify current password before changing credentials.
      const { error: reauthError } = await signIn({
        email: user.email,
        password: currentPassword,
      });
      if (reauthError) return { error: reauthError };

      // Neon uses Better Auth changePassword (not updateUser).
      const result = await neonAuthApi.changePassword({
        currentPassword,
        newPassword,
      });
      if (result.error) return { error: toAuthError(result.error) };
      return { error: null };
    },
    [signIn, user],
  );

  const requestPasswordReset = useCallback(async (email: string) => {
    const redirectTo = `${window.location.origin}/auth/reset-password`;
    const { error } = await neon.auth.resetPasswordForEmail(email, {
      redirectTo,
    });
    return { error };
  }, []);

  const resetPassword = useCallback(
    async (newPassword: string, token: string) => {
      const result = await neonAuthApi.resetPassword({ newPassword, token });
      if (result.error) return { error: toAuthError(result.error) };

      // Why: reset may establish a session without a same-tab SIGNED_IN event.
      const { data } = await neon.auth.getSession();
      syncUserFromSession(data.session);
      return { error: null };
    },
    [syncUserFromSession],
  );

  const value = useMemo(
    () => ({
      loading,
      user,
      signUp,
      signIn,
      signOut,
      changePassword,
      requestPasswordReset,
      resetPassword,
    }),
    [
      loading,
      user,
      signUp,
      signIn,
      signOut,
      changePassword,
      requestPasswordReset,
      resetPassword,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
