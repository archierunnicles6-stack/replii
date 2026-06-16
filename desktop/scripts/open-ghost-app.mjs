import { spawn, execSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { signMacApp } from "./sign-mac-app.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const desktopRoot = path.join(__dirname, "..");
const installedApp = "/Applications/Ghost.app";
const devApp = path.join(desktopRoot, ".ghost-dev", "Ghost.app");
const DEV_BUNDLE_ID = "com.ghost.app.dev";

const useDev = process.argv.includes("--dev");
const appPath = useDev ? devApp : installedApp;

function isDevServerRunning() {
  try {
    execSync("lsof -i :5173 -sTCP:LISTEN", { stdio: "pipe" });
    return true;
  } catch {
    return false;
  }
}

function isDevElectronRunning() {
  try {
    execSync(`pgrep -f "${devApp}/Contents/MacOS/Electron"`, { stdio: "pipe" });
    return true;
  } catch {
    return false;
  }
}

function activateDevApp() {
  execSync(`osascript -e 'tell application id "${DEV_BUNDLE_ID}" to activate'`, {
    stdio: "inherit",
  });
}

function killDevElectron() {
  try {
    execSync(
      'pkill -f "desktop/.ghost-dev/Ghost" 2>/dev/null || pkill -f "desktop/.ghost-dev/Electron" 2>/dev/null || true',
      { stdio: "ignore", shell: true },
    );
  } catch {
    // ignore
  }
}

if (!existsSync(appPath)) {
  if (useDev) {
    console.error("[ghost] Run npm run dev first to build .ghost-dev/Ghost.app");
  } else {
    console.error(
      "[ghost] Install Ghost first: npm run package && cp -R release/mac-arm64/Ghost.app /Applications/",
    );
  }
  process.exit(1);
}

if (useDev) {
  if (isDevServerRunning() && isDevElectronRunning()) {
    activateDevApp();
    console.log("[ghost] Brought dev Ghost to front (dev server already running).");
    process.exit(0);
  }

  if (!isDevServerRunning()) {
    console.log("[ghost] Starting dev server…");
    const env = { ...process.env };
    delete env.ELECTRON_RUN_AS_NODE;
    const child = spawn("npm", ["run", "dev"], {
      cwd: desktopRoot,
      stdio: "inherit",
      env,
      shell: true,
      detached: true,
    });
    child.unref();
    process.exit(0);
  }

  console.error(
    "[ghost] Dev server is running but the app window closed — restart with: npm run dev",
  );
  process.exit(1);
}

// Production: stop dev Electron so it does not conflict with the installed build.
killDevElectron();

signMacApp(appPath);

spawn("open", ["-a", appPath], { stdio: "inherit" });

console.log(
  "[ghost] Opened /Applications/Ghost.app — grant permissions to Ghost in System Settings.",
);
