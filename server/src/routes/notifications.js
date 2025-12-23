import express from 'express';
import { getNotifications, markAsRead, markAllAsRead } from '../controllers/notificationsController.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

// All routes are protected
router.use(authenticate);

router.get('/', getNotifications);
router.post('/:id/read', markAsRead);
router.post('/read-all', markAllAsRead);

export default router;
