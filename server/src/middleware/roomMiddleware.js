const Room = require('../models/Room');

async function roomMiddleware(req, res, next) {
  try {
    const { roomId } = req.params;

    const room = await Room.findOne({ roomId });

    if (!room) {
      return res.status(404).json({
        success: false,
        error: "Room not found.",
      });
    }

    req.room = room;

    next();
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      error: "Failed to retrieve room.",
    });
  }
}


module.exports = {roomMiddleware};