import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const desktopRoot = path.join(__dirname, "..");
const ghostApp = path.join(desktopRoot, ".ghost-dev", "Electron.app");

if (!existsSync(ghostApp)) {
  console.error("[ghost] Run npm run dev first to build .ghost-dev/Electron.app");
  process.exit(1);
}

spawn("open", ["-a", ghostApp], { stdio: "inherit" });

console.log("[ghost] Opened Ghost.app — macOS should now list Ghost under Privacy → Microphone after you allow access.");
