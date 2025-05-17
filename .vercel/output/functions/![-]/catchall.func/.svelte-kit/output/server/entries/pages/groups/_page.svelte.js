import { h as head, p as pop, d as push } from "../../../chunks/index3.js";
function _page($$payload, $$props) {
  push();
  let groups = [];
  head($$payload, ($$payload2) => {
    $$payload2.title = `<title>My Groups | To-Do App</title>`;
  });
  $$payload.out += `<div class="container mx-auto max-w-6xl px-4 py-6"><h1 class="mb-6 text-2xl font-bold text-gray-800">My Groups</h1> `;
  {
    $$payload.out += "<!--[-->";
    $$payload.out += `<div class="flex h-48 items-center justify-center"><div class="animate-pulse text-gray-500">Loading...</div></div>`;
  }
  $$payload.out += `<!--]--> `;
  if (groups.length > 0) {
    $$payload.out += "<!--[-->";
    $$payload.out += `<div class="mt-8 flex justify-center"><a href="/groups/create" class="inline-flex items-center rounded-md bg-black px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-900 focus:ring-4 focus:ring-black focus:outline-none"><svg xmlns="http://www.w3.org/2000/svg" class="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg> Create a New Group</a></div>`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]--></div>`;
  pop();
}
export {
  _page as default
};
