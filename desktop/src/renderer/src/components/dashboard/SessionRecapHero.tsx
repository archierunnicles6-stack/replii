import { useState } from "react";
import { sectionsToPlainText } from "../../services/ai";
import {
  getDealScoreLabel,
  getMissedQualifierInsight,
} from "../../lib/session-value";
import type { MeetingRecord } from "../../store/types";

export function SessionRecapHero({ meeting }: { meeting: MeetingRecord }) {
  const [copied, setCopied] = useState(false);
  const processing = meeting.status === "processing";
  const suggestionCount =
    meeting.suggestions?.length ?? meeting.suggestionUses ?? 0;
  const missedInsight = getMissedQualifierInsight(meeting);
  const score = meeting.dealScore ?? 0;
  const scoreReady = !processing && score > 0;

  const shareText = () => {
    const parts: string[] = [];
    if (scoreReady) {
      parts.push(`Deal score: ${score}/100 (${getDealScoreLabel(score)})`);
    }
    if (suggestionCount > 0) {
      parts.push(`Ghost suggestions used: ${suggestionCount}`);
    }
    const summary =
      meeting.summarySections && meeting.summarySections.length > 0
        ? sectionsToPlainText(meeting.summarySections)
        : meeting.summary;
    if (summary && summary !== "Generating summary…") {
      parts.push("", summary);
    }
    return parts.join("\n");
  };

  const copyRecap = () => {
    navigator.clipboard.writeText(shareText());
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  if (meeting.transcript.length === 0 && suggestionCount === 0) {
    return null;
  }

  return (
    <div className="mb-8 overflow-hidden rounded-2xl border border-zinc-200 bg-gradient-to-br from-zinc-50 to-white">
      <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-start">
        <div className="flex shrink-0 items-center gap-4">
          <div
            className={`flex h-[72px] w-[72px] flex-col items-center justify-center rounded-2xl ${
              scoreReady
                ? score >= 60
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-amber-50 text-amber-700"
                : "bg-zinc-100 text-zinc-500"
            }`}
          >
            {processing ? (
              <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-zinc-400" />
            ) : scoreReady ? (
              <>
                <span className="text-[22px] font-bold tabular-nums leading-none">
                  {score}
                </span>
                <span className="mt-0.5 text-[10px] font-medium uppercase tracking-wide opacity-70">
                  Score
                </span>
              </>
            ) : (
              <span className="text-[13px] font-medium">—</span>
            )}
          </div>
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-wider text-zinc-400">
              Session recap
            </p>
            <p className="mt-0.5 text-[15px] font-semibold text-zinc-900">
              {processing
                ? "Analyzing your call…"
                : scoreReady
                  ? getDealScoreLabel(score)
                  : "Call complete"}
            </p>
            {suggestionCount > 0 ? (
              <p className="mt-1 text-[13px] text-zinc-500">
                {suggestionCount} Ghost suggestion
                {suggestionCount === 1 ? "" : "s"} on this call
              </p>
            ) : null}
          </div>
        </div>

        <div className="min-w-0 flex-1 space-y-3">
          {missedInsight && !processing ? (
            <div className="rounded-xl border border-amber-100 bg-amber-50/80 px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-800/70">
                Coaching insight
              </p>
              <p className="mt-1 text-[14px] leading-relaxed text-amber-950/90">
                &ldquo;{missedInsight}&rdquo;
              </p>
            </div>
          ) : processing ? (
            <p className="text-[14px] text-zinc-500">
              Ghost is building your deal score and coaching insights…
            </p>
          ) : null}

          {!processing && (meeting.summary || meeting.summarySections?.length) ? (
            <button
              type="button"
              onClick={copyRecap}
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-[13px] font-medium text-zinc-600 transition-colors hover:bg-zinc-50"
            >
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              {copied ? "Copied recap" : "Copy shareable recap"}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
