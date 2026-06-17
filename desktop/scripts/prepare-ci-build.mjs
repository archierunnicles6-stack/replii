import { copyFileSync, existsSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const desktopRoot = path.join(__dirname, "..");
const envPath = path.join(desktopRoot, ".env");
const envExamplePath = path.join(desktopRoot, ".env.example");

if (!existsSync(envPath)) {
  if (existsSync(envExamplePath)) {
    copyFileSync(envExamplePath, envPath);
    console.log("[ghost] Copied .env.example → .env for packaging");
  } else {
    writeFileSync(envPath, "# CI packaging placeholder\n", "utf8");
    console.log("[ghost] Created empty .env for packaging");
  }
}
