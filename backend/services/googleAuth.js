const { OAuth2Client } = require("google-auth-library");

async function verifyGoogleCredential(credential) {
  if (!process.env.GOOGLE_CLIENT_ID || !String(process.env.GOOGLE_CLIENT_ID).trim()) {
    const error = new Error("GOOGLE_CLIENT_ID is not set");
    error.code = "MISSING_GOOGLE_CLIENT";
    throw error;
  }

  const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  const ticket = await client.verifyIdToken({
    idToken: credential,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();

  if (!payload || !payload.email_verified) {
    throw new Error("Google email not verified");
  }

  return {
    googleId: payload.sub,
    email: String(payload.email).toLowerCase(),
    name: payload.name || "",
    picture: payload.picture || "",
  };
}

module.exports = { verifyGoogleCredential };
