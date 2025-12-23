import express from 'express';
import { getMySkills, createSkill, updateSkill, deleteSkill } from '../controllers/skillsController.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

// All routes are protected
router.use(authenticate);

router.get('/mine', getMySkills);
router.post('/', createSkill);
router.put('/:id', updateSkill);
router.delete('/:id', deleteSkill);

export default router;
