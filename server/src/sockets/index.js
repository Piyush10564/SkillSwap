import { Server } from 'socket.io';
import { verifyAccessToken } from '../utils/jwt.js';
import { setupChatHandlers } from './chatHandlers.js';
import { setupNotificationHandlers } from './notificationHandlers.js';
import User from '../models/User.js';

// Map to track online users: userId -> socketId
const onlineUsers = new Map();

/**
 * Initialize Socket.IO server
 */
export const initializeSocket = (httpServer, config) => {
  const io = new Server(httpServer, {
    cors: {
      origin: config.clientOrigin,
      credentials: true,
    },
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      // Verify token
      const decoded = verifyAccessToken(token);
      
      // Attach user ID to socket
      socket.userId = decoded.userId;
      
      next();
    } catch (error) {
      console.error('Socket authentication error:', error.message);
      next(new Error('Authentication error: Invalid token'));
    }
  });

  // Connection handler
  io.on('connection', async (socket) => {
    console.log(`✅ User connected: ${socket.userId} (${socket.id})`);

    // Add to online users
    onlineUsers.set(socket.userId, socket.id);

    // Update user's last online time
    try {
      await User.findByIdAndUpdate(socket.userId, {
        lastOnlineAt: new Date(),
      });
    } catch (error) {
      console.error('Error updating last online:', error);
    }

    // Broadcast user online status
    socket.broadcast.emit('user:online', {
      userId: socket.userId,
    });

    // Setup event handlers
    setupChatHandlers(io, socket, onlineUsers);
    setupNotificationHandlers(io, socket);

    // Handle disconnection
    socket.on('disconnect', async () => {
      console.log(`❌ User disconnected: ${socket.userId} (${socket.id})`);

      // Remove from online users
      onlineUsers.delete(socket.userId);

      // Update last online time
      try {
        await User.findByIdAndUpdate(socket.userId, {
          lastOnlineAt: new Date(),
        });
      } catch (error) {
        console.error('Error updating last online on disconnect:', error);
      }

      // Broadcast user offline status
      socket.broadcast.emit('user:offline', {
        userId: socket.userId,
      });
    });
  });

  return io;
};

export { onlineUsers };
