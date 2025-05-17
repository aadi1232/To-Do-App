import { h as head, b as attr, i as ensure_array_like, e as escape_html, p as pop, d as push } from "../../../../chunks/index3.js";
import "../../../../chunks/client.js";
function _page($$payload, $$props) {
  push();
  let loading = false;
  let groupName = "";
  let imageUrl = "";
  let inviteeEmail = "";
  let invitees = [];
  head($$payload, ($$payload2) => {
    $$payload2.title = `<title>Create Group</title>`;
  });
  $$payload.out += `<div class="min-h-screen bg-white py-8"><div class="container mx-auto max-w-2xl px-4"><div class="mb-6 flex items-center"><button class="mr-4 flex items-center text-gray-600 hover:text-gray-900"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clip-rule="evenodd"></path></svg> <span class="ml-1">Back</span></button> <h1 class="text-2xl font-bold">Create New Group</h1></div> `;
  {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]--> `;
  {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]--> <div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"><form><div class="mb-4"><label for="groupName" class="mb-2 block font-medium text-gray-700">Group Name <span class="text-red-500">*</span></label> <input type="text" id="groupName"${attr("value", groupName)} class="w-full rounded border border-gray-300 px-3 py-2 focus:border-black focus:outline-none" placeholder="Enter group name"> `;
  {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]--></div> <div class="mb-4"><label for="imageUrl" class="mb-2 block font-medium text-gray-700">Group Image URL (optional)</label> <input type="text" id="imageUrl"${attr("value", imageUrl)} class="w-full rounded border border-gray-300 px-3 py-2 focus:border-black focus:outline-none" placeholder="Enter image URL"></div> <div class="mb-4"><label class="mb-2 block font-medium text-gray-700">Invite Members (by email)</label> <div class="mb-2 flex"><input type="email"${attr("value", inviteeEmail)} class="flex-grow rounded-l border border-gray-300 px-3 py-2 focus:border-black focus:outline-none" placeholder="Enter email address"> <button type="button" class="rounded-r bg-gray-800 px-4 py-2 text-white hover:bg-black">Add</button></div> `;
  {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]--> `;
  if (invitees.length > 0) {
    $$payload.out += "<!--[-->";
    const each_array = ensure_array_like(invitees);
    $$payload.out += `<div class="mt-3 rounded border border-gray-200 p-3"><h4 class="mb-2 font-medium">Invitees:</h4> <ul class="space-y-2"><!--[-->`;
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let invitee = each_array[$$index];
      $$payload.out += `<li class="flex items-center justify-between rounded bg-gray-50 px-3 py-2"><span>${escape_html(invitee.email)}</span> <button type="button" class="text-gray-500 hover:text-red-600"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg></button></li>`;
    }
    $$payload.out += `<!--]--></ul></div>`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]--></div> <div class="mt-6"><button type="submit" class="w-full rounded bg-black px-4 py-2 font-medium text-white hover:bg-gray-800 disabled:bg-gray-400"${attr("disabled", loading, true)}>`;
  {
    $$payload.out += "<!--[!-->";
    $$payload.out += `Create Group`;
  }
  $$payload.out += `<!--]--></button></div></form></div></div></div>`;
  pop();
}
export {
  _page as default
};
