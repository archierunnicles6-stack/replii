/** GitHub Release asset — hosted outside Vercel (DMG exceeds deploy size limits). */
export const MAC_DOWNLOAD_RELEASE_TAG = "v0.1.0";

export const MAC_DOWNLOAD_GITHUB_URL = `https://github.com/archierunnicles6-stack/ghost/releases/download/${MAC_DOWNLOAD_RELEASE_TAG}/Ghost.dmg`;

/** Local path for dev; production uses GitHub release URL. */
export const MAC_DOWNLOAD_URL =
  process.env.NEXT_PUBLIC_MAC_DOWNLOAD_URL?.trim() ||
  (process.env.NODE_ENV === "development"
    ? "/downloads/Ghost.dmg"
    : MAC_DOWNLOAD_GITHUB_URL);

export const MAC_DOWNLOAD_FILENAME = "Ghost.dmg";
