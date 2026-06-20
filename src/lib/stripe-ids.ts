/** Stripe webhook endpoint path (rewrites to /api/stripe/webhook in next.config.ts). */
export const STRIPE_WEBHOOK_PATH = "/api/webhooks/stripe";

/** Events configured on the Stripe webhook endpoint. */
export const STRIPE_WEBHOOK_EVENTS = [
  "checkout.session.completed",
  "invoice.paid",
  "invoice.payment_failed",
  "customer.subscription.updated",
  "customer.subscription.deleted",
] as const;

/** Pro plan catalog (test mode). Env vars override these defaults. */
export const STRIPE_PRO_CATALOG = {
  monthly: {
    productId: "prod_UjdHAQ1ehL5fAk",
    priceId: "price_1TkA1O2n3eKD6EW3pdZjl5cp",
  },
  annual: {
    productId: "prod_UjdKZ8yrbp1oFR",
    priceId: "price_1TkA3U2n3eKD6EW3Js1EyWKu",
  },
} as const;

function envOrDefault(value: string | undefined, fallback: string): string {
  const trimmed = value?.trim();
  return trimmed || fallback;
}

/** Pro monthly price ID — accepts legacy STRIPE_PRICE_PRO_MONTHLY. */
export function stripeProMonthlyPriceId(): string {
  return envOrDefault(
    process.env.STRIPE_PRICE_PRO ?? process.env.STRIPE_PRICE_PRO_MONTHLY,
    STRIPE_PRO_CATALOG.monthly.priceId,
  );
}

/** Pro annual price ID. */
export function stripeProAnnualPriceId(): string {
  return envOrDefault(
    process.env.STRIPE_PRICE_PRO_ANNUAL,
    STRIPE_PRO_CATALOG.annual.priceId,
  );
}

/** Pro monthly product ID — accepts legacy STRIPE_PRODUCT_PRO. */
export function stripeProMonthlyProductId(): string {
  return envOrDefault(
    process.env.STRIPE_PRODUCT_PRO_MONTHLY ?? process.env.STRIPE_PRODUCT_PRO,
    STRIPE_PRO_CATALOG.monthly.productId,
  );
}

/** Pro annual product ID. */
export function stripeProAnnualProductId(): string {
  return envOrDefault(
    process.env.STRIPE_PRODUCT_PRO_ANNUAL,
    STRIPE_PRO_CATALOG.annual.productId,
  );
}

export function stripePublishableKey(): string | undefined {
  return process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim() || undefined;
}

export function stripeWebhookUrl(appUrl: string): string {
  const base = appUrl.replace(/\/$/, "");
  return `${base}${STRIPE_WEBHOOK_PATH}`;
}
