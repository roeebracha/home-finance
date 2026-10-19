const { verifyToken } = require("../services/tokenService");
const { isAllowedEmail } = require("../services/allowlist");

exports.guard = (req, res, next) => {
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
    if (error.code === "MISSING_SECRET") {
      return res.status(500).json({
        error: "server_misconfigured",
        message: "השרת לא מוגדר",
      });
    }
    return res.status(401).json({ error: "invalid_token", message: "הטוקן לא תקין" });
  }
};
