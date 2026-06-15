import type { Plan } from "../../store/types";

/** Public pricing tiers — single source of truth for paywall & settings. */
export type PricingTierId = "free" | "pro" | "undetectable";

export type BillingInterval = "monthly" | "annual";

export const ANNUAL_DISCOUNT_PERCENT = 45;

export interface PaidPlanPricing {
  monthly: number;
  /** Per-month price when billed annually (after discount). */
  annualMonthly: number;
}

export const PAID_PLAN_PRICING: Record<"pro" | "undetectable", PaidPlanPricing> = {
  pro: { monthly: 19.99, annualMonthly: 11.99 },
  undetectable: { monthly: 79.99, annualMonthly: 43.99 },
};

export function formatPrice(amount: number): string {
  return `$${amount.toFixed(2).replace(/\.00$/, "")}`;
}

export function priceForInterval(
  plan: "pro" | "undetectable",
  interval: BillingInterval,
): { current: string; original?: string } {
  const pricing = PAID_PLAN_PRICING[plan];
  if (interval === "annual") {
    return {
      current: formatPrice(pricing.annualMonthly),
      original: formatPrice(pricing.monthly),
    };
  }
  return { current: formatPrice(pricing.monthly) };
}

export interface PricingTier {
  id: PricingTierId;
  name: string;
  priceLabel: string;
  priceSuffix?: string;
  tagline: string;
  cta: string;
  features: string[];
  includesLabel?: string;
}

export const PRICING_TIERS: PricingTier[] = [
  {
    id: "free",
    name: "Starter",
    priceLabel: "Free",
    tagline: "All essential features.",
    cta: "Continue free",
    features: [
      "Limited AI responses a day",
      "Ask AI about past meetings",
      "Unlimited meeting notetaking",
      "Customize AI instructions",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    priceLabel: "$19.99",
    priceSuffix: "/ month",
    tagline: "Unlimited access.",
    cta: "Subscribe",
    includesLabel: "Everything in Free, and:",
    features: [
      "Unlimited AI responses",
      "Access to newest AI models",
      "Priority chat support",
    ],
  },
  {
    id: "undetectable",
    name: "Pro + Undetectability",
    priceLabel: "$79.99",
    priceSuffix: "/ month",
    tagline: "Undetectable during screen share.",
    cta: "Subscribe",
    includesLabel: "Everything in Pro, and:",
    features: ["Ghost Undetectability — invisible to screen share during meetings"],
  },
];

const PLAN_RANK: Record<Plan, number> = {
  free: 0,
  solo: 1,
  pro: 2,
  undetectable: 3,
};

export function planRank(plan: Plan): number {
  return PLAN_RANK[plan] ?? 0;
}

export function normalizeDisplayPlan(plan: Plan): PricingTierId {
  if (plan === "undetectable") return "undetectable";
  if (plan === "pro" || plan === "solo") return "pro";
  return "free";
}

export function displayPlanLabel(plan: Plan): string {
  const tier = PRICING_TIERS.find((t) => t.id === normalizeDisplayPlan(plan));
  return tier?.name ?? "Starter";
}

export function canUpgradeTo(target: PricingTierId, current: Plan): boolean {
  const targetPlan: Plan = target;
  return planRank(targetPlan) > planRank(current);
}

export function pricingTierToPlan(id: PricingTierId): Plan {
  return id;
}
