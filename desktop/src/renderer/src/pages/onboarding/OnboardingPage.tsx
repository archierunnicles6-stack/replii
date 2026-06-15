import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PermissionPreview } from "../../components/onboarding/PermissionPreview";
import { SplitScreenShell } from "../../components/onboarding/SplitScreenShell";
import { BackButton } from "../../components/ui";
import { useAppStore } from "../../store/useAppStore";

type PermissionKey = "accessibility" | "microphone" | "screen";

interface PermissionItem {
  key: PermissionKey;
  icon: React.ReactNode;
  title: string;
  description: string;
}

const PERMISSIONS: PermissionItem[] = [
  {
    key: "accessibility",
    icon: <BulbIcon />,
    title: "Allow Ghost to assist",
    description:
      "Ghost uses accessibility access for global shortcuts and app-aware controls.",
  },
  {
    key: "microphone",
    icon: <MicIcon />,
    title: "Allow Ghost to hear audio",
    description: "Ghost can listen to audio when you start a session.",
  },
  {
    key: "screen",
    icon: <CallAudioIcon />,
    title: "Allow Ghost to hear call audio",
    description:
      "Optional — macOS uses Screen Recording for Zoom, Meet, and Teams audio only. Ghost does not view your screen.",
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
  const [activeKey, setActiveKey] = useState<PermissionKey>("accessibility");

  const refreshStatus = useCallback(async () => {
    const status = await window.ghost?.getPermissionStatus?.();
    if (!status) return;
    setGranted({
      accessibility: status.accessibility,
      microphone: status.microphone,
      screen: status.screen,
    });
  }, []);

  useEffect(() => {
    void refreshStatus();
    const id = setInterval(() => void refreshStatus(), 2000);
    return () => clearInterval(id);
  }, [refreshStatus]);

  const openSettings = async (key: PermissionKey) => {
    setActiveKey(key);
    await window.ghost?.openPermissionSettings?.(key);
    setTimeout(() => void refreshStatus(), 1500);
  };

  const requiredGranted = granted.accessibility && granted.microphone;

  const settingsLabel =
    activeKey === "accessibility"
      ? "Open accessibility settings"
      : activeKey === "microphone"
        ? "Open microphone settings"
        : "Open call audio settings";

  const finish = () => {
    completeOnboarding();
    navigate("/try");
  };

  return (
    <div className="relative h-screen max-h-screen w-full overflow-hidden">
      <BackButton to="/auth" />
      <SplitScreenShell
        left={
          <div className="flex h-full min-h-0 flex-col px-12 py-10">
            <div className="flex min-h-0 flex-1 flex-col justify-center">
              <h1 className="text-[28px] font-semibold leading-tight tracking-[-0.02em] text-zinc-900">
                Let&apos;s get you set up
              </h1>

              <div className="mt-8 space-y-3">
                {PERMISSIONS.map((perm) => (
                  <PermissionCard
                    key={perm.key}
                    icon={perm.icon}
                    title={perm.title}
                    description={perm.description}
                    enabled={granted[perm.key]}
                    active={activeKey === perm.key}
                    onToggle={() => {
                      setActiveKey(perm.key);
                      if (!granted[perm.key]) void openSettings(perm.key);
                    }}
                  />
                ))}
              </div>

              {requiredGranted ? (
                <button
                  type="button"
                  onClick={finish}
                  className="mt-8 flex h-[48px] w-full items-center justify-center rounded-xl bg-gradient-to-b from-[#5aa7f9] to-[#3b82f6] text-[15px] font-medium text-white shadow-[0_2px_12px_rgba(59,130,246,0.35)] transition-opacity hover:opacity-90"
                >
                  Continue to Ghost
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => void openSettings(activeKey)}
                  className="mt-8 flex h-[48px] w-full items-center justify-center rounded-xl bg-gradient-to-b from-[#5aa7f9] to-[#3b82f6] text-[15px] font-medium text-white shadow-[0_2px_12px_rgba(59,130,246,0.35)] transition-opacity hover:opacity-90"
                >
                  {settingsLabel}
                </button>
              )}
            </div>
          </div>
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
  active,
  onToggle,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  enabled: boolean;
  active: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`flex w-full items-center gap-3.5 rounded-2xl border px-4 py-3.5 text-left transition-all ${
        active
          ? "border-zinc-300 bg-zinc-50"
          : "border-zinc-200/80 bg-transparent hover:border-zinc-300"
      }`}
    >
      <div
        className={`shrink-0 transition-colors ${active ? "text-zinc-600" : "text-zinc-400"}`}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p
          className={`text-[14px] font-medium leading-tight transition-colors ${
            active ? "text-zinc-900" : "text-zinc-500"
          }`}
        >
          {title}
        </p>
        <p
          className={`mt-1 text-[12px] leading-snug transition-colors ${
            active ? "text-zinc-500" : "text-zinc-400"
          }`}
        >
          {description}
        </p>
      </div>
      <span
        className={`relative h-[22px] w-[38px] shrink-0 rounded-full transition-colors ${
          enabled ? "bg-[#3b82f6]" : active ? "bg-zinc-300" : "bg-zinc-200"
        }`}
      >
        <span
          className={`absolute top-[3px] h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
            enabled ? "translate-x-[18px]" : "translate-x-[3px]"
          }`}
        />
      </span>
    </button>
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
