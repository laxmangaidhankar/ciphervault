import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Header } from './Header';
import { ChatPanel } from '../components/room/ChatPanel';
import { EnvFilesPanel } from '../components/room/EnvFilesPanel';
import { MembersPanel } from '../components/room/MembersPanel';

import { roomApi } from '../services/roomApi';
import RoomNotFound from '../pages/RoomNotFound';

const RoomLayout = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [room, setRoom] = useState(null);
  const [notFound, setNotFound] = useState(false);

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

        // Room exists.
        // Now check whether current session can access it.
        const response = await roomApi.getRoom(roomId);

        if (!response.success || !response.room) {
          navigate(`/join/${roomId}`, {
            replace: true,
          });
          return;
        }

        setRoom(response.room);

      } catch (error) {
        console.error('[Room Access Error]:', error);

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
    <div className="flex flex-col h-screen overflow-hidden bg-gray-950 text-white">
      <Header />

      <div className="flex flex-1 min-h-0">
        <ChatPanel />
        <EnvFilesPanel />
        <MembersPanel />
      </div>
    </div>
  );
};

export default RoomLayout;