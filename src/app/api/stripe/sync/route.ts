import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { planFromStripePriceId } from "@/lib/stripe-plans";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

function isMissingBillingColumnError(error: {
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

async function syncFromStripeCustomer(
  stripe: Stripe,
  userId: string,
  customerId: string,
): Promise<{ plan: string; customerId: string; subscriptionId: string | null } | null> {
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

async function syncFromRecentCheckout(
  stripe: Stripe,
  userId: string,
): Promise<{ plan: string; customerId: string; subscriptionId: string | null } | null> {
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

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { userId?: string };
    const userId = body.userId?.trim();
    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const stripe = getStripe();
    const supabase = getSupabaseAdmin();
    if (!stripe || !supabase) {
      return NextResponse.json(
        { error: "Billing sync is not configured on the server" },
        { status: 503 },
      );
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("plan, stripe_customer_id")
      .eq("id", userId)
      .maybeSingle();

    let billingColumnsReady = true;
    if (error) {
      if (isMissingBillingColumnError(error)) {
        console.warn("[stripe] sync: billing columns missing on profiles — returning Stripe plan only");
        billingColumnsReady = false;
      } else {
        console.error("[stripe] sync profile load error:", error);
        return NextResponse.json({ error: "Could not load profile" }, { status: 500 });
      }
    }

    let synced: { plan: string; customerId: string; subscriptionId: string | null } | null =
      null;

    if (billingColumnsReady && profile?.stripe_customer_id) {
      synced = await syncFromStripeCustomer(stripe, userId, profile.stripe_customer_id);
    }

    if (!synced) {
      synced = await syncFromRecentCheckout(stripe, userId);
    }

    if (!synced) {
      return NextResponse.json({ plan: profile?.plan ?? "free", synced: false });
    }

    if (!billingColumnsReady) {
      return NextResponse.json({ plan: synced.plan, synced: false, persisted: false });
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        plan: synced.plan,
        stripe_customer_id: synced.customerId,
        stripe_subscription_id: synced.subscriptionId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (updateError) {
      if (isMissingBillingColumnError(updateError)) {
        return NextResponse.json({ plan: synced.plan, synced: false, persisted: false });
      }
      console.error("[stripe] sync profile update error:", updateError);
      return NextResponse.json({ error: "Could not update profile" }, { status: 500 });
    }

    return NextResponse.json({ plan: synced.plan, synced: true });
  } catch (err) {
    console.error("[stripe] sync error:", err);
    return NextResponse.json({ error: "Billing sync failed" }, { status: 500 });
  }
}
