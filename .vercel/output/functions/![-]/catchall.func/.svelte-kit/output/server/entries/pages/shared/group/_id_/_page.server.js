async function load({ params, fetch }) {
  try {
    const response = await fetch(`/api/groups/shared/${params.id}`);
    console.log("Shared group API response status:", response.status);
    if (!response.ok) {
      console.error("Error response from shared group API:", response.status);
      return {
        error: `Failed to load shared group. Status: ${response.status}`
      };
    }
    const data = await response.json();
    console.log("Shared group data received:", data ? "yes" : "no");
    if (!data.success) {
      console.error("API returned error:", data.message);
      return {
        error: data.message || "Failed to load shared group"
      };
    }
    return {
      group: data.group,
      todos: data.todos || []
    };
  } catch (error) {
    console.error("Error loading shared group:", error);
    return {
      error: "An unexpected error occurred"
    };
  }
}
export {
  load
};
