import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const desktopRoot = path.join(__dirname, "..");
const ghostDevDir = path.join(desktopRoot, ".ghost-dev");
const ghostExec = path.join(ghostDevDir, "Electron.app", "Contents", "MacOS", "Electron");

const env = { ...process.env };

if (process.platform === "darwin" && existsSync(ghostExec)) {
  env.ELECTRON_EXEC_PATH = ghostExec;
  env.ELECTRON_OVERRIDE_DIST_PATH = ghostDevDir;
  console.log("[ghost] Using branded Ghost app for mic permissions:", ghostExec);
} else if (process.platform === "darwin") {
  console.warn("[ghost] Branded app missing — run: node scripts/prepare-dev-app.mjs");
}

const child = spawn("electron-vite", ["dev"], {
  cwd: desktopRoot,
  stdio: "inherit",
  env,
  shell: true,
});

child.on("exit", (code) => process.exit(code ?? 0));
