import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { sectionsToPlainText } from "../../services/ai";
import { useAppStore } from "../../store/useAppStore";
import { DEMO_MEETINGS, type SummarySection } from "../../store/types";

type Tab = "summary" | "transcript";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

function formatTimestamp(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
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
        </section>
      ))}
    </div>
  );
}

function TranscriptView({
  transcript,
  isWelcomeDemo,
}: {
  transcript: { id: string; speaker: string; text: string; timestamp: number }[];
  isWelcomeDemo: boolean;
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

  if (isWelcomeDemo) {
    return (
      <div className="space-y-5">
        {transcript.map((line) => (
          <p key={line.id} className="text-[15px] leading-relaxed text-zinc-700">
            {line.text}
          </p>
        ))}
      </div>
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
  const savedMeeting = useAppStore((s) => s.meetings.find((m) => m.id === id));
  const meeting = savedMeeting ?? DEMO_MEETINGS.find((m) => m.id === id);
  const [tab, setTab] = useState<Tab>("summary");

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

  const isWelcomeDemo = meeting.id === "demo-welcome";
  const processing = meeting.status === "processing";
  const sections: SummarySection[] =
    meeting.summarySections ??
    (meeting.summary
      ? [{ heading: "Summary", items: [meeting.summary] }]
      : []);

  return (
    <div>
      <Link
        to="/"
        className="mb-6 inline-flex text-[13px] font-medium text-zinc-400 hover:text-zinc-600"
      >
        ← Activity
      </Link>

      <p className="text-[13px] text-zinc-400">{formatDate(meeting.date)}</p>
      <h1 className="mt-1 text-[26px] font-semibold tracking-tight text-zinc-900">
        {meeting.title}
      </h1>
      {meeting.company && meeting.company !== "Meeting" && (
        <p className="mt-1 text-[14px] text-zinc-500">{meeting.company}</p>
      )}

      <div className="mt-8 flex items-center gap-1 rounded-full bg-zinc-100 p-1 w-fit">
        {(["summary", "transcript"] as const).map((t) => (
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
          </button>
        ))}
      </div>

      <div className="mt-8">
        {tab === "summary" ? (
          <SummaryView sections={sections} processing={processing} />
        ) : (
          <TranscriptView
            transcript={meeting.transcript}
            isWelcomeDemo={isWelcomeDemo}
          />
        )}
      </div>
    </div>
  );
}
