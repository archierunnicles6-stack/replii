import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { SetupContinueButton } from "../../components/onboarding/SetupContinueButton";
import { SetupShell } from "../../components/onboarding/SetupShell";
import { BackButton } from "../../components/ui";
import { getOnboardingFunnelRoute } from "../../lib/onboarding-flow";
import { notifyAppStoreChanged, useAppStore } from "../../store/useAppStore";

const setupInputClassName =
  "h-9 rounded-lg border border-zinc-300 bg-white px-3 text-[13px] shadow-sm transition-colors placeholder:text-zinc-400 focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/15";

export function ProfileSetupPage() {
  const navigate = useNavigate();
  const welcomeComplete = useAppStore((s) => s.welcomeComplete);
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const user = useAppStore((s) => s.user);
  const profileSetupComplete = useAppStore((s) => s.profileSetupComplete);
  const roleSetupComplete = useAppStore((s) => s.roleSetupComplete);
  const shortcutTutorialComplete = useAppStore((s) => s.shortcutTutorialComplete);
  const paywallComplete = useAppStore((s) => s.paywallComplete);
  const plan = useAppStore((s) => s.plan);
  const companyInfo = useAppStore((s) => s.companyInfo);
  const updateCompanyInfo = useAppStore((s) => s.updateCompanyInfo);
  const updateUser = useAppStore((s) => s.updateUser);
  const completeProfileSetup = useAppStore((s) => s.completeProfileSetup);

  const [fullName, setFullName] = useState(user?.name ?? "");
  const [companyName, setCompanyName] = useState(companyInfo.companyName);
  const [companyWebsite, setCompanyWebsite] = useState(companyInfo.companyWebsite);

  useEffect(() => {
    void window.replii?.setDashboardLayout?.("onboarding");
  }, []);

  useEffect(() => {
    setFullName(user?.name ?? "");
  }, [user?.name]);

  useEffect(() => {
    setCompanyName(companyInfo.companyName);
    setCompanyWebsite(companyInfo.companyWebsite);
  }, [companyInfo.companyName, companyInfo.companyWebsite]);

  if (!welcomeComplete) return <Navigate to="/welcome" replace />;
  if (!isAuthenticated) return <Navigate to="/auth" replace />;

  if (profileSetupComplete) {
    const next = getOnboardingFunnelRoute({
      profileSetupComplete,
      roleSetupComplete,
      shortcutTutorialComplete,
      paywallComplete,
      plan,
    });
    return <Navigate to={next ?? "/"} replace />;
  }

  const canContinue = fullName.trim().length > 0;

  const handleContinue = () => {
    if (!canContinue) return;

    updateUser({ name: fullName.trim() });
    updateCompanyInfo({
      companyName: companyName.trim(),
      companyWebsite: companyWebsite.trim(),
    });
    completeProfileSetup();
    notifyAppStoreChanged();
    navigate("/setup/role");
  };

  return (
    <SetupShell
      back={<BackButton to="/auth" />}
      review={{
        quote:
          "Having Replii on every call feels like a veteran sales coach sitting beside me, nudging me with the perfect line at exactly the right moment.",
        authorHandle: "@mike.sales",
        authorInitials: "MS",
      }}
    >
      <h1 className="min-w-0 break-words text-[22px] font-semibold leading-tight tracking-[-0.02em] text-zinc-900">
        Welcome to Replii
      </h1>
      <p className="mt-1.5 min-w-0 break-words text-[13px] leading-relaxed text-zinc-500">
        You&apos;re signing up with{" "}
        <span className="font-medium text-zinc-700">{user?.email}</span>
      </p>

      <div className="mt-6 space-y-4">
        <Field label="Full name">
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Your name"
            autoComplete="name"
            className={`${setupInputClassName} w-full outline-none transition-colors placeholder:text-zinc-400`}
          />
        </Field>

        <Field label="Company name" optional>
          <input
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="e.g., Acme Corp"
            autoComplete="organization"
            className={`${setupInputClassName} w-full outline-none transition-colors placeholder:text-zinc-400`}
          />
        </Field>

        <Field label="Company website" optional>
          <input
            value={companyWebsite}
            onChange={(e) => setCompanyWebsite(e.target.value)}
            placeholder="e.g., acme.com"
            autoComplete="url"
            inputMode="url"
            className={`${setupInputClassName} w-full outline-none transition-colors placeholder:text-zinc-400`}
          />
        </Field>
      </div>

      <SetupContinueButton disabled={!canContinue} onClick={handleContinue}>
        Continue
      </SetupContinueButton>
    </SetupShell>
  );
}

function Field({
  label,
  optional = false,
  children,
}: {
  label: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block min-w-0">
      <span className="mb-1.5 flex items-baseline justify-between gap-2 text-[12px] font-medium text-zinc-700">
        {label}
        {optional ? (
          <span className="shrink-0 font-normal text-zinc-400">Optional</span>
        ) : null}
      </span>
      {children}
    </label>
  );
}
