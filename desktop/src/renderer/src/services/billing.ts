import type { Plan } from "../store/types";
import type { BillingInterval, PricingTierId } from "../lib/pricing";
import { pricingTierToPlan } from "../lib/pricing";
import { isPaidPlan } from "../store/types";
import { syncPlanLimitsToMain, useAppStore } from "../store/useAppStore";

const PAID: Plan[] = ["pro", "solo", "undetectable"];

function apiBase(): string {
  return (import.meta.env.VITE_API_BASE_URL ?? "https://ghost.ai").replace(/\/$/, "");
}

async function openCheckoutUrl(url: string): Promise<void> {
  if (window.ghost?.openExternal) {
    await window.ghost.openExternal(url);
    return;
  }
  window.open(url, "_blank", "noopener,noreferrer");
}

export type CheckoutResult =
  | { ok: true; url: string }
  | { ok: false; error: string };

/** Open Stripe Checkout for a paid plan. */
export async function startStripeCheckout(
  plan: Plan,
  userId: string,
  email: string,
  interval: BillingInterval = "monthly",
): Promise<CheckoutResult> {
  if (!PAID.includes(plan)) {
    return { ok: false, error: "Invalid plan" };
  }

  const base = apiBase();
  let res: Response;
  try {
    res = await fetch(`${base}/api/stripe/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        plan,
        interval,
        userId,
        email,
        successUrl: `${base}/billing/success?plan=${encodeURIComponent(plan)}`,
        cancelUrl: `${base}/billing/cancel`,
      }),
    });
  } catch {
    const hint =
      base.includes("localhost") || base.includes("127.0.0.1")
        ? " Start the billing API with `npm run dev` at the repo root."
        : " Check your connection and try again.";
    return {
      ok: false,
      error: `Billing server unreachable.${hint}`,
    };
  }

  const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
  if (!res.ok) {
    return {
      ok: false,
      error: data.error ?? "Could not start checkout. Try again.",
    };
  }
  if (!data.url) {
    return { ok: false, error: "Checkout session did not return a URL." };
  }

  await openCheckoutUrl(data.url);
  return { ok: true, url: data.url };
}

export type PortalResult =
  | { ok: true; url: string }
  | { ok: false; error: string };

/** Open Stripe Customer Portal to manage subscription & payment method. */
export async function openStripeBillingPortal(userId: string): Promise<PortalResult> {
  const base = apiBase();
  const res = await fetch(`${base}/api/stripe/portal`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId,
      returnUrl: `${base}/billing/success`,
    }),
  });

  const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
  if (!res.ok) {
    return {
      ok: false,
      error: data.error ?? "Could not open billing portal. Try again.",
    };
  }
  if (!data.url) {
    return { ok: false, error: "Billing portal did not return a URL." };
  }

  await openCheckoutUrl(data.url);
  return { ok: true, url: data.url };
}

/** Start checkout for a public pricing tier. */
export async function startPricingCheckout(
  tier: PricingTierId,
  userId: string,
  email: string,
  interval: BillingInterval = "monthly",
): Promise<CheckoutResult> {
  return startStripeCheckout(pricingTierToPlan(tier), userId, email, interval);
}

export async function syncPlanFromProfile(userId: string): Promise<Plan | null> {
  const { getSupabase } = await import("../lib/supabase");
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", userId)
    .maybeSingle();

  if (error || !data?.plan) return null;
  const plan = data.plan as Plan;
  if (plan === "free" || plan === "solo" || plan === "pro" || plan === "undetectable") {
    return plan;
  }
  return null;
}

async function syncPlanFromStripeApi(userId: string): Promise<Plan | null> {
  const base = apiBase();
  const res = await fetch(`${base}/api/stripe/sync`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId }),
  });

  if (!res.ok) return null;

  const data = (await res.json().catch(() => ({}))) as { plan?: string };
  const plan = data.plan as Plan | undefined;
  if (plan === "free" || plan === "solo" || plan === "pro" || plan === "undetectable") {
    return plan;
  }
  return null;
}

/** Read plan from Supabase, falling back to a server-side Stripe sync when needed. */
export async function resolvePlanForUser(userId: string): Promise<Plan | null> {
  const localPlan = await syncPlanFromProfile(userId);
  if (localPlan && localPlan !== "free") return localPlan;
  return (await syncPlanFromStripeApi(userId)) ?? localPlan;
}

/** Pull plan from Supabase and apply it locally (also unlocks dashboard for paid users). */
export async function syncBillingState(userId: string): Promise<Plan | null> {
  const remotePlan = await resolvePlanForUser(userId);
  if (!remotePlan) return null;

  const store = useAppStore.getState();
  store.setPlan(remotePlan);
  if (isPaidPlan(remotePlan) && !store.paywallComplete) {
    store.completePaywall();
  }
  syncPlanLimitsToMain();
  return remotePlan;
}
