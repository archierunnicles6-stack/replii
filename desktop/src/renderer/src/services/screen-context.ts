import { getOpenAIKey } from "./whisper";
import { OPENAI_LIMITS, OPENAI_MODELS } from "../lib/openai-config";

const REFRESH_MS = OPENAI_LIMITS.screenContextCacheMs;
const OCR_MAX_CHARS = OPENAI_LIMITS.screenOcrMaxChars;

let cachedText = "";
let cachedAt = 0;
let refreshPromise: Promise<string> | null = null;

async function ocrScreenshot(base64Jpeg: string): Promise<string> {
  const apiKey = await getOpenAIKey();
  if (!apiKey) return "";

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: OPENAI_MODELS.vision,
        max_tokens: OPENAI_LIMITS.screenOcrMaxTokens,
        temperature: 0,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Extract all readable text from this screenshot (apps, browser tabs, slides, code, documents). Return only the text, no commentary. If nothing readable, return an empty string.",
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64Jpeg}`,
                  detail: "low",
                },
              },
            ],
          },
        ],
      }),
    });

    if (!res.ok) {
      console.warn("[ghost] Screen OCR failed:", res.status);
      return cachedText;
    }

    const data = await res.json();
    const text = (data.choices?.[0]?.message?.content as string | undefined)?.trim() ?? "";
    return text.slice(0, OCR_MAX_CHARS);
  } catch (err) {
    console.warn("[ghost] Screen OCR error:", err);
    return cachedText;
  }
}

async function captureAndOcr(): Promise<string> {
  const base64 = await window.ghost?.captureScreen?.();
  if (!base64) return cachedText;
  return ocrScreenshot(base64);
}

/** Returns cached screen text, refreshing when stale. */
export async function getScreenContext(force = false): Promise<string> {
  const now = Date.now();
  if (!force && cachedText && now - cachedAt < REFRESH_MS) {
    return cachedText;
  }

  if (refreshPromise) return refreshPromise;

  refreshPromise = captureAndOcr()
    .then((text) => {
      cachedText = text;
      cachedAt = Date.now();
      return text;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

export function clearScreenContext(): void {
  cachedText = "";
  cachedAt = 0;
  refreshPromise = null;
}

export function formatScreenContextBlock(screenContent: string): string {
  const trimmed = screenContent.trim();
  if (!trimmed) return "SCREEN CONTENT:\n(none captured)";
  return `SCREEN CONTENT:\n${trimmed}`;
}
