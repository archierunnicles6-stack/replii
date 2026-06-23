import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { SetupContinueButton } from "../../components/onboarding/SetupContinueButton";
import { SetupShell } from "../../components/onboarding/SetupShell";
import { BackButton } from "../../components/ui";
import { getOnboardingFunnelRoute } from "../../lib/onboarding-flow";
import { SALES_ROLE_OPTIONS } from "../../lib/sales-roles";
import { notifyAppStoreChanged, useAppStore } from "../../store/useAppStore";

export function RoleSetupPage() {
  const navigate = useNavigate();
  const welcomeComplete = useAppStore((s) => s.welcomeComplete);
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const profileSetupComplete = useAppStore((s) => s.profileSetupComplete);
  const roleSetupComplete = useAppStore((s) => s.roleSetupComplete);
  const shortcutTutorialComplete = useAppStore((s) => s.shortcutTutorialComplete);
  const paywallComplete = useAppStore((s) => s.paywallComplete);
  const plan = useAppStore((s) => s.plan);
  const salesRole = useAppStore((s) => s.salesRole);
  const setSalesRole = useAppStore((s) => s.setSalesRole);
  const completeRoleSetup = useAppStore((s) => s.completeRoleSetup);

  const [selectedRole, setSelectedRole] = useState(salesRole);

  useEffect(() => {
    void window.replii?.setDashboardLayout?.("onboarding");
  }, []);

  useEffect(() => {
    if (salesRole) setSelectedRole(salesRole);
  }, [salesRole]);

  if (!welcomeComplete) return <Navigate to="/welcome" replace />;
  if (!isAuthenticated) return <Navigate to="/auth" replace />;
  if (!profileSetupComplete) return <Navigate to="/setup/profile" replace />;

  if (roleSetupComplete) {
    const next = getOnboardingFunnelRoute({
      profileSetupComplete,
      roleSetupComplete,
      shortcutTutorialComplete,
      paywallComplete,
      plan,
    });
    return <Navigate to={next ?? "/"} replace />;
  }

  const canContinue = selectedRole.trim().length > 0;

  const handleContinue = () => {
    if (!canContinue) return;
    setSalesRole(selectedRole);
    completeRoleSetup();
    notifyAppStoreChanged();
    navigate("/try");
  };

  return (
    <SetupShell
      back={<BackButton to="/setup/profile" />}
      review={{
        quote:
          "I closed two deals this week I would have lost before — Replii's live objection handling is genuinely next level.",
        authorHandle: "@sarah.ae",
        authorInitials: "SA",
      }}
    >
      <h1 className="min-w-0 break-words text-[22px] font-semibold leading-tight tracking-[-0.02em] text-zinc-900">
        Which best describes your role?
      </h1>
      <p className="mt-1.5 min-w-0 break-words text-[13px] leading-relaxed text-zinc-500">
        This helps highlight what&apos;s most useful for you, without limiting
        what you can explore.
      </p>

      <div className="mt-6 flex min-w-0 flex-wrap gap-2">
        {SALES_ROLE_OPTIONS.map((role) => {
          const selected = selectedRole === role;
          return (
            <button
              key={role}
              type="button"
              onClick={() => setSelectedRole(role)}
              className={`rounded-full border px-3 py-1.5 text-[12px] font-medium transition-colors ${
                selected
                  ? "border-[#3b82f6] bg-[#3b82f6] text-white"
                  : "border-zinc-200 bg-white text-zinc-800 hover:border-[#3b82f6]/30 hover:bg-[#3b82f6]/[0.04]"
              }`}
            >
              {role}
            </button>
          );
        })}
      </div>

      <SetupContinueButton disabled={!canContinue} onClick={handleContinue}>
        Continue
      </SetupContinueButton>
    </SetupShell>
  );
}
