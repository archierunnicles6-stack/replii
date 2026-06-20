import { useCallback } from "react";
import {
  canStartSession,
  formatFreeOverlayRemaining,
  getFreeOverlaySecondsRemaining,
  isPaidPlan,
} from "../store/types";
import { syncPlanLimitsToMain, useAppStore } from "../store/useAppStore";

export function useStartRepliiSession() {
  const plan = useAppStore((s) => s.plan);
  const freeOverlaySecondsUsed = useAppStore((s) => s.freeOverlaySecondsUsed);
  const sessionActive = useAppStore((s) => s.sessionActive);
  const setSessionActive = useAppStore((s) => s.setSessionActive);

  const canStart = canStartSession(plan, freeOverlaySecondsUsed);
  const overlaySecondsRemaining = getFreeOverlaySecondsRemaining(
    plan,
    freeOverlaySecondsUsed,
  );
  const overlayTimeRemainingLabel = Number.isFinite(overlaySecondsRemaining)
    ? formatFreeOverlayRemaining(overlaySecondsRemaining)
    : undefined;

  const startSession = useCallback(async () => {
    const state = useAppStore.getState();
    if (state.sessionActive) {
      void window.replii?.show?.();
      return true;
    }

    const { plan: currentPlan, freeOverlaySecondsUsed: used } = state;
    if (!canStartSession(currentPlan, used)) {
      console.warn("[replii] Cannot start — free overlay time limit reached.");
      return false;
    }

    await syncPlanLimitsToMain();

    const permissions = await window.replii?.getPermissionStatus?.();
    if (permissions && !permissions.microphone) {
      const granted = await window.replii?.ensureMicrophone?.();
      if (!granted) {
        await window.replii?.showMicHelper?.();
        return false;
      }
    }

    if (!window.replii?.startSession) {
      console.error("[replii] startSession unavailable — run inside the Electron app.");
      return false;
    }

    const started = await window.replii.startSession();
    if (!started) {
      console.warn("[replii] Session start blocked — check free overlay time limit.");
      return false;
    }

    setSessionActive(true);
    return true;
  }, [setSessionActive]);

  return {
    startSession,
    canStart: canStart && !sessionActive,
    sessionActive,
    overlaySecondsRemaining,
    overlayTimeRemainingLabel,
    isPaid: isPaidPlan(plan),
  };
}
