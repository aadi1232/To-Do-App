import { c as current_component, n as noop } from "./index3.js";
function onDestroy(fn) {
  var context = (
    /** @type {Component} */
    current_component
  );
  (context.d ??= []).push(fn);
}
function createEventDispatcher() {
  return noop;
}
export {
  createEventDispatcher as c,
  onDestroy as o
};
