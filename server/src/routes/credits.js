import express from 'express';
import {
  getUserCredits,
  getUserTransactions,
  earnCredits,
  spendCredits,
  getCreditSummary,
} from '../controllers/creditController.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

// Public routes
router.get('/:userId', getUserCredits);
router.get('/summary/:userId', getCreditSummary);

// Private routes
router.get('/transactions/:userId', authenticate, getUserTransactions);
router.post('/earn', authenticate, earnCredits);
router.post('/spend', authenticate, spendCredits);

export default router;
