import { j as json } from "../../../../../chunks/index.js";
import { h as handleRequest } from "../../../../../chunks/server.js";
import { s as setCookieSafely } from "../../../../../chunks/cookie.js";
async function POST({ request, cookies }) {
  try {
    const requestData = await request.json();
    console.log("Login request data:", { username: requestData.username });
    const result = await handleRequest(
      "POST",
      "/api/users/login",
      requestData,
      {
        "Content-Type": "application/json"
      },
      {}
      // No cookies to send initially
    );
    console.log("Login response:", {
      status: result.status,
      cookies: result.cookies ? result.cookies.length : 0,
      body: result.body ? {
        success: !!result.body.token,
        username: result.body.username
      } : null
    });
    if (result.cookies && result.cookies.length > 0) {
      for (const cookie of result.cookies) {
        console.log(`Setting cookie from login response: ${cookie.name}`, cookie.options);
        setCookieSafely(cookies, cookie.name, cookie.value, cookie.options);
      }
    } else {
      console.log("No cookies received from login response");
    }
    return json(result.body, { status: result.status });
  } catch (error) {
    console.error("Login error:", error);
    return json(
      { message: error instanceof Error ? error.message : "An error occurred during login" },
      { status: 500 }
    );
  }
}
export {
  POST
};
