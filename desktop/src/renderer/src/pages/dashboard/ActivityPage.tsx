import { Link, useOutletContext } from "react-router-dom";
import { SessionEmptyState } from "../../components/dashboard/SessionEmptyState";
import { useStartGhostSession } from "../../hooks/useStartGhostSession";
import { useAppStore } from "../../store/useAppStore";
import { isUserMeeting, type MeetingRecord } from "../../store/types";
import type { DashboardOutletContext } from "./DashboardLayout";

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function formatDuration(seconds: number): string {
  if (seconds <= 0) return "0:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatTime(iso: string): string {
  return new Date(iso)
    .toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
    .toLowerCase()
    .replace(/\s/g, "");
}

function dateGroupLabel(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const today = startOfDay(now);
  const yesterday = startOfDay(new Date(now.getTime() - 86_400_000));
  const meetingDay = startOfDay(d);

  if (meetingDay.getTime() === today.getTime()) return "Today";
  if (meetingDay.getTime() === yesterday.getTime()) return "Yesterday";
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

function groupMeetingsByDate(meetings: MeetingRecord[]): [string, MeetingRecord[]][] {
  const groups = new Map<string, MeetingRecord[]>();

  for (const meeting of meetings) {
    const label = dateGroupLabel(meeting.date);
    const list = groups.get(label) ?? [];
    list.push(meeting);
    groups.set(label, list);
  }

  return Array.from(groups.entries());
}

function ActivityRow({
  meeting,
  onDelete,
}: {
  meeting: MeetingRecord;
  onDelete: (event: React.MouseEvent, id: string) => void;
}) {
  return (
    <div className="group relative">
      <Link
        to={`/meetings/${meeting.id}`}
        className="flex items-center gap-4 py-3.5 pr-8 transition-colors hover:bg-zinc-50/80 -mx-3 px-3 rounded-lg"
      >
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <span className="truncate text-[14px] font-medium text-zinc-900">
            {meeting.title}
          </span>
          {meeting.status === "processing" && (
            <span className="shrink-0 text-[12px] text-zinc-400">· summarizing</span>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-[12px] tabular-nums text-zinc-600">
            {formatDuration(meeting.duration)}
          </span>
          <span className="w-[52px] text-right text-[12px] tabular-nums text-zinc-400">
            {formatTime(meeting.date)}
          </span>
        </div>
      </Link>

      <button
        type="button"
        onClick={(event) => onDelete(event, meeting.id)}
        className="absolute right-1 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-zinc-300 opacity-0 transition-all hover:bg-zinc-100 hover:text-red-500 group-hover:opacity-100"
        aria-label={`Delete ${meeting.title}`}
        title="Delete session"
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
      </button>
    </div>
  );
}

export function ActivityPage() {
  const { searchQuery, onRequestUpgrade } = useOutletContext<DashboardOutletContext>();
  const meetings = useAppStore((s) => s.meetings);
  const deleteMeeting = useAppStore((s) => s.deleteMeeting);
  const { startSession, canStart, sessionActive } = useStartGhostSession();

  const handleStart = async () => {
    if (sessionActive) {
      void startSession();
      return;
    }
    if (!canStart) {
      onRequestUpgrade();
      return;
    }
    const started = await startSession();
    if (!started) onRequestUpgrade();
  };

  const userSessions = meetings
    .filter(isUserMeeting)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const filtered = userSessions.filter((m) => {
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

  const grouped = groupMeetingsByDate(filtered);

  const handleDelete = (event: React.MouseEvent, id: string) => {
    event.preventDefault();
    event.stopPropagation();
    deleteMeeting(id);
  };

  if (userSessions.length === 0) {
    return (
      <div>
        {searchQuery.trim() ? (
          <p className="py-12 text-center text-[14px] text-zinc-500">
            No results for &ldquo;{searchQuery}&rdquo;
          </p>
        ) : sessionActive ? (
          <p className="py-12 text-center text-[14px] text-zinc-500">
            Session active — live coaching runs in the overlay.
          </p>
        ) : (
          <SessionEmptyState onStart={() => void handleStart()} />
        )}
      </div>
    );
  }

  return (
    <div>
      {searchQuery.trim() && filtered.length === 0 ? (
        <p className="py-12 text-center text-[14px] text-zinc-500">
          No results for &ldquo;{searchQuery}&rdquo;
        </p>
      ) : (
        <div className="space-y-8">
          {grouped.map(([label, items]) => (
            <section key={label}>
              <h2 className="mb-1 text-[13px] font-semibold text-zinc-500">
                {label}
              </h2>
              <div>
                {items.map((m) => (
                  <ActivityRow key={m.id} meeting={m} onDelete={handleDelete} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
