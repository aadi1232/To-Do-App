import { f as store_get, h as head, j as attr_class, e as escape_html, b as attr, u as unsubscribe_stores, p as pop, d as push } from "../../../chunks/index3.js";
import { c as connected } from "../../../chunks/socket.js";
function _page($$payload, $$props) {
  push();
  var $$store_subs;
  let socketConnected = false;
  socketConnected = store_get($$store_subs ??= {}, "$connected", connected);
  head($$payload, ($$payload2) => {
    $$payload2.title = `<title>Test Notifications</title>`;
  });
  $$payload.out += `<div class="container mx-auto max-w-2xl p-6"><h1 class="mb-6 text-2xl font-bold">Test Real-Time Notifications</h1> <div class="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm"><h2 class="mb-2 text-lg font-semibold">Connection Status</h2> <div class="flex items-center gap-2"><div${attr_class(`h-3 w-3 rounded-full ${socketConnected ? "bg-green-500" : "bg-red-500"}`)}></div> <span>${escape_html(socketConnected ? "Connected to Socket.IO" : "Not Connected to Socket.IO")}</span></div> `;
  {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]--> `;
  {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]--> `;
  {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]--></div> <div class="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm"><h2 class="mb-4 text-lg font-semibold">🔴 Direct Group Invitation Test</h2> <p class="mb-4 text-sm text-gray-600">This uses a direct communication method to bypass any middleware and ensure the notification
			reaches the user directly. Try this if regular invitations aren't working.</p> <button class="w-full rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50"${attr("disabled", !socketConnected || true, true)}>Send Direct Group Invitation</button></div> <div class="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm"><h2 class="mb-4 text-lg font-semibold">Test Required Notification Types</h2> <p class="mb-6 text-sm text-gray-600">These are the specific notification types needed for the app:</p> <div class="grid gap-4 md:grid-cols-2"><button class="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"${attr("disabled", !socketConnected || true, true)}>1. Group Invitation</button> <button class="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"${attr("disabled", !socketConnected || true, true)}>2. Todo Completed</button> <button class="rounded-md bg-purple-600 px-4 py-2 text-white hover:bg-purple-700 disabled:opacity-50"${attr("disabled", !socketConnected || true, true)}>3a. User Role Changed</button> <button class="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50"${attr("disabled", !socketConnected || true, true)}>3b. User Removed</button></div></div> <div class="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm"><h2 class="mb-4 text-lg font-semibold">Send Real Socket Notifications</h2> <p class="mb-6 text-sm text-gray-600">These buttons trigger real Socket.IO events through the standalone socket server. Socket.IO
			must be running on port 3001.</p> <div class="grid gap-4 md:grid-cols-2"><button class="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"${attr("disabled", !socketConnected || true, true)}>Real Group Invitation</button> <button class="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"${attr("disabled", !socketConnected || true, true)}>Real Todo Created</button> <button class="rounded-md bg-yellow-600 px-4 py-2 text-white hover:bg-yellow-700 disabled:opacity-50"${attr("disabled", !socketConnected || true, true)}>Real Todo Updated</button></div></div> <div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"><h2 class="mb-4 text-lg font-semibold">Send Client-side Notifications</h2> <p class="mb-6 text-sm text-gray-600">These buttons send test notifications directly from the client. These are client-side only and
			will not affect other users.</p> <div class="grid gap-4 md:grid-cols-2"><button class="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">Test Group Invitation</button> <button class="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">Test User Joined Group</button> <button class="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700">Test Todo Added</button></div></div></div>`;
  if ($$store_subs) unsubscribe_stores($$store_subs);
  pop();
}
export {
  _page as default
};
