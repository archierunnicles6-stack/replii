import type { PricingTierId } from "../../lib/pricing";
import { normalizeDisplayPlan } from "../../lib/pricing";
import type { Plan } from "../../store/types";
import {
  ProPlanCard,
  EnterprisePlanCard,
  PricingCardColumn,
  PricingCardsRow,
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
    <PricingCardsRow className={layout === "stack" ? "flex-col" : ""}>
      <PricingCardColumn>
        <ProPlanCard
          interval={interval}
          loading={loadingTier === "pro"}
          isCurrent={displayPlan === "pro"}
          onSelect={() => onSelect("pro")}
        />
      </PricingCardColumn>
      <PricingCardColumn>
        <EnterprisePlanCard onContactSales={onContactSales} />
      </PricingCardColumn>
    </PricingCardsRow>
  );
}
