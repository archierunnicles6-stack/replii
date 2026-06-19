import type { DownloadPlatform } from "./platform";

const GITHUB_REPO = "archierunnicles6-stack/ghost";

/** Preferred asset names per platform (first match wins). */
const ASSET_PREFERENCES: Record<DownloadPlatform, string[]> = {
  mac: ["Ghost.dmg", "Ghost-0.1.0-arm64.dmg", "Ghost-0.1.0.dmg", "Ghost.zip"],
  windows: ["Ghost-Setup.exe", "Ghost-Windows.zip"],
};

type GitHubReleaseAsset = {
  name: string;
  browser_download_url: string;
};

type GitHubRelease = {
  assets?: GitHubReleaseAsset[];
};

let cachedRelease: { fetchedAt: number; assets: GitHubReleaseAsset[] } | null =
  null;

const CACHE_MS = 5 * 60 * 1000;

async function fetchLatestReleaseAssets(): Promise<GitHubReleaseAsset[]> {
  if (cachedRelease && Date.now() - cachedRelease.fetchedAt < CACHE_MS) {
    return cachedRelease.assets;
  }

  const response = await fetch(
    `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`,
    {
      headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": "ghost-download",
      },
      next: { revalidate: 300 },
    },
  );

  if (!response.ok) {
    return cachedRelease?.assets ?? [];
  }

  const release = (await response.json()) as GitHubRelease;
  const assets = release.assets ?? [];
  cachedRelease = { fetchedAt: Date.now(), assets };
  return assets;
}

/** Resolve the best GitHub Release download URL for a platform. */
export async function resolveGitHubAssetUrl(
  platform: DownloadPlatform,
): Promise<{ url: string; filename: string } | null> {
  const assets = await fetchLatestReleaseAssets();
  if (assets.length === 0) return null;

  const preferences = ASSET_PREFERENCES[platform];
  for (const preferred of preferences) {
    const match = assets.find((asset) => asset.name === preferred);
    if (match) {
      return { url: match.browser_download_url, filename: match.name };
    }
  }

  const fallback =
    platform === "windows"
      ? assets.find((asset) => /\.exe$/i.test(asset.name))
      : assets.find((asset) => /\.dmg$/i.test(asset.name));

  if (!fallback) return null;
  return { url: fallback.browser_download_url, filename: fallback.name };
}
