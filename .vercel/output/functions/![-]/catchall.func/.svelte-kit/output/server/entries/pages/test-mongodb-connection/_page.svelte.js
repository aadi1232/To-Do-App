import "clsx";
import { p as pop, d as push } from "../../../chunks/index3.js";
function _page($$payload, $$props) {
  push();
  $$payload.out += `<div class="container mx-auto max-w-4xl p-4"><h1 class="mb-6 text-3xl font-bold">MongoDB Connection Test</h1> `;
  {
    $$payload.out += "<!--[-->";
    $$payload.out += `<div class="rounded-md bg-blue-50 p-4"><p class="text-blue-700">Testing MongoDB connection...</p></div>`;
  }
  $$payload.out += `<!--]--></div>`;
  pop();
}
export {
  _page as default
};
