import { existsSync } from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

/** Strip quarantine + ad-hoc sign so macOS Gatekeeper allows opening unsigned builds. */
export function signMacApp(appPath) {
  if (process.platform !== "darwin" || !existsSync(appPath)) return;

  console.log("[ghost] Signing", appPath);
  execSync(`xattr -cr "${appPath}"`, { stdio: "ignore" });

  const frameworks = path.join(appPath, "Contents/Frameworks/Electron Framework.framework");
  if (existsSync(frameworks)) {
    execSync(`codesign --force --sign - "${frameworks}"`, { stdio: "ignore" });
  }

  for (const name of ["Electron Helper.app", "Ghost Helper.app"]) {
    const helper = path.join(appPath, "Contents/Frameworks", name);
    if (existsSync(helper)) {
      execSync(`xattr -cr "${helper}"`, { stdio: "ignore" });
      execSync(`codesign --force --sign - "${helper}"`, { stdio: "ignore" });
    }
  }

  execSync(`codesign --force --deep --sign - "${appPath}"`, { stdio: "ignore" });
}

if (process.argv[1]?.endsWith("sign-mac-app.mjs")) {
  const appPath = process.argv[2];
  if (!appPath) {
    console.error("Usage: node scripts/sign-mac-app.mjs /path/to/App.app");
    process.exit(1);
  }
  signMacApp(appPath);
}
