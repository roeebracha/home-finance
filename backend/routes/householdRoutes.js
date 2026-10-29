const express = require("express");
const { household } = require("../controllers/household");
const { guard } = require("../middleware/guard");

const router = express.Router();

router.get("/", guard, household);

module.exports = router;
