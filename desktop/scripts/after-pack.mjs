import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";

/** Ad-hoc sign + strip quarantine so Gatekeeper doesn't show "app is damaged". */
export default async function afterPack(context) {
  if (context.electronPlatformName !== "darwin") return;

  const appName = `${context.packager.appInfo.productFilename}.app`;
  const appPath = path.join(context.appOutDir, appName);

  if (!existsSync(appPath)) {
    console.warn("[ghost] afterPack: app not found at", appPath);
    return;
  }

  console.log("[ghost] Ad-hoc signing", appPath);
  execSync(`xattr -cr "${appPath}"`, { stdio: "inherit" });

  const frameworks = path.join(
    appPath,
    "Contents/Frameworks/Electron Framework.framework",
  );
  if (existsSync(frameworks)) {
    execSync(`codesign --force --sign - "${frameworks}"`, { stdio: "inherit" });
  }

  const helper = path.join(
    appPath,
    "Contents/Frameworks/Ghost Helper.app",
  );
  if (existsSync(helper)) {
    execSync(`xattr -cr "${helper}"`, { stdio: "inherit" });
    execSync(`codesign --force --sign - "${helper}"`, { stdio: "inherit" });
  }

  execSync(`codesign --force --deep --sign - "${appPath}"`, { stdio: "inherit" });
  execSync(`codesign --verify --deep --strict "${appPath}"`, { stdio: "inherit" });
}
