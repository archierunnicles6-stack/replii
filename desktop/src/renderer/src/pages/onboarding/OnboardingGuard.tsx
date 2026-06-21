import { Navigate } from "react-router-dom";
import { getOnboardingFunnelRoute } from "../../lib/onboarding-flow";
import { useAppStore } from "../../store/useAppStore";
import { OnboardingPage } from "./OnboardingPage";

export function OnboardingGuard() {
  const welcomeComplete = useAppStore((s) => s.welcomeComplete);
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const onboardingComplete = useAppStore((s) => s.onboardingComplete);
  const shortcutTutorialComplete = useAppStore((s) => s.shortcutTutorialComplete);
  const paywallComplete = useAppStore((s) => s.paywallComplete);
  const plan = useAppStore((s) => s.plan);

  if (!welcomeComplete) return <Navigate to="/welcome" replace />;
  if (!isAuthenticated) return <Navigate to="/auth" replace />;

  if (onboardingComplete) {
    const next = getOnboardingFunnelRoute({
      onboardingComplete,
      shortcutTutorialComplete,
      paywallComplete,
      plan,
    });
    return <Navigate to={next ?? "/"} replace />;
  }

  return <OnboardingPage />;
}
