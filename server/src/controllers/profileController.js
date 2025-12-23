import User from '../models/User.js';

/**
 * @route   PUT /api/profile
 * @desc    Update user profile
 * @access  Private
 */
export const updateProfile = async (req, res, next) => {
  try {
    const { name, bio, location, timezone, preferences } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Update fields if provided
    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (location !== undefined) user.location = location;
    if (timezone) user.timezone = timezone;
    if (preferences) {
      user.preferences = {
        ...user.preferences,
        ...preferences,
      };
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: { user: user.toPublicProfile() },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/profile/avatar
 * @desc    Upload user avatar (base64)
 * @access  Private
 */
export const uploadAvatar = async (req, res, next) => {
  try {
    const { avatar } = req.body;

    if (!avatar) {
      return res.status(400).json({
        success: false,
        message: 'Avatar data is required',
      });
    }

    // Validate base64 image
    if (!avatar.startsWith('data:image/')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid image format',
      });
    }

    // Check size (limit to 2MB base64 string)
    if (avatar.length > 2 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        message: 'Image too large. Maximum size is 2MB',
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    user.avatarUrl = avatar;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Avatar uploaded successfully',
      data: { avatarUrl: user.avatarUrl },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/profile/stats
 * @desc    Get user statistics
 * @access  Private
 */
export const getStats = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('skillsOffer')
      .populate('skillsLearn');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const stats = {
      skillsOffered: user.skillsOffer.length,
      skillsLearning: user.skillsLearn.length,
      totalSkills: user.skillsOffer.length + user.skillsLearn.length,
      memberSince: user.createdAt,
    };

    res.status(200).json({
      success: true,
      data: { stats },
    });
  } catch (error) {
    next(error);
  }
};
