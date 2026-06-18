import { getSupabaseConfigStatus } from "@/lib/supabase-config";

export type StripeConfigStatus = {
  stripe: boolean;
  webhook: boolean;
  supabaseAdmin: boolean;
  supabaseProjectMatch: boolean;
  pricesConfigured: {
    pro: { monthly: boolean; annual: boolean };
  };
  checkoutReady: boolean;
  webhooksReady: boolean;
  issues: string[];
};

export function getStripeConfigStatus(): StripeConfigStatus {
  const secretKey = process.env.STRIPE_SECRET_KEY?.trim();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  const proMonthly = process.env.STRIPE_PRICE_PRO?.trim();
  const proAnnual = process.env.STRIPE_PRICE_PRO_ANNUAL?.trim();
  const supabase = getSupabaseConfigStatus();

  const pricesConfigured = {
    pro: { monthly: Boolean(proMonthly), annual: Boolean(proAnnual) },
  };

  const issues: string[] = [];
  if (!secretKey) issues.push("STRIPE_SECRET_KEY is missing");
  if (!webhookSecret) issues.push("STRIPE_WEBHOOK_SECRET is missing");
  if (!proMonthly) issues.push("STRIPE_PRICE_PRO is missing");
  if (!proAnnual) issues.push("STRIPE_PRICE_PRO_ANNUAL is missing");
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
    supabaseAdmin,
    supabaseProjectMatch: supabase.projectMatch,
    pricesConfigured,
    checkoutReady: Boolean(secretKey && proMonthly && proAnnual),
    webhooksReady: Boolean(
      secretKey && webhookSecret && supabaseAdmin,
    ),
    issues,
  };
}
