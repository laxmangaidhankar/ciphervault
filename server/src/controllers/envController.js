const {
  saveEncryptedEnv,
  getEncryptedEnv,
  deleteEncryptedEnv,
} = require("../services/envStore");

const { emitEnvUpdated } = require("../services/socketService");

const Room = require("../models/Room");

// Save encrypted ENV
const saveEnv = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { encryptedEnv } = req.body;

    console.log(roomId);

    if (!roomId) {
      return res.status(400).json({
        message: "Room ID is required.",
      });
    }

    if (!encryptedEnv) {
      return res.status(400).json({
        message: "Encrypted ENV data is required.",
      });
    }

    // Find the room
    const room = await Room.findOne({ roomId });

    if (!room) {
      return res.status(404).json({
        message: "Room not found.",
      });
    }

    // Check room expiry
    const expiresAt = new Date(room.expiresAt);
    const now = Date.now();

    const remainingMs = expiresAt.getTime() - now;

    if (remainingMs <= 0) {
      return res.status(410).json({
        message: "Room has expired.",
      });
    }

    // Redis TTL must be in seconds
    const ttl = Math.floor(remainingMs / 1000);

    if (ttl <= 0) {
      return res.status(410).json({
        message: "Room is about to expire.",
      });
    }

    // Store encrypted payload in Redis
    await saveEncryptedEnv(roomId, encryptedEnv, ttl);

    console.log(req.user);
    emitEnvUpdated(roomId, req.user.participantId);

    return res.status(200).json({
      message: "Encrypted ENV saved successfully.",
    });
  } catch (error) {
    console.error("[ENV] Failed to save ENV:", error);

    return res.status(500).json({
      message: "Failed to save ENV data.",
    });
  }
};

// Get encrypted ENV
const getEnv = async (req, res) => {
  try {
    const { roomId } = req.params;
    console.log(roomId);

    if (!roomId) {
      return res.status(400).json({
        message: "Room ID is required.",
      });
    }

    // Find the room
    const room = await Room.findOne({ roomId });

    if (!room) {
      return res.status(404).json({
        message: "Room not found.",
      });
    }

    // Check room expiry
    if (new Date(room.expiresAt).getTime() <= Date.now()) {
      return res.status(410).json({
        message: "Room has expired.",
      });
    }

    // Get encrypted payload from Redis
    const encryptedEnv = await getEncryptedEnv(roomId);

    if (!encryptedEnv) {
      return res.status(404).json({
        message: "No ENV data found.",
      });
    }

    return res.status(200).json({
      encryptedEnv,
    });
  } catch (error) {
    console.error("[ENV] Failed to get ENV:", error);

    return res.status(500).json({
      message: "Failed to retrieve ENV data.",
    });
  }
};

// Delete encrypted ENV
const deleteEnv = async (req, res) => {
  try {
    const { roomId } = req.params;

    if (!roomId) {
      return res.status(400).json({
        message: "Room ID is required.",
      });
    }

    await deleteEncryptedEnv(roomId);

    return res.status(200).json({
      message: "ENV data deleted successfully.",
    });
  } catch (error) {
    console.error("[ENV] Failed to delete ENV:", error);

    return res.status(500).json({
      message: "Failed to delete ENV data.",
    });
  }
};

module.exports = {
  saveEnv,
  getEnv,
  deleteEnv,
};
