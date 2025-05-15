import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '$lib/env.js';
import User from '../models/user.model.js';

/**
 * Middleware to authenticate user requests
 * Uses the same logic as the protect middleware but with a different name for clarity
 */
export const authenticateUser = async (req, res, next) => {
	let token;

	// Check for token in Authorization header
	if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
		token = req.headers.authorization.split(' ')[1];
	}
	// Check for token in cookies
	else if (req.cookies && req.cookies.jwt) {
		token = req.cookies.jwt;
	}

	// If no token found
	if (!token) {
		return res.status(401).json({ message: 'Not authorized, no token' });
	}

	try {
		// Verify token
		const decoded = jwt.verify(token, JWT_SECRET);

		// Make sure decoded has an id property
		const userId = typeof decoded === 'object' && decoded !== null ? decoded.id : null;

		if (!userId) {
			throw new Error('Invalid token format');
		}

		// Get user from the token (exclude password)
		const user = await User.findById(userId).select('-password');

		if (!user) {
			throw new Error('User not found');
		}

		// Add user to request object
		req.user = user;
		next();
	} catch (error) {
		let message = 'Not authorized, token failed';

		if (error instanceof jwt.TokenExpiredError) {
			message = 'Token expired';
		} else if (error instanceof jwt.JsonWebTokenError) {
			message = 'Invalid token';
		} else if (error.message === 'User not found') {
			message = 'User account no longer exists';
		}

		res.status(401).json({ message });
	}
};
