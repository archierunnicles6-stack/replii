import { NextResponse } from "next/server";
import { DEFAULT_PRODUCT, followUpSystemPrompt } from "@/lib/prompts";
import { getOpenAIClient } from "@/lib/openai";
import type { TranscriptLine } from "@/types/ghost";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      transcript?: TranscriptLine[];
      product?: string;
    };

    const transcript = body.transcript ?? [];
    const product = body.product ?? DEFAULT_PRODUCT;
    const formatted = transcript.map((t) => `${t.speaker}: ${t.text}`).join("\n");

    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 200,
      temperature: 0.5,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: followUpSystemPrompt(product) },
        {
          role: "user",
          content: `Conversation so far:\n${formatted || "(empty)"}\n\nReturn JSON: { "questions": ["q1", "q2", "q3"] }`,
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content?.trim();
    if (!raw) {
      return NextResponse.json({ error: "Empty model response" }, { status: 502 });
    }

    const parsed = JSON.parse(raw) as { questions?: string[] };
    const questions = (parsed.questions ?? []).filter(Boolean).slice(0, 3);

    return NextResponse.json({ questions });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Follow-ups failed";
    const status = message.includes("OPENAI_API_KEY") ? 503 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
