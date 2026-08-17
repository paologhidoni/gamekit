import { useCallback, useEffect, useState } from "react";
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

function toAuthError(error: unknown): AuthError {
  if (error instanceof AuthError) return error;
  if (error && typeof error === "object" && "message" in error) {
    return new AuthError(String(error.message));
  }
  return new AuthError("An unexpected auth error occurred.");
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Auth state subscription
    const { data: authListener } = neon.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      },
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(
    (credentials: SignInWithPasswordCredentials) =>
      neon.auth.signInWithPassword(credentials),
    [],
  );

  const signUp = useCallback(
    (credentials: SignUpWithPasswordCredentials) =>
      neon.auth.signUp(credentials),
    [],
  );

  const signOut = useCallback(async () => {
    const result = await neon.auth.signOut();
    if (!result.error) {
      // Why: any sign-out must drop private query data from memory and persisted session cache.
      queryClient.clear();
      window.sessionStorage.removeItem(QUERY_CACHE_PERSIST_KEY);
    }
    return result;
  }, []);

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
      const { error: reauthError } = await neon.auth.signInWithPassword({
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
    [user],
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
      return { error: null };
    },
    [],
  );

  return {
    loading,
    user,
    signUp,
    signIn,
    signOut,
    changePassword,
    requestPasswordReset,
    resetPassword,
  };
}
