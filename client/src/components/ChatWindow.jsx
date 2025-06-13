// client/src/components/ChatWindow.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import moment from 'moment';
import MessageBubble from './MessageBubble';
import { setMessages, addMessage } from '../redux/chatSlice';

const ChatWindow = ({ selectedChat, currentUser, socket, socketConnected, fetchChats }) => {
  const dispatch = useDispatch();
  const { messages, typingUsers } = useSelector((state) => state.chat);
  const [newMessage, setNewMessage] = useState('');
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [isTyping, setIsTyping] = useState(false); // State for current user's typing status
  const messagesEndRef = useRef(null); // Ref for scrolling to bottom
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // Fetch messages when selected chat changes
  useEffect(() => {
    if (selectedChat) {
      const fetchMessages = async () => {
        setLoadingMessages(true);
        try {
          const config = {
            headers: {
              Authorization: `Bearer ${currentUser.idToken}`,
            },
          };
          const { data } = await axios.get(`${backendUrl}/api/messages/${selectedChat._id}`, config);
          dispatch(setMessages(data));
          // Emit 'join chat' event to join the room on the server for the newly selected chat
          if (socketConnected) {
            socket.emit('join chat', selectedChat._id);
          }
        } catch (error) {
          console.error('Error fetching messages:', error);
          dispatch(setMessages([])); // Clear messages on error
        } finally {
          setLoadingMessages(false);
        }
      };
      fetchMessages();
    } else {
      dispatch(setMessages([])); // Clear messages if no chat selected
    }
  }, [selectedChat, currentUser, dispatch, socketConnected, backendUrl]);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle message input change and typing indicators
  const typingTimeoutRef = useRef(null);
  const handleInputChange = (e) => {
    setNewMessage(e.target.value);

    if (!socketConnected) return;

    if (!isTyping) {
      setIsTyping(true);
      socket.emit('typing', selectedChat._id);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stop typing', selectedChat._id);
      setIsTyping(false);
    }, 3000); // Stop typing after 3 seconds of no input
  };

  // Handle sending a message
  const sendMessage = async (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      if (newMessage.trim() === '') return;

      // Clear typing indicator immediately upon sending
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      socket.emit('stop typing', selectedChat._id);
      setIsTyping(false);

      try {
        const config = {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${currentUser.idToken}`,
          },
        };
        setNewMessage(''); // Clear input field immediately
        const { data } = await axios.post(
          `${backendUrl}/api/messages`,
          {
            content: newMessage,
            chatId: selectedChat._id,
            messageType: 'text', // Default to text, extend for media
          },
          config
        );
        // The message is added to Redux state via socket.on('message received') in Home.jsx,
        // which prevents duplicates and ensures real-time updates.
        // For immediate UI update, you *could* dispatch `addMessage(data)` here,
        // but ensure your socket handler doesn't then re-add it.
        // A common pattern is to optimistically add to UI, then update/remove if server fails.
        // Here, we rely on the socket for adding to prevent potential duplicates.
        fetchChats(); // Re-fetch chats to update latest message in sidebar
      } catch (error) {
        console.error('Error sending message:', error);
        // Revert message input or show error
        setNewMessage(newMessage); // Restore message
      }
    }
  };

  // Determine chat header name and image
  const chatHeaderName = selectedChat?.isGroupChat
    ? selectedChat.chatName
    : selectedChat?.users?.find((u) => u._id !== currentUser._id)?.username || 'Select a Chat';

  const chatHeaderImage = selectedChat?.isGroupChat
    ? selectedChat.groupIcon || 'https://placehold.co/50x50/cccccc/000000?text=Group'
    : selectedChat?.users?.find((u) => u._id !== currentUser._id)?.profilePicture || 'https://placehold.co/50x50/cccccc/000000?text=U';

  const otherUser = selectedChat?.users?.find((u) => u._id !== currentUser._id);
  const isOtherUserTyping = typingUsers.includes(selectedChat?._id);

  if (!selectedChat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <p className="text-xl text-gray-500 dark:text-gray-400">Select a chat to start messaging</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-300 rounded-lg shadow-lg m-2">
      {/* Chat Header */}
      <div className="p-4 flex items-center border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-t-lg">
        <img
          src={chatHeaderImage}
          alt="Chat Icon"
          className="w-12 h-12 rounded-full object-cover mr-3"
        />
        <div>
          <h3 className="font-semibold text-gray-800 dark:text-gray-100">{chatHeaderName}</h3>
          {!selectedChat.isGroupChat && otherUser && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {otherUser.status === 'online' ? 'Online' : `Last seen ${moment(otherUser.lastSeen).fromNow()}`}
            </p>
          )}
        </div>
      </div>

      {/* Message Area */}
      <div className="flex-1 p-4 overflow-y-auto custom-scrollbar flex flex-col-reverse">
        <div ref={messagesEndRef} /> {/* Scroll target */}
        {loadingMessages ? (
          <div className="text-center text-gray-500 dark:text-gray-400">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400">No messages yet. Say hello!</div>
        ) : (
          [...messages].reverse().map((message, index) => (
            <MessageBubble
              key={message._id}
              message={message}
              isSender={message.sender._id === currentUser._id}
              showProfilePicture={
                // Show profile picture if it's a group chat and the sender is different from previous,
                // or if it's the first message and a group chat.
                selectedChat.isGroupChat &&
                (index === messages.length - 1 ||
                  messages[messages.length - 1 - (index + 1)].sender._id !== message.sender._id)
              }
            />
          ))
        )}
        {/* Typing indicator */}
        {isOtherUserTyping && (
          <div className="flex items-center mt-2 text-gray-600 dark:text-gray-400 animate-pulse">
            <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mr-1"></span>
            <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mr-1 animation-delay-200"></span>
            <span className="inline-block w-2 h-2 bg-blue-500 rounded-full animation-delay-400"></span>
            <span className="ml-2">{chatHeaderName} is typing...</span>
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-b-lg">
        <div className="flex items-center">
          <input
            type="text"
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={newMessage}
            onChange={handleInputChange}
            onKeyDown={sendMessage}
            disabled={!socketConnected} // Disable input if socket is not connected
          />
          <button
            onClick={sendMessage}
            className="ml-3 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full transition-colors duration-200 disabled:opacity-50"
            disabled={!socketConnected || newMessage.trim() === ''}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
