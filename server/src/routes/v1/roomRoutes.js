const express = require('express');
const roomRouter = express.Router();
const { createRoom, getRoom, joinRoom } = require('../../controllers/roomController');
const { verifyRoomActive } = require('../../middleware/roomAccess');
const { roomCreateLimiter, roomJoinLimiter } = require('../../middleware/rateLimiter');
const { authenticateRoom} = require('../../middleware/authenticateRoom');
const {roomMiddleware} = require('../../middleware/roomMiddleware');


// POST /api/rooms - Create a new room
roomRouter.post('/', roomCreateLimiter, createRoom);

// GET /api/rooms/:roomId - Check room status
roomRouter.get('/:roomId', roomJoinLimiter,authenticateRoom, verifyRoomActive, getRoom);


roomRouter.post('/:roomId/join',roomMiddleware, joinRoom );


module.exports = roomRouter;
