const express = require("express");
const { googleLogin, me } = require("../controllers/auth");
const { guard } = require("../middleware/guard");

const router = express.Router();

router.post("/google", googleLogin);
router.get("/me", guard, me);

module.exports = router;
