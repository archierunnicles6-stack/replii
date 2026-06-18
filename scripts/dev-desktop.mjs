import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const require = createRequire(import.meta.url);
const npmExecPath = process.env.npm_execpath ?? require.resolve("npm/bin/npm-cli.js");

const children = [];
let shuttingDown = false;

function spawnNpm(args, { cwd = root, name } = {}) {
  const child = spawn(process.execPath, [npmExecPath, ...args], {
    cwd,
    stdio: "inherit",
    env: process.env,
  });
  children.push({ child, name });
  child.on("exit", (code, signal) => {
    if (shuttingDown) return;
    shuttingDown = true;
    console.error(`[dev-desktop] ${name} exited (${signal ?? code ?? 0})`);
    shutdown(code ?? 1);
  });
  return child;
}

function shutdown(code = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const { child } of children) {
    if (!child.killed) child.kill("SIGTERM");
  }
  setTimeout(() => process.exit(code), 250);
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));

async function waitForBillingApi(maxMs = 60_000) {
  const url = "http://localhost:3000/api/stripe/status";
  const started = Date.now();
  while (Date.now() - started < maxMs) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.checkoutReady) {
          console.log("[dev-desktop] Billing API ready on http://localhost:3000");
          return;
        }
        console.warn("[dev-desktop] Billing API up but Stripe checkout is not fully configured.");
        return;
      }
    } catch {
      // server still starting
    }
    await new Promise((r) => setTimeout(r, 400));
  }
  console.warn(
    "[dev-desktop] Billing API did not become ready in time — checkout may fail until `npm run dev` is running.",
  );
}

console.log("[dev-desktop] Starting Next.js billing API…");
spawnNpm(["run", "dev"], { name: "next" });

await waitForBillingApi();

console.log("[dev-desktop] Starting desktop app…");
spawnNpm(["run", "dev"], { cwd: path.join(root, "desktop"), name: "desktop" });
