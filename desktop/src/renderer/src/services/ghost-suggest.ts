import {
  DEFAULT_OBJECTIONS,
  DEFAULT_PRODUCT,
  suggestSystemPrompt,
} from "../lib/prompts";
import {
  formatScreenContextBlock,
  getScreenContext,
} from "./screen-context";
import { getOpenAIKey } from "./whisper";
import { isDirectQuestion } from "./transcript";

export interface GhostSuggestion {
  suggestion: string;
  health: number;
  talkRatio: number;
  missing: {
    budget: boolean;
    decisionMaker: boolean;
    timeline: boolean;
    nextStep: boolean;
  };
}

interface SuggestTranscriptLine {
  speaker: "You" | "Prospect" | "Other";
  text: string;
  timestamp?: number;
}

const TRANSCRIPT_WINDOW_SEC = 120;

function formatRecentTranscript(
  transcript: SuggestTranscriptLine[],
  limit = 6,
): string {
  return transcript
    .slice(-limit)
    .map((t) => `${t.speaker}: ${t.text}`)
    .join("\n");
}

function formatTranscriptWindow(
  transcript: SuggestTranscriptLine[],
  windowSec = TRANSCRIPT_WINDOW_SEC,
): string {
  if (!transcript.length) return "(Conversation just started)";

  const latestTs =
    transcript[transcript.length - 1]?.timestamp ??
    transcript.length;
  const cutoff = typeof latestTs === "number" && latestTs > 1000
    ? latestTs - windowSec
    : -Infinity;

  const windowed = transcript.filter((line) => {
    if (line.timestamp == null) return true;
    if (line.timestamp <= 10000) return line.timestamp >= latestTs - windowSec;
    return line.timestamp >= cutoff;
  });

  const lines = windowed.length ? windowed : transcript.slice(-20);
  return lines.map((t) => `${t.speaker}: ${t.text}`).join("\n");
}

function computeTalkRatio(transcript: SuggestTranscriptLine[]): number {
  const you = transcript.filter((t) => t.speaker === "You").length;
  const total = transcript.length || 1;
  return Math.round((you / total) * 100);
}

function estimateDealHealth(transcript: SuggestTranscriptLine[]): number {
  const you = transcript.filter((t) => t.speaker === "You").length;
  const prospect = transcript.filter((t) => t.speaker === "Prospect").length;
  const total = you + prospect || 1;
  const youRatio = you / total;
  const balance = 1 - Math.abs(youRatio - 0.45) * 2;
  return Math.round(Math.max(35, Math.min(92, 50 + balance * 40)));
}

function parseSuggestionJson(raw: string): GhostSuggestion | null {
  try {
    const clean = raw.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean) as Partial<GhostSuggestion>;
    if (!parsed.suggestion?.trim()) return null;
    return {
      suggestion: parsed.suggestion.trim(),
      health: Math.max(0, Math.min(100, parsed.health ?? 50)),
      talkRatio: Math.max(0, Math.min(100, parsed.talkRatio ?? 50)),
      missing: {
        budget: parsed.missing?.budget ?? false,
        decisionMaker: parsed.missing?.decisionMaker ?? false,
        timeline: parsed.missing?.timeline ?? false,
        nextStep: parsed.missing?.nextStep ?? false,
      },
    };
  } catch {
    return null;
  }
}

function parseStreamChunk(line: string): string | null {
  const trimmed = line.trim();
  if (!trimmed.startsWith("data: ")) return null;
  const payload = trimmed.slice(6);
  if (payload === "[DONE]") return null;
  try {
    const json = JSON.parse(payload) as {
      choices?: Array<{ delta?: { content?: string } }>;
    };
    return json.choices?.[0]?.delta?.content ?? null;
  } catch {
    return null;
  }
}

function buildSystemPrompt(
  product: string,
  objections: string,
  coachingContext?: string,
): string {
  const base = suggestSystemPrompt(product, objections);
  if (!coachingContext?.trim()) return base;
  return `${base}\n\nCoaching style for this call:\n${coachingContext.trim()}`;
}

function buildPipelineUserPrompt(
  prospectText: string,
  transcript: SuggestTranscriptLine[],
  screenContent: string,
  micOnly = false,
): string {
  const transcriptBlock = formatTranscriptWindow(transcript);
  const screenBlock = formatScreenContextBlock(screenContent);
  const speakerLabel = micOnly ? "Speaker just said" : "Prospect just said";

  return `TRANSCRIPT (last 2 minutes):
${transcriptBlock}

${screenBlock}

${speakerLabel}: "${prospectText}"

TASK: Suggest what the user should say next. Under 20 words. Give exact words they can say verbatim. No preamble.`;
}

export async function getGhostSuggestion(
  prospectText: string,
  transcript: SuggestTranscriptLine[],
  options: {
    product?: string;
    objections?: string;
    coachingContext?: string;
    screenContent?: string;
    micOnly?: boolean;
    signal?: AbortSignal;
  } = {},
): Promise<GhostSuggestion | null> {
  const apiKey = await getOpenAIKey();
  if (!apiKey) {
    console.error("[ghost] OpenAI API key is missing — cannot fetch suggestions.");
    return null;
  }

  const product = options.product ?? DEFAULT_PRODUCT;
  const objections = options.objections ?? DEFAULT_OBJECTIONS;
  const screenContent =
    options.screenContent ?? (await getScreenContext());

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      signal: options.signal,
      body: JSON.stringify({
        model: "gpt-4o",
        max_tokens: 200,
        temperature: 0.4,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: buildSystemPrompt(product, objections, options.coachingContext),
          },
          {
            role: "user",
            content: buildPipelineUserPrompt(
              prospectText,
              transcript,
              screenContent,
              options.micOnly,
            ),
          },
        ],
      }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error("[ghost] Suggest API failed:", res.status, detail);
      return null;
    }

    const data = await res.json();
    const raw = data.choices?.[0]?.message?.content?.trim();
    if (!raw) {
      console.error("[ghost] Suggest API returned empty content.");
      return null;
    }

    const parsed = parseSuggestionJson(raw);
    if (!parsed) {
      console.error("[ghost] Suggest API returned invalid JSON:", raw);
      return null;
    }

    if (!parsed.talkRatio) {
      parsed.talkRatio = computeTalkRatio(transcript);
    }

    return parsed;
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") throw err;
    console.error("[ghost] Suggest API error:", err);
    return null;
  }
}

/** Streaming GPT-4o suggestion for live overlay display. */
export async function streamGhostSuggestion(
  prospectText: string,
  transcript: SuggestTranscriptLine[],
  options: {
    product?: string;
    objections?: string;
    coachingContext?: string;
    screenContent?: string;
    onChunk?: (text: string) => void;
    micOnly?: boolean;
    fast?: boolean;
    isQuestion?: boolean;
    signal?: AbortSignal;
  } = {},
): Promise<GhostSuggestion | null> {
  const apiKey = await getOpenAIKey();
  if (!apiKey) {
    console.error("[ghost] OpenAI API key is missing — cannot fetch suggestions.");
    return null;
  }

  const product = options.product ?? DEFAULT_PRODUCT;
  const objections = options.objections ?? DEFAULT_OBJECTIONS;
  const fast = options.fast ?? false;
  const isQuestion = options.isQuestion ?? isDirectQuestion(prospectText);
  const screenContent = fast
    ? ""
    : (options.screenContent ?? (await getScreenContext()));

  const system = isQuestion
    ? `Live sales call copilot. Product: ${product}. The prospect asked a direct question. Reply with ONLY the exact words the rep should say to answer it — under 18 words. No quotes, labels, or preamble.`
    : fast
      ? `Live sales call copilot. Product: ${product}. Reply with ONLY the exact words the rep should say next (under 18 words). No quotes, labels, or preamble.`
      : `You are a real-time meeting copilot embedded in an invisible overlay.
The rep sells: ${product}
Known objections: ${objections}
${options.coachingContext?.trim() ? `\nCoaching style:\n${options.coachingContext.trim()}` : ""}

Give ONE thing to say right now — under 20 words, exact words they can say verbatim.
No preamble, no bullet lists, no JSON.`;

  const userContent = isQuestion
    ? `QUESTION: "${prospectText}"\n\nGive the exact answer the rep should say right now. One short sentence they can read verbatim.`
    : fast
      ? `They just said: "${prospectText}"\n\nWhat should the rep say next?`
      : buildPipelineUserPrompt(prospectText, transcript, screenContent, options.micOnly);

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      signal: options.signal,
      body: JSON.stringify({
        model: fast ? "gpt-4o-mini" : "gpt-4o",
        max_tokens: fast ? 64 : 120,
        temperature: fast ? 0.25 : 0.35,
        stream: true,
        messages: [
          { role: "system", content: system },
          { role: "user", content: userContent },
        ],
      }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error("[ghost] Stream suggest failed:", res.status, detail);
      return null;
    }

    if (!res.body) return null;

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let full = "";
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        const chunk = parseStreamChunk(line);
        if (chunk) {
          full += chunk;
          options.onChunk?.(full.trim());
        }
      }
    }

    const suggestion = full.trim();
    if (!suggestion) return null;

    return {
      suggestion,
      health: estimateDealHealth(transcript),
      talkRatio: computeTalkRatio(transcript),
      missing: {
        budget: false,
        decisionMaker: false,
        timeline: false,
        nextStep: false,
      },
    };
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") throw err;
    console.error("[ghost] Stream suggest error:", err);
    return null;
  }
}

export { formatRecentTranscript, formatTranscriptWindow, computeTalkRatio };
