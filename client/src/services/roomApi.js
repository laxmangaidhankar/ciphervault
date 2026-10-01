import axios from 'axios';

import config from '../config/env';

const API_BASE = config.apiBaseUrl;

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const roomApi = {
  createRoom: async ({ roomName, displayName, durationMinutes = 1440 }) => {
    const response = await api.post('/api/v1/rooms', {
      roomName,
      displayName,
      durationMinutes
    });

    return response.data;
  },

 getRoomStatus: async (roomId) => {
    const response = await api.get(
      `/api/v1/rooms/${roomId}/status`
    );

    return response.data;
  },

   getRoom: async (roomId) => {
    const response = await api.get(
      `/api/v1/rooms/${roomId}`
    );

    return response.data;
  },

  joinRoom: async (roomId, data) => {
    const response = await api.post(
      `/api/v1/rooms/${roomId}/join`,
      data
    );

    return response.data;
  },

  uploadFile: async (roomId, filePayload) => {
    const response = await api.post(`/v1/rooms/files/${roomId}`, filePayload);
    return response.data;
  },

  getFiles: async (roomId) => {
    const response = await api.get(`/v1/rooms/files/${roomId}`);
    return response.data;
  },

  deleteFile: async (roomId, fileId) => {
    const response = await api.delete(
      `/v1/rooms/files/${roomId}/${fileId}`
    );
    return response.data;
  }
};