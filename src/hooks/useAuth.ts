import { useCallback, useEffect, useState } from "react";
import { QUERY_CACHE_PERSIST_KEY, queryClient } from "../lib/queryClient";
import { supabase } from "../lib/supabaseClient";
import {
  AuthError,
  type SignInWithPasswordCredentials,
  type SignUpWithPasswordCredentials,
  type User,
} from "@supabase/supabase-js";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        setLoading(false); // Set loading to false after initial check
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(
    (credentials: SignInWithPasswordCredentials) =>
      supabase.auth.signInWithPassword(credentials),
    []
  );

  const signUp = useCallback(
    (credentials: SignUpWithPasswordCredentials) =>
      supabase.auth.signUp(credentials),
    []
  );

  const signOut = useCallback(async () => {
    const result = await supabase.auth.signOut();
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
      const { error: reauthError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });
      if (reauthError) return { error: reauthError };

      // Apply the password update for the current user.
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });
      return { error: updateError };
    },
    [user?.email]
  );

  return {
    loading,
    user,
    signUp,
    signIn,
    signOut,
    changePassword,
  };
}
