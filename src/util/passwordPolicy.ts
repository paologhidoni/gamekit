const passwordPolicyRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

export const passwordPolicyMessage =
  "Password must be at least 8 characters and include uppercase, lowercase, number, and symbol.";

export function validatePasswordPolicy(password: string): string | null {
  // Enforce Supabase password policy in the UI
  if (!passwordPolicyRegex.test(password)) return passwordPolicyMessage;
  return null;
}
