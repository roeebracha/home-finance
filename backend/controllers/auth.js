const googleAuth = require("../services/googleAuth");
const { signToken } = require("../services/tokenService");
const { isAllowedEmail } = require("../services/allowlist");

function publicUser(profile) {
  return {
    id: profile.googleId,
    email: String(profile.email).toLowerCase(),
    name: profile.name || "",
    picture: profile.picture || "",
  };
}

exports.googleLogin = async (req, res) => {
  const credential = req.body && req.body.credential;

  if (!credential) {
    return res.status(400).json({
      error: "missing_credential",
      message: "חסר אימות Google",
    });
  }

  let profile;
  try {
    profile = await googleAuth.verifyGoogleCredential(credential);
  } catch {
    return res.status(401).json({
      error: "invalid_credential",
      message: "אימות Google נכשל",
    });
  }

  if (!isAllowedEmail(profile.email)) {
    return res.status(403).json({
      error: "email_not_allowed",
      message: "החשבון הזה לא ברשימת הבית",
    });
  }

  const token = signToken(profile);
  return res.json({ token, user: publicUser(profile) });
};

exports.me = (req, res) => {
  res.json({ user: req.user });
};
