import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { signMacApp } from "./sign-mac-app.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const desktopRoot = path.join(__dirname, "..");
const repliiDevDir = path.join(desktopRoot, ".replii-dev");
const repliiApp = path.join(repliiDevDir, "Replii.app");
const repliiExec = path.join(repliiApp, "Contents", "MacOS", "Electron");

const env = { ...process.env };
// Cursor sets this and breaks Electron's main-process APIs.
delete env.ELECTRON_RUN_AS_NODE;

if (process.platform === "darwin" && existsSync(repliiExec)) {
  signMacApp(repliiApp);
  env.ELECTRON_EXEC_PATH = repliiExec;
  env.ELECTRON_OVERRIDE_DIST_PATH = repliiDevDir;
  console.log("[replii] Using branded Replii app for mic permissions:", repliiExec);
} else if (process.platform === "darwin") {
  console.warn("[replii] Branded app missing — run: node scripts/prepare-dev-app.mjs");
}

const child = spawn("electron-vite", ["dev"], {
  cwd: desktopRoot,
  stdio: "inherit",
  env,
  shell: true,
});

child.on("exit", (code) => process.exit(code ?? 0));
