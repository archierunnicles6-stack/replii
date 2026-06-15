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
const outDir = path.join(desktopRoot, ".ghost-dev");
const iconScript = path.join(desktopRoot, "scripts/generate-app-icon.py");
const legacyDevApp = path.join(outDir, "Electron.app");
const destApp = path.join(outDir, "Ghost.app");

if (process.platform !== "darwin") {
  process.exit(0);
}

if (existsSync(iconScript)) {
  execSync(`python3 "${iconScript}"`, { stdio: "inherit" });
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

if (existsSync(stampFile) && (existsSync(destApp) || existsSync(legacyDevApp))) {
  ensureDevAppBundle();
  const stamp = readFileSync(stampFile, "utf8");
  if (stamp === electronVersion) {
    if (existsSync(iconScript)) {
      execSync(`python3 "${iconScript}"`, { stdio: "inherit" });
    }
    installAppIcon(destApp);
    writeFileSync(iconStampFile, iconSourceStamp());
    signMacApp(destApp);
    console.log("[ghost] Refreshed Ghost dev app icon at", destApp);
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

setPlist("CFBundleDisplayName", "Ghost");
setPlist("CFBundleName", "Ghost");
setPlist("CFBundleIdentifier", "com.ghost.app.dev");
setPlist("CFBundleIconFile", "electron");
addPlist(
  "NSMicrophoneUsageDescription",
  "string",
  "Ghost needs microphone access to transcribe your voice during sales calls.",
);
addPlist(
  "NSScreenCaptureDescription",
  "string",
  "Ghost uses Screen Recording to capture call audio from Zoom, Meet, or Teams. Ghost does not view or record your screen.",
);

signMacApp(destApp);
installAppIcon(destApp);

writeFileSync(stampFile, electronVersion);
writeFileSync(iconStampFile, iconSourceStamp());
writeFileSync(path.join(outDir, "absolute-path.txt"), outDir);
console.log("[ghost] Prepared Ghost dev app at", destApp);
