const jwt = require("jsonwebtoken");
const env = require('../config/env');

function authenticateRoom(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        error: "Room session is missing.",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      env.JWT_SECRET
    );

    if (decoded.roomId !== req.params.roomId) {
      return res.status(403).json({
        success: false,
        error: "This session does not belong to this room.",
      });
    }

    req.session = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: "Invalid or expired room session.",
    });
  }
}

module.exports = {authenticateRoom};