import { j as json } from "../../../../../../chunks/index.js";
import { h as handleRequest } from "../../../../../../chunks/server.js";
async function POST({ params, request, cookies }) {
  const { id: groupId } = params;
  const token = cookies.get("jwt");
  if (!token) return json({ message: "Not authorized" }, { status: 401 });
  const data = await request.json();
  const result = await handleRequest(
    "POST",
    `/api/groups/${groupId}/invite`,
    data,
    {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    { jwt: token }
  );
  return json(result.body, { status: result.status });
}
export {
  POST
};
