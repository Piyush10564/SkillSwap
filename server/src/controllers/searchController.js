import Skill from '../models/Skill.js';
import User from '../models/User.js';

/**
 * @route   GET /api/search/skills
 * @desc    Search for skills with filters
 * @access  Private
 */
export const searchSkills = async (req, res, next) => {
  try {
    const { q, category, level, type, timezone, mode } = req.query;

    // Build query
    const query = {};

    // Text search on skill name
    if (q) {
      query.$text = { $search: q };
    }

    // Filter by category
    if (category && category !== 'Any') {
      query.category = category;
    }

    // Filter by level
    if (level && level !== 'Any') {
      query.level = level;
    }

    // Filter by type (offer/learn)
    if (type && type !== 'Any') {
      query.type = type;
    }

    // Exclude current user's skills
    query.owner = { $ne: req.user._id };

    // Find skills
    const skills = await Skill.find(query)
      .populate('owner', 'name email avatarUrl location timezone bio')
      .limit(50)
      .sort({ createdAt: -1 });

    // If timezone filter is provided, filter users by timezone
    let filteredSkills = skills;
    if (timezone && timezone !== 'Any') {
      filteredSkills = skills.filter(skill => 
        skill.owner.timezone === timezone
      );
    }

    res.status(200).json({
      success: true,
      data: {
        skills: filteredSkills,
        count: filteredSkills.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/matches/suggestions
 * @desc    Get suggested matches based on complementary skills
 * @access  Private
 */
export const getSuggestions = async (req, res, next) => {
  try {
    // Get current user with skills
    const currentUser = await User.findById(req.user._id)
      .populate('skillsOffer')
      .populate('skillsLearn');

    if (!currentUser.skillsOffer.length && !currentUser.skillsLearn.length) {
      return res.status(200).json({
        success: true,
        data: { suggestions: [] },
        message: 'Add skills to get personalized suggestions',
      });
    }

    // Find users who:
    // 1. Want to learn what I can teach (their skillsLearn matches my skillsOffer)
    // 2. Can teach what I want to learn (their skillsOffer matches my skillsLearn)

    const myOfferSkillNames = currentUser.skillsOffer.map(s => s.name);
    const myLearnSkillNames = currentUser.skillsLearn.map(s => s.name);

    // Find skills that match
    const matchingLearnSkills = await Skill.find({
      type: 'learn',
      name: { $in: myOfferSkillNames },
      owner: { $ne: req.user._id },
    }).populate('owner', 'name email avatarUrl location timezone bio lastOnlineAt');

    const matchingOfferSkills = await Skill.find({
      type: 'offer',
      name: { $in: myLearnSkillNames },
      owner: { $ne: req.user._id },
    }).populate('owner', 'name email avatarUrl location timezone bio lastOnlineAt');

    // Combine and deduplicate users
    const userMap = new Map();

    matchingLearnSkills.forEach(skill => {
      const userId = skill.owner._id.toString();
      if (!userMap.has(userId)) {
        userMap.set(userId, {
          user: skill.owner,
          canTeachMe: [],
          wantsToLearnFromMe: [],
        });
      }
      userMap.get(userId).wantsToLearnFromMe.push(skill.name);
    });

    matchingOfferSkills.forEach(skill => {
      const userId = skill.owner._id.toString();
      if (!userMap.has(userId)) {
        userMap.set(userId, {
          user: skill.owner,
          canTeachMe: [],
          wantsToLearnFromMe: [],
        });
      }
      userMap.get(userId).canTeachMe.push(skill.name);
    });

    // Convert to array and sort by match quality
    const suggestions = Array.from(userMap.values())
      .map(match => ({
        ...match,
        matchScore: match.canTeachMe.length + match.wantsToLearnFromMe.length,
      }))
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 10); // Top 10 suggestions

    res.status(200).json({
      success: true,
      data: { suggestions },
    });
  } catch (error) {
    next(error);
  }
};
