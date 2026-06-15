import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  applyAccountProfile,
  createDefaultAccountProfile,
  extractAccountProfile,
  extractLegacyAccountProfile,
  type AccountProfiles,
} from "./accountProfile";
import {
  DEFAULT_MEETINGS,
  DEFAULT_SETTINGS,
  DEFAULT_UPCOMING,
  SALES_MODES,
  canUseDetectabilityToggle,
  normalizedInvisibleSetting,
  getEffectiveFreeSessionsUsed,
  type MeetingRecord,
  type MeetingStatus,
  type Plan,
  type SalesMode,
  type SummarySection,
  type TranscriptLine,
  type UpcomingCall,
  type User,
  type UserSettings,
  isPaidPlan,
} from "./types";

function saveProfileForUser(
  profiles: AccountProfiles,
  userId: string,
  state: AppState,
): AccountProfiles {
  return {
    ...profiles,
    [userId]: extractAccountProfile(state),
  };
}

function switchToAccountProfile(
  profiles: AccountProfiles,
  userId: string,
): {
  accountProfiles: AccountProfiles;
  profile: ReturnType<typeof applyAccountProfile>;
} {
  const profile = profiles[userId] ?? createDefaultAccountProfile();
  return {
    accountProfiles: profiles,
    profile: applyAccountProfile(profile),
  };
}

interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  accountProfiles: AccountProfiles;
  welcomeComplete: boolean;
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
  sessionActive: boolean;
  audioCaptureMode: "auto" | "mic" | "system";
  currentMeetingId: string | null;
  freeSessionsUsed: number;

  login: (
    email: string,
    name?: string,
    id?: string,
    avatar?: string,
    isNewAccount?: boolean,
  ) => void;
  setUser: (user: User) => void;
  updateUser: (partial: Partial<User>) => void;
  logout: () => void;
  completeWelcome: () => void;
  completeOnboarding: () => void;
  completeShortcutTutorial: () => void;
  completePaywall: () => void;
  setOnboardingStep: (step: number) => void;
  setActiveMode: (mode: SalesMode) => void;
  setCustomSystemPrompt: (prompt: string) => void;
  addKnowledgeFile: (name: string) => void;
  removeKnowledgeFile: (name: string) => void;
  updateSettings: (partial: Partial<UserSettings>) => void;
  setPlan: (plan: Plan) => void;
  setSessionActive: (active: boolean) => void;
  setAudioCaptureMode: (mode: "auto" | "mic" | "system") => void;
  setCurrentMeetingId: (id: string | null) => void;
  incrementFreeSessionUsage: () => void;
  refundFreeSessionUsage: () => void;
  saveMeetingFromSession: (data: {
    title: string;
    company: string;
    mode: SalesMode;
    duration: number;
    transcript: TranscriptLine[];
    summary: string;
    summarySections?: SummarySection[];
    status?: MeetingStatus;
    nextSteps: string[];
    dealScore: number;
    objections: string[];
    suggestionUses?: number;
  }) => MeetingRecord;
  updateMeeting: (id: string, partial: Partial<MeetingRecord>) => void;
  deleteMeeting: (id: string) => void;
  getActiveModeConfig: () => (typeof SALES_MODES)[number];
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      accountProfiles: {},
      welcomeComplete: false,
      onboardingComplete: false,
      shortcutTutorialComplete: false,
      paywallComplete: false,
      onboardingStep: 0,
      plan: "free" as Plan,
      activeMode: "sales",
      customSystemPrompt: SALES_MODES[0].systemPrompt,
      knowledgeFiles: [],
      settings: DEFAULT_SETTINGS,
      meetings: DEFAULT_MEETINGS,
      upcoming: DEFAULT_UPCOMING,
      sessionActive: false,
      audioCaptureMode: "mic" as const,
      currentMeetingId: null,
      freeSessionsUsed: 0,

      login: (email, name, id, avatar, isNewAccount = false) => {
        const userId = id ?? `local-${email}`;
        const user: User = {
          id: userId,
          email,
          name: name ?? email.split("@")[0] ?? "User",
          avatar: avatar ?? (name ?? email)[0]?.toUpperCase() ?? "G",
        };

        set((s) => {
          let profiles = s.accountProfiles;
          if (s.user && s.user.id !== userId) {
            profiles = saveProfileForUser(profiles, s.user.id, s);
          }

          if (isNewAccount) {
            const freshProfile = createDefaultAccountProfile();
            profiles = { ...profiles, [userId]: freshProfile };
            return {
              accountProfiles: profiles,
              ...applyAccountProfile(freshProfile),
              user,
              isAuthenticated: true,
              sessionActive: false,
              currentMeetingId: null,
            };
          }

          const { accountProfiles, profile } = switchToAccountProfile(
            profiles,
            userId,
          );
          return {
            accountProfiles,
            ...profile,
            user,
            isAuthenticated: true,
            sessionActive: false,
            currentMeetingId: null,
          };
        });
        notifyAppStoreChanged();
      },

      setUser: (user) => {
        set((s) => {
          if (s.user?.id === user.id) {
            return { user, isAuthenticated: true };
          }

          let profiles = s.accountProfiles;
          if (s.user && s.user.id !== user.id) {
            profiles = saveProfileForUser(profiles, s.user.id, s);
          }
          const { accountProfiles, profile } = switchToAccountProfile(
            profiles,
            user.id,
          );
          return {
            accountProfiles,
            ...profile,
            user,
            isAuthenticated: true,
            sessionActive: false,
            currentMeetingId: null,
          };
        });
        notifyAppStoreChanged();
      },

      updateUser: (partial) =>
        set((s) =>
          s.user ? { user: { ...s.user, ...partial } } : {},
        ),

      logout: () => {
        set((s) => {
          const profiles = s.user
            ? saveProfileForUser(s.accountProfiles, s.user.id, s)
            : s.accountProfiles;
          const defaults = createDefaultAccountProfile();
          return {
            accountProfiles: profiles,
            user: null,
            isAuthenticated: false,
            sessionActive: false,
            currentMeetingId: null,
            ...defaults,
            welcomeComplete: s.welcomeComplete,
          };
        });
        notifyAppStoreChanged();
      },

      completeWelcome: () => set({ welcomeComplete: true }),

      completeOnboarding: () => set({ onboardingComplete: true }),

      completeShortcutTutorial: () => set({ shortcutTutorialComplete: true }),

      completePaywall: () => set({ paywallComplete: true }),

      setOnboardingStep: (step) => set({ onboardingStep: step }),

      setActiveMode: (mode) => {
        const config = SALES_MODES.find((m) => m.id === mode) ?? SALES_MODES[0];
        set({ activeMode: mode, customSystemPrompt: config.systemPrompt });
      },

      setCustomSystemPrompt: (prompt) => set({ customSystemPrompt: prompt }),

      addKnowledgeFile: (name) =>
        set((s) => ({
          knowledgeFiles: s.knowledgeFiles.includes(name)
            ? s.knowledgeFiles
            : [...s.knowledgeFiles, name],
        })),

      removeKnowledgeFile: (name) =>
        set((s) => ({
          knowledgeFiles: s.knowledgeFiles.filter((f) => f !== name),
        })),

      updateSettings: (partial) => {
        set((s) => {
          const next = { ...s.settings, ...partial };
          next.invisible = normalizedInvisibleSetting(
            s.plan,
            next.invisible,
          );
          return { settings: next };
        });
        notifyAppStoreChanged();
      },

      setPlan: (plan) => {
        set((s) => {
          const updates: Partial<AppState> = { plan };
          const invisible = normalizedInvisibleSetting(plan, s.settings.invisible);
          if (invisible !== s.settings.invisible) {
            updates.settings = { ...s.settings, invisible };
          }
          return updates;
        });
        notifyAppStoreChanged();
      },

      setSessionActive: (active) => set({ sessionActive: active }),

      setAudioCaptureMode: (mode) => set({ audioCaptureMode: mode }),

      setCurrentMeetingId: (id) => set({ currentMeetingId: id }),

      incrementFreeSessionUsage: () => {
        const { plan } = get();
        if (isPaidPlan(plan)) return;
        set((s) => ({ freeSessionsUsed: s.freeSessionsUsed + 1 }));
        notifyAppStoreChanged();
      },

      refundFreeSessionUsage: () => {
        const { plan } = get();
        if (isPaidPlan(plan)) return;
        set((s) => ({
          freeSessionsUsed: Math.max(0, s.freeSessionsUsed - 1),
        }));
        notifyAppStoreChanged();
      },

      saveMeetingFromSession: (data) => {
        const meeting: MeetingRecord = {
          id: `mtg-${Date.now()}`,
          title: data.title,
          company: data.company,
          date: new Date().toISOString(),
          duration: data.duration,
          mode: data.mode,
          summary: data.summary,
          summarySections: data.summarySections,
          status: data.status ?? "ready",
          nextSteps: data.nextSteps,
          transcript: data.transcript,
          dealScore: data.dealScore,
          objections: data.objections,
          suggestionUses: data.suggestionUses ?? 0,
        };
        set((s) => ({ meetings: [meeting, ...s.meetings] }));
        notifyAppStoreChanged();
        return meeting;
      },

      updateMeeting: (id, partial) => {
        set((s) => ({
          meetings: s.meetings.map((m) =>
            m.id === id ? { ...m, ...partial } : m,
          ),
        }));
        notifyAppStoreChanged();
      },

      deleteMeeting: (id) => {
        set((s) => ({ meetings: s.meetings.filter((m) => m.id !== id) }));
        notifyAppStoreChanged();
      },

      getActiveModeConfig: () => {
        const { activeMode } = get();
        return SALES_MODES.find((m) => m.id === activeMode) ?? SALES_MODES[0];
      },
    }),
    {
      name: "ghost-app-storage",
      version: 7,
      migrate: (persisted, version) => {
        const state = persisted as Record<string, unknown>;
        if (version < 5) {
          state.audioCaptureMode = "mic";
        }
        if (version < 7) {
          const mode = state.audioCaptureMode;
          if (mode === "auto" || mode === "mock") {
            state.audioCaptureMode = "mic";
          }
        }
        if (version < 6) {
          const profiles =
            (state.accountProfiles as AccountProfiles | undefined) ?? {};
          const userId =
            (state.user as User | null | undefined)?.id ?? "_legacy";
          if (!profiles[userId]) {
            profiles[userId] = extractLegacyAccountProfile(state);
          }
          if (userId === "_legacy" && (state.user as User | undefined)?.id) {
            const realId = (state.user as User).id;
            profiles[realId] = profiles["_legacy"];
            delete profiles["_legacy"];
          }
          state.accountProfiles = profiles;
        }
        return state as AppState;
      },
      partialize: (state) => {
        const profiles = state.user
          ? saveProfileForUser(state.accountProfiles, state.user.id, state)
          : state.accountProfiles;
        return {
          user: state.user,
          isAuthenticated: state.isAuthenticated,
          accountProfiles: profiles,
          audioCaptureMode: state.audioCaptureMode,
          welcomeComplete: state.welcomeComplete,
          onboardingComplete: state.onboardingComplete,
          shortcutTutorialComplete: state.shortcutTutorialComplete,
          paywallComplete: state.paywallComplete,
          onboardingStep: state.onboardingStep,
          plan: state.plan,
          activeMode: state.activeMode,
          customSystemPrompt: state.customSystemPrompt,
          knowledgeFiles: state.knowledgeFiles,
          settings: state.settings,
          meetings: state.meetings,
          upcoming: state.upcoming,
          freeSessionsUsed: state.freeSessionsUsed,
        };
      },
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        const invisible = normalizedInvisibleSetting(
          state.plan,
          state.settings.invisible,
        );
        if (invisible !== state.settings.invisible) {
          state.settings = { ...state.settings, invisible };
        }
        if (!state.user?.id) return;
        const profile = state.accountProfiles[state.user.id];
        if (!profile) return;
        Object.assign(state, applyAccountProfile(profile));
        syncPlanLimitsToMain();
      },
    },
  ),
);

/** Pull the latest persisted state into this renderer (dashboard ↔ overlay sync). */
export async function rehydrateAppStoreFromStorage(): Promise<void> {
  await useAppStore.persist.rehydrate();
  const { user, accountProfiles } = useAppStore.getState();
  if (user?.id && accountProfiles[user.id]) {
    useAppStore.setState(applyAccountProfile(accountProfiles[user.id]));
    syncPlanLimitsToMain();
  }
}

/** Notify other Electron windows to rehydrate after a store write in this window. */
export function notifyAppStoreChanged(): void {
  void window.ghost?.notifyStoreChanged?.();
  syncPlanLimitsToMain();
}

/** Sync plan limits to the main process for hard enforcement at session start. */
export async function syncPlanLimitsToMain(): Promise<void> {
  if (typeof window === "undefined" || !window.ghost?.syncPlanLimits) return;
  const { plan, freeSessionsUsed, meetings } = useAppStore.getState();
  const effectiveUsed = getEffectiveFreeSessionsUsed(meetings, freeSessionsUsed);
  await window.ghost.syncPlanLimits({ plan, freeSessionsUsed: effectiveUsed });
}

if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key !== "ghost-app-storage") return;
    void rehydrateAppStoreFromStorage();
  });
}
