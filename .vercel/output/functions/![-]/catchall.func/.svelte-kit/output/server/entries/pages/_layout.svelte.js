import { p as pop, d as push, f as store_get, e as escape_html, u as unsubscribe_stores, o as fallback, j as attr_class, l as bind_props, i as ensure_array_like, q as slot } from "../../chunks/index3.js";
import { c as createEventDispatcher, o as onDestroy } from "../../chunks/index-server.js";
import "../../chunks/client.js";
import "clsx";
import "socket.io-client";
import { w as writable, d as derived } from "../../chunks/index2.js";
import { n as notifications, a as cleanup } from "../../chunks/socket.js";
import { n as notifications$1 } from "../../chunks/notifications.js";
const showShortcutsTooltip = writable(false);
function Header($$payload, $$props) {
  push();
  $$payload.out += `<header class="border-b border-gray-200 bg-white p-4"><div class="container mx-auto flex items-center justify-between"><div class="flex items-center"><h1 class="mr-6 text-xl font-bold">To-Do App</h1> `;
  {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]--></div> `;
  {
    $$payload.out += "<!--[-->";
    $$payload.out += `<div class="h-10 w-36 animate-pulse rounded bg-gray-200"></div>`;
  }
  $$payload.out += `<!--]--></div></header>`;
  pop();
}
function KeyboardShortcuts($$payload, $$props) {
  push();
  pop();
}
function ShortcutsTooltip($$payload, $$props) {
  push();
  var $$store_subs;
  const modKey = "Ctrl";
  if (store_get($$store_subs ??= {}, "$showShortcutsTooltip", showShortcutsTooltip)) {
    $$payload.out += "<!--[-->";
    $$payload.out += `<div class="shortcuts-tooltip svelte-swh80v"><div class="tooltip-content svelte-swh80v"><h3 class="svelte-swh80v">Keyboard Shortcuts</h3> <ul class="svelte-swh80v"><li class="svelte-swh80v"><kbd class="svelte-swh80v">${escape_html(modKey)} + G</kbd> - Create Group</li> <li class="svelte-swh80v"><kbd class="svelte-swh80v">${escape_html(modKey)} + M</kbd> - Personal Todos</li> <li class="svelte-swh80v"><kbd class="svelte-swh80v">${escape_html(modKey)} + Z</kbd> - Profile Page</li></ul> <button class="close-btn svelte-swh80v" aria-label="Close shortcuts">×</button></div></div>`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]-->`;
  if ($$store_subs) unsubscribe_stores($$store_subs);
  pop();
}
function NotificationToast($$payload, $$props) {
  push();
  let notification = $$props["notification"];
  let duration = fallback($$props["duration"], 5e3);
  let showDebugInfo = fallback($$props["showDebugInfo"], false);
  const dispatch = createEventDispatcher();
  let timeoutId;
  function getIcon(type) {
    switch (type) {
      case "group:invited":
        return "✉️";
      case "group:joined":
        return "👥";
      case "todo:added":
        return "➕";
      case "todo:updated":
        return "✏️";
      case "todo:deleted":
        return "🗑️";
      case "todo:completed":
        return "✅";
      default:
        return "🔔";
    }
  }
  function getIconColor(type) {
    if (type.startsWith("group:")) {
      return "text-black";
    } else if (type === "todo:added") {
      return "text-black";
    } else if (type === "todo:updated") {
      return "text-black";
    } else if (type === "todo:deleted") {
      return "text-red-500";
    } else if (type === "todo:completed") {
      return "text-black";
    }
    return "text-gray-500";
  }
  if (notification && duration > 0) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(
      () => {
        dispatch("dismiss", { id: notification.id || notification._id });
      },
      duration
    );
  }
  $$payload.out += `<div class="fixed top-4 right-4 z-50 w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-lg"><div class="p-4"><div class="flex items-start"><div class="flex-shrink-0"><div${attr_class(`inline-flex h-8 w-8 items-center justify-center rounded-full ${getIconColor(notification.type)}`)}><span class="text-lg">${escape_html(getIcon(notification.type))}</span></div></div> <div class="ml-3 w-0 flex-1 pt-0.5"><p class="text-sm font-medium text-gray-900">${escape_html(notification.title)}</p> <p class="mt-1 text-sm text-gray-500">${escape_html(notification.message)}</p> `;
  {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]--></div> <div class="ml-4 flex flex-shrink-0"><button type="button" class="inline-flex text-gray-400 hover:text-gray-500 focus:ring-2 focus:ring-black focus:ring-offset-2 focus:outline-none"><span class="sr-only">Close</span> <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg></button></div></div></div></div>`;
  bind_props($$props, { notification, duration, showDebugInfo });
  pop();
}
function NotificationsContainer($$payload, $$props) {
  push();
  let maxToasts = fallback($$props["maxToasts"], 3);
  let activeToasts = [];
  const combinedNotifications = derived([notifications, notifications$1], ([
    $socketNotifications,
    $persistentNotifications
  ]) => {
    const combined = [
      ...$socketNotifications,
      ...$persistentNotifications
    ].sort((a, b) => {
      const timeA = new Date(a.timestamp || a.createdAt || Date.now());
      const timeB = new Date(b.timestamp || b.createdAt || Date.now());
      return timeB.getTime() - timeA.getTime();
    });
    console.log("Combined notifications:", combined.length);
    return combined;
  });
  const unsubscribe = combinedNotifications.subscribe((notifs) => {
    const unread = notifs.filter((n) => !n.read);
    console.log("Unread notifications:", unread.length);
    activeToasts = unread.slice(0, maxToasts);
  });
  onDestroy(() => {
    unsubscribe();
  });
  if (activeToasts.length > 0) {
    console.log("Active toasts:", activeToasts);
  }
  const each_array = ensure_array_like(activeToasts);
  $$payload.out += `<div class="notifications-container z-50 space-y-4 svelte-nmdgto"><!--[-->`;
  for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
    let toast = each_array[$$index];
    NotificationToast($$payload, {
      notification: {
        id: toast.id || toast._id,
        type: toast.type,
        title: toast.title || "Notification",
        message: toast.message,
        data: toast.data || {}
      }
    });
  }
  $$payload.out += `<!--]--></div>`;
  bind_props($$props, { maxToasts });
  pop();
}
function _layout($$payload, $$props) {
  push();
  let data = $$props["data"];
  onDestroy(() => {
    cleanup();
  });
  $$payload.out += `<div class="app svelte-p35luu">`;
  Header($$payload);
  $$payload.out += `<!----> <main class="svelte-p35luu"><!---->`;
  slot($$payload, $$props, "default", {});
  $$payload.out += `<!----></main> `;
  KeyboardShortcuts();
  $$payload.out += `<!----> `;
  ShortcutsTooltip($$payload);
  $$payload.out += `<!----> `;
  NotificationsContainer($$payload, {});
  $$payload.out += `<!----></div>`;
  bind_props($$props, { data });
  pop();
}
export {
  _layout as default
};
