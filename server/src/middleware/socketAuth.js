const jwt = require('jsonwebtoken');
const env = require('../config/env');

const socketAuth = (socket, next) => {
  try {
    const cookieHeader =
      socket.handshake.headers.cookie;

    if (!cookieHeader) {
      return next(
        new Error('Authentication required.')
      );
    }

    const cookies = {};

    cookieHeader.split(';').forEach((cookie) => {
      const [name, ...valueParts] =
        cookie.trim().split('=');

      cookies[name] =
        decodeURIComponent(valueParts.join('='));
    });

    const sessionToken =
      cookies.session;

    if (!sessionToken) {
      return next(
        new Error('Session cookie missing.')
      );
    }

    const decoded =
      jwt.verify(
        sessionToken,
        env.JWT_SECRET
      );

    if (
      !decoded.roomId ||
      !decoded.participantId
    ) {
      return next(
        new Error('Invalid room session.')
      );
    }

    socket.user = {
      roomId: decoded.roomId,
      participantId: decoded.participantId,
      displayName: decoded.displayName,
      role: decoded.role,
      expiresAt: decoded.expiresAt,
    };

    next();

  } catch (error) {
    console.error(
      '[Socket Auth Error]',
      error.message
    );

    next(
      new Error('Socket authentication failed.')
    );
  }
};

module.exports = {
  socketAuth,
};