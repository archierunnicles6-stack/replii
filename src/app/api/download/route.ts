import { existsSync } from "node:fs";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import {
  getExternalDownloadUrl,
  getLocalDownloadPath,
  MAC_DOWNLOAD_FILENAME,
  RELEASE_PAGE_URL,
  WINDOWS_DOWNLOAD_FILENAME,
} from "@/lib/download";
import type { DownloadPlatform } from "@/lib/platform";

function parsePlatform(value: string | null): DownloadPlatform {
  return value === "windows" ? "windows" : "mac";
}

function localInstallerPath(platform: DownloadPlatform): string | null {
  const filename =
    platform === "windows" ? WINDOWS_DOWNLOAD_FILENAME : MAC_DOWNLOAD_FILENAME;
  const filePath = path.join(process.cwd(), "public", "downloads", filename);
  return existsSync(filePath) ? filePath : null;
}

export async function GET(request: NextRequest) {
  const platform = parsePlatform(request.nextUrl.searchParams.get("platform"));
  const filename =
    platform === "windows" ? WINDOWS_DOWNLOAD_FILENAME : MAC_DOWNLOAD_FILENAME;
  const externalUrl = getExternalDownloadUrl(platform);

  const localFile = localInstallerPath(platform);
  if (localFile) {
    const localUrl = new URL(getLocalDownloadPath(platform), request.url);
    const response = NextResponse.redirect(localUrl, 302);
    response.headers.set(
      "Content-Disposition",
      `attachment; filename="${filename}"`,
    );
    return response;
  }

  if (process.env.NODE_ENV === "development") {
    return NextResponse.json(
      {
        error: "Installer not found locally",
        hint: "Run npm run desktop:package && npm run sync-downloads at the repo root.",
        platform,
        filename,
        releasePage: RELEASE_PAGE_URL,
        fallbackUrl: externalUrl,
      },
      { status: 404 },
    );
  }

  const response = NextResponse.redirect(externalUrl, 302);
  response.headers.set("Cache-Control", "public, max-age=300");
  return response;
}

export async function HEAD(request: NextRequest) {
  return GET(request);
}
