import express from 'express';
import {
	createGroup,
	getUserGroups,
	getPendingInvitations,
	respondToInvitation,
	updateMemberRole,
	removeMember,
	inviteToGroup,
	getGroupById
} from '../controllers/group.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

// All group routes require authentication
router.use(protect);

// Base group routes
router.post('/', createGroup);
router.get('/', getUserGroups);

// Invitation and member routes (must come before /:id routes to avoid conflicts)
router.get('/invitations', getPendingInvitations);
router.post('/invitations/respond', respondToInvitation);
router.put('/members/role', updateMemberRole);
router.delete('/members', removeMember);

// Dynamic group ID routes (these must come AFTER any static segment routes)
router.get('/:id', getGroupById);
router.post('/:id/invite', inviteToGroup);

export default router;
