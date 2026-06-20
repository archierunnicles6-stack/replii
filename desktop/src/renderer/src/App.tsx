import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { useEffect } from "react";
import { useAuthBootstrap } from "./hooks/useAuthBootstrap";
import { useAuthCallback } from "./hooks/useAuthCallback";
import { useBillingReturn } from "./hooks/useBillingReturn";
import { bootstrapOpenAIKey } from "./services/whisper";
import { resolveApiBase } from "./lib/billing-api-base";
import { MicHelperApp } from "./mic/MicHelperApp";
import { useAppStore } from "./store/useAppStore";
import { WelcomePage } from "./pages/welcome/WelcomePage";
import { AuthPage } from "./pages/auth/AuthPage";
import { OnboardingGuard } from "./pages/onboarding/OnboardingGuard";
import { TryRepliiPage } from "./pages/try-replii/TryRepliiPage";
import { PaywallPage } from "./pages/paywall/PaywallPage";
import { OverlayApp } from "./overlay/OverlayApp";
import { DashboardLayout } from "./pages/dashboard/DashboardLayout";
import { ActivityPage } from "./pages/dashboard/ActivityPage";
import { MeetingDetailPage } from "./pages/dashboard/MeetingDetailPage";
import { UpcomingPage } from "./pages/dashboard/UpcomingPage";
import { AdminGuard } from "./pages/admin/AdminGuard";

function RootRedirect() {
  const welcomeComplete = useAppStore((s) => s.welcomeComplete);
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const onboardingComplete = useAppStore((s) => s.onboardingComplete);
  if (!welcomeComplete) return <Navigate to="/welcome" replace />;
  if (!isAuthenticated) return <Navigate to="/auth" replace />;
  if (!onboardingComplete) return <Navigate to="/onboarding" replace />;

  return <Navigate to="/" replace />;
}

function DashboardGuard() {
  const welcomeComplete = useAppStore((s) => s.welcomeComplete);
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const onboardingComplete = useAppStore((s) => s.onboardingComplete);
  if (!welcomeComplete) return <Navigate to="/welcome" replace />;
  if (!isAuthenticated) return <Navigate to="/auth" replace />;
  if (!onboardingComplete) return <Navigate to="/onboarding" replace />;

  return <DashboardLayout />;
}

function AppRoutes() {
  const raw = window.location.hash.replace(/^#/, "") || "/";
  const hash = raw.startsWith("/") ? raw : `/${raw}`;
  if (hash.startsWith("/mic-helper")) return <MicHelperApp />;
  if (hash.startsWith("/overlay")) return <OverlayApp />;

  return (
    <Routes>
      <Route path="/welcome" element={<WelcomePage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/onboarding" element={<OnboardingGuard />} />
      <Route path="/try" element={<TryRepliiPage />} />
      <Route path="/paywall" element={<PaywallPage />} />
      <Route element={<DashboardGuard />}>
        <Route path="/" element={<ActivityPage />} />
        <Route path="/upcoming" element={<UpcomingPage />} />
        <Route path="/meetings/:id" element={<MeetingDetailPage />} />
        <Route path="/admin" element={<AdminGuard />} />
      </Route>
      <Route path="/*" element={<RootRedirect />} />
    </Routes>
  );
}

function AppShell() {
  useBillingReturn();
  useAuthCallback();

  return <AppRoutes />;
}

export default function App() {
  useAuthBootstrap();

  useEffect(() => {
    void bootstrapOpenAIKey();
    void resolveApiBase();
  }, []);

  return (
    <HashRouter>
      <AppShell />
    </HashRouter>
  );
}
