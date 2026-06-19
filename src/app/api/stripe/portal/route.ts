import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { normalizeBillingReturnUrl } from "@/lib/billing-return-urls";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

async function resolveStripeCustomerId(
  stripe: Stripe,
  userId: string,
  profileCustomerId?: string | null,
): Promise<string | null> {
  if (profileCustomerId) return profileCustomerId;

  const sessions = await stripe.checkout.sessions.list({ limit: 25 });
  const match = sessions.data.find(
    (session) =>
      session.status === "complete" &&
      session.client_reference_id === userId &&
      session.mode === "subscription",
  );
  if (!match) return null;

  return typeof match.customer === "string"
    ? match.customer
    : match.customer?.id ?? null;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      userId?: string;
      returnUrl?: string;
    };

    if (!body.userId?.trim()) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const stripe = getStripe();
    const supabase = getSupabaseAdmin();
    if (!stripe || !supabase) {
      return NextResponse.json(
        { error: "Billing portal is not configured" },
        { status: 503 },
      );
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", body.userId)
      .maybeSingle();

    const customerId = await resolveStripeCustomerId(
      stripe,
      body.userId,
      error ? null : profile?.stripe_customer_id,
    );

    if (!customerId) {
      return NextResponse.json(
        { error: "No active subscription found for this account" },
        { status: 404 },
      );
    }

    const origin =
      process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
      new URL(request.url).origin;

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: normalizeBillingReturnUrl(body.returnUrl, origin, { to: "billing" }),
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[stripe] portal error:", err);
    return NextResponse.json({ error: "Portal failed" }, { status: 500 });
  }
}
