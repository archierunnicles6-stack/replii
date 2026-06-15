import { spawn, execSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { signMacApp } from "./sign-mac-app.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const desktopRoot = path.join(__dirname, "..");
const installedApp = "/Applications/Ghost.app";
const devApp = path.join(desktopRoot, ".ghost-dev", "Ghost.app");

const useDev = process.argv.includes("--dev");
const appPath = useDev ? devApp : installedApp;

if (!existsSync(appPath)) {
  if (useDev) {
    console.error("[ghost] Run npm run dev first to build .ghost-dev/Ghost.app");
  } else {
    console.error("[ghost] Install Ghost first: npm run package && cp -R release/mac-arm64/Ghost.app /Applications/");
  }
  process.exit(1);
}

// Dev Electron shares the Ghost name and can conflict with the installed build.
try {
  execSync('pkill -f "desktop/.ghost-dev/Ghost" 2>/dev/null || pkill -f "desktop/.ghost-dev/Electron" 2>/dev/null || true', {
    stdio: "ignore",
    shell: true,
  });
} catch {
  // ignore
}

if (!useDev) {
  signMacApp(appPath);
}

spawn("open", ["-a", appPath], { stdio: "inherit" });

console.log(
  useDev
    ? "[ghost] Opened dev Ghost — grant permissions to Ghost (dev) in System Settings."
    : "[ghost] Opened /Applications/Ghost.app — grant permissions to Ghost in System Settings.",
);
