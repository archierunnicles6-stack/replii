import { useState } from "react";
import type { BillingInterval, PricingTierId } from "../lib/pricing";
import { ENTERPRISE_SALES_MAILTO } from "../lib/pricing";
import {
  startPricingCheckout,
  syncBillingState,
} from "../services/billing";
import { useAppStore } from "../store/useAppStore";

export function usePricingCheckout({
  onComplete,
  completePaywallOnSuccess = false,
}: {
  onComplete?: () => void;
  completePaywallOnSuccess?: boolean;
} = {}) {
  const { completePaywall, user } = useAppStore();
  const [loadingTier, setLoadingTier] = useState<PricingTierId | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleContactSales = () => {
    void window.ghost?.openExternal?.(ENTERPRISE_SALES_MAILTO);
  };

  const handleSelect = async (tierId: PricingTierId, interval: BillingInterval) => {
    setError(null);

    if (tierId === "enterprise") {
      handleContactSales();
      return;
    }

    if (tierId === "free") {
      onComplete?.();
      return;
    }

    setLoadingTier(tierId);

    try {
      if (!user?.id || !user.email) {
        setError("Sign in to subscribe.");
        setLoadingTier(null);
        return;
      }

      const result = await startPricingCheckout(tierId, user.id, user.email, interval);
      if (!result.ok) {
        setError(result.error);
        setLoadingTier(null);
        return;
      }

      const poll = window.setInterval(async () => {
        const remotePlan = await syncBillingState(user.id);
        if (remotePlan && remotePlan !== "free") {
          window.clearInterval(poll);
          if (completePaywallOnSuccess) completePaywall();
          setLoadingTier(null);
          onComplete?.();
        }
      }, 3000);
      window.setTimeout(() => {
        window.clearInterval(poll);
        setLoadingTier(null);
      }, 300_000);
    } catch {
      setError("Could not start checkout. Try again or continue on the free plan.");
      setLoadingTier(null);
    }
  };

  return { loadingTier, error, handleSelect, handleContactSales };
}
