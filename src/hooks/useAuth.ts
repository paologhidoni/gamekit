import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import {
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

  const signOut = useCallback(() => supabase.auth.signOut(), []);

  return {
    loading,
    user,
    signUp,
    signIn,
    signOut,
  };
}
