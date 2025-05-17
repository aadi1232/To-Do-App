import { j as json } from "../../../../../../chunks/index.js";
async function GET({ params, fetch }) {
  try {
    const response = await fetch(`/api/groups/shared/${params.id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    });
    const data = await response.json();
    if (!response.ok) {
      console.error("Error response from API:", data);
      return json(
        {
          success: false,
          message: data.message || "Failed to fetch shared group"
        },
        { status: response.status }
      );
    }
    return json(data);
  } catch (error) {
    console.error("Error fetching shared group:", error);
    return json({ success: false, message: "Failed to fetch shared group" }, { status: 500 });
  }
}
export {
  GET
};
