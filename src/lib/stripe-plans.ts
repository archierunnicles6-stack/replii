import {
  stripeProAnnualPriceId,
  stripeProMonthlyPriceId,
} from "@/lib/stripe-ids";

export type StripePlanId = "pro";
export type StripeBillingInterval = "monthly" | "annual";

const PRO_PRICE_IDS = (): string[] =>
  [stripeProMonthlyPriceId(), stripeProAnnualPriceId()].filter(Boolean);

export function stripePriceIdForPlan(
  plan: StripePlanId,
  interval: StripeBillingInterval = "monthly",
): string | undefined {
  const map: Record<StripePlanId, Record<StripeBillingInterval, string>> = {
    pro: {
      monthly: stripeProMonthlyPriceId(),
      annual: stripeProAnnualPriceId(),
    },
  };
  return map[plan][interval] || undefined;
}

export function planFromStripePriceId(priceId: string): StripePlanId | "free" {
  if (PRO_PRICE_IDS().includes(priceId)) return "pro";
  return "free";
}
