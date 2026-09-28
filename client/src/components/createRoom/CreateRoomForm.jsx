import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Users } from 'lucide-react';
import { motion } from 'framer-motion';

import { roomApi } from '../../services/roomApi';


export const CreateRoomForm = () => {
  const [roomName, setRoomName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [participants, setParticipants] = useState('5');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleCreateRoom = async (e) => {
    e.preventDefault();

    setError('');

    const trimmedName = roomName.trim();
    const trimmedOwnerName = ownerName.trim();
    const participantCount = Number(participants);

    // Client-side validation
    if (!trimmedName) {
      setError('Please enter a room name.');
      return;
    }
    if (!trimmedOwnerName) {
      setError('Please enter your name.');
      return;
    }

    if (trimmedName.length < 3) {
      setError('Room name must be at least 3 characters.');
      return;
    }

    if (participantCount < 2 || participantCount > 50) {
      setError('Participants must be between 2 and 50.');
      return;
    }

    try {
      setLoading(true);

      const response = await roomApi.createRoom({
        roomName: trimmedName,
        ownerName: trimmedOwnerName,
        maxParticipants: participantCount,
        durationMinutes: 1440
      });

      if (!response.success || !response.room) {
        throw new Error(
          response.error || 'Failed to create room.'
        );
      }

      const { roomId } = response.room;

      navigate(`/join/${roomId}`);

    } catch (err) {
      console.error('[Create Room Error]:', err);

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
            OWNER NAME
          </label>

          <input
            type="text"
            value={ownerName}
            onChange={(e) => setOwnerName(e.target.value)}
            maxLength={60}

            className="w-full bg-canvas-black border border-surface-border rounded-lg px-4 py-3 text-body text-text-primary focus:outline-none focus:border-brand-mint transition-colors"
            placeholder="e.g. Leader - Dravid"
          />
        </div>


        {/* Participants */}
        <div>
          <label className="block text-mono text-text-secondary text-xs mb-1.5">
            MAX PARTICIPANTS
          </label>

          <div className="relative">
            <Users
              className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary"
            />

            <select
              value={participants}
              onChange={(e) => setParticipants(e.target.value)}
              className="w-full appearance-none bg-canvas-black border border-surface-border rounded-lg pl-11 pr-4 py-3 text-body text-text-primary focus:outline-none focus:border-brand-mint transition-colors"
            >
              {[2, 3, 4, 5, 6, 8, 10, 15, 20, 30, 50].map(
                (count) => (
                  <option key={count} value={count}>
                    {count} participants
                  </option>
                )
              )}
            </select>
          </div>

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