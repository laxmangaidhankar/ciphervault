const crypto = require('crypto');

const initSocketService = (io) => {
  // roomId => Map(participantId => participant)
  const roomParticipants = new Map();

  io.on("connection", (socket) => {
    console.log(`[Socket Connected] ID: ${socket.id}`);

    // Join room
    socket.on("join-room", ({ roomId, participantId, displayName }) => {
      if (!roomId || !participantId || !displayName) {
        return;
      }

      const cleanRoomId = roomId.toUpperCase();

      socket.join(cleanRoomId);

      // Store information on this socket
      socket.currentRoomId = cleanRoomId;
      socket.participantId = participantId;
      socket.displayName = displayName;

      // Create room if it doesn't exist
      if (!roomParticipants.has(cleanRoomId)) {
        roomParticipants.set(cleanRoomId, new Map());
      }

      const participants = roomParticipants.get(cleanRoomId);

      // Create participant only if they don't already exist
      if (!participants.has(participantId)) {
        participants.set(participantId, {
          participantId,
          displayName,
          socketIds: new Set(),
        });
      }

      const participant = participants.get(participantId);

      participant.socketIds.add(socket.id);

      const participantList = Array.from(participants.values()).map(
        (participant) => ({
          participantId: participant.participantId,
          displayName: participant.displayName,
        }),
      );

      console.log(
        `[Socket Join] ${displayName} joined ${cleanRoomId}. ` +
          `Total participants: ${participantList.length}`,
      );

      io.to(cleanRoomId).emit("room:members", {
        participants: participantList,
        participantCount: participantList.length,
      });
    });

    socket.on("chat:send", ({ message }) => {
      if (!socket.currentRoomId || !socket.participantId) {
        return;
      }

      const trimmedMessage = String(message || "").trim();

      if (!trimmedMessage) {
        return;
      }

      const chatMessage = {
        messageId: crypto.randomUUID(),
        participantId: socket.participantId,
        displayName: socket.displayName,
        message: trimmedMessage,
        timestamp: new Date().toISOString(),
      };

      io.to(socket.currentRoomId).emit("chat:message", chatMessage);
    });

    // Leave room
    socket.on("leave-room", () => {
      if (!socket.currentRoomId || !socket.participantId) {
        return;
      }

      removeParticipantConnection(
        socket.currentRoomId,
        socket.participantId,
        socket.id,
      );
    });

    // Disconnect
    socket.on("disconnect", () => {
      console.log(`[Socket Disconnected] ID: ${socket.id}`);

      if (socket.currentRoomId && socket.participantId) {
        removeParticipantConnection(
          socket.currentRoomId,
          socket.participantId,
          socket.id,
        );
      }
    });

    function removeParticipantConnection(roomId, participantId, socketId) {
      const participants = roomParticipants.get(roomId);

      if (!participants) {
        return;
      }

      const participant = participants.get(participantId);

      if (!participant) {
        return;
      }

      participant.socketIds.delete(socketId);

      socket.leave(roomId);

      if (participant.socketIds.size === 0) {
        participants.delete(participantId);
      }

      // Remove empty room
      if (participants.size === 0) {
        roomParticipants.delete(roomId);
        return;
      }

      // Send updated member list
      const participantList = Array.from(participants.values()).map(
        (participant) => ({
          participantId: participant.participantId,
          displayName: participant.displayName,
        }),
      );

      io.to(roomId).emit("room:members", {
        participants: participantList,
        participantCount: participantList.length,
      });
    }
  });
};

module.exports = {
  initSocketService,
};
