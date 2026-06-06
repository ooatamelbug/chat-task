# Real-Time Chat App (Frontend)

## Overview

A simple yet powerful React-based frontend for a real-time chat system.
Built to demonstrate real-time interaction with a Socket.IO backend.

---

## Features

### Real-Time Chat

* Send and receive messages instantly
* Works with Socket.IO backend

---

### Room-Based Chat

* Users can join chat rooms dynamically
* Each room has its own conversation

---

### Online Users

* Displays active users in the room
* Updates in real-time

---

### Typing Indicator

* WhatsApp-like typing behavior
* Shows:

  * "User is typing..."
* Uses debounce for performance

---

### Message Timestamp

* Each message shows its sending time

---

### Smart UI Features

* Auto scroll to latest message
* Enter key to send message
* Clean chat bubbles layout:

  * Your messages → right
  * Others → left

---

### Avatar System

* Each user has a generated avatar
* Based on username (initial + color)

---

### Basic Authentication

* User enters:

  * Username
  * Room ID
* Passed via Socket.IO handshake

---

## Components

* App.js → connection & login
* Chat.js → main chat UI
* socket.js → socket configuration

---

## Tech Stack

* React.js
* Socket.IO Client
* JavaScript (ES6)

---

## Running the App

```bash
npm install
npm start
```

---

## Backend Connection

Make sure backend is running on:

```bash
http://localhost:3001
```

---

## Notes

This frontend focuses on:

* Simplicity
* Real-time UX
* Clean interaction with backend

---

## Author

Built as part of a real-time chat system assessment to demonstrate frontend integration with WebSocket-based backend.
