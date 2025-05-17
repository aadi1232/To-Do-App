import { j as json } from "../../../../../chunks/index.js";
import { h as handleRequest } from "../../../../../chunks/server.js";
async function POST({ request, cookies, locals }) {
  try {
    const body = await request.json();
    const cookieHeader = request.headers.get("cookie");
    const cookiesObj = {};
    if (cookieHeader) {
      cookieHeader.split(";").forEach((cookie) => {
        const [name, value] = cookie.trim().split("=");
        cookiesObj[name] = value;
      });
    }
    const result = await handleRequest(
      "POST",
      "/api/ai/suggest",
      body,
      request.headers,
      cookiesObj
    );
    const headers = new Headers();
    Object.entries(result.headers || {}).forEach(([key, value]) => {
      headers.append(key, value);
    });
    if (result.cookies && result.cookies.length > 0) {
      result.cookies.forEach(({ name, value, options }) => {
        cookies.set(name, value, options);
      });
    }
    return json(result.body, {
      status: result.status,
      headers
    });
  } catch (error) {
    console.error("AI suggestion API error:", error);
    return json({ error: "Failed to process request" }, { status: 500 });
  }
}
export {
  POST
};
