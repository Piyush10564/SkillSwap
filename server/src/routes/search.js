import express from 'express';
import { searchSkills, getSuggestions } from '../controllers/searchController.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

// All routes are protected
router.use(authenticate);

router.get('/skills', searchSkills);
router.get('/suggestions', getSuggestions);

export default router;
