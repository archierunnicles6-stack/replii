import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

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

    if (error || !profile?.stripe_customer_id) {
      return NextResponse.json(
        { error: "No active subscription found for this account" },
        { status: 404 },
      );
    }

    const origin =
      process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
      new URL(request.url).origin;

    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: body.returnUrl?.trim() || `${origin}/billing/success?to=billing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[stripe] portal error:", err);
    return NextResponse.json({ error: "Portal failed" }, { status: 500 });
  }
}
