import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '$lib/env.js';
import User from '../models/user.model.js';
import {
	registerUserService,
	loginUserService,
	getUserProfileService,
	updateProfileImageService
} from '../services/user.service.js';

/**
 * @typedef {Object} UserData
 * @property {string} token - JWT token
 * @property {string} [username] - User's username
 * @property {string} [email] - User's email
 * @property {string} [profileImage] - User's profile image URL
 */

/**
 * @typedef {import('express').Request & { user?: { _id: string } }} AuthRequest
 */

/**
 * Generate JWT token
 * @param {string} id - User ID
 * @returns {string} JWT token
 */
const generateToken = (id) => {
	return jwt.sign({ id }, JWT_SECRET, {
		expiresIn: '30d'
	});
};

/**
 * Register a new user
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const registerUser = async (req, res) => {
	try {
		const { username, email, password } = req.body;

		const userData = /** @type {UserData} */ (
			await registerUserService({ username, email, password })
		);

		// Set JWT as HTTP-only cookie
		res.cookie('jwt', userData.token, {
			httpOnly: true,
			secure: process.env.NODE_ENV !== 'development',
			sameSite: 'strict',
			maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
			path: '/'
		});

		res.status(201).json(userData);
	} catch (error) {
		const statusCode = error instanceof Error && error.message.includes('exists') ? 400 : 500;
		res
			.status(statusCode)
			.json({ message: error instanceof Error ? error.message : 'Server error' });
	}
};

/**
 * Login user
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const loginUser = async (req, res) => {
	try {
		const { username, password } = req.body;

		const userData = /** @type {UserData} */ (await loginUserService({ username, password }));

		// Set JWT as HTTP-only cookie
		res.cookie('jwt', userData.token, {
			httpOnly: true,
			secure: process.env.NODE_ENV !== 'development',
			sameSite: 'strict',
			maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
			path: '/'
		});

		res.json(userData);
	} catch (error) {
		res
			.status(401)
			.json({ message: error instanceof Error ? error.message : 'Invalid username or password' });
	}
};

/**
 * Get user profile
 * @param {AuthRequest} req
 * @param {import('express').Response} res
 */
export const getMe = async (req, res) => {
	try {
		if (!req.user || !req.user._id) {
			return res.status(401).json({ message: 'Not authorized' });
		}
		const userData = await getUserProfileService(req.user._id);
		res.json(userData);
	} catch (error) {
		res.status(404).json({ message: error instanceof Error ? error.message : 'User not found' });
	}
};

/**
 * Logout user
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const logoutUser = (req, res) => {
	res.cookie('jwt', '', {
		httpOnly: true,
		expires: new Date(0),
		path: '/'
	});
	res.status(200).json({ message: 'Logged out successfully' });
};

/**
 * Update user profile image
 * @param {AuthRequest} req
 * @param {import('express').Response} res
 */
export const updateProfileImage = async (req, res) => {
	try {
		if (!req.user || !req.user._id) {
			return res.status(401).json({ message: 'Not authorized' });
		}

		const { profileImage } = req.body;

		if (!profileImage) {
			return res.status(400).json({ message: 'Profile image URL is required' });
		}

		const updatedUser = await updateProfileImageService(req.user._id, profileImage);

		res.status(200).json({
			message: 'Profile image updated successfully',
			profileImage: updatedUser.profileImage
		});
	} catch (error) {
		res
			.status(400)
			.json({ message: error instanceof Error ? error.message : 'Error updating profile image' });
	}
};
