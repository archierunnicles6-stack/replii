import type { Plan } from "../../store/types";

/** Public pricing tiers — single source of truth for paywall & settings. */
export type PricingTierId = "free" | "pro" | "enterprise";

export type BillingInterval = "monthly" | "annual";

export interface PaidPlanPricing {
  monthly: number;
  /** Total billed once per year on annual plans. */
  annualYearly: number;
}

export const PAID_PLAN_PRICING: Record<"pro", PaidPlanPricing> = {
  pro: { monthly: 20, annualYearly: 136.99 },
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

export const STARTER_FEATURES = [
  "Limited AI responses",
  "Unlimited real-time meeting notetaking",
  "Customize instructions & upload files",
  "Ask AI about all your past meetings",
] as const;

export const PRO_FEATURES = [
  "Unlimited AI responses",
  "Unlimited access to latest AI models",
  "Priority support",
  "Undetectable on screen share",
] as const;

export type ProFeatureIcon = "infinity" | "check";

/** Pro plan card — icon mapping for the highlighted billing card. */
export const PRO_CARD_FEATURES: { icon: ProFeatureIcon; label: string }[] = [
  { icon: "infinity", label: "Unlimited AI responses" },
  { icon: "check", label: "Unlimited access to latest AI models" },
  { icon: "check", label: "Priority support" },
  { icon: "check", label: "Undetectable on screen share" },
];

export const ENTERPRISE_SALES_MAILTO =
  "mailto:sales@ghost.app?subject=Ghost%20Enterprise";

export const ENTERPRISE_TAGLINE = "Custom knowledge for teams.";

export const ENTERPRISE_INCLUDES_LABEL = "Everything in Pro, plus...";

export const ENTERPRISE_FEATURES = [
  "Post-call coaching and analytics",
  "RAG knowledge base",
  "User provisioning & role-based access",
  "Single sign-on & IDP integration",
  "Enterprise security & no data training",
] as const;

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
    features: [...STARTER_FEATURES],
  },
  {
    id: "pro",
    name: "Pro",
    priceLabel: "$20",
    priceSuffix: "/ month",
    tagline: "Unlimited access.",
    cta: "Subscribe",
    includesLabel: "Everything in Starter, plus...",
    features: [...PRO_FEATURES],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    priceLabel: "Custom",
    tagline: ENTERPRISE_TAGLINE,
    cta: "Contact Sales",
    includesLabel: ENTERPRISE_INCLUDES_LABEL,
    features: [...ENTERPRISE_FEATURES],
  },
];

const PLAN_RANK: Record<Plan, number> = {
  free: 0,
  solo: 1,
  pro: 2,
  undetectable: 2,
};

export function planRank(plan: Plan): number {
  return PLAN_RANK[plan] ?? 0;
}

export function normalizeDisplayPlan(plan: Plan): PricingTierId {
  if (plan === "pro" || plan === "solo" || plan === "undetectable") return "pro";
  return "free";
}

export function displayPlanLabel(plan: Plan): string {
  const tier = PRICING_TIERS.find((t) => t.id === normalizeDisplayPlan(plan));
  return tier?.name ?? "Starter";
}

export function canUpgradeTo(target: PricingTierId, current: Plan): boolean {
  if (target === "enterprise") return false;
  const targetPlan: Plan = target;
  return planRank(targetPlan) > planRank(current);
}

export function pricingTierToPlan(id: PricingTierId): Plan {
  if (id === "enterprise") return "pro";
  return id;
}
