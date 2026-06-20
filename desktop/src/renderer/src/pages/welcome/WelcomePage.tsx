import { useNavigate } from "react-router-dom";
import klavioIcon from "../../assets/onboarding/klavio-4.png";
import { WelcomePreview } from "../../components/onboarding/WelcomePreview";
import {
  SplitScreenLeft,
  SplitScreenLeftBody,
} from "../../components/onboarding/SplitScreenLeft";
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
        <SplitScreenLeft>
          <SplitScreenLeftBody>
            <div className="flex min-w-0 flex-col items-center text-center">
              <img
                src={klavioIcon}
                alt=""
                aria-hidden
                className="mb-6 h-[108px] w-[108px] select-none object-contain"
                draggable={false}
              />
              <h1 className="min-w-0 break-words text-[34px] font-semibold leading-[1.15] tracking-[-0.025em] text-zinc-900">
                Welcome to Replii
              </h1>
              <p className="mt-3 min-w-0 break-words text-[15px] leading-relaxed text-zinc-500">
                The real-time AI sales co-pilot
              </p>

              <button
                type="button"
                onClick={handleContinue}
                className="mt-9 flex h-[48px] w-full max-w-[340px] min-w-0 items-center justify-center gap-1 rounded-full bg-gradient-to-b from-[#5aa7f9] to-[#3b82f6] text-[15px] font-medium text-white shadow-[0_2px_10px_rgba(59,130,246,0.35)] transition-opacity hover:opacity-90"
              >
                Continue
                <span className="text-[17px] leading-none" aria-hidden>
                  ›
                </span>
              </button>
            </div>
          </SplitScreenLeftBody>

          <p className="min-w-0 break-words text-center text-[11px] leading-relaxed text-zinc-400">
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
        </SplitScreenLeft>
      }
      right={<WelcomePreview />}
      rightVariant="edge-image"
    />
  );
}
