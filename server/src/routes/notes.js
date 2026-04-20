import express from 'express';
import {
  createSessionNote,
  getSessionNotes,
  getUserNotes,
  getSessionNote,
  updateSessionNote,
  deleteSessionNote,
} from '../controllers/noteController.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

// Public routes
router.get('/session/:sessionId', getSessionNotes);
router.get('/:noteId', getSessionNote);

// Private routes
router.post('/', authenticate, createSessionNote);
router.get('/user/:userId', authenticate, getUserNotes);
router.patch('/:noteId', authenticate, updateSessionNote);
router.delete('/:noteId', authenticate, deleteSessionNote);

export default router;
