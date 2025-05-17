import { j as json } from "../../../../../chunks/index.js";
import { h as handleRequest } from "../../../../../chunks/server.js";
async function GET({ url, cookies }) {
  const token = cookies.get("jwt");
  if (!token) return json({ message: "Not authorized" }, { status: 401 });
  let rawQuery = url.searchParams.get("query");
  console.log("Raw query from URL:", rawQuery);
  if (rawQuery && rawQuery.includes(":")) {
    rawQuery = rawQuery.split(":")[0];
    console.log("Fixed query after removing colon:", rawQuery);
  }
  const query = rawQuery ? rawQuery.trim() : "";
  console.log("Final search query:", query);
  if (!query) {
    return json({ message: "Search query is required" }, { status: 400 });
  }
  try {
    const result = await handleRequest(
      "GET",
      `/api/search/todos?query=${encodeURIComponent(query)}`,
      null,
      { Authorization: `Bearer ${token}` },
      { jwt: token }
    );
    return json(result.body, { status: result.status });
  } catch (error) {
    console.error("Search API error:", error);
    return json({ message: "Error processing search request", error: error.message }, { status: 500 });
  }
}
export {
  GET
};
