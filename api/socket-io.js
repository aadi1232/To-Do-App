import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../src/lib/env.js';
import { createServer } from 'http';

// Create a simple HTTP server
const httpServer = createServer();

// Socket.io setup
const io = new Server(httpServer, {
	cors: {
		origin: '*',
		methods: ['GET', 'POST'],
		credentials: true
	},
	path: '/api/socket.io/'
});

// Socket.io middleware for authentication
io.use(async (socket, next) => {
	try {
		const token =
			socket.handshake.auth.token ||
			socket.handshake.auth.userId ||
			socket.handshake.headers.authorization?.split(' ')[1];

		if (!token) {
			console.warn('Socket auth failed: No token provided');
			return next(new Error('Authentication error: No token provided'));
		}

		// Verify the token
		try {
			const decoded = jwt.verify(token, JWT_SECRET);
			socket.user = { id: decoded.id };
			next();
		} catch (jwtErr) {
			// If token is userId and not JWT, try using it directly
			if (token.length === 24 || token.length === 12) {
				socket.user = { id: token };
				next();
			} else {
				return next(new Error('Invalid token'));
			}
		}
	} catch (error) {
		console.error('Socket authentication error:', error.message);
		next(new Error('Authentication error'));
	}
});

// Handle socket connections
io.on('connection', (socket) => {
	const userId = socket.user?.id;

	console.log(`User connected: ${userId}`);

	// Join user's private room
	if (userId) {
		socket.join(`user:${userId}`);

		// Send confirmation to the user
		socket.emit('connected', { userId });

		// Join user's group rooms
		socket.on('join:groups', async ({ groupIds }) => {
			if (Array.isArray(groupIds)) {
				for (const groupId of groupIds) {
					socket.join(`group:${groupId}`);
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

// Export for Vercel serverless function
export default function SocketHandler(req, res) {
	if (req.method === 'GET') {
		res.status(200).json({ message: 'Socket.io server is running' });
	} else if (res.socket.server.io) {
		// Socket.io server already running
		res.end();
	} else {
		// Set up Socket.io server
		res.socket.server.io = io;
		io.attach(res.socket.server);
		res.end();
	}
}
