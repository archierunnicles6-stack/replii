export type Speaker = "You" | "Prospect" | "Other";

export interface TranscriptLine {
  id: string;
  speaker: Speaker;
  text: string;
  timestamp: number;
}

export interface RepliiSuggestion {
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

export interface FollowUpResponse {
  questions: string[];
}

export interface RecapResponse {
  bullets: string[];
  email: string;
  score: number;
}
