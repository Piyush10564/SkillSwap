import Skill from '../models/Skill.js';
import User from '../models/User.js';

/**
 * @route   GET /api/skills/mine
 * @desc    Get current user's skills
 * @access  Private
 */
export const getMySkills = async (req, res, next) => {
  try {
    const skillsOffer = await Skill.find({ owner: req.user._id, type: 'offer' });
    const skillsLearn = await Skill.find({ owner: req.user._id, type: 'learn' });

    res.status(200).json({
      success: true,
      data: {
        offer: skillsOffer,
        learn: skillsLearn,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/skills
 * @desc    Create a new skill
 * @access  Private
 */
export const createSkill = async (req, res, next) => {
  try {
    const { name, category, level, type, description } = req.body;

    // Validate required fields
    if (!name || !category || !level || !type) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, category, level, and type',
      });
    }

    // Create skill
    const skill = await Skill.create({
      name,
      category,
      level,
      type,
      description: description || '',
      owner: req.user._id,
    });

    // Add skill to user's skillsOffer or skillsLearn array
    const updateField = type === 'offer' ? 'skillsOffer' : 'skillsLearn';
    await User.findByIdAndUpdate(req.user._id, {
      $push: { [updateField]: skill._id },
    });

    res.status(201).json({
      success: true,
      message: 'Skill created successfully',
      data: { skill },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/skills/:id
 * @desc    Update a skill
 * @access  Private
 */
export const updateSkill = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, category, level, description } = req.body;

    // Find skill and verify ownership
    const skill = await Skill.findById(id);

    if (!skill) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found',
      });
    }

    if (skill.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this skill',
      });
    }

    // Update skill
    skill.name = name || skill.name;
    skill.category = category || skill.category;
    skill.level = level || skill.level;
    skill.description = description !== undefined ? description : skill.description;

    await skill.save();

    res.status(200).json({
      success: true,
      message: 'Skill updated successfully',
      data: { skill },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/skills/:id
 * @desc    Delete a skill
 * @access  Private
 */
export const deleteSkill = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Find skill and verify ownership
    const skill = await Skill.findById(id);

    if (!skill) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found',
      });
    }

    if (skill.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this skill',
      });
    }

    // Remove skill from user's array
    const updateField = skill.type === 'offer' ? 'skillsOffer' : 'skillsLearn';
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { [updateField]: skill._id },
    });

    // Delete skill
    await Skill.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Skill deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
