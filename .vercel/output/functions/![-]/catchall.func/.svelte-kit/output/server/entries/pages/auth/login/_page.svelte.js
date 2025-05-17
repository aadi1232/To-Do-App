import { b as attr, e as escape_html, p as pop, d as push } from "../../../../chunks/index3.js";
import "../../../../chunks/client.js";
function _page($$payload, $$props) {
  push();
  let username = "";
  let password = "";
  let loading = false;
  $$payload.out += `<div class="flex min-h-screen items-center justify-center bg-white"><div class="w-full max-w-md rounded-md border border-gray-300 p-8"><h1 class="mb-6 text-center text-2xl font-bold">Log In</h1> `;
  {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]--> <form><div class="mb-4"><label for="username" class="mb-1 block text-sm font-medium text-gray-700">Username</label> <input id="username" type="text"${attr("value", username)} class="w-full rounded-md border border-gray-300 px-3 py-2" required></div> <div class="mb-6"><label for="password" class="mb-1 block text-sm font-medium text-gray-700">Password</label> <input id="password" type="password"${attr("value", password)} class="w-full rounded-md border border-gray-300 px-3 py-2" required></div> <button type="submit" class="w-full rounded-md bg-black py-2 text-white hover:bg-gray-800 disabled:opacity-50"${attr("disabled", loading, true)}>${escape_html("Log In")}</button></form> <div class="mt-4 text-center"><p class="text-sm text-gray-600">Don't have an account? <a href="/auth/signup" class="text-black underline">Sign Up</a></p></div></div></div>`;
  pop();
}
export {
  _page as default
};
