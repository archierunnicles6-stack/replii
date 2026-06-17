"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { detectDownloadPlatform, type DownloadPlatform } from "@/lib/platform";

function platformFromQuery(value: string | null): DownloadPlatform | null {
  if (value === "windows" || value === "mac") return value;
  return null;
}

export function useDownloadPlatform(): DownloadPlatform {
  const searchParams = useSearchParams();
  const queryOverride = platformFromQuery(searchParams.get("platform"));
  const [platform, setPlatform] = useState<DownloadPlatform>(
    queryOverride ?? "mac",
  );

  useEffect(() => {
    if (queryOverride) {
      setPlatform(queryOverride);
      return;
    }
    setPlatform(detectDownloadPlatform());
  }, [queryOverride]);

  return platform;
}
