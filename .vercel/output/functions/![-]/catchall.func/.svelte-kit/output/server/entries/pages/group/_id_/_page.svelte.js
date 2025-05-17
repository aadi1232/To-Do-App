import { f as store_get, h as head, u as unsubscribe_stores, p as pop, d as push, e as escape_html } from "../../../../chunks/index3.js";
import { p as page } from "../../../../chunks/stores.js";
import "../../../../chunks/client.js";
function _page($$payload, $$props) {
  push();
  var $$store_subs;
  store_get($$store_subs ??= {}, "$page", page).params.id;
  head($$payload, ($$payload2) => {
    $$payload2.title = `<title>${escape_html("Group")} | To-Do App</title>`;
  });
  $$payload.out += `<div class="min-h-screen bg-white">`;
  {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]--> <div class="container mx-auto max-w-4xl p-6"><div class="mb-6"><button class="flex items-center text-gray-600 hover:text-gray-900"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clip-rule="evenodd"></path></svg> <span class="ml-1">Back to Profile</span></button></div> `;
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
