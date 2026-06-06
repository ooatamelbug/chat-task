# 🚀 Scalable Real-Time Chat System (Backend)

## Overview

This backend is a scalable real-time chat system built using **NestJS**, **Socket.IO**, and **MongoDB**.
It supports multi-room chat, private messaging, real-time events, and production-ready architecture patterns.

---

## Features

### Real-Time Messaging

* Built with Socket.IO for low-latency communication
* Supports both:

  * Room-based messages
  * Private messages (DM)

---

### Multi-Room System

* Users can dynamically join chat rooms
* Each room maintains:

  * Connected users
  * Message history

---

### Message Persistence

* Messages are stored in MongoDB using Mongoose
* Schema includes:

  * roomId
  * senderId
  * receiverId (optional)
  * content
  * timestamp

---

### Message History

* Last 20 messages are loaded when joining a room
* Designed to support pagination (future improvement)

---

### Online Users Tracking

* Tracks active users per room
* Real-time updates when users:

  * Join
  * Leave
  * Disconnect

---

### Typing Indicator

* WhatsApp-style typing system:

  * typing_start
  * typing_stop
* Uses debounce to prevent excessive events

---

### Authentication (Basic)

* Uses socket handshake auth
* Each user identified via token (mocked)
* Designed to be replaced with JWT in production

---

### Rate Limiting

* Prevents spam:

  * e.g. 5 messages / 10 seconds per user per room
* Implemented via custom RateLimitService

---

### WebSocket Events

#### Client → Server

* join_room
* send_message
* typing_start
* typing_stop

#### Server → Client

* receive_message
* room_messages
* online_users
* typing_start / typing_stop

---

## Architecture

* Modular NestJS structure
* Separation of concerns:

  * Gateway (real-time layer)
  * Service (business logic)
  * Database layer (Mongoose)

---


## Tech Stack

* NestJS
* Socket.IO
* MongoDB (Mongoose)
* TypeScript

---

## Running the Project

```bash
npm install
npm run start:dev
```

---

## Notes

This project focuses on:

* Real-time communication
* Clean architecture
---

## Author

Developed as a backend assessment project demonstrating real-world system design and implementation.
