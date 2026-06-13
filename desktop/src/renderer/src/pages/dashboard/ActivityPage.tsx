import { Link, useOutletContext } from "react-router-dom";
import { useAppStore } from "../../store/useAppStore";
import {
  ACTIVITY_PLACEHOLDER_MEETINGS,
  isUserMeeting,
  type MeetingRecord,
} from "../../store/types";
import type { DashboardOutletContext } from "./DashboardLayout";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function summaryPreview(meeting: MeetingRecord) {
  if (meeting.status === "processing") return "Generating summary…";
  const firstSection = meeting.summarySections?.[0];
  if (firstSection?.items[0]) return firstSection.items[0];
  if (meeting.summary && meeting.summary !== "Generating summary…") {
    return meeting.summary;
  }
  if (meeting.transcript.length > 0) return "Summary pending…";
  return "No summary yet.";
}

function meetingListTitle(meeting: MeetingRecord) {
  if (meeting.title.includes("—")) return meeting.title;
  if (meeting.company && meeting.company !== "Meeting") {
    return `${meeting.title} — ${meeting.company}`;
  }
  return meeting.title;
}

export function ActivityPage() {
  const { searchQuery } = useOutletContext<DashboardOutletContext>();
  const meetings = useAppStore((s) => s.meetings);

  const userSessions = meetings
    .filter(isUserMeeting)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const displayMeetings =
    userSessions.length > 0 ? userSessions : ACTIVITY_PLACEHOLDER_MEETINGS;

  const filtered = displayMeetings.filter((m) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const transcriptText = m.transcript.map((line) => line.text).join(" ");
    const sectionText =
      m.summarySections?.flatMap((s) => s.items).join(" ") ?? "";
    return (
      m.title.toLowerCase().includes(q) ||
      m.company.toLowerCase().includes(q) ||
      m.summary.toLowerCase().includes(q) ||
      sectionText.toLowerCase().includes(q) ||
      transcriptText.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <h2 className="mb-5 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
        Meetings
      </h2>
      {searchQuery.trim() && filtered.length === 0 ? (
        <p className="py-6 text-[15px] text-zinc-500">
          No results for &ldquo;{searchQuery}&rdquo;
        </p>
      ) : (
        <div className="divide-y divide-zinc-100">
          {filtered.map((m) => (
            <Link
              key={m.id}
              to={`/meetings/${m.id}`}
              className="block py-5 transition-colors hover:bg-zinc-50/80 -mx-3 px-3 rounded-lg"
            >
              <div className="flex items-baseline justify-between gap-4">
                <h2 className="text-[15px] font-medium text-zinc-900">
                  {meetingListTitle(m)}
                </h2>
                <span className="shrink-0 text-[13px] text-zinc-400">
                  {formatDate(m.date)}
                </span>
              </div>
              <p className="mt-1.5 line-clamp-2 text-[14px] leading-relaxed text-zinc-500">
                {summaryPreview(m)}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
