import type { DownloadPlatform } from "./platform";
import { REPLII_PRODUCTION_ORIGIN } from "./replii-urls";
import { DOWNLOAD_RELEASE_TAG } from "./version";

export { DOWNLOAD_RELEASE_TAG };

/** Primary production host for static installers and billing API. */
export const VERCEL_APP_ORIGIN =
  process.env.NEXT_PUBLIC_APP_URL?.trim() || REPLII_PRODUCTION_ORIGIN;

export const RELEASE_PAGE_URL =
  "https://github.com/archierunnicles6-stack/replii/releases/latest";

export const MAC_DOWNLOAD_GITHUB_URL =
  process.env.NEXT_PUBLIC_MAC_DOWNLOAD_URL?.trim() ||
  "https://github.com/archierunnicles6-stack/replii/releases/latest/download/Replii.dmg";

export const WINDOWS_DOWNLOAD_GITHUB_URL =
  process.env.NEXT_PUBLIC_WINDOWS_DOWNLOAD_URL?.trim() ||
  "https://github.com/archierunnicles6-stack/replii/releases/latest/download/Replii-Setup.exe";

export const MAC_DOWNLOAD_FILENAME = "Replii.dmg";
export const WINDOWS_DOWNLOAD_FILENAME = "Replii-Setup.exe";

/** @deprecated Use DOWNLOAD_RELEASE_TAG */
export const MAC_DOWNLOAD_RELEASE_TAG = DOWNLOAD_RELEASE_TAG;

export function getExternalDownloadUrl(platform: DownloadPlatform): string {
  return platform === "windows" ? WINDOWS_DOWNLOAD_GITHUB_URL : MAC_DOWNLOAD_GITHUB_URL;
}

/** Local dev file path (served from public/downloads after npm run sync-downloads). */
export function getLocalDownloadPath(platform: DownloadPlatform): string {
  return platform === "windows"
    ? `/downloads/${WINDOWS_DOWNLOAD_FILENAME}`
    : `/downloads/${MAC_DOWNLOAD_FILENAME}`;
}

/** Direct asset URL for server-side redirects. */
export function getDownloadAssetUrl(platform: DownloadPlatform): string {
  if (process.env.NODE_ENV === "development") {
    return getLocalDownloadPath(platform);
  }
  return getExternalDownloadUrl(platform);
}

/**
 * User-facing download href.
 * - Local / Vercel: same-origin API (serves local files in dev, redirects to GitHub in prod).
 * - External fallback: direct GitHub when host blocks API routes.
 */
export function getDownloadHref(platform: DownloadPlatform): string {
  return `/api/download?platform=${platform}`;
}

/** Pick the best download URL in the browser. */
export function resolveDownloadHref(platform: DownloadPlatform): string {
  if (process.env.NODE_ENV === "development") {
    if (typeof window === "undefined") return getDownloadHref(platform);
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1") return getDownloadHref(platform);
  }

  // Production: link straight to GitHub Release assets. Safari and Chrome handle
  // this more reliably than /api/download → 302 → GitHub.
  return getExternalDownloadUrl(platform);
}

export function getDownloadInfo(platform: DownloadPlatform) {
  const filename =
    platform === "windows" ? WINDOWS_DOWNLOAD_FILENAME : MAC_DOWNLOAD_FILENAME;
  const externalUrl = getExternalDownloadUrl(platform);

  if (platform === "windows") {
    return {
      platform,
      url: getDownloadHref(platform),
      externalUrl,
      filename,
      label: "Get for Windows",
      longLabel: "Download Replii for Windows",
    } as const;
  }

  return {
    platform,
    url: getDownloadHref(platform),
    externalUrl,
    filename: MAC_DOWNLOAD_FILENAME,
    label: "Get for Mac",
    longLabel: "Download Replii for Mac",
  } as const;
}
