import type { DownloadPlatform } from "./platform";

/** GitHub Release tag when CI publishes installers. */
export const DOWNLOAD_RELEASE_TAG = "v0.1.0";

/** Primary production host for static installers and billing API. */
export const VERCEL_APP_ORIGIN =
  process.env.NEXT_PUBLIC_APP_URL?.trim() ||
  "https://ghost-eight-virid.vercel.app";

export const RELEASE_PAGE_URL =
  "https://github.com/archierunnicles6-stack/replii/releases/latest";

export const MAC_DOWNLOAD_GITHUB_URL =
  process.env.NEXT_PUBLIC_MAC_DOWNLOAD_URL?.trim() ||
  "https://github.com/archierunnicles6-stack/replii/releases/latest/download/Replii.dmg";

export const WINDOWS_DOWNLOAD_GITHUB_URL =
  process.env.NEXT_PUBLIC_WINDOWS_DOWNLOAD_URL?.trim() ||
  "https://github.com/archierunnicles6-stack/replii/releases/latest/download/Replii-Windows.zip";

export const MAC_DOWNLOAD_FILENAME = "Replii.dmg";
/** Windows portable build until NSIS installer is published. */
export const WINDOWS_DOWNLOAD_FILENAME = "Replii-Windows.zip";

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

function isVercelHost(host: string): boolean {
  return (
    host.endsWith(".vercel.app") ||
    host === new URL(VERCEL_APP_ORIGIN).hostname
  );
}

/** Hosts that proxy marketing pages but block /api/* (Apache ModSecurity). */
function isLegacyMarketingHost(host: string): boolean {
  return (
    host === "replii.ai" ||
    host === "www.replii.ai" ||
    host === "ghost.ai" ||
    host === "www.ghost.ai"
  );
}

/** Pick the best download URL in the browser (handles broken legacy hosts). */
export function resolveDownloadHref(platform: DownloadPlatform): string {
  if (typeof window === "undefined") {
    return getDownloadHref(platform);
  }

  const host = window.location.hostname;
  const isLocal = host === "localhost" || host === "127.0.0.1";

  if (isLegacyMarketingHost(host)) {
    return getExternalDownloadUrl(platform);
  }

  if (isLocal || isVercelHost(host)) {
    return getDownloadHref(platform);
  }

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
