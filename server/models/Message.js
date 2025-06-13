// server/models/Message.js
const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  chat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat',
    required: true
  },
  content: {
    type: String,
    trim: true
  },
  messageType: { // e.g., 'text', 'image', 'video', 'document', 'audio'
    type: String,
    enum: ['text', 'image', 'video', 'document', 'audio'],
    default: 'text'
  },
  mediaUrl: { // URL to media in Firebase Storage
    type: String,
    required: function() { return this.messageType !== 'text'; } // Required if not text
  },
  seenBy: [{ // Array of user IDs who have seen this message
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

module.exports = mongoose.model('Message', MessageSchema);
