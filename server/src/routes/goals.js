import express from 'express';
import {
  createGoal,
  getUserGoals,
  getGoal,
  updateGoal,
  deleteGoal,
} from '../controllers/goalController.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

// Public routes
router.get('/user/:userId', getUserGoals);
router.get('/:goalId', getGoal);

// Private routes
router.post('/', authenticate, createGoal);
router.patch('/:goalId', authenticate, updateGoal);
router.delete('/:goalId', authenticate, deleteGoal);

export default router;
