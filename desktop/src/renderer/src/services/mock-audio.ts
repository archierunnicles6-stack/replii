import type { TranscriptLine } from "./ai";

/** Kept for dev test script — not used at runtime. */
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

export function isMockAudioEnabled(): boolean {
  return false;
}

export function shouldUseMockAudio(_mode: string): boolean {
  return false;
}
