import { j as json } from "../../../../../../chunks/index.js";
import { h as handleRequest } from "../../../../../../chunks/server.js";
async function GET({ params }) {
  try {
    console.log("Fetching shared group with ID:", params.id);
    const result = await handleRequest("GET", `/api/groups/shared/${params.id}`, null, {
      "Content-Type": "application/json"
    });
    return json(result.body);
  } catch (error) {
    console.error("Error in shared group API route:", error);
    return json({ success: false, message: "Failed to fetch shared group" }, { status: 500 });
  }
}
export {
  GET
};
