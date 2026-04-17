export function mapPasswordError(errorMessage: string): string {
  const message = errorMessage.toLowerCase();

  // Known auth failures
  if (message.includes("invalid login credentials")) {
    return "Current password is incorrect.";
  }
  if (message.includes("session") || message.includes("jwt")) {
    return "Your session expired. Please sign in again.";
  }
  if (message.includes("network") || message.includes("failed to fetch")) {
    return "Network error. Please try again.";
  }
  if (message.includes("password")) {
    return "New password does not meet security rules.";
  }

  return "Could not update password. Please try again.";
}
