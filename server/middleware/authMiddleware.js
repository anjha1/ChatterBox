// server/middleware/authMiddleware.js
const admin = require('firebase-admin');
const User = require('../models/User');
const asyncHandler = require('express-async-handler'); // Simple wrapper for async express handlers

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token using Firebase Admin SDK
      const decodedToken = await admin.auth().verifyIdToken(token);
      req.user = decodedToken; // decodedToken contains Firebase UID and other claims

      // Fetch user from your database using Firebase UID
      // This step is important to link the authenticated Firebase user to your User model
      const user = await User.findOne({ firebaseUid: decodedToken.uid }).select('-password'); // Exclude password if it existed (not relevant with Firebase Auth)

      if (!user) {
        res.status(401);
        throw new Error('User not found in database');
      }

      req.dbUser = user; // Attach our database user object to the request
      next();
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

const authorizeRoles = (...roles) => (req, res, next) => {
  // This middleware is for authorization based on custom roles (e.g., admin, member)
  // For Firebase Auth, you would typically use custom claims (e.g., admin.auth().setCustomUserClaims(uid, { admin: true }))
  // and then check `req.user.admin` or `req.user.customClaims.role`.

  // For simplicity here, we'll assume a `role` field on `req.dbUser` for demonstration.
  // In a real Firebase Auth scenario, you'd verify custom claims directly from `req.user`.

  if (!req.dbUser || !roles.includes(req.dbUser.role)) {
    res.status(403);
    throw new Error('Not authorized to access this route');
  }
  next();
};

module.exports = { protect, authorizeRoles };
