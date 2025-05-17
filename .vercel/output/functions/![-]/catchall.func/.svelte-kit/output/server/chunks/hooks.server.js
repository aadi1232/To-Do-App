import { c as connectDB } from "./db.js";
import "socket.io";
import "./env.js";
import "jsonwebtoken";
import "./user.model.js";
let dbConnected = false;
let connectionError = null;
async function handle({ event, resolve }) {
  if (!dbConnected) {
    try {
      await connectDB();
      dbConnected = true;
      connectionError = null;
      console.log("Database connected in hooks.server.js");
    } catch (error) {
      connectionError = error.message;
      console.error("Database connection error in hooks.server.js:", error);
      if (!event.url.pathname.startsWith("/auth") && !event.url.pathname.startsWith("/api/auth")) {
        const response = await resolve(event);
        return response;
      }
    }
  }
  try {
    const response = await resolve(event);
    return response;
  } catch (error) {
    console.error("Error in SvelteKit hook:", error);
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
export {
  handle
};
