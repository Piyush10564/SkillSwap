import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import { CREDIT_RULES, TRANSACTION_DESCRIPTIONS } from '../config/creditRules.js';

/**
 * @route   GET /api/chat/conversations
 * @desc    Get all conversations for current user
 * @access  Private
 */
export const getConversations = async (req, res, next) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id,
    })
      .populate('participants', 'name email avatarUrl lastOnlineAt')
      .populate('lastMessage')
      .sort({ updatedAt: -1 });

    // Format conversations with unread count for current user
    const formattedConversations = conversations.map(conv => {
      const unreadCount = conv.unreadCounts.get(req.user._id.toString()) || 0;
      const otherParticipant = conv.participants.find(
        p => p._id.toString() !== req.user._id.toString()
      );

      return {
        _id: conv._id,
        participant: otherParticipant,
        lastMessage: conv.lastMessage,
        unreadCount,
        updatedAt: conv.updatedAt,
      };
    });

    res.status(200).json({
      success: true,
      data: { conversations: formattedConversations },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/chat/conversations/:id/messages
 * @desc    Get messages for a conversation
 * @access  Private
 */
export const getMessages = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { limit = 50, before } = req.query;

    // Verify user is participant
    const conversation = await Conversation.findById(id);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found',
      });
    }

    const isParticipant = conversation.participants.some(
      p => p.toString() === req.user._id.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this conversation',
      });
    }

    // Build query
    const query = { conversation: id };
    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }

    // Get messages
    const messages = await Message.find(query)
      .populate('sender', 'name avatarUrl')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    // Mark messages as seen by current user
    const unseenMessages = messages.filter(
      msg => !msg.seenBy.includes(req.user._id)
    );

    if (unseenMessages.length > 0) {
      await Message.updateMany(
        { _id: { $in: unseenMessages.map(m => m._id) } },
        { $addToSet: { seenBy: req.user._id } }
      );

      // Reset unread count for this user
      await conversation.resetUnread(req.user._id);
    }

    res.status(200).json({
      success: true,
      data: {
        messages: messages.reverse(), // Return in chronological order
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/chat/conversations/:id/messages
 * @desc    Send a message (fallback for non-socket)
 * @access  Private
 */
export const createMessage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required',
      });
    }

    // Verify conversation exists and user is participant
    const conversation = await Conversation.findById(id);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found',
      });
    }

    const isParticipant = conversation.participants.some(
      p => p.toString() === req.user._id.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to send messages in this conversation',
      });
    }

    // Create message
    const message = await Message.create({
      conversation: id,
      sender: req.user._id,
      content: content.trim(),
      seenBy: [req.user._id],
    });

    // Update conversation
    conversation.lastMessage = message._id;
    
    // Increment unread count for other participant
    const otherParticipant = conversation.participants.find(
      p => p.toString() !== req.user._id.toString()
    );
    await conversation.incrementUnread(otherParticipant);

    await conversation.save();

    // Populate sender info
    await message.populate('sender', 'name avatarUrl');

    res.status(201).json({
      success: true,
      data: { message },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/chat/conversations
 * @desc    Create or get existing conversation with another user
 * @access  Private
 */
export const createOrGetConversation = async (req, res, next) => {
  try {
    const { participantId } = req.body;

    if (!participantId) {
      return res.status(400).json({
        success: false,
        message: 'Participant ID is required',
      });
    }

    if (participantId === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot create conversation with yourself',
      });
    }

    // Check if conversation already exists
    const existingConversation = await Conversation.findOne({
      participants: { $all: [req.user._id, participantId] },
    })
      .populate('participants', 'name email avatarUrl lastOnlineAt')
      .populate('lastMessage');

    if (existingConversation) {
      return res.status(200).json({
        success: true,
        data: { conversation: existingConversation },
      });
    }

    // Create new conversation
    const conversation = await Conversation.create({
      participants: [req.user._id, participantId],
    });

    await conversation.populate('participants', 'name email avatarUrl lastOnlineAt');

    res.status(201).json({
      success: true,
      data: { conversation },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/chat/conversations/:id/end
 * @desc    End a teaching session and award credits
 * @access  Private
 */
export const endSession = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { teacherId } = req.body; // ID of the person who taught

    if (!teacherId) {
      return res.status(400).json({
        success: false,
        message: 'teacherId is required',
      });
    }

    // Find conversation
    const conversation = await Conversation.findById(id)
      .populate('participants', 'credits');

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found',
      });
    }

    // Verify user is participant
    const isParticipant = conversation.participants.some(
      p => p._id.toString() === req.user._id.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to end this session',
      });
    }

    // Already ended
    if (conversation.status === 'ended') {
      return res.status(400).json({
        success: false,
        message: 'Session already ended',
      });
    }

    // End the session
    conversation.status = 'ended';
    conversation.endedAt = new Date();

    // Find teacher (the one who taught)
    const teacher = await User.findById(teacherId);
    const learner = conversation.participants.find(
      p => p._id.toString() !== teacherId
    );

    if (teacher && teacher._id.toString() !== learner._id.toString()) {
      // Award credits to teacher
      teacher.credits += CREDIT_RULES.TEACH_SESSION_COMPLETION;
      await teacher.save();

      // Create transaction record for teacher
      await Transaction.create({
        userId: teacher._id,
        type: 'earn',
        credits: CREDIT_RULES.TEACH_SESSION_COMPLETION,
        sessionId: id,
        description: TRANSACTION_DESCRIPTIONS.teach,
        balance: teacher.credits,
      });

      // Deduct credits from learner
      if (learner && learner.credits >= CREDIT_RULES.BOOK_SESSION) {
        learner.credits -= CREDIT_RULES.BOOK_SESSION;
        await learner.save();

        // Create transaction record for learner
        await Transaction.create({
          userId: learner._id,
          type: 'spend',
          credits: CREDIT_RULES.BOOK_SESSION,
          sessionId: id,
          description: TRANSACTION_DESCRIPTIONS.book_session,
          balance: learner.credits,
        });
      }
    }

    await conversation.save();

    res.status(200).json({
      success: true,
      message: 'Session ended successfully',
      data: { conversation },
    });
  } catch (error) {
    next(error);
  }
};
