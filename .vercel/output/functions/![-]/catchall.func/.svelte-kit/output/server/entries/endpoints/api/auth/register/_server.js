import { j as json } from "../../../../../chunks/index.js";
import { h as handleRequest } from "../../../../../chunks/server.js";
import { s as setCookieSafely } from "../../../../../chunks/cookie.js";
async function POST({ request, cookies }) {
  try {
    const requestData = await request.json();
    const result = await handleRequest(
      "POST",
      "/api/users/register",
      requestData,
      {
        "Content-Type": "application/json"
      },
      {}
      // No cookies to send initially
    );
    if (result.cookies && result.cookies.length > 0) {
      for (const cookie of result.cookies) {
        setCookieSafely(cookies, cookie.name, cookie.value, cookie.options);
      }
    }
    return json(result.body, { status: result.status });
  } catch (error) {
    console.error("Registration error:", error);
    return json(
      { message: error instanceof Error ? error.message : "An error occurred during registration" },
      { status: 500 }
    );
  }
}
export {
  POST
};
