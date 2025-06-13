ChatterBox - Real-time Messaging Application
ChatterBox is a modern, full-stack real-time messaging application designed to provide a seamless communication experience. It supports 1-to-1 private chats, group messaging with roles, real-time message updates, and a responsive user interface.

🚀 Features
Core Chat Functionality:
Real-time 1-to-1 Messaging: Instant private conversations via Socket.IO.

Real-time 1-to-Many Group Messaging: Communicate within groups with designated user roles (admin, member).

Message Status: Basic seen/delivered status indication (conceptually in backend).

Typing Indicators: Real-time feedback when other users are typing.

Message Timestamps & Ordering: Chronological display of messages.

Message Pagination: Infinite scroll for loading older messages (basic implementation).

User & Account System:
Secure User Authentication: Firebase Authentication for secure registration, login, and logout.

Online/Offline Presence: Real-time user status tracking using Socket.IO.

Media & Attachments:
Text Messaging: Send and receive text messages.

Media Support (Conceptual): Designed to integrate with Firebase Storage for images, videos, documents, and audio. (Actual file upload UI/logic beyond text is an enhancement).

Notification System:
In-App Notifications: Basic alerts for new messages.

Web Push Notifications: (Future Enhancement)

UI/UX Requirements:
Responsive Frontend: Built with React.js and styled using Tailwind CSS for adaptability across devices.

State Management: Efficient state handling with Redux Toolkit.

Mobile-First Design: Optimized for mobile viewing first.

Dark Mode Support: Toggleable dark theme for comfortable viewing.

Search Functionality: Basic search for users and chat messages (conceptual, requires backend integration).

Backend & Database:
Node.js & Express.js: Robust and scalable backend.

Modular REST API: Organized routes and controllers for users, authentication, chats, and messages.

MongoDB with Mongoose: NoSQL database for flexible schema modeling and data storage.

Group Management: API endpoints for group creation, joining, leaving, and permission handling.

MVC Folder Structure: Clean and maintainable codebase.

Real-time Tech Stack:
WebSockets (Socket.IO): For instant, bi-directional communication.

Socket Rooms: Efficiently manage 1-to-1 and group chat communication.

DevOps & Deployment:
Environment Variable Support: Configuration via .env files.

Deployment Strategy:

Frontend: Vercel

Backend: Render/Heroku

Database: MongoDB Atlas

CI/CD: (Optional, GitHub Actions recommended for automation)

📁 Project Structure
ChatterBox/
├── client/                      # Frontend (React)
│   ├── public/
│   ├── src/
│   │   ├── assets/              # Images, logos, icons (placeholder)
│   │   ├── components/          # Reusable UI components
│   │   │   ├── ChatWindow.jsx
│   │   │   ├── MessageBubble.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── ContactList.jsx  (integrated into Sidebar for simplicity)
│   │   ├── pages/               # Page-level views
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Home.jsx
│   │   ├── redux/               # State management
│   │   │   ├── store.js
│   │   │   ├── authSlice.js
│   │   │   ├── chatSlice.js
│   │   ├── App.js
│   │   ├── main.jsx
│   │   └── index.css
│
├── server/                      # Backend (Node.js)
│   ├── config/                  # DB & config files
│   │   └── db.js
│   ├── controllers/             # Route logic
│   │   ├── authController.js
│   │   ├── chatController.js
│   │   ├── messageController.js
│   ├── models/                  # Mongoose schemas
│   │   ├── User.js
│   │   ├── Chat.js
│   │   ├── Message.js
│   ├── routes/                  # Route definitions
│   │   ├── authRoutes.js
│   │   ├── chatRoutes.js
│   │   ├── messageRoutes.js
│   ├── middleware/              # Auth, error handling
│   │   ├── authMiddleware.js
│   │   ├── errorHandler.js
│   ├── socket/                  # WebSocket logic
│   │   └── index.js
│   ├── utils/                   # Helpers (e.g., file upload, logger) (placeholder)
│   ├── server.js                # Entry point
│   └── .env                     # Environment variables
│
├── README.md
├── package.json                 (root level, for linting, etc.)
└── .gitignore

🛠️ Technologies Used
Frontend:

React.js: A JavaScript library for building user interfaces.

Redux Toolkit: Official, opinionated, battery-included toolset for efficient Redux development.

Tailwind CSS: A utility-first CSS framework for rapid UI development.

Socket.IO Client: For real-time communication.

Firebase SDK: For client-side authentication and storage.

Backend:

Node.js: JavaScript runtime.

Express.js: Fast, unopinionated, minimalist web framework for Node.js.

MongoDB: NoSQL document database.

Mongoose: MongoDB object data modeling (ODM) for Node.js.

Socket.IO: For real-time, bidirectional event-based communication.

Firebase Admin SDK: For backend integration with Firebase Auth and Storage.

bcryptjs: For password hashing (though Firebase Auth handles this primarily, included for completeness if local auth is desired).

dotenv: To load environment variables.

⚙️ Setup and Installation
Prerequisites
Node.js (v14 or higher)

npm or yarn

MongoDB Atlas account (or local MongoDB instance)

Firebase Project setup (for Authentication and Storage)

1. Backend Setup
Navigate to the server/ directory:

cd ChatterBox/server

Install dependencies:

npm install
# or
yarn install

Create a .env file in the server/ directory and add the following environment variables:

PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY_ID=your_firebase_private_key_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_FIREBASE_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
FIREBASE_CLIENT_ID=your_firebase_client_id
FIREBASE_AUTH_URI=your_firebase_auth_uri
FIREBASE_TOKEN_URI=your_firebase_token_uri
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=your_firebase_auth_provider_x509_cert_url
FIREBASE_CLIENT_X509_CERT_URL=your_firebase_client_x509_cert_url
FIREBASE_UNIVERSE_DOMAIN=your_firebase_universe_domain

# IMPORTANT: For development, set CORS_ORIGIN to your frontend development URL (e.g., http://localhost:5173).
# For production, set it to your deployed frontend URL (e.g., https://your-chatterbox-frontend.vercel.app).
CORS_ORIGIN=http://localhost:5173

Firebase Private Key:
To get your FIREBASE_PRIVATE_KEY, go to your Firebase project, navigate to Project settings > Service accounts. Click "Generate new private key" and download the JSON file. Copy the private_key field from this JSON file. Ensure to replace all \n characters with actual newline characters within the string or concatenate parts carefully if loading from a string. For example: "-----BEGIN PRIVATE KEY-----\nABCD...\n-----END PRIVATE KEY-----\n"

Run the backend:

npm start
# or
yarn start

The backend server will run on http://localhost:5000 (or your specified PORT).

2. Frontend Setup
Navigate to the client/ directory:

cd ChatterBox/client

Install dependencies:

npm install
# or
yarn install

Create a .env file in the client/ directory and add the following Firebase client-side configuration variables:

VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id

# Backend URL for API calls and Socket.IO connection
VITE_BACKEND_URL=http://localhost:5000

You can find these values in your Firebase project settings under "Your apps" -> "Web app" -> "Firebase SDK snippet" -> "Config".

Run the frontend:

npm run dev
# or
yarn dev

The frontend will open in your browser, typically at http://localhost:5173.

🐳 Deployment
Frontend (Vercel)
Build: Run npm run build in client/ to create the dist folder.

Vercel CLI: Install Vercel CLI (npm i -g vercel).

Deploy: Navigate to client/ and run vercel. Follow the prompts.

Environment Variables: Add VITE_FIREBASE_* and VITE_BACKEND_URL (pointing to your deployed backend) to Vercel project settings.

Backend (Render / Heroku)
MongoDB Atlas: Ensure your MongoDB Atlas cluster is publicly accessible or correctly configured with IP whitelisting for Render/Heroku.

Render/Heroku Setup:

Create a new web service.

Connect your GitHub repository.

Set the build command (e.g., npm install).

Set the start command (e.g., npm start).

Environment Variables: Add all FIREBASE_*, MONGO_URI, and CORS_ORIGIN (pointing to your deployed frontend URL) as environment variables in Render/Heroku dashboard.

Database (MongoDB Atlas)
Create a free tier cluster on MongoDB Atlas.

Follow their instructions to get the connection string (MONGO_URI).

Ensure your IP address is whitelisted, or allow access from anywhere for easier testing (not recommended for production).

🤝 Contributing
Contributions are welcome! Please feel free to open issues or submit pull requests.

📄 License
This project is open source and available under the MIT License.