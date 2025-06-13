// client/src/redux/authSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: localStorage.getItem('chatterboxUser')
    ? JSON.parse(localStorage.getItem('chatterboxUser'))
    : null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.loading = false;
      state.error = null;
      localStorage.setItem('chatterboxUser', JSON.stringify(action.payload)); // Persist user to localStorage
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    logout: (state) => {
      state.user = null;
      state.loading = false;
      state.error = null;
      localStorage.removeItem('chatterboxUser'); // Remove user from localStorage on logout
    },
    // This reducer can be used to update authenticated user's presence (online/offline)
    setAuthenticatedUser: (state, action) => {
      const { userId, status, lastSeen } = action.payload;
      if (state.user && state.user._id === userId) {
        state.user.status = status;
        state.user.lastSeen = lastSeen;
        // Optionally update localStorage if you want presence to persist across tabs/reloads (careful with accuracy)
        // localStorage.setItem('chatterboxUser', JSON.stringify(state.user));
      }
    },
  },
});

export const { setUser, setLoading, setError, logout, setAuthenticatedUser } = authSlice.actions;
export default authSlice.reducer;
