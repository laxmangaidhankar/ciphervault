
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, KeyRound, User } from 'lucide-react';
import { motion } from 'framer-motion';

export const JoinRoomForm = () => {
  const [roomKey, setRoomKey] = useState('');
  const [accessKey, setAccessKey] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const trimmedRoomKey = roomKey.trim();
    const trimmedAccessKey = accessKey.trim();
    const trimmedDisplayName = displayName.trim();

    if (!trimmedRoomKey) {
      setError('Enter the room key');
      return;
    }

    if (!trimmedAccessKey) {
      setError('Enter the access key');
      return;
    }

    if (!trimmedDisplayName) {
      setError('Enter your display name');
      return;
    }

    if (trimmedDisplayName.length < 2) {
      setError('Display name must be at least 2 characters');
      return;
    }

    if (trimmedDisplayName.length > 30) {
      setError('Display name must be 30 characters or less');
      return;
    }

    setLoading(true);

    // Replace this with your API call later
    setTimeout(() => {
      navigate('/room');
    }, 800);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="bg-surface-slate border border-surface-border p-8 rounded-2xl shadow-xl w-full"
    >
      <div className="mb-8">
        <h2 className="text-heading-lg text-text-primary mb-2 text-2xl">
          Join a room
        </h2>

        <p className="text-body text-text-secondary">
          Enter your room and access keys to join securely.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-semantic-danger/10 border border-semantic-danger/30 text-semantic-danger rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">

        {/* Room Key */}
        <div>
          <label className="block text-mono text-text-secondary text-xs mb-1.5">
            ROOM KEY
          </label>

          <div className="relative">
            <KeyRound
              className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary"
            />

            <input
              type="text"
              value={roomKey}
              onChange={(e) => setRoomKey(e.target.value)}
              autoComplete="off"
              className="w-full bg-canvas-black border border-surface-border rounded-lg pl-11 pr-4 py-3 text-body text-text-primary focus:outline-none focus:border-brand-mint transition-colors font-mono"
              placeholder="ROOM-XXXX-XXXX"
            />
          </div>
        </div>

        {/* Access Key */}
        <div>
          <label className="block text-mono text-text-secondary text-xs mb-1.5">
            ACCESS KEY
          </label>

          <div className="relative">
            <KeyRound
              className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary"
            />

            <input
              type="password"
              value={accessKey}
              onChange={(e) => setAccessKey(e.target.value)}
              autoComplete="off"
              className="w-full bg-canvas-black border border-surface-border rounded-lg pl-11 pr-4 py-3 text-body text-text-primary focus:outline-none focus:border-brand-mint transition-colors font-mono"
              placeholder="Enter access key"
            />
          </div>

          <p className="text-xs text-text-secondary mt-2">
            Your access key determines what you can do in this room.
          </p>
        </div>

        {/* Display Name */}
        <div>
          <label className="block text-mono text-text-secondary text-xs mb-1.5">
            DISPLAY NAME
          </label>

          <div className="relative">
            <User
              className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary"
            />

            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={30}
              autoComplete="nickname"
              className="w-full bg-canvas-black border border-surface-border rounded-lg pl-11 pr-4 py-3 text-body text-text-primary focus:outline-none focus:border-brand-mint transition-colors"
              placeholder="e.g. Laxman"
            />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-text-primary text-canvas-black rounded-button py-3 mt-3 font-mono text-xs uppercase tracking-wider hover:bg-brand-mint transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
        >
          {loading && (
            <Loader2 className="w-4 h-4 animate-spin" />
          )}

          {loading ? 'Joining Room...' : 'Join Room'}
        </button>
      </form>
    </motion.div>
  );
};

