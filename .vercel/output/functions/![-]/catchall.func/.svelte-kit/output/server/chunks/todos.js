async function getUserTodos() {
  const response = await fetch("/api/todos", {
    credentials: "include"
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch todos");
  }
  const data = await response.json();
  return data;
}
async function createTodo(todoData) {
  const response = await fetch("/api/todos", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    credentials: "include",
    body: JSON.stringify(todoData)
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to create todo");
  }
  return response.json();
}
async function updateTodo(todoId, todoData) {
  const response = await fetch(`/api/todos/${todoId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    credentials: "include",
    body: JSON.stringify(todoData)
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to update todo");
  }
  return response.json();
}
async function deleteTodo(todoId) {
  const response = await fetch(`/api/todos/${todoId}`, {
    method: "DELETE",
    credentials: "include"
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to delete todo");
  }
}
async function getGroupTodos(groupId) {
  const response = await fetch(`/api/todos/by-group/${groupId}`, {
    credentials: "include"
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch group todos");
  }
  const data = await response.json();
  return data;
}
export {
  getGroupTodos as a,
  createTodo as c,
  deleteTodo as d,
  getUserTodos as g,
  updateTodo as u
};
