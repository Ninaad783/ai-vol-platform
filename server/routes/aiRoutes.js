const express = require("express");
const router = express.Router();
const { getChatResponse, generateEventDetails } = require("../controllers/aiController");

router.post("/chat", getChatResponse);
router.post("/generate-details", generateEventDetails);

module.exports = router;