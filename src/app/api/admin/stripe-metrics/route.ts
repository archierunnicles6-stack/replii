import { jsonWithCors, optionsResponse } from "@/lib/api-cors";
import { verifyAdminRequest } from "@/lib/admin-auth";
import { resolveAdminMetrics } from "@/lib/payment-events";
import { fetchStripeAdminMetrics } from "@/lib/stripe-admin-metrics";
import { getStripe } from "@/lib/stripe";

export async function OPTIONS(request: Request) {
  return optionsResponse(request);
}

export async function GET(request: Request) {
  const auth = await verifyAdminRequest(request);
  if (!auth.ok) {
    return jsonWithCors(request, { error: auth.error }, { status: auth.status });
  }

  const { searchParams } = new URL(request.url);
  const periodDays = Math.min(
    90,
    Math.max(1, Number.parseInt(searchParams.get("days") ?? "7", 10) || 7),
  );

  try {
    const stripe = getStripe();
    const { metrics, source } = await resolveAdminMetrics(
      stripe,
      periodDays,
      fetchStripeAdminMetrics,
    );

    return jsonWithCors(request, { ...metrics, dataSource: source });
  } catch (err) {
    console.error("[admin] stripe metrics error:", err);
    return jsonWithCors(request, { error: "Failed to load Stripe metrics" }, { status: 500 });
  }
}
