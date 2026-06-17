export type DownloadPlatform = "mac" | "windows";

/** Detect the visitor's desktop OS for download CTAs. Defaults to Mac during SSR. */
export function detectDownloadPlatform(userAgent?: string): DownloadPlatform {
  const ua = userAgent ?? (typeof navigator !== "undefined" ? navigator.userAgent : "");
  if (/Windows/i.test(ua)) return "windows";
  return "mac";
}
