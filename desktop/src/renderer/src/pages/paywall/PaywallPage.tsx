import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PaywallPricing } from "../../components/pricing/PaywallPricing";
import { BackButton } from "../../components/ui";
import { usePricingCheckout } from "../../hooks/usePricingCheckout";
import { useAppStore } from "../../store/useAppStore";

export function PaywallPage() {
  const navigate = useNavigate();
  const {
    isAuthenticated,
    onboardingComplete,
    shortcutTutorialComplete,
    paywallComplete,
  } = useAppStore();

  const finishFree = () => {
    navigate("/");
  };

  const { loadingTier, error, handleSelect } = usePricingCheckout({
    onComplete: finishFree,
    completePaywallOnSuccess: true,
  });

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
    if (!shortcutTutorialComplete) {
      navigate("/try", { replace: true });
      return;
    }
    if (paywallComplete) {
      navigate("/", { replace: true });
    }
  }, [
    isAuthenticated,
    onboardingComplete,
    shortcutTutorialComplete,
    paywallComplete,
    navigate,
  ]);

  const finishFreeWithPaywall = () => {
    useAppStore.getState().completePaywall();
    finishFree();
  };

  const handleTierSelect = async (tierId: Parameters<typeof handleSelect>[0]) => {
    if (tierId === "free") {
      finishFreeWithPaywall();
      return;
    }
    await handleSelect(tierId);
  };

  return (
    <div className="no-drag relative flex h-screen max-h-screen w-full flex-col overflow-y-auto overscroll-contain bg-[#f5f5f7]">
      <BackButton to="/try" />

      <div className="mx-auto flex min-h-full w-full max-w-[820px] flex-1 flex-col items-center justify-start px-8 pb-8 pt-14">
        {error ? (
          <p className="mb-6 text-center text-[13px] text-red-600">{error}</p>
        ) : null}

        <PaywallPricing
          loadingTier={loadingTier}
          onSelect={(id) => void handleTierSelect(id)}
          onStartFree={finishFreeWithPaywall}
        />
      </div>
    </div>
  );
}
