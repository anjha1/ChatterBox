// server/routes/chatRoutes.js
const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroup,
  addToGroup,
  removeFromGroup,
  fetchGroupChatDetails,
  leaveGroupChat,
} = require('../controllers/chatController');

const router = express.Router();

// All routes are protected
router.use(protect);

// Access a chat (create if it doesn't exist, for 1-to-1)
router.post('/', accessChat);

// Fetch all chats for the logged-in user
router.get('/', fetchChats);

// Group Chat specific routes
router.post('/group', createGroupChat);
router.put('/group/rename', renameGroup);
router.put('/group/add', addToGroup);
router.put('/group/remove', removeFromGroup);
router.get('/group/:chatId', fetchGroupChatDetails);
router.put('/group/leave/:chatId', leaveGroupChat);

module.exports = router;
