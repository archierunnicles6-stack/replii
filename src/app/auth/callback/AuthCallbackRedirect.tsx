"use client";

import { useEffect, useState } from "react";

/** Forward Supabase OAuth params from the browser to the Ghost desktop app. */
export function AuthCallbackRedirect() {
  const [opened, setOpened] = useState(false);
  const [deepLink, setDeepLink] = useState<string | null>(null);

  useEffect(() => {
    const query = window.location.search;
    const hash = window.location.hash;
    setDeepLink(`ghost://auth/callback${query}${hash}`);
  }, []);

  useEffect(() => {
    if (!deepLink) return;
    const timer = window.setTimeout(() => {
      window.location.replace(deepLink);
      setOpened(true);
    }, 100);
    return () => window.clearTimeout(timer);
  }, [deepLink]);

  if (!deepLink) return null;

  return (
    <div className="mt-8 w-full max-w-sm">
      <a
        href={deepLink}
        className="inline-flex h-11 w-full items-center justify-center rounded-full bg-zinc-900 text-[15px] font-medium text-white transition-opacity hover:opacity-90"
      >
        Open Ghost
      </a>
      {opened ? (
        <p className="mt-4 text-[13px] leading-relaxed text-zinc-500">
          If Ghost did not open automatically, click the button above or switch back to the
          Ghost app in your dock.
        </p>
      ) : null}
    </div>
  );
}
