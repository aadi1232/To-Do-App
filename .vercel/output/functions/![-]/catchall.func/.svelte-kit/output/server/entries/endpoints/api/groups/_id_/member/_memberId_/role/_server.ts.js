import { h as handleRequest } from "../../../../../../../../chunks/server.js";
import { j as json } from "../../../../../../../../chunks/index.js";
const PUT = async ({ request, cookies, params }) => {
  try {
    const { id: groupId, memberId } = params;
    console.log(`Processing role update for group ${groupId}, member ${memberId}`);
    const token = cookies.get("jwt");
    const headers = new Headers(request.headers);
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    const body = await request.json();
    const result = await handleRequest(
      "PUT",
      `/api/groups/${groupId}/member/${memberId}/role`,
      body,
      headers,
      cookies
    );
    return json(result.body, { status: result.status });
  } catch (err) {
    const error = err instanceof Error ? err : new Error("Unknown error occurred");
    console.error("Error updating member role:", error);
    return json(
      { success: false, message: error.message || "Failed to update member role" },
      { status: 500 }
    );
  }
};
export {
  PUT
};
