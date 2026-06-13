import { speechLangFromSetting } from "./transcript";

const MIN_BLOB_BYTES = 80;

const WHISPER_LANG_MAP: Record<string, string> = {
  "en-US": "en",
  "es-ES": "es",
  "fr-FR": "fr",
  "de-DE": "de",
  "pt-BR": "pt",
  "zh-CN": "zh",
  "ja-JP": "ja",
};

function extensionForMime(mimeType: string): string {
  if (mimeType.includes("ogg")) return "ogg";
  if (mimeType.includes("mp4") || mimeType.includes("m4a")) return "m4a";
  return "webm";
}

export function whisperLangFromSetting(meetingLanguage: string): string | undefined {
  const bcp47 = speechLangFromSetting(meetingLanguage);
  return WHISPER_LANG_MAP[bcp47];
}

export function getOpenAIKey(): string | undefined {
  const key = import.meta.env.VITE_OPENAI_API_KEY?.trim();
  return key || undefined;
}

export async function transcribeAudioChunk(
  blob: Blob,
  meetingLanguage: string,
  mimeType = "audio/webm",
): Promise<string | null> {
  const apiKey = getOpenAIKey();
  if (!apiKey || blob.size < MIN_BLOB_BYTES) return null;

  const ext = extensionForMime(mimeType);
  const formData = new FormData();
  formData.append("file", blob, `audio.${ext}`);
  formData.append("model", "whisper-1");
  formData.append("response_format", "json");

  const lang = whisperLangFromSetting(meetingLanguage);
  if (lang) formData.append("language", lang);

  try {
    const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: formData,
    });

    if (!res.ok) {
      console.warn("[ghost] Whisper failed:", res.status, await res.text().catch(() => ""));
      return null;
    }

    const data = (await res.json()) as { text?: string };
    const text = data.text?.trim();
    return text || null;
  } catch (err) {
    console.warn("[ghost] Whisper error:", err);
    return null;
  }
}
