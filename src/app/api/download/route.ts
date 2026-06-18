import { NextRequest, NextResponse } from "next/server";
import {
  getDownloadAssetUrl,
  MAC_DOWNLOAD_FILENAME,
  WINDOWS_DOWNLOAD_FILENAME,
} from "@/lib/download";
import type { DownloadPlatform } from "@/lib/platform";

const RELEASE_PAGE =
  "https://github.com/archierunnicles6-stack/ghost/releases/latest";

function parsePlatform(value: string | null): DownloadPlatform {
  return value === "windows" ? "windows" : "mac";
}

async function assetIsAvailable(url: string): Promise<boolean> {
  try {
    const head = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      cache: "no-store",
    });
    if (head.ok) return true;

    // Some CDNs reject HEAD; a tiny ranged GET still confirms the asset exists.
    const probe = await fetch(url, {
      method: "GET",
      headers: { Range: "bytes=0-0" },
      redirect: "follow",
      cache: "no-store",
    });
    return probe.ok || probe.status === 206;
  } catch {
    return false;
  }
}

async function handleDownload(request: NextRequest) {
  const platform = parsePlatform(request.nextUrl.searchParams.get("platform"));
  const assetUrl = getDownloadAssetUrl(platform);
  const filename =
    platform === "windows" ? WINDOWS_DOWNLOAD_FILENAME : MAC_DOWNLOAD_FILENAME;

  if (assetUrl.startsWith("/")) {
    const localUrl = new URL(assetUrl, request.url);
    const response = NextResponse.redirect(localUrl, 302);
    response.headers.set(
      "Content-Disposition",
      `attachment; filename="${filename}"`,
    );
    return response;
  }

  const available = await assetIsAvailable(assetUrl);
  if (!available) {
    return NextResponse.json(
      {
        error: "Installer not available yet",
        platform,
        filename,
        releasePage: RELEASE_PAGE,
      },
      { status: 404 },
    );
  }

  const response = NextResponse.redirect(assetUrl, 302);
  response.headers.set("Cache-Control", "public, max-age=300");
  return response;
}

export async function GET(request: NextRequest) {
  return handleDownload(request);
}

export async function HEAD(request: NextRequest) {
  return handleDownload(request);
}
