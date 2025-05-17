import { j as json } from "../../../../../../chunks/index.js";
import { h as handleRequest } from "../../../../../../chunks/server.js";
const GET = async ({ params, cookies }) => {
  const { groupId } = params;
  const token = cookies.get("jwt");
  if (!token) return json({ message: "Not authorized" }, { status: 401 });
  const result = await handleRequest(
    "GET",
    `/api/todos/by-group/${groupId}`,
    null,
    { Authorization: `Bearer ${token}` },
    { jwt: token }
  );
  return json(result.body, { status: result.status });
};
const POST = async ({ params, request, cookies }) => {
  const { groupId } = params;
  const token = cookies.get("jwt");
  if (!token) return json({ message: "Not authorized" }, { status: 401 });
  const data = await request.json();
  const result = await handleRequest(
    "POST",
    `/api/todos/by-group/${groupId}`,
    data,
    {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    { jwt: token }
  );
  return json(result.body, { status: result.status });
};
export {
  GET,
  POST
};
