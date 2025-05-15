/**
 * Socket.IO service for handling real-time notifications
 * This service provides functions to emit events to users and groups
 */

/**
 * Get the Socket.IO instance
 * @returns {import('socket.io').Server} The Socket.IO server instance
 */
export function getIO() {
	if (!global.io) {
		console.warn('Socket.IO not initialized yet');
		return null;
	}
	return global.io;
}

/**
 * Emit a notification to a specific user
 * @param {string} userId - The ID of the user to notify
 * @param {string} event - The event name
 * @param {object} data - The data to send
 * @returns {boolean} Success status
 */
export function notifyUser(userId, event, data) {
	try {
		const io = getIO();
		if (!io) return false;

		io.to(`user:${userId}`).emit(event, {
			...data,
			timestamp: new Date().toISOString()
		});

		console.log(`Emitted ${event} to user:${userId}`, data);
		return true;
	} catch (error) {
		console.error(`Error emitting ${event} to user:${userId}:`, error);
		return false;
	}
}

/**
 * Emit a notification to all members of a group
 * @param {string} groupId - The ID of the group
 * @param {string} event - The event name
 * @param {object} data - The data to send
 * @param {string} [excludeUserId] - User ID to exclude from notification
 * @returns {boolean} Success status
 */
export function notifyGroup(groupId, event, data, excludeUserId = null) {
	try {
		const io = getIO();
		if (!io) return false;

		const room = io.to(`group:${groupId}`);

		// If excludeUserId is provided, use a filter
		if (excludeUserId) {
			room.except(`user:${excludeUserId}`);
		}

		room.emit(event, {
			...data,
			groupId,
			timestamp: new Date().toISOString()
		});

		console.log(`Emitted ${event} to group:${groupId}`, data);
		return true;
	} catch (error) {
		console.error(`Error emitting ${event} to group:${groupId}:`, error);
		return false;
	}
}

/**
 * Emit a group invitation notification
 * @param {string} userId - The ID of the invited user
 * @param {object} groupData - The group data
 * @param {string} invitedBy - The name of the user who sent the invitation
 * @returns {boolean} Success status
 */
export function notifyGroupInvitation(userId, groupData, invitedBy) {
	return notifyUser(userId, 'group:invited', {
		group: groupData,
		invitedBy,
		message: `${invitedBy} invited you to join ${groupData.name}`
	});
}

/**
 * Notify group members when a new user joins
 * @param {string} groupId - The ID of the group
 * @param {object} userData - The user data who joined
 * @param {string} userId - The ID of the user who joined
 * @returns {boolean} Success status
 */
export function notifyGroupJoined(groupId, userData, userId) {
	return notifyGroup(
		groupId,
		'group:joined',
		{
			user: userData,
			message: `${userData.username} joined the group`
		},
		userId
	); // Exclude the joining user from getting the notification
}

/**
 * Notify group members about a todo change
 * @param {string} groupId - The ID of the group
 * @param {string} eventType - The todo event type (added, updated, deleted)
 * @param {object} todoData - The todo data
 * @param {string} userId - The ID of the user who made the change
 * @param {string} username - The username who made the change
 * @returns {boolean} Success status
 */
export function notifyTodoChange(groupId, eventType, todoData, userId, username) {
	let message;
	switch (eventType) {
		case 'added':
			message = `${username} added a new todo: ${todoData.title}`;
			break;
		case 'updated':
			message = `${username} updated a todo: ${todoData.title}`;
			break;
		case 'deleted':
			message = `${username} deleted a todo: ${todoData.title}`;
			break;
		default:
			message = `${username} modified a todo`;
	}

	return notifyGroup(
		groupId,
		`todo:${eventType}`,
		{
			todo: todoData,
			message,
			performedBy: {
				userId,
				username
			}
		},
		userId
	); // Exclude the user who made the change
}
