import { copyFileSync, existsSync, mkdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ensureNodePath } from "./ensure-node-path.mjs";

ensureNodePath();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const releaseDir = path.join(root, "desktop", "release");
const destDir = path.join(root, "public", "downloads");

function pickNewest(candidates) {
  let best = null;
  for (const rel of candidates) {
    const full = path.join(releaseDir, rel);
    if (!existsSync(full)) continue;
    const mtime = statSync(full).mtimeMs;
    if (!best || mtime > best.mtime) best = { rel, full, mtime };
  }
  return best?.full ?? null;
}

mkdirSync(destDir, { recursive: true });

const macSrc = pickNewest([
  "Replii.dmg",
  "Replii-0.1.0-arm64.dmg",
  "Replii-0.1.0.dmg",
]);

const winSrc = pickNewest(["Replii-Setup.exe", "Replii-Windows.zip"]);

if (macSrc) {
  copyFileSync(macSrc, path.join(destDir, "Replii.dmg"));
  console.log(`[sync-downloads] Replii.dmg ← ${path.relative(root, macSrc)}`);
} else {
  console.warn("[sync-downloads] No Mac installer found — run: npm run desktop:package");
}

if (winSrc) {
  const destName = winSrc.endsWith(".exe") ? "Replii-Setup.exe" : "Replii-Windows.zip";
  copyFileSync(winSrc, path.join(destDir, destName));
  console.log(`[sync-downloads] ${destName} ← ${path.relative(root, winSrc)}`);
  if (!winSrc.endsWith(".exe")) {
    console.warn(
      "[sync-downloads] Only a portable zip was found — run npm run desktop:package:win for Replii-Setup.exe",
    );
  }
} else {
  console.warn("[sync-downloads] No Windows installer found — run: npm run desktop:package:win");
}
