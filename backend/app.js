const cors = require("cors");
const express = require("express");
require("dotenv").config({ quiet: true });

const authRoutes = require("./routes/authRoutes");

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

app.use("/api", (_req, res) => {
  res.status(404).json({ error: "not_found", message: "הנתיב לא נמצא" });
});

// Local `node app.js` listens. Importing the app (tests, Vercel) must not.
if (require.main === module) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`App is running on port ${port}`);
  });
}

module.exports = app;
