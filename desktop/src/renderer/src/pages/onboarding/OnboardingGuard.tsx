import { Navigate } from "react-router-dom";
import { useAppStore } from "../../store/useAppStore";
import { OnboardingPage } from "./OnboardingPage";

export function OnboardingGuard() {
  const welcomeComplete = useAppStore((s) => s.welcomeComplete);
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const onboardingComplete = useAppStore((s) => s.onboardingComplete);

  if (!welcomeComplete) return <Navigate to="/welcome" replace />;
  if (!isAuthenticated) return <Navigate to="/auth" replace />;
  if (onboardingComplete) return <Navigate to="/" replace />;

  return <OnboardingPage />;
}
