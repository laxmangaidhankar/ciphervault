const crypto = require("crypto");

let socketIO = null;

const emitEnvUpdated = (roomId, updatedBy) => {
  if (!socketIO) {
    return;
  }

  socketIO.to(roomId).emit("env:updated", {
    roomId,
    updatedBy,
  });
};

const initSocketService = (io) => {
  socketIO = io;
  // roomId => Map(participantId => participant)
  const roomParticipants = new Map();

  io.on("connection", (socket) => {
    //join-room
    socket.on("join-room", () => {
      const { roomId, participantId, displayName } = socket.user;

      if (!roomId || !participantId || !displayName) {
        return;
      }

      // Prevent the same socket from joining twice
      if (socket.currentRoomId) {
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
          publicKey: null,
        });
      }

      const participant = participants.get(participantId);

      participant.socketIds.add(socket.id);

      //memebers list who join in the room
      const participantList = Array.from(participants.values()).map(
        (participant) => ({
          participantId: participant.participantId,

          displayName: participant.displayName,
        }),
      );

      io.to(cleanRoomId).emit("room:members", {
        participants: participantList,

        participantCount: participantList.length,
      });

      //public key if existing available
      const existingPublicKeys = Array.from(participants.values())
        .filter(
          (participant) =>
            participant.publicKey &&
            participant.participantId !== participantId,
        )
        .map((participant) => ({
          participantId: participant.participantId,

          displayName: participant.displayName,

          publicKey: participant.publicKey,
        }));

      socket.emit("key:existing-participants", {
        participants: existingPublicKeys,
      });
    });

    //chat
    socket.on("chat:send", ({ ciphertext, iv }) => {
      if (!socket.currentRoomId || !socket.participantId) {
        return;
      }

      if (
        typeof ciphertext !== "string" ||
        !ciphertext ||
        typeof iv !== "string" ||
        !iv
      ) {
        return;
      }

      const chatMessage = {
        messageId: crypto.randomUUID(),

        participantId: socket.participantId,

        displayName: socket.displayName,

        ciphertext,
        iv,

        timestamp: new Date().toISOString(),
      };

      io.to(socket.currentRoomId).emit("chat:message", chatMessage);
    });

    socket.on("chat:key:request", () => {
      if (!socket.currentRoomId || !socket.participantId) {
        return;
      }

      socket.to(socket.currentRoomId).emit("chat:key:request", {
        participantId: socket.participantId,

        displayName: socket.displayName,
      });
    });

    socket.on(
      "chat:key:share",
      ({ recipientParticipantId, wrappedKey, iv }) => {
        if (!socket.currentRoomId || !socket.participantId) {
          return;
        }

        if (!recipientParticipantId || !wrappedKey || !iv) {
          return;
        }

        const participants = roomParticipants.get(socket.currentRoomId);

        if (!participants) {
          return;
        }

        const recipient = participants.get(recipientParticipantId);

        if (!recipient) {
          return;
        }

        for (const socketId of recipient.socketIds) {
          io.to(socketId).emit("chat:key:share", {
            senderParticipantId: socket.participantId,

            recipientParticipantId,

            wrappedKey,

            iv,
          });
        }
      },
    );

    //public key sharing
    socket.on("key:publish", ({ publicKey }) => {
      if (!socket.currentRoomId || !socket.participantId) {
        return;
      }

      if (typeof publicKey !== "string" || !publicKey) {
        return;
      }

      const participants = roomParticipants.get(socket.currentRoomId);

      if (!participants) {
        return;
      }

      const participant = participants.get(socket.participantId);

      if (!participant) {
        return;
      }

      participant.publicKey = publicKey;

      //public key sharing to each members
      socket.to(socket.currentRoomId).emit("key:participant-public", {
        participantId: socket.participantId,

        displayName: socket.displayName,

        publicKey,
      });
    });

    socket.on("room:key:request", () => {
      if (!socket.currentRoomId || !socket.participantId) {
        return;
      }

      /*
       * Tell every other participant:
       *
       * "This participant needs the Room Key."
       *
       * The requester does not receive
       * their own request.
       */
      socket.to(socket.currentRoomId).emit("room:key:request", {
        participantId: socket.participantId,

        displayName: socket.displayName,
      });
    });

    //ecrypted way room key sharing with ecdh
    socket.on(
      "room:key:share",
      ({ recipientParticipantId, wrappedKey, iv }) => {
        if (!socket.currentRoomId || !socket.participantId) {
          return;
        }

        if (!recipientParticipantId || !wrappedKey || !iv) {
          return;
        }

        const participants = roomParticipants.get(socket.currentRoomId);

        if (!participants) {
          return;
        }

        /*
         * Verify that the recipient is
         * actually inside this room.
         */
        const recipient = participants.get(recipientParticipantId);

        if (!recipient) {
          return;
        }

        /*
         * The server ONLY forwards the encrypted
         * / wrapped Room Key.
         *
         * Server never sees:
         *
         * - Room AES Key
         * - Pairwise AES Key
         * - Plaintext ENV values
         */
        io.to(socket.currentRoomId).emit("room:key:share", {
          senderParticipantId: socket.participantId,

          recipientParticipantId,

          wrappedKey,

          iv,
        });
      },
    );

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

    socket.on("disconnect", () => {
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

      /*
       * Remove participant only when
       * their last socket disconnects.
       */
      if (participant.socketIds.size === 0) {
        participants.delete(participantId);
      }

      //there is no one in the room
      if (participants.size === 0) {
        roomParticipants.delete(roomId);

        return;
      }

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
  emitEnvUpdated,
};
