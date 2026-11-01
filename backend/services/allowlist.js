function allowedEmails() {
  return String(process.env.ALLOWED_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

function assertAllowlistConfigured() {
  if (allowedEmails().length === 0) {
    const error = new Error("ALLOWED_EMAILS is not set");
    error.code = "MISSING_ALLOWLIST";
    throw error;
  }
}

function isAllowedEmail(email) {
  if (!email) return false;
  const allowed = allowedEmails();
  if (allowed.length === 0) return false;
  return allowed.includes(String(email).trim().toLowerCase());
}

module.exports = { allowedEmails, isAllowedEmail, assertAllowlistConfigured };
