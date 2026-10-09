import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Users } from 'lucide-react';
import { motion } from 'framer-motion';

import { roomApi } from '../../services/roomApi';
import {
  createRoomEncryptionKey,
  getOrCreateIdentity,
} from '../../crypto/roomKeyManager';

import { createChatEncryptionKey } from '../../crypto/chatKeyManager';

export const CreateRoomForm = () => {
  const [roomName, setRoomName] = useState('');
  const [displayName, setOwnerName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleCreateRoom = async (e) => {
    e.preventDefault();

    setError('');

    const trimmedRoomName = roomName.trim();
    const trimmedDisplayName = displayName.trim();

    // Client-side validation
    if (!trimmedRoomName) {
      setError('Please enter a room name.');
      return;
    }

    if (!trimmedDisplayName) {
      setError('Please enter your name.');
      return;
    }

    if (trimmedRoomName.length < 3) {
      setError('Room name must be at least 3 characters.');
      return;
    }

    try {
      setLoading(true);

      const response = await roomApi.createRoom({
        roomName: trimmedRoomName,
        displayName: trimmedDisplayName,
        durationMinutes: 1440
      });

      if (!response.success || !response.room) {
        throw new Error(
          response.error || 'Failed to create room.'
        );
      }


      const {
        roomId,
        accessKey,
        roomName,
        expiresAt
      } = response.room;


      await createRoomEncryptionKey(roomId);

      await createChatEncryptionKey(roomId);

      await getOrCreateIdentity();


      navigate('/room-created', {
        state: {
          roomId,
          roomName,
          accessKey,
          expiresAt
        }
      });

    } catch (err) {

      setError(
        err.response?.data?.error ||
        err.message ||
        'An error occurred while creating the room.'
      );
    } finally {
      setLoading(false);
    }
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
          Create a room
        </h2>

        <p className="text-body text-text-secondary">
          Create a secure space to share secrets with your team.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-semantic-danger/10 border border-semantic-danger/30 text-semantic-danger rounded-lg text-sm">
          {error}
        </div>
      )}

      <form
        onSubmit={handleCreateRoom}
        className="flex flex-col gap-5"
      >
        {/* Room Name */}
        <div>
          <label className="block text-mono text-text-secondary text-xs mb-1.5">
            ROOM NAME
          </label>

          <input
            type="text"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            maxLength={60}
            autoFocus
            className="w-full bg-canvas-black border border-surface-border rounded-lg px-4 py-3 text-body text-text-primary focus:outline-none focus:border-brand-mint transition-colors"
            placeholder="e.g. Production Backend"
          />
        </div>

        <div>
          <label className="block text-mono text-text-secondary text-xs mb-1.5">
            DISPLAY NAME
          </label>

          <input
            type="text"
            value={displayName}
            onChange={(e) => setOwnerName(e.target.value)}
            maxLength={60}

            className="w-full bg-canvas-black border border-surface-border rounded-lg px-4 py-3 text-body text-text-primary focus:outline-none focus:border-brand-mint transition-colors"
            placeholder="e.g. Leader - Dravid"
          />
        </div>

        <div>

          <p className="text-xs text-text-secondary mt-2">
            The room will automatically expire after 24 hours.
          </p>
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

          {loading ? 'Creating Room...' : 'Create Room'}
        </button>
      </form>
    </motion.div>
  );
};