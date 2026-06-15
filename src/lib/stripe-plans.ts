export type StripePlanId = "pro" | "undetectable";

export function stripePriceIdForPlan(plan: StripePlanId): string | undefined {
  const map: Record<StripePlanId, string | undefined> = {
    pro: process.env.STRIPE_PRICE_PRO,
    undetectable: process.env.STRIPE_PRICE_UNDETECTABLE,
  };
  return map[plan]?.trim() || undefined;
}

export function planFromStripePriceId(priceId: string): StripePlanId | "free" {
  if (priceId === process.env.STRIPE_PRICE_PRO) return "pro";
  if (priceId === process.env.STRIPE_PRICE_UNDETECTABLE) return "undetectable";
  return "free";
}
