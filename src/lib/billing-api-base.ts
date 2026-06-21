import { REPLII_MARKETING_ORIGIN, REPLII_PRODUCTION_ORIGIN } from "./replii-urls";

/** Live billing API (Next.js on Vercel). Custom domains may block /api/* — use Vercel origin. */
export const DEFAULT_BILLING_API_BASE = REPLII_PRODUCTION_ORIGIN;

export function resolveBillingOrigin(request: Request): string {
  const requestOrigin = new URL(request.url).origin;
  const configured = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (!configured || configured === REPLII_MARKETING_ORIGIN) {
    return requestOrigin;
  }
  return configured;
}
