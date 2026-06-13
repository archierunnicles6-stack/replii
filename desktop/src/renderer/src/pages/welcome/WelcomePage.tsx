import { useNavigate } from "react-router-dom";
import { OverlayPreview } from "../../components/onboarding/OverlayPreview";
import { SplitScreenShell } from "../../components/onboarding/SplitScreenShell";
import { legalLinks, openLegalLink } from "../../lib/legal-urls";
import { useAppStore } from "../../store/useAppStore";

export function WelcomePage() {
  const navigate = useNavigate();
  const { completeWelcome } = useAppStore();

  const handleContinue = () => {
    completeWelcome();
    navigate("/auth");
  };

  return (
    <SplitScreenShell
      left={
        <div className="flex h-full min-h-0 flex-col px-12 py-10">
          {/* Center group */}
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <h1 className="text-[34px] font-semibold leading-[1.15] tracking-[-0.025em] text-zinc-900">
              Welcome to Ghost
            </h1>
            <p className="mt-3 text-[15px] leading-relaxed text-zinc-500">
              The real-time AI sales co-pilot
            </p>

            <button
              type="button"
              onClick={handleContinue}
              className="mt-9 flex h-[48px] w-full max-w-[340px] items-center justify-center gap-1 rounded-full bg-gradient-to-b from-[#5aa7f9] to-[#3b82f6] text-[15px] font-medium text-white shadow-[0_2px_10px_rgba(59,130,246,0.35)] transition-opacity hover:opacity-90"
            >
              Continue
              <span className="text-[17px] leading-none" aria-hidden>›</span>
            </button>
          </div>

          {/* Terms pinned to bottom */}
          <p className="text-center text-[11px] leading-relaxed text-zinc-400">
            By signing up, you agree to our{" "}
            <button
              type="button"
              onClick={() => openLegalLink(legalLinks.terms)}
              className="text-zinc-500 underline decoration-zinc-300 hover:text-zinc-700"
            >
              Terms of Service
            </button>{" "}
            and{" "}
            <button
              type="button"
              onClick={() => openLegalLink(legalLinks.privacy)}
              className="text-zinc-500 underline decoration-zinc-300 hover:text-zinc-700"
            >
              Privacy Policy
            </button>
            .
          </p>
        </div>
      }
      right={<OverlayPreview />}
    />
  );
}
