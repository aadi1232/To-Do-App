import type { Group, GroupInvitation, CreateGroupData, UpdateGroupData } from '../types';

/**
 * API client functions for group operations
 */

/**
 * Create a new group
 * @param groupData - Group data with name, imageUrl, and invitees
 * @returns Created group object
 */
export async function createGroup(groupData: CreateGroupData): Promise<Group> {
	const response = await fetch('/api/groups', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		credentials: 'include',
		body: JSON.stringify(groupData)
	});

	if (!response.ok) {
		if (response.status === 401) {
			throw new Error('Not authorized, no token');
		}
		const error = await response.json();
		throw new Error(error.message || 'Failed to create group');
	}

	const result = await response.json();
	return result.group;
}

/**
 * Get all groups for the current user
 * @returns Array of group objects
 */
export async function getUserGroups(): Promise<Group[]> {
	const response = await fetch('/api/groups', {
		credentials: 'include'
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.message || 'Failed to fetch groups');
	}

	const data = await response.json();
	return data.groups;
}

/**
 * Get pending group invitations for the current user
 * @returns Array of pending invitation objects
 */
export async function getPendingInvitations(): Promise<GroupInvitation[]> {
	const response = await fetch('/api/groups/invitations', {
		credentials: 'include'
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.message || 'Failed to fetch invitations');
	}

	const data = await response.json();
	return data.pendingInvitations;
}

/**
 * Respond to a group invitation (accept or decline)
 * @param groupId - ID of the group
 * @param responseType - 'accepted' or 'declined'
 * @returns Updated group object
 */
export async function respondToInvitation(
	groupId: string,
	responseType: 'accepted' | 'declined'
): Promise<Group> {
	const apiResponse = await fetch(`/api/groups/invitation/${groupId}/respond`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		credentials: 'include',
		body: JSON.stringify({
			groupId, // Include groupId in body as backend controller expects it
			response: responseType
		})
	});

	if (!apiResponse.ok) {
		const error = await apiResponse.json();
		throw new Error(error.message || 'Failed to respond to invitation');
	}

	return apiResponse.json();
}

/**
 * Update a member's role in a group
 * @param groupId - ID of the group
 * @param memberId - ID of the member
 * @param newRole - New role ('co-lead', 'elder', or 'member')
 * @returns Updated group object
 */
export async function updateMemberRole(
	groupId: string,
	memberId: string,
	newRole: 'co-lead' | 'elder' | 'member'
): Promise<Group> {
	const response = await fetch(`/api/groups/${groupId}/member/${memberId}/role`, {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json'
		},
		credentials: 'include',
		body: JSON.stringify({ newRole })
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.message || 'Failed to update member role');
	}

	const data = await response.json();
	return data.group;
}

/**
 * Remove a member from a group
 * @param groupId - ID of the group
 * @param memberId - ID of the member to remove
 * @returns Updated group object
 */
export async function removeMember(groupId: string, memberId: string): Promise<Group> {
	const response = await fetch(`/api/groups/${groupId}/member/${memberId}`, {
		method: 'DELETE',
		headers: {
			'Content-Type': 'application/json'
		},
		credentials: 'include'
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.message || 'Failed to remove member');
	}

	const data = await response.json();
	return data.group;
}

/**
 * Invite a user to a group
 * @param groupId - ID of the group
 * @param email - Email of the user to invite
 * @returns Updated group object
 */
export async function inviteUserToGroup(groupId: string, email: string): Promise<Group> {
	const response = await fetch(`/api/groups/${groupId}/invite`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		credentials: 'include',
		body: JSON.stringify({ email })
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.message || 'Failed to invite user');
	}

	return response.json();
}

/**
 * Get a group by ID
 * @param groupId - ID of the group
 * @returns Group object
 */
export async function getGroupById(groupId: string): Promise<Group> {
	const response = await fetch(`/api/groups/${groupId}`, {
		credentials: 'include'
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.message || 'Failed to fetch group');
	}

	const data = await response.json();
	return data.group;
}

/**
 * Update group details
 * @param groupId - ID of the group
 * @param groupData - Updated group data (name, imageUrl)
 * @returns Updated group object
 */
export async function updateGroup(groupId: string, groupData: UpdateGroupData): Promise<Group> {
	const response = await fetch(`/api/groups/${groupId}`, {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json'
		},
		credentials: 'include',
		body: JSON.stringify(groupData)
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.message || 'Failed to update group');
	}

	const data = await response.json();
	return data.group;
}

/**
 * Delete a group
 * @param groupId - ID of the group
 * @returns Success message
 */
export async function deleteGroup(groupId: string): Promise<{ success: boolean; message: string }> {
	const response = await fetch(`/api/groups/${groupId}`, {
		method: 'DELETE',
		headers: {
			'Content-Type': 'application/json'
		},
		credentials: 'include'
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.message || 'Failed to delete group');
	}

	return response.json();
}
