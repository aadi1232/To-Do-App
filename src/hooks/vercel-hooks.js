import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '$lib/env.js';
import User from '../backend/models/user.model.js';

// Store for active connections - this is needed since Vercel is a serverless environment
// Note: In production, you should use a Redis adapter or similar for multi-instance support
let io = null;

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
	if (event.platform && !io) {
		// Initialize Socket.IO with the Vercel platform
		console.log('Initializing Socket.IO for Vercel serverless environment');

		io = new Server({
			cors: {
				origin: true,
				credentials: true
			},
			connectionStateRecovery: {
				// The server will store the connection state for 24 hours
				maxDisconnectionDuration: 86400000,
				// Use memory adapter for simplicity in serverless (consider Redis in production)
				skipMiddlewares: true
			},
			// Use WebSocket by default for speed
			transports: ['websocket', 'polling'],
			// Reduce timeout for faster connection
			connectTimeout: 10000
		});

		// Debug socket errors at transport level
		io.engine?.on('connection_error', (err) => {
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
					socket.handshake.auth.userId ||
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
			const userId = socket.user?._id?.toString();

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

		// Attach the Socket.IO server to the platform
		// Check if running in Vercel environment or local
		if (event.platform) {
			// For Vercel, we need to handle how we attach to the server
			try {
				// Different ways to access server depending on environment
				const server =
					(event.platform.node && event.platform.node.server) || // SvelteKit 2.0+
					event.platform.server || // Older SvelteKit
					event.platform; // Fallback

				io.attach(server);
				console.log('Socket.IO server attached successfully');
			} catch (err) {
				console.error('Failed to attach Socket.IO to server:', err);
			}
		}

		console.log('Socket.IO server initialized for Vercel deployment');
	}

	return resolve(event);
}
