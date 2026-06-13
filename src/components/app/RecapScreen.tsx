"use client";

import Link from "next/link";
import type { RecapResponse, TranscriptLine } from "@/types/ghost";

export function RecapScreen({
  recap,
  loading,
  transcript,
  onRestart,
}: {
  recap: RecapResponse | null;
  loading: boolean;
  transcript: TranscriptLine[];
  onRestart: () => void;
}) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-6 py-16 text-white">
      <div className="absolute left-6 top-6">
        <Link href="/" className="text-sm text-zinc-500 hover:text-white">
          ← Ghost home
        </Link>
      </div>

      <div className="w-full max-w-lg">
        <p className="text-[13px] font-medium text-ghost-400">Session complete</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Call recap</h1>

        {loading ? (
          <p className="mt-8 text-zinc-400">Generating recap…</p>
        ) : recap ? (
          <div className="mt-8 space-y-6">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-ghost-500/20 text-2xl font-semibold text-ghost-300">
                {recap.score}
              </div>
              <div>
                <p className="text-sm text-zinc-400">Call score</p>
                <p className="text-lg font-medium">Out of 100</p>
              </div>
            </div>

            <div>
              <p className="mb-3 text-[12px] font-semibold uppercase tracking-wider text-zinc-500">
                Summary
              </p>
              <ul className="space-y-2">
                {recap.bullets.map((b) => (
                  <li key={b} className="flex gap-2 text-[14px] leading-relaxed text-zinc-300">
                    <span className="text-ghost-400">•</span>
                    {b}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="mb-3 text-[12px] font-semibold uppercase tracking-wider text-zinc-500">
                Follow-up email
              </p>
              <p className="rounded-xl border border-white/10 bg-white/5 p-4 text-[14px] leading-relaxed text-zinc-300">
                {recap.email}
              </p>
            </div>
          </div>
        ) : (
          <p className="mt-8 text-zinc-400">No recap available.</p>
        )}

        {transcript.length > 0 && (
          <details className="mt-8 rounded-xl border border-white/10 bg-black/20 p-4">
            <summary className="cursor-pointer text-[13px] font-medium text-zinc-400">
              Full transcript ({transcript.length} lines)
            </summary>
            <ul className="mt-4 max-h-48 space-y-2 overflow-y-auto">
              {transcript.map((line) => (
                <li key={line.id} className="text-[13px]">
                  <span className={line.speaker === "Prospect" ? "text-ghost-300" : "text-zinc-500"}>
                    {line.speaker}:
                  </span>{" "}
                  <span className="text-zinc-300">{line.text}</span>
                </li>
              ))}
            </ul>
          </details>
        )}

        <button
          type="button"
          onClick={onRestart}
          className="mt-10 w-full rounded-full bg-white py-3 text-[15px] font-medium text-zinc-900 hover:bg-zinc-100"
        >
          Start another session
        </button>
      </div>
    </div>
  );
}
