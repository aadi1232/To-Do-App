import { j as json } from "../../../../../../chunks/index.js";
import { h as handleRequest } from "../../../../../../chunks/server.js";
const PUT = async ({ params, request, cookies }) => {
  const { todoId } = params;
  const token = cookies.get("jwt");
  if (!token) return json({ message: "Not authorized" }, { status: 401 });
  const data = await request.json();
  const result = await handleRequest(
    "PUT",
    `/api/todos/by-id/${todoId}`,
    data,
    {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    { jwt: token }
  );
  return json(result.body, { status: result.status });
};
const DELETE = async ({ params, cookies }) => {
  const { todoId } = params;
  const token = cookies.get("jwt");
  if (!token) return json({ message: "Not authorized" }, { status: 401 });
  const result = await handleRequest(
    "DELETE",
    `/api/todos/by-id/${todoId}`,
    null,
    { Authorization: `Bearer ${token}` },
    { jwt: token }
  );
  return json(result.body, { status: result.status });
};
export {
  DELETE,
  PUT
};
