import {
  DEFAULT_OBJECTIONS,
  DEFAULT_PRODUCT,
  suggestSystemPrompt,
} from "../lib/prompts";

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
}

function formatRecentTranscript(transcript: SuggestTranscriptLine[], limit = 6): string {
  return transcript
    .slice(-limit)
    .map((t) => `${t.speaker}: ${t.text}`)
    .join("\n");
}

function computeTalkRatio(transcript: SuggestTranscriptLine[]): number {
  const you = transcript.filter((t) => t.speaker === "You").length;
  const total = transcript.length || 1;
  return Math.round((you / total) * 100);
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

function buildSystemPrompt(
  product: string,
  objections: string,
  coachingContext?: string,
): string {
  const base = suggestSystemPrompt(product, objections);
  if (!coachingContext?.trim()) return base;
  return `${base}\n\nCoaching style for this call:\n${coachingContext.trim()}`;
}

export async function getGhostSuggestion(
  prospectText: string,
  transcript: SuggestTranscriptLine[],
  options: {
    product?: string;
    objections?: string;
    coachingContext?: string;
    signal?: AbortSignal;
  } = {},
): Promise<GhostSuggestion | null> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY?.trim();
  if (!apiKey) {
    console.error("[ghost] VITE_OPENAI_API_KEY is missing — cannot fetch suggestions.");
    return null;
  }

  const product = options.product ?? DEFAULT_PRODUCT;
  const objections = options.objections ?? DEFAULT_OBJECTIONS;
  const recentTranscript = formatRecentTranscript(transcript);

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      signal: options.signal,
      body: JSON.stringify({
        model: "gpt-4o-mini",
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
            content: `Recent conversation:\n${recentTranscript}\n\nProspect just said: "${prospectText}"\n\nWhat should the rep say?`,
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
