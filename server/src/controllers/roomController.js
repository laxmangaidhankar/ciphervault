const Room = require("../models/Room");
const SharedFile = require("../models/SharedFile");

const logger = require("../utils/logger");

const { generateRoomId } = require("../utils/roomId");
const {
  generateAccessKey,
  hashAccessKey,
  verifyAccessKey,
} = require("../utils/accessKey");

/**
 * POST /api/v1/rooms
 * Create a new temporary room.
 */
async function createRoom(req, res) {
  try {
    const {
      roomName,
      ownerName,
      durationMinutes = 1440,
      maxParticipants = 5,
    } = req.body;

    const trimmedRoomName = String(roomName || "").trim();
    const trimmedOwnerName = String(ownerName || "").trim();

    if (!trimmedRoomName || !trimmedOwnerName) {
      return res.status(400).json({
        success: false,
        error: "Room name or Owner name is missing.",
      });
    }

    if (trimmedRoomName.length < 3) {
      return res.status(400).json({
        success: false,
        error: "Room name must be at least 3 characters.",
      });
    }

    if (trimmedRoomName.length > 60) {
      return res.status(400).json({
        success: false,
        error: "Room name must not exceed 60 characters.",
      });
    }
    const parsedDuration = Number(durationMinutes);


    const validDuration =
      Number.isInteger(parsedDuration) &&
      parsedDuration > 0 &&
      parsedDuration <= 1440
        ? parsedDuration
        : 1440;

    const parsedMaxParticipants = Number(maxParticipants);

    if (
      !Number.isInteger(parsedMaxParticipants) ||
      parsedMaxParticipants < 2 ||
      parsedMaxParticipants > 50
    ) {
      return res.status(400).json({
        success: false,
        error: "Participants must be between 2 and 50.",
      });
    }

    let roomId;
    let isUnique = false;
    let attempts = 0;

    let accessKey;

    while (!isUnique && attempts < 10) {
      roomId = generateRoomId(6);
      accessKey = generateAccessKey();

      const existingRoom = await Room.exists({ roomId });

      if (!existingRoom) {
        isUnique = true;
      }

      attempts++;
    }

    if (!isUnique) {
      logger.error(
        {
          event: "room_id_generation_failed",
          attempts,
        },
        "Failed to generate unique room ID",
      );

      return res.status(500).json({
        success: false,
        error: "Failed to generate unique room ID. Please try again.",
      });
    }

    const accessKeyHash = await hashAccessKey(accessKey);

    const expiresAt = new Date(Date.now() + validDuration * 60 * 1000);

    const room = await Room.create({
      roomId,
      roomName: trimmedRoomName,
      ownerName: trimmedOwnerName,
      accessKeyHash,
      expiresAt,
      maxParticipants: parsedMaxParticipants,
      status: "active",
    });

    logger.info(
      {
        event: "room_created",
        roomId: room.roomId,
        roomName: room.roomName,
        maxParticipants: room.maxParticipants,
        durationMinutes: validDuration,
      },
      "Room created",
    );

    return res.status(201).json({
      success: true,
      room: {
        roomId: room.roomId,
        roomName: room.roomName,
        ownerName: room.ownerName,
        accessKey: accessKey,
        expiresAt: room.expiresAt,
        maxParticipants: room.maxParticipants,
        status: room.status,
        createdAt: room.createdAt,
      },
    });
  } catch (error) {
    logger.error(
      {
        event: "room_creation_failed",
        err: error,
      },
      "Failed to create room",
    );

    return res.status(500).json({
      success: false,
      error: "Failed to create room.",
    });
  }
}

/**
 * GET /api/v1/rooms/:roomId
 * Get temporary room.
 */
async function getRoom(req, res) {
  try {
    const { room } = req;

    return res.status(200).json({
      success: true,
      room: {
        roomId: room.roomId,
        expiresAt: room.expiresAt,
        maxParticipants: room.maxParticipants,
        status: room.status,
        createdAt: room.createdAt,
      },
    });
  } catch (error) {
    logger.error(
      {
        event: "room_retrieval_failed",
        roomId: req.params.roomId,
        err: error,
      },
      "Failed to retrieve room status",
    );

    return res.status(500).json({
      success: false,
      error: "Failed to retrieve room status.",
    });
  }
}

/**
 * DELETE /api/v1/rooms/:roomId
 * Delete a temporary room.
 */
async function destroyRoom(req, res) {
  try {
    const { room } = req;

    if (!room) {
      logger.warn(
        {
          event: "room_not_found",
          roomId: req.params.roomId,
        },
        "Room not found",
      );

      return res.status(404).json({
        success: false,
        error: "Room not found.",
      });
    }

    // Authorization should happen before destruction
    if (!req.roomAuthorized) {
      logger.warn(
        {
          event: "room_destroy_unauthorized",
          roomId: room.roomId,
        },
        "Unauthorized room destruction attempt",
      );

      return res.status(403).json({
        success: false,
        error: "You are not authorized to destroy this room.",
      });
    }

    // Mark room as destroyed
    room.status = "destroyed";
    await room.save();

    // Delete all shared files belonging to the room
    const deleteResult = await SharedFile.deleteMany({
      roomId: room.roomId,
    });

    // Notify connected clients
    const io = req.app.get("io");

    if (io) {
      io.to(room.roomId).emit("room:destroyed", {
        roomId: room.roomId,
        message: "The room has been destroyed.",
      });
    }

    // Production-safe structured log
    logger.info(
      {
        event: "room_destroyed",
        roomId: room.roomId,
        deletedFiles: deleteResult.deletedCount,
        socketNotificationSent: Boolean(io),
      },
      "Room destroyed",
    );

    return res.status(200).json({
      success: true,
      message: "Room destroyed successfully.",
    });
  } catch (error) {
    logger.error(
      {
        event: "room_destruction_failed",
        roomId: req.params.roomId,
        err: error,
      },
      "Failed to destroy room",
    );

    return res.status(500).json({
      success: false,
      error: "Failed to destroy room.",
    });
  }
}
module.exports = {
  createRoom,
  getRoom,
  destroyRoom,
};
