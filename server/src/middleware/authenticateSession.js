const jwt = require("jsonwebtoken");
const env = require("../config/env");

function authenticateSession(req, res, next) {
  try {
    const token = req.cookies.session;

    if (!token) {
      return res.status(401).json({
        success: false,
        error: "No active session",
      });
    }

    const decoded = jwt.verify(token, env.JWT_SECRET);

    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: "Invalid or expired session",
    });
  }
}

module.exports = { authenticateSession };