import { DEFAULT_API_BASE, resolveApiBase } from "../lib/billing-api-base";
import { getSupabase } from "../lib/supabase";

export type DailyPoint = { date: string; value: number };
export type HourlyPoint = { hour: number; value: number };

export type AdminStripeMetrics = {
  today: {
    grossRevenue: number;
    yesterdayGrossRevenue: number;
    hourly: HourlyPoint[];
    updatedAt: string;
  };
  balance: {
    total: number;
    available: number;
    pending: number;
    currency: string;
  };
  payouts: {
    recentAmount: number | null;
    recentArrivalDate: string | null;
    pendingAmount: number;
    currency: string;
  };
  stats: {
    periodStart: string;
    periodEnd: string;
    previousPeriodStart: string;
    previousPeriodEnd: string;
    grossRevenue: number;
    previousGrossRevenue: number;
    netRevenue: number;
    previousNetRevenue: number;
    newUsers: number;
    previousNewUsers: number;
    mrr: number;
    arr: number;
    dailyGross: DailyPoint[];
    dailyNet: DailyPoint[];
    dailyNewUsers: DailyPoint[];
    dailyMrr: DailyPoint[];
    paymentsBreakdown: {
      paid: number;
      pastDue: number;
      failed: number;
      pending: number;
    };
  };
};

export type AdminMetricsResult = {
  ok: boolean;
  data: AdminStripeMetrics;
  error?: string;
  dataSource?: string;
};

export function metricsHavePaymentData(data: AdminStripeMetrics): boolean {
  return (
    data.today.grossRevenue > 0 ||
    data.stats.grossRevenue > 0 ||
    data.stats.paymentsBreakdown.paid > 0 ||
    data.stats.mrr > 0 ||
    data.balance.total > 0
  );
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

function formatDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function buildDailySeries(days: number): DailyPoint[] {
  const end = new Date();
  end.setUTCHours(23, 59, 59, 999);
  const start = addDays(end, -(days - 1));
  start.setUTCHours(0, 0, 0, 0);

  const points: DailyPoint[] = [];
  for (let d = new Date(start); d <= end; d = addDays(d, 1)) {
    points.push({ date: formatDateKey(d), value: 0 });
  }
  return points;
}

/** Zero-filled metrics so cards always render before / without live Stripe data. */
export function buildEmptyAdminMetrics(days = 7): AdminStripeMetrics {
  const now = new Date();
  const periodEndDate = new Date(now);
  periodEndDate.setUTCHours(23, 59, 59, 999);
  const periodStartDate = addDays(periodEndDate, -(days - 1));
  periodStartDate.setUTCHours(0, 0, 0, 0);

  const previousEndDate = addDays(periodStartDate, -1);
  previousEndDate.setUTCHours(23, 59, 59, 999);
  const previousStartDate = addDays(previousEndDate, -(days - 1));
  previousStartDate.setUTCHours(0, 0, 0, 0);

  const daily = buildDailySeries(days);

  return {
    today: {
      grossRevenue: 0,
      yesterdayGrossRevenue: 0,
      hourly: Array.from({ length: 24 }, (_, hour) => ({ hour, value: 0 })),
      updatedAt: now.toISOString(),
    },
    balance: {
      total: 0,
      available: 0,
      pending: 0,
      currency: "usd",
    },
    payouts: {
      recentAmount: null,
      recentArrivalDate: null,
      pendingAmount: 0,
      currency: "usd",
    },
    stats: {
      periodStart: periodStartDate.toISOString(),
      periodEnd: periodEndDate.toISOString(),
      previousPeriodStart: previousStartDate.toISOString(),
      previousPeriodEnd: previousEndDate.toISOString(),
      grossRevenue: 0,
      previousGrossRevenue: 0,
      netRevenue: 0,
      previousNetRevenue: 0,
      newUsers: 0,
      previousNewUsers: 0,
      mrr: 0,
      arr: 0,
      dailyGross: daily,
      dailyNet: daily.map((point) => ({ ...point })),
      dailyNewUsers: daily.map((point) => ({ ...point })),
      dailyMrr: daily.map((point) => ({ ...point })),
      paymentsBreakdown: {
        paid: 0,
        pastDue: 0,
        failed: 0,
        pending: 0,
      },
    },
  };
}

async function getAccessToken(): Promise<string | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

const LOCAL_DEV_API = "http://localhost:3000";

async function fetchMetricsFromBase(
  base: string,
  days: number,
  token: string,
): Promise<AdminMetricsResult> {
  const empty = buildEmptyAdminMetrics(days);
  let res: Response;
  try {
    res = await fetch(`${base}/api/admin/stripe-metrics?days=${days}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch {
    if (base.includes("localhost") || base.includes("127.0.0.1")) {
      return {
        ok: false,
        data: empty,
        error: "Billing server unreachable. Run `npm run dev` at the repo root.",
      };
    }
    return { ok: false, data: empty, error: "Could not reach the billing server." };
  }

  const payload = (await res.json().catch(() => ({}))) as AdminStripeMetrics & {
    error?: string;
    dataSource?: string;
  };

  if (res.status === 401 || res.status === 403) {
    return { ok: false, data: empty, error: payload.error ?? "Not authorized for admin metrics." };
  }

  if (res.status === 404) {
    return {
      ok: false,
      data: empty,
      error:
        "Admin metrics API is not deployed yet. Deploy the latest server code or run `npm run dev` locally.",
    };
  }

  if (!res.ok) {
    return { ok: false, data: empty, error: payload.error ?? "Failed to load admin metrics." };
  }

  const { dataSource, error: _err, ...metrics } = payload;
  const data = metrics as AdminStripeMetrics;
  return {
    ok: true,
    data,
    dataSource,
  };
}

function buildApiBases(primary: string): string[] {
  const bases = [primary.replace(/\/$/, "")];
  const add = (base: string) => {
    const trimmed = base.replace(/\/$/, "");
    if (!bases.includes(trimmed)) bases.push(trimmed);
  };

  if (import.meta.env.DEV) {
    add(DEFAULT_API_BASE);
    add(LOCAL_DEV_API);
  }

  return bases;
}

export async function fetchAdminStripeMetrics(
  days = 7,
): Promise<AdminMetricsResult> {
  const empty = buildEmptyAdminMetrics(days);
  const token = await getAccessToken();
  if (!token) {
    return { ok: false, data: empty, error: "Sign in required to view admin metrics." };
  }

  const bases = buildApiBases(await resolveApiBase());
  let lastError = "Could not reach the billing server.";
  let bestResult: AdminMetricsResult | null = null;

  for (const base of bases) {
    const result = await fetchMetricsFromBase(base, days, token);
    if (result.ok && metricsHavePaymentData(result.data)) {
      return result;
    }
    if (result.ok && (!bestResult?.ok || metricsHavePaymentData(result.data))) {
      bestResult = result;
    }
    if (!result.ok) {
      lastError = result.error ?? lastError;
      if (!bestResult?.ok) bestResult = result;
    }
  }

  if (bestResult?.ok) {
    return bestResult;
  }

  return bestResult ?? { ok: false, data: empty, error: lastError };
}
