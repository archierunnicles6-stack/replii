import type { NavigateFunction } from "react-router-dom";
import { syncBillingState } from "../services/billing";
import { useAppStore } from "../store/useAppStore";

export type PurchaseReturnTo = "dashboard" | "billing";

export function billingDeepLink(
  plan: string,
  returnTo: PurchaseReturnTo = "dashboard",
): string {
  const params = new URLSearchParams({ plan, to: returnTo });
  return `ghost://billing/success?${params}`;
}

export function billingPortalDeepLink(
  returnTo: PurchaseReturnTo = "billing",
): string {
  const params = new URLSearchParams({ to: returnTo });
  return `ghost://billing/success?${params}`;
}

export function parseBillingCallbackUrl(url: string): {
  plan: string | null;
  returnTo: PurchaseReturnTo;
} {
  try {
    const parsed = new URL(url.replace(/^ghost:/, "https:"));
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
