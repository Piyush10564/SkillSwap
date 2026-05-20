import Request from '../models/Request.js';
import Skill from '../models/Skill.js';
import Conversation from '../models/Conversation.js';
import { awardCreditsToUser } from './creditController.js';

// Create a new learning request
export const createRequest = async (req, res, next) => {
  try {
    const learnerId = req.user._id;
    const { teacherId, skillId, message } = req.body;

    if (!teacherId) return res.status(400).json({ success: false, message: 'teacherId is required' });

    let skillName = '';
    if (skillId) {
      const skill = await Skill.findById(skillId).select('name');
      if (skill) skillName = skill.name;
    }

    const existing = await Request.findOne({ learner: learnerId, teacher: teacherId, skill: skillId, status: 'pending' });
    if (existing) return res.status(409).json({ success: false, message: 'You already have a pending request for this skill/teacher' });

    const request = await Request.create({ learner: learnerId, teacher: teacherId, skill: skillId, skillName, message });

    res.status(201).json({ success: true, request });
  } catch (err) {
    next(err);
  }
};

// Get incoming requests for authenticated teacher
export const getIncomingRequests = async (req, res, next) => {
  try {
    const teacherId = req.user._id;
    const requests = await Request.find({ teacher: teacherId })
      .populate('learner', 'name email avatarUrl')
      .populate('teacher', 'name email avatarUrl')
      .sort({ createdAt: -1 });
    res.json({ success: true, requests });
  } catch (err) {
    next(err);
  }
};

// Get outgoing requests by authenticated user
export const getOutgoingRequests = async (req, res, next) => {
  try {
    const learnerId = req.user._id;
    const requests = await Request.find({ learner: learnerId })
      .populate('teacher', 'name email avatarUrl')
      .populate('learner', 'name email avatarUrl')
      .sort({ createdAt: -1 });
    res.json({ success: true, requests });
  } catch (err) {
    next(err);
  }
};

// Update request status (accept/reject/cancel)
export const updateRequestStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'accepted', 'rejected', 'cancelled'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const request = await Request.findById(id);
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });

    // Only teacher can accept/reject; learner can cancel
    const userId = req.user._id.toString();
    if (status === 'accepted' || status === 'rejected') {
      if (request.teacher.toString() !== userId) return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (status === 'cancelled') {
      if (request.learner.toString() !== userId) return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    request.status = status;
    await request.save();

    let conversation = null;
    if (status === 'accepted') {
      await awardCreditsToUser({
        userId: request.teacher,
        credits: 50,
        description: 'Earned from accepting a learning request',
      });

      conversation = await Conversation.findOne({
        participants: { $all: [request.teacher, request.learner] },
      });

      if (!conversation) {
        conversation = await Conversation.create({
          participants: [request.teacher, request.learner],
          teacher: request.teacher,
          learner: request.learner,
        });
      } else {
        conversation.teacher = request.teacher;
        conversation.learner = request.learner;
        await conversation.save();
      }
    }

    res.json({ success: true, request, conversation });
  } catch (err) {
    next(err);
  }
};
