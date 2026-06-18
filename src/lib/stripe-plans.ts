export type StripePlanId = "pro";
export type StripeBillingInterval = "monthly" | "annual";

const PRO_PRICE_IDS = () =>
  [process.env.STRIPE_PRICE_PRO, process.env.STRIPE_PRICE_PRO_ANNUAL].filter(
    Boolean,
  ) as string[];

export function stripePriceIdForPlan(
  plan: StripePlanId,
  interval: StripeBillingInterval = "monthly",
): string | undefined {
  const map: Record<StripePlanId, Record<StripeBillingInterval, string | undefined>> = {
    pro: {
      monthly: process.env.STRIPE_PRICE_PRO,
      annual: process.env.STRIPE_PRICE_PRO_ANNUAL,
    },
  };
  return map[plan][interval]?.trim() || undefined;
}

export function planFromStripePriceId(priceId: string): StripePlanId | "free" {
  if (PRO_PRICE_IDS().includes(priceId)) return "pro";
  return "free";
}
