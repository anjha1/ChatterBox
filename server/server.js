// server/server.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const { Server } = require('socket.io');
const http = require('http'); // Import http for Socket.IO server
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const chatRoutes = require('./routes/chatRoutes');
const messageRoutes = require('./routes/messageRoutes');
const errorHandler = require('./middleware/errorHandler');
const initializeSocketIO = require('./socket/index'); // Import socket initializer
const admin = require('firebase-admin'); // Import Firebase Admin SDK

// Load environment variables from .env file
dotenv.config();

// Initialize Firebase Admin SDK
try {
  const serviceAccount = {
    type: process.env.FIREBASE_TYPE,
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    // IMPORTANT: Replace literal \n with actual newline characters if reading from .env directly
    // This is a common issue with private keys in .env.
    // For production, consider reading the key from a file or a secure secrets manager.
    private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: process.env.FIREBASE_AUTH_URI,
    token_uri: process.env.FIREBASE_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
    universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN,
  };

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    // You might need a storage bucket URL if using Firebase Storage here
    // storageBucket: 'your-project-id.appspot.com'
  });
  console.log('Firebase Admin SDK initialized successfully!');
} catch (error) {
  console.error('Failed to initialize Firebase Admin SDK:', error.message);
  process.exit(1); // Exit if Firebase initialization fails
}

// Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app); // Create HTTP server for Socket.IO

// CORS middleware
// Allow requests from the frontend origin specified in .env
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true, // Allow sending cookies/auth headers
}));

// Body parser middleware to handle JSON data
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/messages', messageRoutes);

// Root route for testing
app.get('/', (req, res) => {
  res.send('ChatterBox Backend API is running!');
});

// Error handling middleware
app.use(errorHandler);

// Initialize Socket.IO with the HTTP server and CORS configuration
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN,
    methods: ['GET', 'POST'],
    credentials: true,
  }
});

// Pass the Socket.IO instance to the socket handler
initializeSocketIO(io);

// Define the port for the server
const PORT = process.env.PORT || 5000;

// Start the server
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
