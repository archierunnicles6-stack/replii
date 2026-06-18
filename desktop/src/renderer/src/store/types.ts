export type SalesMode =
  | "sales"
  | "discovery"
  | "demo"
  | "negotiation"
  | "enterprise";

export type Plan = "free" | "solo" | "pro" | "undetectable";

/** Free tier session limit (start + end cycles). Paid plans are unlimited. */
export const FREE_SESSION_LIMIT = 3;

export function isPaidPlan(plan: Plan): boolean {
  return plan !== "free";
}

/** Sessions with no captured transcript should not count against the free tier. */
export function getEffectiveFreeSessionsUsed(
  meetings: MeetingRecord[],
  freeSessionsUsed: number,
): number {
  const billableMeetings = meetings.filter(
    (m) => (m.transcript?.length ?? 0) > 0,
  ).length;
  const pendingSessions = Math.max(0, freeSessionsUsed - meetings.length);
  return billableMeetings + pendingSessions;
}

export function canStartSession(
  plan: Plan,
  freeSessionsUsed: number,
  meetings: MeetingRecord[] = [],
): boolean {
  const used = getEffectiveFreeSessionsUsed(meetings, freeSessionsUsed);
  return isPaidPlan(plan) || used < FREE_SESSION_LIMIT;
}

export function getFreeSessionsRemaining(
  plan: Plan,
  freeSessionsUsed: number,
  meetings: MeetingRecord[] = [],
): number {
  if (isPaidPlan(plan)) return Number.POSITIVE_INFINITY;
  const used = getEffectiveFreeSessionsUsed(meetings, freeSessionsUsed);
  return Math.max(0, FREE_SESSION_LIMIT - used);
}

/** Overlay display toggle is only available on legacy grandfathered plans. */
export function canUseDetectabilityToggle(plan: Plan): boolean {
  return plan === "undetectable";
}

/** Free / Solo / Pro show the overlay on screen share. */
export function normalizedInvisibleSetting(plan: Plan, invisible: boolean): boolean {
  if (!canUseDetectabilityToggle(plan)) return false;
  return invisible;
}

/** Whether Electron content protection should be enabled (overlay hidden from capture). */
export function effectiveContentProtection(plan: Plan, invisible: boolean): boolean {
  return normalizedInvisibleSetting(plan, invisible);
}

export interface SalesModeConfig {
  id: SalesMode;
  name: string;
  description: string;
  systemPrompt: string;
}

export interface TranscriptLine {
  id: string;
  speaker: "You" | "Prospect" | "Other";
  text: string;
  timestamp: number;
}

export type MeetingStatus = "processing" | "ready" | "failed";

export interface SummarySection {
  heading: string;
  items: string[];
  /** When "paragraphs", items render as prose blocks instead of bullet points. */
  format?: "paragraphs" | "bullets";
}

export type SuggestionTag =
  | "objection"
  | "discovery"
  | "closing"
  | "pricing"
  | "competitive"
  | "question"
  | "general";

export type SuggestionSource = "auto" | "assist";

export interface SuggestionRecord {
  id: string;
  text: string;
  tags: SuggestionTag[];
  triggerText?: string;
  transcriptLineId?: string;
  timestamp: number;
  health?: number;
  source: SuggestionSource;
  /** Manager/rep feedback — did the rep use this suggestion? */
  repUsed?: boolean;
}

export type DealOutcome = "open" | "won" | "lost" | "stalled" | "no_decision";

export interface DealLink {
  crmId?: string;
  crmType?: "salesforce" | "hubspot" | "manual";
  stage?: string;
  amount?: number;
}

export interface MeetingRecord {
  id: string;
  title: string;
  company: string;
  date: string;
  duration: number;
  mode: SalesMode;
  summary: string;
  summarySections?: SummarySection[];
  status?: MeetingStatus;
  nextSteps: string[];
  transcript: TranscriptLine[];
  dealScore: number;
  objections: string[];
  /** AI suggestions shown during the live session. */
  suggestionUses?: number;
  /** Tagged coaching suggestions from the live session. */
  suggestions?: SuggestionRecord[];
  dealOutcome?: DealOutcome;
  dealOutcomeAt?: string;
  dealOutcomeNotes?: string;
  dealLink?: DealLink;
  managerNotes?: string;
}

export function salesModeShortLabel(mode: SalesMode): string {
  switch (mode) {
    case "sales":
      return "Default";
    case "discovery":
      return "Discovery";
    case "demo":
      return "Demo";
    case "negotiation":
      return "Negotiation";
    case "enterprise":
      return "Enterprise";
    default:
      return "Default";
  }
}

export interface UpcomingCall {
  id: string;
  title: string;
  company: string;
  datetime: string;
  participants: { name: string; role: string; bio: string }[];
  agenda: string;
  talkingPoints: string[];
  previousContext: string;
}

export interface UserSettings {
  invisible: boolean;
  hideFromTaskbar: boolean;
  autoLaunch: boolean;
  outputLanguage: string;
  meetingLanguage: string;
  displayId: number | null;
  screenshotCapture: boolean;
  ambientAiChat: boolean;
  colorTheme: "system" | "light" | "dark";
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

export const SALES_MODES: SalesModeConfig[] = [
  {
    id: "sales",
    name: "Ghost for Sales",
    description: "General sales call coaching — objections, discovery, closing.",
    systemPrompt:
      "You are Ghost, an elite sales coach. Give concise, natural responses the rep can say on live calls. Focus on discovery, value, and moving deals forward.",
  },
  {
    id: "discovery",
    name: "Discovery Calls",
    description: "Qualify pain, budget, authority, and timeline.",
    systemPrompt:
      "You are Ghost coaching a discovery call. Ask sharp qualifying questions. Uncover pain, impact, and decision process. Never pitch too early.",
  },
  {
    id: "demo",
    name: "Demo & Pitch",
    description: "Tailor the demo to stated pain and buying signals.",
    systemPrompt:
      "You are Ghost coaching a product demo. Tie features to prospect pain. Handle 'show me X' moments. Close with clear next step.",
  },
  {
    id: "negotiation",
    name: "Negotiation & Closing",
    description: "Pricing, contracts, and final objections.",
    systemPrompt:
      "You are Ghost coaching negotiation. Protect value, handle price objections, suggest trade-offs, and drive toward signed agreement.",
  },
  {
    id: "enterprise",
    name: "Enterprise Deals",
    description: "Multi-stakeholder, security, and procurement cycles.",
    systemPrompt:
      "You are Ghost coaching enterprise sales. Map stakeholders, handle security/procurement concerns, and advance multi-threaded deals.",
  },
];

export const DEFAULT_UPCOMING: UpcomingCall[] = [
  {
    id: "up-1",
    title: "Discovery — Acme Corp",
    company: "Acme Corp",
    datetime: new Date(Date.now() + 3600000).toISOString(),
    participants: [
      {
        name: "Sarah Chen",
        role: "VP Sales",
        bio: "Former Salesforce AE. Joined Acme 8 months ago to rebuild outbound. Likely champion.",
      },
      {
        name: "Marcus Webb",
        role: "CRO",
        bio: "Decision maker. Cares about rep productivity and forecast accuracy.",
      },
    ],
    agenda: "Initial discovery — current stack, pain with rep ramp time, Q3 goals.",
    talkingPoints: [
      "Ask about current coaching workflow",
      "Quantify cost of slow ramp (quota attainment)",
      "Confirm decision timeline for Q3",
    ],
    previousContext: "Inbound from webinar. Downloaded pricing one-pager last week.",
  },
  {
    id: "up-2",
    title: "Demo — Northwind Systems",
    company: "Northwind Systems",
    datetime: new Date(Date.now() + 86400000).toISOString(),
    participants: [
      {
        name: "James Okonkwo",
        role: "Head of Revenue Ops",
        bio: "Technical buyer. Evaluating Gong vs alternatives. Security-conscious.",
      },
    ],
    agenda: "Product demo — live coaching overlay, manager review, CRM workflow.",
    talkingPoints: [
      "Lead with live coaching demo",
      "Address data retention / SOC2",
      "Pilot proposal for 5 reps",
    ],
    previousContext: "Completed discovery 2 weeks ago. Sent security questionnaire.",
  },
];

export const DEMO_MEETINGS: MeetingRecord[] = [
  {
    id: "demo-welcome",
    title: "Welcome to Ghost",
    company: "Ghost",
    date: new Date().toISOString(),
    duration: 0,
    mode: "sales",
    summary:
      "Ghost is ready. Start a session to capture live conversations and get AI coaching in the moment.",
    nextSteps: ["Start your first session from the header"],
    transcript: [
      {
        id: "demo-welcome-1",
        speaker: "Other",
        text: "Welcome to Ghost.",
        timestamp: 0,
      },
      {
        id: "demo-welcome-2",
        speaker: "Other",
        text: "Your workspace is ready. Start a session whenever you are.",
        timestamp: 0,
      },
    ],
    dealScore: 0,
    objections: [],
  },
  {
    id: "demo-discovery",
    title: "Discovery — Acme Corp",
    company: "Acme Corp",
    date: new Date(Date.now() - 86400000).toISOString(),
    duration: 1847,
    mode: "discovery",
    summary:
      "Prospect evaluating coaching tools for a 12-rep team. Pain around ramp time and inconsistent discovery.",
    summarySections: [
      {
        heading: "Action Items",
        items: [
          "Send security one-pager before end of week",
          "Schedule demo with RevOps stakeholder",
          "Follow up on Gong comparison with differentiation doc",
        ],
      },
      {
        heading: "Key Discussion Points",
        items: [
          "12-rep team struggling with ramp time and inconsistent discovery",
          "Comparing Ghost to Gong — price and rep adoption are main concerns",
          "Strong interest in live coaching during calls vs post-call review",
        ],
      },
    ],
    status: "ready" as const,
    nextSteps: ["Send security one-pager", "Schedule demo with RevOps"],
    transcript: [
      {
        id: "demo-discovery-1",
        speaker: "Prospect",
        text: "We're still comparing you to Gong.",
        timestamp: 42,
      },
      {
        id: "demo-discovery-2",
        speaker: "You",
        text: "Price and whether reps actually use it — if it sits in a tab, it won't stick.",
        timestamp: 78,
      },
    ],
    dealScore: 62,
    objections: ["Gong comparison", "Rep adoption"],
    dealOutcome: "open",
    suggestions: [
      {
        id: "demo-sug-1",
        text: "What would need to be true for reps to actually use this daily?",
        tags: ["discovery"],
        triggerText: "We're still comparing you to Gong.",
        timestamp: 42,
        health: 58,
        source: "auto",
      },
      {
        id: "demo-sug-2",
        text: "If price weren't a factor, would live coaching solve the ramp problem?",
        tags: ["pricing", "objection"],
        triggerText: "Price and whether reps actually use it",
        timestamp: 78,
        health: 65,
        source: "auto",
        repUsed: true,
      },
    ],
  },
  {
    id: "demo-onboarding",
    title: "Discovery — Northwind Systems",
    company: "Northwind Systems",
    date: new Date(Date.now() - 172800000).toISOString(),
    duration: 2134,
    mode: "discovery",
    summary:
      "New reps struggling to hit quota. Strong interest in live coaching during calls.",
    summarySections: [
      {
        heading: "Action Items",
        items: [
          "Share onboarding playbook with James",
          "Propose 5-rep pilot starting next month",
          "Confirm security review timeline with IT",
        ],
      },
      {
        heading: "Key Discussion Points",
        items: [
          "New reps take 3+ months to hit quota — current shadowing program insufficient",
          "Head of RevOps wants live coaching, not just call recordings",
          "Pilot budget available if security review passes",
        ],
      },
    ],
    status: "ready" as const,
    nextSteps: ["Share onboarding playbook", "Propose 5-rep pilot"],
    transcript: [
      {
        id: "demo-onboarding-1",
        speaker: "Prospect",
        text: "Our new reps take forever to hit quota.",
        timestamp: 55,
      },
      {
        id: "demo-onboarding-2",
        speaker: "You",
        text: "Usually shadowing for two weeks, then they're on their own — that's the gap we help close.",
        timestamp: 91,
      },
    ],
    dealScore: 71,
    objections: ["Ramp time"],
    dealOutcome: "won",
    dealOutcomeAt: new Date(Date.now() - 86400000).toISOString(),
    suggestions: [
      {
        id: "demo-sug-3",
        text: "How long does it typically take new reps to hit quota today?",
        tags: ["discovery"],
        triggerText: "Our new reps take forever to hit quota.",
        timestamp: 55,
        health: 72,
        source: "auto",
        repUsed: true,
      },
      {
        id: "demo-sug-4",
        text: "Would a 5-rep pilot starting next month work for your team?",
        tags: ["closing"],
        triggerText: "Pilot budget available if security review passes",
        timestamp: 120,
        health: 78,
        source: "assist",
        repUsed: true,
      },
    ],
  },
];

/** True for meetings saved from a live Ghost session (not demo/placeholder data). */
export function isUserMeeting(meeting: MeetingRecord): boolean {
  return meeting.id.startsWith("mtg-");
}

export const DEFAULT_MEETINGS: MeetingRecord[] = [];

export const DEFAULT_SETTINGS: UserSettings = {
  invisible: false,
  hideFromTaskbar: true,
  autoLaunch: false,
  outputLanguage: "English",
  meetingLanguage: "English",
  displayId: null,
  screenshotCapture: false,
  ambientAiChat: false,
  colorTheme: "system",
};
