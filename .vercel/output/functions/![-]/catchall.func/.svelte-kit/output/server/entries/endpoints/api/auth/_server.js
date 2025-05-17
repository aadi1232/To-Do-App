import { j as json } from "../../../../chunks/index.js";
import { a as app } from "../../../../chunks/server.js";
async function POST({ request }) {
  const requestData = await request.json();
  return new Promise((resolve) => {
    app._router.handle(
      { method: "POST", url: "/api/users/register", body: requestData, headers: {} },
      {
        status: (code) => ({
          json: (data) => {
            resolve(json(data, { status: code }));
            return { end: () => {
            } };
          },
          end: () => {
            resolve(json({}, { status: code }));
            return { end: () => {
            } };
          }
        }),
        setHeader: () => {
          return { status: () => {
          } };
        }
      }
    );
  });
}
export {
  POST
};
