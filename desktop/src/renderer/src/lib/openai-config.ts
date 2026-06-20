/** Central OpenAI model + token limits — keep bills low without hurting live UX. */
export const OPENAI_MODELS = {
  chat: "gpt-4o-mini",
  vision: "gpt-4o-mini",
  whisper: "whisper-1",
} as const;

export const OPENAI_LIMITS = {
  suggestMaxTokens: 64,
  suggestStreamMaxTokens: 96,
  assistMaxTokens: 100,
  assistRecapMaxTokens: 160,
  summaryMaxTokens: 600,
  screenOcrMaxTokens: 250,
  screenOcrMaxChars: 1200,
  screenContextCacheMs: 120_000,
  transcriptLinesForAssist: 8,
  transcriptCharsForSummary: 24_000,
  liveCoachingKnowledgeChars: 4_000,
  /** Min gap between auto-suggestions (direct questions use questionCooldownMs). */
  suggestionCooldownMs: 5_000,
  questionSuggestionCooldownMs: 1_500,
} as const;

export function truncateTranscriptForPrompt(
  lines: Array<{ speaker: string; text: string }>,
  maxChars = OPENAI_LIMITS.transcriptCharsForSummary,
): string {
  if (lines.length === 0) return "(empty)";

  const formatted = lines.map((l) => `${l.speaker}: ${l.text}`);
  let total = 0;
  const kept: string[] = [];

  for (let i = formatted.length - 1; i >= 0; i--) {
    const line = formatted[i]!;
    if (total + line.length + 1 > maxChars && kept.length > 0) break;
    kept.unshift(line);
    total += line.length + 1;
  }

  return kept.join("\n");
}
