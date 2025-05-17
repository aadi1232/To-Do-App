import { h as handleRequest } from "../../../../../../../chunks/server.js";
import { j as json } from "../../../../../../../chunks/index.js";
const POST = async ({ request, cookies, params }) => {
  try {
    const groupId = params.id;
    if (!groupId) {
      return json({ success: false, message: "Group ID is required" }, { status: 400 });
    }
    const token = cookies.get("jwt");
    const headers = new Headers(request.headers);
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    const body = await request.json();
    const { response: responseType } = body;
    const result = await handleRequest(
      "POST",
      "/api/groups/invitation/" + groupId + "/respond",
      {
        groupId,
        // Include groupId in the body as controller expects it
        response: responseType
      },
      headers,
      cookies
    );
    return json(result.body, { status: result.status });
  } catch (err) {
    const error = err instanceof Error ? err : new Error("Unknown error occurred");
    console.error("Error responding to invitation:", error);
    return json(
      { success: false, message: error.message || "Failed to respond to invitation" },
      { status: 500 }
    );
  }
};
export {
  POST
};
