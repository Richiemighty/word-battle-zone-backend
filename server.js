require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketio = require('socket.io');
const User = require('./models/User'); // Make sure this path is correct

import dotenv from 'dotenv';
dotenv.config();


const MONGO_URI = process.env.MONGO_URI;


// Route files
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const friendRoutes = require('./routes/friends');
const friendRequestRoutes = require('./routes/friendRequests');

const app = express();
const server = http.createServer(app);

// Socket.io setup
const io = socketio(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// MongoDB connection
mongoose.connect(MONGO_URI)
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/friend-requests', friendRequestRoutes);

// Socket.io: Real-time online status management
const onlineUsers = new Set();

io.on('connection', (socket) => {
  console.log('🔌 User connected:', socket.id);

  socket.on('user-online', async (userId) => {
    try {
      onlineUsers.add(userId);
      await User.findByIdAndUpdate(userId, { online: true });
      console.log(`🟢 User ${userId} set to online`);
      io.emit('online-users', Array.from(onlineUsers));
    } catch (err) {
      console.error('❌ Failed to set user online:', err);
    }
  });

  socket.on('user-offline', async (userId) => {
    try {
      onlineUsers.delete(userId);
      await User.findByIdAndUpdate(userId, { online: false });
      console.log(`⚪ User ${userId} set to offline`);
      io.emit('online-users', Array.from(onlineUsers));
    } catch (err) {
      console.error('❌ Failed to set user offline:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log('🔌 User disconnected:', socket.id);
    // Optionally: handle cleanup if you map socket.id to userId
  });
});

// Optional: Load game logic via socket if needed
// require('./sockets/game')(io);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

module.exports = { app, server };
