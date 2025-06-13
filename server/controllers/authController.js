// server/controllers/authController.js
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const admin = require('firebase-admin'); // For Firebase Admin SDK operations

// @desc    Register a new user (with Firebase Auth UIDs)
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { username, email, firebaseUid } = req.body;

  if (!username || !email || !firebaseUid) {
    res.status(400);
    throw new Error('Please enter all fields');
  }

  // Check if user already exists based on Firebase UID
  const userExists = await User.findOne({ firebaseUid });
  if (userExists) {
    res.status(400);
    throw new Error('User already registered with this Firebase UID');
  }

  // Check if username is already taken
  const usernameTaken = await User.findOne({ username });
  if (usernameTaken) {
    res.status(400);
    throw new Error('Username is already taken');
  }

  // Check if email is already taken
  const emailTaken = await User.findOne({ email });
  if (emailTaken) {
    res.status(400);
    throw new Error('Email is already registered');
  }

  // Create user in our MongoDB
  const user = await User.create({
    firebaseUid,
    username,
    email,
    // Add default profile picture or handle upload
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      firebaseUid: user.firebaseUid,
      username: user.username,
      email: user.email,
      profilePicture: user.profilePicture,
      createdAt: user.createdAt
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Authenticate user & get user data (after Firebase client-side login)
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { firebaseUid } = req.body; // Expecting Firebase UID after client-side login

  if (!firebaseUid) {
    res.status(400);
    throw new Error('Firebase UID is required');
  }

  // Find the user in our database using the Firebase UID
  const user = await User.findOne({ firebaseUid });

  if (user) {
    res.json({
      _id: user._id,
      firebaseUid: user.firebaseUid,
      username: user.username,
      email: user.email,
      profilePicture: user.profilePicture,
    });
  } else {
    res.status(401);
    throw new Error('User not found in backend database. Please register.');
  }
});

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  // `req.dbUser` is populated by `protect` middleware
  res.json({
    _id: req.dbUser._id,
    firebaseUid: req.dbUser.firebaseUid,
    username: req.dbUser.username,
    email: req.dbUser.email,
    profilePicture: req.dbUser.profilePicture,
    status: req.dbUser.status,
    lastSeen: req.dbUser.lastSeen,
  });
});

module.exports = {
  registerUser,
  loginUser,
  getUserProfile
};
