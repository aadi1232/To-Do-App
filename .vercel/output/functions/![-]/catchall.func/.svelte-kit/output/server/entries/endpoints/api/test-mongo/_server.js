import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
const MONGO_URI = process.env.MONGO_URI;
console.log("MongoDB URI available:", !!MONGO_URI);
console.log(
  "MongoDB URI (masked):",
  MONGO_URI ? `${MONGO_URI.substring(0, 15)}...${MONGO_URI.substring(MONGO_URI.length - 10)}` : "undefined"
);
async function getPublicIp() {
  try {
    const response = await fetch("https://api.ipify.org?format=json");
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error("Error getting public IP:", error);
    return "unknown";
  }
}
async function testMongoConnection() {
  console.log("Testing MongoDB connection from Vercel...");
  const publicIp = await getPublicIp();
  console.log("Your current public IP address is:", publicIp);
  console.log("Make sure this IP is allowed in MongoDB Atlas Network Access!");
  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 1e4,
      // 10 seconds
      socketTimeoutMS: 45e3
    });
    console.log("✅ MongoDB connection successful!");
    console.log(`Connected to: ${mongoose.connection.host}`);
    console.log(`Database name: ${mongoose.connection.name}`);
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(
      "Collections:",
      collections.map((c) => c.name)
    );
    await mongoose.disconnect();
    return { success: true, message: "MongoDB connection successful" };
  } catch (error) {
    console.error("❌ MongoDB connection failed!");
    console.error("Error details:", error.message);
    console.error("Full error stack:", error.stack);
    if (error.message.includes("ENOTFOUND")) {
      console.error("DNS lookup failed. Check if your MongoDB URI is correct.");
    } else if (error.message.includes("connection timed out")) {
      console.error("Connection timed out. Your IP may not be whitelisted in MongoDB Atlas.");
    } else if (error.message.includes("Authentication failed")) {
      console.error("Authentication failed. Check your MongoDB username and password.");
    }
    return {
      success: false,
      error: error.message,
      stack: error.stack,
      publicIp
    };
  }
}
if (process.argv[1].includes("vercel-check-mongo.js")) {
  testMongoConnection().then((result) => {
    console.log("Test completed:", result);
    process.exit(result.success ? 0 : 1);
  }).catch((err) => {
    console.error("Unexpected error:", err);
    process.exit(1);
  });
}
async function GET() {
  try {
    const result = await testMongoConnection();
    return new Response(JSON.stringify(result, null, 2), {
      headers: {
        "Content-Type": "application/json"
      },
      status: result.success ? 200 : 500
    });
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    return new Response(
      JSON.stringify(
        {
          success: false,
          error: error.message,
          stack: error.stack
        },
        null,
        2
      ),
      {
        headers: {
          "Content-Type": "application/json"
        },
        status: 500
      }
    );
  }
}
export {
  GET
};
