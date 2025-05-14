import type { Group, GroupInvitation, CreateGroupData } from '../types';

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
	const apiResponse = await fetch('/api/groups/invitations/respond', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		credentials: 'include',
		body: JSON.stringify({ groupId, response: responseType })
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
	const response = await fetch('/api/groups/members/role', {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json'
		},
		credentials: 'include',
		body: JSON.stringify({ groupId, memberId, newRole })
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.message || 'Failed to update member role');
	}

	return response.json();
}

/**
 * Remove a member from a group
 * @param groupId - ID of the group
 * @param memberId - ID of the member to remove
 * @returns Updated group object
 */
export async function removeMember(groupId: string, memberId: string): Promise<Group> {
	const response = await fetch('/api/groups/members', {
		method: 'DELETE',
		headers: {
			'Content-Type': 'application/json'
		},
		credentials: 'include',
		body: JSON.stringify({ groupId, memberId })
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.message || 'Failed to remove member');
	}

	return response.json();
}
