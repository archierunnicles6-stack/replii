import type { DownloadPlatform } from "./platform";

/** GitHub Release assets — hosted outside Vercel (installers exceed deploy size limits). */
export const DOWNLOAD_RELEASE_TAG = "v0.1.0";

export const RELEASE_PAGE_URL =
  "https://github.com/archierunnicles6-stack/ghost/releases/latest";

export const MAC_DOWNLOAD_GITHUB_URL = `https://github.com/archierunnicles6-stack/ghost/releases/download/${DOWNLOAD_RELEASE_TAG}/Ghost.dmg`;
export const WINDOWS_DOWNLOAD_GITHUB_URL = `https://github.com/archierunnicles6-stack/ghost/releases/download/${DOWNLOAD_RELEASE_TAG}/Ghost-Windows.zip`;

export const MAC_DOWNLOAD_FILENAME = "Ghost.dmg";
export const WINDOWS_DOWNLOAD_FILENAME = "Ghost-Windows.zip";

/** @deprecated Use DOWNLOAD_RELEASE_TAG */
export const MAC_DOWNLOAD_RELEASE_TAG = DOWNLOAD_RELEASE_TAG;

/** Direct asset URL (GitHub release or local dev file). */
export function getDownloadAssetUrl(platform: DownloadPlatform): string {
  if (platform === "windows") {
    return (
      process.env.NEXT_PUBLIC_WINDOWS_DOWNLOAD_URL?.trim() ||
      (process.env.NODE_ENV === "development"
        ? `/downloads/${WINDOWS_DOWNLOAD_FILENAME}`
        : WINDOWS_DOWNLOAD_GITHUB_URL)
    );
  }

  return (
    process.env.NEXT_PUBLIC_MAC_DOWNLOAD_URL?.trim() ||
    (process.env.NODE_ENV === "development"
      ? `/downloads/${MAC_DOWNLOAD_FILENAME}`
      : MAC_DOWNLOAD_GITHUB_URL)
  );
}

/** User-facing download href — site API redirects to local file (dev) or GitHub release (prod). */
export function getDownloadHref(platform: DownloadPlatform): string {
  return `/api/download?platform=${platform}`;
}

export function getDownloadInfo(platform: DownloadPlatform) {
  if (platform === "windows") {
    return {
      platform,
      url: getDownloadHref(platform),
      assetUrl: getDownloadAssetUrl(platform),
      filename: WINDOWS_DOWNLOAD_FILENAME,
      label: "Get for Windows",
      longLabel: "Download Ghost for Windows",
    } as const;
  }

  return {
    platform,
    url: getDownloadHref(platform),
    assetUrl: getDownloadAssetUrl(platform),
    filename: MAC_DOWNLOAD_FILENAME,
    label: "Get for Mac",
    longLabel: "Download Ghost for Mac",
  } as const;
}
