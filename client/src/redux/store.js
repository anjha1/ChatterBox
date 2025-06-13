// client/src/redux/store.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import chatReducer from './chatSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    chat: chatReducer,
  },
  // Adding middleware for non-serializable values (like Firebase User object)
  // This is often needed with Firebase SDK directly in Redux state.
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['auth/setUser', 'auth/logout'],
        // Ignore these paths in the state
        ignoredPaths: ['auth.user.stsTokenManager'], // Example: Firebase TokenManager object
      },
    }),
});

export default store;
