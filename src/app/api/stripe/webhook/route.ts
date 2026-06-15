import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { planFromStripePriceId } from "@/lib/stripe-plans";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

async function setUserPlan(
  userId: string,
  plan: string,
  stripeCustomerId?: string | null,
  stripeSubscriptionId?: string | null,
) {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    console.error("[stripe] Supabase admin not configured");
    return;
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      plan,
      stripe_customer_id: stripeCustomerId ?? null,
      stripe_subscription_id: stripeSubscriptionId ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) console.error("[stripe] profile update failed:", error);
}

function userIdFromMeta(meta: Stripe.Metadata | null | undefined): string | null {
  const id = meta?.userId?.trim();
  return id || null;
}

export async function POST(request: Request) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!stripe || !webhookSecret) {
    return NextResponse.json({ error: "Stripe webhook not configured" }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const body = await request.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("[stripe] webhook signature error:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId =
          userIdFromMeta(session.metadata) ?? session.client_reference_id ?? null;
        const plan = session.metadata?.plan ?? "pro";
        if (userId) {
          await setUserPlan(
            userId,
            plan,
            typeof session.customer === "string" ? session.customer : session.customer?.id,
            typeof session.subscription === "string"
              ? session.subscription
              : session.subscription?.id,
          );
        }
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = userIdFromMeta(sub.metadata);
        if (!userId) break;

        if (sub.status === "active" || sub.status === "trialing") {
          const priceId = sub.items.data[0]?.price?.id ?? "";
          const plan = planFromStripePriceId(priceId);
          await setUserPlan(
            userId,
            plan === "free" ? sub.metadata?.plan ?? "pro" : plan,
            typeof sub.customer === "string" ? sub.customer : sub.customer?.id,
            sub.id,
          );
        } else {
          await setUserPlan(userId, "free", null, null);
        }
        break;
      }
      default:
        break;
    }
  } catch (err) {
    console.error("[stripe] webhook handler error:", err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
