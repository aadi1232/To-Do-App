import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
const MONGO_URI = process.env.MONGO_URI;
console.log("Environment check:");
console.log("MONGO_URI available:", !!MONGO_URI);
console.log(
  "MONGO_URI value (masked):",
  MONGO_URI ? `${MONGO_URI.substring(0, 20)}...` : "undefined"
);
const dbState = {
  isConnected: false,
  error: null,
  lastAttempt: null
};
const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    dbState.isConnected = true;
    return mongoose.connection;
  }
  try {
    dbState.lastAttempt = /* @__PURE__ */ new Date();
    dbState.isConnected = false;
    dbState.error = null;
    console.log(
      `Connecting to MongoDB at: ${MONGO_URI ? MONGO_URI.substring(0, 20) + "..." : "undefined"}`
    );
    const conn = await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 1e4,
      // Timeout after 10 seconds
      socketTimeoutMS: 45e3,
      // Close sockets after 45 seconds of inactivity
      family: 4
      // Use IPv4, skip trying IPv6
    });
    dbState.isConnected = true;
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to connect to MongoDB";
    dbState.error = errorMessage;
    console.error(`MongoDB Connection Error: ${errorMessage}`);
    return null;
  }
};
export {
  connectDB as c,
  dbState as d
};
