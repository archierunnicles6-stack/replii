import { spawnSync } from "node:child_process";
import { cpSync, existsSync, rmSync } from "node:fs";
import path from "node:path";
import { signMacApp } from "../desktop/scripts/sign-mac-app.mjs";
import { ensureNodePath, repoRoot } from "./ensure-node-path.mjs";
import { syncDesktopRenderer } from "./sync-desktop-renderer.mjs";

ensureNodePath();

const desktopRoot = path.join(repoRoot, "desktop");
const installedApp = "/Applications/Replii.app";
const skipPackage = process.argv.includes("--skip-package");
const skipOpen = process.argv.includes("--skip-open");

function run(command, args, { cwd = repoRoot, label = command } = {}) {
  console.log(`[update] ${label}…`);
  const result = spawnSync(command, args, {
    cwd,
    stdio: "inherit",
    env: process.env,
    shell: false,
  });
  if (result.status !== 0) {
    console.error(`[update] Failed: ${label}`);
    process.exit(result.status ?? 1);
  }
}

function runNpm(args, cwd, label) {
  run("npm", args, { cwd, label });
}

function quitReplii() {
  if (process.platform !== "darwin") return;
  spawnSync("osascript", [
    "-e",
    'tell application "Replii" to quit',
  ], { stdio: "ignore" });
  spawnSync("pkill", ["-x", "Replii"], { stdio: "ignore" });
  spawnSync("pkill", ["-f", "Replii.app/Contents/MacOS"], { stdio: "ignore" });
}

function trySign(appPath) {
  try {
    signMacApp(appPath);
  } catch (err) {
    console.warn(
      `[update] Could not re-sign ${appPath} — open it from Finder if macOS blocks launch.`,
    );
    if (err instanceof Error && err.message) {
      console.warn(`[update] ${err.message}`);
    }
  }
}

if (!skipPackage) {
  runNpm(["run", "package:mac"], desktopRoot, "Build Mac installer");
} else {
  runNpm(["run", "build"], desktopRoot, "Build desktop app");
}

run("node", ["scripts/sync-downloads.mjs"], repoRoot, "Sync web download files");
syncDesktopRenderer();

const packagedApp = path.join(desktopRoot, "release", "mac-arm64", "Replii.app");
let appToOpen = packagedApp;

if (process.platform === "darwin" && existsSync(packagedApp)) {
  quitReplii();
  console.log(`[update] Installing ${installedApp}…`);
  if (existsSync(installedApp)) {
    rmSync(installedApp, { recursive: true, force: true });
  }
  const copy = spawnSync("ditto", [packagedApp, installedApp], { stdio: "inherit" });
  if (copy.status === 0) {
    trySign(installedApp);
    appToOpen = installedApp;
    console.log(`[update] Installed ${installedApp}`);
  } else {
    console.warn("[update] Could not install to /Applications — using packaged build instead");
  }
} else if (process.platform === "darwin") {
  console.warn("[update] Packaged Replii.app not found — skipped /Applications install");
}

console.log("[update] Done.");
console.log("  • Web dev downloads: public/downloads/Replii.dmg");
console.log("  • Static renderer:   index.html + assets/");
console.log("  • GitHub release:    push tag v0.1.0 to publish installers");

if (!skipOpen && process.platform === "darwin") {
  if (existsSync(appToOpen)) {
    run("open", ["-a", appToOpen], repoRoot, "Open Replii");
  } else {
    runNpm(["run", "open-app:dev"], desktopRoot, "Open dev Replii app");
  }
}
