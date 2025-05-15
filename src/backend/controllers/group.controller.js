import Group from '../models/group.model.js';
import User from '../models/user.model.js';
import Todo from '../models/todo.model.js';
import * as socketService from '../services/socket.service.js';

// Create a new group
export const createGroup = async (req, res) => {
	try {
		const { name, imageUrl, invitees } = req.body;
		const userId = req.user._id;
		console.log(userId);

		// Create a new group with the creator as admin
		const group = new Group({
			name,
			imageUrl,
			createdBy: userId,
			members: [
				{
					user: userId,
					role: 'admin',
					invitationStatus: 'accepted',
					addedBy: userId
				}
			]
		});

		// Process invitees if provided
		if (invitees && invitees.length > 0) {
			// Verify all emails exist as users
			const emailList = invitees.map((invitee) => invitee.email);
			const users = await User.find({ email: { $in: emailList } });

			// Create a map of email to user ID for quick lookup
			const emailToUserMap = {};
			users.forEach((user) => {
				emailToUserMap[user.email] = user._id;
			});

			// Add each invitee to the group
			for (const invitee of invitees) {
				const userId = emailToUserMap[invitee.email];

				if (userId) {
					group.members.push({
						user: userId,
						role: 'member', // Default role for invitees
						invitationStatus: 'pending',
						addedBy: req.user._id
					});
				}
			}
		}

		await group.save();

		// Populate user details for response
		const populatedGroup = await Group.findById(group._id)
			.populate('members.user', 'username email profileImage')
			.populate('createdBy', 'username email profileImage');

		res.status(201).json({
			success: true,
			message: 'Group created successfully',
			group: populatedGroup
		});
	} catch (error) {
		console.error('Error creating group:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to create group',
			error: error.message
		});
	}
};

// Get all groups for a user
export const getUserGroups = async (req, res) => {
	try {
		const userId = req.user._id;

		const groups = await Group.find({
			'members.user': userId,
			'members.invitationStatus': 'accepted'
		})
			.populate('members.user', 'username email profileImage')
			.populate('createdBy', 'username email profileImage');

		res.status(200).json({
			success: true,
			groups
		});
	} catch (error) {
		console.error('Error fetching user groups:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to fetch groups',
			error: error.message
		});
	}
};

// Get pending invitations for a user
export const getPendingInvitations = async (req, res) => {
	try {
		const userId = req.user._id;

		// Find groups where the user has a pending invitation but is not the creator
		const pendingGroups = await Group.find({
			'members.user': userId,
			'members.invitationStatus': 'pending',
			createdBy: { $ne: userId } // Exclude groups created by the user
		})
			.populate('members.user', 'username email profileImage')
			.populate('createdBy', 'username email profileImage')
			.populate('members.addedBy', 'username email profileImage');

		res.status(200).json({
			success: true,
			pendingInvitations: pendingGroups
		});
	} catch (error) {
		console.error('Error fetching pending invitations:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to fetch pending invitations',
			error: error.message
		});
	}
};

// Respond to group invitation (accept/decline)
export const respondToInvitation = async (req, res) => {
	try {
		const { groupId, response } = req.body;
		const userId = req.user._id;

		if (!['accepted', 'declined'].includes(response)) {
			return res.status(400).json({
				success: false,
				message: 'Invalid response. Must be "accepted" or "declined"'
			});
		}

		const group = await Group.findOne({
			_id: groupId,
			'members.user': userId,
			'members.invitationStatus': 'pending'
		});

		if (!group) {
			return res.status(404).json({
				success: false,
				message: 'Invitation not found or already responded to'
			});
		}

		// Update the invitation status
		const memberIndex = group.members.findIndex(
			(member) => member.user.toString() === userId.toString()
		);

		if (memberIndex === -1) {
			return res.status(404).json({
				success: false,
				message: 'User not found in group members'
			});
		}

		group.members[memberIndex].invitationStatus = response;

		// If declined, remove from group
		if (response === 'declined') {
			group.members.splice(memberIndex, 1);
		}

		await group.save();

		// If user accepted the invitation, notify other group members
		if (response === 'accepted') {
			// Get user data for notification
			const user = await User.findById(userId).select('username email profileImage');

			// Notify group members
			socketService.notifyGroupJoined(
				groupId,
				{
					_id: user._id.toString(),
					username: user.username,
					profileImage: user.profileImage
				},
				userId.toString()
			);
		}

		// Populate the group data for the response
		const populatedGroup = await Group.findById(group._id)
			.populate('members.user', 'username email profileImage')
			.populate('createdBy', 'username email profileImage');

		res.status(200).json({
			success: true,
			message: `Invitation ${response}`,
			group: populatedGroup
		});
	} catch (error) {
		console.error('Error responding to invitation:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to respond to invitation',
			error: error.message
		});
	}
};

// Update member role
export const updateMemberRole = async (req, res) => {
	try {
		// Extract params from URL path params instead of the body
		const { id: groupId, memberId } = req.params;
		const { newRole } = req.body;
		const userId = req.user._id;

		console.log(`Updating role for group: ${groupId}, member: ${memberId}, new role: ${newRole}`);

		// Validate role
		if (!['co-lead', 'elder', 'member'].includes(newRole)) {
			return res.status(400).json({
				success: false,
				message: 'Invalid role. Must be "co-lead", "elder", or "member"'
			});
		}

		const group = await Group.findById(groupId);

		if (!group) {
			return res.status(404).json({
				success: false,
				message: 'Group not found'
			});
		}

		// Check if user has permission to change roles
		const currentUserMember = group.members.find(
			(member) => member.user.toString() === userId.toString()
		);

		if (!currentUserMember) {
			return res.status(403).json({
				success: false,
				message: 'You are not a member of this group'
			});
		}

		if (currentUserMember.role !== 'admin' && currentUserMember.role !== 'co-lead') {
			return res.status(403).json({
				success: false,
				message: 'You do not have permission to change roles'
			});
		}

		// Find the member to update
		const memberToUpdate = group.members.find((member) => member.user.toString() === memberId);

		if (!memberToUpdate) {
			return res.status(404).json({
				success: false,
				message: 'Member not found in group'
			});
		}

		// Additional permission checks
		if (memberToUpdate.role === 'admin') {
			return res.status(403).json({
				success: false,
				message: 'Cannot change role of the admin'
			});
		}

		if (currentUserMember.role === 'co-lead' && memberToUpdate.role === 'co-lead') {
			return res.status(403).json({
				success: false,
				message: 'Co-leads cannot modify other co-leads'
			});
		}

		// Update the role
		memberToUpdate.role = newRole;
		await group.save();

		// Populate the group data for response
		const populatedGroup = await Group.findById(group._id)
			.populate('members.user', 'username email profileImage')
			.populate('createdBy', 'username email profileImage');

		res.status(200).json({
			success: true,
			message: 'Member role updated successfully',
			group: populatedGroup
		});
	} catch (error) {
		console.error('Error updating member role:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to update member role',
			error: error.message
		});
	}
};

// Remove member from group
export const removeMember = async (req, res) => {
	try {
		// Extract params from URL path params instead of the body
		const { id: groupId, memberId } = req.params;
		const userId = req.user._id;

		console.log(`Removing member from group: ${groupId}, member: ${memberId}`);

		const group = await Group.findById(groupId);

		if (!group) {
			return res.status(404).json({
				success: false,
				message: 'Group not found'
			});
		}

		// Check if user has permission to remove members
		const currentUserMember = group.members.find(
			(member) => member.user.toString() === userId.toString()
		);

		if (!currentUserMember) {
			return res.status(403).json({
				success: false,
				message: 'You are not a member of this group'
			});
		}

		// Find the member to remove
		const memberToRemove = group.members.find((member) => member.user.toString() === memberId);

		if (!memberToRemove) {
			return res.status(404).json({
				success: false,
				message: 'Member not found in group'
			});
		}

		// Permission checks
		if (memberToRemove.role === 'admin') {
			return res.status(403).json({
				success: false,
				message: 'Cannot remove the admin from the group'
			});
		}

		if (currentUserMember.role === 'member') {
			return res.status(403).json({
				success: false,
				message: 'Regular members cannot remove other members'
			});
		}

		if (
			currentUserMember.role === 'elder' &&
			(memberToRemove.role === 'elder' || memberToRemove.role === 'co-lead')
		) {
			return res.status(403).json({
				success: false,
				message: 'Elders can only remove regular members'
			});
		}

		if (currentUserMember.role === 'co-lead' && memberToRemove.role === 'co-lead') {
			return res.status(403).json({
				success: false,
				message: 'Co-leads cannot remove other co-leads'
			});
		}

		// Remove the member
		group.members = group.members.filter((member) => member.user.toString() !== memberId);

		await group.save();

		// Populate the group data for response
		const populatedGroup = await Group.findById(group._id)
			.populate('members.user', 'username email profileImage')
			.populate('createdBy', 'username email profileImage');

		res.status(200).json({
			success: true,
			message: 'Member removed successfully',
			group: populatedGroup
		});
	} catch (error) {
		console.error('Error removing member:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to remove member',
			error: error.message
		});
	}
};

// Invite a user to a group
export const inviteToGroup = async (req, res) => {
	try {
		const { id: groupId } = req.params;
		const { email } = req.body;
		const userId = req.user._id;

		// Find the group
		const group = await Group.findById(groupId);
		if (!group) {
			return res.status(404).json({
				success: false,
				message: 'Group not found'
			});
		}

		// Check if the requesting user is the admin or co-lead
		const requestingMember = group.members.find(
			(member) => member.user.toString() === userId.toString()
		);
		if (!requestingMember || !['admin', 'co-lead'].includes(requestingMember.role)) {
			return res.status(403).json({
				success: false,
				message: 'You do not have permission to invite users to this group'
			});
		}

		// Find the user by email
		const userToInvite = await User.findOne({ email });
		if (!userToInvite) {
			return res.status(404).json({
				success: false,
				message: 'User with this email not found'
			});
		}

		// Check if user is already a member
		const isMember = group.members.some(
			(member) => member.user.toString() === userToInvite._id.toString()
		);

		if (isMember) {
			return res.status(400).json({
				success: false,
				message: 'User is already a member of this group'
			});
		}

		// Add user to the group
		group.members.push({
			user: userToInvite._id,
			role: 'member',
			invitationStatus: 'pending',
			addedBy: userId
		});

		await group.save();

		// Populate user details for response
		const populatedGroup = await Group.findById(group._id)
			.populate('members.user', 'username email profileImage')
			.populate('createdBy', 'username email profileImage');

		// Send real-time notification to the invited user
		socketService.notifyGroupInvitation(
			userToInvite._id.toString(),
			{
				_id: group._id.toString(),
				name: group.name,
				imageUrl: group.imageUrl
			},
			req.user.username
		);

		res.status(200).json({
			success: true,
			message: 'Invitation sent successfully',
			group: populatedGroup
		});
	} catch (error) {
		console.error('Error inviting user to group:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to invite user',
			error: error.message
		});
	}
};

// Get group by ID
export const getGroupById = async (req, res) => {
	try {
		const { id: groupId } = req.params;
		const userId = req.user._id;

		const group = await Group.findById(groupId)
			.populate('members.user', 'username email profileImage')
			.populate('createdBy', 'username email profileImage');

		if (!group) {
			return res.status(404).json({
				success: false,
				message: 'Group not found'
			});
		}

		// Check if user is a member of the group
		const isMember = group.members.some(
			(member) =>
				member.user._id.toString() === userId.toString() && member.invitationStatus === 'accepted'
		);

		if (!isMember) {
			return res.status(403).json({
				success: false,
				message: 'You do not have access to this group'
			});
		}

		res.status(200).json({
			success: true,
			group
		});
	} catch (error) {
		console.error('Error fetching group:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to fetch group',
			error: error.message
		});
	}
};

// Update group details
export const updateGroup = async (req, res) => {
	try {
		const { id: groupId } = req.params;
		const userId = req.user._id;
		const { name, imageUrl } = req.body;

		// Find the group
		const group = await Group.findById(groupId);

		if (!group) {
			return res.status(404).json({
				success: false,
				message: 'Group not found'
			});
		}

		// Check if user is admin or co-lead
		const currentUserMember = group.members.find(
			(member) => member.user.toString() === userId.toString()
		);

		if (!currentUserMember) {
			return res.status(403).json({
				success: false,
				message: 'You are not a member of this group'
			});
		}

		if (currentUserMember.role !== 'admin' && currentUserMember.role !== 'co-lead') {
			return res.status(403).json({
				success: false,
				message: 'Only admin and co-leads can update group details'
			});
		}

		// Update fields
		if (name) group.name = name;
		if (imageUrl) group.imageUrl = imageUrl;

		await group.save();

		// Populate user details for response
		const populatedGroup = await Group.findById(group._id)
			.populate('members.user', 'username email profileImage')
			.populate('createdBy', 'username email profileImage');

		res.status(200).json({
			success: true,
			message: 'Group details updated successfully',
			group: populatedGroup
		});
	} catch (error) {
		console.error('Error updating group:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to update group',
			error: error.message
		});
	}
};

// Delete group with name confirmation
export const deleteGroup = async (req, res) => {
	try {
		const { id: groupId } = req.params;
		const userId = req.user._id;
		const { confirmationName } = req.body;

		// Find the group
		const group = await Group.findById(groupId);

		if (!group) {
			return res.status(404).json({
				success: false,
				message: 'Group not found'
			});
		}

		// Check if user is admin
		const currentUserMember = group.members.find(
			(member) => member.user.toString() === userId.toString()
		);

		if (!currentUserMember) {
			return res.status(403).json({
				success: false,
				message: 'You are not a member of this group'
			});
		}

		if (currentUserMember.role !== 'admin') {
			return res.status(403).json({
				success: false,
				message: 'Only the group admin can delete the group'
			});
		}

		// Check if confirmation name matches
		if (confirmationName !== group.name) {
			return res.status(400).json({
				success: false,
				message: 'Group name confirmation does not match'
			});
		}

		// Delete all todos associated with this group
		await Todo.deleteMany({ group: groupId });

		// Delete the group
		await Group.findByIdAndDelete(groupId);

		res.status(200).json({
			success: true,
			message: 'Group and associated todos deleted successfully'
		});
	} catch (error) {
		console.error('Error deleting group:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to delete group',
			error: error.message
		});
	}
};

// Get shared group by ID (public access - no auth required)
export const getSharedGroupById = async (req, res) => {
	try {
		const { id: groupId } = req.params;

		const group = await Group.findById(groupId)
			.populate('members.user', 'username profileImage') // Only expose username and profile image
			.populate('createdBy', 'username');

		if (!group) {
			return res.status(404).json({
				success: false,
				message: 'Shared group not found'
			});
		}

		// Get todos for the group
		const Todo = (await import('../models/todo.model.js')).default;
		const todos = await Todo.find({ group: groupId })
			.sort({ createdAt: -1 })
			.populate('createdBy', 'username');

		// Return the group and todos
		res.status(200).json({
			success: true,
			group,
			todos
		});
	} catch (error) {
		console.error('Error fetching shared group:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to fetch shared group',
			error: error.message
		});
	}
};
