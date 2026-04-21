import Goal from '../models/Goal.js';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import { CREDIT_RULES, TRANSACTION_DESCRIPTIONS } from '../config/creditRules.js';

/**
 * @route   POST /api/goals
 * @desc    Create a new learning goal
 * @access  Private
 */
export const createGoal = async (req, res, next) => {
  try {
    const { skillId, title, description, targetDate } = req.body;
    const userId = req.user.id;

    if (!skillId || !title || !targetDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide skillId, title, and targetDate',
      });
    }

    const goal = await Goal.create({
      userId,
      skillId,
      title,
      description: description || '',
      targetDate,
    });

    res.status(201).json({
      success: true,
      message: 'Goal created successfully',
      data: goal,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/goals/user/:userId
 * @desc    Get all goals for a user
 * @access  Public
 */
export const getUserGoals = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { status, limit = 10, offset = 0 } = req.query;

    const query = { userId };
    if (status) query.status = status;

    const goals = await Goal.find(query)
      .populate('skillId', 'name')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));

    const totalCount = await Goal.countDocuments(query);

    res.status(200).json({
      success: true,
      data: goals,
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
 * @route   GET /api/goals/:goalId
 * @desc    Get a single goal
 * @access  Public
 */
export const getGoal = async (req, res, next) => {
  try {
    const { goalId } = req.params;

    const goal = await Goal.findById(goalId).populate('skillId', 'name');

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found',
      });
    }

    res.status(200).json({
      success: true,
      data: goal,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PATCH /api/goals/:goalId
 * @desc    Update a goal (progress, status, etc.)
 * @access  Private
 */
export const updateGoal = async (req, res, next) => {
  try {
    const { goalId } = req.params;
    const { progress, status, title, description, targetDate } = req.body;

    const goal = await Goal.findById(goalId);
    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found',
      });
    }

    if (goal.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this goal',
      });
    }

    const wasCompleted = goal.status === 'completed'; // Track if already completed

    // Update fields
    if (progress !== undefined) goal.progress = Math.min(100, Math.max(0, progress));
    if (status) goal.status = status;
    if (title) goal.title = title;
    if (description !== undefined) goal.description = description;
    if (targetDate) goal.targetDate = targetDate;

    // Mark as completed if progress reaches 100 and status is active
    if (goal.progress === 100 && goal.status === 'active') {
      goal.status = 'completed';
      goal.completedAt = new Date();
    }

    // Award credits if goal just became completed (transition from active to completed)
    if (goal.status === 'completed' && !wasCompleted) {
      const user = await User.findById(goal.userId);
      if (user) {
        user.credits += CREDIT_RULES.GOAL_COMPLETION;
        await user.save();

        // Create transaction record
        await Transaction.create({
          userId: goal.userId,
          type: 'earn',
          credits: CREDIT_RULES.GOAL_COMPLETION,
          description: TRANSACTION_DESCRIPTIONS.goal_completed,
          balance: user.credits,
        });
      }
    }

    await goal.save();

    res.status(200).json({
      success: true,
      message: 'Goal updated successfully',
      data: goal,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/goals/:goalId
 * @desc    Delete a goal
 * @access  Private
 */
export const deleteGoal = async (req, res, next) => {
  try {
    const { goalId } = req.params;

    const goal = await Goal.findById(goalId);
    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found',
      });
    }

    if (goal.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this goal',
      });
    }

    await Goal.findByIdAndDelete(goalId);

    res.status(200).json({
      success: true,
      message: 'Goal deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
