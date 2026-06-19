import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PaywallPricing } from "../../components/pricing/PaywallPricing";
import { BackButton } from "../../components/ui";
import { usePricingCheckout } from "../../hooks/usePricingCheckout";
import { useBillingSync } from "../../hooks/useBillingSync";
import { hasDashboardAccess } from "../../lib/dashboard-access";
import { getFreeOverlaySecondsRemaining } from "../../store/types";
import { useAppStore } from "../../store/useAppStore";

export function PaywallPage() {
  const navigate = useNavigate();
  const {
    isAuthenticated,
    onboardingComplete,
    paywallComplete,
    plan,
  } = useAppStore();
  const freeOverlaySecondsUsed = useAppStore((s) => s.freeOverlaySecondsUsed);
  const freeOverlaySecondsRemaining = getFreeOverlaySecondsRemaining(
    plan,
    freeOverlaySecondsUsed,
  );

  const finishFree = () => {
    navigate("/");
  };

  const { loadingTier, error, handleSelect, handleContactSales } = usePricingCheckout({
    onComplete: finishFree,
    returnToAfterPurchase: "dashboard",
  });
  useBillingSync();

  useEffect(() => {
    void window.ghost?.setDashboardLayout?.("paywall");
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth", { replace: true });
      return;
    }
    if (!onboardingComplete) {
      navigate("/onboarding", { replace: true });
      return;
    }
    if (hasDashboardAccess(plan, paywallComplete)) {
      navigate("/", { replace: true });
    }
  }, [
    isAuthenticated,
    onboardingComplete,
    paywallComplete,
    plan,
    navigate,
  ]);

  const finishFreeWithPaywall = () => {
    useAppStore.getState().completePaywall();
    finishFree();
  };

  const handleTierSelect = async (
    tierId: Parameters<typeof handleSelect>[0],
    interval: Parameters<typeof handleSelect>[1],
  ) => {
    if (tierId === "free") {
      finishFreeWithPaywall();
      return;
    }
    await handleSelect(tierId, interval);
  };

  return (
    <div className="no-drag relative flex h-screen max-h-screen w-full flex-col overflow-y-auto overscroll-contain bg-gradient-to-b from-[#e4ebf3] via-[#eef2f7] to-[#f3f5f8]">
      <BackButton to="/" />

      <div className="mx-auto flex min-h-full w-full max-w-[1120px] flex-1 flex-col items-center justify-start px-8 pb-10 pt-16">
        {error ? (
          <p className="mb-6 text-center text-[13px] text-red-600">{error}</p>
        ) : null}

        <PaywallPricing
          loadingTier={loadingTier}
          onSelect={(id, interval) => void handleTierSelect(id, interval)}
          onContactSales={handleContactSales}
          onStartFree={finishFreeWithPaywall}
          freeOverlaySecondsRemaining={
            Number.isFinite(freeOverlaySecondsRemaining)
              ? freeOverlaySecondsRemaining
              : undefined
          }
        />
      </div>
    </div>
  );
}
