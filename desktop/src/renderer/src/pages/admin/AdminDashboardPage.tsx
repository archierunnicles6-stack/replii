import { useCallback, useEffect, useMemo, useState } from "react";
import repliiIcon from "../../assets/replii-icon.png";
import {
  buildEmptyAdminMetrics,
  fetchAdminStripeMetrics,
  metricsHavePaymentData,
  type AdminStripeMetrics,
  type DailyPoint,
} from "../../services/admin-metrics";

const REFRESH_MS = 60_000;

function formatMoney(value: number, currency = "usd"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function formatDateRange(start: string, end: string): string {
  const s = new Date(start);
  const e = new Date(end);
  const sameYear = s.getFullYear() === e.getFullYear();
  const startFmt = s.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    ...(sameYear ? {} : { year: "numeric" }),
  });
  const endFmt = e.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return `${startFmt} – ${endFmt}`;
}

function openStripeDashboard(path: string) {
  void window.replii?.openExternal?.(`https://dashboard.stripe.com/${path}`);
}

function formatValueOrDash(
  value: number,
  currency: string,
  showDash: boolean,
  isCurrency = true,
): string {
  if (showDash && value === 0) return "—";
  return isCurrency ? formatMoney(value, currency) : value.toLocaleString();
}

function TodayHourlyChart({ data }: { data: AdminStripeMetrics["today"]["hourly"] }) {
  const width = 720;
  const height = 200;
  const padding = { top: 16, right: 16, bottom: 28, left: 16 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;
  const hasData = data.some((point) => point.value > 0);
  const max = Math.max(...data.map((point) => point.value), 1);
  const gridLines = 8;

  const bars = data.map((point, index) => {
    const slotW = chartW / 24;
    const x = padding.left + index * slotW + slotW * 0.15;
    const barWidth = slotW * 0.7;
    const barHeight = (point.value / max) * chartH;
    const y = padding.top + chartH - barHeight;
    return { x, y, barWidth, barHeight, value: point.value };
  });

  const nowLabel = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <div className="relative h-[220px] w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full">
        {Array.from({ length: gridLines + 1 }).map((_, index) => {
          const y = padding.top + (index / gridLines) * chartH;
          return (
            <line
              key={index}
              x1={padding.left}
              y1={y}
              x2={width - padding.right}
              y2={y}
              stroke="#f0f0f0"
              strokeWidth={1}
            />
          );
        })}
        {Array.from({ length: 25 }).map((_, index) => {
          const x = padding.left + (index / 24) * chartW;
          return (
            <line
              key={`v-${index}`}
              x1={x}
              y1={padding.top}
              x2={x}
              y2={padding.top + chartH}
              stroke="#f4f4f5"
              strokeWidth={1}
            />
          );
        })}
        {hasData
          ? bars.map((bar, index) => (
              <rect
                key={index}
                x={bar.x}
                y={bar.y}
                width={Math.max(bar.barWidth, 1)}
                height={Math.max(bar.barHeight, 0)}
                rx={1}
                fill="#18181b"
                opacity={bar.value > 0 ? 0.9 : 0}
              />
            ))
          : null}
      </svg>
      {!hasData ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-[12px] text-zinc-500">
            No data available
          </span>
        </div>
      ) : null}
      <div className="absolute inset-x-0 bottom-0 flex justify-between px-1 text-[11px] text-zinc-400">
        <span>12:00 AM</span>
        <span>{nowLabel}</span>
        <span>12:00 AM</span>
      </div>
    </div>
  );
}

function MiniLineChart({
  data,
  isCurrency = false,
}: {
  data: DailyPoint[];
  isCurrency?: boolean;
}) {
  const width = 320;
  const height = 72;
  const padding = 8;

  const hasData = data.some((point) => point.value > 0);
  const max = Math.max(...data.map((point) => point.value), 1);

  const points = data.map((point, index) => {
    const x =
      padding +
      (index / Math.max(data.length - 1, 1)) * (width - padding * 2);
    const y = height - padding - (point.value / max) * (height - padding * 2);
    return { x, y };
  });

  const path =
    points.length > 0
      ? `M ${points.map((point) => `${point.x},${point.y}`).join(" L ")}`
      : "";

  const startLabel = data[0] ? formatShortDate(data[0].date) : "";
  const endLabel = data.at(-1) ? formatShortDate(data.at(-1)!.date) : "Today";

  return (
    <div className="relative mt-2 h-[88px]">
      {!hasData ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-0.5 text-[11px] text-zinc-500">
            No data available
          </span>
        </div>
      ) : (
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-full w-full"
          preserveAspectRatio="none"
        >
          <path
            d={path}
            fill="none"
            stroke="#2563eb"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
      <div className="absolute inset-x-0 bottom-0 flex justify-between text-[10px] text-zinc-400">
        <span>{startLabel}</span>
        <span>{endLabel}</span>
      </div>
      {isCurrency && hasData ? (
        <span className="sr-only">{formatMoney(data.at(-1)?.value ?? 0)}</span>
      ) : null}
    </div>
  );
}

function MetricCard({
  title,
  value,
  data,
  isCurrency = true,
  currency = "usd",
  showDash = false,
}: {
  title: string;
  value: number;
  data: DailyPoint[];
  isCurrency?: boolean;
  currency?: string;
  showDash?: boolean;
}) {
  const displayValue = showDash && value === 0
    ? "—"
    : isCurrency
      ? formatMoney(value, currency)
      : value.toLocaleString();

  return (
    <div className="flex min-h-0 flex-col rounded-xl border border-zinc-200 bg-white p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[12px] font-medium text-zinc-500 underline decoration-dotted decoration-zinc-300 underline-offset-2">
            {title}
          </p>
          <p className="mt-1 text-[24px] font-semibold leading-none tracking-tight text-zinc-900">
            {displayValue}
          </p>
        </div>
        <div className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-md bg-zinc-900">
          <img src={repliiIcon} alt="Replii" className="h-4 w-4 object-contain" />
        </div>
      </div>
      <MiniLineChart data={data} isCurrency={isCurrency} />
    </div>
  );
}

function PaymentsBreakdownCard({
  breakdown,
}: {
  breakdown: AdminStripeMetrics["stats"]["paymentsBreakdown"];
}) {
  const rows = [
    { label: "Failed", value: breakdown.failed, color: "bg-red-500" },
    { label: "Past due", value: breakdown.pastDue, color: "bg-amber-500" },
    { label: "Paid", value: breakdown.paid, color: "bg-emerald-500" },
    { label: "Pending", value: breakdown.pending, color: "bg-blue-400" },
  ];
  const total = rows.reduce((sum, row) => sum + row.value, 0);

  return (
    <div className="flex min-h-0 flex-col rounded-xl border border-zinc-200 bg-white p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[12px] font-medium text-zinc-500 underline decoration-dotted decoration-zinc-300 underline-offset-2">
            Payments breakdown
          </p>
          <p className="mt-1 text-[24px] font-semibold leading-none tracking-tight text-zinc-900">
            {total.toLocaleString()}
          </p>
        </div>
        <div className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-md bg-zinc-900">
          <img src={repliiIcon} alt="Replii" className="h-4 w-4 object-contain" />
        </div>
      </div>
      <div className="mt-3 flex h-2 overflow-hidden rounded-full bg-zinc-100">
        {total > 0
          ? rows.map((row) =>
              row.value > 0 ? (
                <div
                  key={row.label}
                  className={`${row.color} h-full`}
                  style={{ width: `${(row.value / total) * 100}%` }}
                />
              ) : null,
            )
          : null}
      </div>
      <div className="mt-3 space-y-1.5">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5 text-zinc-600">
              <span className={`h-1.5 w-1.5 rounded-full ${row.color}`} />
              {row.label}
            </div>
            <span className="font-medium text-zinc-900">{row.value}</span>
          </div>
        ))}
      </div>
      {total === 0 ? (
        <div className="mt-2 flex justify-center">
          <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-0.5 text-[11px] text-zinc-500">
            No data available
          </span>
        </div>
      ) : null}
    </div>
  );
}

function FilterSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-8 rounded-lg border border-zinc-200 bg-white px-2.5 text-[12px] text-zinc-700 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

export function AdminDashboardPage() {
  const [periodDays, setPeriodDays] = useState("7");
  const [metrics, setMetrics] = useState<AdminStripeMetrics>(() => buildEmptyAdminMetrics(7));
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const loadMetrics = useCallback(async (days: number, isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    setInfo(null);

    const result = await fetchAdminStripeMetrics(days);
    setMetrics(result.data);
    const hasData = metricsHavePaymentData(result.data);
    if (!result.ok && !hasData) {
      setError(result.error ?? "Failed to load admin metrics.");
    } else if (result.ok && !hasData) {
      setInfo(
        "No payments found for this period yet. After checkout, open the app once so billing sync runs, then refresh.",
      );
    }

    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    void loadMetrics(Number(periodDays));
  }, [loadMetrics, periodDays]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      void loadMetrics(Number(periodDays), true);
    }, REFRESH_MS);
    return () => window.clearInterval(timer);
  }, [loadMetrics, periodDays]);

  const currency = metrics.balance.currency;
  const dateRangeLabel = useMemo(
    () => formatDateRange(metrics.stats.periodStart, metrics.stats.periodEnd),
    [metrics.stats.periodEnd, metrics.stats.periodStart],
  );

  const showValues = !loading;
  const hasPaymentData = metricsHavePaymentData(metrics);

  const clockLabel = showValues
    ? new Date(metrics.today.updatedAt).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      })
    : new Date().toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      });

  return (
    <div className="-mx-8 bg-white pb-8">
      <div className="mx-auto max-w-[1100px] px-6 py-6">
        {/* Today */}
        <section className="border-b border-zinc-100 pb-10">
          <div className="mb-6 flex items-center justify-between gap-4 border-b border-zinc-100 pb-4">
            <h1 className="text-[28px] font-semibold tracking-tight text-zinc-900">Today</h1>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => void loadMetrics(Number(periodDays), true)}
                disabled={refreshing}
                className="h-8 rounded-lg border border-zinc-200 bg-white px-3 text-[12px] font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-60"
              >
                Refresh
              </button>
              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-50"
                aria-label="Notifications"
              >
                <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>
            </div>
          </div>

          {error ? (
            <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[12px] text-amber-800">
              {error}
            </div>
          ) : null}

          {info ? (
            <div className="mb-5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-[12px] text-blue-800">
              {info}
            </div>
          ) : null}

          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_240px]">
            <div>
              <div className="mb-4 flex items-end gap-12">
                <div>
                  <p className="text-[13px] text-zinc-500">Gross revenue</p>
                  <p className="mt-0.5 text-[15px] font-medium text-zinc-900">
                    {showValues
                      ? formatValueOrDash(metrics.today.grossRevenue, currency, !hasPaymentData)
                      : "—"}
                  </p>
                  <p className="mt-0.5 text-[12px] text-zinc-400">{clockLabel}</p>
                </div>
                <div>
                  <p className="text-[13px] text-zinc-500">Yesterday</p>
                  <p className="mt-0.5 text-[15px] font-medium text-zinc-900">
                    {showValues
                      ? formatValueOrDash(
                          metrics.today.yesterdayGrossRevenue,
                          currency,
                          !hasPaymentData,
                        )
                      : "—"}
                  </p>
                </div>
              </div>
              <TodayHourlyChart data={metrics.today.hourly} />
            </div>

            <div className="divide-y divide-zinc-100">
              <div className="pb-5">
                <div className="flex items-center justify-between">
                  <p className="text-[13px] font-medium text-zinc-700">Total balance</p>
                  <button
                    type="button"
                    onClick={() => openStripeDashboard("balance/overview")}
                    className="text-[12px] text-blue-600 hover:underline"
                  >
                    View
                  </button>
                </div>
                <p className="mt-2 text-[28px] font-semibold leading-none text-zinc-900">
                  {showValues
                    ? formatValueOrDash(metrics.balance.total, currency, !hasPaymentData)
                    : "—"}
                </p>
                <p className="mt-1.5 text-[12px] text-zinc-500">
                  {showValues
                    ? `${formatValueOrDash(metrics.balance.available, currency, !hasPaymentData)} available`
                    : "—"}
                </p>
              </div>

              <div className="pt-5">
                <div className="flex items-center justify-between">
                  <p className="text-[13px] font-medium text-zinc-700">Payouts</p>
                  <button
                    type="button"
                    onClick={() => openStripeDashboard("payouts")}
                    className="text-[12px] text-blue-600 hover:underline"
                  >
                    View
                  </button>
                </div>
                <p className="mt-2 text-[22px] font-semibold text-zinc-900">
                  {showValues
                    ? metrics.payouts.recentAmount != null && metrics.payouts.recentAmount > 0
                      ? formatMoney(metrics.payouts.recentAmount, currency)
                      : formatValueOrDash(0, currency, !hasPaymentData)
                    : "—"}
                </p>
                {showValues && metrics.payouts.pendingAmount > 0 ? (
                  <p className="mt-1 text-[12px] text-zinc-500">
                    {formatMoney(metrics.payouts.pendingAmount, currency)} pending payout
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="pt-8">
          <h2 className="text-[28px] font-semibold tracking-tight text-zinc-900">Stats</h2>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <FilterSelect
              value={periodDays}
              onChange={setPeriodDays}
              options={[
                { value: "7", label: "Last 7 days" },
                { value: "14", label: "Last 14 days" },
                { value: "30", label: "Last 30 days" },
                { value: "90", label: "Last 90 days" },
              ]}
            />
            <span className="inline-flex h-8 items-center rounded-lg border border-zinc-200 bg-white px-2.5 text-[12px] text-zinc-700">
              {dateRangeLabel}
            </span>
            <span className="inline-flex h-8 items-center rounded-lg border border-zinc-200 bg-white px-2.5 text-[12px] text-zinc-700">
              compared to previous period
            </span>
            <span className="inline-flex h-8 items-center rounded-lg border border-zinc-200 bg-white px-2.5 text-[12px] text-zinc-700">
              Daily
            </span>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {loading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="h-[180px] animate-pulse rounded-xl border border-zinc-200 bg-zinc-50"
                />
              ))
            ) : (
              <>
                <MetricCard
                  title="Gross revenue"
                  value={metrics.stats.grossRevenue}
                  data={metrics.stats.dailyGross}
                  currency={currency}
                  showDash={!hasPaymentData}
                />
                <MetricCard
                  title="Net revenue"
                  value={metrics.stats.netRevenue}
                  data={metrics.stats.dailyNet}
                  currency={currency}
                  showDash={!hasPaymentData}
                />
                <MetricCard
                  title="New users"
                  value={metrics.stats.newUsers}
                  data={metrics.stats.dailyNewUsers}
                  isCurrency={false}
                  showDash={!hasPaymentData}
                />
                <MetricCard
                  title="MRR"
                  value={metrics.stats.mrr}
                  data={metrics.stats.dailyMrr}
                  currency={currency}
                  showDash={!hasPaymentData}
                />
                <MetricCard
                  title="ARR"
                  value={metrics.stats.arr}
                  data={metrics.stats.dailyMrr.map((point) => ({
                    ...point,
                    value: point.value * 12,
                  }))}
                  currency={currency}
                  showDash={!hasPaymentData}
                />
                <PaymentsBreakdownCard breakdown={metrics.stats.paymentsBreakdown} />
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
