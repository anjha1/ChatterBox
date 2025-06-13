// client/src/components/MessageBubble.jsx
import React from 'react';
import moment from 'moment';

const MessageBubble = ({ message, isSender, showProfilePicture }) => {
  const alignClass = isSender ? 'self-end' : 'self-start';
  const bubbleColorClass = isSender
    ? 'bg-blue-500 text-white rounded-br-none'
    : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-bl-none';
  const textColorClass = isSender ? 'text-white' : 'text-gray-800 dark:text-gray-100';

  return (
    <div className={`flex flex-col mb-2 max-w-[70%] ${alignClass}`}>
      <div className={`flex items-end ${isSender ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Profile Picture (for receiver in group chat) */}
        {!isSender && showProfilePicture && (
          <img
            src={message.sender.profilePicture || 'https://placehold.co/30x30/cccccc/000000?text=P'}
            alt="Sender Profile"
            className="w-8 h-8 rounded-full object-cover mr-2"
          />
        )}
        <div className={`px-4 py-2 rounded-2xl shadow-md ${bubbleColorClass}`}>
          {/* Sender Name (for group chat if not sender) */}
          {!isSender && message.chat.isGroupChat && (
            <div className="font-semibold text-xs mb-1">
              {message.sender.username}
            </div>
          )}
          <p className={`${textColorClass} break-words`}>{message.content}</p>
        </div>
      </div>
      {/* Timestamp and Seen Status */}
      <div className={`text-xs text-gray-500 dark:text-gray-400 mt-1 ${isSender ? 'text-right' : 'text-left'} mr-1 ml-1`}>
        {moment(message.createdAt).format('hh:mm A')}
        {isSender && message.seenBy && message.seenBy.length > 0 && (
          <span className="ml-2">✓ Read</span> // Simplified "Read" status
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
