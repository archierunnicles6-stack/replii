"use client";

import { Suspense, useState } from "react";
import { getDownloadInfo, RELEASE_PAGE_URL } from "@/lib/download";
import type { DownloadPlatform } from "@/lib/platform";
import { useDownloadPlatform } from "@/hooks/useDownloadPlatform";

const baseClassName =
  "inline-flex items-center justify-center rounded-full bg-[#4A90E2] font-medium text-white shadow-[0_4px_14px_rgba(74,144,226,0.35)] transition-colors hover:bg-[#3B7FD4]";

const sizeClassName = {
  default: "h-11 gap-2.5 px-6 text-[15px]",
  sm: "h-10 gap-2 px-4 text-[13px] sm:px-5 sm:text-[14px]",
};

function AppleIcon() {
  return (
    <svg className="h-[17px] w-[17px]" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  );
}

function WindowsIcon() {
  return (
    <svg className="h-[17px] w-[17px]" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M3 5.5 10.5 4.2v7.1H3V5.5zm0 8.4h7.5v7.3L3 19.5v-5.6zm9-9.3L21 3v8.2h-9V4.6zm0 9.2H21V21l-9-1.4v-6.8z" />
    </svg>
  );
}

type DownloadLinkProps = {
  className?: string;
  size?: "default" | "sm";
  hideIcon?: boolean;
  platform?: DownloadPlatform;
  children?: React.ReactNode;
};

function DownloadLinkContent({
  className,
  size = "default",
  hideIcon = false,
  platform: platformProp,
  children,
}: DownloadLinkProps) {
  const detectedPlatform = useDownloadPlatform();
  const platform = platformProp ?? detectedPlatform;
  const { url, filename, label } = getDownloadInfo(platform);
  const isLocal = url.startsWith("/") && !url.startsWith("/api/");
  const [unavailable, setUnavailable] = useState(false);

  async function handleClick(event: React.MouseEvent<HTMLAnchorElement>) {
    if (!url.startsWith("/api/")) return;

    event.preventDefault();
    setUnavailable(false);

    try {
      const response = await fetch(url, { method: "HEAD", redirect: "manual" });
      if (response.status === 404) {
        setUnavailable(true);
        return;
      }
      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get("location");
        if (location) {
          window.location.href = location;
          return;
        }
      }
      if (response.ok) {
        window.location.href = url;
        return;
      }
      window.open(url, "_blank", "noopener,noreferrer");
    } catch {
      window.location.href = url;
    }
  }

  return (
    <>
      <a
        href={url}
        onClick={handleClick}
        {...(isLocal ? { download: filename } : {})}
        className={className ?? `${baseClassName} ${sizeClassName[size]}`}
      >
        {!hideIcon && (platform === "windows" ? <WindowsIcon /> : <AppleIcon />)}
        {children ?? label}
      </a>
      {unavailable && (
        <p className="mt-2 text-[13px] text-amber-800">
          The Windows installer is being published. Try again in a few minutes or visit{" "}
          <a
            href={RELEASE_PAGE_URL}
            className="font-medium underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub Releases
          </a>
          .
        </p>
      )}
    </>
  );
}

function DownloadLinkFallback({
  className,
  size = "default",
  hideIcon = false,
  platform: platformProp,
  children,
}: DownloadLinkProps) {
  const platform = platformProp ?? "mac";
  const { url, filename, label } = getDownloadInfo(platform);
  const isLocal = url.startsWith("/") && !url.startsWith("/api/");

  return (
    <a
      href={url}
      {...(isLocal ? { download: filename } : {})}
      className={className ?? `${baseClassName} ${sizeClassName[size]}`}
    >
      {!hideIcon && (platform === "windows" ? <WindowsIcon /> : <AppleIcon />)}
      {children ?? label}
    </a>
  );
}

export function DownloadLink(props: DownloadLinkProps) {
  return (
    <Suspense fallback={<DownloadLinkFallback {...props} />}>
      <DownloadLinkContent {...props} />
    </Suspense>
  );
}

/** @deprecated Use DownloadLink */
export const MacDownloadLink = DownloadLink;
