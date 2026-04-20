import express from 'express';
import {
  createProgress,
  getUserProgress,
  getProgress,
  updateProgress,
  updateProgressAfterSession,
  deleteProgress,
  getSkillProgress,
} from '../controllers/progressController.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

// Public routes
router.get('/user/:userId', getUserProgress);
router.get('/skill/:skillId', getSkillProgress);
router.get('/:progressId', getProgress);

// Private routes
router.post('/', authenticate, createProgress);
router.patch('/:progressId', authenticate, updateProgress);
router.post('/:progressId/session', authenticate, updateProgressAfterSession);
router.delete('/:progressId', authenticate, deleteProgress);

export default router;
