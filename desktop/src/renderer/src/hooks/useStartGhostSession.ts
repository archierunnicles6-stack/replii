import { useCallback } from "react";
import {
  canStartSession,
  getFreeSessionsRemaining,
  isPaidPlan,
} from "../store/types";
import { syncPlanLimitsToMain, useAppStore } from "../store/useAppStore";

export function useStartGhostSession() {
  const plan = useAppStore((s) => s.plan);
  const freeSessionsUsed = useAppStore((s) => s.freeSessionsUsed);
  const meetings = useAppStore((s) => s.meetings);
  const sessionActive = useAppStore((s) => s.sessionActive);
  const setSessionActive = useAppStore((s) => s.setSessionActive);
  const incrementFreeSessionUsage = useAppStore((s) => s.incrementFreeSessionUsage);

  const canStart = canStartSession(plan, freeSessionsUsed, meetings);
  const sessionsRemaining = getFreeSessionsRemaining(
    plan,
    freeSessionsUsed,
    meetings,
  );

  const startSession = useCallback(async () => {
    const state = useAppStore.getState();
    if (state.sessionActive) {
      void window.ghost?.show?.();
      return true;
    }

    const { plan: currentPlan, freeSessionsUsed: used, meetings: currentMeetings } =
      state;
    if (!canStartSession(currentPlan, used, currentMeetings)) {
      console.warn("[ghost] Cannot start — free session limit reached.");
      return false;
    }

    await syncPlanLimitsToMain();

    const permissions = await window.ghost?.getPermissionStatus?.();
    if (permissions && !permissions.microphone) {
      const granted = await window.ghost?.ensureMicrophone?.();
      if (!granted) {
        await window.ghost?.showMicHelper?.();
        return false;
      }
    }

    if (!window.ghost?.startSession) {
      console.error("[ghost] startSession unavailable — run inside the Electron app.");
      return false;
    }

    const started = await window.ghost.startSession();
    if (!started) {
      console.warn("[ghost] Session start blocked — check free session limit.");
      return false;
    }

    incrementFreeSessionUsage();
    setSessionActive(true);
    return true;
  }, [incrementFreeSessionUsage, setSessionActive]);

  return {
    startSession,
    canStart: canStart && !sessionActive,
    sessionActive,
    sessionsRemaining,
    isPaid: isPaidPlan(plan),
  };
}
