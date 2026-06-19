import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { MicPermissionBanner } from "../../components/MicPermissionBanner";
import { MeetingSummaryWorker } from "../../components/MeetingSummaryWorker";
import { DashboardTopBar } from "../../components/dashboard/DashboardTopBar";
import { DashboardHeader } from "../../components/dashboard/DashboardHeader";
import { UpgradeModal } from "../../components/pricing/UpgradeModal";
import { AI_DISCLAIMER_SHORT } from "../../lib/ai-disclaimer";
import { useBillingSync } from "../../hooks/useBillingSync";
import { useContentProtectionSync } from "../../hooks/useContentProtectionSync";
import { useStartGhostSession } from "../../hooks/useStartGhostSession";
import { rehydrateAppStoreFromStorage, syncPlanLimitsToMain, useAppStore } from "../../store/useAppStore";

const SUB_PAGE_PATHS: string[] = ["/meetings"];
const CALENDAR_PATHS: string[] = ["/upcoming", "/calendar"];

export function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [upgradeContext, setUpgradeContext] = useState<string | undefined>();
  const { setSessionActive } = useAppStore();
  const { startSession, canStart, sessionActive, sessionsRemaining, isPaid } =
    useStartGhostSession();

  const isSubPage = SUB_PAGE_PATHS.some((p) => location.pathname.startsWith(p));
  const isCalendarPage = CALENDAR_PATHS.some((p) => location.pathname.startsWith(p));
  const showMainHeader = !isSubPage;
  const showCalendarPrompt = !isCalendarPage;

  useContentProtectionSync();
  useBillingSync();

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

  const openUpgrade = (contextMessage?: string) => {
    setUpgradeContext(contextMessage);
    setUpgradeOpen(true);
  };

  const closeUpgrade = () => {
    setUpgradeOpen(false);
    setUpgradeContext(undefined);
  };

  return (
    <div className="flex h-screen flex-col bg-white">
      <MeetingSummaryWorker />
      <MicPermissionBanner />
      <DashboardTopBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {showMainHeader && (
        <>
          <DashboardHeader
            onStartSession={() => void startSession()}
            onRequestUpgrade={() => openUpgrade()}
            canStartSession={canStart}
            sessionActive={sessionActive}
            sessionsRemaining={
              Number.isFinite(sessionsRemaining) ? sessionsRemaining : undefined
            }
            isPaid={isPaid}
            showCalendarPrompt={showCalendarPrompt}
          />
        </>
      )}

      {upgradeOpen ? (
        <UpgradeModal
          onClose={closeUpgrade}
          contextMessage={upgradeContext}
        />
      ) : null}

      <main className="no-drag min-h-0 flex-1 overflow-y-auto">
        <div
          className={`mx-auto px-8 ${isSubPage ? "max-w-3xl py-8" : "max-w-5xl pt-6 pb-12"}`}
        >
          <Outlet context={{ searchQuery, onRequestUpgrade: openUpgrade }} />
        </div>
        <p className="mx-auto max-w-5xl px-8 pb-6 text-center text-[11px] leading-relaxed text-zinc-400">
          {AI_DISCLAIMER_SHORT}
        </p>
      </main>
    </div>
  );
}

export type DashboardOutletContext = {
  searchQuery: string;
  onRequestUpgrade: (contextMessage?: string) => void;
};
