import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import { readFileSync } from "fs";
dotenv.config();
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "../../.env");
try {
  const envFile = readFileSync(envPath, "utf-8");
  const envVars = dotenv.parse(envFile);
  Object.entries(envVars).forEach(([key, value]) => {
    if (!process.env[key]) {
      process.env[key] = value;
    }
  });
} catch (error) {
  console.warn("No .env file found or error reading it");
}
process.env.MONGO_URI || "mongodb://localhost:27017/todo-app";
const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_key_do_not_use_in_production";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "AIzaSyC4a4kwcr5swbJeUa_U0aCdHnLfzOXuPrM";
export {
  GEMINI_API_KEY as G,
  JWT_SECRET as J
};
