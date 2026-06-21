import { REPLII_PRODUCTION_ORIGIN } from "./replii-urls";

export const DEFAULT_API_BASE = REPLII_PRODUCTION_ORIGIN;

let cachedApiBase: string | null = null;
let bootstrapPromise: Promise<string> | null = null;

function readBuiltInApiBase(): string | undefined {
  const raw = import.meta.env.VITE_API_BASE_URL?.trim().replace(/\/$/, "");
  if (!raw) return undefined;
  if (raw.includes("localhost") || raw.includes("127.0.0.1")) return undefined;
  return raw;
}

export function getApiBaseSync(): string {
  return cachedApiBase ?? readBuiltInApiBase() ?? DEFAULT_API_BASE;
}

export async function resolveApiBase(): Promise<string> {
  if (cachedApiBase) return cachedApiBase;

  const builtIn = readBuiltInApiBase();
  if (builtIn) {
    cachedApiBase = builtIn;
    return cachedApiBase;
  }

  if (!bootstrapPromise) {
    bootstrapPromise = window.replii
      ?.getApiBaseUrl?.()
      .then((url) => {
        const trimmed = url?.trim().replace(/\/$/, "");
        cachedApiBase = trimmed || DEFAULT_API_BASE;
        return cachedApiBase;
      })
      .catch(() => DEFAULT_API_BASE)
      .finally(() => {
        bootstrapPromise = null;
      }) ?? Promise.resolve(DEFAULT_API_BASE);
  }

  return bootstrapPromise;
}
