import Notification from '../models/Notification.js';

/**
 * Emit a notification to a specific user
 */
export const emitNotification = async (io, userId, type, data) => {
  try {
    // Create notification in database
    const notification = await Notification.create({
      user: userId,
      type,
      data,
    });

    // Emit to user's socket if online
    io.to(`user:${userId}`).emit('notification:new', notification);

    return notification;
  } catch (error) {
    console.error('Error emitting notification:', error);
  }
};

/**
 * Setup notification handlers
 */
export const setupNotificationHandlers = (io, socket) => {
  // Join user's personal notification room
  socket.join(`user:${socket.userId}`);
  console.log(`User ${socket.userId} joined notification room`);
};
