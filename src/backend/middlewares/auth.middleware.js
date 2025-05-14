import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '$lib/env.js';
import User from '../models/user.model.js';

export const protect = async (req, res, next) => {
	console.log('Protect middleware hit!');
	let token;

	// Check for token in Authorization header
	console.log('Authorization header:', req.headers.authorization);
	if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
		token = req.headers.authorization.split(' ')[1];
		console.log(
			'Token extracted from Authorization header:',
			token ? token.substring(0, 10) + '...' : 'undefined'
		);
	}
	// Check for token in cookies
	else if (req.cookies && req.cookies.jwt) {
		token = req.cookies.jwt;
		console.log(
			'Token extracted from cookies:',
			token ? token.substring(0, 10) + '...' : 'undefined'
		);
	}

	// If no token found
	if (!token) {
		console.log('No token found in request');
		return res.status(401).json({ message: 'Not authorized, no token' });
	}

	try {
		// Verify token
		console.log('Attempting to verify token');
		const decoded = jwt.verify(token, JWT_SECRET);
		console.log('Decoded token:', decoded);

		// Make sure decoded has an id property
		const userId = typeof decoded === 'object' && decoded !== null ? decoded.id : null;
		console.log('Extracted userId:', userId);

		if (!userId) {
			console.log('Invalid token format - no userId found in token payload');
			throw new Error('Invalid token format');
		}

		// Get user from the token (exclude password)
		console.log('Looking up user with id:', userId);
		const user = await User.findById(userId).select('-password');

		if (!user) {
			console.log('User not found for userId:', userId);
			throw new Error('User not found');
		}

		console.log('User found and authenticated:', user.username || user.email);
		// Add user to request object
		req.user = user;
		next();
	} catch (error) {
		let message = 'Not authorized, token failed';

		if (error instanceof jwt.TokenExpiredError) {
			message = 'Token expired';
			console.log('Token validation error: Token expired');
		} else if (error instanceof jwt.JsonWebTokenError) {
			message = 'Invalid token';
			console.log('Token validation error: Invalid token', error.message);
		} else if (error.message === 'User not found') {
			message = 'User account no longer exists';
			console.log('Token validation error: User not found');
		} else {
			console.log('Token validation error:', error.message);
		}

		res.status(401).json({ message });
	}
};
