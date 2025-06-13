
# 💬 ChatterBox - Real-time Messaging Application

**ChatterBox** is a modern, full-stack real-time messaging application designed to provide a seamless communication experience. It supports 1-to-1 private chats, group messaging with roles, real-time message updates, and a responsive user interface.

---

## 🚀 Features

### 🔗 Core Chat Functionality
- ✅ Real-time 1-to-1 Messaging (Socket.IO)
- ✅ Real-time Group Messaging with Roles (admin/member)
- ✅ Seen & Delivered Message Status
- ✅ Typing Indicators
- ✅ Message Timestamps & Ordering
- ✅ Infinite Scroll (Basic Pagination)

### 👤 User & Account System
- 🔐 Secure Authentication (Firebase Auth)
- 🌐 Online/Offline Status (Socket.IO)

### 📎 Media & Attachments
- 📝 Text Messaging
- 🖼️ Image, Video, Audio (Conceptual - via Firebase Storage)
- 📁 File Upload (Future enhancement)

### 🔔 Notifications
- 🛎️ In-App Alerts for New Messages
- 📣 Web Push Notifications (Planned)

### 🖥️ UI/UX Requirements
- 🎨 Responsive Frontend (React + TailwindCSS)
- ⚙️ Redux Toolkit for State Management
- 📱 Mobile-First Design
- 🌙 Dark Mode Support
- 🔍 User & Chat Search (Conceptual)

### 🛠️ Backend & Database
- ⚙️ Node.js + Express.js REST API
- 🧩 Modular MVC Codebase
- 🧠 MongoDB + Mongoose for Schema Modeling
- 👥 Group APIs (create, join, leave, permissions)

### 🔄 Real-Time Tech
- ⚡ Socket.IO WebSockets
- 🏠 Socket Rooms for Group/Private Chats

---

## 🗂️ Project Folder Structure

```bash
ChatterBox/
├── client/                      # Frontend (React)
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── ChatWindow.jsx
│   │   │   ├── MessageBubble.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── ContactList.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Home.jsx
│   │   ├── redux/
│   │   │   ├── store.js
│   │   │   ├── authSlice.js
│   │   │   ├── chatSlice.js
│   │   ├── App.js
│   │   ├── main.jsx
│   │   └── index.css
│
├── server/                      # Backend (Node.js)
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── chatController.js
│   │   ├── messageController.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Chat.js
│   │   ├── Message.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── chatRoutes.js
│   │   ├── messageRoutes.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── errorHandler.js
│   ├── socket/
│   │   └── index.js
│   ├── utils/                   # Helper functions
│   ├── server.js
│   └── .env
│
├── README.md
├── package.json
└── .gitignore
````

---

## 🛠️ Technologies Used

### Frontend

* React.js
* Redux Toolkit
* Tailwind CSS
* Firebase SDK
* Socket.IO Client

### Backend

* Node.js
* Express.js
* MongoDB + Mongoose
* Socket.IO
* Firebase Admin SDK
* bcryptjs
* dotenv

---

## ⚙️ Setup and Installation

### 📌 Prerequisites

* Node.js v14+
* npm or yarn
* MongoDB Atlas (or local)
* Firebase Project with Auth & Storage enabled

---

### 🔧 Backend Setup

```bash
cd ChatterBox/server
npm install   # or yarn install
```

Create `.env` in `/server`:

```env
PORT=5000
MONGO_URI=your_mongodb_uri

FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY_ID=your_key_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your_firebase_email
FIREBASE_CLIENT_ID=your_client_id
FIREBASE_AUTH_URI=...
FIREBASE_TOKEN_URI=...
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=...
FIREBASE_CLIENT_X509_CERT_URL=...
FIREBASE_UNIVERSE_DOMAIN=...

CORS_ORIGIN=http://localhost:5173
```

Start the server:

```bash
npm start
```

---

### 💻 Frontend Setup

```bash
cd ChatterBox/client
npm install   # or yarn install
```

Create `.env` in `/client`:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
VITE_BACKEND_URL=http://localhost:5000
```

Run the dev server:

```bash
npm run dev
```

---

## 🐳 Deployment

### Frontend (Vercel)

```bash
cd client
npm run build
vercel  # follow prompts
```

Add all `VITE_` env variables on Vercel dashboard.

### Backend (Render/Heroku)

* Create Web Service → Connect GitHub → Add all `.env` vars.
* Set `npm install` & `npm start` as build/start commands.
* Use MongoDB Atlas connection string.

---

## 🤝 Contributing

We welcome contributions! Open issues or pull requests to suggest features, improvements, or bug fixes.

---

## 📄 License

This project is open source and available under the **MIT License**.

```

---

Let me know if you also want:
- `CONTRIBUTING.md` template  
- `LICENSE` file  
- `vercel.json` config  
- `render.yaml` deploy config

Main ready hoon 💪
```
