const Room = require('../models/Room');


let cleanupInterval = null;

const startCleanupService = (io, intervalMs = 30000) => {
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
  }


  cleanupInterval = setInterval(async () => {
    try {
      const now = new Date();

      // Find active rooms that have expired
      const expiredRooms = await Room.find({
        status: 'active',
        expiresAt: { $lte: now }
      });

      if (expiredRooms.length > 0) {

        for (const room of expiredRooms) {
          // Mark room status as expired
          room.status = 'expired';
          await room.save();


          // Emit live socket event to notify connected clients
          if (io) {
            io.to(room.roomId).emit('room:expired', {
              roomId: room.roomId,
              message: 'This room has reached its expiration time. All encrypted data has been permanently erased.'
            });
          }
        }
      }
    } catch (error) {
    }
  }, intervalMs);
};

const stopCleanupService = () => {
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    cleanupInterval = null;
  }
};

module.exports = {
  startCleanupService,
  stopCleanupService
};
