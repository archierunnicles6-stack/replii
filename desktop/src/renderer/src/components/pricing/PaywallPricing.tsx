import { useState } from "react";
import type { BillingInterval, PricingTierId } from "../../lib/pricing";
import {
  BillingToggle,
  ProPlanCard,
  UndetectablePlanCard,
} from "./PaywallPlanCards";

function StarIcon() {
  return (
    <svg className="h-4 w-4 text-[#f59e0b]" viewBox="0 0 20 20" fill="currentColor">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
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
          embedded ? "text-[20px] leading-snug" : "text-[34px] leading-[1.1]"
        }`}
      >
        Unlock all features with Ghost Pro
      </h1>

      <div className={embedded ? "mt-5" : "mt-6"}>
        <BillingToggle interval={interval} onChange={setInterval} />
      </div>

      <div
        className={`grid w-full gap-4 ${
          embedded ? "mt-5 max-w-none" : "mt-12 max-w-[720px] md:grid-cols-2"
        }`}
      >
        <ProPlanCard
          interval={interval}
          loading={loadingTier === "pro"}
          onSelect={() => onSelect("pro")}
        />
        <UndetectablePlanCard
          interval={interval}
          loading={loadingTier === "undetectable"}
          onSelect={() => onSelect("undetectable")}
        />
      </div>

      {!embedded ? (
        <div className="mt-6 flex items-center gap-2">
          <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <StarIcon key={i} />
            ))}
          </div>
          <span className="text-[13px] text-zinc-600">Trusted by 430,000+ users</span>
        </div>
      ) : null}

      {showFreeLink ? (
        <button
          type="button"
          onClick={onStartFree}
          className="mt-5 text-[13px] text-zinc-500 transition-colors hover:text-zinc-800"
        >
          {freeLinkLabel}
        </button>
      ) : null}
    </div>
  );
}
