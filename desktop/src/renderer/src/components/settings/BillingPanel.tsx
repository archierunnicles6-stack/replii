import { useState } from "react";
import { ChoosePlanPricing } from "../pricing/ChoosePlanPricing";
import { usePricingCheckout } from "../../hooks/usePricingCheckout";
import { openStripeBillingPortal } from "../../services/billing";
import { useAppStore } from "../../store/useAppStore";

export function BillingPanel() {
  const user = useAppStore((s) => s.user);
  const { loadingTier, error, handleSelect } = usePricingCheckout();
  const [portalLoading, setPortalLoading] = useState(false);

  const handleManageBilling = async () => {
    if (!user?.id) return;
    setPortalLoading(true);
    try {
      await openStripeBillingPortal(user.id);
    } finally {
      setPortalLoading(false);
    }
  };

  return (
    <ChoosePlanPricing
      loadingTier={loadingTier}
      error={error}
      onSelect={(id) => void handleSelect(id)}
      onManageBilling={() => void handleManageBilling()}
      portalLoading={portalLoading}
    />
  );
}
