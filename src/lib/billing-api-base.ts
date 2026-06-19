/** Live billing API (Next.js on Vercel). ghost.ai blocks /api/* with ModSecurity. */
export const DEFAULT_BILLING_API_BASE = "https://ghost-eight-virid.vercel.app";

export function resolveBillingOrigin(request: Request): string {
  const requestOrigin = new URL(request.url).origin;
  const configured = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (!configured || configured === "https://ghost.ai") {
    return requestOrigin;
  }
  return configured;
}
