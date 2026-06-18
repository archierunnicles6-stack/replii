"use client";

import { useEffect, useState } from "react";
import { detectDownloadPlatform, type DownloadPlatform } from "@/lib/platform";

export function useDownloadPlatform(): DownloadPlatform {
  const [platform, setPlatform] = useState<DownloadPlatform>("mac");

  useEffect(() => {
    setPlatform(detectDownloadPlatform());
  }, []);

  return platform;
}
