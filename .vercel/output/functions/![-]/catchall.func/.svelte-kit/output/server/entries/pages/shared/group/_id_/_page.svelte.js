import { h as head, e as escape_html, b as attr, i as ensure_array_like, j as attr_class, k as clsx, l as bind_props, p as pop, d as push } from "../../../../../chunks/index3.js";
function _page($$payload, $$props) {
  push();
  let data = $$props["data"];
  let group = data.group;
  let todos = data.todos || [];
  let error = data.error;
  head($$payload, ($$payload2) => {
    $$payload2.title = `<title>${escape_html(group ? group.name : "Shared Group")} | To-Do App</title>`;
  });
  $$payload.out += `<div class="min-h-screen bg-white"><div class="container mx-auto max-w-4xl p-6"><div class="mb-6 rounded-md border border-yellow-100 bg-yellow-50 p-3 text-sm text-yellow-800">This is a read-only view of a shared group</div> `;
  if (error) {
    $$payload.out += "<!--[-->";
    $$payload.out += `<div class="rounded-lg border border-gray-200 bg-white p-6 text-center shadow-sm"><p class="mb-4 text-gray-700">${escape_html(error)}</p> <p class="mb-4 text-sm text-gray-500">This shared link may have expired or is invalid.</p> <a href="/" class="inline-block rounded bg-black px-4 py-2 text-sm text-white hover:bg-gray-800">Go to Home Page</a></div>`;
  } else if (group) {
    $$payload.out += "<!--[1-->";
    $$payload.out += `<div class="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm"><div class="flex flex-col items-center gap-6 md:flex-row md:items-start"><div class="relative h-24 w-24">`;
    if (group.imageUrl && group.imageUrl.length > 2) {
      $$payload.out += "<!--[-->";
      $$payload.out += `<img${attr("src", group.imageUrl)}${attr("alt", group.name)} class="h-24 w-24 rounded-full border-2 border-gray-200 object-cover">`;
    } else {
      $$payload.out += "<!--[!-->";
      $$payload.out += `<div class="flex h-24 w-24 items-center justify-center rounded-full border-2 border-gray-200 bg-gray-100 text-2xl font-semibold text-gray-700">${escape_html(group.name.charAt(0).toUpperCase())}</div>`;
    }
    $$payload.out += `<!--]--></div> <div><h1 class="text-2xl font-bold">${escape_html(group.name)}</h1> <p class="mt-1 text-gray-600">${escape_html(group.members.length)} member${escape_html(group.members.length !== 1 ? "s" : "")}</p> <p class="mt-2 text-sm text-gray-500">Created: ${escape_html(new Date(group.createdAt).toLocaleDateString())}</p></div></div></div> <div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"><div class="todos-section"><h2 class="mb-4 text-xl font-medium">Group To-Dos</h2> `;
    if (todos.length === 0) {
      $$payload.out += "<!--[-->";
      $$payload.out += `<p class="py-8 text-center text-gray-500">No todos yet in this group.</p>`;
    } else {
      $$payload.out += "<!--[!-->";
      const each_array = ensure_array_like(todos);
      $$payload.out += `<ul class="space-y-2"><!--[-->`;
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let todo = each_array[$$index];
        $$payload.out += `<li class="flex items-center justify-between rounded border border-gray-200 bg-white p-3 shadow-sm"><div class="flex items-center"><input type="checkbox"${attr("checked", todo.completed, true)}${attr("disabled", true, true)} class="mr-3 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"> <span${attr_class(clsx(todo.completed ? "text-gray-500 line-through" : ""))}>${escape_html(todo.title)}</span></div> <div class="flex items-center"><span class="text-xs text-gray-500">${escape_html(typeof todo.createdBy === "string" ? "Unknown" : todo.createdBy.username)}</span></div></li>`;
      }
      $$payload.out += `<!--]--></ul>`;
    }
    $$payload.out += `<!--]--></div></div>`;
  } else {
    $$payload.out += "<!--[!-->";
    $$payload.out += `<div class="flex h-64 items-center justify-center"><div class="animate-pulse text-gray-600">Loading shared group...</div></div>`;
  }
  $$payload.out += `<!--]--></div></div>`;
  bind_props($$props, { data });
  pop();
}
export {
  _page as default
};
