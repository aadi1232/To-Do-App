import { h as handleRequest } from "../../../../../chunks/server.js";
import { j as json } from "../../../../../chunks/index.js";
const DELETE = async ({ request, cookies }) => {
  try {
    const token = cookies.get("jwt");
    const headers = new Headers(request.headers);
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    const body = await request.json();
    const result = await handleRequest("DELETE", "/api/groups/members", body, headers, cookies);
    return json(result.body, { status: result.status });
  } catch (err) {
    const error = err instanceof Error ? err : new Error("Unknown error occurred");
    console.error("Error removing member:", error);
    return json(
      { success: false, message: error.message || "Failed to remove member" },
      { status: 500 }
    );
  }
};
export {
  DELETE
};
