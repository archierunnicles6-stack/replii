import { Navigate } from "react-router-dom";
import { hasDashboardAccess } from "../../lib/dashboard-access";
import { useAppStore } from "../../store/useAppStore";
import { OnboardingPage } from "./OnboardingPage";

export function OnboardingGuard() {
  const welcomeComplete = useAppStore((s) => s.welcomeComplete);
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const onboardingComplete = useAppStore((s) => s.onboardingComplete);
  const shortcutTutorialComplete = useAppStore((s) => s.shortcutTutorialComplete);
  const plan = useAppStore((s) => s.plan);
  const paywallComplete = useAppStore((s) => s.paywallComplete);

  if (!welcomeComplete) return <Navigate to="/welcome" replace />;
  if (!isAuthenticated) return <Navigate to="/auth" replace />;
  if (onboardingComplete) {
    if (!shortcutTutorialComplete) return <Navigate to="/try" replace />;
    return (
      <Navigate
        to={hasDashboardAccess(plan, paywallComplete) ? "/" : "/paywall"}
        replace
      />
    );
  }

  return <OnboardingPage />;
}
