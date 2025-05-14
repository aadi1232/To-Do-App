import express from 'express';
import {
	createGroup,
	getUserGroups,
	getPendingInvitations,
	respondToInvitation,
	updateMemberRole,
	removeMember
} from '../controllers/group.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

// All group routes require authentication
router.use(protect);

// Group creation and listing
router.post('/', createGroup);
router.get('/', getUserGroups);

// Invitation management
router.get('/invitations', getPendingInvitations);
router.post('/invitations/respond', respondToInvitation);

// Member management
router.put('/members/role', updateMemberRole);
router.delete('/members', removeMember);

export default router;
