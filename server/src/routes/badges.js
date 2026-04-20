import express from 'express';
import {
  createBadge,
  getAllBadges,
  getUserBadges,
  awardBadge,
  deleteBadge,
} from '../controllers/badgeController.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

// Public routes
router.get('/', getAllBadges);
router.get('/user/:userId', getUserBadges);

// Private routes
router.post('/', authenticate, createBadge);
router.post('/award', authenticate, awardBadge);
router.delete('/:badgeId', authenticate, deleteBadge);

export default router;
