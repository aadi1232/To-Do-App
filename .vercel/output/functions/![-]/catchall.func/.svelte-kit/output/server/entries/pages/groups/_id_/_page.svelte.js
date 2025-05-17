import { f as store_get, h as head, u as unsubscribe_stores, p as pop, d as push, e as escape_html, j as attr_class, m as stringify } from "../../../../chunks/index3.js";
import { p as page } from "../../../../chunks/stores.js";
import "../../../../chunks/client.js";
import { o as onDestroy } from "../../../../chunks/index-server.js";
import { a as getGroupTodos } from "../../../../chunks/todos.js";
import "clsx";
import "socket.io-client";
import { w as writable } from "../../../../chunks/index2.js";
const onlineUsers = writable(/* @__PURE__ */ new Set());
function _page($$payload, $$props) {
  push();
  var $$store_subs;
  const groupId = store_get($$store_subs ??= {}, "$page", page).params.id;
  let todos = [];
  let notificationMessage = null;
  let notificationType = "success";
  let lastRefreshTime = Date.now();
  let pendingRefresh = false;
  const unsubscribe = onlineUsers.subscribe((value) => {
  });
  onDestroy(() => {
    removeRealTimeEvents();
    unsubscribe();
  });
  function removeRealTimeEvents() {
    if (typeof window !== "undefined") {
      window.removeEventListener("todo:added", handleTodoEvent);
      window.removeEventListener("todo:updated", handleTodoEvent);
      window.removeEventListener("todo:deleted", handleTodoEvent);
      window.removeEventListener("todo:completed", handleTodoEvent);
      window.removeEventListener(`todo:added-group-${groupId}`, handleGroupSpecificTodoEvent);
      window.removeEventListener(`todo:updated-group-${groupId}`, handleGroupSpecificTodoEvent);
      window.removeEventListener(`todo:deleted-group-${groupId}`, handleGroupSpecificTodoEvent);
      window.removeEventListener(`todo:completed-group-${groupId}`, handleGroupSpecificTodoEvent);
    }
  }
  function handleGroupSpecificTodoEvent(event) {
    console.log(`DIRECT: Received group-specific ${event.type} event:`, event.detail);
    const now = Date.now();
    if (now - lastRefreshTime > 300) {
      console.log("Immediately refreshing todos for group-specific event");
      fetchTodos();
      lastRefreshTime = now;
    } else if (!pendingRefresh) {
      pendingRefresh = true;
      setTimeout(
        () => {
          console.log("Executing delayed refresh for throttled event");
          fetchTodos();
          pendingRefresh = false;
          lastRefreshTime = Date.now();
        },
        500
      );
    }
  }
  function handleTodoEvent(event) {
    console.log("Received todo event in group page:", event.type);
    try {
      const data = event.detail;
      if (data && data.groupId === groupId) {
        console.log(`Todo ${event.type.split(":")[1]} in this group, refreshing todos list`);
        const now = Date.now();
        if (now - lastRefreshTime > 500) {
          fetchTodos();
          lastRefreshTime = now;
        } else if (!pendingRefresh) {
          pendingRefresh = true;
          setTimeout(
            () => {
              console.log("Executing delayed refresh for throttled event");
              fetchTodos();
              pendingRefresh = false;
              lastRefreshTime = Date.now();
            },
            700
          );
        }
      }
    } catch (error) {
      console.error("Error handling todo event:", error);
    }
  }
  async function fetchTodos(isBackgroundSync = false) {
    try {
      if (!isBackgroundSync) {
        console.log("Manually fetching todos for group:", groupId);
      }
      const fetchedTodos = await getGroupTodos(groupId);
      if (!isBackgroundSync) {
        console.log("Received todos:", fetchedTodos.length);
      } else {
        console.log("Background sync: received", fetchedTodos.length, "todos");
      }
      if (!isBackgroundSync && todos.length === 0) {
        console.log("No todos loaded yet, updating the list");
        todos = fetchedTodos;
      } else if (todos.length !== fetchedTodos.length || JSON.stringify(todos.map((t) => t._id).sort()) !== JSON.stringify(fetchedTodos.map((t) => t._id).sort())) {
        console.log("Todos have changed, updating the list");
        todos = fetchedTodos;
      } else if (!isBackgroundSync) {
        console.log("Forcing update for manual refresh");
        todos = [...fetchedTodos];
      }
    } catch (err) {
      console.error("Error fetching todos:", err);
      if (!isBackgroundSync) {
        showNotification("Failed to load todos", "error");
      }
    }
  }
  function showNotification(message, type = "success") {
    notificationMessage = message;
    notificationType = type;
    setTimeout(
      () => {
        notificationMessage = null;
      },
      3e3
    );
  }
  head($$payload, ($$payload2) => {
    $$payload2.title = `<title>${escape_html("Group")} | To-Do App</title>`;
  });
  $$payload.out += `<div class="min-h-screen bg-white">`;
  if (notificationMessage) {
    $$payload.out += "<!--[-->";
    $$payload.out += `<div${attr_class(`fixed top-4 right-4 z-50 rounded-lg p-4 shadow-lg ${stringify(notificationType === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800")}`)}>${escape_html(notificationMessage)}</div>`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]--> <div class="container mx-auto max-w-4xl p-6"><div class="mb-6"><button class="flex items-center text-gray-600 hover:text-gray-900"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clip-rule="evenodd"></path></svg> <span class="ml-1">Back to Groups</span></button></div> `;
  {
    $$payload.out += "<!--[-->";
    $$payload.out += `<div class="flex h-64 items-center justify-center"><div class="animate-pulse text-gray-600">Loading group...</div></div>`;
  }
  $$payload.out += `<!--]--></div></div>`;
  if ($$store_subs) unsubscribe_stores($$store_subs);
  pop();
}
export {
  _page as default
};
