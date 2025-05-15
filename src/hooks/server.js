import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '$lib/env.js';
import User from '../backend/models/user.model.js';

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
	// Only attach socket.io on initial page load, not on subsequent fetches
	if (!event.platform?.env?.socket) {
		const server = event.platform?.server;
		if (server && !global.__socketIOInitialized) {
			// Configure Socket.IO with explicit parser and error handlers
			const io = new Server(server, {
				// Add explicit cors configuration
				cors: {
					origin: true,
					credentials: true
				},
				// Add parser configuration
				maxHttpBufferSize: 1e6, // 1MB
				pingTimeout: 30000,
				// Add more detailed logging
				connectTimeout: 45000
			});

			// Debug socket errors at transport level
			io.engine.on('connection_error', (err) => {
				console.error('Socket.IO transport error:', {
					type: err.req,
					code: err.code,
					message: err.message,
					context: err.context
				});
			});

			// Socket.IO middleware for authentication
			io.use(async (socket, next) => {
				try {
					const token =
						socket.handshake.auth.token ||
						socket.handshake.auth.userId || // Try userId from auth
						socket.handshake.headers.authorization?.split(' ')[1] ||
						socket.request.headers.cookie
							?.split(';')
							.find((c) => c.trim().startsWith('jwt='))
							?.split('=')[1];

					if (!token) {
						console.warn('Socket auth failed: No token provided');
						return next(new Error('Authentication error: No token provided'));
					}

					// Verify the token
					let decoded;
					try {
						decoded = jwt.verify(token, JWT_SECRET);
					} catch (jwtErr) {
						console.warn('Socket auth failed: JWT verification error', jwtErr.message);
						// If token is userId and not JWT, try using it directly
						if (token.length === 24 || token.length === 12) {
							console.log('Attempting to use userId directly:', token);
							decoded = { id: token };
						} else {
							return next(new Error('Invalid token'));
						}
					}

					const userId = decoded.id;

					if (!userId) {
						console.warn('Socket auth failed: No userId in token');
						return next(new Error('Invalid token format'));
					}

					// Find the user
					try {
						const user = await User.findById(userId).select('-password');
						if (!user) {
							console.warn('Socket auth failed: User not found for ID', userId);
							return next(new Error('User not found'));
						}

						// Attach user to socket for later use
						socket.user = user;
						console.log('Socket auth successful for user:', user.username || user.email || userId);
						next();
					} catch (dbErr) {
						console.error('Socket auth failed: Database error', dbErr.message);
						next(new Error('Authentication error: Database issue'));
					}
				} catch (error) {
					console.error('Socket authentication error:', error.message, error.stack);
					next(new Error('Authentication error'));
				}
			});

			// Handle socket connections
			io.on('connection', (socket) => {
				const userId = socket.user?._id.toString();

				console.log(`User connected: ${userId}`);

				// Join user's private room
				if (userId) {
					socket.join(`user:${userId}`);
					console.log(`User ${userId} joined room user:${userId}`);

					// Send confirmation to the user
					socket.emit('connected', { userId });

					// Join user's group rooms
					socket.on('join:groups', async ({ groupIds }) => {
						if (Array.isArray(groupIds)) {
							for (const groupId of groupIds) {
								socket.join(`group:${groupId}`);
								console.log(`User ${userId} joined room group:${groupId}`);
							}
							socket.emit('groups:joined', { groupIds });
						}
					});

					// Handle user disconnect
					socket.on('disconnect', () => {
						console.log(`User disconnected: ${userId}`);
					});
				}
			});

			// Store io instance in global for reuse
			global.io = io;
			global.__socketIOInitialized = true;
			console.log('Socket.IO server initialized');
		}
	}

	return resolve(event);
}
