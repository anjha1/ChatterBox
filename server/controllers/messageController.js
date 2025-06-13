// server/controllers/messageController.js
const asyncHandler = require('express-async-handler');
const Message = require('../models/Message');
const User = require('../models/User');
const Chat = require('../models/Chat');
const { getIo } = require('../socket/index'); // Import getIo to access Socket.IO instance

// @desc    Get all messages for a specific chat
// @route   GET /api/messages/:chatId
// @access  Private
const allMessages = asyncHandler(async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate('sender', 'username profilePicture email')
      .populate('chat');

    res.json(messages);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

// @desc    Send a new message
// @route   POST /api/messages
// @access  Private
const sendMessage = asyncHandler(async (req, res) => {
  const { content, chatId, messageType, mediaUrl } = req.body;

  if (!chatId || (!content && !mediaUrl)) {
    console.log('Invalid data passed into request');
    res.status(400);
    throw new Error('Invalid message data');
  }

  var newMessage = {
    sender: req.dbUser._id,
    content: content,
    chat: chatId,
    messageType: messageType || 'text',
    mediaUrl: mediaUrl || undefined,
  };

  try {
    var message = await Message.create(newMessage);

    message = await message.populate('sender', 'username profilePicture');
    message = await message.populate('chat');
    message = await User.populate(message, {
      path: 'chat.users',
      select: 'username profilePicture email',
    });

    // Update latest message in chat
    await Chat.findByIdAndUpdate(req.body.chatId, {
      latestMessage: message,
    });

    // Emit the message to all users in the chat room
    const io = getIo(); // Get the Socket.IO instance
    const chat = await Chat.findById(chatId).populate('users');

    if (chat && chat.users) {
      chat.users.forEach(user => {
        // Don't send to the sender themselves, as they already have it in their UI
        // Or send to all, and frontend handles it (simpler)
        // For simplicity, we broadcast to all users in the chat room
        if (io.sockets.adapter.rooms.get(chatId.toString())) { // Check if the room exists and has members
            io.to(chatId.toString()).emit('message received', message);
        }
      });
    }

    res.status(201).json(message);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

module.exports = {
  allMessages,
  sendMessage
};
