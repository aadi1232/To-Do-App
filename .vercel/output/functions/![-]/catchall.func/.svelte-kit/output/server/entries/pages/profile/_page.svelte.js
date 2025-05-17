import { h as head, p as pop, d as push } from "../../../chunks/index3.js";
import "../../../chunks/client.js";
function _page($$payload, $$props) {
  push();
  head($$payload, ($$payload2) => {
    $$payload2.title = `<title>User Profile</title>`;
  });
  $$payload.out += `<div class="min-h-screen bg-white">`;
  {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]--> <div class="container mx-auto max-w-4xl p-6">`;
  {
    $$payload.out += "<!--[-->";
    $$payload.out += `<div class="flex h-64 items-center justify-center"><div class="animate-pulse text-gray-600">Loading profile...</div></div>`;
  }
  $$payload.out += `<!--]--></div></div>`;
  pop();
}
export {
  _page as default
};
