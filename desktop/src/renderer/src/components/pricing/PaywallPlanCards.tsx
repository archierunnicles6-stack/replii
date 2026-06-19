import type { ReactNode } from "react";
import type { BillingInterval } from "../../lib/pricing";
import {
  ANNUAL_DISCOUNT_PERCENT,
  ENTERPRISE_TAGLINE,
  PRO_CARD_FEATURES,
  priceForInterval,
} from "../../lib/pricing";

function InfinityIcon({ className }: { className?: string }) {
  return <span className={`inline-block text-[13px] leading-none ${className ?? ""}`}>∞</span>;
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

export function BillingToggle({
  interval,
  onChange,
}: {
  interval: BillingInterval;
  onChange: (interval: BillingInterval) => void;
}) {
  return (
    <div className="inline-flex items-center gap-1 rounded-full bg-zinc-200/80 p-1">
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
        <span className="rounded-full bg-[#3b82f6] px-2 py-0.5 text-[11px] font-semibold text-white">
          Save {ANNUAL_DISCOUNT_PERCENT}%
        </span>
      </button>
    </div>
  );
}

function UpgradeButton({
  variant,
  loading,
  isCurrent = false,
  showDiscount,
  onClick,
}: {
  variant: "light" | "blue";
  loading: boolean;
  isCurrent?: boolean;
  showDiscount: boolean;
  onClick: () => void;
}) {
  const isLight = variant === "light";

  return (
    <button
      type="button"
      disabled={loading || isCurrent}
      onClick={onClick}
      className={`flex h-[52px] w-full items-center justify-center gap-2 rounded-2xl text-[15px] font-semibold transition-opacity disabled:cursor-default disabled:opacity-70 ${
        isLight
          ? "bg-white text-zinc-900 hover:bg-white/95"
          : "bg-gradient-to-b from-[#5aa7f9] to-[#3b82f6] text-white hover:opacity-95"
      }`}
    >
      {loading ? (
        <span
          className={`h-4 w-4 animate-spin rounded-full border-2 border-t-transparent ${
            isLight ? "border-zinc-900" : "border-white"
          }`}
        />
      ) : isCurrent ? (
        "Current plan"
      ) : (
        <>
          Upgrade
          {showDiscount ? (
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                isLight
                  ? "bg-[#dbeafe] text-[#3b82f6]"
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

function FeatureIcon({ icon }: { icon: "infinity" | "check" }) {
  return (
    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/30">
      {icon === "infinity" ? (
        <InfinityIcon className="text-white/90" />
      ) : (
        <CheckIcon className="h-3.5 w-3.5 text-white/90" />
      )}
    </div>
  );
}

export function PricingCardsRow({
  className = "",
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={`flex w-full items-stretch gap-5 ${className}`}>
      {children}
    </div>
  );
}

export function PricingCardColumn({ children }: { children: ReactNode }) {
  return <div className="flex min-w-0 flex-1">{children}</div>;
}

export function ProPlanCard({
  interval,
  loading,
  isCurrent = false,
  onSelect,
}: {
  interval: BillingInterval;
  loading: boolean;
  isCurrent?: boolean;
  onSelect: () => void;
}) {
  const { current, original } = priceForInterval("pro", interval);
  const showDiscount = interval === "annual";

  return (
    <div className="flex h-full min-h-[460px] w-full flex-col rounded-[24px] bg-gradient-to-b from-[#4d9aff] to-[#3b82f6] p-8 shadow-[0_20px_50px_rgba(59,130,246,0.18)]">
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
        {PRO_CARD_FEATURES.map((feature) => (
          <li key={feature.label} className="flex items-center gap-3">
            <FeatureIcon icon={feature.icon} />
            <span className="text-[14px] leading-snug text-white/95">{feature.label}</span>
          </li>
        ))}
      </ul>

      <div className="mt-8">
        <UpgradeButton
          variant="light"
          loading={loading}
          isCurrent={isCurrent}
          showDiscount={showDiscount}
          onClick={onSelect}
        />
      </div>
    </div>
  );
}

export function EnterprisePlanCard({
  onContactSales,
}: {
  onContactSales: () => void;
}) {
  return (
    <div className="flex h-full min-h-[460px] w-full flex-col rounded-[24px] border border-zinc-200 bg-white p-8 shadow-[0_12px_40px_rgba(0,0,0,0.06)]">
      <p className="text-[14px] font-medium text-zinc-600">Enterprise</p>

      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-[40px] font-bold leading-none tracking-[-0.03em] text-zinc-900">
          Custom
        </span>
      </div>

      <p className="mt-2 text-[13px] text-zinc-500">{ENTERPRISE_TAGLINE}</p>

      <div className="mt-auto pt-8">
        <button
          type="button"
          onClick={onContactSales}
          className="flex h-[52px] w-full items-center justify-center rounded-2xl bg-gradient-to-b from-[#5aa7f9] to-[#3b82f6] text-[15px] font-semibold text-white transition-opacity hover:opacity-95"
        >
          Contact Sales
        </button>
      </div>
    </div>
  );
}
