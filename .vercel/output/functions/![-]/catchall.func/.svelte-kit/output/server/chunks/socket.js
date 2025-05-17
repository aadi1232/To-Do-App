import "socket.io-client";
import { w as writable } from "./index2.js";
const notifications = writable(
  /** @type {Notification[]} */
  []
);
const connected = writable(false);
function cleanup() {
  connected.set(false);
}
export {
  cleanup as a,
  connected as c,
  notifications as n
};
