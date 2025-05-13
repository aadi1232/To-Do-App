import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '$lib/env.js';
import User from '../models/user.model.js';

/**
 * Generate JWT token
 * @param {string} id - User ID
 * @returns {string} JWT token
 */
export const generateToken = (id) => {
	return jwt.sign({ id }, JWT_SECRET, {
		expiresIn: '30d'
	});
};

/**
 * Register a new user
 * @param {Object} userData - User data (username, email, password)
 * @returns {Object} User object and token
 */
export const registerUserService = async (userData) => {
	const { username, email, password } = userData;

	// Check if user exists
	const userExists = await User.findOne({ $or: [{ email }, { username }] });

	if (userExists) {
		if (userExists.email === email) {
			throw new Error('Email already exists');
		}
		if (userExists.username === username) {
			throw new Error('Username already exists');
		}
	}

	// Create user
	const user = await User.create({
		username,
		email,
		password
	});

	if (!user) {
		throw new Error('Invalid user data');
	}

	// Generate token
	const token = generateToken(user._id);

	return {
		_id: user._id,
		username: user.username,
		email: user.email,
		profileImage: user.profileImage,
		token
	};
};

/**
 * Login a user
 * @param {Object} credentials - User credentials (username, password)
 * @returns {Object} User object and token
 */
export const loginUserService = async (credentials) => {
	const { username, password } = credentials;

	// Check for user
	const user = await User.findOne({ username });

	if (!user) {
		throw new Error('Invalid username or password');
	}

	// Check password
	const isMatch = await user.matchPassword(password);

	if (!isMatch) {
		throw new Error('Invalid username or password');
	}

	// Generate token
	const token = generateToken(user._id);

	return {
		_id: user._id,
		username: user.username,
		email: user.email,
		profileImage: user.profileImage,
		token
	};
};

/**
 * Get user profile
 * @param {string} userId - User ID
 * @returns {Object} User profile
 */
export const getUserProfileService = async (userId) => {
	const user = await User.findById(userId).select('-password');

	if (!user) {
		throw new Error('User not found');
	}

	return {
		_id: user._id,
		username: user.username,
		email: user.email,
		profileImage: user.profileImage
	};
};

/**
 * Update user profile image
 * @param {string} userId - User ID
 * @param {string} profileImage - Profile image URL
 * @returns {Object} Updated user object
 */
export const updateProfileImageService = async (userId, profileImage) => {
	// Validate the image URL
	if (!profileImage || typeof profileImage !== 'string') {
		throw new Error('Invalid profile image URL');
	}

	const user = await User.findById(userId);

	if (!user) {
		throw new Error('User not found');
	}

	// Update the profile image
	user.profileImage = profileImage;
	await user.save();

	return {
		_id: user._id,
		username: user.username,
		email: user.email,
		profileImage: user.profileImage
	};
};
