export type SalesMode =
  | "sales"
  | "discovery"
  | "demo"
  | "negotiation"
  | "enterprise";

export type Plan = "free" | "solo" | "pro" | "undetectable";

/** Free tier overlay-on time (seconds). Paid plans are unlimited. */
export const FREE_OVERLAY_LIMIT_SECONDS = 30 * 60;

/** Legacy session limit — used only when migrating persisted state. */
const LEGACY_FREE_SESSION_LIMIT = 3;

export function isPaidPlan(plan: Plan): boolean {
  return plan !== "free";
}

/** Convert legacy session counts to overlay seconds for migration. */
export function migrateLegacyFreeSessionsUsed(freeSessionsUsed: number): number {
  if (freeSessionsUsed >= LEGACY_FREE_SESSION_LIMIT) {
    return FREE_OVERLAY_LIMIT_SECONDS;
  }
  return Math.min(
    freeSessionsUsed * 600,
    FREE_OVERLAY_LIMIT_SECONDS,
  );
}

export function resolveFreeOverlaySecondsUsed(
  freeOverlaySecondsUsed: number | undefined,
  legacyFreeSessionsUsed: number | undefined,
): number {
  if (typeof freeOverlaySecondsUsed === "number" && freeOverlaySecondsUsed > 0) {
    return Math.max(0, freeOverlaySecondsUsed);
  }
  if (typeof legacyFreeSessionsUsed === "number" && legacyFreeSessionsUsed > 0) {
    return migrateLegacyFreeSessionsUsed(legacyFreeSessionsUsed);
  }
  return Math.max(0, freeOverlaySecondsUsed ?? 0);
}

export function canStartSession(
  plan: Plan,
  freeOverlaySecondsUsed: number,
): boolean {
  return (
    isPaidPlan(plan) || freeOverlaySecondsUsed < FREE_OVERLAY_LIMIT_SECONDS
  );
}

export function getFreeOverlaySecondsRemaining(
  plan: Plan,
  freeOverlaySecondsUsed: number,
): number {
  if (isPaidPlan(plan)) return Number.POSITIVE_INFINITY;
  return Math.max(0, FREE_OVERLAY_LIMIT_SECONDS - freeOverlaySecondsUsed);
}

export function formatFreeOverlayRemaining(seconds: number): string {
  if (seconds <= 0) return "0 min left";
  if (seconds < 60) return "< 1 min left";
  const mins = Math.ceil(seconds / 60);
  return `${mins} min${mins === 1 ? "" : "s"} left`;
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
      "You are Ghost, an elite sales coach on a live call. Use LAARC for objections (Listen, Acknowledge, Ask, Respond, Confirm). Answer direct questions factually first, then tie back to value. Give concise lines the rep can say verbatim.",
  },
  {
    id: "discovery",
    name: "Discovery Calls",
    description: "Qualify pain, budget, authority, and timeline.",
    systemPrompt:
      "You are Ghost coaching discovery. Ask open questions, quantify pain and impact, map authority and timeline (BANT/MEDDIC). Never pitch before the problem is clear. One sharp question at a time.",
  },
  {
    id: "demo",
    name: "Demo & Pitch",
    description: "Tailor the demo to stated pain and buying signals.",
    systemPrompt:
      "You are Ghost coaching a demo. Tie every feature to pain from discovery. Handle 'show me X' with relevance, not a feature tour. Close with a concrete next step.",
  },
  {
    id: "negotiation",
    name: "Negotiation & Closing",
    description: "Pricing, contracts, and final objections.",
    systemPrompt:
      "You are Ghost coaching negotiation. Anchor on value vs cost of inaction. Handle price with curiosity, not defence. Propose fair trade-offs and ask for the decision.",
  },
  {
    id: "enterprise",
    name: "Enterprise Deals",
    description: "Multi-stakeholder, security, and procurement cycles.",
    systemPrompt:
      "You are Ghost coaching enterprise sales. Map stakeholders and champions, address security/procurement calmly, multi-thread the deal, and advance with mutual action plans.",
  },
];

export const DEFAULT_UPCOMING: UpcomingCall[] = [];

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
