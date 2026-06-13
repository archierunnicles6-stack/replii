import { useCallback } from "react";
import {
  canStartSession,
  getFreeSessionsRemaining,
  isPaidPlan,
} from "../store/types";
import { useAppStore } from "../store/useAppStore";

export function useStartGhostSession() {
  const plan = useAppStore((s) => s.plan);
  const freeSessionsUsed = useAppStore((s) => s.freeSessionsUsed);
  const setSessionActive = useAppStore((s) => s.setSessionActive);

  const canStart = canStartSession(plan, freeSessionsUsed);
  const sessionsRemaining = getFreeSessionsRemaining(plan, freeSessionsUsed);

  const startSession = useCallback(async () => {
    const { plan: currentPlan, freeSessionsUsed: used } = useAppStore.getState();
    if (!canStartSession(currentPlan, used)) {
      return false;
    }

    if (!window.ghost?.startSession) {
      console.error("[ghost] startSession unavailable — run inside the Electron app.");
      return false;
    }

    await window.ghost.startSession();
    setSessionActive(true);
    return true;
  }, [setSessionActive]);

  return {
    startSession,
    canStart,
    sessionsRemaining,
    isPaid: isPaidPlan(plan),
  };
}
