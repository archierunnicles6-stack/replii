import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const desktopRoot = path.join(__dirname, "..");

if (process.platform !== "win32") {
  console.error(
    "[replii] Replii-Setup.exe must be built on Windows (NSIS does not run on macOS/Linux).",
  );
  console.error(
    "[replii] Publish via GitHub Actions: push .github/workflows/desktop-release.yml, then run the Desktop Release workflow.",
  );
  process.exit(1);
}

function run(label, command, args, { useShell = false } = {}) {
  console.log(`[replii] ${label}…`);
  const result = spawnSync(command, args, {
    cwd: desktopRoot,
    stdio: "inherit",
    shell: useShell,
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

run("Prepare CI build", "node", ["scripts/prepare-ci-build.mjs"]);
run("Ensure icon", "node", ["scripts/ensure-icon.mjs"]);
run("Build app", "npm", ["run", "build"], { useShell: true });
run("Package Windows installer", "npx", ["electron-builder", "--win"], {
  useShell: true,
});
