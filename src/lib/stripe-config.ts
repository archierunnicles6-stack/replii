import {
  STRIPE_PRO_CATALOG,
  STRIPE_WEBHOOK_EVENTS,
  STRIPE_WEBHOOK_PATH,
  stripeProAnnualPriceId,
  stripeProAnnualProductId,
  stripeProMonthlyPriceId,
  stripeProMonthlyProductId,
  stripePublishableKey,
  stripeWebhookUrl,
} from "@/lib/stripe-ids";
import { getSupabaseConfigStatus } from "@/lib/supabase-config";

export type StripeConfigStatus = {
  stripe: boolean;
  webhook: boolean;
  publishableKey: boolean;
  supabaseAdmin: boolean;
  supabaseProjectMatch: boolean;
  catalog: typeof STRIPE_PRO_CATALOG;
  webhookPath: string;
  webhookEvents: readonly string[];
  pricesConfigured: {
    pro: { monthly: boolean; annual: boolean };
  };
  productsConfigured: {
    pro: { monthly: boolean; annual: boolean };
  };
  checkoutReady: boolean;
  webhooksReady: boolean;
  webhookUrl: string | null;
  issues: string[];
};

export function getStripeConfigStatus(): StripeConfigStatus {
  const secretKey = process.env.STRIPE_SECRET_KEY?.trim();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  const proMonthlyPrice = stripeProMonthlyPriceId();
  const proAnnualPrice = stripeProAnnualPriceId();
  const proMonthlyProduct = stripeProMonthlyProductId();
  const proAnnualProduct = stripeProAnnualProductId();
  const publishableKey = stripePublishableKey();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
  const supabase = getSupabaseConfigStatus();

  const pricesConfigured = {
    pro: {
      monthly: Boolean(proMonthlyPrice),
      annual: Boolean(proAnnualPrice),
    },
  };

  const productsConfigured = {
    pro: {
      monthly: Boolean(proMonthlyProduct),
      annual: Boolean(proAnnualProduct),
    },
  };

  const issues: string[] = [];
  if (!secretKey) issues.push("STRIPE_SECRET_KEY is missing");
  if (!webhookSecret) issues.push("STRIPE_WEBHOOK_SECRET is missing");
  if (!proMonthlyPrice) issues.push("STRIPE_PRICE_PRO is missing");
  if (!proAnnualPrice) issues.push("STRIPE_PRICE_PRO_ANNUAL is missing");
  if (!proMonthlyProduct) {
    issues.push("STRIPE_PRODUCT_PRO_MONTHLY (or STRIPE_PRODUCT_PRO) is missing");
  }
  if (!proAnnualProduct) issues.push("STRIPE_PRODUCT_PRO_ANNUAL is missing");
  if (!supabase.url) issues.push("SUPABASE_URL is missing");
  if (!supabase.serviceRoleKey) issues.push("SUPABASE_SERVICE_ROLE_KEY is missing");
  if (supabase.serviceRoleKey && supabase.anonKey && !supabase.projectMatch) {
    issues.push(
      "Supabase service role key does not match SUPABASE_URL / anon key project (billing webhooks will fail)",
    );
  }

  const supabaseAdmin = Boolean(supabase.url && supabase.serviceRoleKey && supabase.projectMatch);

  return {
    stripe: Boolean(secretKey),
    webhook: Boolean(webhookSecret),
    publishableKey: Boolean(publishableKey),
    supabaseAdmin,
    supabaseProjectMatch: supabase.projectMatch,
    catalog: STRIPE_PRO_CATALOG,
    webhookPath: STRIPE_WEBHOOK_PATH,
    webhookEvents: STRIPE_WEBHOOK_EVENTS,
    pricesConfigured,
    productsConfigured,
    checkoutReady: Boolean(secretKey && proMonthlyPrice && proAnnualPrice),
    webhooksReady: Boolean(secretKey && webhookSecret && supabaseAdmin),
    webhookUrl: appUrl ? stripeWebhookUrl(appUrl) : null,
    issues,
  };
}
