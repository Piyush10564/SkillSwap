import User from '../models/User.js';
import Transaction from '../models/Transaction.js';

/**
 * @route   GET /api/credits/:userId
 * @desc    Get user's credit balance
 * @access  Public
 */
export const getUserCredits = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select('credits');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        userId,
        credits: user.credits,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/transactions/:userId
 * @desc    Get transaction history for a user
 * @access  Private
 */
export const getUserTransactions = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    // Check authorization
    if (req.user.id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view these transactions',
      });
    }

    const transactions = await Transaction.find({ userId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));

    const totalCount = await Transaction.countDocuments({ userId });

    res.status(200).json({
      success: true,
      data: transactions,
      pagination: {
        total: totalCount,
        limit: parseInt(limit),
        offset: parseInt(offset),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/transactions/earn
 * @desc    Add credits to user (when teaching)
 * @access  Private
 */
export const earnCredits = async (req, res, next) => {
  try {
    const { userId, credits, sessionId, description } = req.body;

    if (!userId || !credits || credits <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide valid userId and credits amount',
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Update user credits
    user.credits += credits;
    await user.save();

    // Create transaction record
    const transaction = await Transaction.create({
      userId,
      type: 'earn',
      credits,
      sessionId: sessionId || null,
      description: description || 'Earned credits from teaching',
      balance: user.credits,
    });

    res.status(201).json({
      success: true,
      message: 'Credits earned successfully',
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/transactions/spend
 * @desc    Deduct credits from user (when learning)
 * @access  Private
 */
export const spendCredits = async (req, res, next) => {
  try {
    const { userId, credits, sessionId, description } = req.body;

    if (!userId || !credits || credits <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide valid userId and credits amount',
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Check if user has enough credits
    if (user.credits < credits) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient credits',
      });
    }

    // Update user credits
    user.credits -= credits;
    await user.save();

    // Create transaction record
    const transaction = await Transaction.create({
      userId,
      type: 'spend',
      credits,
      sessionId: sessionId || null,
      description: description || 'Spent credits for learning',
      balance: user.credits,
    });

    res.status(201).json({
      success: true,
      message: 'Credits spent successfully',
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/transactions/summary/:userId
 * @desc    Get credit summary for a user
 * @access  Public
 */
export const getCreditSummary = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select('credits');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const earnedTransactions = await Transaction.find({
      userId,
      type: 'earn',
    });
    const spentTransactions = await Transaction.find({
      userId,
      type: 'spend',
    });

    const totalEarned = earnedTransactions.reduce((sum, t) => sum + t.credits, 0);
    const totalSpent = spentTransactions.reduce((sum, t) => sum + t.credits, 0);

    res.status(200).json({
      success: true,
      data: {
        userId,
        currentBalance: user.credits,
        totalEarned,
        totalSpent,
        transactionCount: earnedTransactions.length + spentTransactions.length,
      },
    });
  } catch (error) {
    next(error);
  }
};
