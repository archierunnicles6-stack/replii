"use client";

import { useCallback, useRef, useState } from "react";
import type { GhostSuggestion, TranscriptLine } from "@/types/ghost";

export function useGhostAI() {
  const [suggestion, setSuggestion] = useState<GhostSuggestion | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetchSuggestion = useCallback(
    async (prospectText: string, transcript: TranscriptLine[]) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/suggest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({ prospectText, transcript }),
        });

        if (!res.ok) {
          const detail = (await res.json().catch(() => ({}))) as { error?: string };
          throw new Error(detail.error ?? `Suggest failed (${res.status})`);
        }

        const data = (await res.json()) as GhostSuggestion;
        setSuggestion(data);
        return data;
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return null;
        const message = err instanceof Error ? err.message : "Suggest failed";
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const clearSuggestion = useCallback(() => {
    abortRef.current?.abort();
    setSuggestion(null);
    setError(null);
  }, []);

  return { suggestion, loading, error, fetchSuggestion, clearSuggestion };
}
