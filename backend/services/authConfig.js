const { assertAllowlistConfigured } = require("./allowlist");

function missing(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}

function assertAuthConfigured() {
  assertAllowlistConfigured();
  if (!process.env.JWT_SECRET || !String(process.env.JWT_SECRET).trim()) {
    throw missing("MISSING_SECRET", "JWT_SECRET is not set");
  }
  if (!process.env.GOOGLE_CLIENT_ID || !String(process.env.GOOGLE_CLIENT_ID).trim()) {
    throw missing("MISSING_GOOGLE_CLIENT", "GOOGLE_CLIENT_ID is not set");
  }
}

function misconfigured(res) {
  return res.status(500).json({
    error: "server_misconfigured",
    message: "השרת לא מוגדר",
  });
}

function isMisconfigured(error) {
  return (
    error &&
    (error.code === "MISSING_SECRET" ||
      error.code === "MISSING_ALLOWLIST" ||
      error.code === "MISSING_GOOGLE_CLIENT")
  );
}

module.exports = { assertAuthConfigured, misconfigured, isMisconfigured };
