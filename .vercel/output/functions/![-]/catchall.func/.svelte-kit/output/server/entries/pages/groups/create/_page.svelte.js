import { h as head, b as attr, i as ensure_array_like, e as escape_html, p as pop, d as push } from "../../../../chunks/index3.js";
import "../../../../chunks/client.js";
function _page($$payload, $$props) {
  push();
  let groupName = "";
  let imageUrl = "";
  let inviteeEmail = "";
  let invitees = [];
  let loading = false;
  head($$payload, ($$payload2) => {
    $$payload2.title = `<title>Create Group | To-Do App</title>`;
  });
  $$payload.out += `<div class="container mx-auto max-w-lg px-4 py-8"><h1 class="mb-8 text-3xl font-bold">Create a New Group</h1> `;
  {
    $$payload.out += "<!--[!-->";
    $$payload.out += `<form class="rounded-lg border bg-white p-6 shadow-sm">`;
    {
      $$payload.out += "<!--[!-->";
    }
    $$payload.out += `<!--]--> <div class="mb-4"><label for="groupName" class="mb-2 block font-medium text-gray-700">Group Name*</label> <input type="text" id="groupName"${attr("value", groupName)} class="w-full rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-black focus:outline-none" placeholder="Enter group name" required></div> <div class="mb-4"><label for="imageUrl" class="mb-2 block font-medium text-gray-700">Group Image URL (optional)</label> <input type="url" id="imageUrl"${attr("value", imageUrl)} class="w-full rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-black focus:outline-none" placeholder="https://example.com/image.jpg"></div> <div class="mb-6"><label class="mb-2 block font-medium text-gray-700">Invite Members (optional)</label> <div class="mb-2 flex"><input type="email"${attr("value", inviteeEmail)} class="flex-1 rounded-l border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-black focus:outline-none" placeholder="Enter email address"> <button type="button" class="rounded-r bg-black px-4 py-2 text-white hover:bg-gray-800">Add</button></div> `;
    if (invitees.length > 0) {
      $$payload.out += "<!--[-->";
      const each_array = ensure_array_like(invitees);
      $$payload.out += `<div class="mt-3"><p class="mb-2 text-sm text-gray-600">Invitees:</p> <ul class="space-y-2"><!--[-->`;
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let invitee = each_array[$$index];
        $$payload.out += `<li class="flex items-center justify-between rounded bg-gray-100 px-3 py-2"><span>${escape_html(invitee.email)}</span> <button type="button" class="text-red-500 hover:text-red-700">×</button></li>`;
      }
      $$payload.out += `<!--]--></ul></div>`;
    } else {
      $$payload.out += "<!--[!-->";
    }
    $$payload.out += `<!--]--></div> <div class="flex justify-end"><button type="submit" class="rounded bg-black px-6 py-2 text-white hover:bg-gray-800 disabled:opacity-50"${attr("disabled", loading, true)}>${escape_html("Create Group")}</button></div></form> <div class="mt-4 text-center"><a href="/groups" class="text-black hover:underline">Back to groups</a></div>`;
  }
  $$payload.out += `<!--]--></div>`;
  pop();
}
export {
  _page as default
};
