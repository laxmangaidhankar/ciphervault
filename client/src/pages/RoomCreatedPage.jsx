import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const RoomCreatedPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [copied, setCopied] = useState('');

  const roomData = location.state;


  if (!roomData?.roomId || !roomData?.accessKey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#090d16] text-white">
        <div className="text-center">
          <h1 className="text-2xl font-semibold">
            Credential Page Unavailable
          </h1>

          <p className="mt-2 text-gray-400">
            Room credentials are only shown immediately after room creation.
          </p>

          <button
            onClick={() => navigate('/')}
            className="mt-6 px-5 py-2 rounded-lg bg-cyan-500 text-black font-medium"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const {
    roomId,
    roomName,
    accessKey,
    expiresAt
  } = roomData;

  const copyToClipboard = async (value, type) => {
    try {
      await navigator.clipboard.writeText(value);

      setCopied(type);

      setTimeout(() => {
        setCopied('');
      }, 1500);
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };

  const downloadCredentials = () => {
    const credentials = {
      room: {
        roomId,
        roomName,
        expiresAt
      },
      access: {
        accessKey
      }
    };

    const blob = new Blob(
      [JSON.stringify(credentials, null, 2)],
      {
        type: 'application/json'
      }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');

    link.href = url;
    link.download = `room-${roomId}-credentials.json`;

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  const enterRoom = () => {
    navigate(`/room/${roomId}`, {
      replace: true
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#090d16] text-white px-4">

      <div className="w-full max-w-xl">

        {/* Header */}

        <div className="text-center mb-8">

          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-cyan-500/10 border border-cyan-500/30 mb-4">
            <span className="text-cyan-400 text-xl">
              ✓
            </span>
          </div>

          <h1 className="text-3xl font-semibold">
            Room Created
          </h1>

          <p className="mt-2 text-gray-400">
            Save your room credentials before entering the room.
          </p>

        </div>

        <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 space-y-5">

          {/* Room Name */}

          <div>
            <label className="text-xs uppercase tracking-wider text-gray-500">
              Room Name
            </label>

            <p className="mt-2 text-white">
              {roomName}
            </p>
          </div>


          {/* Room ID */}

          <div>

            <label className="text-xs uppercase tracking-wider text-gray-500">
              Room ID
            </label>

            <div className="mt-2 flex items-center gap-2">

              <div className="flex-1 px-4 py-3 rounded-lg bg-[#090d16] border border-gray-700 font-mono text-cyan-400">
                {roomId}
              </div>

              <button
                onClick={() => copyToClipboard(roomId, 'roomId')}
                className="px-4 py-3 rounded-lg border border-gray-700 hover:bg-gray-800 transition"
              >
                {copied === 'roomId' ? 'Copied' : 'Copy'}
              </button>

            </div>

          </div>


          <div>

            <label className="text-xs uppercase tracking-wider text-gray-500">
              Access Key
            </label>

            <div className="mt-2 flex items-center gap-2">

              <div className="flex-1 px-4 py-3 rounded-lg bg-[#090d16] border border-gray-700 font-mono text-emerald-400 break-all">
                {accessKey}
              </div>

              <button
                onClick={() => copyToClipboard(accessKey, 'accessKey')}
                className="px-4 py-3 rounded-lg border border-gray-700 hover:bg-gray-800 transition"
              >
                {copied === 'accessKey' ? 'Copied' : 'Copy'}
              </button>

            </div>

          </div>


          <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-4">

            <p className="text-sm text-yellow-300">
              Save this access key somewhere safe.
            </p>

            <p className="mt-1 text-xs text-gray-400">
              The server stores only a secure hash of the access key,
              so it cannot be recovered later.
            </p>

          </div>


          {/* Download */}

          <button
            onClick={downloadCredentials}
            className="w-full py-3 rounded-lg border border-gray-700 hover:bg-gray-800 transition font-medium"
          >
            Download Credentials
          </button>


          {/* Enter Room */}

          <button
            onClick={enterRoom}
            className="w-full py-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-semibold transition"
          >
            I've Saved It — Enter Room
          </button>

        </div>


        {/* Expiry */}

        {expiresAt && (
          <p className="mt-4 text-center text-xs text-gray-500">
            Room expires at {new Date(expiresAt).toLocaleString()}
          </p>
        )}

      </div>

    </div>
  );
};

export default RoomCreatedPage;