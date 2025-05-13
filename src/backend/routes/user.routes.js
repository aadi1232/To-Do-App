import express from 'express';
import {
	registerUser,
	loginUser,
	getMe,
	logoutUser,
	updateProfileImage
} from '../controllers/user.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.post('/logout', logoutUser);
router.put('/profile/image', protect, updateProfileImage);

export default router;
