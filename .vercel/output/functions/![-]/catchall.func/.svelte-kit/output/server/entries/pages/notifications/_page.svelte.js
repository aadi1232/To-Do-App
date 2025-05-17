import { h as head, b as attr, f as store_get, u as unsubscribe_stores, p as pop, d as push } from "../../../chunks/index3.js";
import { n as notifications } from "../../../chunks/notifications.js";
function _page($$payload, $$props) {
  push();
  var $$store_subs;
  head($$payload, ($$payload2) => {
    $$payload2.title = `<title>Notifications | To-Do App</title>`;
  });
  $$payload.out += `<div class="min-h-screen bg-gray-50 py-8"><div class="container mx-auto max-w-3xl"><div class="mb-6 flex items-center justify-between"><h1 class="text-2xl font-bold">Notifications</h1> <button class="rounded bg-black px-4 py-2 text-white hover:bg-gray-800 disabled:opacity-50"${attr("disabled", store_get($$store_subs ??= {}, "$notifications", notifications).length === 0 || store_get($$store_subs ??= {}, "$notifications", notifications).every((n) => n.read), true)}>Mark All as Read</button></div> <div class="rounded-lg bg-white shadow">`;
  {
    $$payload.out += "<!--[-->";
    $$payload.out += `<div class="flex justify-center py-20"><div class="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-black"></div></div>`;
  }
  $$payload.out += `<!--]--></div></div></div>`;
  if ($$store_subs) unsubscribe_stores($$store_subs);
  pop();
}
export {
  _page as default
};
