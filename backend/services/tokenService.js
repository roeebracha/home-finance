const jwt = require("jsonwebtoken");

function secret() {
  if (!process.env.JWT_SECRET) {
    const error = new Error("JWT_SECRET is not set");
    error.code = "MISSING_SECRET";
    throw error;
  }
  return process.env.JWT_SECRET;
}

function signToken(profile) {
  return jwt.sign(
    {
      sub: profile.googleId,
      email: String(profile.email).toLowerCase(),
      name: profile.name || "",
      picture: profile.picture || "",
    },
    secret(),
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
      algorithm: "HS256",
    },
  );
}

function verifyToken(token) {
  return jwt.verify(token, secret(), { algorithms: ["HS256"] });
}

module.exports = { signToken, verifyToken };
