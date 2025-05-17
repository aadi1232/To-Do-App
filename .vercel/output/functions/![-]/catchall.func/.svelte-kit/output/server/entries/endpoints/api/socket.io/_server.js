import "socket.io";
import "../../../../chunks/env.js";
import "jsonwebtoken";
function GET(event) {
  console.log("Socket.io API route accessed", event.url.pathname);
  return new Response(JSON.stringify({ status: "Socket.io endpoint is running" }), {
    headers: {
      "Content-Type": "application/json"
    }
  });
}
async function POST(event) {
  try {
    const platform = event.platform;
    const socket = platform?.socket;
    console.log("Socket POST request received");
    return new Response(JSON.stringify({ status: "success" }), {
      headers: {
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    console.error("Socket.io error:", error);
    return new Response(JSON.stringify({ error: "Socket.io error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
export {
  GET,
  POST
};
