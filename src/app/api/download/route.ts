import { existsSync } from "node:fs";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import {
  getExternalDownloadUrl,
  MAC_DOWNLOAD_FILENAME,
  RELEASE_PAGE_URL,
  WINDOWS_DOWNLOAD_FILENAME,
} from "@/lib/download";
import { resolveGitHubAssetUrl } from "@/lib/github-release";
import type { DownloadPlatform } from "@/lib/platform";

function parsePlatform(value: string | null): DownloadPlatform {
  return value === "windows" ? "windows" : "mac";
}

const LOCAL_CANDIDATES: Record<DownloadPlatform, string[]> = {
  mac: [MAC_DOWNLOAD_FILENAME, "Ghost-0.1.0-arm64.dmg"],
  windows: [WINDOWS_DOWNLOAD_FILENAME, "Ghost-Setup.exe", "Ghost-Windows.zip"],
};

function findLocalInstaller(
  platform: DownloadPlatform,
): { filename: string; filePath: string } | null {
  for (const filename of LOCAL_CANDIDATES[platform]) {
    const filePath = path.join(process.cwd(), "public", "downloads", filename);
    if (existsSync(filePath)) return { filename, filePath };
  }
  return null;
}

export async function GET(request: NextRequest) {
  const platform = parsePlatform(request.nextUrl.searchParams.get("platform"));
  const fallbackFilename =
    platform === "windows" ? WINDOWS_DOWNLOAD_FILENAME : MAC_DOWNLOAD_FILENAME;
  const fallbackUrl = getExternalDownloadUrl(platform);

  const local = findLocalInstaller(platform);
  if (local) {
    const localUrl = new URL(
      `/downloads/${local.filename}`,
      request.url,
    );
    const response = NextResponse.redirect(localUrl, 302);
    response.headers.set(
      "Content-Disposition",
      `attachment; filename="${local.filename}"`,
    );
    return response;
  }

  if (process.env.NODE_ENV === "development") {
    return NextResponse.json(
      {
        error: "Installer not found locally",
        hint: "Run npm run desktop:package && npm run sync-downloads at the repo root.",
        platform,
        filename: fallbackFilename,
        releasePage: RELEASE_PAGE_URL,
        fallbackUrl,
      },
      { status: 404 },
    );
  }

  const githubAsset = await resolveGitHubAssetUrl(platform);
  const redirectUrl = githubAsset?.url ?? fallbackUrl;
  const filename = githubAsset?.filename ?? fallbackFilename;

  const response = NextResponse.redirect(redirectUrl, 302);
  response.headers.set("Content-Disposition", `attachment; filename="${filename}"`);
  response.headers.set("Cache-Control", "public, max-age=300");
  return response;
}

export async function HEAD(request: NextRequest) {
  return GET(request);
}
