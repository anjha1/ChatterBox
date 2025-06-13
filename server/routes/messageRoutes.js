// server/routes/messageRoutes.js
const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { allMessages, sendMessage } = require('../controllers/messageController');

const router = express.Router();

// All routes are protected
router.use(protect);

// Fetch all messages for a specific chat
router.get('/:chatId', allMessages);

// Send a new message
router.post('/', sendMessage);

module.exports = router;
