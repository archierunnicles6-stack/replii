import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { MicPermissionBanner } from "../../components/MicPermissionBanner";
import { MeetingSummaryWorker } from "../../components/MeetingSummaryWorker";
import { DashboardTopBar } from "../../components/dashboard/DashboardTopBar";
import { DashboardHeader } from "../../components/dashboard/DashboardHeader";
import { UpgradeModal } from "../../components/pricing/UpgradeModal";
import { useContentProtectionSync } from "../../hooks/useContentProtectionSync";
import { useStartGhostSession } from "../../hooks/useStartGhostSession";
import { rehydrateAppStoreFromStorage, syncPlanLimitsToMain, useAppStore } from "../../store/useAppStore";

const SUB_PAGE_PATHS: string[] = ["/meetings"];

export function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const { setSessionActive } = useAppStore();
  const { startSession, canStart, sessionActive, sessionsRemaining, isPaid } =
    useStartGhostSession();

  const isSubPage = SUB_PAGE_PATHS.some((p) => location.pathname.startsWith(p));
  const showMainHeader = !isSubPage;

  useContentProtectionSync();

  useEffect(() => {
    void window.ghost?.setDashboardLayout?.("dashboard");
    void rehydrateAppStoreFromStorage().then(() => {
      syncPlanLimitsToMain();
    });
    void window.ghost?.getSettings?.().then((settings) => {
      if (settings.useCallAudio) {
        useAppStore.getState().setAudioCaptureMode("auto");
      }
    });
  }, []);

  useEffect(() => {
    return window.ghost?.onNavigate?.((path) => {
      void rehydrateAppStoreFromStorage().then(() => {
        navigate(path.startsWith("/") ? path : `/${path}`);
      });
    });
  }, [navigate]);

  useEffect(() => {
    return window.ghost?.onStoreChanged?.(() => {
      void rehydrateAppStoreFromStorage();
    });
  }, []);

  useEffect(() => {
    return window.ghost?.onSessionStarted?.(() => setSessionActive(true));
  }, [setSessionActive]);

  useEffect(() => {
    return window.ghost?.onSessionStopped?.(() => {
      void rehydrateAppStoreFromStorage().then(() => {
        setSessionActive(false);
      });
    });
  }, [setSessionActive]);

  useEffect(() => {
    void window.ghost?.getSettings?.().then((s) => {
      if (!s.sessionActive) setSessionActive(false);
    });
  }, [setSessionActive]);

  return (
    <div className="flex h-screen flex-col bg-white">
      <MeetingSummaryWorker />
      <MicPermissionBanner />
      <DashboardTopBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {showMainHeader && (
        <DashboardHeader
          onStartSession={() => void startSession()}
          onRequestUpgrade={() => setUpgradeOpen(true)}
          canStartSession={canStart}
          sessionActive={sessionActive}
          sessionsRemaining={
            Number.isFinite(sessionsRemaining) ? sessionsRemaining : undefined
          }
          isPaid={isPaid}
        />
      )}

      {upgradeOpen ? <UpgradeModal onClose={() => setUpgradeOpen(false)} /> : null}

      <main className="no-drag min-h-0 flex-1 overflow-y-auto">
        <div
          className={`mx-auto px-8 ${isSubPage ? "max-w-3xl py-8" : "max-w-5xl pt-6 pb-12"}`}
        >
          <Outlet context={{ searchQuery, onRequestUpgrade: () => setUpgradeOpen(true) }} />
        </div>
      </main>
    </div>
  );
}

export type DashboardOutletContext = {
  searchQuery: string;
  onRequestUpgrade: () => void;
};
