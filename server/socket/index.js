// server/socket/index.js
const admin = require('firebase-admin'); // For Firebase Admin SDK
const User = require('../models/User'); // Import User model to update status

let io; // Declare io in a scope accessible by getIo

const initializeSocketIO = (socketIOInstance) => {
  io = socketIOInstance;

  io.on('connection', (socket) => {
    console.log(`User Connected: ${socket.id}`);

    // Join a personal room based on user's ID for notifications and presence
    // This is useful for direct notifications to a user regardless of which chat they are in
    socket.on('setup', async (userData) => {
      // userData should contain firebaseUid and potentially current chat room
      console.log(`User ${userData.firebaseUid} joining personal room ${userData.firebaseUid}`);
      socket.join(userData.firebaseUid); // Join a personal room for the user

      // Update user status to online
      try {
        const user = await User.findOneAndUpdate(
          { firebaseUid: userData.firebaseUid },
          { status: 'online', lastSeen: new Date() },
          { new: true } // Return the updated document
        );
        if (user) {
          console.log(`${user.username} is now online.`);
          // Emit presence update to all connected clients
          io.emit('user presence update', { userId: user._id, status: 'online', lastSeen: user.lastSeen });
        }
      } catch (error) {
        console.error('Error updating user status to online:', error);
      }
      socket.emit('connected'); // Confirm connection setup
    });

    // Join a chat room
    socket.on('join chat', (chatId) => {
      socket.join(chatId);
      console.log(`User joined chat: ${chatId}`);
    });

    // Send new message
    socket.on('new message', (newMessageReceived) => {
      // newMessageReceived should contain chat object with users and the message itself
      var chat = newMessageReceived.chat;

      if (!chat.users) return console.log('Chat.users not defined');

      chat.users.forEach((user) => {
        if (user._id === newMessageReceived.sender._id) return; // Don't send message back to sender

        // Emit message to the user's personal room or the chat room
        // If the user is in the chat room, they will receive it there.
        // If not, they will receive it in their personal room for notification.
        socket.in(user._id).emit('message received', newMessageReceived);
        // Or, more simply, emit to the chat room and let frontend filter
        // io.to(chat._id).emit('message received', newMessageReceived);
      });
    });

    // Typing indicator
    socket.on('typing', (chatId) => socket.in(chatId).emit('typing'));
    socket.on('stop typing', (chatId) => socket.in(chatId).emit('stop typing'));

    // Message seen status
    socket.on('message seen', async ({ messageId, chatId, userId }) => {
      try {
        const message = await Message.findById(messageId);
        if (message && !message.seenBy.includes(userId)) {
          message.seenBy.push(userId);
          await message.save();
          // Emit 'message seen' event to all users in the chat room
          io.to(chatId).emit('message seen', { messageId, userId });
        }
      } catch (error) {
        console.error('Error updating message seen status:', error);
      }
    });

    // Disconnect event
    socket.off('setup', async (userData) => { // Use socket.off for cleanup on disconnect
      console.log('User Disconnected');
      if (userData && userData.firebaseUid) {
        // Update user status to offline
        try {
          const user = await User.findOneAndUpdate(
            { firebaseUid: userData.firebaseUid },
            { status: 'offline', lastSeen: new Date() },
            { new: true }
          );
          if (user) {
            console.log(`${user.username} is now offline.`);
            // Emit presence update to all connected clients
            io.emit('user presence update', { userId: user._id, status: 'offline', lastSeen: user.lastSeen });
          }
        } catch (error) {
          console.error('Error updating user status to offline:', error);
        }
        socket.leave(userData.firebaseUid); // Leave personal room
      }
    });
  });
};

const getIo = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized!');
  }
  return io;
};

module.exports = initializeSocketIO;
module.exports.getIo = getIo; // Export getIo so it can be used in controllers
