import { h as handleRequest } from "../../../../../chunks/server.js";
import { j as json } from "../../../../../chunks/index.js";
const GET = async ({ params, request, cookies }) => {
  try {
    const token = cookies.get("jwt");
    const headers = new Headers(request.headers);
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    const result = await handleRequest("GET", `/api/groups/${params.id}`, null, headers, cookies);
    return json(result.body, { status: result.status });
  } catch (err) {
    const error = err instanceof Error ? err : new Error("Unknown error occurred");
    console.error(`Error fetching group ${params.id}:`, error);
    return json(
      { success: false, message: error.message || "Failed to fetch group" },
      { status: 500 }
    );
  }
};
const PUT = async ({ params, request, cookies }) => {
  try {
    const token = cookies.get("jwt");
    const headers = new Headers(request.headers);
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    const body = await request.json();
    const result = await handleRequest("PUT", `/api/groups/${params.id}`, body, headers, cookies);
    return json(result.body, { status: result.status });
  } catch (err) {
    const error = err instanceof Error ? err : new Error("Unknown error occurred");
    console.error(`Error updating group ${params.id}:`, error);
    return json(
      { success: false, message: error.message || "Failed to update group" },
      { status: 500 }
    );
  }
};
const DELETE = async ({ params, request, cookies }) => {
  try {
    const token = cookies.get("jwt");
    const headers = new Headers(request.headers);
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    const result = await handleRequest(
      "DELETE",
      `/api/groups/${params.id}`,
      {},
      // Empty body since we're using browser confirm dialog
      headers,
      cookies
    );
    return json(result.body, { status: result.status });
  } catch (err) {
    const error = err instanceof Error ? err : new Error("Unknown error occurred");
    console.error(`Error deleting group ${params.id}:`, error);
    return json(
      { success: false, message: error.message || "Failed to delete group" },
      { status: 500 }
    );
  }
};
export {
  DELETE,
  GET,
  PUT
};
