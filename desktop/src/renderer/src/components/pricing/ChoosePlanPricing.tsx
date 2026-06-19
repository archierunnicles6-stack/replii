import { useState } from "react";
import type { BillingInterval, PricingTierId } from "../../lib/pricing";
import {
  PRICING_TIERS,
  STARTER_FEATURES,
  normalizeDisplayPlan,
} from "../../lib/pricing";
import type { Plan } from "../../store/types";
import { isPaidPlan } from "../../store/types";
import { useAppStore } from "../../store/useAppStore";
import {
  BillingToggle,
  EnterprisePlanCard,
  PricingCardColumn,
  PricingCardsRow,
  ProPlanCard,
} from "./PaywallPlanCards";
import { legalLinks, openLegalLink } from "../../lib/legal-urls";

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

function FreePlanStrip({ currentPlan }: { currentPlan: Plan }) {
  const starter = PRICING_TIERS[0];
  const isCurrent = normalizeDisplayPlan(currentPlan) === "free";

  return (
    <div className="mt-4 rounded-2xl border border-zinc-200/90 bg-zinc-50/80 px-5 py-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="shrink-0">
          <p className="text-[14px] font-semibold text-zinc-900">
            {starter.name} plan
            {isCurrent ? (
              <span className="ml-2 text-[11px] font-medium text-zinc-400">(current)</span>
            ) : null}
          </p>
          <p className="mt-0.5 text-[22px] font-bold tracking-[-0.02em] text-zinc-900">
            {starter.priceLabel}
          </p>
        </div>

        <div className="grid flex-1 gap-x-8 gap-y-2 sm:grid-cols-2">
          {STARTER_FEATURES.map((feature) => (
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
  onContactSales,
  onManageBilling,
  portalLoading,
}: {
  loadingTier?: PricingTierId | null;
  error?: string | null;
  onSelect: (id: PricingTierId, interval: BillingInterval) => void;
  onContactSales: () => void;
  onManageBilling?: () => void;
  portalLoading?: boolean;
}) {
  const plan = useAppStore((s) => s.plan);
  const [interval, setInterval] = useState<BillingInterval>("monthly");
  const displayPlan = normalizeDisplayPlan(plan);
  const showManageBilling = isPaidPlan(plan) && onManageBilling;

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-[22px] font-bold tracking-[-0.02em] text-zinc-900">
            Choose your Plan
          </h2>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          {showManageBilling ? (
            <button
              type="button"
              disabled={portalLoading}
              onClick={onManageBilling}
              className="flex h-10 items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 text-[13px] font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:cursor-default disabled:opacity-60"
            >
              {portalLoading ? (
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-zinc-400 border-t-transparent" />
              ) : (
                <svg className="h-4 w-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              )}
              {portalLoading ? "Opening…" : "Manage billing"}
            </button>
          ) : null}
          <BillingToggle interval={interval} onChange={setInterval} />
        </div>
      </div>

      {error ? <p className="mt-3 text-[13px] text-red-600">{error}</p> : null}

      <PricingCardsRow className="mt-5">
        <PricingCardColumn>
          <ProPlanCard
            interval={interval}
            loading={loadingTier === "pro"}
            isCurrent={displayPlan === "pro"}
            onSelect={() => onSelect("pro", interval)}
          />
        </PricingCardColumn>
        <PricingCardColumn>
          <EnterprisePlanCard onContactSales={onContactSales} />
        </PricingCardColumn>
      </PricingCardsRow>

      <FreePlanStrip currentPlan={plan} />

      <p className="mt-4 text-[11px] leading-relaxed text-zinc-400">
        Paid plans renew automatically until cancelled. Manage or cancel anytime
        via <span className="font-medium text-zinc-500">Manage billing</span>.
        Payments are processed by Stripe. By subscribing you agree to our{" "}
        <button
          type="button"
          onClick={() => openLegalLink(legalLinks.terms)}
          className="text-zinc-500 underline decoration-zinc-300 hover:text-zinc-600"
        >
          Terms of Service
        </button>
        .
      </p>
    </div>
  );
}
