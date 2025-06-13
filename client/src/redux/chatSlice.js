// client/src/redux/chatSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  selectedChat: null,
  chats: [],
  messages: [],
  typingUsers: [], // Array to hold chat IDs where typing is happening
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setSelectedChat: (state, action) => {
      state.selectedChat = action.payload;
      state.messages = []; // Clear messages when selecting a new chat
    },
    setChats: (state, action) => {
      state.chats = action.payload;
    },
    addChat: (state, action) => {
      // Add a new chat to the list if it doesn't already exist
      if (!state.chats.find((c) => c._id === action.payload._id)) {
        state.chats.unshift(action.payload); // Add to the beginning
      }
    },
    removeChat: (state, action) => {
      state.chats = state.chats.filter((chat) => chat._id !== action.payload);
      if (state.selectedChat?._id === action.payload) {
        state.selectedChat = null;
      }
    },
    setMessages: (state, action) => {
      state.messages = action.payload;
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    setTypingUsers: (state, action) => {
      // Add chat ID to typingUsers if not already present
      if (!state.typingUsers.includes(action.payload)) {
        state.typingUsers.push(action.payload);
      }
    },
    removeTypingUser: (state, action) => {
      // Remove chat ID from typingUsers
      state.typingUsers = state.typingUsers.filter((chatId) => chatId !== action.payload);
    },
    // You could add a reducer for message seen status here, but it's more complex
    // as it requires finding the specific message in the messages array and updating it.
    // updateMessageSeenStatus: (state, action) => {
    //   const { messageId, userId } = action.payload;
    //   const message = state.messages.find(msg => msg._id === messageId);
    //   if (message && !message.seenBy.includes(userId)) {
    //     message.seenBy.push(userId);
    //   }
    // },
  },
});

export const {
  setSelectedChat,
  setChats,
  addChat,
  removeChat,
  setMessages,
  addMessage,
  setTypingUsers,
  removeTypingUser,
  // updateMessageSeenStatus,
} = chatSlice.actions;

export default chatSlice.reducer;
