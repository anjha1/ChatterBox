// client/src/components/Sidebar.jsx
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { setSelectedChat, addChat, removeChat } from '../redux/chatSlice';
import moment from 'moment';

function Sidebar({ chats, selectedChat, onChatSelect, onLogout, loadingChats, currentUser, notification, setNotification, fetchChats }) {
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [groupChatName, setGroupChatName] = useState('');
  const [groupSelectedUsers, setGroupSelectedUsers] = useState([]);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [groupSearchTerm, setGroupSearchTerm] = useState('');
  const [groupSearchResults, setGroupSearchResults] = useState([]);
  const [groupSearchLoading, setGroupSearchLoading] = useState(false);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // Handle user search for new chat
  const handleUserSearch = async () => {
    if (!searchTerm) {
      setSearchResults([]);
      return;
    }
    setSearchLoading(true);
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${currentUser.idToken}`,
        },
      };
      // In a real app, this would be a backend endpoint to search users
      // For now, simulate by filtering existing users or fetching all for simplicity (not scalable)
      // A dedicated user search API is needed for a true messaging app
      const { data } = await axios.get(`${backendUrl}/api/auth/users?search=${searchTerm}`, config); // Assuming a /api/auth/users endpoint that can search
      setSearchResults(data); // `data` would be an array of user objects
    } catch (error) {
      console.error('Error searching users:', error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // Function to access/create a 1-to-1 chat with a searched user
  const accessChat = async (userId) => {
    try {
      setSearchLoading(true);
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUser.idToken}`,
        },
      };
      const { data } = await axios.post(`${backendUrl}/api/chats`, { userId }, config);

      // Add the new chat to the chats list if it's not already there
      if (!chats.find((c) => c._id === data._id)) {
        dispatch(addChat(data));
      }
      dispatch(setSelectedChat(data)); // Select the new/existing chat
      setShowSearchModal(false); // Close the search modal
      setSearchTerm('');
      setSearchResults([]);
    } catch (error) {
      console.error('Error accessing chat:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  // Filter chats based on search term for sidebar display
  const filteredChats = chats.filter((chat) => {
    const chatName = chat.isGroupChat
      ? chat.chatName
      : chat.users.find((u) => u._id !== currentUser._id)?.username || 'Unknown User';
    return chatName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Handle group user search
  const handleGroupUserSearch = async () => {
    if (!groupSearchTerm) {
      setGroupSearchResults([]);
      return;
    }
    setGroupSearchLoading(true);
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${currentUser.idToken}`,
        },
      };
      // Fetch users for group creation. Exclude currently logged-in user.
      const { data } = await axios.get(`${backendUrl}/api/auth/users?search=${groupSearchTerm}&exclude=${currentUser._id}`, config);
      setGroupSearchResults(data.filter(user => user._id !== currentUser._id)); // Ensure current user is not in results
    } catch (error) {
      console.error('Error searching users for group:', error);
      setGroupSearchResults([]);
    } finally {
      setGroupSearchLoading(false);
    }
  };

  // Add user to group creation list
  const handleAddUserToGroup = (userToAdd) => {
    if (!groupSelectedUsers.some(u => u._id === userToAdd._id)) {
      setGroupSelectedUsers([...groupSelectedUsers, userToAdd]);
      setGroupSearchTerm(''); // Clear search after adding
      setGroupSearchResults([]);
    }
  };

  // Remove user from group creation list
  const handleRemoveUserFromGroup = (userToRemoveId) => {
    setGroupSelectedUsers(groupSelectedUsers.filter(u => u._id !== userToRemoveId));
  };

  // Create group chat
  const handleCreateGroupChat = async () => {
    if (!groupChatName || groupSelectedUsers.length < 2) {
      // Use custom modal for error messages
      console.error('Group name and at least two users are required!');
      return;
    }

    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUser.idToken}`,
        },
      };
      const users = groupSelectedUsers.map(u => u._id);
      const { data } = await axios.post(`${backendUrl}/api/chats/group`, {
        name: groupChatName,
        users: JSON.stringify(users), // Send as stringified array
      }, config);

      dispatch(addChat(data)); // Add the new group chat to chat list
      dispatch(setSelectedChat(data)); // Select the new group chat
      setShowCreateGroupModal(false);
      setGroupChatName('');
      setGroupSelectedUsers([]);
      fetchChats(); // Re-fetch chats to ensure correct order/updates
    } catch (error) {
      console.error('Error creating group chat:', error);
      // Show error message
    }
  };

  // Handle message seen notification click
  const handleNotificationClick = (message) => {
    onChatSelect(message.chat); // Select the chat
    setNotification(notification.filter((n) => n.chat._id !== message.chat._id)); // Remove notification
  };


  return (
    <div className="w-full md:w-1/3 lg:w-1/4 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-300 rounded-lg shadow-lg m-2">
      {/* User Profile and Logout */}
      <div className="p-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <img
            src={currentUser.profilePicture || 'https://placehold.co/50x50/cccccc/000000?text=P'}
            alt="Profile"
            className="w-12 h-12 rounded-full object-cover mr-3"
          />
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-100">{currentUser.username}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Online</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm transition-colors duration-200"
        >
          Logout
        </button>
      </div>

      {/* Search Bar and New Chat/Group Buttons */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="relative mb-2">
          <input
            type="text"
            placeholder="Search chats..."
            className="w-full px-4 py-2 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            >
              &times;
            </button>
          )}
        </div>
        <button
          onClick={() => setShowSearchModal(true)}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors duration-200 mb-2"
        >
          Start New Chat
        </button>
        <button
          onClick={() => setShowCreateGroupModal(true)}
          className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition-colors duration-200"
        >
          Create Group Chat
        </button>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {loadingChats ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">Loading chats...</div>
        ) : filteredChats.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">No chats found.</div>
        ) : (
          filteredChats.map((chat) => (
            <div
              key={chat._id}
              onClick={() => onChatSelect(chat)}
              className={`flex items-center p-3 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200
                ${selectedChat?._id === chat._id ? 'bg-blue-100 dark:bg-blue-900' : ''}`}
            >
              <img
                src={
                  chat.isGroupChat
                    ? chat.groupIcon || 'https://placehold.co/50x50/cccccc/000000?text=Group'
                    : chat.users.find((u) => u._id !== currentUser._id)?.profilePicture || 'https://placehold.co/50x50/cccccc/000000?text=P'
                }
                alt="Chat Icon"
                className="w-12 h-12 rounded-full object-cover mr-3"
              />
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800 dark:text-gray-100">
                  {chat.isGroupChat
                    ? chat.chatName
                    : chat.users.find((u) => u._id !== currentUser._id)?.username || 'Unknown User'}
                </h4>
                {chat.latestMessage && (
                  <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                    {chat.latestMessage.sender._id === currentUser._id ? 'You: ' : `${chat.latestMessage.sender.username}: `}
                    {chat.latestMessage.content}
                  </p>
                )}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {chat.latestMessage && moment(chat.latestMessage.createdAt).fromNow()}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Notifications */}
      {notification.length > 0 && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <h5 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">New Messages ({notification.length})</h5>
          <div className="max-h-32 overflow-y-auto custom-scrollbar">
            {notification.map((notif, index) => (
              <div
                key={index}
                onClick={() => handleNotificationClick(notif)}
                className="flex items-center p-2 rounded-md bg-blue-50 dark:bg-blue-900 text-blue-800 dark:text-blue-100 mb-1 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors duration-200"
              >
                <span className="mr-2">🔔</span>
                <p className="text-sm flex-1 truncate">
                  Message from{' '}
                  <span className="font-medium">
                    {notif.sender.username} in{' '}
                    {notif.chat.isGroupChat ? notif.chat.chatName : notif.chat.users.find(u => u._id !== currentUser._id)?.username}
                  </span>
                  : {notif.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}


      {/* Start New Chat Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Start New Chat</h3>
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search users by username or email..."
                className="w-full px-4 py-2 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button
                onClick={handleUserSearch}
                className="mt-2 w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors duration-200 disabled:opacity-50"
                disabled={searchLoading}
              >
                {searchLoading ? 'Searching...' : 'Search'}
              </button>
            </div>
            <div className="max-h-60 overflow-y-auto custom-scrollbar">
              {searchResults.length === 0 && !searchLoading && searchTerm && (
                <p className="text-gray-500 dark:text-gray-400 text-center">No users found.</p>
              )}
              {searchResults.map((user) => (
                <div
                  key={user._id}
                  className="flex items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                  onClick={() => accessChat(user._id)}
                >
                  <img
                    src={user.profilePicture || 'https://placehold.co/40x40/cccccc/000000?text=U'}
                    alt="User"
                    className="w-10 h-10 rounded-full mr-3 object-cover"
                  />
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-gray-100">{user.username}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => {
                  setShowSearchModal(false);
                  setSearchTerm('');
                  setSearchResults([]);
                }}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Group Chat Modal */}
      {showCreateGroupModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Create Group Chat</h3>
            <div className="mb-4">
              <input
                type="text"
                placeholder="Group Chat Name"
                className="w-full px-4 py-2 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
                value={groupChatName}
                onChange={(e) => setGroupChatName(e.target.value)}
              />
              <input
                type="text"
                placeholder="Add users (e.g., John, Jane)"
                className="w-full px-4 py-2 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={groupSearchTerm}
                onChange={(e) => setGroupSearchTerm(e.target.value)}
                onKeyUp={handleGroupUserSearch} // Search on key up
              />
              {groupSearchLoading && <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Searching...</p>}
              <div className="mt-2 flex flex-wrap gap-2">
                {groupSelectedUsers.map((u) => (
                  <span
                    key={u._id}
                    className="bg-blue-200 dark:bg-blue-700 text-blue-800 dark:text-blue-100 text-sm px-3 py-1 rounded-full flex items-center"
                  >
                    {u.username}
                    <button
                      type="button"
                      onClick={() => handleRemoveUserFromGroup(u._id)}
                      className="ml-2 text-blue-800 dark:text-blue-100 hover:text-red-600 dark:hover:text-red-400 font-bold"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            </div>
            <div className="max-h-40 overflow-y-auto custom-scrollbar mb-4">
              {groupSearchResults.length > 0 && (
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">Click to add users:</p>
              )}
              {groupSearchResults.map((user) => (
                <div
                  key={user._id}
                  className="flex items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                  onClick={() => handleAddUserToGroup(user)}
                >
                  <img
                    src={user.profilePicture || 'https://placehold.co/40x40/cccccc/000000?text=U'}
                    alt="User"
                    className="w-10 h-10 rounded-full mr-3 object-cover"
                  />
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-gray-100">{user.username}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowCreateGroupModal(false);
                  setGroupChatName('');
                  setGroupSelectedUsers([]);
                  setGroupSearchTerm('');
                  setGroupSearchResults([]);
                }}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateGroupChat}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition-colors duration-200 disabled:opacity-50"
                disabled={groupSelectedUsers.length < 2 || !groupChatName}
              >
                Create Group
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Sidebar;
