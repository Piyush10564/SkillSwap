import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';
import Notification from '../models/Notification.js';

/**
 * Handle chat-related socket events
 */
export const setupChatHandlers = (io, socket, onlineUsers) => {
  
  /**
   * Join a conversation room
   */
  socket.on('chat:join', async (conversationId) => {
    try {
      // Verify user is participant
      const conversation = await Conversation.findById(conversationId);
      
      if (!conversation) {
        socket.emit('error', { message: 'Conversation not found' });
        return;
      }

      const isParticipant = conversation.participants.some(
        p => p.toString() === socket.userId
      );

      if (!isParticipant) {
        socket.emit('error', { message: 'Not authorized' });
        return;
      }

      socket.join(`conversation:${conversationId}`);
      console.log(`User ${socket.userId} joined conversation ${conversationId}`);
    } catch (error) {
      console.error('Error joining conversation:', error);
      socket.emit('error', { message: 'Failed to join conversation' });
    }
  });

  /**
   * Leave a conversation room
   */
  socket.on('chat:leave', (conversationId) => {
    socket.leave(`conversation:${conversationId}`);
    console.log(`User ${socket.userId} left conversation ${conversationId}`);
  });

  /**
   * Send a message
   */
  socket.on('chat:message', async (data) => {
    try {
      const { conversationId, content } = data;

      if (!content || !content.trim()) {
        socket.emit('error', { message: 'Message content is required' });
        return;
      }

      // Verify conversation and participation
      const conversation = await Conversation.findById(conversationId);
      
      if (!conversation) {
        socket.emit('error', { message: 'Conversation not found' });
        return;
      }

      const isParticipant = conversation.participants.some(
        p => p.toString() === socket.userId
      );

      if (!isParticipant) {
        socket.emit('error', { message: 'Not authorized' });
        return;
      }

      // Create message
      const message = await Message.create({
        conversation: conversationId,
        sender: socket.userId,
        content: content.trim(),
        seenBy: [socket.userId],
      });

      // Update conversation
      conversation.lastMessage = message._id;
      
      // Increment unread count for other participant
      const otherParticipant = conversation.participants.find(
        p => p.toString() !== socket.userId
      );
      await conversation.incrementUnread(otherParticipant);
      await conversation.save();

      // Populate sender info
      await message.populate('sender', '_id name avatarUrl');

      // Emit to conversation room
      io.to(`conversation:${conversationId}`).emit('chat:message:new', {
        message,
        conversationId,
      });

      // Create notification for other participant if they're not in the room
      const otherUserSocketId = onlineUsers.get(otherParticipant.toString());
      const otherUserSockets = otherUserSocketId ? io.sockets.sockets.get(otherUserSocketId) : null;
      const isOtherUserInRoom = otherUserSockets?.rooms.has(`conversation:${conversationId}`);

      if (!isOtherUserInRoom) {
        const notification = await Notification.create({
          user: otherParticipant,
          type: 'message',
          data: {
            conversationId,
            messageId: message._id,
            senderName: message.sender.name,
            preview: content.substring(0, 50),
          },
        });

        // Emit notification to other user
        if (otherUserSocketId) {
          io.to(otherUserSocketId).emit('notification:new', notification);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  /**
   * Typing indicator
   */
  socket.on('chat:typing', (data) => {
    const { conversationId } = data;
    socket.to(`conversation:${conversationId}`).emit('chat:typing', {
      conversationId,
      userId: socket.userId,
    });
  });

  /**
   * Stop typing indicator
   */
  socket.on('chat:typing:stop', (data) => {
    const { conversationId } = data;
    socket.to(`conversation:${conversationId}`).emit('chat:typing:stop', {
      conversationId,
      userId: socket.userId,
    });
  });
};
