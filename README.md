# 💬 Real-Time Chat System

A full-stack real-time chat application built with modern technologies, featuring scalable architecture and real-time communication.

---

## 🚀 Project Overview

This project is a **multi-room chat system** that allows users to:

* Join chat rooms dynamically
* Send and receive messages in real-time
* See online users
* Get typing indicators
* Store message history

---

## 🧩 Project Structure

```
/project-root
  ├── backend/   → NestJS + Socket.IO + MongoDB
  ├── frontend/  → React.js (UI + Socket client)
```

---

## ⚙️ Backend (NestJS)

The backend handles:

* WebSocket communication using Socket.IO
* Authentication using JWT
* Message storage in MongoDB
* Rate limiting
* Room management
* Typing indicators

📁 Located in: `/backend`

---

## 🎨 Frontend (React)

The frontend provides:

* Clean chat UI
* Login & Register system
* Real-time messaging
* Typing indicator
* Online users list
* Message alignment (sender vs receiver)

📁 Located in: `/frontend`

---

## 🔐 Authentication

* Users can register or login
* Passwords are hashed using bcrypt
* JWT is used for authentication
* Token is used to connect with WebSocket

---

## 🔥 Features

* Real-time messaging
* Multi-room support
* Private messaging (DMs)
* Online users tracking
* Typing indicators
* Message persistence
* Rate limiting
* Reconnection support

---

## 🛠️ Tech Stack

### Backend

* NestJS
* Socket.IO
* MongoDB (Mongoose)
* JWT Authentication

### Frontend

* React.js
* Socket.IO Client

---

## ▶️ Getting Started

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd project-root
```

### 2. Run Backend

```bash
cd backend
npm install
npm run start:dev
```

### 3. Run Frontend

```bash
cd frontend
npm install
npm start
```

---

## 📌 Notes

* Make sure MongoDB is running
* Update `.env` with your JWT secret
* Backend runs on port `3001`
* Frontend runs on port `3000`

---

## 👨‍💻 Author

Mohamed
