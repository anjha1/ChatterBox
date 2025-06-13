// client/src/App.js
import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import { useDispatch, useSelector } from 'react-redux';
import { auth } from './firebase'; // Firebase auth instance
import { onAuthStateChanged } from 'firebase/auth';
import { setUser, logout } from './redux/authSlice';
import axios from 'axios';

function App() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading } = useSelector((state) => state.auth); // Get user and loading state from Redux
  const [isFirebaseLoaded, setIsFirebaseLoaded] = useState(false); // To track Firebase auth listener state
  const [darkMode, setDarkMode] = useState(false); // Dark mode state

  // Effect to handle Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in with Firebase.
        // Now, verify this user with your backend and get / create their backend profile.
        try {
          const idToken = await firebaseUser.getIdToken();
          const backendUrl = import.meta.env.VITE_BACKEND_URL;
          const config = {
            headers: {
              Authorization: `Bearer ${idToken}`,
            },
          };

          // Try to get user profile from backend
          const { data } = await axios.get(`${backendUrl}/api/auth/profile`, config);
          dispatch(setUser({ ...data, firebaseUid: firebaseUser.uid, idToken })); // Store backend user data + Firebase UID + token
          navigate('/home');
        } catch (error) {
          console.error('Error fetching user profile from backend:', error);
          // If backend user doesn't exist, might need to prompt registration or logout
          dispatch(logout()); // Logout if backend profile not found
          navigate('/login');
        }
      } else {
        // No user is signed in.
        dispatch(logout()); // Clear Redux state
        navigate('/login');
      }
      setIsFirebaseLoaded(true); // Firebase listener has run at least once
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [dispatch, navigate]);

  // Effect for dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };


  // Show a loading indicator until Firebase auth state is determined
  if (!isFirebaseLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100">
        <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-blue-500"></div>
        <p className="ml-4 text-lg">Loading user session...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300 flex flex-col">
      <header className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 shadow-md">
        <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">ChatterBox</h1>
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
        >
          {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
        </button>
      </header>
      <main className="flex-grow">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/home" element={<Home />} />
          <Route path="/" element={<Login />} /> {/* Default route */}
        </Routes>
      </main>
    </div>
  );
}

export default App;
