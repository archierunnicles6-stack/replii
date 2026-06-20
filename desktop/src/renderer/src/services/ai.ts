import { OPENAI_LIMITS, OPENAI_MODELS, truncateTranscriptForPrompt } from "../lib/openai-config";
import { isDirectQuestion } from "./transcript";
import { formatScreenContextBlock, getScreenContext } from "./screen-context";
import { getRepliiSuggestion } from "./replii-suggest";
import { getOpenAIKey } from "./whisper";

export type QuickAction =
  | "say"
  | "followup"
  | "objection"
  | "who"
  | "recap"
  | "custom"
  | "assist";

export interface TranscriptLine {
  id: string;
  speaker: "You" | "Prospect" | "Other";
  text: string;
  timestamp: number;
}

export interface AssistResult {
  id: string;
  action: QuickAction;
  prompt: string;
  response: string;
  timestamp: number;
}

const MOCK: Record<Exclude<QuickAction, "custom" | "assist">, string[]> = {
  say: [
    "What would need to be true for you to move forward this quarter?",
    "If budget weren't a factor, would this solve the problem you described?",
    "Walk me through how you're evaluating solutions like ours today.",
  ],
  followup: [
    "What's the cost of not solving this in the next 90 days?\n\nWho else needs to weigh in before you can make a decision?",
  ],
  objection: [
    "I hear you on price — let's map ROI first. What would 10% higher win rate be worth to your team?",
  ],
  who: [
    "Likely decision maker based on talk track. Ask about budget authority and who signs off.",
  ],
  recap: [
    "Key points discussed. Open questions remain. Suggested next step: send follow-up summary and schedule next call.",
  ],
};

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)] ?? arr[0];
}

interface AskOptions {
  customPrompt?: string;
  systemPrompt?: string;
  smartMode?: boolean;
  interimText?: string;
  outputLanguage?: string;
  onChunk?: (text: string) => void;
  signal?: AbortSignal;
}

function buildPrompt(
  action: QuickAction,
  transcript: TranscriptLine[],
  options: AskOptions,
  screenContent?: string,
): string {
  const liveTranscript = options.interimText?.trim()
    ? [
        ...transcript,
        {
          id: "interim-live",
          speaker: "Prospect" as const,
          text: options.interimText.trim(),
          timestamp: transcript[transcript.length - 1]?.timestamp ?? 0,
        },
      ]
    : transcript;

  const recent = liveTranscript
    .slice(-OPENAI_LIMITS.transcriptLinesForAssist)
    .map((l) => {
      const tag = l.id === "interim-live" ? " (speaking now)" : "";
      return `${l.speaker}: ${l.text}${tag}`;
    })
    .join("\n");

  const prompts: Record<QuickAction, string> = {
    assist:
      "Based on the conversation so far, give the user immediate, actionable help. Be concise — under 3 short sentences they can use right now.",
    say: "Suggest ONE natural thing the user should say next. Conversational, under 2 sentences.",
    followup: "Suggest 2-3 sharp follow-up questions based on the conversation.",
    objection:
      "The other person raised a concern. Suggest how to handle it with empathy. Give exact words to say.",
    who: "Based on the conversation, infer who they're talking to and what to ask next.",
    recap: "Summarize the conversation: key points, decisions, open questions, and recommended next steps.",
    custom: options.customPrompt ?? "Answer based on the conversation.",
  };

  const smartHint = options.smartMode
    ? "\nSmart mode ON — the rep is on a live sales call. Give exact words they can say next. No preamble, no bullet lists. Under 3 sentences."
    : "";

  const liveQuestion =
    options.interimText?.trim() && isDirectQuestion(options.interimText);
  const questionHint = liveQuestion
    ? "\nURGENT — they just asked a direct question (possibly still speaking). Give the exact words to answer it immediately. One short sentence they can say verbatim."
    : action === "say" && transcript.length > 0 && isDirectQuestion(transcript[transcript.length - 1]?.text ?? "")
      ? "\nThey asked a direct question. Give the exact answer the user should say right now. One short sentence."
      : "";

  const langHint = options.outputLanguage && options.outputLanguage !== "English"
    ? `\nRespond in ${options.outputLanguage}.`
    : "";

  const screenBlock = screenContent?.trim()
    ? `\n\n${formatScreenContextBlock(screenContent)}`
    : "";

  return `${prompts[action]}${smartHint}${questionHint}${langHint}\n\nTranscript:\n${recent || "(Conversation just started — give proactive help.)"}${screenBlock}`;
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

export async function askReplii(
  action: QuickAction,
  transcript: TranscriptLine[],
  options: AskOptions = {},
): Promise<string> {
  const apiKey = await getOpenAIKey();
  const system =
    options.systemPrompt ??
    "You are Replii, a fast AI meeting assistant. Be extremely concise. Give words the user can say or do immediately. No preamble.";

  if (apiKey) {
    try {
      const needsScreen =
        action === "assist" || action === "custom" || action === "recap";
      const screenContent = needsScreen ? await getScreenContext() : "";
      const maxTokens =
        action === "assist" || action === "say"
          ? OPENAI_LIMITS.assistMaxTokens
          : OPENAI_LIMITS.assistRecapMaxTokens;
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        signal: options.signal,
        body: JSON.stringify({
          model: OPENAI_MODELS.chat,
          messages: [
            { role: "system", content: system },
            {
              role: "user",
              content: buildPrompt(action, transcript, options, screenContent),
            },
          ],
          max_tokens: maxTokens,
          temperature: 0.35,
          stream: !!options.onChunk,
        }),
      });

      if (!res.ok) {
        console.warn("[replii] OpenAI request failed:", res.status, await res.text().catch(() => ""));
      } else if (options.onChunk && res.body) {
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
              options.onChunk(full);
            }
          }
        }
        if (full.trim()) return full.trim();
      } else if (res.ok) {
        const data = await res.json();
        const text = data.choices?.[0]?.message?.content?.trim();
        if (text) return text;
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        throw err;
      }
      console.warn("[replii] OpenAI request error:", err);
    }
  } else {
    console.error("[replii] VITE_OPENAI_API_KEY is missing.");
    return "Add VITE_OPENAI_API_KEY to desktop/.env and restart the app.";
  }

  if (action === "custom" && options.customPrompt) {
    return `Re: "${options.customPrompt}" — clarify their goals, summarize what you've heard, and suggest a concrete next step.`;
  }

  return "Replii couldn't reach OpenAI. Check your API key and try again.";
}

export interface SummarySection {
  heading: string;
  items: string[];
  format?: "paragraphs" | "bullets";
}

export interface MeetingSummaryResult {
  title: string;
  company: string;
  sections: SummarySection[];
  nextSteps: string[];
  objections?: string[];
  dealScore?: number;
}

export const EMPTY_SESSION_PLACEHOLDER: MeetingSummaryResult = {
  title: "Live session",
  company: "Meeting",
  sections: [
    {
      heading: "Summary",
      format: "paragraphs",
      items: [
        "No transcript was captured for this session, so Replii could not generate a summary. Start a new session with your microphone enabled to record the conversation.",
      ],
    },
  ],
  nextSteps: [],
  objections: [],
  dealScore: 0,
};

function mockMeetingSummary(transcript: TranscriptLine[]): MeetingSummaryResult {
  if (transcript.length === 0) {
    return EMPTY_SESSION_PLACEHOLDER;
  }

  const highlights = transcript
    .slice(0, 8)
    .map((l) => `${l.speaker}: ${l.text}`);

  const actionItems =
    transcript.length >= 3
      ? [
          "Review key points discussed and confirm next steps with the prospect",
          "Send a follow-up summary email within 24 hours",
          "Schedule the next meeting while momentum is high",
        ]
      : ["Review the transcript and follow up on open items"];

  return {
    title: "Live session",
    company: "Meeting",
    sections: [
      { heading: "Action Items", items: actionItems },
      { heading: "Discussion Highlights", items: highlights },
    ],
    nextSteps: actionItems.slice(0, 2),
  };
}

export async function generateMeetingSummary(
  transcript: TranscriptLine[],
  systemPrompt?: string,
  outputLanguage?: string,
): Promise<MeetingSummaryResult> {
  const apiKey = await getOpenAIKey();
  const fullTranscript = truncateTranscriptForPrompt(transcript);

  if (!apiKey || transcript.length === 0) {
    if (!apiKey) {
      console.error("[replii] OpenAI API key is missing — cannot generate summary.");
    }
    return mockMeetingSummary(transcript);
  }

  const system =
    systemPrompt ??
    "You are Replii, an AI meeting assistant. Produce clean, structured post-meeting summaries.";

  const userPrompt = `Analyze this meeting transcript and return a structured summary.

Return ONLY valid JSON with this exact shape:
{
  "title": "Short descriptive meeting title inferred from the conversation",
  "company": "Company or account name if mentioned, otherwise 'Meeting'",
  "sections": [
    { "heading": "Action Items", "items": ["specific action 1", "specific action 2"] },
    { "heading": "Key Discussion Points", "items": ["point 1", "point 2"] }
  ],
  "nextSteps": ["next step 1", "next step 2"],
  "objections": ["any objections or concerns raised by the prospect"],
  "dealScore": 75
}

Rules:
- Use 2-4 sections with clear headings (Action Items, Key Decisions, Discussion Highlights, Objections Handled, etc.)
- Each section has 2-6 concise bullet items
- Bold important terms using **markdown** within item strings when helpful
- Be specific to what was actually discussed — no generic filler
- nextSteps should be the most important follow-ups (2-4 items)
- objections: list specific concerns the prospect raised (empty array if none)
- dealScore: 0-100 estimate of deal health based on the conversation
${outputLanguage && outputLanguage !== "English" ? `- Write all text in ${outputLanguage}` : ""}

Transcript:
${fullTranscript || "(empty)"}`;

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: OPENAI_MODELS.chat,
        messages: [
          { role: "system", content: system },
          { role: "user", content: userPrompt },
        ],
        max_tokens: OPENAI_LIMITS.summaryMaxTokens,
        temperature: 0.35,
        response_format: { type: "json_object" },
      }),
    });

    if (res.ok) {
      const data = await res.json();
      const raw = data.choices?.[0]?.message?.content?.trim();
      if (raw) {
        const parsed = JSON.parse(raw) as MeetingSummaryResult;
        if (parsed.sections?.length) {
          return {
            title: parsed.title || "Live session",
            company: parsed.company || "Meeting",
            sections: parsed.sections,
            nextSteps: parsed.nextSteps ?? [],
            objections: parsed.objections ?? [],
            dealScore: parsed.dealScore ?? 0,
          };
        }
      }
    }
  } catch (err) {
    console.error("[replii] Meeting summary API error:", err);
  }

  return {
    title: "Live session",
    company: "Meeting",
    sections: [
      {
        heading: "Summary unavailable",
        items: ["Replii couldn't generate a summary. Check your OpenAI API key and try again."],
      },
    ],
    nextSteps: [],
  };
}

function sectionsToPlainText(sections: SummarySection[]): string {
  return sections
    .map((s) => {
      const body =
        s.format === "paragraphs"
          ? s.items.join("\n\n")
          : s.items.map((i) => `• ${i}`).join("\n");
      return `${s.heading}\n${body}`;
    })
    .join("\n\n");
}

export { sectionsToPlainText };

export interface TestSuggestionResult {
  suggestion: string;
  dealHealth: number;
}

export const TEST_PROSPECT_LINES = [
  "We're already using Salesforce for this",
  "It's quite expensive honestly",
  "I need to check with my team first",
  "What makes you different from Gong?",
  "We don't really have budget right now",
];

export async function testRepliiSuggestion(
  prospectText: string,
  options: { coachingContext?: string; product?: string } = {},
): Promise<TestSuggestionResult | null> {
  const result = await getRepliiSuggestion(prospectText, [], {
    coachingContext: options.coachingContext,
    product: options.product,
  });

  if (!result) return null;

  return {
    suggestion: result.suggestion,
    dealHealth: result.health,
  };
}
