const express = require("express");

const { saveEnv, getEnv } = require("../../controllers/envController");
const { verifyRoomActive } = require("../../middleware/roomAccess");

const { authenticateSession } = require("../../middleware/authenticateSession");

const router = express.Router();

// Save encrypted ENV
router.post("/:roomId/env", verifyRoomActive, authenticateSession, saveEnv);

// Get encrypted ENV
router.get("/:roomId/env", verifyRoomActive, authenticateSession, getEnv);

module.exports = router;
