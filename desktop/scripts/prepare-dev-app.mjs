import { readFileSync, writeFileSync, statSync } from "node:fs";
import { createRequire } from "node:module";
import { existsSync, mkdirSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";
import { installAppIcon } from "./build-icns.mjs";
import { signMacApp } from "./sign-mac-app.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const desktopRoot = path.join(__dirname, "..");
const outDir = path.join(desktopRoot, ".replii-dev");
const iconScript = path.join(desktopRoot, "scripts/generate-app-icon.py");
const legacyDevApp = path.join(outDir, "Electron.app");
const destApp = path.join(outDir, "Replii.app");

if (process.platform !== "darwin") {
  process.exit(0);
}

function tryGenerateIcons() {
  const iconSource = path.join(desktopRoot, "build/icon-source.png");
  const iconPng = path.join(desktopRoot, "build/icon.png");
  if (!existsSync(iconScript)) return;
  if (!existsSync(iconSource) && !existsSync(iconPng)) {
    console.warn("[replii] Skipping icon generation — add desktop/build/icon-source.png");
    return;
  }
  try {
    execSync(`python3 "${iconScript}"`, { stdio: "inherit" });
  } catch {
    console.warn("[replii] Icon generation skipped (install Xcode CLT + Pillow for icons)");
  }
}

const require = createRequire(import.meta.url);
const electronDist = path.join(desktopRoot, "node_modules/electron/dist");
const plist = () => path.join(destApp, "Contents/Info.plist");

const stampFile = path.join(outDir, ".stamp");
const iconStampFile = path.join(outDir, ".icon-stamp");
const electronVersion = require(path.join(desktopRoot, "node_modules/electron/package.json")).version;

function iconSourceStamp() {
  const iconSource = path.join(desktopRoot, "build/icon-source.png");
  const iconPng = path.join(desktopRoot, "build/icon.png");
  const target = existsSync(iconSource) ? iconSource : iconPng;
  if (!existsSync(target)) return "missing";
  const { mtimeMs, size } = statSync(target);
  return `${target}:${size}:${mtimeMs}`;
}

function ensureDevAppBundle() {
  if (existsSync(destApp)) return;
  if (existsSync(legacyDevApp)) {
    execSync(`mv "${legacyDevApp}" "${destApp}"`, { stdio: "inherit" });
  }
}

function installDevElectronLauncher() {
  const launcherScript = path.join(__dirname, "install-dev-electron-launcher.sh");
  const electronBin = path.join(destApp, "Contents/MacOS/Electron");
  if (!existsSync(electronBin)) return;
  execSync(`bash "${launcherScript}" "${path.dirname(electronBin)}"`, { stdio: "inherit" });
}

function refreshDevAppBundle() {
  tryGenerateIcons();
  installAppIcon(destApp);
  installDevElectronLauncher();
  writeFileSync(iconStampFile, iconSourceStamp());
  signMacApp(destApp);
}

if (existsSync(stampFile) && (existsSync(destApp) || existsSync(legacyDevApp))) {
  ensureDevAppBundle();
  const stamp = readFileSync(stampFile, "utf8");
  if (stamp === electronVersion) {
    refreshDevAppBundle();
    console.log("[replii] Refreshed Replii dev app at", destApp);
    process.exit(0);
  }
}

if (existsSync(outDir)) rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

execSync(`cp -a "${electronDist}/." "${outDir}/"`, { stdio: "inherit" });
ensureDevAppBundle();

const setPlist = (key, value) => {
  execSync(`/usr/libexec/PlistBuddy -c 'Set :${key} "${value}"' "${plist()}"`, { stdio: "ignore" });
};

const addPlist = (key, type, value) => {
  const raw = value.replace(/^"|"$/g, "");
  try {
    execSync(`/usr/libexec/PlistBuddy -c 'Add :${key} ${type} "${raw}"' "${plist()}"`, {
      stdio: "ignore",
    });
  } catch {
    setPlist(key, raw);
  }
};

setPlist("CFBundleDisplayName", "Replii");
setPlist("CFBundleName", "Replii");
setPlist("CFBundleIdentifier", "com.replii.app.dev");
setPlist("CFBundleIconFile", "electron");
addPlist(
  "NSMicrophoneUsageDescription",
  "string",
  "Replii needs microphone access to transcribe your voice during sales calls.",
);
addPlist(
  "NSScreenCaptureDescription",
  "string",
  "Replii uses Screen Recording to capture call audio from Zoom, Meet, or Teams. Replii does not view or record your screen.",
);

signMacApp(destApp);
installAppIcon(destApp);
installDevElectronLauncher();

writeFileSync(stampFile, electronVersion);
writeFileSync(iconStampFile, iconSourceStamp());
writeFileSync(path.join(outDir, "absolute-path.txt"), outDir);
console.log("[replii] Prepared Replii dev app at", destApp);
