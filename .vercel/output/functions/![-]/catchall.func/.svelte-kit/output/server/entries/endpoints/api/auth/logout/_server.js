import { j as json } from "../../../../../chunks/index.js";
import { h as handleRequest } from "../../../../../chunks/server.js";
import { c as clearCookie } from "../../../../../chunks/cookie.js";
async function POST({ cookies }) {
  try {
    const result = await handleRequest(
      "POST",
      "/api/users/logout",
      null,
      {},
      { jwt: cookies.get("jwt") || "" }
    );
    clearCookie(cookies, "jwt", { httpOnly: true });
    return json(result.body || { message: "Logged out successfully" }, {
      status: result.status || 200
    });
  } catch (error) {
    console.error("Logout error:", error);
    clearCookie(cookies, "jwt", { httpOnly: true });
    return json({ message: "Logged out successfully" }, { status: 200 });
  }
}
export {
  POST
};
