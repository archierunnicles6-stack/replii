import { NextResponse } from "next/server";
import {
  DEFAULT_OBJECTIONS,
  DEFAULT_PRODUCT,
  suggestSystemPrompt,
} from "@/lib/prompts";
import { getOpenAIClient } from "@/lib/openai";
import {
  OPENAI_LIMITS,
  OPENAI_MODELS,
  formatRecentTranscript,
} from "@/lib/openai-config";
import type { RepliiSuggestion, TranscriptLine } from "@/types/replii";

function computeTalkRatio(transcript: TranscriptLine[]): number {
  const you = transcript.filter((t) => t.speaker === "You").length;
  const total = transcript.length || 1;
  return Math.round((you / total) * 100);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      prospectText?: string;
      transcript?: TranscriptLine[];
      product?: string;
      objections?: string;
      coachingContext?: string;
    };

    const prospectText = body.prospectText?.trim();
    if (!prospectText) {
      return NextResponse.json({ error: "prospectText is required" }, { status: 400 });
    }

    const transcript = body.transcript ?? [];
    const product = body.product ?? DEFAULT_PRODUCT;
    const objections = body.objections ?? DEFAULT_OBJECTIONS;
    const recentTranscript = formatRecentTranscript(transcript);

    let systemPrompt = suggestSystemPrompt(product, objections);
    if (body.coachingContext?.trim()) {
      systemPrompt += `\n\nCoaching style for this call:\n${body.coachingContext.trim()}`;
    }

    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: OPENAI_MODELS.chat,
      max_tokens: OPENAI_LIMITS.suggestMaxTokens,
      temperature: 0.4,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Recent conversation:\n${recentTranscript}\n\nProspect just said: "${prospectText}"\n\nWhat should the rep say?`,
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content?.trim();
    if (!raw) {
      return NextResponse.json({ error: "Empty model response" }, { status: 502 });
    }

    const parsed = JSON.parse(raw) as Partial<RepliiSuggestion>;
    if (!parsed.suggestion?.trim()) {
      return NextResponse.json({ error: "Invalid suggestion payload" }, { status: 502 });
    }

    const result: RepliiSuggestion = {
      suggestion: parsed.suggestion.trim(),
      health: Math.max(0, Math.min(100, parsed.health ?? 50)),
      talkRatio: Math.max(0, Math.min(100, parsed.talkRatio ?? computeTalkRatio(transcript))),
      missing: {
        budget: parsed.missing?.budget ?? false,
        decisionMaker: parsed.missing?.decisionMaker ?? false,
        timeline: parsed.missing?.timeline ?? false,
        nextStep: parsed.missing?.nextStep ?? false,
      },
    };

    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Suggest failed";
    const status = message.includes("OPENAI_API_KEY") ? 503 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
