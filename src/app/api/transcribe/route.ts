import { NextResponse } from "next/server";
import { getOpenAIClient } from "@/lib/openai";
import { OPENAI_MODELS } from "@/lib/openai-config";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const language = formData.get("language")?.toString();

    if (!(file instanceof Blob) || file.size < 80) {
      return NextResponse.json({ error: "Audio file too small" }, { status: 400 });
    }

    const openai = getOpenAIClient();
    const upload = new File([file], "audio.webm", { type: file.type || "audio/webm" });

    const transcription = await openai.audio.transcriptions.create({
      file: upload,
      model: OPENAI_MODELS.whisper,
      ...(language ? { language } : {}),
    });

    const text = transcription.text?.trim() ?? "";
    return NextResponse.json({ text });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Transcription failed";
    const status = message.includes("OPENAI_API_KEY") ? 503 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
