require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIO = require('socket.io');

const authRoutes = require('./routes/auth');
const messageRoutes = require('./routes/messages');
const relativesRoutes = require('./routes/relatives');
const errorHandler = require('./middleware/errorHandler');
const { decryptMessage } = require('./utils/encryption');
const { calculateDistance, isValidLocation } = require('./utils/proximity');
const User = require('./models/User');
const RelativeAlert = require('./models/RelativeAlert');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  })
);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/safechat', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/relatives', relativesRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ message: 'Server is running' });
});

// Socket.IO events
const userSockets = {}; // Map user IDs to socket IDs

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // User comes online
  socket.on('userOnline', (userId) => {
    userSockets[userId] = socket.id;
    io.emit('userStatusChanged', { userId, status: 'online' });
  });

  // User goes offline
  socket.on('disconnect', () => {
    const userId = Object.keys(userSockets).find((key) => userSockets[key] === socket.id);
    if (userId) {
      delete userSockets[userId];
      io.emit('userStatusChanged', { userId, status: 'offline' });
    }
    console.log('Client disconnected:', socket.id);
  });

  // Real-time messaging
  socket.on('sendMessage', (data) => {
    const { senderId, recipientId, content, encryptedContent } = data;

    // Send to recipient if online
    const recipientSocketId = userSockets[recipientId];
    if (recipientSocketId) {
      io.to(recipientSocketId).emit('receiveMessage', {
        senderId,
        content: decryptMessage(encryptedContent) || '[Encrypted message]',
        timestamp: new Date(),
      });
    }
  });

  // Typing indicator
  socket.on('typing', (data) => {
    const { senderId, recipientId } = data;
    const recipientSocketId = userSockets[recipientId];
    if (recipientSocketId) {
      io.to(recipientSocketId).emit('userTyping', { userId: senderId });
    }
  });

  // Stop typing indicator
  socket.on('stopTyping', (data) => {
    const { senderId, recipientId } = data;
    const recipientSocketId = userSockets[recipientId];
    if (recipientSocketId) {
      io.to(recipientSocketId).emit('userStopTyping', { userId: senderId });
    }
  });

  // Call events (for future implementation)
  socket.on('initiateCall', (data) => {
    const { callerId, recipientId } = data;
    const recipientSocketId = userSockets[recipientId];
    if (recipientSocketId) {
      io.to(recipientSocketId).emit('incomingCall', { callerId, callerSocketId: socket.id });
    }
  });

  socket.on('acceptCall', (data) => {
    const { callerId } = data;
    const callerSocketId = userSockets[callerId];
    if (callerSocketId) {
      io.to(callerSocketId).emit('callAccepted', { recipientSocketId: socket.id });
    }
  });

  // Location tracking for proximity alerts
  socket.on('updateLocation', async (data) => {
    try {
      const { userId, latitude, longitude, accuracy } = data;

      // Validate coordinates
      if (!isValidLocation(latitude, longitude)) {
        socket.emit('locationError', { message: 'Invalid coordinates' });
        return;
      }

      // Update user location in database
      const user = await User.findByIdAndUpdate(
        userId,
        {
          currentLocation: {
            latitude,
            longitude,
            accuracy: accuracy || 0,
            timestamp: new Date(),
          },
        },
        { new: true }
      ).select('savedRelatives currentLocation');

      if (!user) {
        socket.emit('locationError', { message: 'User not found' });
        return;
      }

      // Broadcast location update to followers
      io.emit('locationUpdated', {
        userId,
        latitude,
        longitude,
        accuracy,
        timestamp: new Date(),
      });

      // Check proximity to saved relatives
      if (user.savedRelatives && user.savedRelatives.length > 0) {
        // In a real implementation, you would fetch relative locations from database
        // This is a simplified version that checks distance calculation
        for (const relative of user.savedRelatives) {
          // Note: In production, you'd need to:
          // 1. Find users associated with the phone number (integrate with SMS/contact system)
          // 2. Get their current locations
          // 3. Calculate distance
          // For now, this stores the framework for when relatives register with app

          const proximityThreshold = 1.0; // 1 km
          // Proximity check would happen here with actual relative locations
        }
      }

      socket.emit('locationTracked', {
        success: true,
        message: 'Location updated',
        timestamp: new Date(),
      });
    } catch (error) {
      console.error('Location update error:', error);
      socket.emit('locationError', { message: 'Failed to update location' });
    }
  });

  // Stop sharing location
  socket.on('stopLocationSharing', async (data) => {
    try {
      const { userId } = data;
      await User.findByIdAndUpdate(userId, {
        locationSharingEnabled: false,
      });

      io.emit('locationSharingDisabled', { userId });
      socket.emit('locationSharingToggled', { enabled: false });
    } catch (error) {
      console.error('Stop location sharing error:', error);
      socket.emit('locationError', { message: 'Failed to stop sharing' });
    }
  });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
