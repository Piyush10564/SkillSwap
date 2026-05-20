import express from 'express';
import { createRequest, getIncomingRequests, getOutgoingRequests, updateRequestStatus } from '../controllers/requestController.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

router.post('/', authenticate, createRequest);
router.get('/incoming', authenticate, getIncomingRequests);
router.get('/outgoing', authenticate, getOutgoingRequests);
router.patch('/:id', authenticate, updateRequestStatus);

export default router;
