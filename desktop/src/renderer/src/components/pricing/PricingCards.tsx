import type { PricingTierId } from "../../lib/pricing";
import { normalizeDisplayPlan } from "../../lib/pricing";
import type { Plan } from "../../store/types";
import {
  ProPlanCard,
  EnterprisePlanCard,
} from "./PaywallPlanCards";

export function PricingCards({
  currentPlan,
  loadingTier,
  interval,
  layout = "row",
  onSelect,
  onContactSales,
}: {
  currentPlan: Plan;
  loadingTier?: PricingTierId | null;
  interval: "monthly" | "annual";
  layout?: "row" | "stack";
  onSelect: (id: PricingTierId) => void;
  onContactSales: () => void;
}) {
  const displayPlan = normalizeDisplayPlan(currentPlan);

  return (
    <div
      className={
        layout === "row"
          ? "grid w-full gap-4 md:grid-cols-2"
          : "space-y-4"
      }
    >
      <ProPlanCard
        interval={interval}
        loading={loadingTier === "pro"}
        isCurrent={displayPlan === "pro"}
        onSelect={() => onSelect("pro")}
      />
      <EnterprisePlanCard onContactSales={onContactSales} />
    </div>
  );
}
