import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { existsSync, mkdirSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const desktopRoot = path.join(__dirname, "..");
const outDir = path.join(desktopRoot, ".ghost-dev");

if (process.platform !== "darwin") {
  process.exit(0);
}

const require = createRequire(import.meta.url);
const electronDist = path.join(desktopRoot, "node_modules/electron/dist");
const destApp = path.join(outDir, "Electron.app");
const plist = path.join(destApp, "Contents/Info.plist");

const stampFile = path.join(outDir, ".stamp");
const electronVersion = require(path.join(desktopRoot, "node_modules/electron/package.json")).version;

if (existsSync(stampFile) && existsSync(destApp)) {
  const stamp = readFileSync(stampFile, "utf8");
  if (stamp === electronVersion) {
    process.exit(0);
  }
}

if (existsSync(outDir)) rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

// Preserve symlinks inside Electron Framework (cp -a keeps bundle intact).
execSync(`cp -a "${electronDist}/." "${outDir}/"`, { stdio: "inherit" });

const setPlist = (key, value) => {
  execSync(`/usr/libexec/PlistBuddy -c 'Set :${key} "${value}"' "${plist}"`, { stdio: "ignore" });
};

const addPlist = (key, type, value) => {
  const raw = value.replace(/^"|"$/g, "");
  try {
    execSync(`/usr/libexec/PlistBuddy -c 'Add :${key} ${type} "${raw}"' "${plist}"`, {
      stdio: "ignore",
    });
  } catch {
    setPlist(key, raw);
  }
};

setPlist("CFBundleDisplayName", "Ghost");
setPlist("CFBundleName", "Ghost");
setPlist("CFBundleIdentifier", "com.ghost.app.dev");
addPlist(
  "NSMicrophoneUsageDescription",
  "string",
  "Ghost needs microphone access to transcribe your voice during sales calls.",
);
addPlist(
  "NSScreenCaptureDescription",
  "string",
  "Ghost captures call audio from your screen to transcribe meetings.",
);

try {
  execSync(`xattr -cr "${destApp}"`, { stdio: "ignore" });
} catch {
  // ignore
}

writeFileSync(stampFile, electronVersion);
writeFileSync(path.join(outDir, "absolute-path.txt"), outDir);
console.log("[ghost] Prepared Ghost dev app at", destApp);
