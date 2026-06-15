import { useState } from "react";
import type { BillingInterval, PricingTierId } from "../../lib/pricing";
import {
  ANNUAL_DISCOUNT_PERCENT,
  priceForInterval,
} from "../../lib/pricing";

const PRESS_LOGOS = ["Forbes", "The New York Times", "TechCrunch", "Business Insider"];

const PRO_FEATURES = [
  { icon: "infinity" as const, label: "Unlimited AI responses" },
  { icon: "infinity" as const, label: "Unlimited meeting sessions" },
  { icon: "check" as const, label: "Access to newest AI models" },
  { icon: "check" as const, label: "Priority chat support" },
];

function InfinityIcon({ className }: { className?: string }) {
  return <span className={`inline-block text-[15px] leading-none ${className ?? ""}`}>∞</span>;
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg className="h-4 w-4 text-[#f59e0b]" viewBox="0 0 20 20" fill="currentColor">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
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
    <div className="inline-flex items-center gap-1 rounded-full bg-zinc-100 p-1">
      <button
        type="button"
        onClick={() => onChange("monthly")}
        className={`rounded-full px-5 py-2 text-[13px] font-medium transition-all ${
          interval === "monthly"
            ? "bg-white text-zinc-900 shadow-sm"
            : "text-zinc-500 hover:text-zinc-700"
        }`}
      >
        Monthly
      </button>
      <button
        type="button"
        onClick={() => onChange("annual")}
        className={`flex items-center gap-2 rounded-full px-5 py-2 text-[13px] font-medium transition-all ${
          interval === "annual"
            ? "bg-white text-zinc-900 shadow-sm"
            : "text-zinc-500 hover:text-zinc-700"
        }`}
      >
        Annual
        <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-[#3b82f6] shadow-sm ring-1 ring-zinc-200/80">
          Save {ANNUAL_DISCOUNT_PERCENT}%
        </span>
      </button>
    </div>
  );
}

function UpgradeButton({
  variant,
  loading,
  showDiscount,
  onClick,
}: {
  variant: "light" | "blue";
  loading: boolean;
  showDiscount: boolean;
  onClick: () => void;
}) {
  const isLight = variant === "light";

  return (
    <button
      type="button"
      disabled={loading}
      onClick={onClick}
      className={`mt-auto flex h-[52px] w-full items-center justify-center gap-2 rounded-2xl text-[15px] font-semibold transition-opacity disabled:opacity-60 ${
        isLight
          ? "bg-white text-[#2563eb] hover:bg-white/95"
          : "bg-[#3b82f6] text-white hover:bg-[#2563eb]"
      }`}
    >
      {loading ? (
        <span
          className={`h-4 w-4 animate-spin rounded-full border-2 border-t-transparent ${
            isLight ? "border-[#2563eb]" : "border-white"
          }`}
        />
      ) : (
        <>
          Upgrade
          {showDiscount ? (
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                isLight
                  ? "bg-[#dbeafe] text-[#2563eb]"
                  : "bg-white/20 text-white"
              }`}
            >
              -{ANNUAL_DISCOUNT_PERCENT}%
            </span>
          ) : null}
        </>
      )}
    </button>
  );
}

function LaptopIllustration() {
  return (
    <div className="pointer-events-none absolute bottom-0 right-0 h-[58%] w-[72%] overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-white/40 to-transparent" />
      <div className="absolute bottom-6 right-6 w-[88%]">
        <div className="rounded-xl border border-zinc-200/80 bg-zinc-50 p-3 shadow-[0_12px_40px_rgba(0,0,0,0.08)]">
          <div className="mb-2 flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-zinc-300" />
            <span className="h-2 w-2 rounded-full bg-zinc-300" />
            <span className="h-2 w-2 rounded-full bg-zinc-300" />
          </div>
          <div className="relative aspect-[16/10] overflow-hidden rounded-lg bg-zinc-100">
            <div className="absolute inset-3 rounded-md border-2 border-dashed border-[#3b82f6]/70 bg-[#eff6ff]/80" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-10 w-10 rounded-full bg-white/80 shadow-sm" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProCard({
  interval,
  loading,
  onSelect,
}: {
  interval: BillingInterval;
  loading: boolean;
  onSelect: () => void;
}) {
  const { current, original } = priceForInterval("pro", interval);
  const showDiscount = interval === "annual";

  return (
    <div className="flex min-h-[420px] flex-col rounded-[24px] bg-gradient-to-br from-[#3b82f6] via-[#3b82f6] to-[#2563eb] p-6 shadow-[0_20px_50px_rgba(59,130,246,0.25)]">
      <p className="text-[14px] font-medium text-white/80">Pro plan</p>

      <div className="mt-4 flex items-baseline gap-2">
        {original ? (
          <span className="text-[15px] text-white/50 line-through">{original}</span>
        ) : null}
        <span className="text-[40px] font-bold leading-none tracking-[-0.03em] text-white">
          {current}
        </span>
        <span className="text-[15px] text-white/70">/month</span>
      </div>

      <ul className="mt-8 flex-1 space-y-4">
        {PRO_FEATURES.map((feature) => (
          <li key={feature.label} className="flex items-start gap-3">
            {feature.icon === "infinity" ? (
              <InfinityIcon className="mt-px w-4 shrink-0 text-center text-white/90" />
            ) : (
              <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-white/90" />
            )}
            <span className="text-[14px] leading-snug text-white/95">{feature.label}</span>
          </li>
        ))}
      </ul>

      <div className="mt-6">
        <UpgradeButton
          variant="light"
          loading={loading}
          showDiscount={showDiscount}
          onClick={onSelect}
        />
      </div>
    </div>
  );
}

function UndetectableCard({
  interval,
  loading,
  onSelect,
}: {
  interval: BillingInterval;
  loading: boolean;
  onSelect: () => void;
}) {
  const { current, original } = priceForInterval("undetectable", interval);
  const showDiscount = interval === "annual";

  return (
    <div className="relative flex min-h-[420px] flex-col overflow-hidden rounded-[24px] border border-zinc-200/90 bg-white p-6 shadow-[0_12px_40px_rgba(0,0,0,0.06)]">
      <LaptopIllustration />

      <div className="relative z-10 flex items-start justify-between gap-3">
        <p className="text-[14px] font-medium text-zinc-500">Pro + Undetectability</p>
        <span className="shrink-0 rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-semibold text-zinc-500">
          Popular
        </span>
      </div>

      <div className="relative z-10 mt-4 flex items-baseline gap-2">
        {original ? (
          <span className="text-[15px] text-zinc-400 line-through">{original}</span>
        ) : null}
        <span className="text-[40px] font-bold leading-none tracking-[-0.03em] text-zinc-900">
          {current}
        </span>
        <span className="text-[15px] text-zinc-500">/month</span>
      </div>

      <div className="relative z-10 mt-8 flex items-start gap-3">
        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#3b82f6]">
          <CheckIcon className="h-3.5 w-3.5 text-white" />
        </div>
        <div>
          <p className="text-[14px] font-semibold text-zinc-900">Ghost Undetectability</p>
          <p className="mt-1 text-[13px] leading-snug text-zinc-500">
            Ghost stays hidden from screen share and recordings.
          </p>
        </div>
      </div>

      <div className="relative z-10 mt-auto pt-8">
        <UpgradeButton
          variant="blue"
          loading={loading}
          showDiscount={showDiscount}
          onClick={onSelect}
        />
      </div>
    </div>
  );
}

export function PaywallPricing({
  loadingTier,
  onSelect,
  onStartFree,
  freeLinkLabel = "Start with free →",
  showFreeLink = true,
  variant = "page",
}: {
  loadingTier?: PricingTierId | null;
  onSelect: (id: PricingTierId) => void;
  onStartFree: () => void;
  freeLinkLabel?: string;
  showFreeLink?: boolean;
  variant?: "page" | "embedded";
}) {
  const [interval, setInterval] = useState<BillingInterval>("annual");
  const embedded = variant === "embedded";

  return (
    <div className="flex w-full flex-col items-center">
      <h1
        className={`text-center font-bold tracking-[-0.03em] text-zinc-900 ${
          embedded ? "text-[20px] leading-snug" : "text-[32px]"
        }`}
      >
        Unlock all features with Ghost Pro
      </h1>

      {!embedded ? (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
          {PRESS_LOGOS.map((name) => (
            <span
              key={name}
              className={`whitespace-nowrap text-[12px] font-semibold tracking-wide text-zinc-400 ${
                name === "The New York Times" ? "font-serif italic" : "uppercase"
              }`}
            >
              {name}
            </span>
          ))}
        </div>
      ) : null}

      <div className={embedded ? "mt-5" : "mt-8"}>
        <BillingToggle interval={interval} onChange={setInterval} />
      </div>

      <div
        className={`mt-8 grid w-full gap-4 ${
          embedded ? "max-w-none" : "max-w-[720px] md:grid-cols-2"
        }`}
      >
        <ProCard
          interval={interval}
          loading={loadingTier === "pro"}
          onSelect={() => onSelect("pro")}
        />
        <UndetectableCard
          interval={interval}
          loading={loadingTier === "undetectable"}
          onSelect={() => onSelect("undetectable")}
        />
      </div>

      {!embedded ? (
        <div className="mt-8 flex items-center gap-2">
          <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <StarIcon key={i} />
            ))}
          </div>
          <span className="text-[13px] text-zinc-500">Trusted by 430,000+ users</span>
        </div>
      ) : null}

      {showFreeLink ? (
        <button
          type="button"
          onClick={onStartFree}
          className="mt-6 text-[13px] text-zinc-400 transition-colors hover:text-zinc-600"
        >
          {freeLinkLabel}
        </button>
      ) : null}
    </div>
  );
}
