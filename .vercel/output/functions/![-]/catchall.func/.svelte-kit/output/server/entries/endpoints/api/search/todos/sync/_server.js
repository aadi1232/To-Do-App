import { j as json } from "../../../../../../chunks/index.js";
import { h as handleRequest } from "../../../../../../chunks/server.js";
async function POST({ cookies }) {
  const token = cookies.get("jwt");
  if (!token) return json({ message: "Not authorized" }, { status: 401 });
  const result = await handleRequest(
    "POST",
    "/api/search/todos/sync",
    null,
    { Authorization: `Bearer ${token}` },
    { jwt: token }
  );
  return json(result.body, { status: result.status });
}
export {
  POST
};
