import express from 'express';
import { getSuggestions } from '../controllers/ai.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Use authentication middleware
router.use(protect);

// Routes
router.post('/suggest', getSuggestions);

export default router;
