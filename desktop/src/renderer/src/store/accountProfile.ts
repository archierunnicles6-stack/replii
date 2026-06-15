import {
  DEFAULT_SETTINGS,
  DEFAULT_UPCOMING,
  SALES_MODES,
  type MeetingRecord,
  type Plan,
  type SalesMode,
  type UpcomingCall,
  type UserSettings,
} from "./types";

/** Per-account persisted data — isolated between sign-ins. */
export interface AccountProfile {
  onboardingComplete: boolean;
  shortcutTutorialComplete: boolean;
  paywallComplete: boolean;
  onboardingStep: number;
  plan: Plan;
  activeMode: SalesMode;
  customSystemPrompt: string;
  knowledgeFiles: string[];
  settings: UserSettings;
  meetings: MeetingRecord[];
  upcoming: UpcomingCall[];
  freeSessionsUsed: number;
}

export type AccountProfiles = Record<string, AccountProfile>;

export function createDefaultAccountProfile(): AccountProfile {
  return {
    onboardingComplete: false,
    shortcutTutorialComplete: false,
    paywallComplete: false,
    onboardingStep: 0,
    plan: "free",
    activeMode: "sales",
    customSystemPrompt: SALES_MODES[0].systemPrompt,
    knowledgeFiles: [],
    settings: { ...DEFAULT_SETTINGS },
    meetings: [],
    upcoming: [...DEFAULT_UPCOMING],
    freeSessionsUsed: 0,
  };
}

export function extractAccountProfile(state: {
  onboardingComplete: boolean;
  shortcutTutorialComplete: boolean;
  paywallComplete: boolean;
  onboardingStep: number;
  plan: Plan;
  activeMode: SalesMode;
  customSystemPrompt: string;
  knowledgeFiles: string[];
  settings: UserSettings;
  meetings: MeetingRecord[];
  upcoming: UpcomingCall[];
  freeSessionsUsed: number;
}): AccountProfile {
  return {
    onboardingComplete: state.onboardingComplete,
    shortcutTutorialComplete: state.shortcutTutorialComplete,
    paywallComplete: state.paywallComplete,
    onboardingStep: state.onboardingStep,
    plan: state.plan,
    activeMode: state.activeMode,
    customSystemPrompt: state.customSystemPrompt,
    knowledgeFiles: [...state.knowledgeFiles],
    settings: { ...state.settings },
    meetings: [...state.meetings],
    upcoming: [...state.upcoming],
    freeSessionsUsed: state.freeSessionsUsed,
  };
}

export function applyAccountProfile(profile: AccountProfile) {
  return {
    onboardingComplete: profile.onboardingComplete,
    shortcutTutorialComplete: profile.shortcutTutorialComplete,
    paywallComplete: profile.paywallComplete,
    onboardingStep: profile.onboardingStep,
    plan: profile.plan,
    activeMode: profile.activeMode,
    customSystemPrompt: profile.customSystemPrompt,
    knowledgeFiles: [...profile.knowledgeFiles],
    settings: { ...profile.settings },
    meetings: [...profile.meetings],
    upcoming: [...profile.upcoming],
    freeSessionsUsed: profile.freeSessionsUsed,
  };
}

export function extractLegacyAccountProfile(
  state: Record<string, unknown>,
): AccountProfile {
  const defaults = createDefaultAccountProfile();
  return {
    onboardingComplete: Boolean(state.onboardingComplete),
    shortcutTutorialComplete: Boolean(state.shortcutTutorialComplete),
    paywallComplete: Boolean(state.paywallComplete),
    onboardingStep: Number(state.onboardingStep) || 0,
    plan: (state.plan as Plan) ?? defaults.plan,
    activeMode: (state.activeMode as SalesMode) ?? defaults.activeMode,
    customSystemPrompt:
      (state.customSystemPrompt as string) ?? defaults.customSystemPrompt,
    knowledgeFiles: Array.isArray(state.knowledgeFiles)
      ? [...(state.knowledgeFiles as string[])]
      : defaults.knowledgeFiles,
    settings: {
      ...defaults.settings,
      ...(state.settings as UserSettings | undefined),
    },
    meetings: Array.isArray(state.meetings)
      ? [...(state.meetings as MeetingRecord[])]
      : defaults.meetings,
    upcoming: Array.isArray(state.upcoming)
      ? [...(state.upcoming as UpcomingCall[])]
      : defaults.upcoming,
    freeSessionsUsed: Number(state.freeSessionsUsed) || 0,
  };
}
