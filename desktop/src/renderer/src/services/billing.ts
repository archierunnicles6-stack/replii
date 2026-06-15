import type { Plan } from "../store/types";
import type { PricingTierId } from "../lib/pricing";
import { pricingTierToPlan } from "../lib/pricing";

const PAID: Plan[] = ["pro", "undetectable"];

function apiBase(): string {
  return (import.meta.env.VITE_API_BASE_URL ?? "https://ghost.ai").replace(/\/$/, "");
}

/** Open Stripe Checkout for a paid plan. Returns false if checkout could not start. */
export async function startStripeCheckout(
  plan: Plan,
  userId: string,
  email: string,
): Promise<boolean> {
  if (!PAID.includes(plan)) return false;

  const base = apiBase();
  const res = await fetch(`${base}/api/stripe/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      plan,
      userId,
      email,
      successUrl: `${base}/billing/success?plan=${encodeURIComponent(plan)}`,
      cancelUrl: `${base}/billing/cancel`,
    }),
  });

  if (!res.ok) return false;

  const data = (await res.json()) as { url?: string };
  if (!data.url) return false;

  await window.ghost?.openExternal?.(data.url);
  return true;
}

/** Open Stripe Customer Portal to manage subscription & payment method. */
export async function openStripeBillingPortal(userId: string): Promise<boolean> {
  const base = apiBase();
  const res = await fetch(`${base}/api/stripe/portal`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId,
      returnUrl: `${base}/billing/success`,
    }),
  });

  if (!res.ok) return false;

  const data = (await res.json()) as { url?: string };
  if (!data.url) return false;

  await window.ghost?.openExternal?.(data.url);
  return true;
}

/** Start checkout for a public pricing tier. */
export async function startPricingCheckout(
  tier: PricingTierId,
  userId: string,
  email: string,
): Promise<boolean> {
  return startStripeCheckout(pricingTierToPlan(tier), userId, email);
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
