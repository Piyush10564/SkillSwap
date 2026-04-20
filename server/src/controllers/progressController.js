import ProgressTracking from '../models/ProgressTracking.js';

/**
 * @route   POST /api/progress
 * @desc    Create progress tracking entry
 * @access  Private
 */
export const createProgress = async (req, res, next) => {
  try {
    const { userId, skillId } = req.body;

    if (!userId || !skillId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide userId and skillId',
      });
    }

    // Check if progress entry already exists
    const existingProgress = await ProgressTracking.findOne({ userId, skillId });
    if (existingProgress) {
      return res.status(400).json({
        success: false,
        message: 'Progress tracking already exists for this user and skill',
      });
    }

    const progress = await ProgressTracking.create({
      userId,
      skillId,
    });

    res.status(201).json({
      success: true,
      message: 'Progress tracking created successfully',
      data: progress,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/progress/user/:userId
 * @desc    Get all progress for a user
 * @access  Public
 */
export const getUserProgress = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    const progress = await ProgressTracking.find({ userId })
      .populate('skillId', 'name')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));

    const totalCount = await ProgressTracking.countDocuments({ userId });

    res.status(200).json({
      success: true,
      data: progress,
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
 * @route   GET /api/progress/:progressId
 * @desc    Get a single progress entry
 * @access  Public
 */
export const getProgress = async (req, res, next) => {
  try {
    const { progressId } = req.params;

    const progress = await ProgressTracking.findById(progressId).populate(
      'skillId',
      'name'
    );

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: 'Progress entry not found',
      });
    }

    res.status(200).json({
      success: true,
      data: progress,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PATCH /api/progress/:progressId
 * @desc    Update progress entry
 * @access  Private
 */
export const updateProgress = async (req, res, next) => {
  try {
    const { progressId } = req.params;
    const { completedSessions, totalHoursLearned, progress, milestone } = req.body;

    const progressEntry = await ProgressTracking.findById(progressId);
    if (!progressEntry) {
      return res.status(404).json({
        success: false,
        message: 'Progress entry not found',
      });
    }

    // Check authorization
    if (progressEntry.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this progress',
      });
    }

    if (completedSessions !== undefined) {
      progressEntry.completedSessions = completedSessions;
    }
    if (totalHoursLearned !== undefined) {
      progressEntry.totalHoursLearned = totalHoursLearned;
    }
    if (progress !== undefined) {
      progressEntry.progress = Math.min(100, Math.max(0, progress));
    }
    if (milestone) {
      progressEntry.milestone = milestone;
    }

    // Update last session date
    progressEntry.lastSessionDate = new Date();

    await progressEntry.save();

    res.status(200).json({
      success: true,
      message: 'Progress updated successfully',
      data: progressEntry,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/progress/:progressId/session
 * @desc    Update progress after completing a session
 * @access  Private
 */
export const updateProgressAfterSession = async (req, res, next) => {
  try {
    const { progressId } = req.params;
    const { durationHours, progressIncrement } = req.body;

    if (durationHours === undefined || progressIncrement === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide durationHours and progressIncrement',
      });
    }

    const progressEntry = await ProgressTracking.findById(progressId);
    if (!progressEntry) {
      return res.status(404).json({
        success: false,
        message: 'Progress entry not found',
      });
    }

    if (progressEntry.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this progress',
      });
    }

    // Update progress
    progressEntry.completedSessions += 1;
    progressEntry.totalHoursLearned += durationHours;
    progressEntry.progress = Math.min(100, progressEntry.progress + progressIncrement);
    progressEntry.lastSessionDate = new Date();

    // Auto-update milestone
    if (progressEntry.progress >= 75 && progressEntry.milestone === 'beginner') {
      progressEntry.milestone = 'intermediate';
    } else if (progressEntry.progress >= 90 && progressEntry.milestone === 'intermediate') {
      progressEntry.milestone = 'advanced';
    } else if (progressEntry.progress >= 100 && progressEntry.milestone === 'advanced') {
      progressEntry.milestone = 'expert';
    }

    await progressEntry.save();

    res.status(200).json({
      success: true,
      message: 'Progress updated after session',
      data: progressEntry,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/progress/:progressId
 * @desc    Delete progress entry
 * @access  Private
 */
export const deleteProgress = async (req, res, next) => {
  try {
    const { progressId } = req.params;

    const progress = await ProgressTracking.findById(progressId);
    if (!progress) {
      return res.status(404).json({
        success: false,
        message: 'Progress entry not found',
      });
    }

    if (progress.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this progress',
      });
    }

    await ProgressTracking.findByIdAndDelete(progressId);

    res.status(200).json({
      success: true,
      message: 'Progress entry deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/progress/skill/:skillId
 * @desc    Get progress entries for a skill
 * @access  Public
 */
export const getSkillProgress = async (req, res, next) => {
  try {
    const { skillId } = req.params;
    const { limit = 10, offset = 0 } = req.query;

    const progress = await ProgressTracking.find({ skillId })
      .populate('userId', 'name avatarUrl')
      .sort({ progress: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));

    const totalCount = await ProgressTracking.countDocuments({ skillId });

    res.status(200).json({
      success: true,
      data: progress,
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
