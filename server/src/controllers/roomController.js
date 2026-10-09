const { v4: uuidv4 } = require("uuid");
const Room = require("../models/Room");
const logger = require("../utils/logger");
const { generateRoomId } = require("../utils/roomId");

const { generateRoomToken } = require("../utils/roomToken");

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
    const { roomName, displayName, durationMinutes = 1440 } = req.body;

    const trimmedRoomName = String(roomName || "").trim();
    const trimmedDisplayName = String(displayName || "").trim();

    if (!trimmedRoomName || !trimmedDisplayName) {
      return res.status(400).json({
        success: false,
        error: "Room name or Owner name is missing.",
      });
    }

    if (trimmedRoomName.length < 3 ) {
      return res.status(400).json({
        success: false,
        error: "Room name must be at least 3 characters.",
      });
    }

    if (trimmedRoomName.length > 40  || trimmedDisplayName.length>40) {
      return res.status(400).json({
        success: false,
        error: "Room name or Display name must not exceed 40 characters.",
      });
    }
    const parsedDuration = Number(durationMinutes);

    const validDuration =
      Number.isInteger(parsedDuration) &&
      parsedDuration > 0 &&
      parsedDuration <= 1440
        ? parsedDuration
        : 1440;

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
      displayName: trimmedDisplayName,
      accessKeyHash,
      expiresAt,
      status: "active",
    });

    const participantId = uuidv4();

    const sessionToken = generateRoomToken({
      roomId: room.roomId,
      participantId,
      displayName: room.displayName,
      role: "owner",
      expiresAt: room.expiresAt,
    });

    res.cookie("session", sessionToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      expires: room.expiresAt,
    });
    logger.info(
      {
        event: "room_created",
        roomId: room.roomId,
        roomName: room.roomName,
        durationMinutes: validDuration,
      },
      "Room created",
    );

    return res.status(201).json({
      success: true,
      room: {
        roomId: room.roomId,
        roomName: room.roomName,
        displayName: room.displayName,
        accessKey: accessKey,
        expiresAt: room.expiresAt,
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
 * GET /api/v1/rooms/:roomId/status
 * Get status of the room.
 */
async function getRoomStatus(req, res) {
  try {
    const { room } = req;

    return res.status(200).json({
      success: true,
      room: {
        roomId: room.roomId,
        roomName: room.roomName,
        displayName: room.displayName,
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
        roomName: room.roomName,
        expiresAt: room.expiresAt,
        participantId: req.user.participantId,
        displayName: req.user.displayName,
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
 * POST /api/v1/rooms/:roomId/join
 * verify access key + join room
 */
async function joinRoom(req, res) {
  try {
    const { accessKey, displayName } = req.body;
    const { room } = req;

    if (!accessKey || !displayName) {
      return res.status(400).json({
        success: false,
        error: "Access key or display name is missing.",
      });
    }

    const trimmedDisplayName = String(displayName).trim();
    const trimmedAccessKey = String(accessKey).trim();

    if (!trimmedDisplayName) {
      return res.status(400).json({
        success: false,
        error: "Display name cannot be empty.",
      });
    }

    // Check room expiration
    if (new Date(room.expiresAt).getTime() <= Date.now()) {
      return res.status(410).json({
        success: false,
        error: "This room has expired.",
      });
    }

    // Verify access key
    const accessKeyVerification = await verifyAccessKey(
      trimmedAccessKey,
      room.accessKeyHash,
    );

    if (!accessKeyVerification) {
      return res.status(401).json({
        success: false,
        error: "Invalid access key.",
      });
    }

    // Create participant ID
    const participantId = uuidv4();

    // Create JWT room session
    const sessionToken = generateRoomToken({
      roomId: room.roomId,
      participantId,
      displayName: trimmedDisplayName,
      role: "member",
      expiresAt: room.expiresAt,
    });

    res.cookie("session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: room.expiresAt,
    });
    return res.status(200).json({
      success: true,

      room: {
        roomId: room.roomId,
        roomName: room.roomName,
        expiresAt: room.expiresAt,
        status: room.status,
      },

      participant: {
        participantId,
        displayName: trimmedDisplayName,
        role: "member",
      },
    });
  } catch (error) {
    logger.error(
      {
        event: "room_join_failed",
        roomId: req.params.roomId,
        err: error,
      },
      "Failed to join room",
    );

    return res.status(500).json({
      success: false,
      error: "Failed to join room.",
    });
  }
}
module.exports = {
  createRoom,
  getRoom,
  joinRoom,
  getRoomStatus,
};
