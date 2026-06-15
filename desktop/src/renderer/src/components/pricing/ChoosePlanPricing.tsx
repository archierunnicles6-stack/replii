import { useState } from "react";
import type { BillingInterval, PricingTierId } from "../../lib/pricing";
import {
  ANNUAL_DISCOUNT_PERCENT,
  priceForInterval,
} from "../../lib/pricing";
import type { Plan } from "../../store/types";
import { isPaidPlan } from "../../store/types";
import { normalizeDisplayPlan } from "../../lib/pricing";
import { useAppStore } from "../../store/useAppStore";

const PRO_FEATURES = [
  "Unlimited AI responses",
  "Access to newest AI models",
  "Priority chat support",
];

const FREE_FEATURES = [
  "Limited AI responses a day",
  "Ask AI about past meetings",
  "Unlimited meeting notetaking",
  "Customize AI instructions",
];

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

function BillingToggle({
  interval,
  onChange,
}: {
  interval: BillingInterval;
  onChange: (interval: BillingInterval) => void;
}) {
  return (
    <div className="inline-flex shrink-0 items-center rounded-full bg-zinc-100 p-1">
      <button
        type="button"
        onClick={() => onChange("monthly")}
        className={`rounded-full px-4 py-1.5 text-[13px] font-medium transition-all ${
          interval === "monthly"
            ? "bg-[#3b82f6] text-white shadow-sm"
            : "text-zinc-500 hover:text-zinc-700"
        }`}
      >
        Monthly
      </button>
      <button
        type="button"
        onClick={() => onChange("annual")}
        className={`rounded-full px-4 py-1.5 text-[13px] font-medium transition-all ${
          interval === "annual"
            ? "bg-[#3b82f6] text-white shadow-sm"
            : "text-zinc-500 hover:text-zinc-700"
        }`}
      >
        Yearly
      </button>
    </div>
  );
}

function UpgradeButton({
  loading,
  isCurrent,
  variant,
  onClick,
}: {
  loading: boolean;
  isCurrent: boolean;
  variant: "pro" | "undetectable";
  onClick: () => void;
}) {
  const isPro = variant === "pro";

  return (
    <button
      type="button"
      disabled={loading || isCurrent}
      onClick={onClick}
      className={`flex h-11 w-full items-center justify-center rounded-xl text-[14px] font-semibold text-white transition-opacity disabled:cursor-default disabled:opacity-70 ${
        isPro
          ? "bg-white/25 hover:bg-white/30"
          : "bg-white/10 hover:bg-white/15"
      }`}
    >
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
      ) : isCurrent ? (
        "Current plan"
      ) : (
        "Upgrade"
      )}
    </button>
  );
}

function VideoCallBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#2a3444] via-[#1e2633] to-[#151b24]" />
      <div className="absolute bottom-0 right-0 h-[72%] w-[78%]">
        <div className="absolute inset-0 rounded-tl-2xl bg-gradient-to-tl from-[#3d4a5c]/80 to-transparent" />
        <div className="absolute bottom-4 right-4 w-[90%] overflow-hidden rounded-xl border border-white/10 bg-[#1a2230] shadow-2xl">
          <div className="flex items-center gap-1.5 border-b border-white/5 px-3 py-2">
            <span className="h-2 w-2 rounded-full bg-white/20" />
            <span className="h-2 w-2 rounded-full bg-white/20" />
            <span className="h-2 w-2 rounded-full bg-white/20" />
          </div>
          <div className="relative aspect-[16/10] bg-[#252f3f]">
            <div className="absolute left-[18%] top-[22%] h-[52%] w-[38%] rounded-lg border-2 border-dashed border-[#60a5fa]/80 bg-[#3b82f6]/10" />
            <div className="absolute left-[24%] top-[30%] h-[28%] w-[26%] rounded-full bg-gradient-to-br from-[#4b5563] to-[#374151]" />
            <div className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-lg bg-black/40 backdrop-blur-sm">
              <svg className="h-4 w-4 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProPlanCard({
  interval,
  loading,
  isCurrent,
  onSelect,
}: {
  interval: BillingInterval;
  loading: boolean;
  isCurrent: boolean;
  onSelect: () => void;
}) {
  const { current, original } = priceForInterval("pro", interval);

  return (
    <div className="flex min-h-[340px] flex-col rounded-2xl bg-gradient-to-br from-[#5b9fd4] via-[#4a8fc8] to-[#3b7fbd] p-5 shadow-[0_8px_32px_rgba(59,130,246,0.2)]">
      <div className="flex items-center gap-2">
        <p className="text-[14px] font-medium text-white/90">Pro plan</p>
        <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold text-white">
          Popular
        </span>
      </div>

      <div className="mt-3 flex items-baseline gap-1.5">
        {original ? (
          <span className="text-[14px] text-white/50 line-through">{original}</span>
        ) : null}
        <span className="text-[36px] font-bold leading-none tracking-[-0.03em] text-white">
          {current}
        </span>
        <span className="text-[14px] text-white/75">/ month</span>
      </div>

      <p className="mt-6 text-[13px] font-medium text-white/80">Everything in Free, and:</p>

      <ul className="mt-3 flex-1 space-y-2.5">
        {PRO_FEATURES.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5">
            <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-white/90" />
            <span className="text-[13px] leading-snug text-white/95">{feature}</span>
          </li>
        ))}
      </ul>

      <div className="mt-5">
        <UpgradeButton
          variant="pro"
          loading={loading}
          isCurrent={isCurrent}
          onClick={onSelect}
        />
      </div>
    </div>
  );
}

function UndetectablePlanCard({
  interval,
  loading,
  isCurrent,
  onSelect,
}: {
  interval: BillingInterval;
  loading: boolean;
  isCurrent: boolean;
  onSelect: () => void;
}) {
  const { current, original } = priceForInterval("undetectable", interval);

  return (
    <div className="relative flex min-h-[340px] flex-col overflow-hidden rounded-2xl p-5 shadow-[0_8px_32px_rgba(0,0,0,0.15)]">
      <VideoCallBackdrop />

      <div className="relative z-10 flex flex-1 flex-col">
        <p className="text-[14px] font-medium text-white/90">Pro + Undetectability</p>

        <div className="mt-3 flex items-baseline gap-1.5">
          {original ? (
            <span className="text-[14px] text-white/50 line-through">{original}</span>
          ) : null}
          <span className="text-[36px] font-bold leading-none tracking-[-0.03em] text-white">
            {current}
          </span>
          <span className="text-[14px] text-white/75">/ month</span>
        </div>

        <p className="mt-6 text-[13px] font-medium text-white/80">Everything in Pro, and:</p>

        <div className="mt-3 flex flex-1 items-start gap-2.5">
          <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#3b82f6]">
            <CheckIcon className="h-3 w-3 text-white" />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-white">Ghost Undetectability</p>
            <p className="mt-0.5 text-[12px] leading-snug text-white/65">
              Ghost will be invisible to screen share during meetings.
            </p>
          </div>
        </div>

        <div className="mt-5">
          <UpgradeButton
            variant="undetectable"
            loading={loading}
            isCurrent={isCurrent}
            onClick={onSelect}
          />
        </div>
      </div>
    </div>
  );
}

function FreePlanStrip({ currentPlan }: { currentPlan: Plan }) {
  const isCurrent = normalizeDisplayPlan(currentPlan) === "free";

  return (
    <div className="mt-4 rounded-2xl border border-zinc-200/90 bg-zinc-50/80 px-5 py-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="shrink-0">
          <p className="text-[14px] font-semibold text-zinc-900">
            Free plan
            {isCurrent ? (
              <span className="ml-2 text-[11px] font-medium text-zinc-400">(current)</span>
            ) : null}
          </p>
          <p className="mt-0.5 text-[22px] font-bold tracking-[-0.02em] text-zinc-900">$0</p>
        </div>

        <div className="grid flex-1 gap-x-8 gap-y-2 sm:grid-cols-2">
          {FREE_FEATURES.map((feature) => (
            <div key={feature} className="flex items-center gap-2">
              <CheckIcon className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
              <span className="text-[12px] text-zinc-600">{feature}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ChoosePlanPricing({
  loadingTier,
  error,
  onSelect,
  onManageBilling,
  portalLoading,
}: {
  loadingTier?: PricingTierId | null;
  error?: string | null;
  onSelect: (id: PricingTierId) => void;
  onManageBilling?: () => void;
  portalLoading?: boolean;
}) {
  const plan = useAppStore((s) => s.plan);
  const [interval, setInterval] = useState<BillingInterval>("monthly");
  const displayPlan = normalizeDisplayPlan(plan);

  const handleTalkToSales = () => {
    void window.ghost?.openExternal?.("mailto:sales@ghost.app?subject=Ghost%20Enterprise");
  };

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-[22px] font-bold tracking-[-0.02em] text-zinc-900">
            Choose your Plan
          </h2>
          <p className="mt-1 text-[13px] text-zinc-500">
            Interested in Enterprise offering?{" "}
            <button
              type="button"
              onClick={handleTalkToSales}
              className="font-medium text-[#3b82f6] hover:underline"
            >
              Talk to sales
            </button>
            {isPaidPlan(plan) && onManageBilling ? (
              <>
                {" · "}
                <button
                  type="button"
                  disabled={portalLoading}
                  onClick={onManageBilling}
                  className="font-medium text-zinc-600 hover:text-zinc-900 disabled:opacity-60"
                >
                  {portalLoading ? "Opening…" : "Manage subscription"}
                </button>
              </>
            ) : null}
          </p>
        </div>

        <BillingToggle interval={interval} onChange={setInterval} />
      </div>

      {interval === "annual" ? (
        <p className="mt-2 text-right text-[11px] font-medium text-[#3b82f6]">
          Save {ANNUAL_DISCOUNT_PERCENT}% with yearly billing
        </p>
      ) : null}

      {error ? <p className="mt-3 text-[13px] text-red-600">{error}</p> : null}

      <div className="mt-5 grid grid-cols-2 gap-3">
        <ProPlanCard
          interval={interval}
          loading={loadingTier === "pro"}
          isCurrent={displayPlan === "pro"}
          onSelect={() => onSelect("pro")}
        />
        <UndetectablePlanCard
          interval={interval}
          loading={loadingTier === "undetectable"}
          isCurrent={displayPlan === "undetectable"}
          onSelect={() => onSelect("undetectable")}
        />
      </div>

      <FreePlanStrip currentPlan={plan} />
    </div>
  );
}
