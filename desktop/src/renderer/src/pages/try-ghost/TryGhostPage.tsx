import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SplitScreenShell } from "../../components/onboarding/SplitScreenShell";
import { TryGhostPreview } from "../../components/onboarding/TryGhostPreview";
import { BackButton, PillButton } from "../../components/ui";
import { useAppStore } from "../../store/useAppStore";

export function TryGhostPage() {
  const navigate = useNavigate();
  const {
    isAuthenticated,
    onboardingComplete,
    completeShortcutTutorial,
  } = useAppStore();
  const [shortcutUsed, setShortcutUsed] = useState(false);
  const [overlayVisible, setOverlayVisible] = useState(true);

  const isMac = navigator.platform.toLowerCase().includes("mac");
  const modKey = isMac ? "⌘" : "Ctrl";

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth", { replace: true });
      return;
    }
    if (!onboardingComplete) {
      navigate("/onboarding", { replace: true });
    }
  }, [isAuthenticated, onboardingComplete, navigate]);

  useEffect(() => {
    const unsubShortcut = window.ghost?.onShortcutToggle?.(() => {
      setShortcutUsed(true);
      setOverlayVisible((visible) => !visible);
    });

    return () => {
      unsubShortcut?.();
    };
  }, []);

  const finish = useCallback(() => {
    completeShortcutTutorial();
    navigate("/paywall");
  }, [completeShortcutTutorial, navigate]);

  return (
    <div className="relative h-screen max-h-screen w-full overflow-hidden">
      <BackButton to="/onboarding" />
      <SplitScreenShell
        rightVariant="grid"
        left={
          <div className="flex h-full min-h-0 flex-col px-12 py-10">
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <div className="w-full max-w-[380px]">
                <p className="text-[13px] font-medium text-zinc-400">
                  Try Ghost
                </p>
                <h1 className="mt-2 text-[32px] font-semibold leading-[1.15] tracking-[-0.025em] text-zinc-900">
                  Hide and show Ghost on the fly
                </h1>
                <p className="mt-3 text-[15px] leading-relaxed text-zinc-500">
                  Press the keyboard shortcut to try hiding Ghost.
                </p>

                <div className="mt-9 flex items-center justify-center gap-3">
                  <KeyCap label={modKey} />
                  <KeyCap label="\" />
                </div>

                <PillButton
                  disabled={!shortcutUsed}
                  onClick={finish}
                  className="mt-8 h-[48px] disabled:cursor-not-allowed"
                >
                  {shortcutUsed ? "Continue" : "Use the shortcut to continue"}
                </PillButton>
              </div>
            </div>

            <button
              type="button"
              onClick={finish}
              className="pb-2 text-center text-[13px] font-medium text-zinc-400 transition-colors hover:text-zinc-600"
            >
              Skip &gt;
            </button>
          </div>
        }
        right={<TryGhostPreview overlayVisible={overlayVisible} />}
      />
    </div>
  );
}

function KeyCap({ label }: { label: string }) {
  return (
    <span className="flex h-[56px] w-[80px] items-center justify-center rounded-2xl border border-zinc-200 bg-white text-[16px] font-semibold text-zinc-700 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
      {label}
    </span>
  );
}
