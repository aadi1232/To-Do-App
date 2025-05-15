/**
 * STANDALONE SOCKET.IO SERVER FOR TO-DO-APP
 * 
 * IMPORTANT: This is a development/testing utility that runs separately from the main application.
 * It's used for testing socket functionality without requiring the full application stack.
 * 
 * Usage:
 * 1. Make this file executable: chmod +x src/backend/standalone-socket-server.js
 * 2. Run it directly: node src/backend/standalone-socket-server.js
 * 3. The server will listen on port 3001
 * 
 * This server provides:
 * - Socket.IO connection testing
 * - Real-time notification testing
 * - Group invitation simulation
 * - Todo update notifications
 * 
 * For production, the socket functionality is integrated into the main server.
 */

import { createServer } from 'http';
import { Server } from 'socket.io';

const PORT = 3001;
console.log(`Starting Socket.IO server on port ${PORT}...`);

// Create HTTP server with a simple request handler
const httpServer = createServer((req, res) => {
	// Add CORS headers
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

	// Handle OPTIONS for CORS preflight
	if (req.method === 'OPTIONS') {
		res.writeHead(200);
		res.end();
		return;
	}

	// Handle direct group invitations endpoint
	if (req.method === 'POST' && req.url === '/api/direct-invite') {
		let body = '';

		req.on('data', (chunk) => {
			body += chunk.toString();
		});

		req.on('end', () => {
			try {
				const data = JSON.parse(body);
				console.log('Received direct invitation request:', data);

				if (data.targetUserId) {
					// Send invitation directly to the target user
					io.to(`user:${data.targetUserId}`).emit('group:invited', {
						message: `You have been invited to join ${data.groupName || 'a new group'}`,
						group: {
							_id: data.groupId || 'test-group',
							name: data.groupName || 'New Group',
							description: data.groupDescription || 'This is a test group'
						},
						invitedBy: data.inviterName || 'Admin',
						timestamp: new Date().toISOString()
					});

					console.log(`Directly emitted group:invited to user:${data.targetUserId}`);

					// Send success response
					res.writeHead(200, { 'Content-Type': 'application/json' });
					res.end(
						JSON.stringify({
							success: true,
							message: `Invitation sent to user ${data.targetUserId}`
						})
					);
				} else {
					// Missing required fields
					res.writeHead(400, { 'Content-Type': 'application/json' });
					res.end(
						JSON.stringify({
							success: false,
							message: 'Missing required targetUserId field'
						})
					);
				}
			} catch (err) {
				console.error('Error processing direct invitation:', err);
				res.writeHead(500, { 'Content-Type': 'application/json' });
				res.end(
					JSON.stringify({
						success: false,
						message: 'Error processing direct invitation'
					})
				);
			}
		});
		return;
	}

	// Only handle POST to /api/test-event
	if (req.method === 'POST' && req.url === '/api/test-event') {
		let body = '';

		req.on('data', (chunk) => {
			body += chunk.toString();
		});

		req.on('end', () => {
			try {
				const data = JSON.parse(body);
				console.log('Received test event request:', data);

				// Process the action
				if (data.action && data.userId) {
					// Handle different actions
					switch (data.action) {
						case 'todo:create':
							// Send to a specific user
							io.to(`user:${data.userId}`).emit('todo:added', {
								todo: {
									_id: `test_${Date.now()}`,
									title: `Test Todo Created at ${new Date().toLocaleTimeString()}`,
									description: 'This todo was created via API test',
									priority: 'high'
								},
								message: `A new test todo was created via API`,
								groupId: data.groupId || 'test-group',
								groupName: data.groupName || 'Test Group',
								performedBy: {
									userId: 'test-api',
									username: 'API Tester'
								},
								timestamp: new Date().toISOString()
							});
							console.log(`Emitted todo:added to user:${data.userId}`);
							break;

						case 'todo:update':
							io.to(`user:${data.userId}`).emit('todo:updated', {
								todo: {
									_id: `test_${Date.now()}`,
									title: `Test Todo Updated at ${new Date().toLocaleTimeString()}`,
									description: 'This todo was updated via API test',
									priority: 'medium'
								},
								message: `A test todo was updated via API`,
								groupId: data.groupId || 'test-group',
								groupName: data.groupName || 'Test Group',
								performedBy: {
									userId: 'test-api',
									username: 'API Tester'
								},
								timestamp: new Date().toISOString()
							});
							console.log(`Emitted todo:updated to user:${data.userId}`);
							break;

						case 'group:invite':
							io.to(`user:${data.userId}`).emit('group:invited', {
								message: 'You have been invited to join a group via API test',
								group: {
									_id: data.groupId || 'test-group',
									name: data.groupName || 'API Test Group',
									description: 'This group invitation was sent via API test'
								},
								invitedBy: data.adminName || 'API Tester',
								timestamp: new Date().toISOString()
							});
							console.log(`Emitted group:invited to user:${data.userId}`);
							break;

						case 'todo:completed':
							io.to(`user:${data.userId}`).emit('todo:completed', {
								todo: data.todo || {
									_id: `test_${Date.now()}`,
									title: `Task marked as complete at ${new Date().toLocaleTimeString()}`
								},
								message: `A todo was marked as completed in ${data.groupName || 'your group'}`,
								groupId: data.groupId || 'test-group',
								groupName: data.groupName || 'Test Group',
								performedBy: {
									userId: 'test-api',
									username: data.username || 'API Tester'
								},
								timestamp: new Date().toISOString()
							});
							console.log(`Emitted todo:completed to user:${data.userId}`);
							break;

						case 'group:user_role_changed':
							io.to(`user:${data.userId}`).emit('group:role_changed', {
								message: `Your role in ${data.groupName || 'the group'} has been changed to ${data.newRole || 'Co-Leader'}`,
								group: {
									_id: data.groupId || 'test-group',
									name: data.groupName || 'Test Group'
								},
								newRole: data.newRole || 'Co-Leader',
								changedBy: data.adminName || 'Admin User',
								timestamp: new Date().toISOString()
							});
							console.log(`Emitted group:role_changed to user:${data.userId}`);
							break;

						case 'group:user_removed':
							io.to(`user:${data.userId}`).emit('group:removed', {
								message: `You have been removed from ${data.groupName || 'the group'}`,
								group: {
									_id: data.groupId || 'test-group',
									name: data.groupName || 'Test Group'
								},
								removedBy: data.adminName || 'Admin User',
								timestamp: new Date().toISOString()
							});
							console.log(`Emitted group:removed to user:${data.userId}`);
							break;

						default:
							console.log(`Unknown action: ${data.action}`);
					}

					// Send a success response
					res.writeHead(200, { 'Content-Type': 'application/json' });
					res.end(JSON.stringify({ success: true }));
				} else {
					// Missing required fields
					res.writeHead(400, { 'Content-Type': 'application/json' });
					res.end(
						JSON.stringify({
							success: false,
							message: 'Missing required fields'
						})
					);
				}
			} catch (err) {
				// Error processing request
				console.error('Error processing test event request:', err);
				res.writeHead(500, { 'Content-Type': 'application/json' });
				res.end(
					JSON.stringify({
						success: false,
						message: 'Internal server error'
					})
				);
			}
		});
	} else {
		// Not found
		res.writeHead(404, { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({ success: false, message: 'Not found' }));
	}
});

// Create Socket.IO server with CORS configuration
const io = new Server(httpServer, {
	cors: {
		origin: [
			'http://localhost:5173',
			'http://localhost:4173',
			'http://localhost:5173/socket-debug'
		],
		methods: ['GET', 'POST'],
		credentials: true
	}
});

// Store user connections - maps userId to socketId
/** @type {Map<string, string>} */
const connectedUsers = new Map();

// Store user groups - maps userId to array of groupIds
/** @type {Map<string, string[]>} */
const userGroups = new Map();

// Store group memberships - maps groupId to array of userIds
/** @type {Map<string, Set<string>>} */
const groupMembers = new Map();

// Skip authentication for development
io.use((socket, next) => {
	// Accept all connections for testing
	const userId = socket.handshake.auth.userId || 'anonymous-user';
	console.log(`[AUTH] Socket authentication attempt for user: ${userId}`);

	// In TypeScript this would normally use a type declaration to avoid the error
	// @ts-ignore: Adding custom property to socket
	socket.userId = userId;
	console.log(`[AUTH] Socket authentication skipped for testing: ${userId}`);
	next();
});

// Handle socket connections
io.on('connection', (socket) => {
	// @ts-ignore: Accessing custom property
	const userId = socket.userId;
	console.log(`[CONNECTION] User connected: ${userId}, Socket ID: ${socket.id}`);

	// Store user connection
	connectedUsers.set(userId, socket.id);
	console.log(`[CONNECTION] Total connected users: ${connectedUsers.size}`);

	// Join user's private room
	socket.join(`user:${userId}`);
	console.log(`[ROOM-JOIN] User ${userId} joined room user:${userId}`);

	// Broadcast to other users that this user is online
	socket.broadcast.emit('user:connected', {
		userId,
		timestamp: new Date().toISOString()
	});

	// Log all rooms for this socket
	const rooms = Array.from(socket.rooms);
	console.log(`[ROOMS] Socket ${socket.id} is in rooms: ${rooms.join(', ')}`);

	// Immediately send a test notification to confirm the notification system works
	socket.emit('notification:test', {
		message: 'Notification system connected successfully',
		timestamp: new Date().toISOString()
	});
	console.log(`[NOTIFICATION] Sent test notification to user:${userId}`);

	// Send confirmation to the user
	socket.emit('connected', { userId });
	console.log(`[CONNECTION] Sent connected confirmation to user:${userId}`);

	// Join user's group rooms
	socket.on('join:groups', async ({ groupIds }) => {
		console.log(`[GROUP-JOIN] User ${userId} attempting to join groups:`, groupIds);

		if (Array.isArray(groupIds)) {
			// Store user's groups
			userGroups.set(userId, groupIds);
			console.log(`[GROUP-JOIN] Stored group IDs for user ${userId}:`, groupIds);

			for (const groupId of groupIds) {
				socket.join(`group:${groupId}`);
				console.log(`[GROUP-JOIN] User ${userId} joined room group:${groupId}`);

				// Add this user to the group members map
				if (!groupMembers.has(groupId)) {
					groupMembers.set(groupId, new Set());
				}
				// Use non-null assertion since we just created it if it didn't exist
				const groupMemberSet = groupMembers.get(groupId);
				if (groupMemberSet) {
					groupMemberSet.add(userId);
				}

				// After joining, broadcast online users in this group
				broadcastOnlineUsers(groupId);
			}

			socket.emit('groups:joined', { groupIds });
			console.log(`[GROUP-JOIN] Confirmed groups joined to user ${userId}`);

			// Log all rooms for this socket after joining groups
			const updatedRooms = Array.from(socket.rooms);
			console.log(`[ROOMS] Socket ${socket.id} is now in rooms: ${updatedRooms.join(', ')}`);
		} else {
			console.warn(`[GROUP-JOIN] Invalid groupIds format received from user ${userId}:`, groupIds);
		}
	});

	// Debug: log all events
	socket.onAny((event, ...args) => {
		console.log(`[EVENT] Received event "${event}" from ${userId}:`, args);
	});

	// Handle group invitation directly via user-to-user notification
	socket.on('direct:group_invite', (data) => {
		console.log(`[DIRECT-INVITE] Processing direct invitation request from ${userId}:`, data);

		if (!data.targetUserId) {
			console.error(
				`[DIRECT-INVITE] Missing targetUserId in direct:group_invite event from ${userId}`
			);
			return;
		}

		// Check if target user is connected
		const targetSocketId = connectedUsers.get(data.targetUserId);
		console.log(
			`[DIRECT-INVITE] Target user ${data.targetUserId} socket ID: ${targetSocketId || 'not connected'}`
		);

		// Direct emit to specific user's room
		io.to(`user:${data.targetUserId}`).emit('group:invited', {
			message: `You have been invited to join ${data.groupName || 'a new group'}`,
			group: {
				_id: data.groupId,
				name: data.groupName || 'New Group',
				description: data.groupDescription || ''
			},
			invitedBy: data.inviterName || userId,
			timestamp: new Date().toISOString()
		});

		console.log(`[DIRECT-INVITE] Emitted group:invited to user:${data.targetUserId}`);

		// Log all rooms
		console.log(`[ROOMS] Current rooms in server:`, io.sockets.adapter.rooms);
	});

	// Handle todo events for notifications
	socket.on('todo:created', (data) => {
		console.log(`[TODO-CREATED] Processing todo:created event from ${userId}:`, data);

		// Forward to appropriate group members
		if (data.groupId) {
			const groupName = data.groupName || 'a group';
			const roomName = `group:${data.groupId}`;

			// Log room info before emitting
			const roomClients = Array.from(io.sockets.adapter.rooms.get(roomName) || []);
			console.log(`[TODO-CREATED] Room ${roomName} has ${roomClients.length} connected clients`);

			socket.to(`group:${data.groupId}`).emit('todo:added', {
				todo: data.todo,
				message: `${data.username || userId} added a new todo "${data.todo.title}" in ${groupName}`,
				groupId: data.groupId,
				groupName,
				performedBy: {
					userId,
					username: data.username || 'A user'
				},
				timestamp: new Date().toISOString()
			});

			console.log(`[TODO-CREATED] Emitted todo:added to group:${data.groupId}`);
		} else {
			console.warn(`[TODO-CREATED] Missing groupId in todo:created event from ${userId}`);
		}
	});

	socket.on('todo:updated', (data) => {
		console.log(`[TODO-UPDATED] Processing todo:updated event from ${userId}:`, data);

		// Forward to appropriate group members
		if (data.groupId) {
			const groupName = data.groupName || 'a group';
			const roomName = `group:${data.groupId}`;

			// Log room info
			const roomClients = Array.from(io.sockets.adapter.rooms.get(roomName) || []);
			console.log(`[TODO-UPDATED] Room ${roomName} has ${roomClients.length} connected clients`);

			socket.to(`group:${data.groupId}`).emit('todo:updated', {
				todo: data.todo,
				message: `${data.username || userId} updated todo "${data.todo.title}" in ${groupName}`,
				groupId: data.groupId,
				groupName,
				performedBy: {
					userId,
					username: data.username || 'A user'
				},
				timestamp: new Date().toISOString()
			});
			console.log(`[TODO-UPDATED] Emitted todo:updated to group:${data.groupId}`);
		} else {
			console.warn(`[TODO-UPDATED] Missing groupId in todo:updated event from ${userId}`);
		}
	});

	socket.on('todo:deleted', (data) => {
		console.log(`[TODO-DELETED] Processing todo:deleted event from ${userId}:`, data);

		// Forward to appropriate group members
		if (data.groupId) {
			const groupName = data.groupName || 'a group';
			const roomName = `group:${data.groupId}`;

			// Log room info
			const roomClients = Array.from(io.sockets.adapter.rooms.get(roomName) || []);
			console.log(`[TODO-DELETED] Room ${roomName} has ${roomClients.length} connected clients`);

			socket.to(`group:${data.groupId}`).emit('todo:deleted', {
				todo: data.todo,
				message: `${data.username || userId} deleted todo "${data.todo.title}" in ${groupName}`,
				groupId: data.groupId,
				groupName,
				performedBy: {
					userId,
					username: data.username || 'A user'
				},
				timestamp: new Date().toISOString()
			});
			console.log(`[TODO-DELETED] Emitted todo:deleted to group:${data.groupId}`);
		} else {
			console.warn(`[TODO-DELETED] Missing groupId in todo:deleted event from ${userId}`);
		}
	});

	socket.on('todo:completed', (data) => {
		console.log(`[TODO-COMPLETED] Processing todo:completed event from ${userId}:`, data);

		// Forward to appropriate group members
		if (data.groupId) {
			const groupName = data.groupName || 'a group';
			const roomName = `group:${data.groupId}`;

			// Log room info
			const roomClients = Array.from(io.sockets.adapter.rooms.get(roomName) || []);
			console.log(`[TODO-COMPLETED] Room ${roomName} has ${roomClients.length} connected clients`);

			socket.to(`group:${data.groupId}`).emit('todo:completed', {
				todo: data.todo,
				message: `${data.username || userId} marked todo "${data.todo.title}" as completed in ${groupName}`,
				groupId: data.groupId,
				groupName,
				performedBy: {
					userId,
					username: data.username || 'A user'
				},
				timestamp: new Date().toISOString()
			});
			console.log(`[TODO-COMPLETED] Emitted todo:completed to group:${data.groupId}`);
		} else {
			console.warn(`[TODO-COMPLETED] Missing groupId in todo:completed event from ${userId}`);
		}
	});

	// Group membership events
	socket.on('group:invite', (data) => {
		console.log(`[GROUP-INVITE] Processing group:invite event from ${userId}:`, data);

		// Send notification to invited user
		if (data.userId) {
			const groupName = data.groupName || 'a group';

			// Check if target user is connected
			const targetSocketId = connectedUsers.get(data.userId);
			console.log(
				`[GROUP-INVITE] Target user ${data.userId} socket ID: ${targetSocketId || 'not connected'}`
			);

			io.to(`user:${data.userId}`).emit('group:invited', {
				message: `You have been invited to join ${groupName}`,
				group: {
					_id: data.groupId,
					name: groupName,
					description: data.groupDescription || ''
				},
				invitedBy: data.username || 'An admin',
				timestamp: new Date().toISOString()
			});
			console.log(`[GROUP-INVITE] Emitted group:invited to user:${data.userId}`);
		} else {
			console.warn(`[GROUP-INVITE] Missing userId in group:invite event from ${userId}`);
		}
	});

	socket.on('group:user_role_changed', (data) => {
		console.log(`[ROLE-CHANGE] Processing role change event from ${userId}:`, data);

		// Notify the user about role change
		if (data.userId && data.groupId) {
			const groupName = data.groupName || 'a group';

			// Check if target user is connected
			const targetSocketId = connectedUsers.get(data.userId);
			console.log(
				`[ROLE-CHANGE] Target user ${data.userId} socket ID: ${targetSocketId || 'not connected'}`
			);

			io.to(`user:${data.userId}`).emit('group:role_changed', {
				message: `Your role in ${groupName} has been changed to ${data.newRole}`,
				group: {
					_id: data.groupId,
					name: groupName
				},
				newRole: data.newRole,
				changedBy: data.adminName || 'An admin',
				timestamp: new Date().toISOString()
			});
			console.log(`[ROLE-CHANGE] Emitted group:role_changed to user:${data.userId}`);
		} else {
			console.warn(`[ROLE-CHANGE] Missing userId or groupId in role change event from ${userId}`);
		}
	});

	socket.on('group:user_removed', (data) => {
		console.log(`[USER-REMOVED] Processing user removal event from ${userId}:`, data);

		// Notify the user about being removed
		if (data.userId && data.groupId) {
			const groupName = data.groupName || 'a group';

			// Check if target user is connected
			const targetSocketId = connectedUsers.get(data.userId);
			console.log(
				`[USER-REMOVED] Target user ${data.userId} socket ID: ${targetSocketId || 'not connected'}`
			);

			io.to(`user:${data.userId}`).emit('group:removed', {
				message: `You have been removed from ${groupName}`,
				group: {
					_id: data.groupId,
					name: groupName
				},
				removedBy: data.adminName || 'An admin',
				timestamp: new Date().toISOString()
			});
			console.log(`[USER-REMOVED] Emitted group:removed to user:${data.userId}`);
		} else {
			console.warn(`[USER-REMOVED] Missing userId or groupId in user removal event from ${userId}`);
		}
	});

	// Handle user disconnect
	socket.on('disconnect', () => {
		console.log(`[DISCONNECT] User disconnected: ${userId}, Socket ID: ${socket.id}`);

		// Get the groups this user belonged to
		const userGroupIds = userGroups.get(userId) || [];

		// Remove user from connected users
		connectedUsers.delete(userId);

		// Remove user from user groups
		userGroups.delete(userId);

		console.log(`[DISCONNECT] Total connected users after disconnect: ${connectedUsers.size}`);

		// Broadcast to other users that this user disconnected
		socket.broadcast.emit('user:disconnected', {
			userId,
			timestamp: new Date().toISOString()
		});

		// Remove from group members and broadcast updated online users
		for (const groupId of userGroupIds) {
			if (groupMembers.has(groupId)) {
				// Remove user from group members - use non-null assertion with a safe check
				const groupMemberSet = groupMembers.get(groupId);
				if (groupMemberSet) {
					groupMemberSet.delete(userId);
				}

				// Broadcast updated online users for this group
				broadcastOnlineUsers(groupId);
			}
		}
	});
});

// For testing: Send periodic notifications to all connected users - REMOVED TO AVOID RANDOM NOTIFICATIONS
// DO NOT send periodic test notifications since that's causing the random notification problem

// Start the server
httpServer.listen(PORT, () => {
	console.log(`Socket.IO server running on port ${PORT}`);
});

// Echo function to test server is running
setInterval(() => {
	console.log(`Socket.IO server still running (${io.engine.clientsCount} connected clients)`);
	console.log(`Connected users: ${Array.from(connectedUsers.keys()).join(', ') || 'none'}`);
}, 30000);

/**
 * Broadcast online users in a group to all group members
 * @param {string} groupId - The ID of the group
 */
function broadcastOnlineUsers(groupId) {
	try {
		if (!groupId || !groupMembers.has(groupId)) {
			console.log(`[ONLINE-USERS] No members found for group ${groupId}`);
			return;
		}

		// Get all userIds in this group
		const allMemberIds = Array.from(groupMembers.get(groupId) || []);

		// Filter to just the online members
		const onlineUserIds = allMemberIds.filter((userId) => connectedUsers.has(userId));

		console.log(
			`[ONLINE-USERS] Broadcasting ${onlineUserIds.length} online users for group ${groupId}`
		);

		// Emit to the group room
		io.to(`group:${groupId}`).emit('online:users', {
			groupId,
			userIds: onlineUserIds,
			timestamp: new Date().toISOString()
		});
	} catch (error) {
		console.error(`[ONLINE-USERS] Error broadcasting online users for group ${groupId}:`, error);
	}
}
