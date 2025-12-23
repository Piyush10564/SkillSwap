import express from 'express';
import { updateProfile, uploadAvatar, getStats } from '../controllers/profileController.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Update profile
router.put('/', updateProfile);

// Upload avatar
router.post('/avatar', uploadAvatar);

// Get user stats
router.get('/stats', getStats);

export default router;
