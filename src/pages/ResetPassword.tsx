import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { useAuth } from "../context/AuthContext";
import { validatePasswordPolicy } from "../util/passwordPolicy";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { resetPassword } = useAuth();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [isCheckingToken, setIsCheckingToken] = useState(true);

  useEffect(() => {
    // Read reset token from callback URL
    const token = searchParams.get("token");
    const resetError = searchParams.get("error");
    setResetToken(token);
    if (resetError) setError("This reset link is invalid or expired. Request a new one.");
    setIsCheckingToken(false);
  }, [searchParams]);

  // Submit password update
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!resetToken) {
      setError("This reset link is invalid or expired. Request a new one.");
      return;
    }

    const policyError = validatePasswordPolicy(newPassword);
    if (policyError) {
      setError(policyError);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    const { error: updateError } = await resetPassword(newPassword, resetToken);
    if (updateError) {
      setError("This reset link is invalid or expired. Request a new one.");
      setIsSubmitting(false);
      return;
    }

    setSuccess(true);
    setNewPassword("");
    setConfirmPassword("");
    setIsSubmitting(false);
  };

  if (isCheckingToken) {
    return <p className="text-center">Checking reset link...</p>;
  }

  if (!resetToken) {
    return (
      <section className="m-auto max-w-lg rounded-2xl bg-(--color-bg-secondary) p-4 md:p-6">
        <h1 className="mb-3 text-2xl font-bold text-center">Reset link invalid</h1>
        <p className="text-sm text-(--color-text-primary)">
          This reset link is invalid, expired, or already used.
        </p>
        <button
          type="button"
          onClick={() => navigate("/forgot-password")}
          className="mt-4 text-sm font-semibold text-(--color-accent-primary) hover:opacity-80 cursor-pointer"
        >
          Request a new reset link
        </button>
      </section>
    );
  }

  if (success) {
    return (
      <section className="m-auto max-w-lg rounded-2xl bg-(--color-bg-secondary) p-4 md:p-6">
        <h1 className="mb-3 text-2xl font-bold text-center">Password updated</h1>
        <p className="text-sm text-(--color-text-primary)">
          Your password was updated successfully.
        </p>
        <Link
          to="/auth?mode=login"
          className="mt-4 inline-block text-sm font-semibold text-(--color-accent-primary) hover:opacity-80"
        >
          Go to login
        </Link>
      </section>
    );
  }

  return (
    <section className="m-auto max-w-lg rounded-2xl bg-(--color-bg-secondary) p-4 md:p-6">
      <h1 className="mb-4 text-2xl font-bold text-center">Set new password</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* New password field */}
        <div className="flex flex-col gap-1">
          <label htmlFor="new-password" className="text-sm font-medium">
            New password
          </label>
          <input
            id="new-password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            autoComplete="new-password"
            className="rounded-xl border border-(--color-text-tertiary) bg-(--color-bg-primary) px-3 py-2 outline-none"
          />
        </div>

        {/* Confirm password field */}
        <div className="flex flex-col gap-1">
          <label htmlFor="confirm-password" className="text-sm font-medium">
            Confirm password
          </label>
          <input
            id="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
            className="rounded-xl border border-(--color-text-tertiary) bg-(--color-bg-primary) px-3 py-2 outline-none"
          />
        </div>

        <p className="text-xs text-(--color-text-tertiary)">
          Use 8+ chars with uppercase, lowercase, number, and symbol.
        </p>

        {error && <p className="text-sm text-red-400">{error}</p>}

        {/* Submit action */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-fit cursor-pointer rounded-xl border-2 border-(--color-accent-primary) bg-(--color-accent-primary) px-4 py-2 font-bold text-(--color-text-secondary) transition-colors hover:bg-(--color-accent-secondary) hover:border-(--color-accent-secondary) disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Updating..." : "Update password"}
        </button>
      </form>
    </section>
  );
}
