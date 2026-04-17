import { useState, type FormEvent } from "react";
import Button from "../components/Button";
import { useNavigate, useSearchParams } from "react-router";
import { useAuth } from "../hooks/useAuth";
import { validatePasswordPolicy } from "../util/passwordPolicy";

export default function Authentication() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignedUp, setIsSignedUp] = useState<boolean>(false);
  const [showSignupLoginHint, setShowSignupLoginHint] = useState<boolean>(false);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isLogin = searchParams.get("mode") === "login";
  const { signIn, signUp } = useAuth();

  const handleSubmitForm = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setIsSignedUp(false);
    setShowSignupLoginHint(false);

    try {
      // Enforce password policy before sign-up request
      if (!isLogin) {
        const passwordError = validatePasswordPolicy(password);
        if (passwordError) {
          setError(passwordError);
          setLoading(false);
          return;
        }
      }

      const authResult = isLogin
        ? await signIn({ email, password })
        : await signUp({
            email,
            password,
            options: {
              emailRedirectTo: window.location.origin,
            },
          });
      const { error } = authResult;

      if (error) throw error;

      if (isLogin) {
        navigate("/");
      } else {
        // Supabase may return success without creating a new identity for existing users.
        const identities = authResult.data.user?.identities ?? [];
        if (identities.length === 0) {
          setShowSignupLoginHint(true);
          return;
        }
        setIsSignedUp(true);
      }
    } catch (err: unknown) {
      // Show neutral guidance for signup failures
      if (!isLogin) {
        setShowSignupLoginHint(true);
      }
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred.",
      );
    } finally {
      setEmail("");
      setPassword("");
      setLoading(false);
    }
  };

  const handleAuthChoice = () => {
    const nextMode = isLogin ? "signup" : "login";
    navigate(`?mode=${nextMode}`, { replace: true });
    setError(null);
    setIsSignedUp(false);
    setShowSignupLoginHint(false);
  };

  return (
    <section>
      <h1 className="text-2xl font-bold mb-4 text-center">
        {isLogin ? "Login" : "Create a new user"}
      </h1>

      {isSignedUp && (
        <p className="text-center font-bold text-green-500 mb-4">
          Success! Please check your email to confirm your account.
        </p>
      )}

      <form
        onSubmit={handleSubmitForm}
        className="flex flex-col gap-5 m-auto sm:max-w-1/2"
      >
        <div className="flex flex-col gap-2">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="py-2 px-4 bg-(--color-bg-secondary) text-(--color-text-primary) rounded-2xl outline-none"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="py-2 px-4 bg-(--color-bg-secondary) text-(--color-text-primary) rounded-2xl outline-none"
          />
          {!isLogin && (
            <p className="text-xs text-(--color-text-tertiary)">
              Use 8+ chars with uppercase, lowercase, number, and symbol.
            </p>
          )}
          {isLogin && (
            <button
              type="button"
              onClick={() => navigate("/forgot-password")}
              className="text-left text-sm font-semibold text-(--color-accent-primary) hover:opacity-80 cursor-pointer"
            >
              Forgot password?
            </button>
          )}
        </div>

        {error && (
          <p className="text-center font-bold text-red-500 mt-2">{error}</p>
        )}

        {showSignupLoginHint && !isLogin && (
          <div className="mt-2 rounded-xl bg-(--color-bg-secondary) p-3">
            <p className="text-sm text-(--color-text-primary)">
              If an account exists for this email, you can log in or reset your
              password.
            </p>
            <button
              type="button"
              onClick={handleAuthChoice}
              className="mt-2 text-sm font-semibold text-(--color-accent-primary) hover:opacity-80 cursor-pointer"
            >
              Switch to Login
            </button>
          </div>
        )}

        <div className="flex justify-between items-center flex-wrap gap-4">
          <Button
            type="submit"
            text={loading ? "Submitting..." : isLogin ? "Login" : "Create user"}
            disabled={loading}
          />

          <Button
            type="button"
            text={isLogin ? "Switch to create account" : "Switch to login"}
            handleOnClick={handleAuthChoice}
            variant="variant-2"
          />
        </div>
      </form>
    </section>
  );
}
