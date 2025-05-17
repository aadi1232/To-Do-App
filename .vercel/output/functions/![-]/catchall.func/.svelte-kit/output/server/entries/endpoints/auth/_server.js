import { j as json } from "../../../chunks/index.js";
import { c as connectDB } from "../../../chunks/db.js";
async function GET(event) {
  console.log("Auth route accessed");
  try {
    await connectDB();
    return json({ status: "ok", message: "Auth API is running" });
  } catch (error) {
    console.error("Database connection error in auth route:", error);
    return json({ status: "error", message: "Database connection failed" }, { status: 503 });
  }
}
export {
  GET
};
