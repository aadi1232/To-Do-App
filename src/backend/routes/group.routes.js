import express from 'express';
import {
	createGroup,
	getUserGroups,
	getPendingInvitations,
	respondToInvitation,
	updateMemberRole,
	removeMember,
	inviteToGroup,
	getGroupById,
	updateGroup,
	deleteGroup,
	getSharedGroupById
} from '../controllers/group.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Public route for shared groups (no auth required)
router.get('/shared/:id', getSharedGroupById);

// All other group routes require authentication
router.use(protect);

// Routes that require authentication
router.get('/', getUserGroups);
router.post('/', createGroup);
router.get('/invitations', getPendingInvitations);
router.post('/invitation/:id/respond', respondToInvitation);
router.put('/:id/member/:memberId/role', updateMemberRole);
router.delete('/:id/member/:memberId', removeMember);
router.post('/:id/invite', inviteToGroup);
router.get('/:id', getGroupById);
router.put('/:id', updateGroup);
router.delete('/:id', deleteGroup);

export default router;
