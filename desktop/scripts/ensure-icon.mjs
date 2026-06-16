import { execSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const desktopRoot = path.join(__dirname, "..");
const buildDir = path.join(desktopRoot, "build");
const iconPng = path.join(buildDir, "icon.png");

if (existsSync(iconPng)) {
  console.log("[ghost] Using existing build/icon.png");
  process.exit(0);
}

mkdirSync(buildDir, { recursive: true });

// Minimal 1×1 PNG, scaled up with sips (no Python/Pillow required).
const tinyPng = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "base64",
);
writeFileSync(iconPng, tinyPng);

try {
  execSync(`sips -z 1024 1024 "${iconPng}" --out "${iconPng}"`, { stdio: "ignore" });
  console.log("[ghost] Created placeholder build/icon.png");
} catch {
  console.warn("[ghost] Could not scale icon — using 1×1 placeholder");
}
