import {
  ANNUAL_DISCOUNT_PERCENT,
  formatPrice,
  PAID_PLAN_PRICING,
} from "@/lib/pricing";

const proPricing = PAID_PLAN_PRICING.pro;
const proAnnualMonthly = formatPrice(proPricing.annualYearly / 12);
const proAnnualYearly = formatPrice(proPricing.annualYearly);
const proMonthly = formatPrice(proPricing.monthly);

export const PRICING_FAQS = [
  {
    q: "What's included in the free Starter plan?",
    a: "Starter includes limited AI responses, unlimited real-time meeting notetaking, custom instructions with file uploads, and the ability to ask AI about your past meetings. No credit card required.",
  },
  {
    q: "What's included in Pro?",
    a: "Pro includes unlimited AI responses, access to the latest AI models, priority support, and undetectability on screen share so your overlay stays hidden during calls.",
  },
  {
    q: "How does annual billing work?",
    a: `Pay annually and get Pro for ${proAnnualMonthly}/month (billed as ${proAnnualYearly}/year). That's ${ANNUAL_DISCOUNT_PERCENT}% off the ${proMonthly}/month price. Choose monthly or annual billing when you subscribe in the Ghost desktop app.`,
  },
  {
    q: "Can I upgrade or downgrade my plan?",
    a: "Yes. Upgrade to Pro anytime from the Ghost desktop app (Settings → Billing or during onboarding). Subscriptions cannot be purchased on the website. If you downgrade, you'll keep Pro access until the end of your current billing period, then move back to Starter.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept all major credit and debit cards through Stripe. Enterprise customers can also pay by invoice with NET-30 terms.",
  },
  {
    q: "What's included in Enterprise?",
    a: "Enterprise adds post-call coaching analytics, a RAG knowledge base, user provisioning with role-based access, SSO and IDP integration, and enterprise-grade security with a no-training data policy.",
  },
  {
    q: "Do you offer refunds?",
    a: "If you're not satisfied within the first 14 days of a Pro subscription, contact us at support@ghost.ai and we'll issue a full refund — no questions asked.",
  },
] as const;
