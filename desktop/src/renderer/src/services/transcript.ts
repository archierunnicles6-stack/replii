import type { TranscriptLine } from "./ai";

const LANGUAGE_MAP: Record<string, string> = {
  English: "en-US",
  Spanish: "es-ES",
  French: "fr-FR",
  German: "de-DE",
  Portuguese: "pt-BR",
  Chinese: "zh-CN",
  Japanese: "ja-JP",
};

export function speechLangFromSetting(meetingLanguage: string): string {
  return LANGUAGE_MAP[meetingLanguage] ?? "en-US";
}

export function normalizeTranscriptText(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

const OBJECTION_PATTERN =
  /\b(price|pricing|cost|budget|expensive|too much|concern|worried|not sure|already have|competitor|contract|security|compliance)\b/i;

/** Detect direct questions — including mid-sentence and common call phrases. */
export function isDirectQuestion(text: string): boolean {
  const t = normalizeTranscriptText(text).toLowerCase();
  if (!t || t.length < 4) return false;
  if (/\?\s*$/.test(t)) return true;
  if (
    /^(what|how|why|when|where|who|which|can|could|would|will|should|is|are|am|was|were|do|does|did|have|has)\b/.test(
      t,
    )
  ) {
    return true;
  }
  if (
    /\b(can you|could you|would you|will you|do you|does it|are you|is it|hear me|you there|anyone there|still there)\b/.test(
      t,
    )
  ) {
    return true;
  }
  return false;
}

/** Heuristic for mic-only capture when speakers aren't separated. */
export function isLikelyProspectUtterance(text: string): boolean {
  const trimmed = normalizeTranscriptText(text);
  if (trimmed.length < 8) return false;
  if (isDirectQuestion(trimmed)) return true;
  if (OBJECTION_PATTERN.test(trimmed)) return true;
  return /\b(we're|we are|our team|our budget|already using|competitor|gong|salesforce|hubspot|think about|send over|not ready|next quarter)\b/i.test(
    trimmed,
  );
}

export function pickAutoAction(text: string): import("./ai").QuickAction | null {
  const trimmed = normalizeTranscriptText(text);
  if (!trimmed) return null;
  if (OBJECTION_PATTERN.test(trimmed)) return "objection";
  if (isDirectQuestion(trimmed)) return "say";
  if (trimmed.length >= 12) return "assist";
  return null;
}

export function buildLiveDisplayText(
  lines: TranscriptLine[],
  interim?: string,
  maxChars = 96,
): string {
  const interimTrimmed = normalizeTranscriptText(interim ?? "");
  if (interimTrimmed) return interimTrimmed;

  const last = lines[lines.length - 1];
  if (last) return normalizeTranscriptText(last.text).slice(-maxChars);

  return "";
}

export function autoTriggerDelayMs(text: string, isInterim: boolean): number | null {
  const action = pickAutoAction(text);
  if (!action) return null;
  if (isDirectQuestion(text)) return isInterim ? 100 : 40;
  if (action === "objection") return isInterim ? 180 : 80;
  return isInterim ? 250 : 280;
}

/** Include in-progress speech so OpenAI can respond before final recognition. */
export function buildLiveTranscript(
  lines: TranscriptLine[],
  interim?: string,
): TranscriptLine[] {
  const trimmedInterim = normalizeTranscriptText(interim ?? "");
  if (!trimmedInterim) return lines;

  const last = lines[lines.length - 1];
  if (last && normalizeTranscriptText(last.text).toLowerCase() === trimmedInterim.toLowerCase()) {
    return lines;
  }

  return [
    ...lines,
    {
      id: "interim-live",
      speaker: "Prospect",
      text: trimmedInterim,
      timestamp: last?.timestamp ?? 0,
    },
  ];
}
