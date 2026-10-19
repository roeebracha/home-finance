const app = require("../app");
const entry = require("../../api/index");
const slug = require("../../api/[...slug]");

if (typeof app !== "function") {
  throw new Error("backend/app.js must export the Express app");
}

if (typeof entry !== "function" || entry.app !== app) {
  throw new Error("api/index.js must wrap the same Express app");
}

if (slug !== entry) {
  throw new Error("api/[...slug].js must reuse api/index.js");
}

console.log("backend app exports for local listen and Vercel");
