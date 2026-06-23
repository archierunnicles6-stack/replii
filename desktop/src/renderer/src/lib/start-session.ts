import { canStartSession } from "../store/types";
import { syncPlanLimitsToMain, useAppStore } from "../store/useAppStore";

export type SessionPermissionKey = "accessibility" | "microphone";

export interface SessionPermissionStatus {
  accessibility: boolean;
  microphone: boolean;
}

export function getMissingSessionPermissions(
  status: SessionPermissionStatus | null | undefined,
): SessionPermissionKey[] {
  if (!status) return ["accessibility", "microphone"];
  const missing: SessionPermissionKey[] = [];
  if (!status.accessibility) missing.push("accessibility");
  if (!status.microphone) missing.push("microphone");
  return missing;
}

export async function fetchSessionPermissionStatus(): Promise<SessionPermissionStatus | null> {
  const status = await window.replii?.getPermissionStatus?.({ deep: true });
  if (!status) return null;
  return {
    accessibility: status.accessibility,
    microphone: status.microphone,
  };
}

export async function performSessionStart(): Promise<boolean> {
  const state = useAppStore.getState();
  if (state.sessionActive) {
    const { plan, freeOverlaySecondsUsed } = state;
    if (!canStartSession(plan, freeOverlaySecondsUsed)) {
      useAppStore.getState().setSessionActive(false);
      return false;
    }

    if (!window.replii?.startSession) {
      console.error("[replii] startSession unavailable — run inside the Electron app.");
      return false;
    }
    const recovered = await window.replii.startSession();
    if (recovered) return true;
    // Stale session flag or main process blocked — fall through to a fresh start.
    useAppStore.getState().setSessionActive(false);
  }

  const { plan, freeOverlaySecondsUsed } = useAppStore.getState();
  if (!canStartSession(plan, freeOverlaySecondsUsed)) {
    console.warn("[replii] Cannot start — free overlay time limit reached.");
    return false;
  }

  await syncPlanLimitsToMain();

  if (!window.replii?.startSession) {
    console.error("[replii] startSession unavailable — run inside the Electron app.");
    return false;
  }

  const started = await window.replii.startSession();
  if (!started) {
    console.warn("[replii] Session start blocked — check free overlay time limit.");
    return false;
  }

  useAppStore.getState().setSessionActive(true);
  return true;
}
