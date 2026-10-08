const express = require('express');

const router = express.Router();

const fileRoutes = require('./v1/fileRoutes');
const roomRoutes = require('./v1/roomRoutes');
const envRoutes = require('./v1/envRoutes');

router.use('/rooms/files', fileRoutes);
router.use('/rooms', roomRoutes);
router.use('/rooms', envRoutes);


module.exports = router;