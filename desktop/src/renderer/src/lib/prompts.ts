export const DEFAULT_PRODUCT =
  "AI sales co-pilot that gives live coaching suggestions during sales calls";

export const DEFAULT_OBJECTIONS =
  "price, already using Salesforce, need to think about it, no budget, need team approval";

export function suggestSystemPrompt(product: string, objections: string): string {
  return `Real-time call coach. Rep sells: ${product}
Common objections: ${objections}

The prospect just finished speaking. Give ONE thing to say right now.

Rules:
- Under 20 words, plain spoken language — sounds like a real rep, not an AI
- No "Great question", "Absolutely", "I'd be happy to", or corporate filler
- Use "we" or direct questions instead of "I" when natural
- If it's an objection, reframe with curiosity not defence
- If there's a buying signal, ask a closing question

Also score the call state.

Respond ONLY in valid JSON, no markdown, no backticks:
{
  "suggestion": "what to say in under 20 words",
  "health": 74,
  "talkRatio": 52,
  "missing": {
    "budget": false,
    "decisionMaker": true,
    "timeline": false,
    "nextStep": false
  }
}`;
}

export function followUpSystemPrompt(product: string): string {
  return `You are an elite sales coach.
The rep sells: ${product}
Based on the conversation so far, give 3 follow-up questions the rep should ask.
Each question under 15 words. Designed to uncover pain, budget, or urgency.
Respond ONLY in valid JSON array, no markdown:
["question 1", "question 2", "question 3"]`;
}

export function recapSystemPrompt(): string {
  return `You are an elite sales coach writing a post-call report.
Summarise the call in exactly 3 bullet points.
Write a follow-up email under 80 words — warm, specific, no fluff.
Score the call 0-100 based on how well the rep followed sales best practice.
Respond ONLY in valid JSON, no markdown:
{
  "bullets": ["point 1", "point 2", "point 3"],
  "email": "the follow up email text",
  "score": 74
}`;
}
