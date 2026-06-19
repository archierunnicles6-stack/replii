import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { resolveBillingOrigin } from "@/lib/billing-api-base";
import { normalizeBillingReturnUrl } from "@/lib/billing-return-urls";
import {
  stripePriceIdForPlan,
  type StripeBillingInterval,
  type StripePlanId,
} from "@/lib/stripe-plans";

const PAID_PLANS = new Set<StripePlanId>(["pro"]);

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      plan?: string;
      interval?: string;
      userId?: string;
      email?: string;
      successUrl?: string;
      cancelUrl?: string;
    };

    const plan = body.plan as StripePlanId | undefined;
    if (!plan || !PAID_PLANS.has(plan)) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }
    const interval: StripeBillingInterval =
      body.interval === "annual" ? "annual" : "monthly";
    if (!body.userId?.trim()) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const stripe = getStripe();
    const priceId = stripePriceIdForPlan(plan, interval);
    if (!stripe || !priceId) {
      return NextResponse.json(
        { error: "Stripe is not configured on the server" },
        { status: 503 },
      );
    }

    const origin = resolveBillingOrigin(request);

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: body.email?.trim() || undefined,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: normalizeBillingReturnUrl(body.successUrl, origin, {
        plan,
        to: "dashboard",
      }),
      cancel_url: body.cancelUrl?.trim() || `${origin}/billing/cancel`,
      client_reference_id: body.userId,
      metadata: {
        userId: body.userId,
        plan,
        interval,
      },
      subscription_data: {
        metadata: {
          userId: body.userId,
          plan,
          interval,
        },
      },
    });

    if (!session.url) {
      return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
    }

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[stripe] checkout error:", err);
    return NextResponse.json({ error: "Checkout failed" }, { status: 500 });
  }
}
