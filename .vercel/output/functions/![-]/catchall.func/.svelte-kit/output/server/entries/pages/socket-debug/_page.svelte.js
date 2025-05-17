import { i as ensure_array_like, h as head, b as attr, j as attr_class, e as escape_html, k as clsx, m as stringify, p as pop, d as push } from "../../../chunks/index3.js";
import { o as onDestroy } from "../../../chunks/index-server.js";
import { c as connected } from "../../../chunks/socket.js";
import "socket.io-client";
import "../../../chunks/client.js";
function _page($$payload, $$props) {
  push();
  let userId = "";
  let targetUserId = "";
  let groupId = "";
  let groupName = "Test Group";
  let logMessages = [];
  let events = [];
  let eventFilter = "";
  const unsubscribe = connected.subscribe((value) => {
  });
  onDestroy(() => {
    unsubscribe();
  });
  const each_array = ensure_array_like(events.filter((e) => true));
  const each_array_1 = ensure_array_like(logMessages);
  head($$payload, ($$payload2) => {
    $$payload2.title = `<title>Socket.IO Debug</title>`;
  });
  $$payload.out += `<div class="socket-debug-container svelte-t9g4cp"><h1 class="svelte-t9g4cp">Socket.IO Debug</h1> <div class="debug-controls svelte-t9g4cp"><div class="input-group svelte-t9g4cp"><label for="userId" class="svelte-t9g4cp">Your User ID:</label> <input id="userId"${attr("value", userId)} placeholder="Enter your user ID" class="svelte-t9g4cp"></div> <div class="input-group svelte-t9g4cp"><label for="targetUserId" class="svelte-t9g4cp">Target User ID:</label> <input id="targetUserId"${attr("value", targetUserId)} placeholder="Enter target user ID for notifications" class="svelte-t9g4cp"></div> <div class="input-group svelte-t9g4cp"><label for="groupId" class="svelte-t9g4cp">Group ID:</label> <input id="groupId"${attr("value", groupId)} placeholder="Enter group ID" class="svelte-t9g4cp"></div> <div class="input-group svelte-t9g4cp"><label for="groupName" class="svelte-t9g4cp">Group Name:</label> <input id="groupName"${attr("value", groupName)} placeholder="Enter group name" class="svelte-t9g4cp"></div> <div class="button-group svelte-t9g4cp"><button class="primary svelte-t9g4cp"${attr("disabled", true, true)}>Connect Socket</button> <button class="warning svelte-t9g4cp">Disconnect</button></div> <div class="status-indicator svelte-t9g4cp">Socket Status: <span${attr_class(clsx("disconnected"), "svelte-t9g4cp")}>${escape_html("Disconnected")}</span></div></div> <div class="test-actions svelte-t9g4cp"><h2 class="svelte-t9g4cp">Test Socket Events</h2> <div class="button-group svelte-t9g4cp"><button${attr("disabled", true, true)} class="svelte-t9g4cp">Test Group Invite</button> <button${attr("disabled", true, true)} class="svelte-t9g4cp">Test Create Todo</button> <button${attr("disabled", true, true)} class="svelte-t9g4cp">Test Role Change</button></div></div> <div class="debug-panels svelte-t9g4cp"><div class="debug-panel svelte-t9g4cp"><h2 class="svelte-t9g4cp">Socket Events</h2> <input placeholder="Filter events"${attr("value", eventFilter)} class="filter-input svelte-t9g4cp"> <div class="event-list svelte-t9g4cp"><!--[-->`;
  for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
    let event = each_array[$$index];
    $$payload.out += `<div class="event-item svelte-t9g4cp"><div class="event-header svelte-t9g4cp"><span class="event-time svelte-t9g4cp">${escape_html(event.timestamp)}</span> <span class="event-name svelte-t9g4cp">${escape_html(event.event)}</span></div> <pre class="event-data svelte-t9g4cp">${escape_html(event.data)}</pre></div>`;
  }
  $$payload.out += `<!--]--></div></div> <div class="debug-panel svelte-t9g4cp"><h2 class="svelte-t9g4cp">Log Messages</h2> <div class="log-list svelte-t9g4cp"><!--[-->`;
  for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
    let log = each_array_1[$$index_1];
    $$payload.out += `<div${attr_class(`log-item ${stringify(log.type)}`, "svelte-t9g4cp")}><span class="log-time svelte-t9g4cp">${escape_html(log.timestamp)}</span> <span class="log-message svelte-t9g4cp">${escape_html(log.message)}</span></div>`;
  }
  $$payload.out += `<!--]--></div></div></div></div>`;
  pop();
}
export {
  _page as default
};
