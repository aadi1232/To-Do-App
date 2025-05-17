import { j as json } from "../../../../../chunks/index.js";
import { h as handleRequest } from "../../../../../chunks/server.js";
async function GET({ params, cookies }) {
  const { id } = params;
  const token = cookies.get("jwt");
  if (!token) {
    return json({ message: "Not authorized" }, { status: 401 });
  }
  const result = await handleRequest(
    "GET",
    `/api/todos/${id}`,
    null,
    { Authorization: `Bearer ${token}` },
    { jwt: token }
  );
  return json(result.body, { status: result.status });
}
async function PUT({ params, request, cookies }) {
  const { id } = params;
  const token = cookies.get("jwt");
  if (!token) {
    return json({ message: "Not authorized" }, { status: 401 });
  }
  const data = await request.json();
  const result = await handleRequest(
    "PUT",
    `/api/todos/${id}`,
    data,
    {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    { jwt: token }
  );
  return json(result.body, { status: result.status });
}
async function DELETE({ params, cookies }) {
  const { id } = params;
  const token = cookies.get("jwt");
  if (!token) {
    return json({ message: "Not authorized" }, { status: 401 });
  }
  const result = await handleRequest(
    "DELETE",
    `/api/todos/${id}`,
    null,
    { Authorization: `Bearer ${token}` },
    { jwt: token }
  );
  return json(result.body, { status: result.status });
}
export {
  DELETE,
  GET,
  PUT
};
