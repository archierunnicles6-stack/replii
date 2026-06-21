import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PermissionPreview } from "../../components/onboarding/PermissionPreview";
import {
  SplitScreenLeft,
  SplitScreenLeftBody,
} from "../../components/onboarding/SplitScreenLeft";
import { SplitScreenShell } from "../../components/onboarding/SplitScreenShell";
import { BackButton, Switch } from "../../components/ui";
import { confirmMicrophoneAccess } from "../../services/audio-capture";
import { notifyAppStoreChanged, useAppStore } from "../../store/useAppStore";

type PermissionKey = "accessibility" | "microphone" | "screen";

interface PermissionItem {
  key: PermissionKey;
  icon: React.ReactNode;
  title: string;
  description: string;
  reassurance?: string;
  step: number | null;
}

const REQUIRED_KEYS: PermissionKey[] = ["accessibility", "microphone"];

function nextRequiredKey(
  granted: Record<PermissionKey, boolean>,
): PermissionKey | null {
  for (const key of REQUIRED_KEYS) {
    if (!granted[key]) return key;
  }
  return null;
}

function isPermissionGranted(
  key: PermissionKey,
  granted: Record<PermissionKey, boolean>,
): boolean {
  if (!granted[key]) return false;
  // Don't show mic as on during step 1 — avoids confusing pre-granted mic state.
  if (key === "microphone" && !granted.accessibility) return false;
  return true;
}

function isPermissionReachable(
  key: PermissionKey,
  granted: Record<PermissionKey, boolean>,
): boolean {
  if (key === "accessibility") return true;
  if (key === "microphone") return granted.accessibility;
  return granted.accessibility && granted.microphone;
}

const PERMISSIONS: PermissionItem[] = [
  {
    key: "accessibility",
    icon: <BulbIcon />,
    step: 1,
    title: "Enable Replii shortcuts",
    description:
      "Replii needs accessibility access so it can appear on any call with one hotkey.",
  },
  {
    key: "microphone",
    icon: <MicIcon />,
    step: 2,
    title: "Let Replii hear your calls",
    description:
      "Your mic lets Replii coach you in real time. Audio stays on your device.",
    reassurance: "Choose Replii in System Settings → Privacy → Microphone.",
  },
  {
    key: "screen",
    icon: <CallAudioIcon />,
    step: null,
    title: "Hear Zoom / Meet / Teams audio",
    description:
      "Optional — macOS uses Screen Recording for call audio only. Replii never views your screen.",
    reassurance: "Skip for now if you only use your mic — you can add this later.",
  },
];

export function OnboardingPage() {
  const navigate = useNavigate();
  const completeOnboarding = useAppStore((s) => s.completeOnboarding);
  const [granted, setGranted] = useState<Record<PermissionKey, boolean>>({
    accessibility: false,
    microphone: false,
    screen: false,
  });
  const [pending, setPending] = useState<Partial<Record<PermissionKey, boolean>>>(
    {},
  );
  const [activeKey, setActiveKey] = useState<PermissionKey>("accessibility");
  const finishingRef = useRef(false);
  const prevGrantedRef = useRef(granted);

  const refreshStatus = useCallback(async (options?: { deep?: boolean }) => {
    const status = await window.replii?.getPermissionStatus?.();
    if (!status) return;

    let microphone = status.microphone;
    if (options?.deep && !microphone && status.accessibility) {
      microphone = await confirmMicrophoneAccess();
    }

    setGranted((prev) => {
      const next = {
        accessibility: status.accessibility,
        microphone,
        screen: status.screen,
      };
      if (
        prev.accessibility === next.accessibility &&
        prev.microphone === next.microphone &&
        prev.screen === next.screen
      ) {
        return prev;
      }
      return next;
    });
  }, []);

  const finish = useCallback(() => {
    if (finishingRef.current) return;
    finishingRef.current = true;
    completeOnboarding();
    notifyAppStoreChanged();
    navigate("/try");
  }, [completeOnboarding, navigate]);

  useEffect(() => {
    void window.replii?.setDashboardLayout?.("onboarding");
  }, []);

  useEffect(() => {
    void refreshStatus();
    const id = setInterval(() => void refreshStatus(), 500);
    const onFocus = () => {
      void refreshStatus({ deep: true });
      setTimeout(() => void refreshStatus({ deep: true }), 300);
      setTimeout(() => void refreshStatus({ deep: true }), 1000);
    };
    const onVisible = () => {
      if (document.visibilityState === "visible") onFocus();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(id);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [refreshStatus]);

  const openSettings = async (key: PermissionKey) => {
    setActiveKey(key);
    await window.replii?.openPermissionSettings?.(key);
    if (key === "microphone" || (key === "screen" && !granted.microphone)) {
      await window.replii?.ensureMicrophone?.();
    }
    void refreshStatus();
    const delays =
      key === "accessibility"
        ? [400, 1000, 2000, 4000, 8000, 12000]
        : [400, 1000, 2000, 4000];
    for (const delay of delays) {
      setTimeout(() => void refreshStatus(), delay);
    }
  };

  const handleToggle = async (key: PermissionKey) => {
    if (isPermissionGranted(key, granted)) return;
    if (!isPermissionReachable(key, granted)) return;
    setPending((prev) => ({ ...prev, [key]: true }));
    setActiveKey(key);
    await openSettings(key);
    void refreshStatus({ deep: true });
  };

  useEffect(() => {
    const prev = prevGrantedRef.current;
    prevGrantedRef.current = granted;

    setPending((pendingPrev) => {
      let changed = false;
      const next = { ...pendingPrev };
      for (const perm of PERMISSIONS) {
        if (granted[perm.key] && pendingPrev[perm.key]) {
          next[perm.key] = false;
          changed = true;
        }
      }
      return changed ? next : pendingPrev;
    });

    const next = nextRequiredKey(granted);
    if (next) {
      setActiveKey(next);
    } else if (REQUIRED_KEYS.some((key) => granted[key] && !prev[key])) {
      setActiveKey("microphone");
    }
  }, [granted]);

  const requiredGranted = granted.accessibility && granted.microphone;
  const pendingRequiredKey = nextRequiredKey(granted);
  const focusKey = pendingRequiredKey ?? activeKey;
  const focusPerm = PERMISSIONS.find((p) => p.key === focusKey) ?? PERMISSIONS[0];
  const requiredStep = focusPerm.step;
  const showOptionalScreen = requiredGranted;

  useEffect(() => {
    if (!requiredGranted || finishingRef.current) return;
    const id = setTimeout(() => finish(), 700);
    return () => clearTimeout(id);
  }, [requiredGranted, finish]);

  const primaryLabel = "Continue";

  const handlePrimary = async () => {
    const status = await window.replii?.getPermissionStatus?.();
    if (!status) return;

    let microphone = status.microphone;
    if (!microphone && status.accessibility) {
      microphone = await confirmMicrophoneAccess();
    }

    const current = {
      accessibility: status.accessibility,
      microphone,
      screen: status.screen,
    };
    setGranted(current);

    if (current.accessibility && current.microphone) {
      finish();
      return;
    }

    const missing = nextRequiredKey(current);
    if (missing) await openSettings(missing);
  };

  return (
    <div className="relative h-screen max-h-screen w-full min-w-0 overflow-hidden">
      <BackButton to="/auth" />
      <SplitScreenShell
        rightVariant="grid"
        left={
          <SplitScreenLeft>
            <SplitScreenLeftBody>
              {requiredStep ? (
                <p className="text-[13px] font-medium text-[#3b82f6]">
                  Step {requiredStep} of {REQUIRED_KEYS.length}
                </p>
              ) : (
                <p className="text-[13px] font-medium text-zinc-400">Optional</p>
              )}
              <h1 className="mt-2 min-w-0 break-words text-[28px] font-semibold leading-tight tracking-[-0.02em] text-zinc-900">
                {requiredGranted ? "You're ready to start" : focusPerm.title}
              </h1>
              <p className="mt-2 min-w-0 break-words text-[15px] leading-relaxed text-zinc-500">
                {requiredGranted
                  ? "Start your first session now — Replii will coach you live on your next call."
                  : focusPerm.description}
              </p>

              {!requiredGranted && focusPerm.reassurance ? (
                <p className="mt-3 rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-3 text-[13px] leading-relaxed text-blue-900/80">
                  {focusPerm.reassurance}
                </p>
              ) : null}

              <div className="mt-8 space-y-3">
                {PERMISSIONS.filter((p) => p.step !== null || showOptionalScreen).map(
                  (perm) => (
                    <PermissionCard
                      key={perm.key}
                      icon={perm.icon}
                      title={perm.title}
                      description={perm.description}
                      enabled={isPermissionGranted(perm.key, granted)}
                      requesting={Boolean(pending[perm.key])}
                      active={focusKey === perm.key}
                      dimmed={
                        !requiredGranted &&
                        !isPermissionReachable(perm.key, granted)
                      }
                      onSelect={() => {
                        if (
                          !requiredGranted &&
                          !isPermissionReachable(perm.key, granted)
                        ) {
                          return;
                        }
                        setActiveKey(perm.key);
                      }}
                      onToggle={() => void handleToggle(perm.key)}
                    />
                  ),
                )}
              </div>

              <button
                type="button"
                onClick={handlePrimary}
                className="mt-8 flex h-auto min-h-[48px] w-full min-w-0 items-center justify-center rounded-xl bg-gradient-to-b from-[#5aa7f9] to-[#3b82f6] px-4 py-3 text-center text-[15px] font-medium leading-snug text-white shadow-[0_2px_12px_rgba(59,130,246,0.35)] transition-opacity hover:opacity-90"
              >
                {primaryLabel}
              </button>
            </SplitScreenLeftBody>
          </SplitScreenLeft>
        }
        right={<PermissionPreview />}
      />
    </div>
  );
}

function PermissionCard({
  icon,
  title,
  description,
  enabled,
  requesting,
  active,
  dimmed,
  onSelect,
  onToggle,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  enabled: boolean;
  requesting?: boolean;
  active: boolean;
  dimmed?: boolean;
  onSelect: () => void;
  onToggle: () => void;
}) {
  const interactive = !dimmed;

  return (
    <div
      role="button"
      tabIndex={interactive ? 0 : -1}
      onClick={interactive ? onSelect : undefined}
      onKeyDown={(e) => {
        if (!interactive) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      className={`flex w-full min-w-0 items-center gap-3.5 rounded-2xl border px-4 py-3.5 text-left transition-all ${
        dimmed
          ? "border-zinc-100 bg-zinc-50/50 opacity-60"
          : enabled
            ? "border-[#3b82f6]/25 bg-[#3b82f6]/[0.04]"
            : active
              ? "cursor-pointer border-zinc-300 bg-zinc-50"
              : "cursor-pointer border-zinc-200/80 bg-transparent hover:border-zinc-300"
      }`}
    >
      <div
        className={`shrink-0 transition-colors ${active ? "text-zinc-600" : "text-zinc-400"}`}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p
          className={`min-w-0 break-words text-[14px] font-medium leading-tight transition-colors ${
            enabled || active ? "text-zinc-900" : "text-zinc-500"
          }`}
        >
          {title}
        </p>
        <p
          className={`mt-1 min-w-0 break-words text-[12px] leading-snug transition-colors ${
            active ? "text-zinc-500" : "text-zinc-400"
          }`}
        >
          {description}
        </p>
      </div>
      <Switch
        checked={enabled}
        disabled={dimmed || requesting}
        size="sm"
        checkedClassName="bg-[#3b82f6]"
        uncheckedClassName={active ? "bg-zinc-300" : "bg-zinc-200"}
        aria-label={`${enabled ? "Disable" : "Enable"} ${title}`}
        onClick={(e) => {
          e.stopPropagation();
          if (!dimmed && !enabled && !requesting) onToggle();
        }}
      />
    </div>
  );
}

function BulbIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-3.75m0 0a6.004 6.004 0 0 1-4.773-9.812 6.004 6.004 0 0 1 9.546 0A6.004 6.004 0 0 1 12 14.25v3.75m0 0v1.5a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1-.75-.75v-1.5" />
    </svg>
  );
}

function MicIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m12 0V12a9 9 0 0 0-9-9 9 9 0 0 0-9 9v.75m12 0c0 .621-.504 1.125-1.125 1.125H6.375A1.125 1.125 0 0 1 5.25 18.75v-1.5" />
    </svg>
  );
}

function CallAudioIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
    </svg>
  );
}
