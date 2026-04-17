import { validatePasswordPolicy } from "../../util/passwordPolicy";

interface PasswordFormValues {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export type PasswordFormErrors = Partial<Record<keyof PasswordFormValues, string>>;

export function validatePasswordForm(
  values: PasswordFormValues
): PasswordFormErrors {
  const errors: PasswordFormErrors = {};

  // Required fields
  if (!values.currentPassword.trim()) {
    errors.currentPassword = "Enter your current password.";
  }
  if (!values.newPassword.trim()) {
    errors.newPassword = "Enter a new password.";
  }
  if (!values.confirmNewPassword.trim()) {
    errors.confirmNewPassword = "Confirm your new password.";
  }

  // Password rules
  const passwordPolicyError = values.newPassword
    ? validatePasswordPolicy(values.newPassword)
    : null;
  if (passwordPolicyError) {
    errors.newPassword = passwordPolicyError;
  }
  if (values.newPassword && values.currentPassword === values.newPassword) {
    errors.newPassword = "New password must be different.";
  }
  if (
    values.confirmNewPassword &&
    values.newPassword !== values.confirmNewPassword
  ) {
    errors.confirmNewPassword = "Passwords do not match.";
  }

  return errors;
}
