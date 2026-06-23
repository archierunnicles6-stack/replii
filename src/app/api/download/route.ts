import { createReadStream, existsSync, statSync } from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";
import { NextRequest, NextResponse } from "next/server";
import {
  getExternalDownloadUrl,
  getLocalDownloadPath,
  MAC_DOWNLOAD_FILENAME,
  RELEASE_PAGE_URL,
  WINDOWS_DOWNLOAD_FILENAME,
} from "@/lib/download";
import { resolveGitHubAssetUrl } from "@/lib/github-release";
import type { DownloadPlatform } from "@/lib/platform";
import { APP_VERSION } from "@/lib/version";

function parsePlatform(value: string | null): DownloadPlatform {
  return value === "windows" ? "windows" : "mac";
}

const LOCAL_CANDIDATES: Record<DownloadPlatform, string[]> = {
  mac: [MAC_DOWNLOAD_FILENAME, `Replii-${APP_VERSION}-arm64.dmg`],
  windows: [WINDOWS_DOWNLOAD_FILENAME],
};

const CONTENT_TYPES: Record<string, string> = {
  ".dmg": "application/x-apple-diskimage",
  ".exe": "application/vnd.microsoft.portable-executable",
  ".zip": "application/zip",
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

function serveLocalFile(
  local: { filename: string; filePath: string },
): NextResponse {
  const ext = path.extname(local.filename).toLowerCase();
  const contentType = CONTENT_TYPES[ext] ?? "application/octet-stream";
  const size = statSync(local.filePath).size;
  const stream = createReadStream(local.filePath);
  const body = Readable.toWeb(stream) as ReadableStream;

  return new NextResponse(body, {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${local.filename}"`,
      "Content-Length": String(size),
      "Cache-Control": "private, max-age=3600",
    },
  });
}

export async function GET(request: NextRequest) {
  const platform = parsePlatform(request.nextUrl.searchParams.get("platform"));
  const fallbackFilename =
    platform === "windows" ? WINDOWS_DOWNLOAD_FILENAME : MAC_DOWNLOAD_FILENAME;
  const fallbackUrl = getExternalDownloadUrl(platform);

  const githubAsset = await resolveGitHubAssetUrl(platform);
  if (githubAsset) {
    const response = NextResponse.redirect(githubAsset.url, 302);
    response.headers.set(
      "Content-Disposition",
      `attachment; filename="${githubAsset.filename}"`,
    );
    response.headers.set("Cache-Control", "public, max-age=300");
    return response;
  }

  const local = findLocalInstaller(platform);
  if (local) {
    if (process.env.NODE_ENV === "development") {
      return serveLocalFile(local);
    }

    const response = NextResponse.redirect(
      new URL(getLocalDownloadPath(platform), request.url),
      302,
    );
    response.headers.set(
      "Content-Disposition",
      `attachment; filename="${local.filename}"`,
    );
    response.headers.set("Cache-Control", "public, max-age=3600");
    return response;
  }

  if (process.env.NODE_ENV === "development") {
    return NextResponse.json(
      {
        error: "Installer not found locally",
        hint: "Run npm run desktop:package (Mac) or npm run desktop:package:win (Windows), then npm run sync-downloads at the repo root.",
        platform,
        filename: fallbackFilename,
        releasePage: RELEASE_PAGE_URL,
        fallbackUrl,
      },
      { status: 404 },
    );
  }

  const response = NextResponse.redirect(fallbackUrl, 302);
  response.headers.set(
    "Content-Disposition",
    `attachment; filename="${fallbackFilename}"`,
  );
  response.headers.set("Cache-Control", "public, max-age=300");
  return response;
}

export async function HEAD(request: NextRequest) {
  return GET(request);
}
