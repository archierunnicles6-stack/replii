"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useGhostAI } from "@/hooks/useGhostAI";
import { useGhostAudio } from "@/hooks/useGhostAudio";
import { useCallTimer } from "@/hooks/useCallTimer";
import type { TranscriptLine } from "@/types/ghost";

function formatListeningText(lines: TranscriptLine[], interim: string): string {
  const last = lines[lines.length - 1];
  if (interim) return interim;
  if (last) return last.text;
  return "Listening…";
}

export default function OverlayPage() {
  const [active, setActive] = useState(false);
  const { lines, interim, clear } = useGhostAudio(active);
  const { suggestion, loading, error, fetchSuggestion, clearSuggestion } = useGhostAI();
  const { formatted: callTime } = useCallTimer(active);
  const lastProspectRef = useRef<string | null>(null);

  useEffect(() => {
    if (!active) return;

    const last = lines[lines.length - 1];
    if (!last || last.speaker !== "Prospect") return;
    if (lastProspectRef.current === last.id) return;

    lastProspectRef.current = last.id;
    void fetchSuggestion(last.text, lines);
  }, [active, lines, fetchSuggestion]);

  const listeningText = formatListeningText(lines, interim);

  const start = () => {
    clear();
    clearSuggestion();
    lastProspectRef.current = null;
    setActive(true);
  };

  const stop = () => {
    setActive(false);
    clearSuggestion();
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 text-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, rgba(99,102,241,0.25), transparent 40%), radial-gradient(circle at 80% 80%, rgba(16,185,129,0.15), transparent 35%)",
        }}
      />

      <header className="relative z-10 flex items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-500 text-xs font-bold">
            ◉
          </span>
          Ghost · Web demo
        </Link>
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-400">
          Mock audio · GPT suggestions
        </span>
      </header>

      <main className="relative z-10 mx-auto flex max-w-3xl flex-col items-center px-6 pb-24 pt-16">
        {!active ? (
          <div className="text-center">
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Live sales co-pilot
            </h1>
            <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-zinc-400">
              Start a demo call — mock prospect lines stream in and Ghost suggests what to say
              next via GPT-4o mini.
            </p>
            <button
              type="button"
              onClick={start}
              className="mt-8 rounded-full bg-white px-8 py-3 text-[15px] font-medium text-zinc-900 transition hover:bg-zinc-100"
            >
              Start Ghost
            </button>
            <p className="mt-6 text-xs text-zinc-500">
              Desktop app with real mic →{" "}
              <Link href="/download" className="text-indigo-400 hover:text-indigo-300">
                Download for Mac
              </Link>
            </p>
          </div>
        ) : (
          <div className="flex w-full flex-col items-center gap-4">
            <div
              className="w-full max-w-xl rounded-2xl px-5 py-4 backdrop-blur-xl"
              style={{
                background: "rgba(255,255,255,0.12)",
                border: "1px solid rgba(255,255,255,0.18)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
              }}
            >
              <div className="flex items-center gap-2 text-xs text-emerald-400">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                Listening · {callTime}
              </div>
              <p className="mt-2 text-[15px] leading-relaxed text-white/90">{listeningText}</p>
            </div>

            {(suggestion || loading || error) && (
              <div
                className="w-full max-w-xl rounded-2xl px-5 py-4 backdrop-blur-xl"
                style={{
                  background: "rgba(18,18,22,0.85)",
                  border: "1px solid rgba(255,255,255,0.10)",
                  boxShadow: "0 10px 40px rgba(0,0,0,0.4)",
                }}
              >
                {loading && (
                  <p className="text-sm text-zinc-400">Thinking…</p>
                )}
                {error && (
                  <p className="text-sm text-red-400">{error}</p>
                )}
                {suggestion && !loading && (
                  <>
                    <p className="text-[11px] font-medium uppercase tracking-wider text-indigo-400">
                      Say this
                    </p>
                    <p className="mt-2 text-lg font-medium leading-snug text-white">
                      {suggestion.suggestion}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-3 text-xs text-zinc-400">
                      <span>Health {suggestion.health}%</span>
                      <span>Talk ratio {suggestion.talkRatio}%</span>
                      {suggestion.missing.decisionMaker && (
                        <span className="text-amber-400">Missing decision maker</span>
                      )}
                      {suggestion.missing.budget && (
                        <span className="text-amber-400">Missing budget</span>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={stop}
                className="rounded-full border border-white/20 px-5 py-2 text-sm text-zinc-300 hover:bg-white/10"
              >
                End session
              </button>
            </div>

            {lines.length > 0 && (
              <div className="mt-8 w-full max-w-xl rounded-xl border border-white/10 bg-black/20 p-4">
                <p className="mb-3 text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Transcript
                </p>
                <ul className="space-y-2">
                  {lines.map((line) => (
                    <li key={line.id} className="text-sm">
                      <span
                        className={
                          line.speaker === "Prospect"
                            ? "text-indigo-300"
                            : "text-zinc-400"
                        }
                      >
                        {line.speaker}:
                      </span>{" "}
                      <span className="text-zinc-200">{line.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
