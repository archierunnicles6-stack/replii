export type BillingInterval = "monthly" | "annual";

export interface PaidPlanPricing {
  monthly: number;
  /** Total billed once per year on annual plans. */
  annualYearly: number;
}

export const PAID_PLAN_PRICING: Record<"pro", PaidPlanPricing> = {
  pro: { monthly: 20, annualYearly: 167.88 },
};

export const ANNUAL_DISCOUNT_PERCENT = Math.round(
  (1 - PAID_PLAN_PRICING.pro.annualYearly / (PAID_PLAN_PRICING.pro.monthly * 12)) * 100,
);

export function formatPrice(amount: number): string {
  return `$${amount.toFixed(2).replace(/\.00$/, "")}`;
}

export function priceForInterval(
  plan: "pro",
  interval: BillingInterval,
): { current: string; original?: string } {
  const pricing = PAID_PLAN_PRICING[plan];
  if (interval === "annual") {
    return {
      current: formatPrice(pricing.annualYearly / 12),
      original: formatPrice(pricing.monthly),
    };
  }
  return { current: formatPrice(pricing.monthly) };
}
