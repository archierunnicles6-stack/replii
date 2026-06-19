import type Stripe from "stripe";
import { planFromStripePriceId } from "@/lib/stripe-plans";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export type StripeBillingSyncResult = {
  plan: string;
  customerId: string;
  subscriptionId: string | null;
};

export function isMissingBillingColumnError(error: {
  code?: string;
  message?: string;
}): boolean {
  return (
    error.code === "42703" &&
    Boolean(
      error.message?.includes("plan") ||
        error.message?.includes("stripe_customer_id") ||
        error.message?.includes("stripe_subscription_id"),
    )
  );
}

async function planFromSubscription(sub: Stripe.Subscription): Promise<string> {
  if (sub.status !== "active" && sub.status !== "trialing") return "free";
  const priceId = sub.items.data[0]?.price?.id ?? "";
  const plan = planFromStripePriceId(priceId);
  return plan === "free" ? sub.metadata?.plan ?? "pro" : plan;
}

export async function syncFromStripeCustomer(
  stripe: Stripe,
  userId: string,
  customerId: string,
): Promise<StripeBillingSyncResult | null> {
  const subs = await stripe.subscriptions.list({
    customer: customerId,
    status: "all",
    limit: 5,
  });

  const active = subs.data.find((s) => s.status === "active" || s.status === "trialing");
  if (active) {
    return {
      plan: await planFromSubscription(active),
      customerId,
      subscriptionId: active.id,
    };
  }

  const canceled = subs.data[0];
  if (canceled) {
    return { plan: "free", customerId, subscriptionId: null };
  }

  return null;
}

export async function syncFromRecentCheckout(
  stripe: Stripe,
  userId: string,
): Promise<StripeBillingSyncResult | null> {
  const sessions = await stripe.checkout.sessions.list({ limit: 25 });
  const match = sessions.data.find(
    (session) =>
      session.status === "complete" &&
      session.client_reference_id === userId &&
      session.mode === "subscription",
  );

  if (!match) return null;

  const customerId =
    typeof match.customer === "string" ? match.customer : match.customer?.id ?? null;
  const subscriptionId =
    typeof match.subscription === "string"
      ? match.subscription
      : match.subscription?.id ?? null;

  if (!customerId) return null;

  if (subscriptionId) {
    const sub = await stripe.subscriptions.retrieve(subscriptionId);
    return {
      plan: await planFromSubscription(sub),
      customerId,
      subscriptionId: sub.status === "active" || sub.status === "trialing" ? sub.id : null,
    };
  }

  return {
    plan: match.metadata?.plan ?? "pro",
    customerId,
    subscriptionId: null,
  };
}

export async function syncFromCheckoutSession(
  stripe: Stripe,
  sessionId: string,
): Promise<(StripeBillingSyncResult & { userId: string }) | null> {
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  if (session.status !== "complete" || session.mode !== "subscription") return null;

  const userId = session.client_reference_id ?? session.metadata?.userId ?? null;
  if (!userId) return null;

  const customerId =
    typeof session.customer === "string" ? session.customer : session.customer?.id ?? null;
  const subscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id ?? null;

  if (!customerId) return null;

  if (subscriptionId) {
    const sub = await stripe.subscriptions.retrieve(subscriptionId);
    return {
      userId,
      plan: await planFromSubscription(sub),
      customerId,
      subscriptionId: sub.status === "active" || sub.status === "trialing" ? sub.id : null,
    };
  }

  return {
    userId,
    plan: session.metadata?.plan ?? "pro",
    customerId,
    subscriptionId: null,
  };
}

export async function persistBillingSync(
  userId: string,
  synced: StripeBillingSyncResult,
): Promise<{ persisted: boolean; billingColumnsReady: boolean }> {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return { persisted: false, billingColumnsReady: false };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      plan: synced.plan,
      stripe_customer_id: synced.customerId,
      stripe_subscription_id: synced.subscriptionId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) {
    if (isMissingBillingColumnError(error)) {
      return { persisted: false, billingColumnsReady: false };
    }
    throw error;
  }

  return { persisted: true, billingColumnsReady: true };
}

export async function syncUserBilling(
  stripe: Stripe,
  userId: string,
  profileCustomerId?: string | null,
): Promise<{
  synced: StripeBillingSyncResult | null;
  billingColumnsReady: boolean;
  profilePlan?: string | null;
}> {
  const supabase = getSupabaseAdmin();
  let billingColumnsReady = true;
  let profilePlan: string | null | undefined;

  if (supabase) {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("plan, stripe_customer_id")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      if (isMissingBillingColumnError(error)) {
        billingColumnsReady = false;
      } else {
        throw error;
      }
    } else {
      profilePlan = profile?.plan ?? "free";
      profileCustomerId = profile?.stripe_customer_id ?? profileCustomerId;
    }
  }

  let synced: StripeBillingSyncResult | null = null;

  if (billingColumnsReady && profileCustomerId) {
    synced = await syncFromStripeCustomer(stripe, userId, profileCustomerId);
  }

  if (!synced) {
    synced = await syncFromRecentCheckout(stripe, userId);
  }

  return { synced, billingColumnsReady, profilePlan };
}
