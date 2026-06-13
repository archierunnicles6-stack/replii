import type { TranscriptLine } from "./ai";

export const MOCK_CONVERSATION: Array<{
  speaker: TranscriptLine["speaker"];
  text: string;
}> = [
  { speaker: "Prospect", text: "We're already using Salesforce for this." },
  { speaker: "You", text: "Thanks for joining — walk me through how you're handling sales calls today." },
  { speaker: "Prospect", text: "It's quite expensive honestly." },
  { speaker: "You", text: "What would need to change for you to consider switching?" },
  { speaker: "Prospect", text: "I need to check with my team first." },
  { speaker: "Prospect", text: "What makes you different from Gong?" },
  { speaker: "You", text: "We give reps live suggestions during the call, not just post-call analytics." },
  { speaker: "Prospect", text: "We don't really have budget right now." },
];

const FIRST_LINE_MS = 3000;
const LINE_INTERVAL_MS = 12000;
const WORD_MS = 140;

export function isMockAudioEnabled(): boolean {
  return import.meta.env.VITE_USE_MOCK_AUDIO !== "false";
}

export function shouldUseMockAudio(mode: string): boolean {
  if (mode === "mock") return true;
  if (mode === "mic" || mode === "system") return false;
  return import.meta.env.DEV && import.meta.env.VITE_USE_MOCK_AUDIO === "true";
}

function streamWords(
  text: string,
  onWord: (partial: string) => void,
  onDone: () => void,
): () => void {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length === 0) {
    onDone();
    return () => {};
  }

  let index = 0;
  onWord(words[0] ?? "");

  const id = window.setInterval(() => {
    index += 1;
    if (index >= words.length) {
      window.clearInterval(id);
      onDone();
      return;
    }
    onWord(words.slice(0, index + 1).join(" "));
  }, WORD_MS);

  return () => window.clearInterval(id);
}

export function startMockConversation(options: {
  sessionStart: number;
  onInterim: (text: string) => void;
  onLine: (line: TranscriptLine) => void;
}): () => void {
  let index = 0;
  let lineTimer: number | null = null;
  let wordStop: (() => void) | null = null;
  let stopped = false;

  const scheduleNext = () => {
    if (stopped || index >= MOCK_CONVERSATION.length) return;

    const entry = MOCK_CONVERSATION[index];
    if (!entry) return;

    wordStop?.();
    wordStop = streamWords(
      entry.text,
      options.onInterim,
      () => {
        if (stopped) return;
        options.onLine({
          id: `mock-${Date.now()}-${index}`,
          speaker: entry.speaker,
          text: entry.text,
          timestamp: Math.floor((Date.now() - options.sessionStart) / 1000),
        });
        options.onInterim("");
        index += 1;
        lineTimer = window.setTimeout(scheduleNext, LINE_INTERVAL_MS);
      },
    );
  };

  lineTimer = window.setTimeout(scheduleNext, FIRST_LINE_MS);

  return () => {
    stopped = true;
    wordStop?.();
    if (lineTimer) window.clearTimeout(lineTimer);
  };
}
