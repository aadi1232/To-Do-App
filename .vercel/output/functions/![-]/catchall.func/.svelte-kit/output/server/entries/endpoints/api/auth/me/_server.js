import { j as json } from "../../../../../chunks/index.js";
import { h as handleRequest } from "../../../../../chunks/server.js";
async function GET({ cookies }) {
  const token = cookies.get("jwt");
  if (!token) {
    return json({ message: "Not authorized, no token" }, { status: 401 });
  }
  try {
    const result = await handleRequest(
      "GET",
      "/api/users/me",
      null,
      {
        Authorization: `Bearer ${token}`
      },
      { jwt: token }
    );
    return json(result.body, { status: result.status });
  } catch (error) {
    console.error("Profile fetch error:", error);
    return json(
      {
        message: error instanceof Error ? error.message : "An error occurred while fetching profile"
      },
      { status: 500 }
    );
  }
}
export {
  GET
};
