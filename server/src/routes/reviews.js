import express from 'express';
import {
  createReview,
  getUserReviews,
  getSessionReviews,
  updateReview,
  deleteReview,
} from '../controllers/reviewController.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

// Public routes
router.get('/user/:userId', getUserReviews);
router.get('/session/:sessionId', getSessionReviews);

// Private routes
router.post('/', authenticate, createReview);
router.patch('/:reviewId', authenticate, updateReview);
router.delete('/:reviewId', authenticate, deleteReview);

export default router;
