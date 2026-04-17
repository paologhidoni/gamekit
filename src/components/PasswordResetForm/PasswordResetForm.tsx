import { useState, type ChangeEvent, type FormEvent } from "react";
import { useAuth } from "../../hooks/useAuth";
import {
  validatePasswordForm,
  type PasswordFormErrors,
} from "./validatePasswordForm";
import { mapPasswordError } from "./mapPasswordError";

interface PasswordFormValues {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export default function PasswordResetForm() {
  const { changePassword, user } = useAuth();
  const [values, setValues] = useState<PasswordFormValues>({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [errors, setErrors] = useState<PasswordFormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update form fields
  const handleFieldChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
    setSubmitError(null);
    setSuccessMessage(null);
  };

  // Clear sensitive fields
  const resetForm = () => {
    setValues({
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    });
    setErrors({});
  };

  // Submit password change
  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const nextErrors = validatePasswordForm(values);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    if (!user?.email) {
      setSubmitError("You must be signed in to update your password.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setSuccessMessage(null);

    const { error } = await changePassword({
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
    });

    if (error) {
      setSubmitError(mapPasswordError(error.message));
      setIsSubmitting(false);
      return;
    }

    setSuccessMessage("Password updated successfully.");
    resetForm();
    setIsSubmitting(false);
  };

  return (
    <section className="w-full max-w-lg rounded-2xl bg-(--color-bg-secondary) p-4 md:p-6">
      <h2 className="mb-4 text-lg font-semibold text-(--color-text-primary)">
        Change password
      </h2>

      <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4">
        {/* Current password */}
        <div className="flex flex-col gap-1">
          <label htmlFor="currentPassword" className="text-sm font-medium">
            Current password
          </label>
          <input
            id="currentPassword"
            name="currentPassword"
            type="password"
            value={values.currentPassword}
            onChange={handleFieldChange}
            className="rounded-xl border border-(--color-text-tertiary) bg-(--color-bg-primary) px-3 py-2 outline-none"
            autoComplete="current-password"
          />
          {errors.currentPassword && (
            <p className="text-sm text-red-400">{errors.currentPassword}</p>
          )}
        </div>

        {/* New password */}
        <div className="flex flex-col gap-1">
          <label htmlFor="newPassword" className="text-sm font-medium">
            New password
          </label>
          <input
            id="newPassword"
            name="newPassword"
            type="password"
            value={values.newPassword}
            onChange={handleFieldChange}
            className="rounded-xl border border-(--color-text-tertiary) bg-(--color-bg-primary) px-3 py-2 outline-none"
            autoComplete="new-password"
          />
          {errors.newPassword && (
            <p className="text-sm text-red-400">{errors.newPassword}</p>
          )}
        </div>

        {/* Confirm new password */}
        <div className="flex flex-col gap-1">
          <label htmlFor="confirmNewPassword" className="text-sm font-medium">
            Confirm new password
          </label>
          <input
            id="confirmNewPassword"
            name="confirmNewPassword"
            type="password"
            value={values.confirmNewPassword}
            onChange={handleFieldChange}
            className="rounded-xl border border-(--color-text-tertiary) bg-(--color-bg-primary) px-3 py-2 outline-none"
            autoComplete="new-password"
          />
          {errors.confirmNewPassword && (
            <p className="text-sm text-red-400">{errors.confirmNewPassword}</p>
          )}
        </div>

        {/* Submit feedback */}
        {submitError && <p className="text-sm text-red-400">{submitError}</p>}
        {successMessage && (
          <p className="text-sm text-green-400">{successMessage}</p>
        )}

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
