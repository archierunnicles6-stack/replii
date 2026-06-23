import { writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, "..", ".env");

const KEYS = [
  "VITE_OPENAI_API_KEY",
  "VITE_SUPABASE_URL",
  "VITE_SUPABASE_ANON_KEY",
  "VITE_LEGAL_BASE_URL",
  "VITE_API_BASE_URL",
  "VITE_GOOGLE_CLIENT_ID",
  "VITE_ADMIN_EMAIL",
];

const DEFAULTS = {
  VITE_LEGAL_BASE_URL: "https://replii.ai",
  VITE_API_BASE_URL: "https://replii-lac.vercel.app",
  VITE_GOOGLE_CLIENT_ID:
    "821453006387-t40vuplgvemi57kf3qhqp9gca4qmicd5.apps.googleusercontent.com",
};

const REQUIRED = [
  "VITE_OPENAI_API_KEY",
  "VITE_SUPABASE_URL",
  "VITE_SUPABASE_ANON_KEY",
];

const lines = ["# Generated for CI / release packaging — do not commit secrets manually."];
const missing = [];

for (const key of KEYS) {
  const value = process.env[key]?.trim() || DEFAULTS[key] || "";
  if (!value && REQUIRED.includes(key)) {
    missing.push(key);
  }
  lines.push(`${key}=${value}`);
}

if (missing.length > 0) {
  console.error("[replii] Missing required env for desktop packaging:");
  for (const key of missing) {
    console.error(`  ${key}`);
  }
  console.error(
    "[replii] Set GitHub Actions secrets or export vars locally before packaging.",
  );
  process.exit(1);
}

writeFileSync(envPath, `${lines.join("\n")}\n`, "utf8");
console.log(`[replii] Wrote ${envPath} for packaging (${KEYS.length} keys).`);
