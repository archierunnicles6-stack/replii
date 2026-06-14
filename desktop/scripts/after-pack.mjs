import path from "node:path";
import { signMacApp } from "./sign-mac-app.mjs";

export default async function afterPack(context) {
  if (context.electronPlatformName !== "darwin") return;

  const appName = `${context.packager.appInfo.productFilename}.app`;
  const appPath = path.join(context.appOutDir, appName);
  signMacApp(appPath);
}
