// server/controllers/chatController.js
const asyncHandler = require('express-async-handler');
const Chat = require('../models/Chat');
const User = require('../models/User');
const Message = require('../models/Message'); // To populate latest message

// @desc    Access a chat (create if it doesn't exist, for 1-to-1)
// @route   POST /api/chats
// @access  Private
const accessChat = asyncHandler(async (req, res) => {
  const { userId } = req.body; // The ID of the user to chat with

  if (!userId) {
    res.status(400);
    throw new Error('UserId param not sent with request');
  }

  // Find a chat that is NOT a group chat and includes both users
  var isChat = await Chat.find({
      isGroupChat: false,
      $and: [
        { users: { $elemMatch: { $eq: req.dbUser._id } } }, // Current logged-in user
        { users: { $elemMatch: { $eq: userId } } },       // The other user
      ],
    })
    .populate('users', '-password') // Populate user details, exclude password
    .populate('latestMessage');     // Populate the latest message

  // Populate sender of the latest message
  isChat = await User.populate(isChat, {
    path: 'latestMessage.sender',
    select: 'username email profilePicture',
  });

  if (isChat.length > 0) {
    res.send(isChat[0]); // If chat exists, return it
  } else {
    // If chat does not exist, create a new 1-to-1 chat
    var chatData = {
      chatName: 'sender', // Placeholder, will be updated by client
      isGroupChat: false,
      users: [req.dbUser._id, userId],
    };

    try {
      const createdChat = await Chat.create(chatData);
      const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        'users',
        '-password'
      );
      res.status(200).json(FullChat);
    } catch (error) {
      res.status(400);
      throw new Error(error.message);
    }
  }
});

// @desc    Fetch all chats for the logged-in user
// @route   GET /api/chats
// @access  Private
const fetchChats = asyncHandler(async (req, res) => {
  try {
    Chat.find({ users: { $elemMatch: { $eq: req.dbUser._id } } })
      .populate('users', '-password')
      .populate('groupAdmin', '-password')
      .populate('latestMessage')
      .sort({ updatedAt: -1 }) // Sort by latest activity
      .then(async (results) => {
        results = await User.populate(results, {
          path: 'latestMessage.sender',
          select: 'username email profilePicture',
        });
        res.status(200).send(results);
      });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

// @desc    Create new Group Chat
// @route   POST /api/chats/group
// @access  Private
const createGroupChat = asyncHandler(async (req, res) => {
  if (!req.body.users || !req.body.name) {
    res.status(400);
    throw new Error('Please fill all the fields: users and chat name');
  }

  var users = JSON.parse(req.body.users); // Users will be sent as a stringified array

  if (users.length < 2) {
    res.status(400);
    throw new Error('More than 2 users are required to form a group chat');
  }

  users.push(req.dbUser._id); // Add the logged-in user to the group

  try {
    const groupChat = await Chat.create({
      chatName: req.body.name,
      users: users,
      isGroupChat: true,
      groupAdmin: req.dbUser._id,
    });

    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate('users', '-password')
      .populate('groupAdmin', '-password');

    res.status(200).json(fullGroupChat);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

// @desc    Rename Group Chat
// @route   PUT /api/chats/group/rename
// @access  Private
const renameGroup = asyncHandler(async (req, res) => {
  const { chatId, chatName } = req.body;

  const updatedChat = await Chat.findByIdAndUpdate(
    chatId, {
      chatName,
    }, {
      new: true, // Return the updated document
    }
  )
    .populate('users', '-password')
    .populate('groupAdmin', '-password');

  if (!updatedChat) {
    res.status(404);
    throw new Error('Chat Not Found');
  } else {
    res.json(updatedChat);
  }
});

// @desc    Add user to Group Chat
// @route   PUT /api/chats/group/add
// @access  Private
const addToGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;

  // Check if the requester is the admin
  const chat = await Chat.findById(chatId);
  if (!chat.isGroupChat || chat.groupAdmin.toString() !== req.dbUser._id.toString()) {
    res.status(403);
    throw new Error('Only group admins can add users.');
  }

  const added = await Chat.findByIdAndUpdate(
    chatId, {
      $push: { users: userId },
    }, {
      new: true,
    }
  )
    .populate('users', '-password')
    .populate('groupAdmin', '-password');

  if (!added) {
    res.status(404);
    throw new Error('Chat Not Found');
  } else {
    res.json(added);
  }
});

// @desc    Remove user from Group Chat
// @route   PUT /api/chats/group/remove
// @access  Private
const removeFromGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;

  // Check if the requester is the admin or the user is removing themselves
  const chat = await Chat.findById(chatId);
  if (chat.groupAdmin.toString() !== req.dbUser._id.toString() && userId !== req.dbUser._id.toString()) {
    res.status(403);
    throw new Error('Only group admins can remove users, or users can remove themselves.');
  }
  // If the user being removed is the admin and there are other users,
  // promote another user to admin or handle deletion of the group.
  if (chat.groupAdmin.toString() === userId.toString() && chat.users.length > 1) {
    res.status(400);
    throw new Error('Group admin cannot be removed unless they are the last member. Please transfer admin role first.');
  }


  const removed = await Chat.findByIdAndUpdate(
    chatId, {
      $pull: { users: userId },
    }, {
      new: true,
    }
  )
    .populate('users', '-password')
    .populate('groupAdmin', '-password');

  if (!removed) {
    res.status(404);
    throw new Error('Chat Not Found');
  } else {
    res.json(removed);
  }
});

// @desc    Fetch group chat details
// @route   GET /api/chats/group/:chatId
// @access  Private
const fetchGroupChatDetails = asyncHandler(async (req, res) => {
  const { chatId } = req.params;

  try {
    const chat = await Chat.findById(chatId)
      .populate('users', '-password')
      .populate('groupAdmin', '-password')
      .populate('latestMessage');

    if (!chat || !chat.isGroupChat) {
      res.status(404);
      throw new Error('Group chat not found');
    }

    // Check if the current user is part of the group
    if (!chat.users.some(user => user._id.toString() === req.dbUser._id.toString())) {
      res.status(403);
      throw new Error('You are not a member of this group chat.');
    }

    res.status(200).json(chat);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

// @desc    Leave a group chat
// @route   PUT /api/chats/group/leave/:chatId
// @access  Private
const leaveGroupChat = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const userId = req.dbUser._id; // The logged-in user is leaving

  const chat = await Chat.findById(chatId);

  if (!chat) {
    res.status(404);
    throw new Error('Chat Not Found');
  }

  if (!chat.isGroupChat) {
    res.status(400);
    throw new Error('This is not a group chat.');
  }

  // Check if the user is a member of the group
  if (!chat.users.some(user => user.toString() === userId.toString())) {
    res.status(400);
    throw new Error('You are not a member of this group chat.');
  }

  // If the leaving user is the admin and there are other members,
  // transfer admin rights to another member (e.g., the oldest member, or first in array)
  if (chat.groupAdmin.toString() === userId.toString() && chat.users.length > 1) {
    const remainingUsers = chat.users.filter(user => user.toString() !== userId.toString());
    const newAdmin = remainingUsers[0]; // Assign first remaining user as new admin
    chat.groupAdmin = newAdmin;
    await chat.save();
  } else if (chat.groupAdmin.toString() === userId.toString() && chat.users.length === 1) {
    // If admin is the last member, delete the chat
    await Chat.findByIdAndDelete(chatId);
    res.status(200).json({ message: 'Group chat deleted as last member left.' });
    return;
  }


  const updatedChat = await Chat.findByIdAndUpdate(
    chatId, {
      $pull: { users: userId },
    }, {
      new: true,
    }
  )
    .populate('users', '-password')
    .populate('groupAdmin', '-password');

  if (!updatedChat) {
    res.status(404);
    throw new Error('Chat Not Found');
  } else {
    res.status(200).json(updatedChat);
  }
});

module.exports = {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroup,
  addToGroup,
  removeFromGroup,
  fetchGroupChatDetails,
  leaveGroupChat,
};
