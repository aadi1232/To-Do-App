import { j as json } from "../../../../../../chunks/index.js";
import { h as handleRequest } from "../../../../../../chunks/server.js";
async function PUT({ request, cookies }) {
  try {
    const requestData = await request.json();
    if (!requestData.profileImage) {
      return json({ message: "Profile image URL is required" }, { status: 400 });
    }
    const result = await handleRequest(
      "PUT",
      "/api/users/profile/image",
      requestData,
      {
        "Content-Type": "application/json"
      },
      { jwt: cookies.get("jwt") || "" }
    );
    return json(result.body || { message: "Profile image updated successfully" }, {
      status: result.status || 200
    });
  } catch (error) {
    console.error("Profile image update error:", error);
    return json(
      {
        message: error instanceof Error ? error.message : "An error occurred updating profile image"
      },
      { status: 500 }
    );
  }
}
export {
  PUT
};
