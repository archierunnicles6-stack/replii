import type { PricingTier, PricingTierId } from "../../lib/pricing";
import { PRICING_TIERS } from "../../lib/pricing";
import type { Plan } from "../../store/types";
import { normalizeDisplayPlan } from "../../lib/pricing";

function CheckIcon() {
  return (
    <svg
      className="mt-0.5 h-4 w-4 shrink-0 text-[#3b82f6]"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

function PricingCard({
  tier,
  currentPlan,
  loading,
  onSelect,
}: {
  tier: PricingTier;
  currentPlan: Plan;
  loading: boolean;
  onSelect: (id: PricingTierId) => void;
}) {
  const isCurrent = normalizeDisplayPlan(currentPlan) === tier.id;

  return (
    <div className="flex flex-col rounded-2xl border border-zinc-200/90 bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
      <h3 className="text-[15px] font-semibold text-zinc-900">{tier.name}</h3>

      <div className="mt-3 flex items-baseline gap-1">
        <span className="text-[32px] font-semibold leading-none tracking-[-0.03em] text-zinc-900">
          {tier.priceLabel}
        </span>
        {tier.priceSuffix ? (
          <span className="text-[14px] text-zinc-500">{tier.priceSuffix}</span>
        ) : null}
      </div>

      <button
        type="button"
        disabled={loading || isCurrent}
        onClick={() => onSelect(tier.id)}
        className="mt-5 flex h-11 w-full items-center justify-center rounded-xl bg-zinc-900 text-[14px] font-medium text-white transition-opacity hover:bg-zinc-800 disabled:cursor-default disabled:opacity-50"
      >
        {loading ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
        ) : isCurrent ? (
          "Current plan"
        ) : (
          tier.cta
        )}
      </button>

      <p className="mt-4 text-[13px] text-zinc-600">{tier.tagline}</p>

      <div className="my-5 h-px bg-zinc-100" />

      <ul className="space-y-2.5">
        {tier.includesLabel ? (
          <li className="text-[13px] font-semibold text-zinc-900">{tier.includesLabel}</li>
        ) : null}
        {tier.features.map((feature) => (
          <li key={feature} className="flex gap-2.5 text-[13px] leading-snug text-zinc-700">
            <CheckIcon />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function PricingCards({
  currentPlan,
  loadingTier,
  layout = "row",
  onSelect,
}: {
  currentPlan: Plan;
  loadingTier?: PricingTierId | null;
  layout?: "row" | "stack";
  onSelect: (id: PricingTierId) => void;
}) {
  return (
    <div
      className={
        layout === "row"
          ? "grid w-full gap-4 md:grid-cols-3"
          : "space-y-3"
      }
    >
      {PRICING_TIERS.map((tier) => (
        <PricingCard
          key={tier.id}
          tier={tier}
          currentPlan={currentPlan}
          loading={loadingTier === tier.id}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
