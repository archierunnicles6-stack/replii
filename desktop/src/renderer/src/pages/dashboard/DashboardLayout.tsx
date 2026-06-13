import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { DevModeBanner } from "../../components/DevModeBanner";
import { MicPermissionBanner } from "../../components/MicPermissionBanner";
import { MeetingSummaryWorker } from "../../components/MeetingSummaryWorker";
import { SessionMicBridge } from "../../components/SessionMicBridge";
import { DashboardTopBar } from "../../components/dashboard/DashboardTopBar";
import { DashboardHeader } from "../../components/dashboard/DashboardHeader";
import { useStartGhostSession } from "../../hooks/useStartGhostSession";
import { shouldUseMockAudio } from "../../services/mock-audio";
import { rehydrateAppStoreFromStorage, useAppStore } from "../../store/useAppStore";

const SUB_PAGE_PATHS: string[] = ["/meetings"];

export function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const { setSessionActive } = useAppStore();
  const { startSession, canStart, sessionsRemaining, isPaid } = useStartGhostSession();

  const isSubPage = SUB_PAGE_PATHS.some((p) => location.pathname.startsWith(p));
  const showMainHeader = !isSubPage;

  useEffect(() => {
    void window.ghost?.setDashboardLayout?.("dashboard");
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

  const handleRefresh = () => setRefreshKey((k) => k + 1);

  const audioCaptureMode = useAppStore((s) => s.audioCaptureMode);
  const mockMode = shouldUseMockAudio(audioCaptureMode);

  return (
    <div className="flex h-screen flex-col bg-white">
      <SessionMicBridge />
      <MeetingSummaryWorker />
      <DevModeBanner />
      {!mockMode && <MicPermissionBanner />}
      <DashboardTopBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {showMainHeader && (
        <DashboardHeader
          onRefresh={handleRefresh}
          onStartSession={() => void startSession()}
          canStartSession={canStart}
          sessionsRemaining={
            Number.isFinite(sessionsRemaining) ? sessionsRemaining : undefined
          }
          isPaid={isPaid}
        />
      )}

      <main className="no-drag min-h-0 flex-1 overflow-y-auto">
        <div
          className={`mx-auto px-8 ${isSubPage ? "max-w-3xl py-8" : "max-w-3xl pt-8 pb-12"}`}
        >
          <Outlet context={{ searchQuery, refreshKey }} />
        </div>
      </main>
    </div>
  );
}

export type DashboardOutletContext = {
  searchQuery: string;
  refreshKey: number;
};
