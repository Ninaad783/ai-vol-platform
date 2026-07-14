const express = require("express");
const router = express.Router();
const { getAiMatches } = require("../controllers/matchController");

router.post("/suggest-matches", getAiMatches);

module.exports = router;