import type { Plan } from "../store/types";
import { hasDashboardAccess } from "./dashboard-access";

export interface OnboardingFlowState {
  onboardingComplete: boolean;
  shortcutTutorialComplete: boolean;
  paywallComplete: boolean;
  plan: Plan;
}

/** Next required route in signup funnel, or null if user may use the dashboard. */
export function getOnboardingFunnelRoute(
  state: OnboardingFlowState,
): string | null {
  if (!state.onboardingComplete) return "/onboarding";
  if (!state.shortcutTutorialComplete) return "/try";
  if (!hasDashboardAccess(state.plan, state.paywallComplete)) return "/paywall";
  return null;
}
