import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
const MONGO_URI = process.env.MONGO_URI;
async function GET() {
  try {
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
    console.log("Testing MongoDB connection from Vercel...");
    const publicIp = await getPublicIp();
    console.log("Your current public IP address is:", publicIp);
    if (!MONGO_URI) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "MongoDB URI is not configured",
          publicIp
        }),
        {
          headers: {
            "Content-Type": "application/json"
          },
          status: 500
        }
      );
    }
    try {
      await mongoose.connect(MONGO_URI);
      console.log("✅ Connection successful!");
      const collections = await mongoose.connection?.db?.listCollections().toArray() || [];
      const collectionNames = collections.map((c) => c.name);
      await mongoose.disconnect();
      return new Response(
        JSON.stringify({
          success: true,
          host: mongoose.connection.host,
          database: mongoose.connection.name,
          collections: collectionNames,
          publicIp
        }),
        {
          headers: {
            "Content-Type": "application/json"
          },
          status: 200
        }
      );
    } catch (error) {
      console.error("❌ MongoDB connection failed:", error);
      if (mongoose.connection?.readyState !== 0) {
        await mongoose.disconnect();
      }
      return new Response(
        JSON.stringify({
          success: false,
          error: error instanceof Error ? error.message : String(error),
          publicIp
        }),
        {
          headers: {
            "Content-Type": "application/json"
          },
          status: 500
        }
      );
    }
  } catch (err) {
    console.error("General error:", err);
    return new Response(
      JSON.stringify({
        success: false,
        error: err instanceof Error ? err.message : String(err)
      }),
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
