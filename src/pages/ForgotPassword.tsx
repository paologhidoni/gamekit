import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../hooks/useAuth";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { requestPasswordReset } = useAuth();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Submit reset email request
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const { error: requestError } = await requestPasswordReset(email);
    // Keep response neutral to avoid user enumeration
    setIsSubmitted(true);
    if (requestError) {
      setError("We could not send the reset email right now. Please try again.");
    }

    setIsSubmitting(false);
  };

  if (isSubmitted) {
    return (
      <section className="m-auto max-w-lg rounded-2xl bg-(--color-bg-secondary) p-4 md:p-6">
        <h1 className="mb-3 text-2xl font-bold text-center">Check your email</h1>
        <p className="text-sm text-(--color-text-primary)">
          If an account exists for this email, you will receive a password reset
          link shortly.
        </p>
        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
        <button
          type="button"
          onClick={() => navigate("/auth?mode=login")}
          className="mt-4 text-sm font-semibold text-(--color-accent-primary) hover:opacity-80 cursor-pointer"
        >
          Back to login
        </button>
      </section>
    );
  }

  return (
    <section className="m-auto max-w-lg rounded-2xl bg-(--color-bg-secondary) p-4 md:p-6">
      <h1 className="mb-4 text-2xl font-bold text-center">Forgot password</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Email input */}
        <div className="flex flex-col gap-1">
          <label htmlFor="forgot-password-email" className="text-sm font-medium">
            Email
          </label>
          <input
            id="forgot-password-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="rounded-xl border border-(--color-text-tertiary) bg-(--color-bg-primary) px-3 py-2 outline-none"
            autoComplete="email"
          />
        </div>

        {/* Submit action */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-fit rounded-xl border-2 border-(--color-accent-primary) bg-(--color-accent-primary) px-4 py-2 font-bold text-(--color-text-secondary) transition-colors hover:bg-(--color-accent-secondary) hover:border-(--color-accent-secondary) disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Sending..." : "Send reset email"}
        </button>
      </form>
    </section>
  );
}
