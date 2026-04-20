import SessionNote from '../models/SessionNote.js';

/**
 * @route   POST /api/notes
 * @desc    Create a session note
 * @access  Private
 */
export const createSessionNote = async (req, res, next) => {
  try {
    const { sessionId, content, tags } = req.body;
    const userId = req.user.id;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Please provide content',
      });
    }

    const note = await SessionNote.create({
      userId,
      sessionId: sessionId || null,
      content,
      tags: tags || [],
    });

    res.status(201).json({
      success: true,
      message: 'Note created successfully',
      data: note,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/notes/session/:sessionId
 * @desc    Get all notes for a session
 * @access  Public
 */
export const getSessionNotes = async (req, res, next) => {
  try {
    const { sessionId } = req.params;

    const notes = await SessionNote.find({ sessionId })
      .populate('userId', 'name avatarUrl')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: notes,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/notes/user/:userId
 * @desc    Get all notes by a user
 * @access  Private
 */
export const getUserNotes = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    // Check authorization
    if (req.user.id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view these notes',
      });
    }

    const notes = await SessionNote.find({ userId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));

    const totalCount = await SessionNote.countDocuments({ userId });

    res.status(200).json({
      success: true,
      data: notes,
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
 * @route   GET /api/notes/:noteId
 * @desc    Get a single note
 * @access  Public
 */
export const getSessionNote = async (req, res, next) => {
  try {
    const { noteId } = req.params;

    const note = await SessionNote.findById(noteId).populate(
      'userId',
      'name avatarUrl'
    );

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found',
      });
    }

    res.status(200).json({
      success: true,
      data: note,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PATCH /api/notes/:noteId
 * @desc    Update a note
 * @access  Private
 */
export const updateSessionNote = async (req, res, next) => {
  try {
    const { noteId } = req.params;
    const { content, tags } = req.body;

    const note = await SessionNote.findById(noteId);
    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found',
      });
    }

    if (note.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this note',
      });
    }

    if (content) note.content = content;
    if (tags) note.tags = tags;

    await note.save();

    res.status(200).json({
      success: true,
      message: 'Note updated successfully',
      data: note,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/notes/:noteId
 * @desc    Delete a note
 * @access  Private
 */
export const deleteSessionNote = async (req, res, next) => {
  try {
    const { noteId } = req.params;

    const note = await SessionNote.findById(noteId);
    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found',
      });
    }

    if (note.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this note',
      });
    }

    await SessionNote.findByIdAndDelete(noteId);

    res.status(200).json({
      success: true,
      message: 'Note deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
