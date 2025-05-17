import { j as json } from "../../../../../chunks/index.js";
function GET() {
  return json({
    version: 1,
    type: "sveltekit"
  });
}
export {
  GET
};
