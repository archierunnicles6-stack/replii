import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  clampCompanyInfo,
  compileKnowledgeContext,
  DEFAULT_COMPANY_INFO,
  type CompanyInfo,
} from "../lib/company-info";
import {
  createKnowledgeDocument,
  MAX_KNOWLEDGE_DOCS,
  normalizeKnowledgeDocuments,
  type KnowledgeDocument,
} from "../lib/knowledge-documents";
import {
  applyAccountProfile,
  createDefaultAccountProfile,
  extractAccountProfile,
  extractLegacyAccountProfile,
  type AccountProfile,
  type AccountProfiles,
} from "./accountProfile";
import {
  DEFAULT_MEETINGS,
  DEFAULT_SETTINGS,
  DEFAULT_UPCOMING,
  SALES_MODES,
  canUseDetectabilityToggle,
  normalizedInvisibleSetting,
  resolveFreeOverlaySecondsUsed,
  type MeetingRecord,
  type MeetingStatus,
  type Plan,
  type SalesMode,
  type SuggestionRecord,
  type SummarySection,
  type TranscriptLine,
  type UpcomingCall,
  type User,
  type UserSettings,
  isPaidPlan,
  isUserMeeting,
} from "./types";

const FAKE_SUMMARY_MARKERS = [
  "mid-market SaaS prospect",
  "Review key points discussed and confirm next steps with the prospect",
  "Send a follow-up summary email within 24 hours",
  "Schedule the next meeting while momentum is high",
  "Review the transcript and follow up on open items",
];
const EMPTY_SUMMARY_MESSAGE =
  "No transcript was captured for this session, so Ghost could not generate a summary. Start a new session with your microphone enabled to record the conversation.";
const SUMMARY_UNAVAILABLE_MESSAGE =
  "Add your OpenAI API key to generate an AI summary.";

function meetingContainsFakeSummary(meeting: MeetingRecord): boolean {
  const text = [
    meeting.summary ?? "",
    ...(meeting.summarySections?.flatMap((section) => section.items) ?? []),
    ...(meeting.nextSteps ?? []),
    ...(meeting.objections ?? []),
  ].join("\n");

  return FAKE_SUMMARY_MARKERS.some((marker) => text.includes(marker));
}

function stripFakeDemoData(meetings: MeetingRecord[]): MeetingRecord[] {
  return meetings
    .filter((m) => !m.id.startsWith("demo-"))
    .map((m) => {
      if (!isUserMeeting(m) || !meetingContainsFakeSummary(m)) return m;

      const hasTranscript = m.transcript.length > 0;
      const message = hasTranscript
        ? SUMMARY_UNAVAILABLE_MESSAGE
        : EMPTY_SUMMARY_MESSAGE;
      const heading = hasTranscript ? "Summary unavailable" : "Summary";

      return {
        ...m,
        summary: message,
        summarySections: [
          {
            heading,
            format: hasTranscript ? undefined : ("paragraphs" as const),
            items: [message],
          },
        ],
        nextSteps: [],
        objections: [],
        dealScore: 0,
      };
    });
}

function stripFakeUpcoming(upcoming: UpcomingCall[]): UpcomingCall[] {
  return upcoming.filter((call) => !call.id.startsWith("up-"));
}

function pushForCurrentUser(): void {
  const userId = useAppStore.getState().user?.id;
  if (!userId) return;
  void import("../services/account-sync").then(({ scheduleAccountPush }) =>
    scheduleAccountPush(userId),
  );
}

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

function withKnowledgeContext(
  state: AppState,
  patch: Partial<AppState>,
): Partial<AppState> {
  const merged = { ...state, ...patch };
  const knowledgeContext = compileKnowledgeContext(
    merged.customSystemPrompt,
    merged.companyInfo,
    merged.knowledgeFiles,
  );
  return withAccountProfile(state, { ...patch, knowledgeContext });
}

/** Keep per-account profile in sync whenever top-level persisted fields change. */
function withAccountProfile(
  state: AppState,
  patch: Partial<AppState>,
): Partial<AppState> {
  if (!state.user?.id) return patch;
  const merged = { ...state, ...patch };
  return {
    ...patch,
    accountProfiles: saveProfileForUser(
      state.accountProfiles,
      state.user.id,
      merged,
    ),
  };
}

/** Never downgrade one-way completion flags when merging profile into live state. */
function mergeAccountProfileIntoState(
  state: Pick<
    AppState,
    | "onboardingComplete"
    | "shortcutTutorialComplete"
    | "paywallComplete"
    | "onboardingStep"
    | "plan"
    | "activeMode"
    | "customSystemPrompt"
    | "companyInfo"
    | "knowledgeFiles"
    | "knowledgeContext"
    | "settings"
    | "meetings"
    | "upcoming"
    | "freeOverlaySecondsUsed"
  >,
  profile: AccountProfile,
): ReturnType<typeof applyAccountProfile> {
  const applied = applyAccountProfile(profile);
  return {
    ...applied,
    onboardingComplete:
      applied.onboardingComplete || state.onboardingComplete,
    shortcutTutorialComplete:
      applied.shortcutTutorialComplete || state.shortcutTutorialComplete,
    paywallComplete: applied.paywallComplete || state.paywallComplete,
    freeOverlaySecondsUsed: Math.max(
      applied.freeOverlaySecondsUsed,
      state.freeOverlaySecondsUsed,
    ),
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
  companyInfo: CompanyInfo;
  knowledgeFiles: KnowledgeDocument[];
  knowledgeContext: string;
  settings: UserSettings;
  meetings: MeetingRecord[];
  upcoming: UpcomingCall[];
  sessionActive: boolean;
  audioCaptureMode: "auto" | "mic" | "system";
  currentMeetingId: string | null;
  freeOverlaySecondsUsed: number;
  pendingSettingsSection: string | null;

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
  updateCompanyInfo: (partial: Partial<CompanyInfo>) => void;
  addKnowledgeDocument: (name: string, text: string) => boolean;
  removeKnowledgeDocument: (id: string) => void;
  updateSettings: (partial: Partial<UserSettings>) => void;
  setPlan: (plan: Plan) => void;
  setSessionActive: (active: boolean) => void;
  setAudioCaptureMode: (mode: "auto" | "mic" | "system") => void;
  setCurrentMeetingId: (id: string | null) => void;
  addFreeOverlaySeconds: (seconds: number) => void;
  requestSettingsOpen: (section: string) => void;
  clearPendingSettingsOpen: () => void;
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
    suggestions?: SuggestionRecord[];
  }) => MeetingRecord;
  updateMeeting: (id: string, partial: Partial<MeetingRecord>) => void;
  updateSuggestion: (
    meetingId: string,
    suggestionId: string,
    partial: Partial<SuggestionRecord>,
  ) => void;
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
      companyInfo: { ...DEFAULT_COMPANY_INFO },
      knowledgeFiles: [],
      knowledgeContext: "",
      settings: DEFAULT_SETTINGS,
      meetings: DEFAULT_MEETINGS,
      upcoming: DEFAULT_UPCOMING,
      sessionActive: false,
      audioCaptureMode: "mic" as const,
      currentMeetingId: null,
      freeOverlaySecondsUsed: 0,
      pendingSettingsSection: null,

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

          if (isNewAccount && !profiles[userId]) {
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
        void import("../services/account-sync").then(({ syncAccountData }) =>
          syncAccountData(user.id),
        );
      },

      updateUser: (partial) =>
        set((s) =>
          s.user ? { user: { ...s.user, ...partial } } : {},
        ),

      logout: () => {
        const snapshot = get();
        const userId = snapshot.user?.id;
        const profiles = userId
          ? saveProfileForUser(snapshot.accountProfiles, userId, snapshot)
          : snapshot.accountProfiles;
        const profile = userId ? profiles[userId] : undefined;
        if (userId && profile) {
          void import("../services/account-sync").then(({ pushAccountData }) =>
            pushAccountData(userId, profile),
          );
        }
        set(() => {
          const defaults = createDefaultAccountProfile();
          return {
            accountProfiles: profiles,
            user: null,
            isAuthenticated: false,
            sessionActive: false,
            currentMeetingId: null,
            ...defaults,
            welcomeComplete: snapshot.welcomeComplete,
          };
        });
        notifyAppStoreChanged();
      },

      completeWelcome: () => set({ welcomeComplete: true }),

      completeOnboarding: () => {
        set((s) => withAccountProfile(s, { onboardingComplete: true }));
        notifyAppStoreChanged();
        pushForCurrentUser();
      },

      completeShortcutTutorial: () => {
        set((s) => withAccountProfile(s, { shortcutTutorialComplete: true }));
        notifyAppStoreChanged();
        pushForCurrentUser();
      },

      completePaywall: () => {
        set((s) => withAccountProfile(s, { paywallComplete: true }));
        notifyAppStoreChanged();
        pushForCurrentUser();
      },

      setOnboardingStep: (step) => {
        set((s) => withAccountProfile(s, { onboardingStep: step }));
        pushForCurrentUser();
      },

      setActiveMode: (mode) => {
        const config = SALES_MODES.find((m) => m.id === mode) ?? SALES_MODES[0];
        set((s) =>
          withKnowledgeContext(s, {
            activeMode: mode,
            customSystemPrompt: config.systemPrompt,
          }),
        );
        notifyAppStoreChanged();
        pushForCurrentUser();
      },

      setCustomSystemPrompt: (prompt) => {
        set((s) => withKnowledgeContext(s, { customSystemPrompt: prompt }));
        notifyAppStoreChanged();
        pushForCurrentUser();
      },

      updateCompanyInfo: (partial) => {
        set((s) =>
          withKnowledgeContext(s, {
            companyInfo: clampCompanyInfo({ ...s.companyInfo, ...partial }),
          }),
        );
        notifyAppStoreChanged();
        pushForCurrentUser();
      },

      addKnowledgeDocument: (name, text) => {
        let added = false;
        set((s) => {
          if (s.knowledgeFiles.length >= MAX_KNOWLEDGE_DOCS) return {};
          const doc = createKnowledgeDocument(name, text);
          if (!doc.text.trim()) return {};
          added = true;
          return withKnowledgeContext(s, {
            knowledgeFiles: [...s.knowledgeFiles, doc],
          });
        });
        if (added) {
          notifyAppStoreChanged();
          pushForCurrentUser();
        }
        return added;
      },

      removeKnowledgeDocument: (id) => {
        set((s) =>
          withKnowledgeContext(s, {
            knowledgeFiles: s.knowledgeFiles.filter((doc) => doc.id !== id),
          }),
        );
        notifyAppStoreChanged();
        pushForCurrentUser();
      },

      updateSettings: (partial) => {
        set((s) => {
          const next = { ...s.settings, ...partial };
          next.invisible = normalizedInvisibleSetting(s.plan, next.invisible);
          return withAccountProfile(s, { settings: next });
        });
        notifyAppStoreChanged();
        pushForCurrentUser();
      },

      setPlan: (plan) => {
        set((s) => {
          const updates: Partial<AppState> = { plan };
          if (isPaidPlan(plan) && !s.paywallComplete) {
            updates.paywallComplete = true;
          }
          const invisible = normalizedInvisibleSetting(plan, s.settings.invisible);
          if (invisible !== s.settings.invisible) {
            updates.settings = { ...s.settings, invisible };
          }
          return withAccountProfile(s, updates);
        });
        notifyAppStoreChanged();
        pushForCurrentUser();
      },

      setSessionActive: (active) => set({ sessionActive: active }),

      setAudioCaptureMode: (mode) => set({ audioCaptureMode: mode }),

      setCurrentMeetingId: (id) => set({ currentMeetingId: id }),

      addFreeOverlaySeconds: (seconds) => {
        const { plan } = get();
        if (isPaidPlan(plan) || seconds <= 0) return;
        set((s) =>
          withAccountProfile(s, {
            freeOverlaySecondsUsed: s.freeOverlaySecondsUsed + seconds,
          }),
        );
        notifyAppStoreChanged();
      },

      requestSettingsOpen: (section) => {
        set({ pendingSettingsSection: section });
      },

      clearPendingSettingsOpen: () => {
        set({ pendingSettingsSection: null });
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
          suggestions: data.suggestions ?? [],
          dealOutcome: "open",
        };
        set((s) =>
          withAccountProfile(s, { meetings: [meeting, ...s.meetings] }),
        );
        notifyAppStoreChanged();
        const userId = get().user?.id;
        if (userId) {
          void import("../services/account-sync").then(({ pushMeeting }) =>
            pushMeeting(userId, meeting),
          );
        }
        return meeting;
      },

      updateMeeting: (id, partial) => {
        let updated: MeetingRecord | undefined;
        set((s) => {
          const meetings = s.meetings.map((m) => {
            if (m.id !== id) return m;
            updated = { ...m, ...partial };
            return updated;
          });
          return withAccountProfile(s, { meetings });
        });
        notifyAppStoreChanged();
        const userId = get().user?.id;
        if (userId && updated) {
          void import("../services/account-sync").then(({ pushMeeting }) =>
            pushMeeting(userId, updated!),
          );
        }
      },

      updateSuggestion: (meetingId, suggestionId, partial) => {
        set((s) => {
          const meetings = s.meetings.map((m) => {
            if (m.id !== meetingId || !m.suggestions) return m;
            return {
              ...m,
              suggestions: m.suggestions.map((sug) =>
                sug.id === suggestionId ? { ...sug, ...partial } : sug,
              ),
            };
          });
          return withAccountProfile(s, { meetings });
        });
        notifyAppStoreChanged();
      },

      deleteMeeting: (id) => {
        const userId = get().user?.id;
        set((s) =>
          withAccountProfile(s, {
            meetings: s.meetings.filter((m) => m.id !== id),
          }),
        );
        notifyAppStoreChanged();
        if (userId) {
          void import("../services/account-sync").then(({ deleteRemoteMeeting }) =>
            deleteRemoteMeeting(userId, id),
          );
        }
      },

      getActiveModeConfig: () => {
        const { activeMode } = get();
        return SALES_MODES.find((m) => m.id === activeMode) ?? SALES_MODES[0];
      },
    }),
    {
      name: "ghost-app-storage",
      version: 14,
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
        if (version < 8) {
          const profiles =
            (state.accountProfiles as AccountProfiles | undefined) ?? {};
          for (const id of Object.keys(profiles)) {
            const profile = profiles[id];
            if (!profile.companyInfo) {
              profiles[id] = {
                ...profile,
                companyInfo: { ...DEFAULT_COMPANY_INFO },
              };
            }
          }
          if (!state.companyInfo) {
            state.companyInfo = { ...DEFAULT_COMPANY_INFO };
          }
        }
        if (version < 9) {
          const normalizeMeetings = (meetings: MeetingRecord[]) =>
            meetings.map((m) => ({
              ...m,
              dealOutcome: m.dealOutcome ?? "open",
              suggestions: m.suggestions ?? [],
            }));

          if (Array.isArray(state.meetings)) {
            state.meetings = normalizeMeetings(state.meetings as MeetingRecord[]);
          }
          const profiles =
            (state.accountProfiles as AccountProfiles | undefined) ?? {};
          for (const id of Object.keys(profiles)) {
            profiles[id] = {
              ...profiles[id],
              meetings: normalizeMeetings(profiles[id].meetings),
            };
          }
          state.accountProfiles = profiles;
        }
        if (version < 10) {
          state.freeOverlaySecondsUsed = resolveFreeOverlaySecondsUsed(
            Number(state.freeOverlaySecondsUsed) || undefined,
            Number(state.freeSessionsUsed) || undefined,
          );
          delete state.freeSessionsUsed;

          const profiles =
            (state.accountProfiles as AccountProfiles | undefined) ?? {};
          for (const id of Object.keys(profiles)) {
            const profile = profiles[id] as Record<string, unknown>;
            profiles[id] = {
              ...profiles[id],
              freeOverlaySecondsUsed: resolveFreeOverlaySecondsUsed(
                Number(profile.freeOverlaySecondsUsed) || undefined,
                Number(profile.freeSessionsUsed) || undefined,
              ),
            };
            delete (profiles[id] as Record<string, unknown>).freeSessionsUsed;
          }
          state.accountProfiles = profiles;
        }
        if (version < 11) {
          if (Array.isArray(state.meetings)) {
            state.meetings = stripFakeDemoData(state.meetings as MeetingRecord[]);
          }
          if (Array.isArray(state.upcoming)) {
            state.upcoming = stripFakeUpcoming(state.upcoming as UpcomingCall[]);
          }

          const profiles =
            (state.accountProfiles as AccountProfiles | undefined) ?? {};
          for (const id of Object.keys(profiles)) {
            profiles[id] = {
              ...profiles[id],
              meetings: stripFakeDemoData(profiles[id].meetings),
              upcoming: stripFakeUpcoming(profiles[id].upcoming),
            };
          }
          state.accountProfiles = profiles;
        }
        if (version < 12) {
          if (Array.isArray(state.meetings)) {
            state.meetings = stripFakeDemoData(state.meetings as MeetingRecord[]);
          }
          const profiles =
            (state.accountProfiles as AccountProfiles | undefined) ?? {};
          for (const id of Object.keys(profiles)) {
            profiles[id] = {
              ...profiles[id],
              meetings: stripFakeDemoData(profiles[id].meetings),
            };
          }
          state.accountProfiles = profiles;
        }
        if (version < 13) {
          state.knowledgeFiles = normalizeKnowledgeDocuments(state.knowledgeFiles);

          const profiles =
            (state.accountProfiles as AccountProfiles | undefined) ?? {};
          for (const id of Object.keys(profiles)) {
            profiles[id] = {
              ...profiles[id],
              knowledgeFiles: normalizeKnowledgeDocuments(
                profiles[id].knowledgeFiles,
              ),
            };
          }
          state.accountProfiles = profiles;
        }
        if (version < 14) {
          const compileFor = (profile: AccountProfile): AccountProfile => ({
            ...profile,
            knowledgeContext: compileKnowledgeContext(
              profile.customSystemPrompt,
              profile.companyInfo ?? DEFAULT_COMPANY_INFO,
              normalizeKnowledgeDocuments(profile.knowledgeFiles),
            ),
          });

          state.knowledgeContext = compileKnowledgeContext(
            (state.customSystemPrompt as string) ?? SALES_MODES[0].systemPrompt,
            (state.companyInfo as CompanyInfo) ?? DEFAULT_COMPANY_INFO,
            normalizeKnowledgeDocuments(state.knowledgeFiles),
          );

          const profiles =
            (state.accountProfiles as AccountProfiles | undefined) ?? {};
          for (const id of Object.keys(profiles)) {
            profiles[id] = compileFor(profiles[id]);
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
          companyInfo: state.companyInfo,
          knowledgeFiles: state.knowledgeFiles,
          knowledgeContext: state.knowledgeContext,
          settings: state.settings,
          meetings: state.meetings,
          upcoming: state.upcoming,
          freeOverlaySecondsUsed: state.freeOverlaySecondsUsed,
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
        state.knowledgeFiles = normalizeKnowledgeDocuments(state.knowledgeFiles);
        if (!state.knowledgeContext?.trim()) {
          state.knowledgeContext = compileKnowledgeContext(
            state.customSystemPrompt,
            state.companyInfo,
            state.knowledgeFiles,
          );
        }
        const profile = state.accountProfiles[state.user.id];
        if (!profile) return;
        Object.assign(state, mergeAccountProfileIntoState(state, profile));
        syncPlanLimitsToMain();
      },
    },
  ),
);

/** Pull the latest persisted state into this renderer (dashboard ↔ overlay sync). */
export async function rehydrateAppStoreFromStorage(): Promise<void> {
  const before = useAppStore.getState();
  await useAppStore.persist.rehydrate();
  const after = useAppStore.getState();
  if (!after.user?.id) return;
  const profile = after.accountProfiles[after.user.id];
  if (!profile) return;
  useAppStore.setState(mergeAccountProfileIntoState(
    {
      ...before,
      onboardingComplete: before.onboardingComplete || after.onboardingComplete,
      shortcutTutorialComplete:
        before.shortcutTutorialComplete || after.shortcutTutorialComplete,
      paywallComplete: before.paywallComplete || after.paywallComplete,
      freeOverlaySecondsUsed: Math.max(
        before.freeOverlaySecondsUsed,
        after.freeOverlaySecondsUsed,
      ),
    },
    profile,
  ));
  syncPlanLimitsToMain();
}

/** Notify other Electron windows to rehydrate after a store write in this window. */
export function notifyAppStoreChanged(): void {
  void window.ghost?.notifyStoreChanged?.();
  syncPlanLimitsToMain();
}

/** Sync plan limits to the main process for hard enforcement at session start. */
export async function syncPlanLimitsToMain(): Promise<void> {
  if (typeof window === "undefined" || !window.ghost?.syncPlanLimits) return;
  const { plan, freeOverlaySecondsUsed } = useAppStore.getState();
  await window.ghost.syncPlanLimits({ plan, freeOverlaySecondsUsed });
}

if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key !== "ghost-app-storage") return;
    void rehydrateAppStoreFromStorage();
  });
}
