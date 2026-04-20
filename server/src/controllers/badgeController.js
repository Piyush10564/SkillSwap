import Badge from '../models/Badge.js';
import UserBadge from '../models/UserBadge.js';
import User from '../models/User.js';
import Review from '../models/Review.js';

/**
 * @route   POST /api/badges
 * @desc    Create a new badge (admin only)
 * @access  Private/Admin
 */
export const createBadge = async (req, res, next) => {
  try {
    const { name, description, icon, criteria } = req.body;

    if (!name || !description || !icon) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, description, and icon',
      });
    }

    // Check if badge already exists
    const existingBadge = await Badge.findOne({ name });
    if (existingBadge) {
      return res.status(400).json({
        success: false,
        message: 'Badge with this name already exists',
      });
    }

    const badge = await Badge.create({
      name,
      description,
      icon,
      criteria: criteria || {},
    });

    res.status(201).json({
      success: true,
      message: 'Badge created successfully',
      data: badge,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/badges
 * @desc    Get all badges
 * @access  Public
 */
export const getAllBadges = async (req, res, next) => {
  try {
    const badges = await Badge.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: badges,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/badges/user/:userId
 * @desc    Get badges earned by a user
 * @access  Public
 */
export const getUserBadges = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const userBadges = await UserBadge.find({ userId })
      .populate('badgeId')
      .sort({ unlockedAt: -1 });

    res.status(200).json({
      success: true,
      data: userBadges,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/badges/award
 * @desc    Award a badge to a user (internal use)
 * @access  Private
 */
export const awardBadge = async (req, res, next) => {
  try {
    const { userId, badgeId } = req.body;

    if (!userId || !badgeId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide userId and badgeId',
      });
    }

    // Check if user already has this badge
    const existingUserBadge = await UserBadge.findOne({ userId, badgeId });
    if (existingUserBadge) {
      return res.status(400).json({
        success: false,
        message: 'User already has this badge',
      });
    }

    const userBadge = await UserBadge.create({ userId, badgeId });

    res.status(201).json({
      success: true,
      message: 'Badge awarded successfully',
      data: userBadge,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Helper function: Check and award badges based on user activity
 */
export const checkAndAwardBadges = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    const badges = await Badge.find();

    for (const badge of badges) {
      // Check if user already has this badge
      const hasBadge = await UserBadge.findOne({ userId, badgeId: badge._id });
      if (hasBadge) continue;

      let shouldAward = false;

      // Check criteria
      if (badge.criteria.type === 'sessions') {
        // Count sessions the user participated in
        // This would need session data - implement based on your needs
        // shouldAward = sessionCount >= badge.criteria.value;
      } else if (badge.criteria.type === 'rating') {
        shouldAward = user.averageRating >= badge.criteria.value;
      } else if (badge.criteria.type === 'reviews') {
        shouldAward = user.totalReviews >= badge.criteria.value;
      } else if (badge.criteria.type === 'credits') {
        shouldAward = user.credits >= badge.criteria.value;
      }

      if (shouldAward) {
        await UserBadge.create({ userId, badgeId: badge._id });
      }
    }
  } catch (error) {
    console.error('Error checking and awarding badges:', error);
  }
};

/**
 * @route   DELETE /api/badges/:badgeId
 * @desc    Delete a badge (admin only)
 * @access  Private/Admin
 */
export const deleteBadge = async (req, res, next) => {
  try {
    const { badgeId } = req.params;

    const badge = await Badge.findByIdAndDelete(badgeId);
    if (!badge) {
      return res.status(404).json({
        success: false,
        message: 'Badge not found',
      });
    }

    // Also remove this badge from all users
    await UserBadge.deleteMany({ badgeId });

    res.status(200).json({
      success: true,
      message: 'Badge deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
