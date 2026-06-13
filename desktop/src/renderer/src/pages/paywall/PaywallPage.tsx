import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../../store/useAppStore";
import { BackButton } from "../../components/ui";

const PLANS = [
  {
    id: "solo" as const,
    name: "SOLO",
    price: "23.99",
    description: "For individual reps who want an edge on every call.",
    cta: "Get started",
    popular: false,
    features: [
      "Live AI coaching on every call",
      "Real-time objection handling",
      "Deal health score",
      "Post-call summary & follow-up email",
      "Unlimited calls",
      "Invisible on screen share",
    ],
  },
  {
    id: "pro" as const,
    name: "PRO",
    price: "79.99",
    description: "For closers who want Ghost to learn their style.",
    cta: "Get started",
    popular: true,
    features: [
      "Everything in Solo",
      "Personal AI model (learns your wins)",
      "Talk ratio & call analytics",
      "HubSpot & Salesforce sync",
      "Custom playbooks & objections",
      "Priority support",
    ],
  },
];

export function PaywallPage() {
  const navigate = useNavigate();
  const {
    completePaywall,
    setPlan,
    isAuthenticated,
    onboardingComplete,
    shortcutTutorialComplete,
  } = useAppStore();
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth", { replace: true });
      return;
    }
    if (!onboardingComplete) {
      navigate("/onboarding", { replace: true });
      return;
    }
    if (!shortcutTutorialComplete) {
      navigate("/try", { replace: true });
    }
  }, [isAuthenticated, onboardingComplete, shortcutTutorialComplete, navigate]);

  const handleSelect = async (planId: "solo" | "pro") => {
    setLoading(planId);
    await new Promise((r) => setTimeout(r, 500));
    setPlan(planId);
    completePaywall();
    navigate("/");
  };

  const handleSkip = () => {
    completePaywall();
    navigate("/");
  };

  const handleEnterprise = () => {
    void window.ghost?.openExternal?.("mailto:sales@ghost.ai?subject=Enterprise enquiry");
  };

  return (
    <div className="relative flex h-screen max-h-screen w-full flex-col overflow-hidden bg-white">
      <BackButton to="/try" />

      <div className="flex flex-1 flex-col items-center justify-center px-10 py-8">
        {/* Header */}
        <h1 className="text-[28px] font-semibold leading-tight tracking-[-0.025em] text-zinc-900">
          Choose your plan
        </h1>
        <p className="mt-2 text-[14px] text-zinc-500">
          One closed deal pays for a full year. Cancel anytime.
        </p>

        {/* Cards */}
        <div className="mt-8 flex w-full max-w-[640px] items-stretch gap-4">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`relative flex flex-1 flex-col rounded-2xl border p-6 ${
                plan.popular
                  ? "border-zinc-800 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.09)]"
                  : "border-zinc-200 bg-white"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-zinc-900 px-3.5 py-1 text-[11px] font-semibold text-white">
                    Most popular
                  </span>
                </div>
              )}

              <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">
                {plan.name}
              </p>

              <div className="mt-2.5 flex items-end gap-1">
                <span className="text-[34px] font-semibold leading-none tracking-[-0.03em] text-zinc-900">
                  ${plan.price}
                </span>
                <span className="mb-0.5 text-[13px] text-zinc-400">/month</span>
              </div>

              <p className="mt-2 text-[13px] leading-snug text-zinc-500">
                {plan.description}
              </p>

              <ul className="mt-5 flex-1 space-y-2">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <CheckIcon />
                    <span className="text-[13px] text-zinc-700">{f}</span>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                disabled={loading !== null}
                onClick={() => void handleSelect(plan.id)}
                className={`mt-6 flex h-[44px] w-full items-center justify-center rounded-full text-[14px] font-medium transition-opacity disabled:opacity-60 ${
                  plan.popular
                    ? "bg-gradient-to-b from-[#5aa7f9] to-[#3b82f6] text-white shadow-[0_2px_8px_rgba(59,130,246,0.3)]"
                    : "border border-zinc-200 bg-white text-zinc-800 hover:bg-zinc-50"
                }`}
              >
                {loading === plan.id ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent opacity-60" />
                ) : (
                  plan.cta
                )}
              </button>
            </div>
          ))}
        </div>

        {/* Enterprise */}
        <div className="mt-4 flex w-full max-w-[640px] items-center justify-between rounded-2xl border border-zinc-200 bg-[#fafafa] px-6 py-4">
          <div>
            <p className="text-[14px] font-semibold text-zinc-900">Enterprise</p>
            <p className="mt-0.5 text-[12px] text-zinc-500">
              Custom pricing · Team seats · Admin dashboard · SSO
            </p>
          </div>
          <button
            type="button"
            onClick={handleEnterprise}
            className="ml-4 shrink-0 rounded-full border border-zinc-300 bg-white px-5 py-2 text-[13px] font-medium text-zinc-800 transition-colors hover:bg-zinc-50"
          >
            Contact sales →
          </button>
        </div>

        {/* Skip */}
        <button
          type="button"
          onClick={handleSkip}
          className="mt-5 text-[12px] text-zinc-400 transition-colors hover:text-zinc-600"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg
      className="h-3.5 w-3.5 shrink-0 text-[#3b82f6]"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}
