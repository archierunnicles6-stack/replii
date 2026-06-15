import { useState } from "react";
import type { PricingTierId } from "../lib/pricing";
import { pricingTierToPlan } from "../lib/pricing";
import {
  startPricingCheckout,
  syncPlanFromProfile,
} from "../services/billing";
import { useAppStore } from "../store/useAppStore";

export function usePricingCheckout({
  onComplete,
  completePaywallOnSuccess = false,
}: {
  onComplete?: () => void;
  completePaywallOnSuccess?: boolean;
} = {}) {
  const { setPlan, completePaywall, user } = useAppStore();
  const [loadingTier, setLoadingTier] = useState<PricingTierId | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSelect = async (tierId: PricingTierId) => {
    setError(null);

    if (tierId === "free") {
      onComplete?.();
      return;
    }

    setLoadingTier(tierId);

    try {
      if (user?.id && user.email) {
        const started = await startPricingCheckout(tierId, user.id, user.email);
        if (started) {
          const poll = window.setInterval(async () => {
            const remotePlan = await syncPlanFromProfile(user.id);
            if (remotePlan && remotePlan !== "free") {
              window.clearInterval(poll);
              setPlan(remotePlan);
              if (completePaywallOnSuccess) completePaywall();
              setLoadingTier(null);
              onComplete?.();
            }
          }, 3000);
          window.setTimeout(() => window.clearInterval(poll), 120_000);
          return;
        }
      }

      setPlan(pricingTierToPlan(tierId));
      if (completePaywallOnSuccess) completePaywall();
      onComplete?.();
    } catch {
      setError("Could not start checkout. Try again or continue on the free plan.");
    } finally {
      setLoadingTier(null);
    }
  };

  return { loadingTier, error, handleSelect };
}
