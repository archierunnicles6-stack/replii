import { useState } from "react";
import { Link, useNavigate, useOutletContext, useParams } from "react-router-dom";
import { SessionRecapHero } from "../../components/dashboard/SessionRecapHero";
import { WarmUpgradePrompt } from "../../components/dashboard/WarmUpgradePrompt";
import type { DashboardOutletContext } from "./DashboardLayout";
import { sectionsToPlainText } from "../../services/ai";
import { AI_DISCLAIMER_SHORT } from "../../lib/ai-disclaimer";
import { SUGGESTION_TAG_LABELS } from "../../lib/suggestion-tags";
import { useAppStore } from "../../store/useAppStore";
import {
  isUserMeeting,
  type SummarySection,
  type SuggestionRecord,
} from "../../store/types";

type Tab = "summary" | "coaching" | "transcript";

function formatTimestamp(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function CoachingView({
  suggestions,
  meetingId,
  canEdit,
}: {
  suggestions: SuggestionRecord[];
  meetingId: string;
  canEdit: boolean;
}) {
  const updateSuggestion = useAppStore((s) => s.updateSuggestion);

  if (suggestions.length === 0) {
    return (
      <p className="py-8 text-[15px] text-zinc-500">
        No coaching suggestions were captured for this call.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <p className="rounded-xl border border-amber-100 bg-amber-50/80 px-4 py-3 text-[12px] leading-relaxed text-amber-900/80">
        {AI_DISCLAIMER_SHORT}
      </p>
      {suggestions.map((sug) => (
        <div
          key={sug.id}
          className="rounded-2xl border border-zinc-200 bg-white p-4"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-[15px] leading-relaxed text-zinc-800">
                &ldquo;{sug.text}&rdquo;
              </p>
              {sug.triggerText && (
                <p className="mt-2 text-[13px] text-zinc-500">
                  Triggered by: &ldquo;{sug.triggerText}&rdquo;
                </p>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {sug.timestamp > 0 && (
                <span className="text-[12px] tabular-nums text-zinc-400">
                  {formatTimestamp(sug.timestamp)}
                </span>
              )}
              {sug.health != null && (
                <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-600">
                  {sug.health}
                </span>
              )}
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {sug.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700"
              >
                {SUGGESTION_TAG_LABELS[tag]}
              </span>
            ))}
            <span className="text-[11px] text-zinc-400">· {sug.source}</span>
            {canEdit && (
              <button
                type="button"
                onClick={() =>
                  updateSuggestion(meetingId, sug.id, { repUsed: !sug.repUsed })
                }
                className={`ml-auto rounded-full px-2.5 py-0.5 text-[11px] font-medium transition-colors ${
                  sug.repUsed
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-zinc-100 text-zinc-500 hover:text-zinc-700"
                }`}
              >
                {sug.repUsed ? "Rep used ✓" : "Mark used"}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

function renderItemText(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-zinc-900">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

function SummaryView({
  sections,
  processing,
}: {
  sections: SummarySection[];
  processing: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const copySummary = () => {
    navigator.clipboard.writeText(sectionsToPlainText(sections));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  if (processing) {
    return (
      <div className="flex items-center gap-3 py-12">
        <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-zinc-400" />
        <p className="text-[15px] text-zinc-500">Generating your summary…</p>
      </div>
    );
  }

  if (sections.length === 0) {
    return (
      <p className="py-8 text-[15px] text-zinc-500">No summary available.</p>
    );
  }

  return (
    <div className="space-y-10">
      <p className="text-[12px] leading-relaxed text-zinc-400">{AI_DISCLAIMER_SHORT}</p>
      {sections.map((section) => (
        <section key={section.heading}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[15px] font-semibold text-zinc-900">
              {section.heading}
            </h2>
            {section === sections[0] && (
              <button
                type="button"
                onClick={copySummary}
                className="flex items-center gap-1.5 text-[13px] font-medium text-zinc-400 transition-colors hover:text-zinc-600"
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
                {copied ? "Copied" : "Copy full summary"}
              </button>
            )}
          </div>
          {section.format === "paragraphs" ? (
            <div className="space-y-4">
              {section.items.map((item, i) => (
                <p
                  key={i}
                  className="text-[15px] leading-relaxed text-zinc-700"
                >
                  {renderItemText(item)}
                </p>
              ))}
            </div>
          ) : (
            <ul className="space-y-3">
              {section.items.map((item, i) => (
                <li
                  key={i}
                  className="flex gap-3 text-[15px] leading-relaxed text-zinc-700"
                >
                  <span className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-zinc-400" />
                  <span>{renderItemText(item)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </div>
  );
}

function TranscriptView({
  transcript,
}: {
  transcript: { id: string; speaker: string; text: string; timestamp: number }[];
}) {
  const [copied, setCopied] = useState(false);

  const copyTranscript = () => {
    const text = transcript
      .map((l) =>
        l.timestamp > 0
          ? `[${formatTimestamp(l.timestamp)}] ${l.speaker}: ${l.text}`
          : `${l.speaker}: ${l.text}`,
      )
      .join("\n\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  if (transcript.length === 0) {
    return (
      <p className="py-8 text-[15px] text-zinc-500">No transcript recorded.</p>
    );
  }

  return (
    <div>
      <div className="mb-6 flex justify-end">
        <button
          type="button"
          onClick={copyTranscript}
          className="flex items-center gap-1.5 text-[13px] font-medium text-zinc-400 transition-colors hover:text-zinc-600"
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
          {copied ? "Copied" : "Copy transcript"}
        </button>
      </div>
      <div className="space-y-6">
        {transcript.map((line) => (
          <div key={line.id} className="group">
            <div className="mb-1 flex items-baseline gap-2">
              <span className="text-[13px] font-medium text-zinc-900">
                {line.speaker}
              </span>
              {line.timestamp > 0 && (
                <span className="text-[12px] text-zinc-400">
                  {formatTimestamp(line.timestamp)}
                </span>
              )}
            </div>
            <p className="text-[15px] leading-relaxed text-zinc-700">
              {line.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function MeetingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { onRequestUpgrade } = useOutletContext<DashboardOutletContext>();
  const savedMeeting = useAppStore((s) => s.meetings.find((m) => m.id === id));
  const deleteMeeting = useAppStore((s) => s.deleteMeeting);
  const plan = useAppStore((s) => s.plan);
  const freeOverlaySecondsUsed = useAppStore((s) => s.freeOverlaySecondsUsed);
  const meeting = savedMeeting;
  const [tab, setTab] = useState<Tab>("summary");
  const canDelete = meeting ? isUserMeeting(meeting) : false;
  const canEdit = meeting ? isUserMeeting(meeting) : false;

  if (!meeting) {
    return (
      <div className="py-20 text-center">
        <p className="text-zinc-500">Meeting not found.</p>
        <Link to="/" className="mt-4 inline-block text-[13px] text-zinc-600 hover:text-zinc-900">
          ← Back to Activity
        </Link>
      </div>
    );
  }

  const processing = meeting.status === "processing";
  const sections: SummarySection[] =
    meeting.summarySections ??
    (meeting.summary
      ? [{ heading: "Summary", items: [meeting.summary] }]
      : []);

  const handleDelete = () => {
    if (!canDelete || !meeting) return;
    if (!window.confirm("Delete this meeting? This cannot be undone.")) return;
    deleteMeeting(meeting.id);
    navigate("/");
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <Link
          to="/"
          className="inline-flex text-[13px] font-medium text-zinc-400 hover:text-zinc-600"
        >
          ← Activity
        </Link>
        {canDelete && (
          <button
            type="button"
            onClick={handleDelete}
            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-1.5 text-[12px] font-medium text-red-600 transition-colors hover:bg-red-50"
          >
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.75}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            Delete
          </button>
        )}
      </div>

      <p className="text-[13px] text-zinc-400">{formatDate(meeting.date)}</p>
      <h1 className="mt-1 text-[26px] font-semibold tracking-tight text-zinc-900">
        {meeting.title}
      </h1>
      {meeting.company && meeting.company !== "Meeting" && (
        <p className="mt-1 text-[14px] text-zinc-500">{meeting.company}</p>
      )}

      {canEdit ? (
        <>
          <SessionRecapHero meeting={meeting} />
          <WarmUpgradePrompt
            meeting={meeting}
            plan={plan}
            freeOverlaySecondsUsed={freeOverlaySecondsUsed}
            onUpgrade={(message) => onRequestUpgrade(message)}
          />
        </>
      ) : null}

      <div className="mt-8 flex items-center gap-1 rounded-full bg-zinc-100 p-1 w-fit">
        {(["summary", "coaching", "transcript"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-full px-4 py-1.5 text-[13px] font-medium capitalize transition-colors ${
              tab === t
                ? "bg-white text-zinc-900 shadow-sm"
                : "text-zinc-500 hover:text-zinc-700"
            }`}
          >
            {t}
            {t === "coaching" &&
              (meeting.suggestions?.length ?? meeting.suggestionUses ?? 0) > 0 && (
                <span className="ml-1.5 text-[11px] text-zinc-400">
                  ({meeting.suggestions?.length ?? meeting.suggestionUses})
                </span>
              )}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {tab === "summary" ? (
          <SummaryView sections={sections} processing={processing} />
        ) : tab === "coaching" ? (
          <CoachingView
            suggestions={meeting.suggestions ?? []}
            meetingId={meeting.id}
            canEdit={canEdit}
          />
        ) : (
          <TranscriptView transcript={meeting.transcript} />
        )}
      </div>
    </div>
  );
}
