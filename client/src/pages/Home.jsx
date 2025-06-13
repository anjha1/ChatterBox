// client/src/pages/Home.jsx
import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout, setAuthenticatedUser } from '../redux/authSlice';
import { setSelectedChat, setChats, addMessage, setTypingUsers, removeTypingUser } from '../redux/chatSlice';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import axios from 'axios';
import io from 'socket.io-client';

const ENDPOINT = import.meta.env.VITE_BACKEND_URL;
var socket; // Global socket instance

function Home() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const authUser = useSelector((state) => state.auth.user); // The logged-in user from Redux auth slice
  const { selectedChat, chats } = useSelector((state) => state.chat);
  const [loadingChats, setLoadingChats] = useState(true);
  const [socketConnected, setSocketConnected] = useState(false);
  const [notification, setNotification] = useState([]); // For new message notifications

  const fetchChats = async () => {
    if (!authUser || !authUser.idToken) {
      navigate('/login');
      return;
    }
    setLoadingChats(true);
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${authUser.idToken}`,
        },
      };
      const { data } = await axios.get(`${ENDPOINT}/api/chats`, config);
      dispatch(setChats(data));
    } catch (error) {
      console.error('Error fetching chats:', error);
      // Handle error, e.g., show message or log out
    } finally {
      setLoadingChats(false);
    }
  };

  useEffect(() => {
    // Redirect if not authenticated
    if (!authUser || !authUser.idToken) {
      navigate('/login');
      return;
    }

    // Initialize Socket.IO connection
    socket = io(ENDPOINT);
    socket.emit('setup', { firebaseUid: authUser.firebaseUid, _id: authUser._id });
    socket.on('connected', () => {
      setSocketConnected(true);
      console.log('Socket.IO connected!');
    });

    // Listen for 'message received' event
    socket.on('message received', (newMessageReceived) => {
      // If the message is for the currently selected chat, add it
      if (selectedChat && selectedChat._id === newMessageReceived.chat._id) {
        dispatch(addMessage(newMessageReceived));
        // Mark message as seen
        socket.emit('message seen', {
          messageId: newMessageReceived._id,
          chatId: newMessageReceived.chat._id,
          userId: authUser._id,
        });
      } else {
        // Handle notification for unread messages
        // Add to notification array if not already present
        if (!notification.some(n => n.chat._id === newMessageReceived.chat._id)) {
          setNotification([newMessageReceived, ...notification]);
          // You could also show a toast notification here
          console.log(`New message from ${newMessageReceived.sender.username} in chat ${newMessageReceived.chat.chatName || newMessageReceived.chat.users.find(u => u._id !== authUser._id)?.username}`);
        }
      }
      // Re-fetch chats to update latest message and order in sidebar
      fetchChats();
    });

    // Listen for typing indicators
    socket.on('typing', (chatId) => {
      dispatch(setTypingUsers(chatId));
    });
    socket.on('stop typing', (chatId) => {
      dispatch(removeTypingUser(chatId));
    });

    // Listen for message seen updates
    socket.on('message seen', ({ messageId, userId }) => {
      console.log(`Message ${messageId} seen by ${userId}`);
      // This part would ideally update the 'seen by' status in the Redux state for the message
      // For now, it's just a log. Updating state would require iterating through messages
      // and finding the specific message to update its seenBy array.
    });

    // Listen for user presence updates
    socket.on('user presence update', ({ userId, status, lastSeen }) => {
      console.log(`User ${userId} is now ${status} (last seen: ${lastSeen})`);
      // You would update the user list in your Redux store based on this.
      // This is a basic example; you might need to update the `users` array within `chats`
      // or maintain a separate global user presence state.
      dispatch(setAuthenticatedUser({ userId, status, lastSeen })); // Update authenticated user's presence
    });


    // Fetch chats on component mount
    fetchChats();

    // Clean up socket connection on unmount
    return () => {
      if (socket) {
        socket.off('setup');
        socket.off('connected');
        socket.off('message received');
        socket.off('typing');
        socket.off('stop typing');
        socket.off('message seen');
        socket.off('user presence update');
        socket.emit('disconnecting', { firebaseUid: authUser.firebaseUid }); // Inform server about disconnect
        socket.disconnect();
        console.log('Socket.IO disconnected.');
      }
    };
  }, [authUser?._id, authUser?.idToken, selectedChat, dispatch, navigate]); // Depend on authUser and selectedChat for re-initialization

  const handleLogout = async () => {
    try {
      await signOut(auth); // Sign out from Firebase
      dispatch(logout()); // Clear Redux state
      if (socket) {
        socket.emit('disconnecting', { firebaseUid: authUser.firebaseUid }); // Inform server about disconnect
        socket.disconnect();
      }
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
      // Handle logout error
    }
  };

  // Function to handle selecting a chat
  const handleChatSelect = (chat) => {
    dispatch(setSelectedChat(chat));
    // Join the chat room on the server side
    if (socketConnected && chat && chat._id) {
      socket.emit('join chat', chat._id);
    }
  };

  // Render a loading state if authUser is not yet available
  if (!authUser) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100">
        <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-blue-500"></div>
        <p className="ml-4 text-lg">Authenticating...</p>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      {/* Subtract header height from full viewport height */}
      <Sidebar
        chats={chats}
        selectedChat={selectedChat}
        onChatSelect={handleChatSelect}
        onLogout={handleLogout}
        loadingChats={loadingChats}
        currentUser={authUser}
        notification={notification}
        setNotification={setNotification}
        fetchChats={fetchChats} // Pass fetchChats for group creation/management
      />
      <ChatWindow
        selectedChat={selectedChat}
        currentUser={authUser}
        socket={socket}
        socketConnected={socketConnected}
        fetchChats={fetchChats}
      />
    </div>
  );
}

export default Home;
