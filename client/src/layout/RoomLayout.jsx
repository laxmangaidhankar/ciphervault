import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import config from "../config/env";
import {
  getChatEncryptionKey,
  requireChatEncryptionKey,
  wrapChatEncryptionKey,
  unwrapAndSaveChatEncryptionKey,
} from "../crypto/chatKeyManager";

import { encryptData } from '../crypto/encryptData';
import { decryptData } from '../crypto/decryptData';


import {
  getRoomEncryptionKey,
  wrapRoomEncryptionKey,
  unwrapAndSaveRoomEncryptionKey,
  getOrCreateIdentity,
} from '../crypto/roomKeyManager';


import { Header } from './Header';
import { ChatPanel } from '../components/room/ChatPanel';
import { EnvFilesPanel } from '../components/room/EnvFilesPanel';
import { MembersPanel } from '../components/room/MembersPanel';



import { roomApi } from '../services/roomApi';
import RoomNotFound from '../pages/RoomNotFound';
import {
  exportECDHPublicKey,
  importECDHPublicKey,
  deriveSharedSecret,
} from '../crypto/ecdhKeyManager';



import {
  arrayBufferToBase64Url,
  base64UrlToArrayBuffer,
} from '../crypto/keyManager';

import {
  derivePairwiseKey,
} from '../crypto/keyDerivation';




const RoomLayout = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();

const pendingChatKeyRequestsRef =
  useRef(new Map());

  const socketRef = useRef(null);
  const [roomKeyReady, setRoomKeyReady] = useState(false);
  const pairwiseKeysRef = useRef(new Map());
  const pendingRoomKeyRequestsRef = useRef(new Map());
  const [loading, setLoading] = useState(true);
  const [room, setRoom] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [members, setMembers] = useState([]);
  const [envVersion, setEnvVersion] = useState(0);
  const [messages, setMessages] = useState([]);


  const [participantPublicKeys, setParticipantPublicKeys] =
    useState({});


  const requestRoomKeyIfNeeded = async (socket) => {
    try {
      const existingRoomKey =
        await getRoomEncryptionKey(roomId);

      if (existingRoomKey) {
        setRoomKeyReady(true);

        return;
      }

      socket.emit("room:key:request");

    } catch (error) {

    }
  };





  const derivePairwiseKeyForParticipant = async (
    participantId,
    publicKeyString
  ) => {
    try {



      const identity =
        await getOrCreateIdentity();

      const publicKeyBuffer =
        base64UrlToArrayBuffer(
          publicKeyString
        );

      const peerPublicKey =
        await importECDHPublicKey(
          publicKeyBuffer
        );

      const sharedSecret =
        await deriveSharedSecret(
          identity.privateKey,
          peerPublicKey
        );


      const pairwiseKey =
        await derivePairwiseKey(
          sharedSecret
        );


      pairwiseKeysRef.current.set(
        participantId,
        pairwiseKey
      );



      return pairwiseKey;

    } catch (error) {


      return null;
    }
  };

  const shareRoomKeyWithParticipant = async (
    socket,
    participantId
  ) => {
    try {


      const roomKey =
        await getRoomEncryptionKey(roomId);

      if (!roomKey) {


        return;
      }

      const pairwiseKey =
        pairwiseKeysRef.current.get(
          participantId
        );

      if (!pairwiseKey) {


        return;
      }

      const wrapped =
        await wrapRoomEncryptionKey(
          roomId,
          pairwiseKey
        );



      socket.emit(
        "room:key:share",
        {
          recipientParticipantId:
            participantId,

          wrappedKey:
            wrapped.wrappedKey,

          iv:
            wrapped.iv,
        }
      );


      pendingRoomKeyRequestsRef.current.delete(
        participantId
      );

    } catch (error) {

    }
  };



  const shareChatKeyWithParticipant = async (
    socket,
    participantId
  ) => {
    try {
      console.log(
        "[Chat Crypto] Attempting to share Chat Key with:",
        participantId
      );

      const chatKey =
        await requireChatEncryptionKey(
          roomId
        );

      if (!chatKey) {
        console.log(
          "[Chat Crypto] I don't have the Chat Key."
        );

        return;
      }

      const pairwiseKey =
        pairwiseKeysRef.current.get(
          participantId
        );

      if (!pairwiseKey) {
        console.log(
          "[Chat Crypto] Pairwise key unavailable for:",
          participantId
        );

        return;
      }

      const wrapped =
        await wrapChatEncryptionKey(
          roomId,
          pairwiseKey
        );

      socket.emit(
        "chat:key:share",
        {
          recipientParticipantId:
            participantId,

          wrappedKey:
            wrapped.wrappedKey,

          iv:
            wrapped.iv,
        }
      );

      console.log(
        `[Chat Crypto] Chat Key shared with ${participantId}`
      );

    } catch (error) {
      console.error(
        "[Chat Crypto] Failed to share Chat Key:",
        error
      );
    }
  };

const requestChatKeyIfNeeded = async (socket) => {
  try {
    const existingChatKey =
      await getChatEncryptionKey(roomId);

    if (existingChatKey) {
      console.log(
        `[Chat Crypto] Chat Key already available for ${roomId}`
      );

      return;
    }

    console.log(
      `[Chat Crypto] No Chat Key found for ${roomId}. Requesting...`
    );

    socket.emit("chat:key:request");

  } catch (error) {
    console.error(
      "[Chat Crypto] Failed to check Chat Key:",
      error
    );
  }
};




  const sendMessage = async (message) => {
    try {
      if (!roomId) {
        throw new Error("Room ID is missing.");
      }

      const socket = socketRef.current;

      if (!socket) {
        throw new Error("Socket connection is not ready.");
      }

      const trimmedMessage =
        message.trim();

      if (!trimmedMessage) {
        return;
      }

      const chatKey =
        await requireChatEncryptionKey(
          roomId
        );

      console.log(
        "[Chat] Encrypting message..."
      );

      const encryptedMessage =
        await encryptData(
          trimmedMessage,
          chatKey
        );

      socket.emit("chat:send", {
        ciphertext:
          encryptedMessage.ciphertext,

        iv:
          encryptedMessage.iv,
      });

    } catch (error) {
      console.error(
        "[Chat] Failed to encrypt message:",
        error
      );

      throw error;
    }
  };


  useEffect(() => {
    const checkRoom = async () => {
      try {
        // First check whether the room exists
        const statusResponse =
          await roomApi.getRoomStatus(roomId);

        if (!statusResponse.success || !statusResponse.room) {
          setNotFound(true);
          return;
        }

        const response = await roomApi.getRoom(roomId);

        if (!response.success || !response.room) {
          navigate(`/join/${roomId}`, {
            replace: true,
          });
          return;
        }

        setRoom(response.room);

      } catch (error) {

        const status = error.response?.status;

        if (status === 404) {
          setNotFound(true);
        } else if (status === 401) {
          navigate(`/join/${roomId}`, {
            replace: true,
          });
        } else if (status === 403) {
          navigate(`/join/${roomId}`, {
            replace: true,
          });
        } else {
          setNotFound(true);
        }
      } finally {
        setLoading(false);
      }
    };

    checkRoom();
  }, [roomId, navigate]);


  useEffect(() => {
    if (!room) return;

    const socket = io(config.apiBaseUrl, {
      withCredentials: true,
    });

    socketRef.current = socket;

    socket.on("connect", async () => {

      socket.emit("join-room");

      try {
        const identity = await getOrCreateIdentity();


        const publicKeyBuffer =
          await exportECDHPublicKey(identity.publicKey);

        const publicKey =
          arrayBufferToBase64Url(publicKeyBuffer);

        socket.emit("key:publish", {
          publicKey,
        });

      } catch (error) {

      }
    });

    socket.on(
      "room:key:request",
      async (data) => {
        try {


          const pairwiseKey =
            pairwiseKeysRef.current.get(
              data.participantId
            );

          if (!pairwiseKey) {


            pendingRoomKeyRequestsRef.current.set(
              data.participantId,
              true
            );

            return;
          }

          await shareRoomKeyWithParticipant(
            socket,
            data.participantId
          );

        } catch (error) {

        }
      }
    );


    socket.on(
  "chat:key:request",
  async (data) => {
    try {
      console.log(
        "[Chat Crypto] Chat Key requested by:",
        data.participantId
      );

      const pairwiseKey =
        pairwiseKeysRef.current.get(
          data.participantId
        );

      if (!pairwiseKey) {
  pendingChatKeyRequestsRef.current.set(
    data.participantId,
    true
  );

  return;
}

      await shareChatKeyWithParticipant(
        socket,
        data.participantId
      );

    } catch (error) {
      console.error(
        "[Chat Crypto] Failed to process Chat Key request:",
        error
      );
    }
  }
);



socket.on(
  "chat:key:share",
  async (data) => {
    try {
      if (
        data.recipientParticipantId !==
        room.participantId
      ) {
        return;
      }

      console.log(
        "[Chat Crypto] Chat Key received."
      );

      const pairwiseKey =
        pairwiseKeysRef.current.get(
          data.senderParticipantId
        );

      if (!pairwiseKey) {
        console.error(
          "[Chat Crypto] Pairwise key not found."
        );

        return;
      }

      await unwrapAndSaveChatEncryptionKey(
        roomId,
        data.wrappedKey,
        data.iv,
        pairwiseKey
      );

      console.log(
        "[Chat Crypto] Chat Key saved successfully."
      );

    } catch (error) {
      console.error(
        "[Chat Crypto] Failed to unwrap Chat Key:",
        error
      );
    }
  }
);




    socket.on(
      "room:key:share",
      async (data) => {
        try {
          // Ignore Room Key messages intended for someone else
          if (
            data.recipientParticipantId !==
            room.participantId
          ) {
            return;
          }



          // Get the pairwise key we derived earlier
          const pairwiseKey =
            pairwiseKeysRef.current.get(
              data.senderParticipantId
            );

          if (!pairwiseKey) {


            return;
          }

          // Unwrap and store the Room AES key
          await unwrapAndSaveRoomEncryptionKey(
            roomId,
            data.wrappedKey,
            data.iv,
            pairwiseKey
          );



          setRoomKeyReady(true);

        } catch (error) {

        }
      }
    );

    socket.on("room:members", (data) => {

      setMembers(data.participants);
    });

    socket.on("env:updated", (data) => {
      if (data.roomId !== roomId) {
        return;
      }

      // The sender already updated its own UI locally.
      if (data.updatedBy === room.participantId) {
        return;
      }


      setEnvVersion((prev) => prev + 1);
    });

    socket.on(
  "key:existing-participants",
  async (data) => {
    try {
      const keyMap = {};

      for (
        const participant
        of data.participants
      ) {
        keyMap[
          participant.participantId
        ] = {
          displayName:
            participant.displayName,

          publicKey:
            participant.publicKey,
        };

        await derivePairwiseKeyForParticipant(
          participant.participantId,
          participant.publicKey
        );
      }

      setParticipantPublicKeys(
        keyMap
      );

      // Check whether we already have the Room Key.
      // If not, request it from an existing participant.
      await requestRoomKeyIfNeeded(socket);

      // Check whether we already have the Chat Key.
      // If not, request it from an existing participant.
      await requestChatKeyIfNeeded(socket);

    } catch (error) {
      console.error(
        "[Crypto] Failed to process existing participants:",
        error
      );
    }
  }
);


    socket.on(
      "key:participant-public",
      async (data) => {


        setParticipantPublicKeys((prev) => ({
          ...prev,
          [data.participantId]: {
            displayName: data.displayName,
            publicKey: data.publicKey,
          },
        }));

        // Derive pairwise key
        const pairwiseKey =
          await derivePairwiseKeyForParticipant(
            data.participantId,
            data.publicKey
          );

        if (!pairwiseKey) {

          return;
        }


        const hasPendingRequest =
          pendingRoomKeyRequestsRef.current.has(
            data.participantId
          );

        if (hasPendingRequest) {


          await shareRoomKeyWithParticipant(
            socket,
            data.participantId
          );
        }

        const hasPendingChatKeyRequest =
  pendingChatKeyRequestsRef.current.has(
    data.participantId
  );

if (hasPendingChatKeyRequest) {
  await shareChatKeyWithParticipant(
    socket,
    data.participantId
  );

  pendingChatKeyRequestsRef.current.delete(
    data.participantId
  );
}


        // Check/request Room Key for ourselves
        await requestRoomKeyIfNeeded(socket);
        await requestChatKeyIfNeeded(socket);
      }
    );

    socket.on(
      "chat:message",
      async (encryptedMessage) => {
        try {
          console.log(
            "[Chat] Encrypted message received"
          );

          const chatKey =
            await requireChatEncryptionKey(
              roomId
            );

          const decryptedMessage =
            await decryptData(
              {
                ciphertext:
                  encryptedMessage.ciphertext,

                iv:
                  encryptedMessage.iv,
              },
              chatKey
            );

          const chatMessage = {
            messageId:
              encryptedMessage.messageId,

            participantId:
              encryptedMessage.participantId,

            displayName:
              encryptedMessage.displayName,

            message:
              decryptedMessage,

            timestamp:
              encryptedMessage.timestamp,
          };

          setMessages((prev) => [
            ...prev,
            chatMessage,
          ]);

        } catch (error) {
          console.error(
            "[Chat] Failed to decrypt message:",
            error
          );
        }
      }
    );


    return () => {
      socket.emit("leave-room");
      socket.disconnect();

      socketRef.current = null;
    };
  }, [room]);




  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-950 text-white">
        Loading room...
      </div>
    );
  }

  if (notFound) {
    return <RoomNotFound />;
  }

  if (!room) {
    return null;
  }
  return (
    <div className="flex flex-col h-screen w-full overflow-hidden  bg-gray-950 text-white">
      <Header room={room} />

      <div className="flex flex-1 min-h-0 w-full">
        <div className="w-110 shrink-0">
          <ChatPanel messages={messages}
            onSendMessage={sendMessage}
            currentParticipantId={room.participantId} />
        </div>

        <div className="flex-1 min-w-0">
          <EnvFilesPanel room={room} roomKeyReady={roomKeyReady} envVersion={envVersion} />
        </div>

        <div className="w-110 shrink-0">
          <MembersPanel room={room} members={members} />
        </div>
      </div>
    </div>
  );
};

export default RoomLayout;