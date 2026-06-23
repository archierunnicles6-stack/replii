import { readFileSync } from "node:fs";
import { copyFileSync, existsSync, mkdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ensureNodePath } from "./ensure-node-path.mjs";

ensureNodePath();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const releaseDir = path.join(root, "desktop", "release");
const destDir = path.join(root, "public", "downloads");
const appVersion = JSON.parse(
  readFileSync(path.join(root, "package.json"), "utf8"),
).version;

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
  `Replii-${appVersion}-arm64.dmg`,
  `Replii-${appVersion}.dmg`,
]);

const winSrc = pickNewest(["Replii-Setup.exe"]);

if (macSrc) {
  copyFileSync(macSrc, path.join(destDir, "Replii.dmg"));
  console.log(`[sync-downloads] Replii.dmg ← ${path.relative(root, macSrc)}`);
} else {
  console.warn("[sync-downloads] No Mac installer found — run: npm run desktop:package");
}

if (winSrc) {
  copyFileSync(winSrc, path.join(destDir, "Replii-Setup.exe"));
  console.log(`[sync-downloads] Replii-Setup.exe ← ${path.relative(root, winSrc)}`);
} else {
  console.warn(
    "[sync-downloads] No Windows installer found — run the Desktop Release GitHub Actions workflow (Windows build)",
  );
}
