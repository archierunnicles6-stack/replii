import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  DEFAULT_MEETINGS,
  DEFAULT_SETTINGS,
  DEFAULT_UPCOMING,
  SALES_MODES,
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

interface AppState {
  user: User | null;
  isAuthenticated: boolean;
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
  audioCaptureMode: "auto" | "mic" | "system" | "mock";
  currentMeetingId: string | null;
  freeSessionsUsed: number;

  login: (email: string, name?: string, id?: string, avatar?: string) => void;
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
  setAudioCaptureMode: (mode: "auto" | "mic" | "system" | "mock") => void;
  setCurrentMeetingId: (id: string | null) => void;
  incrementFreeSessionUsage: () => void;
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

      login: (email, name, id, avatar) =>
        set({
          user: {
            id: id ?? `local-${email}`,
            email,
            name: name ?? email.split("@")[0] ?? "User",
            avatar:
              avatar ?? (name ?? email)[0]?.toUpperCase() ?? "G",
          },
          isAuthenticated: true,
        }),

      setUser: (user) => set({ user, isAuthenticated: true }),

      updateUser: (partial) =>
        set((s) =>
          s.user ? { user: { ...s.user, ...partial } } : {},
        ),

      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
          sessionActive: false,
        }),

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
        set((s) => ({ settings: { ...s.settings, ...partial } }));
        notifyAppStoreChanged();
      },

      setPlan: (plan) => set({ plan }),

      setSessionActive: (active) => set({ sessionActive: active }),

      setAudioCaptureMode: (mode) => set({ audioCaptureMode: mode }),

      setCurrentMeetingId: (id) => set({ currentMeetingId: id }),

      incrementFreeSessionUsage: () => {
        const { plan } = get();
        if (isPaidPlan(plan)) return;
        set((s) => ({ freeSessionsUsed: s.freeSessionsUsed + 1 }));
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

      deleteMeeting: (id) =>
        set((s) => ({ meetings: s.meetings.filter((m) => m.id !== id) })),

      getActiveModeConfig: () => {
        const { activeMode } = get();
        return SALES_MODES.find((m) => m.id === activeMode) ?? SALES_MODES[0];
      },
    }),
    {
      name: "ghost-app-storage",
      version: 5,
      migrate: (persisted, version) => {
        const state = persisted as Partial<AppState>;
        if (version < 5) {
          state.audioCaptureMode = "mic";
        }
        return state as AppState;
      },
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
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
        audioCaptureMode: state.audioCaptureMode,
      }),
    },
  ),
);

/** Pull the latest persisted state into this renderer (dashboard ↔ overlay sync). */
export async function rehydrateAppStoreFromStorage(): Promise<void> {
  await useAppStore.persist.rehydrate();
}

/** Notify other Electron windows to rehydrate after a store write in this window. */
export function notifyAppStoreChanged(): void {
  void window.ghost?.notifyStoreChanged?.();
}

if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key !== "ghost-app-storage") return;
    void rehydrateAppStoreFromStorage();
  });
}
