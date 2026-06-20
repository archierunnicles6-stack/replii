import type { NavigateFunction } from "react-router-dom";
import { syncBillingState } from "../services/billing";
import { useAppStore } from "../store/useAppStore";

export type PurchaseReturnTo = "dashboard" | "billing";

/** HTTPS URL Stripe redirects to after checkout; opens the desktop app via /billing/success. */
export function billingSuccessWebUrl(
  apiBase: string,
  plan: string,
  returnTo: PurchaseReturnTo = "dashboard",
): string {
  const base = apiBase.replace(/\/$/, "");
  const params = new URLSearchParams({ plan, to: returnTo });
  return `${base}/billing/success?${params}`;
}

/** HTTPS URL Stripe redirects to after the billing portal. */
export function billingPortalReturnWebUrl(
  apiBase: string,
  returnTo: PurchaseReturnTo = "billing",
): string {
  const base = apiBase.replace(/\/$/, "");
  const params = new URLSearchParams({ to: returnTo });
  return `${base}/billing/success?${params}`;
}

export function billingDeepLink(
  plan: string,
  returnTo: PurchaseReturnTo = "dashboard",
): string {
  const params = new URLSearchParams({ plan, to: returnTo });
  return `replii://billing/success?${params}`;
}

export function billingPortalDeepLink(
  returnTo: PurchaseReturnTo = "billing",
): string {
  const params = new URLSearchParams({ to: returnTo });
  return `replii://billing/success?${params}`;
}

export function parseBillingCallbackUrl(url: string): {
  plan: string | null;
  returnTo: PurchaseReturnTo;
} {
  try {
    const parsed = new URL(url.replace(/^replii:/, "https:"));
    return {
      plan: parsed.searchParams.get("plan"),
      returnTo:
        parsed.searchParams.get("to") === "billing" ? "billing" : "dashboard",
    };
  } catch {
    return { plan: null, returnTo: "dashboard" };
  }
}

/** Sync plan after Stripe checkout and route back into the app. */
export async function completePurchaseReturn(
  userId: string,
  returnTo: PurchaseReturnTo,
  navigate: NavigateFunction,
): Promise<void> {
  await syncBillingState(userId);

  navigate("/", { replace: true });

  if (returnTo === "billing") {
    useAppStore.getState().requestSettingsOpen("billing");
  }
}
