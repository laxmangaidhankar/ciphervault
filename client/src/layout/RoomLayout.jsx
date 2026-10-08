import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import config from "../config/env";

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


  const sendMessage = (message) => {
    if (!socketRef.current) {
      return;
    }

    socketRef.current.emit("chat:send", {
      message,
    });
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

    const socket = io(config.socketUrl, {
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

        // Creator may already have the Room Key.
        // Joining member may need to request it.
        await requestRoomKeyIfNeeded(socket);
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

        // Check/request Room Key for ourselves
        await requestRoomKeyIfNeeded(socket);
      }
    );

    socket.on("chat:message", (message) => {

      setMessages((prev) => [
        ...prev,
        message,
      ]);
    });


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
    <div className="flex flex-col h-screen w-full overflow-hidden bg-gray-950 text-white">
      <Header room={room} />

      <div className="flex flex-1 min-h-0 w-full">
        <div className="w-100 shrink-0">
          <ChatPanel messages={messages}
            onSendMessage={sendMessage}
            currentParticipantId={room.participantId} />
        </div>

        <div className="flex-1 min-w-0">
          <EnvFilesPanel room={room} roomKeyReady={roomKeyReady} envVersion={envVersion} />
        </div>

        <div className="w-100 shrink-0">
          <MembersPanel room={room} members={members} />
        </div>
      </div>
    </div>
  );
};

export default RoomLayout;