const googleAuth = require("../services/googleAuth");
const { signToken } = require("../services/tokenService");
const { isAllowedEmail } = require("../services/allowlist");
const { assertAuthConfigured, misconfigured, isMisconfigured } = require("../services/authConfig");

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

  try {
    assertAuthConfigured();
  } catch (error) {
    if (isMisconfigured(error)) return misconfigured(res);
    throw error;
  }

  let profile;
  try {
    profile = await googleAuth.verifyGoogleCredential(credential);
  } catch (error) {
    if (isMisconfigured(error)) return misconfigured(res);
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

  try {
    const token = signToken(profile);
    return res.json({ token, user: publicUser(profile) });
  } catch (error) {
    if (isMisconfigured(error)) return misconfigured(res);
    throw error;
  }
};

exports.me = (req, res) => {
  res.json({ user: req.user });
};
