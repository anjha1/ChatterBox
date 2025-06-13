// server/models/Chat.js
const mongoose = require('mongoose');

const ChatSchema = new mongoose.Schema({
  chatName: {
    type: String,
    trim: true,
    default: 'New Chat' // Default for 1-to-1 chats, can be customized for groups
  },
  isGroupChat: {
    type: Boolean,
    default: false
  },
  users: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  latestMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  groupAdmin: { // Only applicable if isGroupChat is true
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // Add group icon for group chats
  groupIcon: {
    type: String, // URL to image in Firebase Storage
    default: 'https://placehold.co/150x150/cccccc/000000?text=Group'
  }
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

module.exports = mongoose.model('Chat', ChatSchema);
