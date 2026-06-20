"use client";

import { useCallback, useState } from "react";
import { RELEASE_PAGE_URL } from "@/lib/download";
import type { DownloadPlatform } from "@/lib/platform";

const OPEN_URL = "replii://open";

export function OpenRepliiButton({
  platform,
  className,
}: {
  platform: DownloadPlatform;
  className?: string;
}) {
  const [hint, setHint] = useState<string | null>(null);

  const openApp = useCallback(() => {
    setHint(null);

    if (platform === "windows") {
      setHint("Open Replii from the Start menu or desktop shortcut after installing.");
      return;
    }

    window.location.href = OPEN_URL;

    window.setTimeout(() => {
      setHint(
        "If Replii did not open, run Install Replii.command from the DMG (or npm run local:app), then try again.",
      );
    }, 1500);
  }, [platform]);

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={openApp}
        className={
          className ??
          "inline-flex h-11 items-center justify-center rounded-full border border-zinc-200 bg-white px-6 text-[14px] font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
        }
      >
        Open Replii app
      </button>
      {hint ? (
        <p className="text-[13px] leading-relaxed text-zinc-500">
          {hint}{" "}
          <a
            href={RELEASE_PAGE_URL}
            className="font-medium text-zinc-600 underline decoration-zinc-300 hover:text-zinc-800"
            target="_blank"
            rel="noopener noreferrer"
          >
            Get the installer
          </a>
        </p>
      ) : null}
    </div>
  );
}
