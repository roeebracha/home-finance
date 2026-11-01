const { verifyToken } = require("../services/tokenService");
const { isAllowedEmail, assertAllowlistConfigured } = require("../services/allowlist");
const { misconfigured, isMisconfigured } = require("../services/authConfig");

exports.guard = (req, res, next) => {
  try {
    assertAllowlistConfigured();
  } catch (error) {
    if (isMisconfigured(error)) return misconfigured(res);
    throw error;
  }

  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice("Bearer ".length).trim() : "";

  if (!token) {
    return res.status(401).json({ error: "missing_token", message: "חסר טוקן" });
  }

  try {
    const payload = verifyToken(token);

    if (!isAllowedEmail(payload.email)) {
      return res.status(403).json({
        error: "email_not_allowed",
        message: "החשבון הזה לא ברשימת הבית",
      });
    }

    req.user = {
      id: payload.sub,
      email: String(payload.email).toLowerCase(),
      name: payload.name || "",
      picture: payload.picture || "",
    };
    return next();
  } catch (error) {
    if (isMisconfigured(error)) return misconfigured(res);
    return res.status(401).json({ error: "invalid_token", message: "הטוקן לא תקין" });
  }
};
