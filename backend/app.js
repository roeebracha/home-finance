const cors = require("cors");
const express = require("express");
require("dotenv").config({ quiet: true });

const authRoutes = require("./routes/authRoutes");
const householdRoutes = require("./routes/householdRoutes");

const app = express();

const origins = (process.env.CLIENT_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({ origin: origins }));
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api/auth", authRoutes);
app.use("/api/household", householdRoutes);

app.use("/api", (_req, res) => {
  res.status(404).json({ error: "not_found", message: "הנתיב לא נמצא" });
});

app.use((error, _req, res, _next) => {
  if (
    error.code === "SHEETS_NOT_CONFIGURED" ||
    error.code === "MISSING_SECRET" ||
    error.code === "MISSING_ALLOWLIST" ||
    error.code === "MISSING_GOOGLE_CLIENT"
  ) {
    return res.status(500).json({
      error: "server_misconfigured",
      message: "השרת לא מוגדר",
    });
  }
  if (error.code === "SHEET_INVALID") {
    return res.status(502).json({ error: "sheet_invalid", message: error.message });
  }
  if (error.code === "SHEETS_UPSTREAM") {
    return res.status(502).json({
      error: "sheet_unavailable",
      message: "קריאת הגיליון נכשלה",
    });
  }
  const detail = String((error && error.message) || "");
  if (!/private_key|BEGIN PRIVATE/i.test(detail)) console.error(detail || "server_error");
  return res.status(500).json({ error: "server_error", message: "שגיאה בשרת" });
});

// Local `node app.js` listens. Importing the app (tests, Vercel) must not.
if (require.main === module) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`App is running on port ${port}`);
  });
}

module.exports = app;
