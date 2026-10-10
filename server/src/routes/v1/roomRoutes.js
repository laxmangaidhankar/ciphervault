const express = require("express");
const roomRouter = express.Router();
const {
  createRoom,
  getRoom,
  joinRoom,
  getRoomStatus,
} = require("../../controllers/roomController");
const { verifyRoomActive } = require("../../middleware/roomAccess");
const {
  roomCreateLimiter,
  roomJoinLimiter,
} = require("../../middleware/rateLimiter");
const { roomMiddleware } = require("../../middleware/roomMiddleware");
const { authenticateSession } =
  require("../../middleware/authenticateSession");

// POST /api/rooms - Create a new room
roomRouter.post("/", roomCreateLimiter, createRoom);

// GET /api/rooms/:roomId/status - Check room status
roomRouter.get(
  "/:roomId/status",
  verifyRoomActive,
  getRoomStatus,
);

// GET /api/rooms/:roomId - Check room 
roomRouter.get(
  "/:roomId",
  authenticateSession,
  verifyRoomActive,
  getRoom,
);

roomRouter.post("/:roomId/join", roomMiddleware, roomJoinLimiter,  joinRoom);

module.exports = roomRouter;
