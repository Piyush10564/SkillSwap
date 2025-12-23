import express from 'express';
import { 
  getConversations, 
  getMessages, 
  createMessage,
  createOrGetConversation 
} from '../controllers/chatController.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

// All routes are protected
router.use(authenticate);

router.get('/conversations', getConversations);
router.post('/conversations', createOrGetConversation);
router.get('/conversations/:id/messages', getMessages);
router.post('/conversations/:id/messages', createMessage);

export default router;
