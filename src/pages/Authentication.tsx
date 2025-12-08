import { useState, type FormEvent } from "react";
import Button from "../components/Button";
import { useNavigate, useSearchParams } from "react-router";
import { useAuth } from "../hooks/useAuth";

export default function Authentication() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignedUp, setIsSignedUp] = useState<boolean>(false);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isLogin = searchParams.get("mode") === "login";
  const { signIn, signUp } = useAuth();

  const handleSubmitForm = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setIsSignedUp(false);

    try {
      const credentials = { email, password };
      const { error } = isLogin
        ? await signIn(credentials)
        : await signUp(credentials);

      if (error) throw error;

      if (isLogin) {
        navigate("/");
      } else {
        setIsSignedUp(true);
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleAuthChoice = () => {
    const nextMode = isLogin ? "signup" : "login";
    navigate(`?mode=${nextMode}`, { replace: true });
    setError(null);
    setIsSignedUp(false);
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
        </div>

        {error && (
          <p className="text-center font-bold text-red-500 mt-2">{error}</p>
        )}

        <div className="flex justify-between items-center flex-wrap gap-4">
          <Button
            type="button"
            text={isLogin ? "Create a new user" : "Login to your account"}
            handleOnClick={handleAuthChoice}
            variant="variant-2"
          />

          <Button
            type="submit"
            text={loading ? "Submitting..." : isLogin ? "Login" : "Create user"}
            disabled={loading}
          />
        </div>
      </form>
    </section>
  );
}
