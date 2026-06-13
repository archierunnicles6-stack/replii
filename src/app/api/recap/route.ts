import { NextResponse } from "next/server";
import { recapSystemPrompt } from "@/lib/prompts";
import { getOpenAIClient } from "@/lib/openai";
import type { TranscriptLine } from "@/types/ghost";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { transcript?: TranscriptLine[] };
    const transcript = body.transcript ?? [];
    const formatted = transcript.map((t) => `${t.speaker}: ${t.text}`).join("\n");

    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 400,
      temperature: 0.4,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: recapSystemPrompt() },
        {
          role: "user",
          content: `Full call transcript:\n${formatted || "(empty)"}`,
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content?.trim();
    if (!raw) {
      return NextResponse.json({ error: "Empty model response" }, { status: 502 });
    }

    const parsed = JSON.parse(raw) as {
      bullets?: string[];
      email?: string;
      score?: number;
    };

    return NextResponse.json({
      bullets: (parsed.bullets ?? []).slice(0, 3),
      email: parsed.email ?? "",
      score: Math.max(0, Math.min(100, parsed.score ?? 0)),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Recap failed";
    const status = message.includes("OPENAI_API_KEY") ? 503 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
