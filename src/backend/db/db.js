import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/todo-app';

// Track connection state
export const dbState = {
	isConnected: false,
	error: null,
	lastAttempt: null
};

const connectDB = async () => {
	// If already connected, return
	if (mongoose.connection.readyState === 1) {
		dbState.isConnected = true;
		return mongoose.connection;
	}

	try {
		dbState.lastAttempt = new Date();
		dbState.isConnected = false;
		dbState.error = null;

		console.log(`Connecting to MongoDB at: ${MONGO_URI}`);

		const conn = await mongoose.connect(MONGO_URI, {
			serverSelectionTimeoutMS: 10000, // Timeout after 10 seconds
			socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
			family: 4 // Use IPv4, skip trying IPv6
		});

		dbState.isConnected = true;
		console.log(`MongoDB Connected: ${conn.connection.host}`);
		return conn;
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'Failed to connect to MongoDB';
		dbState.error = errorMessage;
		console.error(`MongoDB Connection Error: ${errorMessage}`);

		// Don't crash the app, just return null
		return null;
	}
};

export default connectDB;
